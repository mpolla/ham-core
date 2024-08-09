<script lang="ts">
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import Error from '$lib/components/error.svelte';
	import Loading from '$lib/components/loading.svelte';
	import Modal from '$lib/components/modal.svelte';
	import QsoView from '$lib/components/qso-view.svelte';
	import { refreshLogbook } from '$lib/stores/logbook-store';
	import { getQsos, supabase } from '$lib/supabase';

	$: qsoId = $page.state.showQsoModal!;
	$: qsoPromise = getQsos().eq('id', qsoId).single();

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
				refreshLogbook();
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
						<button class="btn" on:click={() => history.back()}>Cancel</button>
						<button class="btn btn-error" on:click={deleteQso}> Delete </button>
					</div>
				</Modal>
			{/if}
		{:else}
			<Error />
		{/if}
	{/await}
</Modal>
