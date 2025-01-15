import { AdifRecord } from './adif-record';

export interface AdifParsingResult {
	warnings: string[];
	result: AdifFile;
}

export interface AdifFile {
	header?: {
		ADIF_VER?: string;
		CREATED_TIMESTAMP?: string;
		PROGRAMID?: string;
		PROGRAMVERSION?: string;
		[field: string]: string | undefined;
	};
	records: AdifRecord[];
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

export function writeAdifFile(adi: AdifFile, options: { fieldSep?: string; rowSep?: string } = {}) {
	const { fieldSep, rowSep } = { fieldSep: '\n', rowSep: '\n\n', ...options };
	let res = '';

	function write(fields: { [field: string]: string | undefined }) {
		for (const [field, value] of Object.entries(fields)) {
			if (!value) continue;
			res += `<${field.toUpperCase()}:${value.length}>${value}${fieldSep}`;
		}
	}

	if (adi.header) {
		write(adi.header);
		res += `<EOH>${rowSep}`;
	}

	for (const record of adi.records) {
		write(record);
		res += `<EOR>${rowSep}`;
	}

	return res;
}
