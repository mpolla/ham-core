import { describe, expect, test } from 'vitest';
import { locatorToLongLat } from './locator-util';

describe('From locator', () => {
	test('2 characters', () => {
		const { lat, long } = locatorToLongLat('JN');
		expect(lat).toBeCloseTo(40);
		expect(long).toBeCloseTo(0);
	});

	test('4 characters', () => {
		const { lat, long } = locatorToLongLat('JN76');
		expect(lat).toBeCloseTo(46);
		expect(long).toBeCloseTo(14);
	});

	test('6 characters', () => {
		const { lat, long } = locatorToLongLat('JN76db');
		expect(lat).toBeCloseTo(46.042);
		expect(long).toBeCloseTo(14.25);
	});

	test('8 characters', () => {
		const { lat, long } = locatorToLongLat('JN76db65');
		expect(lat).toBeCloseTo(46.0625);
		expect(long).toBeCloseTo(14.3);
	});

	test('Bottom edge AA', () => {
		const { lat, long } = locatorToLongLat('AA');
		expect(lat).toBeCloseTo(-90);
		expect(long).toBeCloseTo(-180);
	});

	test('Bottom edge AA00', () => {
		const { lat, long } = locatorToLongLat('AA00');
		expect(lat).toBeCloseTo(-90);
		expect(long).toBeCloseTo(-180);
	});

	test('Top edge RR', () => {
		const { lat, long } = locatorToLongLat('RR');
		expect(lat).toBeCloseTo(80);
		expect(long).toBeCloseTo(160);
	});

	test('Top edge RR99', () => {
		const { lat, long } = locatorToLongLat('RR99');
		expect(lat).toBeCloseTo(89);
		expect(long).toBeCloseTo(178);
	});

	test('Top edge RR99xx', () => {
		const { lat, long } = locatorToLongLat('RR99xx');
		expect(lat).toBeCloseTo(89 + (2.5 * 23) / 60);
		expect(long).toBeCloseTo(178 + (5 * 23) / 60);
	});

	test('Center 2 characters', () => {
		const { lat, long } = locatorToLongLat('JN', true);
		expect(lat).toBeCloseTo(45);
		expect(long).toBeCloseTo(10);
	});

	test('Center 4 characters', () => {
		const { lat, long } = locatorToLongLat('JN76', true);
		expect(lat).toBeCloseTo(46.5);
		expect(long).toBeCloseTo(15);
	});

	test('Center 6 characters', () => {
		const { lat, long } = locatorToLongLat('JN76db', true);
		expect(lat).toBeCloseTo(46.063);
		expect(long).toBeCloseTo(14.292);
	});

	test('Precision', () => {
		const { lat, long } = locatorToLongLat('RR99xx99xx99xx99');
		expect(lat).toBeCloseTo(90, 6);
		expect(lat).not.toBe(90);
		expect(long).toBeCloseTo(180, 6);
		expect(long).not.toBe(180);
	});
});
