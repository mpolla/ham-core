import { describe, expect, test } from 'vitest';
import { getDistanceBetweenLocators, locatorToLongLat } from './locator-util';

describe('From locator', () => {
	test.each([
		['JN', 0, 40],
		['JN00', 0, 40],
		['JN76', 14, 46],
		['JN76AA', 14, 46],
		['JN76db', 14.25, 46.042],
		['JN76db00', 14.25, 46.042],
		['JN76db65', 14.3, 46.0625],
		['AA', -180, -90],
		['AA00', -180, -90],
		['AA00aa', -180, -90],
		['RR', 160, 80],
		['RR99', 178, 89],
		['RR99xx', 179.92, 89.96]
	])('%s -> %i %i', (locator, expectedLong, expectedLat) => {
		const [long, lat] = locatorToLongLat(locator);
		expect(long).toBeCloseTo(expectedLong);
		expect(lat).toBeCloseTo(expectedLat);
	});

	test.each([
		['JN', 10, 45],
		['JN76', 15, 46.5],
		['JN76db', 14.292, 46.063]
	])('Center %s -> %i %i', (locator, expectedLong, expectedLat) => {
		const [long, lat] = locatorToLongLat(locator, true);
		expect(long).toBeCloseTo(expectedLong);
		expect(lat).toBeCloseTo(expectedLat);
	});

	test('Precision', () => {
		const [long, lat] = locatorToLongLat('RR99xx99xx99xx99');
		expect(lat).toBeCloseTo(90, 6);
		expect(lat).not.toBe(90);
		expect(long).toBeCloseTo(180, 6);
		expect(long).not.toBe(180);
	});

	test.each(['', 'A', '1', '11', '11A', '11AA', 'AA1', 'AX', 'XA', 'AA00AY', 'AA0000', 'AA00AA0'])(
		'Invalid locator %s',
		(locator) => {
			expect(() => locatorToLongLat(locator)).toThrowError();
		}
	);
});

describe('getDistanceBetweenLocators', () => {
	test.each([
		['JN', 'JN', 0],
		['JN76', 'JN76', 0],
		['JN76db', 'JN76db', 0],
		['JN76db65', 'JN76db65', 0],
		['JN', 'JN44XX99XX99XX', 0],
		['JN44XX99XX99XX', 'JN55AA00AA00AA', 0]
	])('%s - %s -> %i', (loc1, loc2, expectedDistance) => {
		const distance = getDistanceBetweenLocators(loc1, loc2);
		expect(distance).toBeCloseTo(expectedDistance, 0);
	});
});
