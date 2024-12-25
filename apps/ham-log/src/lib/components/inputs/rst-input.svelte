<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		value?: string;
		label?: string;
		mode?: string;
	} & HTMLInputAttributes;

	let { value = $bindable(''), label = '', mode, ...rest }: Props = $props();

	const [defaultValue, defaultStartSel, defaultEndSel] = $derived.by(() => {
		switch (mode) {
			case 'SSB':
			case 'LSB':
			case 'USB':
			case 'FM':
			case 'AM':
				return ['59', 1, 2];
			case 'CW':
			case 'RTTY':
				return ['599', 1, 2];
			default:
				return [];
		}
	});

	const canFill = $derived(defaultValue && value === '');
	const canSelect = $derived(
		defaultValue &&
			defaultValue.substring(0, defaultStartSel) === value.substring(0, defaultStartSel) &&
			defaultValue.substring(defaultEndSel ?? 0) === value.substring(defaultEndSel ?? 0)
	);
</script>

<input
	type="text"
	onfocus={(e) => {
		const field = e.currentTarget;
		if (canFill) field.value = defaultValue ?? '';
		if (canSelect) field.setSelectionRange(defaultStartSel ?? 0, defaultEndSel ?? 0);
	}}
	bind:value
	placeholder={label}
	{...rest}
/>
