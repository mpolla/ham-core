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
const prefixes: Map<string, number> = new Map();

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
		const find = prefixes.get(prefix);
		if (find) {
			// console.error('Duplicate prefix', prefix, hasStar ? 'Overwriting' : 'Skipping');
			if (hasStar) prefixes.set(prefix, entityId);
		} else {
			prefixes.set(prefix, entityId);
		}
	}
}
console.log('Parsed', prefixes.size, 'prefixes');

import { buildTrie, collapseNodes, mergeNodes, minimizeIds, validateTrie } from './trie-helper';

// Build the initial trie
const root = buildTrie([...prefixes.entries()]);

// Collapse nodes that do not cause changes
collapseNodes(root);

// Merge as many nodes as possible
mergeNodes(root);

// Validate the trie
validateTrie(root, [...prefixes.entries()]);

// Minimize node IDs
minimizeIds(root);

// Output the trie
const out = root.encodeToString();
fs.writeFileSync(path.join(outDir, 'dxcc-tree.txt'), out);

// Output the entities
fs.writeFileSync(path.join(outDir, 'dxcc-entities.json'), JSON.stringify(entities, null, '\t'));
