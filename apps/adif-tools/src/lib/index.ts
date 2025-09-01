import type { AdifRecord } from '@ham-core/adif';

export function uppercaseInput(element: HTMLInputElement) {
	function onInput() {
		const selStart = element.selectionStart;
		const selEnd = element.selectionEnd;
		element.value = element.value.toUpperCase();
		element.setSelectionRange(selStart, selEnd);
	}
	element.addEventListener('input', onInput);
	return {
		destroy() {
			element.removeEventListener('input', onInput);
		}
	};
}

export function filteredInput(pattern: RegExp) {
	function filter(element: HTMLInputElement) {
		function onInput() {
			const val = element.value;
			const sel = element.selectionStart ?? 0;
			const newSel = val.slice(0, sel).replace(pattern, '').length;
			element.value = val.replace(pattern, '');
			element.setSelectionRange(newSel, newSel);
		}
		element.addEventListener('input', onInput);
		return {
			destroy() {
				element.removeEventListener('input', onInput);
			}
		};
	}

	return filter;
}

export function callsignInput(element: HTMLInputElement) {
	const a = uppercaseInput(element);
	const b = filteredInput(/[^A-Z0-9/]/g)(element);
	return {
		destroy() {
			a.destroy();
			b.destroy();
		}
	};
}

export function numberInput(element: HTMLInputElement) {
	return filteredInput(/[^0-9]/g)(element);
}

export function getDefaultRST(mode?: string) {
	switch (mode) {
		case 'SSB':
		case 'AM':
		case 'FM':
			return '59';
		case 'CW':
		case 'RTTY':
			return '599';
		default:
			return '';
	}
}

/**
 * Returns true if two QSOs are duplicates. For a QSO to be considered a duplicate, it must have the same:
 * - CALL
 * - QSO_DATE
 * - TIME_ON (first 4 digits)
 * - MODE
 * - BAND or FREQ
 */
export function isDupe(a: AdifRecord, b: AdifRecord): boolean {
	return (
		a.CALL === b.CALL &&
		a.QSO_DATE == b.QSO_DATE &&
		a.TIME_ON?.substring(0, 4) == b.TIME_ON?.substring(0, 4) &&
		a.MODE === b.MODE &&
		(a.BAND === b.BAND || a.FREQ === b.FREQ)
	);
}

/**
 * Returns an new array of QSOs with all duplicates removed.
 */
export function removeDupes(qsos: AdifRecord[]): AdifRecord[] {
	return qsos.filter((q, i) => !qsos.slice(i + 1).find((q2) => isDupe(q, q2)));
}

/**
 * Returns all QSOs that appear more than once in the list.
 */
export function onlyDupes(qsos: AdifRecord[]): AdifRecord[] {
	return qsos.filter((q, i) => qsos.slice(i + 1).find((q2) => isDupe(q, q2)));
}
