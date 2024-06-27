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

const prefixes: [string, number][] = [];

for (const prefix of doc.clublog.prefixes[0].prefix) {
	const end = prefix.end?.[0];
	if (end && new Date(end) < now) continue;
	prefixes.push([prefix.call[0], parseInt(prefix.adif[0])]);
}
console.log('Parsed', prefixes.length, 'prefixes');

import { fullBuildTrie } from './parser-helper';

const root = fullBuildTrie(prefixes);

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
		dxcc: id,
		name,
		cqz: cqz ? parseInt(cqz) : undefined,
		cont: cont ? cont : undefined
	});
}

// Output the entities
fs.writeFileSync(path.join(outDir, 'dxcc-entities.json'), JSON.stringify(entities, null, '\t'));
