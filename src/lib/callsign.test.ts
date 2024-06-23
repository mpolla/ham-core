import { describe, expect, test } from 'vitest';
import { parseCallsign } from './callsign';

describe('parseCallsign', () => {
	test('S52KJ', () => {
		const data = parseCallsign('S52KJ');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffix).toBe(null);
		expect(data?.suffixPartOf).toBe(null);
		expect(data?.baseDxcc).toBe(499);
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
		expect(data?.suffixPartOf).toBe(null);
		expect(data?.baseDxcc).toBe(499);
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
		expect(data?.suffixPartOf).toBe(null);
		expect(data?.baseDxcc).toBe(499);
		expect(data?.prefixDxcc).toBe(null);
	});

	test('9A/S52KJ', () => {
		const data = parseCallsign('9A/S52KJ');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe('9A');
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffix).toBe(null);
		expect(data?.suffixPartOf).toBe(null);
		expect(data?.baseDxcc).toBe(499);
		expect(data?.prefixDxcc).toBe(497);
	});

	test('9A/S52KJ/P', () => {
		const data = parseCallsign('9A/S52KJ/P');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe('9A');
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffix).toBe('P');
		expect(data?.suffixPartOf).toBe(null);
		expect(data?.baseDxcc).toBe(499);
		expect(data?.prefixDxcc).toBe(497);
	});

	test('S52KJ/A', () => {
		const data = parseCallsign('S52KJ/A');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('S5');
		expect(data?.baseSuffix).toBe('2KJ');
		expect(data?.base).toBe('S52KJ');
		expect(data?.secondarySuffix).toBe('A');
		expect(data?.suffixPartOf).toBe(null);
		expect(data?.baseDxcc).toBe(499);
		expect(data?.prefixDxcc).toBe(null);
	});

	test('SV1KJ/A', () => {
		const data = parseCallsign('SV1KJ/A');
		expect(data).not.toBe(null);
		expect(data?.secondaryPrefix).toBe(null);
		expect(data?.basePrefix).toBe('SV');
		expect(data?.baseSuffix).toBe('1KJ');
		expect(data?.base).toBe('SV1KJ');
		expect(data?.secondarySuffix).toBe('A');
		expect(data?.suffixPartOf).toBe('base');
		expect(data?.baseDxcc).toBe(180);
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
		expect(data?.suffixPartOf).toBe('prefix');
		expect(data?.baseDxcc).toBe(499);
		expect(data?.prefixDxcc).toBe(180);
	});
});
