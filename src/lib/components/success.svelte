<script lang="ts">
	import { faCheck } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	let { text }: { text: string } = $props();
</script>

<div class="flex items-center justify-center gap-4 text-success">
	<Fa icon={faCheck} class="text-2xl" />
	<span>{text}</span>
</div>
