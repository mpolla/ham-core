<script lang="ts">
	let className = '';
	export { className as class };

	export let value = '';
	export let label = '';

	function handleInput(val: string): string {
		val = val.replaceAll(',', '.');
		val = val.replaceAll(/[^0-9.]/g, '');
		let [, int, dec] = val.match(/^(\d*\.?)(.*)$/)!;
		int ??= '';
		dec ??= '';
		return `${int}${dec.replaceAll('.', '')}`;
	}
</script>

<label class={`${className} flex items-center gap-2`}>
	<input
		type="text"
		class="w-full"
		on:keydown={(e) => {
			const t = e.currentTarget;
			const selStart = t.selectionStart;
			const selEnd = t.selectionEnd;
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				t.value = (parseFloat(t.value) + 0.001).toFixed(3);
				t.setSelectionRange(selStart, selEnd);
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				t.value = (parseFloat(t.value) - 0.001).toFixed(3);
				t.setSelectionRange(selStart, selEnd);
			}
		}}
		on:input={(e) => {
			// TODO handle dot and comma
			const t = e.currentTarget;
			const sel = t.selectionStart ?? 0;
			const ns = handleInput(t.value.slice(0, sel)).length;
			t.value = handleInput(t.value);
			t.setSelectionRange(ns, ns);
		}}
		bind:value
		placeholder={label}
	/>
	<div class="select-none">MHz</div>
</label>
