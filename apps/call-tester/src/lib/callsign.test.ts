import { describe, expect, test } from 'vitest';
import { parseCallsign } from './callsign';
import { dxccEntities } from 'fast-dxcc';

const s5 = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'S5');
const sv = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'SV');
const sva = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'SV/a');

describe('parseCallsign', () => {
	test('S52KJ', () => {
		const data = parseCallsign('S52KJ');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffixes).toEqual([]);
		expect(data?.baseDxcc).toEqual(s5);
		expect(data?.fullDxcc).toEqual(s5);
	});

	test('s52kj', () => {
		const data = parseCallsign('s52kj');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffixes).toEqual([]);
		expect(data?.baseDxcc).toEqual(s5);
		expect(data?.fullDxcc).toEqual(s5);
	});

	test('S52KJ/P', () => {
		const data = parseCallsign('S52KJ/P');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffixes).toEqual(['P']);
		expect(data?.baseDxcc).toEqual(s5);
		expect(data?.fullDxcc).toEqual(s5);
	});

	test('SV/S52KJ', () => {
		const data = parseCallsign('SV/S52KJ');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe('SV');
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffixes).toEqual([]);
		expect(data?.baseDxcc).toEqual(s5);
		expect(data?.fullDxcc).toEqual(sv);
	});

	test('SV/S52KJ/P', () => {
		const data = parseCallsign('SV/S52KJ/P');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe('SV');
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffixes).toEqual(['P']);
		expect(data?.baseDxcc).toEqual(s5);
		expect(data?.fullDxcc).toEqual(sv);
	});

	test('S52KJ/A', () => {
		const data = parseCallsign('S52KJ/A');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffixes).toEqual(['A']);
		expect(data?.baseDxcc).toEqual(s5);
		expect(data?.fullDxcc).toEqual(s5);
	});

	test('S52KJ/A/P', () => {
		const data = parseCallsign('S52KJ/A/P');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffixes).toEqual(['A', 'P']);
		expect(data?.baseDxcc).toEqual(s5);
		expect(data?.fullDxcc).toEqual(s5);
	});

	test('SV2RSG/A', () => {
		const data = parseCallsign('SV2RSG/A');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('SV');
		expect(data?.baseSuffix).toBe('2RSG');
		expect(data?.base).toBe('SV2RSG');
		expect(data?.secondarySuffixes).toEqual(['A']);
		expect(data?.baseDxcc).toEqual(sv);
		expect(data?.fullDxcc).toEqual(sva);
	});

	test('SV/S52KJ/A', () => {
		const data = parseCallsign('SV/S52KJ/A');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe('SV');
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffixes).toEqual(['A']);
		expect(data?.baseDxcc).toEqual(s5);
		expect(data?.fullDxcc).toEqual(sv);
	});

	test('Invalid callsign', () => {
		const data = parseCallsign('INVALID');
		expect(data).toBe(null);
	});

	test('Invalid DXCC', () => {
		const data = parseCallsign('XX7KJ');
		expect(data).not.toBe(null);
		expect(data?.base).toBe('XX7KJ');
		expect(data?.baseDxcc).toBe(null);
		expect(data?.fullDxcc).toBe(null);
	});
});
