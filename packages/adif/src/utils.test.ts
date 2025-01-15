import { describe, expect, test } from 'vitest';
import { formatAdifDateTime, parseAdifDateTime } from './utils';

describe('parseAdifDateTime', () => {
	test('Valid date and time', () => {
		const record = {
			QSO_DATE: '20210620',
			TIME_ON: '192345'
		};
		expect(parseAdifDateTime(record)).toEqual(new Date('2021-06-20T19:23:45Z'));
	});

	test('No seconds', () => {
		const record = {
			QSO_DATE: '20210620',
			TIME_ON: '1923'
		};
		expect(parseAdifDateTime(record)).toEqual(new Date('2021-06-20T19:23:00Z'));
	});

	test('Missing date', () => {
		const record = {
			TIME_ON: '192345'
		};
		expect(parseAdifDateTime(record)).toBeUndefined();
	});

	test('Missing time', () => {
		const record = {
			QSO_DATE: '20210620'
		};
		expect(parseAdifDateTime(record)).toBeUndefined();
	});
});

describe('formatAdifDateTime', () => {
	test('Valid date and time', () => {
		const date = new Date('2021-06-20T19:23:45Z');
		expect(formatAdifDateTime(date)).toEqual({
			date: '20210620',
			time: '192345'
		});
	});

	test('No seconds', () => {
		const date = new Date('2021-06-20T19:23:00Z');
		expect(formatAdifDateTime(date)).toEqual({
			date: '20210620',
			time: '1923'
		});
	});
});
