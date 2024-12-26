import { describe, expect, test } from 'vitest';
import { dxccEntities, dxccTree, findDxcc } from './dxcc-util';

describe('dxccTree', () => {
	test('dxccTree is not null', () => {
		expect(dxccTree).not.toBe(null);
	});
});

describe('findDxcc', () => {
	const s5 = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'S5');
	const sv = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'SV');
	const sva = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'SV/a');
	const sv9 = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'SV9');
	const itu = [...dxccEntities.values()].find((e) => e.primaryPrefix === '4U1I');
	const sp = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'SP');

	test('S52KJ', () => {
		const result = findDxcc('S52KJ');
		expect(result?.entity).toEqual(s5);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('s52kj', () => {
		const result = findDxcc('s52kj');
		expect(result?.entity).toEqual(s5);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('S52KJ/P', () => {
		const result = findDxcc('S52KJ/P');
		expect(result?.entity).toEqual(s5);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV2AAA', () => {
		const result = findDxcc('SV2AAA');
		expect(result?.entity).toEqual(sv);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV2RSG/A', () => {
		const result = findDxcc('SV2RSG/A');
		expect(result?.entity).toEqual(sva);
		expect(result?.matchLength).toBe(8);
		expect(result?.isExact).toBe(true);
	});

	test('4U1ITU', () => {
		const result = findDxcc('4U1ITU');
		expect(result?.entity).toEqual(itu);
		expect(result?.matchLength).toBe(6);
		expect(result?.isExact).toBe(true);
	});

	test('SV2AAA/AP', () => {
		const result = findDxcc('SV2AAA/AP');
		expect(result?.entity).toEqual(sv);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV2AAA/P', () => {
		const result = findDxcc('SV2AAA/P');
		expect(result?.entity).toEqual(sv);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV/S52KJ', () => {
		const result = findDxcc('SV/S52KJ');
		expect(result?.entity).toEqual(sv);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV/S52KJ/A', () => {
		const result = findDxcc('SV/S52KJ/A');
		expect(result?.entity).toEqual(sv);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV/S52KJ/P', () => {
		const result = findDxcc('SV/S52KJ/P');
		expect(result?.entity).toEqual(sv);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV9/S52KJ/A', () => {
		const result = findDxcc('SV9/S52KJ/A');
		expect(result?.entity).toEqual(sv9);
		expect(result?.matchLength).toBe(3);
		expect(result?.isExact).toBe(false);
	});

	test('S', () => {
		const result = findDxcc('S');
		expect(result).toBe(null);
	});

	test('SP', () => {
		const result = findDxcc('SP');
		expect(result?.entity).toEqual(sp);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SP1', () => {
		const result = findDxcc('SP1');
		expect(result?.entity).toEqual(sp);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
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

	test('S5', () => {
		const s5Id = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'S5')!.id;

		const entity = dxccEntities.get(s5Id);
		expect(entity).not.toBe(undefined);
		expect(entity?.name).toBe('Slovenia');
		expect(entity?.cont).toBe('EU');
		expect(entity?.cqz).toBe(15);
	});
});
