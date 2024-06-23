import { describe, expect, test } from 'vitest';
import { dxccEntities, dxccTree, findDxcc } from './dxcc-util';

describe('dxccTree', () => {
	test('dxccTree is not null', () => {
		expect(dxccTree).not.toBe(null);
	});
});

describe('findDxcc', () => {
	test('S52KJ', () => {
		const result = findDxcc('S52KJ');
		expect(result?.entity).toBe(499);
		expect(result?.prefixLength).toBe(2);
		expect(result?.withSuffix).toBe(false);
	});

	test('s52kj', () => {
		const result = findDxcc('s52kj');
		expect(result?.entity).toBe(499);
		expect(result?.prefixLength).toBe(2);
		expect(result?.withSuffix).toBe(false);
	});

	test('S52KJ/P', () => {
		const result = findDxcc('S52KJ/P');
		expect(result?.entity).toBe(499);
		expect(result?.prefixLength).toBe(2);
		expect(result?.withSuffix).toBe(false);
	});

	test('SV2AAA', () => {
		const result = findDxcc('SV2AAA');
		expect(result?.entity).toBe(236);
		expect(result?.prefixLength).toBe(2);
		expect(result?.withSuffix).toBe(false);
	});

	test('SV2AAA/A', () => {
		const result = findDxcc('SV2AAA/A');
		expect(result?.entity).toBe(180);
		expect(result?.prefixLength).toBe(2);
		expect(result?.withSuffix).toBe(true);
	});

	test('SV2AAA/AP', () => {
		const result = findDxcc('SV2AAA/AP');
		expect(result?.entity).toBe(236);
		expect(result?.prefixLength).toBe(2);
		expect(result?.withSuffix).toBe(false);
	});

	test('SV2AAA/P', () => {
		const result = findDxcc('SV2AAA/P');
		expect(result?.entity).toBe(236);
		expect(result?.prefixLength).toBe(2);
		expect(result?.withSuffix).toBe(false);
	});

	test('SV/S52KJ', () => {
		const result = findDxcc('SV/S52KJ');
		expect(result?.entity).toBe(236);
		expect(result?.prefixLength).toBe(2);
		expect(result?.withSuffix).toBe(false);
	});

	test('SV/S52KJ/A', () => {
		const result = findDxcc('SV/S52KJ/A');
		expect(result?.entity).toBe(180);
		expect(result?.prefixLength).toBe(2);
		expect(result?.withSuffix).toBe(true);
	});

	test('SV/S52KJ/P', () => {
		const result = findDxcc('SV/S52KJ/P');
		expect(result?.entity).toBe(236);
		expect(result?.prefixLength).toBe(2);
		expect(result?.withSuffix).toBe(false);
	});

	test('SV9/S52KJ/A', () => {
		const result = findDxcc('SV9/S52KJ/A');
		expect(result?.entity).toBe(40);
		expect(result?.prefixLength).toBe(3);
		expect(result?.withSuffix).toBe(false);
	});

	test('empty string', () => {
		const result = findDxcc('');
		expect(result).toBe(null);
	});

	test('slash only', () => {
		const result = findDxcc('/');
		expect(result).toBe(null);
	});

	test('incomplete string', () => {
		const result = findDxcc('S');
		expect(result).toBe(null);
	});
});

describe('dxccEntities', () => {
	test('dxccEntities is not null', () => {
		expect(dxccEntities).not.toBe(null);
	});

	test('499', () => {
		const entity = dxccEntities.get(499);
		expect(entity).not.toBe(undefined);
		expect(entity?.name).toBe('Slovenia');
		expect(entity?.cont).toBe('EU');
		expect(entity?.cqz).toBe(15);
	});
});
