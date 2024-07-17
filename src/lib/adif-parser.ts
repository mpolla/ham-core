interface AdifParsingResult {
	warnings: string[];
	result: AdifFile;
}

interface AdifFile {
	header: { [field: string]: string } | undefined;
	records: { [field: string]: string }[];
}

export function parseAdifFile(adi: string): AdifParsingResult {
	const warnings = [];

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
