import { describe, expect, test } from 'vitest';
import { parseCallsign } from './callsign';
import { dxccEntities } from './dxcc-util';

const s5ID = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'S5')?.id;
const svID = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'SV')?.id;
const svaID = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'SV/a')?.id;

describe('parseCallsign', () => {
	test('S52KJ', () => {
		const data = parseCallsign('S52KJ');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffix).toBe(null);
		expect(data?.baseDxcc).toBe(s5ID);
		expect(data?.prefixDxcc).toBe(null);
	});

	test('s52kj', () => {
		const data = parseCallsign('s52kj');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffix).toBe(null);
		expect(data?.baseDxcc).toBe(s5ID);
		expect(data?.prefixDxcc).toBe(null);
	});

	test('S52KJ/P', () => {
		const data = parseCallsign('S52KJ/P');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffix).toBe('P');
		expect(data?.baseDxcc).toBe(s5ID);
		expect(data?.prefixDxcc).toBe(null);
	});

	test('SV/S52KJ', () => {
		const data = parseCallsign('SV/S52KJ');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe('SV');
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffix).toBe(null);
		expect(data?.baseDxcc).toBe(s5ID);
		expect(data?.prefixDxcc).toBe(svID);
	});

	test('SV/S52KJ/P', () => {
		const data = parseCallsign('SV/S52KJ/P');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe('SV');
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffix).toBe('P');
		expect(data?.baseDxcc).toBe(s5ID);
		expect(data?.prefixDxcc).toBe(svID);
	});

	test('S52KJ/A', () => {
		const data = parseCallsign('S52KJ/A');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffix).toBe('A');
		expect(data?.baseDxcc).toBe(s5ID);
		expect(data?.prefixDxcc).toBe(null);
	});

	test('SV2RSG/A', () => {
		const data = parseCallsign('SV2RSG/A');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('SV2RSG/A');
		expect(data?.baseSuffix).toBe('');
		expect(data?.base).toBe('SV2RSG');
		expect(data?.secondarySuffix).toBe('A');
		expect(data?.baseDxcc).toBe(svaID);
		expect(data?.prefixDxcc).toBe(null);
	});

	test('SV/S52KJ/A', () => {
		const data = parseCallsign('SV/S52KJ/A');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe('SV');
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffix).toBe('A');
		expect(data?.baseDxcc).toBe(s5ID);
		expect(data?.prefixDxcc).toBe(svID);
	});
});
