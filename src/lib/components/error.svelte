<script lang="ts">
	import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let text: string = 'Error';
</script>

<div class="flex items-center justify-center gap-4 text-error">
	<Fa icon={faExclamationTriangle} class="text-2xl" />
	<span>{text}</span>
</div>
