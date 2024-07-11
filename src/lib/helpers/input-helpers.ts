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
			const value = element.value;
			const selStart = element.selectionStart;
			const selEnd = element.selectionEnd;
			element.value = value.replace(pattern, '');
			element.setSelectionRange(
				value.slice(0, selStart ?? 0).replace(pattern, '').length,
				value.slice(0, selEnd ?? 0).replace(pattern, '').length
			);
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
