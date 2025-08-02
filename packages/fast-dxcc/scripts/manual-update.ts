import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { parseCty } from './cty-parser';

const filePath = process.argv[2];
if (!filePath) {
	console.error('Please provide a file path as the first argument');
	process.exit(1);
}

const OUT_DIR = '../src/data/';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, OUT_DIR);
console.log('Outputting to', outDir);

(async () => {
	const type = filePath.split('.').pop();
	if (type !== 'dat' && type !== 'csv') {
		console.error('Invalid file type', type);
		process.exit(1);
	}

	const data = fs.readFileSync(filePath, 'utf8');

	const { entities, root } = await parseCty(data, type);

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
