<script>
	import QsoForm from '$lib/components/qso-form.svelte';
	import QsoList from '$lib/components/qso-list.svelte';
	import { qsosStore } from '$lib/stores/qsos-store';
	import { userStore } from '$lib/stores/user-store';
</script>

<div class="flex flex-col gap-10">
	{#if $userStore}
		<QsoForm />
	{/if}

	<QsoList qsos={$qsosStore.qsos} />
</div>
