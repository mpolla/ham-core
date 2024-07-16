<script lang="ts">
	export let value = '';
	export let label = '';
	export let mode: string | undefined = undefined;

	$: [defaultValue, defaultStartSel, defaultEndSel] = ((): [string, number, number] | [] => {
		switch (mode) {
			case 'SSB':
			case 'LSB':
			case 'USB':
				return ['59', 1, 2];
			case 'CW':
			case 'RTTY':
				return ['599', 1, 2];
			default:
				return [];
		}
	})();

	$: canFillDefault = defaultValue !== undefined && (value === '' || value === defaultValue);
</script>

<input
	type="text"
	on:focus={(e) => {
		if (!canFillDefault) return;
		const field = e.currentTarget;
		field.value = defaultValue ?? '';
		field.setSelectionRange(defaultStartSel ?? 0, defaultEndSel ?? 0);
		value = defaultValue ?? '';
	}}
	bind:value
	placeholder={label}
	{...$$restProps}
/>
