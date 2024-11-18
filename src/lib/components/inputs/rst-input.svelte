<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		value?: string;
		label?: string;
		mode?: string | undefined;
	} & HTMLInputAttributes;

	let { value = $bindable(''), label = '', mode = undefined, ...rest }: Props = $props();

	let [defaultValue, defaultStartSel, defaultEndSel] = $derived(
		((): [string, number, number] | [] => {
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
		})()
	);

	let canFillDefault = $derived(
		defaultValue !== undefined && (value === '' || value === defaultValue)
	);
</script>

<input
	type="text"
	onfocus={(e) => {
		if (!canFillDefault) return;
		const field = e.currentTarget;
		field.value = defaultValue ?? '';
		field.setSelectionRange(defaultStartSel ?? 0, defaultEndSel ?? 0);
		value = defaultValue ?? '';
	}}
	bind:value
	placeholder={label}
	{...rest}
/>
