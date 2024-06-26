import dxccTreeFile from '../assets/dxcc-tree.txt?raw';
import dxccEntitiesFile from '../assets/dxcc-entities.json';
import { TrieNode } from './models/trie';
import type { DxccEntity } from './models/dxcc-entity';
import { DxccOverrides } from './models/dxcc-overrides';

export const dxccTree = TrieNode.decodeFromString(dxccTreeFile);

export interface DxccResult {
	entity: DxccEntity;
	matchLength: number;
	isExact: boolean;
}

export function findDxcc(prefix: string, startingNode: TrieNode = dxccTree): DxccResult | null {
	const rawResult = findRawDxcc(prefix, startingNode);
	if (!rawResult) return null;

	const entity = dxccEntities.get(rawResult.entityId);
	if (!entity) return null;

	const entityWithOverrides: DxccEntity = {
		...entity,
		cqz: rawResult.dxccOverrides.cqz ?? entity.cqz,
		ituz: rawResult.dxccOverrides.ituz ?? entity.ituz,
		cont: rawResult.dxccOverrides.cont ?? entity.cont,
		lat: rawResult.dxccOverrides.lat ?? entity.lat,
		long: rawResult.dxccOverrides.long ?? entity.long,
		timez: rawResult.dxccOverrides.timez ?? entity.timez
	};

	return {
		entity: entityWithOverrides,
		matchLength: rawResult.matchLength,
		isExact: rawResult.isExact
	};
}

export interface RawDxccResult {
	entityId: number;
	dxccOverrides: DxccOverrides;
	matchLength: number;
	isExact: boolean;
}

export function findRawDxcc(
	prefix: string,
	startingNode: TrieNode = dxccTree
): RawDxccResult | null {
	prefix = prefix.toUpperCase();
	let node = startingNode;
	let entityId: number | null = null;
	let dxccOverrides = new DxccOverrides();
	let tempPrefixLength = 0;
	let matchLength = 0;

	while (prefix) {
		const next = node.children.get(prefix[0]);
		if (!next) {
			break;
		}

		node = next;
		prefix = prefix.slice(1);
		tempPrefixLength++;
		if (node.entity) {
			entityId = node.entity;
			matchLength = tempPrefixLength;
		}
		if (node.overrides.toString()) {
			dxccOverrides = dxccOverrides.merge(node.overrides);
			// TODO Debate whether to set matchLength here
			matchLength = tempPrefixLength;
		}
	}

	if (!prefix && node?.children.has('')) {
		const exact = node.children.get('')!;
		return {
			entityId: exact.entity ?? entityId!,
			dxccOverrides: dxccOverrides.merge(exact.overrides),
			// matchLength: exact.entity ? tempPrefixLength : matchLength,
			matchLength: tempPrefixLength,
			isExact: true
		};
	}

	if (!entityId) return null;
	return { entityId, dxccOverrides, matchLength, isExact: false };
}

export const dxccEntities: Map<number, DxccEntity> = new Map(
	[...dxccEntitiesFile].map((e) => [e.id, e])
);
