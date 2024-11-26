<script lang="ts">
	import { tick } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let t = $state<HTMLInputElement>();
	type Props = {
		value: string;
		label: string;
	} & HTMLInputAttributes;

	let { value = $bindable(), label, ...rest }: Props = $props();

	// TODO Fix mobile device input and erasing

	function onInput() {
		if (!t) return;
		let val = t.value;
		const sel = val.length - (t.selectionStart ?? 0);
		val = val.replaceAll(/\D/g, '');
		value = val.substring(val.length - 4, val.length).padStart(4, '0');
		tick().then(() => t?.setSelectionRange(4 - sel, 4 - sel));
	}
</script>

<input
	type="text"
	bind:this={t}
	onkeydown={(e) => {
		if (!t) return;
		const sStart = t.selectionStart ?? 0;
		const sEnd = t.selectionEnd ?? 0;
		if (/\D/.test(e.key) || sStart !== sEnd) return;
		e.preventDefault();
		t.value = t.value.substring(0, sStart) + e.key + t.value.substring(sEnd + 1);
		t.setSelectionRange(sStart + 1, sStart + 1);
		t.dispatchEvent(new Event('input', { bubbles: true }));
	}}
	oninput={onInput}
	placeholder={label}
	bind:value
	{...rest}
/>
