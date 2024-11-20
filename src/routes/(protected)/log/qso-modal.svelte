<script lang="ts">
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import Error from '$lib/components/error.svelte';
	import Loading from '$lib/components/loading.svelte';
	import Modal from '$lib/components/modal.svelte';
	import QsoView from '$lib/components/qso-view.svelte';
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';
	import { getQsos, supabase } from '$lib/supabase';

	const logbook = getLogbookContext();

	let qsoId = $derived($page.state.showQsoModal!);
	let qsoPromise = $derived(getQsos().eq('id', qsoId).single());

	function deleteQso() {
		supabase
			.from('qso')
			.update({ deleted_at: new Date().toISOString() })
			.eq('id', qsoId)
			.then((res) => {
				if (res.error) {
					console.error(res.error);
					return;
				}
				logbook.refresh();
				replaceState('/', {});
			});
	}
</script>

<Modal onClose={() => history.back()} title="QSO info">
	{#await qsoPromise}
		<Loading />
	{:then qso}
		{#if qso.data}
			<QsoView
				qso={qso.data}
				onDelete={() => pushState('', { ...$page.state, showConfirmModal: true })}
			/>

			{#if $page.state.showConfirmModal}
				<Modal onClose={() => history.back()} title="Delete QSO">
					<p>Are you sure you want to delete this QSO?</p>
					<div class="mt-2 flex justify-end gap-4">
						<button class="btn" onclick={() => history.back()}>Cancel</button>
						<button class="btn btn-error" onclick={deleteQso}> Delete </button>
					</div>
				</Modal>
			{/if}
		{:else}
			<Error />
		{/if}
	{/await}
</Modal>
