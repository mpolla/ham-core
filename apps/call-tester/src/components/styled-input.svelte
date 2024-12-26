<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	interface Props {
		inputText?: string;
		inputRe?: RegExp;
		autofocus?: boolean;
		placeholder?: string | undefined;
		children?: Snippet;
	}

	let {
		inputText = $bindable(''),
		inputRe = /.*/,
		autofocus = false,
		placeholder = undefined,
		children
	}: Props = $props();

	let selectionStart: number | null = $state(inputText.length);
	let selectionEnd: number | null = $state(inputText.length);

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
		onkeydown={(e) => {
			const t = e.currentTarget;
			selectionStart = t.selectionStart;
			selectionEnd = t.selectionEnd;
		}}
		oninput={(e) => {
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
	<div class="styled-text shared" contenteditable="false">
		{@render children?.()}
	</div>
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
