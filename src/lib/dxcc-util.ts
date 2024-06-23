import dxccTreeFile from '../assets/dxcc-tree.txt?raw';
import dxccEntitiesFile from '../assets/dxcc-entities.json';
import { TrieNode } from './models/trie';

export const dxccTree = TrieNode.decodeFromString(dxccTreeFile);

interface DxccResult {
	entity: number;
	prefixLength: number;
	withSuffix: boolean;
}

export function findDxcc(prefix: string, startingNode: TrieNode = dxccTree): DxccResult | null {
	prefix = prefix.toUpperCase();
	let node = startingNode;
	let entity: number | null = null;
	let prefixLength = 0;

	while (prefix) {
		const next = node.children.get(prefix[0]);

		if (prefix[0] === '/' || !next) {
			const slashPos = prefix.lastIndexOf('/');
			if (node.children.has('/') && slashPos > 0) {
				const suffix = prefix.slice(slashPos + 1);
				const res = findDxcc(suffix, node.children.get('/'));
				if (res && res.prefixLength == suffix.length)
					return { entity: res.entity, prefixLength, withSuffix: true };
			}
			break;
		}

		node = next;
		if (node.entity) entity = node.entity;
		prefix = prefix.slice(1);
		prefixLength++;
	}

	if (!entity) return null;
	return { entity, withSuffix: false, prefixLength };
}

export const dxccEntities = new Map([...dxccEntitiesFile].map((e) => [e.entity, e]));
