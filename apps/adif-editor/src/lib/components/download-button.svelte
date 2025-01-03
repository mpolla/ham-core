<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte';

	const {
		content,
		children,
		filename = 'adif.txt',
		type = 'text/plain',
		class: className
	}: {
		content: string;
		children: Snippet;
		filename: string;
		type?: string;
		class?: string;
	} = $props();

	const objectUrl = URL.createObjectURL(new Blob([content], { type: type }));

	onDestroy(() => {
		URL.revokeObjectURL(objectUrl);
	});
</script>

{#if objectUrl}
	<a class={className} href={objectUrl} download={filename}>
		{@render children()}
	</a>
{/if}
