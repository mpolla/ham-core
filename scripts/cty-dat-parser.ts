import path from 'path';
import { fileURLToPath } from 'url';

const filePath = process.argv[2];
if (!filePath) {
	console.error('Please provide a file path as the first argument');
	process.exit(1);
}

const OUT_DIR = '../src/assets/';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, OUT_DIR);
console.log('Outputting to', outDir);

import fs from 'fs';
import { DxccEntity } from '../src/lib/models/dxcc-entity';

// Parse the cty.dat file
const file = fs.readFileSync(filePath, 'utf8');

const entities: DxccEntity[] = [];
const prefixes: { call: string; entity: number }[] = [];

console.log('Parsing', filePath);

for (const entity of file.split(';')) {
	if (!entity.trim()) continue;
	const [name, cqz, ituz, cont, lat, long, timez, primaryPrefixRaw, otherPrefixesRaw] = entity
		.split(':')
		.map((s) => s.trim());

	const hasStar = primaryPrefixRaw.startsWith('*');
	const primaryPrefix = primaryPrefixRaw.replace('*', '');
	const otherPrefixes = otherPrefixesRaw.split(',').map((s) => s.trim());
	const entityId = entities.length + 1;

	entities.push({
		id: entityId,
		primaryPrefix,
		name,
		cqz: parseInt(cqz),
		ituz: parseInt(ituz),
		cont,
		lat: parseFloat(lat),
		long: parseFloat(long),
		timezone: parseFloat(timez)
	});

	for (const prefix of otherPrefixes) {
		const find = prefixes.find((p) => p.call === prefix);
		if (find) {
			// console.error('Duplicate prefix', prefix, hasStar ? 'Overwriting' : 'Skipping');
			if (hasStar) find.entity = entityId;
		} else {
			prefixes.push({ call: prefix, entity: entityId });
		}
	}
}
console.log('Parsed', prefixes.length, 'prefixes');

// Build the initial trie
import { TrieNode } from '../src/lib/models/trie';

const root = new TrieNode();
for (const { call: callRaw, entity } of prefixes) {
	const [, call] = callRaw.match(/^=?((?:[A-Z\d/])+)(.*)/)!;
	const isExact = callRaw.startsWith('=');
	root.insert(call, entity, isExact);
}

console.log('Built trie with', root.getAllNodes().size, 'nodes');

// Collapse nodes that do not cause changes
root.collapseNodes();

console.log('Collapsed trie with', root.getAllNodes().size, 'nodes');

// Merge as many nodes as possible
const nodes = new Map([...root.getAllNodes()].map((node) => [node.id, node]));

const parents: Map<number, TrieNode[]> = new Map();
for (const node of nodes.values()) {
	for (const child of node.children.values()) {
		const list = parents.get(child.id) ?? [];
		list.push(node);
		parents.set(child.id, list);
	}
}

let anyChanged = true;
while (anyChanged) {
	anyChanged = false;

	const hashed = new Map<string, TrieNode>();
	for (const node of nodes.values()) {
		const hash = node.hash();
		const existing = hashed.get(hash);
		if (!existing) {
			hashed.set(hash, node);
			continue;
		}

		if (!existing.canMerge(node)) {
			throw new Error('Merge conflict false positive');
		}

		for (const parent of parents.get(node.id) ?? []) {
			for (const [k, v] of parent.children) {
				if (v === node) {
					parent.children.set(k, existing);
				}
			}
		}
		parents.delete(node.id);
		nodes.delete(node.id);
		anyChanged = true;
	}
}
console.log('Finished merge with', nodes.size, 'nodes');

// Validate the trie
for (const { call: callRaw, entity } of prefixes) {
	const [, call] = callRaw.match(/^=?((?:[A-Z\d/])+)(.*)/)!;
	let node: TrieNode | null = root;
	let currentEntity: number | null = null;
	for (const c of call) {
		node = node.children.get(c) ?? null;
		if (!node) break;
		currentEntity = node.entity ?? currentEntity;
	}
	if (currentEntity !== entity && node?.exactEntity !== entity) {
		console.error('Failed to find', call, entity);
		console.log('Found', node?.entity, node?.exactEntity, currentEntity);
	}
}

// Minimize node IDs
let i = 0;
for (const node of root.getAllNodes()) {
	node.id = i++;
}

// Output the trie
const out = root.encodeToString();
fs.writeFileSync(path.join(outDir, 'dxcc-tree.txt'), out);

// Output the entities
fs.writeFileSync(path.join(outDir, 'dxcc-entities.json'), JSON.stringify(entities, null, '\t'));
