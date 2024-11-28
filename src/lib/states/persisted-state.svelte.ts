export function createPersistedState<T>(key: string, initialValue: T) {
	try {
		const str = localStorage.getItem(key);
		if (str) {
			const stored = JSON.parse(str);
			// TODO on major typia version add type assertion
			initialValue = stored;
		}
	} catch (e) {
		console.error('Failed to parse stored value', e);
	}

	let value = $state(initialValue);

	$effect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	});

	return {
		get value() {
			return value;
		},
		set value(newValue) {
			value = newValue;
		}
	};
}
