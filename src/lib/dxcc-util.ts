import dxccTreeFile from '../assets/dxcc-tree.txt?raw';
import dxccEntitiesFile from '../assets/dxcc-entities.json';
import { TrieNode } from './models/trie';
import type { DxccEntity } from './models/dxcc-entity';

export const dxccTree = TrieNode.decodeFromString(dxccTreeFile);

export interface DxccResult {
	entity: DxccEntity;
	matchLength: number;
	isExact: boolean;
}

export function findDxcc(prefix: string, startingNode: TrieNode = dxccTree): DxccResult | null {
	const rawResult = startingNode.findDxcc(prefix.toUpperCase());
	if (!rawResult || rawResult.entityId === null) return null;

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

export const dxccEntities: Map<number, DxccEntity> = new Map(
	[...dxccEntitiesFile].map((e) => [e.id, e])
);
