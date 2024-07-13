<script lang="ts">
	export let value = '';
	export let label = '';
	export let defaultValue: string | undefined = undefined;
	export let defaultStartSel: number | undefined = undefined;
	export let defaultEndSel: number | undefined = undefined;

	$: canFillDefault =
		defaultValue !== undefined &&
		(value === '' || value === defaultValue) &&
		defaultStartSel !== undefined &&
		defaultEndSel !== undefined;
</script>

<input
	type="text"
	on:focus={(e) => {
		if (!canFillDefault) return;
		const field = e.currentTarget;
		field.value = defaultValue ?? '';
		field.setSelectionRange(defaultStartSel ?? 0, defaultEndSel ?? 0);
	}}
	bind:value
	placeholder={label}
	{...$$restProps}
/>
