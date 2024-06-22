const graphPath = process.argv[2];
if (!graphPath) {
	console.error('Please provide a graph path as the first argument');
	process.exit(1);
}

const prefix = process.argv[3] || '';

import fs from 'fs';
import { TrieNode } from '../src/lib/models/trie';
import { compactChars } from '../src/lib/string-util';

const root = TrieNode.decodeFromString(fs.readFileSync(graphPath, 'utf8'));

const node = root.findRaw(prefix);
if (!node) {
	console.error('Prefix not found');
	process.exit(1);
}

const handled = new Set<number>();

function printNode(node: TrieNode) {
	if (handled.has(node.id)) return;
	handled.add(node.id);

	const label = node.entity ?? '';
	const shape = node.entity ? 'box' : 'circle';
	console.log(`${node.id} [label="${label}" shape="${shape}"];`);

	const dd = new Map<number, string[]>();
	function getDD(id: number): string[] {
		if (!dd.has(id)) dd.set(id, []);
		return dd.get(id)!;
	}

	for (const [key, child] of node.children) {
		getDD(child.id).push(key);
		printNode(child);
	}

	for (const key of dd.keys()) {
		const label = compactChars(dd.get(key)!);
		console.log(`${node.id} -> ${key} [label="${label}"];`);
	}
}

console.log('digraph G {');
printNode(node);
console.log('}');
