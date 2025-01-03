import { describe, expect, test } from 'vitest';
import { parseAdifFile, writeAdifFile } from './adif-parser';

describe('ADIF parser', () => {
	test('Empty', () => {
		const res = parseAdifFile('');
		expect(res.warnings).toEqual([]);
		expect(res.result).toEqual({
			header: undefined,
			records: []
		});
	});

	test('Header', () => {
		const res = parseAdifFile('<ADIF_VER:5>2.1.0<EOH>');
		expect(res.warnings).toEqual([]);
		expect(res.result).toEqual({
			header: {
				ADIF_VER: '2.1.0'
			},
			records: []
		});
	});

	test('Record', () => {
		const res = parseAdifFile('<CALL:4>N7AA<EOR>');
		expect(res.warnings).toEqual([]);
		expect(res.result).toEqual({
			header: undefined,
			records: [
				{
					CALL: 'N7AA'
				}
			]
		});
	});

	test('Duplicate field', () => {
		const res = parseAdifFile('<CALL:4>N7AA<CALL:4>N7AA<EOR>');
		expect(res.warnings).has.length(1);
		expect(res.result).toEqual({
			header: undefined,
			records: [
				{
					CALL: 'N7AA'
				}
			]
		});
	});

	test('Field length mismatch', () => {
		const res = parseAdifFile('<CALL:5>N7AA<EOR>');
		expect(res.warnings).has.length(1);
		expect(res.result).toEqual({
			header: undefined,
			records: [
				{
					CALL: 'N7AA'
				}
			]
		});
	});
});

describe('ADIF writer', () => {
	test('Empty', () => {
		const res = writeAdifFile({
			records: []
		});
		expect(res).toEqual('');
	});

	test('Header', () => {
		const res = writeAdifFile({
			header: {
				ADIF_VER: '2.1.0'
			},
			records: []
		});
		expect(res).toEqual('<ADIF_VER:5>2.1.0\n<EOH>\n\n');
	});

	test('Record', () => {
		const res = writeAdifFile({
			records: [
				{
					CALL: 'N7AA'
				}
			]
		});
		expect(res).toEqual('<CALL:4>N7AA\n<EOR>\n\n');
	});

	test('Field separator', () => {
		const res = writeAdifFile(
			{
				records: [
					{
						CALL: 'N7AA'
					}
				]
			},
			{ fieldSep: '\r\n' }
		);
		expect(res).toEqual('<CALL:4>N7AA\r\n<EOR>\n\n');
	});

	test('Row separator', () => {
		const res = writeAdifFile(
			{
				records: [
					{
						CALL: 'N7AA'
					}
				]
			},
			{ rowSep: '\r\n' }
		);
		expect(res).toEqual('<CALL:4>N7AA\n<EOR>\r\n');
	});
});
