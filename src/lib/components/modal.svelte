<script lang="ts">
	import { faClose } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let title: string = '';
	export let onClose: () => void;
</script>

<div class="fixed inset-0 z-30 flex items-center justify-center">
	<button class="absolute inset-0 cursor-default bg-black/80" on:click={onClose}></button>
	<div class="relative m-10 max-h-[90vh] min-w-[60%] overflow-y-auto rounded-lg bg-base-100 p-10">
		<h1 class="mb-8 text-2xl">{title}</h1>

		<slot />

		<button class="btn btn-circle btn-ghost absolute right-4 top-4" on:click={onClose}>
			<Fa icon={faClose} />
		</button>
	</div>
</div>
