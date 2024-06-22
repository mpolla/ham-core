const filePath = process.argv[2];
if (!filePath) {
	console.error('Please provide a file path as the first argument');
	process.exit(1);
}

const outPath = process.argv[3];
if (!outPath) {
	console.error('Please provide an output path as the second argument');
	process.exit(1);
}

import fs from 'fs';
import { parseStringPromise } from 'xml2js';
import { capitalize } from '../src/lib/string-util';
import { IClublogFile } from '../src/lib/models/clublog';

// Parse the Clublog XML file
const file = fs.readFileSync(filePath, 'utf8');
const doc: IClublogFile = await parseStringPromise(file);

const now = new Date();

const entities: Map<number, string> = new Map();

for (const entity of doc.clublog.entities[0].entity) {
	const id = parseInt(entity.adif[0]);
	const name = capitalize(entity.name[0]);
	const end = entity.end?.[0];
	if (end && new Date(end) < now) continue;
	entities.set(id, name);
}

const prefixes: { call: string; entity: number }[] = [];

for (const prefix of doc.clublog.prefixes[0].prefix) {
	const end = prefix.end?.[0];
	if (end && new Date(end) < now) continue;
	prefixes.push({
		call: prefix.call[0],
		entity: parseInt(prefix.adif[0])
	});
}

// Build the initial trie
import { TrieNode } from '../src/lib/models/trie';

const root = new TrieNode();
for (const { call, entity } of prefixes) {
	root.insert(call, entity);
}

// Merge as many nodes as possible
const nodes = new Map([...root.getAllNodes()].map((node) => [node.id, node]));

// Bad merge algorithm, but it works
let anyChanged = true;
while (anyChanged) {
	anyChanged = false;
	for (const a of nodes.values()) {
		for (const b of nodes.values()) {
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
				break;
			}
		}
		if (anyChanged) break;
	}
}

// Output the trie
const out = [...root.getAllNodes()].map((n) => n.encodeToString()).join('\n');
fs.writeFileSync(outPath, out);
