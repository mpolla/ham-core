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
import { parseStringPromise } from 'xml2js';
import { capitalize } from '../src/lib/string-util';
import { IClublogFile } from '../src/lib/models/clublog';

// Parse the Clublog XML file
const file = fs.readFileSync(filePath, 'utf8');
const doc: IClublogFile = await parseStringPromise(file);

const now = new Date();

const prefixes: { call: string; entity: number }[] = [];

for (const prefix of doc.clublog.prefixes[0].prefix) {
	const end = prefix.end?.[0];
	if (end && new Date(end) < now) continue;
	prefixes.push({
		call: prefix.call[0],
		entity: parseInt(prefix.adif[0])
	});
}
console.log('Parsed', prefixes.length, 'prefixes');

// Build the initial trie
import { TrieNode } from '../src/lib/models/trie';

const root = new TrieNode();
for (const { call, entity } of prefixes) {
	root.insert(call, entity);
}

// Merge as many nodes as possible
const nodes = new Map([...root.getAllNodes()].map((node) => [node.id, node]));
console.log('Starting merge with', nodes.size, 'nodes');

// Bad merge algorithm, but it works
let anyChanged = true;
while (anyChanged) {
	anyChanged = false;
	for (const a of nodes.values()) {
		if (!nodes.has(a.id)) continue;
		for (const b of nodes.values()) {
			if (a === b) continue;
			if (!nodes.has(b.id)) continue;
			if (a.canMerge(b)) {
				for (const node of nodes.values()) {
					for (const [k, v] of node.children) {
						if (v === b) {
							node.children.set(k, a);
						}
					}
				}
				nodes.delete(b.id);
				anyChanged = true;
			}
		}
	}
}
console.log('Finished merge with', nodes.size, 'nodes');

// Validate the trie
for (const { call, entity } of prefixes) {
	if (root.findRaw(call)?.entity !== entity) {
		console.error('Failed to find', call, entity);
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

// Format entities
import { DxccEntity } from '../src/lib/models/dxcc-entity';

const entities: DxccEntity[] = [];

for (const entity of doc.clublog.entities[0].entity) {
	const id = parseInt(entity.adif[0]);
	const name = capitalize(entity.name[0]);
	const cqz = entity.cqz?.[0];
	const cont = entity.cont?.[0];
	const end = entity.end?.[0];
	if (end && new Date(end) < now) continue;
	entities.push({
		id,
		name,
		cqz: cqz ? parseInt(cqz) : undefined,
		cont: cont ? cont : undefined
	});
}

// Output the entities
fs.writeFileSync(path.join(outDir, 'dxcc-entities.json'), JSON.stringify(entities, null, '\t'));
