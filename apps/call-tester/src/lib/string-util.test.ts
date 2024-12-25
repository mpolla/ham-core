import { describe, expect, test } from 'vitest';
import { capitalize } from './string-util';

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
