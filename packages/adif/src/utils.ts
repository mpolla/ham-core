import { AdifRecord } from './adif-record';

/**
 * Parses a date and time of the beginning of a QSO from an ADIF record.
 * @param record The ADIF record to parse
 * @returns The date and time of the QSO, or undefined if the record does not contain a valid date and time
 */
export function parseAdifDateTime(record: AdifRecord): Date | undefined {
	const date = record.QSO_DATE;
	const time = record.TIME_ON;
	if (!date || !time) return undefined;

	const yyyy = date.slice(0, 4);
	const mm = date.slice(4, 6);
	const dd = date.slice(6, 8);
	const hh = time.slice(0, 2);
	const m = time.slice(2, 4);
	const ss = time.length === 6 ? time.slice(4, 6) : '00';

	return new Date(`${yyyy}-${mm}-${dd}T${hh}:${m}:${ss}Z`);
}

/**
 * Formats a date and time to two strings specified in ADIF format.
 *
 * If the seconds are 00, they will be omitted.
 * @param date The date to format
 * @returns An object with the date and time formatted as YYYYMMDD and HHMMSS
 */
export function formatAdifDateTime(date: Date): { date: string; time: string } {
	const yyyy = date.getUTCFullYear();
	const mm = p(date.getUTCMonth() + 1);
	const dd = p(date.getUTCDate());
	const hh = p(date.getUTCHours());
	const m = p(date.getUTCMinutes());
	const ss = p(date.getUTCSeconds());

	return {
		date: `${yyyy}${mm}${dd}`,
		time: `${hh}${m}${ss == '00' ? '' : ss}`
	};
}

function p(n: number): string {
	return `${n}`.padStart(2, '0');
}
