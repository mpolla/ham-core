<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte';

	const {
		content,
		children,
		filename = 'adif.txt',
		type = 'text/plain',
		class: className
	}: {
		content?: string;
		children: Snippet;
		filename: string;
		type?: string;
		class?: string;
	} = $props();

	let oldObjectUrl: string | undefined;
	const objectUrl = $derived(
		content ? URL.createObjectURL(new Blob([content], { type: type })) : undefined
	);

	$effect(() => {
		if (oldObjectUrl) URL.revokeObjectURL(oldObjectUrl);
		oldObjectUrl = objectUrl;
	});

	onDestroy(() => {
		if (oldObjectUrl) URL.revokeObjectURL(oldObjectUrl);
	});
</script>

{#if objectUrl}
	<a class={className} href={objectUrl} download={filename}>
		{@render children()}
	</a>
{:else}
	<button class={className} disabled>
		{@render children()}
	</button>
{/if}
