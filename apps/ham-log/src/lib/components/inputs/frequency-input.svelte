<script lang="ts">
	function handleInput(val: string): string {
		val = val.replaceAll(',', '.');
		val = val.replaceAll(/[^0-9.]/g, '');
		let [, int, dec] = val.match(/^(\d*\.?)(.*)$/)!;
		int ??= '';
		dec ??= '';
		return `${int}${dec.replaceAll('.', '')}`;
	}

	interface Props {
		class?: string;
		value?: string;
		label?: string;
		onChange?: (value: string) => void;
	}

	let { class: className = '', value = $bindable(''), label = '', onChange }: Props = $props();
</script>

<label class="{className} flex items-center gap-2">
	<input
		type="text"
		class="w-full"
		onkeydown={(e) => {
			const t = e.currentTarget;
			const selStart = t.selectionStart;
			const selEnd = t.selectionEnd;
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				t.value = (parseFloat(t.value) + 0.001).toFixed(3);
				t.setSelectionRange(selStart, selEnd);
				value = t.value;
				t.dispatchEvent(new Event('input', { bubbles: true }));
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				t.value = (parseFloat(t.value) - 0.001).toFixed(3);
				t.setSelectionRange(selStart, selEnd);
				value = t.value;
				t.dispatchEvent(new Event('input', { bubbles: true }));
			}
		}}
		oninput={(e) => {
			// TODO handle dot and comma
			const t = e.currentTarget;
			const sel = t.selectionStart ?? 0;
			const ns = handleInput(t.value.slice(0, sel)).length;
			t.value = handleInput(t.value);
			t.setSelectionRange(ns, ns);
		}}
		onchange={(e) => {
			const t = e.currentTarget;
			onChange?.(t.value);
		}}
		bind:value
		placeholder={label}
	/>
	<div class="select-none">MHz</div>
</label>
