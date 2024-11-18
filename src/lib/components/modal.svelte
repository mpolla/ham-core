<script lang="ts">
	import { faClose } from '@fortawesome/free-solid-svg-icons';
	import type { Snippet } from 'svelte';
	import Fa from 'svelte-fa';

	interface Props {
		title?: string;
		onClose: () => void;
		children?: Snippet;
	}

	let { title = '', onClose, children }: Props = $props();
</script>

<div class="fixed inset-0 z-30 flex items-center justify-center">
	<button
		aria-label="Close modal"
		class="absolute inset-0 cursor-default bg-black/80"
		onclick={onClose}
	></button>
	<div class="relative m-10 max-h-[90vh] min-w-[60%] overflow-y-auto rounded-lg bg-base-100 p-10">
		<h1 class="mb-8 text-2xl">{title}</h1>

		{@render children?.()}

		<button class="btn btn-circle btn-ghost absolute right-4 top-4" onclick={onClose}>
			<Fa icon={faClose} />
		</button>
	</div>
</div>
