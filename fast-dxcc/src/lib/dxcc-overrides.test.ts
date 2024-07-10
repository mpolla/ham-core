import { describe, expect, test } from '@jest/globals';
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
