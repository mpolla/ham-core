import path from 'path';
import { fileURLToPath } from 'url';

const filePath = process.argv[2];
if (!filePath) {
	console.error('Please provide a file path as the first argument');
	process.exit(1);
}

const OUT_DIR = '../src/data/';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, OUT_DIR);
console.log('Outputting to', outDir);

const type = filePath.split('.').pop();
if (type !== 'dat' && type !== 'csv') {
	console.error('Invalid file type', type);
	process.exit(1);
}

import fs from 'fs';
import { DxccEntity } from '../src/lib/dxcc-util';
import { fullBuildTrie, parseCsv, parseDat } from './parser-helper';

// Parse the cty file
const file = fs.readFileSync(filePath, 'utf8');

const entities: DxccEntity[] = [];
const prefixes: Map<string, number> = new Map();

console.log('Parsing', filePath);

const parser = type === 'dat' ? parseDat : parseCsv;
for (const entity of parser(file)) {
	const { primaryPrefixRaw, name, dxcc, cont, cqz, ituz, lat, long, timez, otherPrefixes } = entity;

	const hasStar = primaryPrefixRaw.startsWith('*');
	const primaryPrefix = primaryPrefixRaw.replace('*', '');
	const entityId = entities.length + 1;

	entities.push({
		id: entityId,
		dxcc: dxcc,
		primaryPrefix,
		name,
		cqz: cqz,
		ituz: ituz,
		cont,
		lat: lat,
		long: long,
		timez: timez
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

// Check for invalid callsigns
const callsignPattern = /^([A-Z\d]+\/)?([A-Z\d]+\d+[A-Z]+)((?:\/[A-Z\d]+)*)$/i;

const calls: string[] = [];
for (const callRaw of prefixes.keys()) {
	if (!callRaw.startsWith('=')) continue;
	const [, call] = callRaw.match(/^=?((?:[A-Z\d/])+)(.*)/)!;
	if (call.match(/^VER(SION|\d{8})$/)) continue;
	const result = call.match(callsignPattern);
	if (!result) {
		calls.push(call);
	}
}
console.log('Invalid callsigns:', calls.join(', '));

const root = fullBuildTrie([...prefixes.entries()]);

// Output the trie
const out = root.encodeToString();
fs.writeFileSync(path.join(outDir, 'dxcc-tree.json'), JSON.stringify(out, null, '\t') + '\n');

// Output the entities
entities.sort((a, b) => a.id - b.id);
fs.writeFileSync(
	path.join(outDir, 'dxcc-entities.json'),
	JSON.stringify(entities, null, '\t') + '\n'
);
