import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { parseCty } from './cty-parser';
import { getBigCty } from './get-big-cty';

const OUT_DIR = '../src/data/';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, OUT_DIR);
console.log('Outputting to', outDir);

const TYPE = 'csv';

(async () => {
	const data = await getBigCty(undefined, TYPE);

	const { entities, root } = await parseCty(data, TYPE);

	// Output the trie
	const out = root.encodeToString();
	fs.writeFileSync(path.join(outDir, 'dxcc-tree.json'), JSON.stringify(out, null, '\t') + '\n');

	// Output the entities
	entities.sort((a, b) => a.id - b.id);
	fs.writeFileSync(
		path.join(outDir, 'dxcc-entities.json'),
		JSON.stringify(entities, null, '\t') + '\n'
	);
})();
