import { describe, expect, test } from 'vitest';
import { Band } from './band';

describe('Band plan tests', () => {
	test('Bands should have valid ranges', () => {
		const bands = [...Band.ALL_BANDS.values()];
		for (let i = 0; i < bands.length; i++) {
			expect(bands[i].lower).toBeLessThan(bands[i].upper);
		}
	});

	test('Bands should have valid names', () => {
		const bands = [...Band.ALL_BANDS.values()];
		for (let i = 0; i < bands.length; i++) {
			expect(bands[i].name).toMatch(/^\d+(\.\d+)?[kcm]?m+$/i);
		}
	});

	test('Bands should not overlap', () => {
		const bands = [...Band.ALL_BANDS.values()];
		for (let i = 0; i < bands.length; i++) {
			for (let j = i + 1; j < bands.length; j++) {
				if (bands[i].upper > bands[j].lower && bands[i].lower < bands[j].upper) {
					throw new Error(`Bands ${bands[i].name} and ${bands[j].name} overlap!`);
				}
			}
		}
	});

	test('Bands should be sorted', () => {
		const bands = [...Band.ALL_BANDS.values()];
		for (let i = 1; i < bands.length; i++) {
			expect(bands[i - 1].lower).toBeLessThan(bands[i].lower);
		}
	});

	test('Bands should be unique', () => {
		const bands = [...Band.ALL_BANDS.values()];
		const set = new Set<string>();
		for (let i = 0; i < bands.length; i++) {
			expect(set.has(bands[i].name)).toBe(false);
			set.add(bands[i].name);
		}
	});
});

describe('getBand', () => {
	test.each(
		[...Band.ALL_BANDS.values()]
			.map((b) => [
				[b.lower, b],
				[(b.lower + b.upper) / 2, b],
				[b.upper, b]
			])
			.flat(1) as [number, Band][]
	)('%f -> %s', (frequency, band) => {
		expect(Band.getBand(frequency)).toBe(band);
	});

	test.each([...Band.ALL_BANDS.values()].map((b) => [b.lower - 1, b.upper + 1]).flat())(
		'invalid frequency %f',
		(frequency) => {
			expect(Band.getBand(frequency)).toBeNull();
		}
	);
});
