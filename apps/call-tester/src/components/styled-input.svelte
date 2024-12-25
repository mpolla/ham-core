<script lang="ts">
	import { onMount } from 'svelte';

	export let inputText = '';
	export let inputRe: RegExp = /.*/;
	export let autofocus: boolean = false;
	export let placeholder: string | undefined = undefined;

	let selectionStart: number | null = inputText.length;
	let selectionEnd: number | null = inputText.length;

	export let generateStyledText: (text: string) => string = (text: string) => text;

	$: styledText = generateStyledText(inputText) || '&ZeroWidthSpace;';

	onMount(() => {
		// Set the initial selection
		const input = document.querySelector('.input') as HTMLInputElement;
		input.value = inputText;
		input.setSelectionRange(selectionStart, selectionEnd);
		if (autofocus) input.focus();
	});
</script>

<label
	for="callsign-input"
	class={`mb-1 block w-full text-center text-sm font-light transition ${placeholder && inputText ? '' : 'opacity-0'}`}
>
	{placeholder}
</label>
<div class="relative w-full">
	<input
		id="callsign-input"
		class="input shared"
		on:keydown={(e) => {
			const t = e.currentTarget;
			selectionStart = t.selectionStart;
			selectionEnd = t.selectionEnd;
		}}
		on:input={(e) => {
			const t = e.currentTarget;
			if (inputRe.test(t.value)) {
				inputText = t.value.toUpperCase();
			} else {
				// Users enter the not supported characters
				// Restore the value and selection
				t.value = inputText;
				t.setSelectionRange(selectionStart, selectionEnd);
			}
		}}
		{placeholder}
	/>
	<div class="styled-text shared" contenteditable="false" bind:innerHTML={styledText} />
</div>

<style lang="postcss">
	.shared {
		border-radius: 12px;
		@apply w-full px-3 py-2 text-center font-mono text-2xl uppercase md:text-3xl;
	}

	.input {
		@apply absolute left-0 top-0 border border-[#ccc] bg-transparent text-transparent caret-white;
	}

	.input::placeholder {
		font-family: sans-serif;
		text-transform: none;
	}

	.styled-text {
		@apply whitespace-pre break-words border border-transparent bg-[#424242];
	}
</style>
