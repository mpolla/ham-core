<script lang="ts">
	import { page } from '$app/stores';
	import Error from '$lib/components/error.svelte';
	import Loading from '$lib/components/loading.svelte';
	import Modal from '$lib/components/modal.svelte';
	import QsoView from '$lib/components/qso-view.svelte';
	import { supabase } from '$lib/supabase';

	$: qsoId = $page.state.showQsoModal!;
	$: qsoPromise = supabase.from('qso').select('*').eq('id', qsoId).single();
</script>

<Modal onClose={() => history.back()}>
	{#await qsoPromise}
		<Loading />
	{:then qso}
		{#if qso.data}
			<QsoView qso={qso.data} />
		{:else}
			<Error />
		{/if}
	{/await}
</Modal>
