import JSZip from 'jszip';
import fs from 'fs';

const ctyUrl = 'https://www.country-files.com/';
const zipRegex = /https:\/\/www\.country-files\.com\/bigcty\/download\/\d+\/(bigcty-\d+)\.zip/;

const getZipUrl = async () => {
	const response = await fetch(ctyUrl).then((r) => r.text());

	const zipMatch = response.match(zipRegex);
	if (!zipMatch) {
		console.error('No zip match found');
		process.exit(1);
	}

	return zipMatch[0];
};

export const getBigCty = async (zipUrl?: string) => {
	if (!zipUrl) {
		zipUrl = await getZipUrl();
	}

	const zipResponse = await fetch(zipUrl);
	const zipBuffer = await zipResponse.arrayBuffer();

	const zip = await JSZip.loadAsync(zipBuffer);

	const bigcty = zip.file('cty.csv');
	if (!bigcty) {
		console.error('No cty.csv found');
		process.exit(1);
	}

	return bigcty.async('text');
};

if (require.main === module) {
	(async () => {
		const zipUrl = await getZipUrl();

		const filePath = process.argv[2] || `${zipUrl.match(zipRegex)![1]}.csv`;
		fs.writeFileSync(filePath, await getBigCty());
	})();
}
