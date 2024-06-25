import dxccTreeFile from '../assets/dxcc-tree.txt?raw';
import dxccEntitiesFile from '../assets/dxcc-entities.json';
import { TrieNode } from './models/trie';
import type { DxccEntity } from './models/dxcc-entity';

export const dxccTree = TrieNode.decodeFromString(dxccTreeFile);

interface DxccResult {
	entityId: number;
	matchLength: number;
	isExact: boolean;
}

export function findDxcc(prefix: string, startingNode: TrieNode = dxccTree): DxccResult | null {
	prefix = prefix.toUpperCase();
	let node = startingNode;
	let entityId: number | null = null;
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
	}

	if (!prefix && node?.children.has('')) {
		node = node.children.get('')!;
		return {
			entityId: node.entity!,
			matchLength: tempPrefixLength,
			isExact: true
		};
	}

	if (!entityId) return null;
	return { entityId, matchLength, isExact: false };
}

export const dxccEntities: Map<number, DxccEntity> = new Map(
	[...dxccEntitiesFile].map((e) => [e.id, e])
);
