<script lang="ts">
	import { onMount } from 'svelte';

	export let inputText = '';
	let selectionStart: number | null = inputText.length;
	let selectionEnd: number | null = inputText.length;

	export let generateStyledText: (text: string) => string = (text: string) => text;

	$: styledText = generateStyledText(inputText) || '&ZeroWidthSpace;';

	onMount(() => {
		// Set the initial selection
		const input = document.querySelector('.input') as HTMLInputElement;
		input.value = inputText;
		input.setSelectionRange(selectionStart, selectionEnd);
	});
</script>

<div class="relative w-full">
	<input
		class="input shared"
		on:keydown={(e) => {
			const t = e.currentTarget;
			selectionStart = t.selectionStart;
			selectionEnd = t.selectionEnd;
		}}
		on:input={(e) => {
			const t = e.currentTarget;
			if (/^[A-Z\d/]*$/i.test(t.value)) {
				inputText = t.value.toUpperCase();
			} else {
				// Users enter the not supported characters
				// Restore the value and selection
				t.value = inputText;
				t.setSelectionRange(selectionStart, selectionEnd);
			}
		}}
		placeholder="..."
	/>
	<div class="styled-text shared" contenteditable="false" bind:innerHTML={styledText} />
</div>

<style>
	.shared {
		font-family: monospace;
		text-transform: uppercase;
		width: 100%;
		font-size: 32px;
		padding: 8px 12px;
		text-align: center;
		border-radius: 12px;
	}

	.input {
		border: 1px solid #ccc;
		position: absolute;
		top: 0;
		left: 0;
		background: transparent;
		color: transparent;
		caret-color: white;
	}

	.input::placeholder {
		font-family: sans-serif;
		text-transform: none;
	}

	.styled-text {
		background: #424242;
		border: 1px solid transparent;
		white-space: pre;
		word-wrap: break-word;
	}
</style>
