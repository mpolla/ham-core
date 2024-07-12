<script lang="ts">
	let t: HTMLInputElement;
	export let value: string;
	export let label: string;

	function onInput() {
		const val = t.value;
		const sel = val.length - (t.selectionStart ?? 0);
		t.value = val.replaceAll(/\D/g, '');
		t.value = t.value.substring(t.value.length - 4, t.value.length).padStart(4, '0');
		t.setSelectionRange(4 - sel, 4 - sel);
	}
</script>

<input
	type="text"
	bind:this={t}
	on:keydown={(e) => {
		const sStart = t.selectionStart ?? 0;
		const sEnd = t.selectionEnd ?? 0;
		if (/\D/.test(e.key) || sStart !== sEnd) return;
		e.preventDefault();
		t.value = t.value.substring(0, sStart) + e.key + t.value.substring(sEnd + 1);
		t.setSelectionRange(sStart + 1, sStart + 1);
		onInput();
		t.dispatchEvent(new Event('input'));
	}}
	on:input={onInput}
	placeholder={label}
	bind:value
	{...$$restProps}
/>
