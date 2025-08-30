import { describe, expect, test } from 'vitest';
import { DxccOverrides } from './dxcc-overrides';

describe('fromString', () => {
	test('cqz', () => {
		const ovr = DxccOverrides.fromString('(56)');
		expect(ovr).toEqual({ cqz: 56 });
	});

	test('ituz', () => {
		const ovr = DxccOverrides.fromString('[27]');
		expect(ovr).toEqual({ ituz: 27 });
	});

	test('cont', () => {
		const ovr = DxccOverrides.fromString('{AF}');
		expect(ovr).toEqual({ cont: 'AF' });
	});

	test('timez', () => {
		const ovr = DxccOverrides.fromString('~-5.5~');
		expect(ovr).toEqual({ timez: -5.5 });
	});

	test('lat/long', () => {
		const ovr = DxccOverrides.fromString('<37.5/-122.5>');
		expect(ovr).toEqual({ lat: 37.5, long: -122.5 });
	});

	test('multiple', () => {
		const ovr = DxccOverrides.fromString('(56)[27]{AF}~-5.5~<37.5/-122.5>');
		expect(ovr).toEqual({
			cqz: 56,
			ituz: 27,
			cont: 'AF',
			timez: -5.5,
			lat: 37.5,
			long: -122.5
		});
	});

	test('empty', () => {
		const ovr = DxccOverrides.fromString('');
		expect(ovr).toEqual({});
	});
});

describe('toString', () => {
	test('cqz', () => {
		const ovr = new DxccOverrides({ cqz: 56 });
		expect(ovr.toString()).toBe('(56)');
	});

	test('ituz', () => {
		const ovr = new DxccOverrides({ ituz: 27 });
		expect(ovr.toString()).toBe('[27]');
	});

	test('cont', () => {
		const ovr = new DxccOverrides({ cont: 'AF' });
		expect(ovr.toString()).toBe('{AF}');
	});

	test('timez', () => {
		const ovr = new DxccOverrides({ timez: -5.5 });
		expect(ovr.toString()).toBe('~-5.5~');
	});

	test('lat/long', () => {
		const ovr = new DxccOverrides({ lat: 37.5, long: -122.5 });
		expect(ovr.toString()).toBe('<37.5/-122.5>');
	});

	test('only lat', () => {
		const ovr = new DxccOverrides({ lat: 37.5 });
		expect(ovr.toString()).toBe('');
	});

	test('only long', () => {
		const ovr = new DxccOverrides({ long: -122.5 });
		expect(ovr.toString()).toBe('');
	});

	test('multiple', () => {
		const ovr = new DxccOverrides({
			cqz: 56,
			ituz: 27,
			cont: 'AF',
			timez: -5.5,
			lat: 37.5,
			long: -122.5
		});
		expect(ovr.toString()).toBe('(56)[27]{AF}~-5.5~<37.5/-122.5>');
	});

	test('empty', () => {
		const ovr = new DxccOverrides({});
		expect(ovr.toString()).toBe('');
	});

	test('no params', () => {
		const ovr = new DxccOverrides();
		expect(ovr.toString()).toBe('');
	});
});

describe('isEqual', () => {
	test.each([
		[{}, {}],
		[{ cqz: 56 }, { cqz: 56 }],
		[{ ituz: 27 }, { ituz: 27 }],
		[{ cont: 'AF' }, { cont: 'AF' }],
		[{ timez: -5.5 }, { timez: -5.5 }],
		[
			{ lat: 37.5, long: -122.5 },
			{ lat: 37.5, long: -122.5 }
		],
		[
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 },
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 }
		]
	])('same %o == %o', (a, b) => {
		const aObj = new DxccOverrides(a);
		const bObj = new DxccOverrides(b);
		expect(aObj.isEqual(bObj)).toBe(true);
	});

	test('with null', () => {
		const aObj = new DxccOverrides({ cont: 'AF' });
		expect(aObj.isEqual(null)).toBe(false);
	});

	test.each([
		[{}, { cqz: 56 }],
		[{ cqz: 56 }, { cqz: 56, ituz: 27 }],
		[{ ituz: 27 }, { cqz: 56, ituz: 27 }],
		[{ cont: 'AF' }, { cqz: 56, ituz: 27, cont: 'AF' }],
		[{ timez: -5.5 }, { cqz: 56, ituz: 27, cont: 'AF', timez: -5.5 }],
		[
			{ lat: 37.5, long: -122.5 },
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 }
		],
		[
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 },
			{ cqz: 2, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 }
		],
		[
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 },
			{ cqz: 56, ituz: 2, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 }
		],
		[
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 },
			{ cqz: 56, ituz: 27, cont: 'SA', timez: -5.5, lat: 37.5, long: -122.5 }
		],
		[
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 },
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.2, lat: 37.5, long: -122.5 }
		],
		[
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 },
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.3, long: -122.5 }
		],
		[
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 },
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.1 }
		]
	])('different %o != %o', (a, b) => {
		const aObj = new DxccOverrides(a);
		const bObj = new DxccOverrides(b);
		expect(aObj.isEqual(bObj)).toBe(false);
	});
});

describe('isSubsetOf', () => {
	test.each([
		[{}, {}],
		[{ cqz: 56 }, { cqz: 56 }],
		[{ ituz: 27 }, { ituz: 27 }],
		[{ cont: 'AF' }, { cont: 'AF' }],
		[{ timez: -5.5 }, { timez: -5.5 }],
		[
			{ lat: 37.5, long: -122.5 },
			{ lat: 37.5, long: -122.5 }
		],
		[
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 },
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 }
		],
		[{}, { cqz: 56 }],
		[{ cqz: 56 }, { cqz: 56, ituz: 27 }],
		[{ ituz: 27 }, { cqz: 56, ituz: 27 }],
		[{ cont: 'AF' }, { cqz: 56, ituz: 27, cont: 'AF' }],
		[{ timez: -5.5 }, { cqz: 56, ituz: 27, cont: 'AF', timez: -5.5 }],
		[
			{ lat: 37.5, long: -122.5 },
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 }
		]
	])('is subset %o <= %o', (a, b) => {
		const aObj = new DxccOverrides(a);
		const bObj = new DxccOverrides(b);
		expect(aObj.isSubsetOf(bObj)).toBe(true);
	});

	test.each([
		[{ cqz: 56 }, { cqz: 5 }],
		[{ ituz: 27 }, { ituz: 2 }],
		[{ cont: 'AF' }, { cont: 'SA' }],
		[{ timez: -5.5 }, { timez: -5.2 }],
		[{ lat: 37.5 }, { lat: 37.3 }],
		[{ long: -122.5 }, { long: -122.1 }],
		[{ cqz: 56 }, {}],
		[{ cqz: 56, ituz: 27 }, { cqz: 56 }],
		[{ cqz: 56, ituz: 27 }, { ituz: 27 }],
		[{ cqz: 56, ituz: 27, cont: 'AF' }, { cont: 'AF' }],
		[{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5 }, { timez: -5.5 }],
		[
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 },
			{ lat: 37.5, long: -122.5 }
		]
	])('is not subset %o !<= %o', (a, b) => {
		const aObj = new DxccOverrides(a);
		const bObj = new DxccOverrides(b);
		expect(aObj.isSubsetOf(bObj)).toBe(false);
	});
});

describe('merge', () => {
	test.each([
		[{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 }, undefined],
		[{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 }, {}],
		[
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 },
			{ cqz: null, ituz: null, lat: null, long: null, cont: null, timez: null }
		]
	])('same as first', (a, b) => {
		const aObj = new DxccOverrides(a);
		const bObj = new DxccOverrides(b);
		expect(aObj.merge(bObj)).toEqual(aObj);
	});

	test('with null/undefined', () => {
		const aObj = new DxccOverrides({
			cqz: 56,
			ituz: 27,
			cont: 'AF',
			timez: -5.5,
			lat: 37.5,
			long: -122.5
		});
		expect(aObj.merge(null)).toEqual(aObj);
		expect(aObj.merge(undefined)).toEqual(aObj);
	});

	test.each([
		[{}, { cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 }],
		[
			{ cqz: null, ituz: null, lat: null, long: null, cont: null, timez: null },
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 }
		],
		[
			{ cqz: 1, ituz: 2, lat: 3, long: 4, cont: 'EU', timez: 6 },
			{ cqz: 56, ituz: 27, cont: 'AF', timez: -5.5, lat: 37.5, long: -122.5 }
		]
	])('override all', (a, b) => {
		const aObj = new DxccOverrides(a);
		const bObj = new DxccOverrides(b);
		expect(aObj.merge(bObj)).toEqual(bObj);
	});
});
