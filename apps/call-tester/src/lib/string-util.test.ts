import { describe, expect, test } from 'vitest';
import { capitalize, compactChars, rangeToString } from './string-util';

describe('capitalize', () => {
	test('Single word', () => {
		expect(capitalize('hello')).toBe('Hello');
	});

	test('Multiple words', () => {
		expect(capitalize('hello world')).toBe('Hello World');
	});

	test('Empty string', () => {
		expect(capitalize('')).toBe('');
	});

	test('Single letter', () => {
		expect(capitalize('a')).toBe('A');
	});

	test('Repeating letters', () => {
		expect(capitalize('aaa')).toBe('Aaa');
	});

	test('Repeating words', () => {
		expect(capitalize('hello hello')).toBe('Hello Hello');
	});

	test('Mixed case', () => {
		expect(capitalize('hELLO')).toBe('Hello');
	});

	test('Mixed case words', () => {
		expect(capitalize('hELLO wORLD')).toBe('Hello World');
	});

	test('Repeating substrings', () => {
		expect(capitalize('hihihi hi')).toBe('Hihihi Hi');
	});
});

test.each([
	['', '', ''],
	['a', 'a', 'a'],
	['A', 'A', 'A'],
	['A', 'B', 'AB'],
	['C', 'E', 'C-E']
])('rangeToString %s %s -> %s', (start, end, expected) => {
	expect(rangeToString(start, end)).toBe(expected);
});

test.each([
	['', ''],
	['a', 'a'],
	['A', 'A'],
	['AB', 'AB'],
	['ABCDE', 'A-E'],
	['ABCE', 'A-CE'],
	['ABCEFG', 'A-CE-G']
])('compactChars %s -> %s', (s, expected) => {
	expect(compactChars(s.split(''))).toBe(expected);
});
