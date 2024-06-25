import { describe, expect, test } from 'vitest';
import { dxccEntities, dxccTree, findDxcc } from './dxcc-util';

describe('dxccTree', () => {
	test('dxccTree is not null', () => {
		expect(dxccTree).not.toBe(null);
	});
});

describe('findDxcc', () => {
	const s5ID = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'S5')?.id;
	const svID = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'SV')?.id;
	const svaID = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'SV/a')?.id;
	const sv9ID = [...dxccEntities.values()].find((e) => e.primaryPrefix === 'SV9')?.id;
	const ituID = [...dxccEntities.values()].find((e) => e.primaryPrefix === '4U1I')?.id;

	test('S52KJ', () => {
		const result = findDxcc('S52KJ');
		expect(result?.entityId).toBe(s5ID);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('s52kj', () => {
		const result = findDxcc('s52kj');
		expect(result?.entityId).toBe(s5ID);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('S52KJ/P', () => {
		const result = findDxcc('S52KJ/P');
		expect(result?.entityId).toBe(s5ID);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV2AAA', () => {
		const result = findDxcc('SV2AAA');
		expect(result?.entityId).toBe(svID);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV2RSG/A', () => {
		const result = findDxcc('SV2RSG/A');
		expect(result?.entityId).toBe(svaID);
		expect(result?.matchLength).toBe(8);
		expect(result?.isExact).toBe(true);
	});

	test('4U1ITU', () => {
		const result = findDxcc('4U1ITU');
		expect(result?.entityId).toBe(ituID);
		expect(result?.matchLength).toBe(6);
		expect(result?.isExact).toBe(true);
	});

	test('SV2AAA/AP', () => {
		const result = findDxcc('SV2AAA/AP');
		expect(result?.entityId).toBe(svID);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV2AAA/P', () => {
		const result = findDxcc('SV2AAA/P');
		expect(result?.entityId).toBe(svID);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV/S52KJ', () => {
		const result = findDxcc('SV/S52KJ');
		expect(result?.entityId).toBe(svID);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV/S52KJ/A', () => {
		const result = findDxcc('SV/S52KJ/A');
		expect(result?.entityId).toBe(svID);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV/S52KJ/P', () => {
		const result = findDxcc('SV/S52KJ/P');
		expect(result?.entityId).toBe(svID);
		expect(result?.matchLength).toBe(2);
		expect(result?.isExact).toBe(false);
	});

	test('SV9/S52KJ/A', () => {
		const result = findDxcc('SV9/S52KJ/A');
		expect(result?.entityId).toBe(sv9ID);
		expect(result?.matchLength).toBe(3);
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
