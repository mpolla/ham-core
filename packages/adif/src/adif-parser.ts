export interface AdifParsingResult {
	warnings: string[];
	result: AdifFile;
}

export interface AdifFile {
	header?: { [field: string]: string };
	records: { [field: string]: string }[];
}

export function parseAdifFile(adi: string): AdifParsingResult {
	const warnings: string[] = [];

	let header: AdifFile['header'];
	const records: AdifFile['records'] = [];
	let temp: { [field: string]: string } = {};

	for (const m of adi.matchAll(/<(EO[HR]|([A-Z_]+):(\d+))>([^<]*)(?<!\s)\s*/gi)) {
		const [, tag, field, length, value] = m;
		if (tag.toUpperCase() === 'EOH') {
			header = temp;
			temp = {};
			continue;
		}

		if (tag.toUpperCase() === 'EOR') {
			records.push(temp);
			temp = {};
			continue;
		}

		if (field in temp) {
			warnings.push(`Duplicate field ${field} in record ${records.length + 1}`);
		}

		if (value.length !== +length) {
			warnings.push(`Field ${field} has length ${value.length}, expected ${length}`);
		}

		temp[field.toUpperCase()] = value;
	}

	return {
		warnings,
		result: {
			header,
			records
		}
	};
}

export function writeAdifFile(
	adi: AdifFile,
	options: { fieldSep: string; rowSep: string } = { fieldSep: '\n', rowSep: '\n\n' }
) {
	const { fieldSep, rowSep } = options;
	let res = '';

	if (adi.header) {
		for (const [field, value] of Object.entries(adi.header)) {
			if (!value) continue;
			res += `<${field.toUpperCase()}:${value.length}>${value}${fieldSep}`;
		}
		res += `<EOH>${rowSep}`;
	}

	for (const record of adi.records) {
		for (const [field, value] of Object.entries(record)) {
			if (!value) continue;
			res += `<${field.toUpperCase()}:${value.length}>${value}${fieldSep}`;
		}
		res += `<EOR>${rowSep}`;
	}

	return res;
}
