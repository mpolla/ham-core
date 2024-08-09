<script lang="ts">
	import LogbookSelect from '$lib/components/logbook-select.svelte';
	import { logbookStore, selectLog } from '$lib/stores/logbook-store';
	import { setDefaultLog, userStore } from '$lib/stores/user-store';
	import {
		faEdit,
		faHeart,
		faMagnifyingGlass,
		faPlus,
		faTrash
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import LogbookForm from './logbook-form.svelte';
	import { page } from '$app/stores';
	import { pushState, replaceState } from '$app/navigation';
	import Modal from '$lib/components/modal.svelte';
	import { supabase } from '$lib/supabase';
	import { logsStore, refreshLogs } from '$lib/stores/logs-store';

	$: defaultLog = $userStore?.info?.default_log_id;
	$: selectedLog = $logbookStore.params.logId;
	$: log = $logsStore?.find((log) => log.id === selectedLog);
	$: logbookModal = $page.state.logbookModal;
	$: deleteConfirmation = $page.state.showConfirmModal;

	function deleteLog() {
		if (!selectedLog) return;
		supabase
			.from('log')
			.update({ deleted_at: new Date().toISOString() })
			.eq('id', selectedLog)
			.then((res) => {
				if (res.error) {
					console.error(res.error);
					return;
				}
				refreshLogs();
				replaceState('', {});
				selectLog(0);
			});
	}
</script>

<div class="flex flex-col gap-8">
	<h2 class="text-3xl">Settings</h2>

	<div>
		<h3 class="mb-4 text-2xl">Logbooks</h3>

		<div class="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
			<LogbookSelect class="w-full min-w-60 sm:max-w-xs" />

			<button
				on:click={() => selectedLog && setDefaultLog(selectedLog)}
				disabled={!selectedLog || defaultLog === selectedLog}
				class="btn"
			>
				<Fa icon={faHeart} />
				<span>Set default</span>
			</button>

			<button
				on:click={() => pushState('', { logbookModal: 'edit' })}
				class="btn"
				disabled={!selectedLog}
			>
				<Fa icon={faEdit} />
				<span>Edit Log</span>
			</button>

			<button
				on:click={() => pushState('', { showConfirmModal: true })}
				class="btn"
				disabled={!selectedLog}
			>
				<Fa icon={faTrash} />
				<span>Delete Log</span>
			</button>

			<a class="btn" href="/log/analyze">
				<Fa icon={faMagnifyingGlass} />
				<span>Analyze</span>
			</a>

			<button on:click={() => pushState('', { logbookModal: 'new' })} class="btn">
				<Fa icon={faPlus} />
				<span>New Log</span>
			</button>

			{#if logbookModal}
				<Modal
					onClose={() => history.back()}
					title={logbookModal === 'new' ? 'New Log' : 'Edit Log'}
				>
					<LogbookForm mode={logbookModal} />
				</Modal>
			{/if}

			{#if deleteConfirmation}
				<Modal onClose={() => history.back()} title="Delete Log">
					<!-- TODO Get qso count in log -->
					<p>
						Are you sure you want to delete the log
						<span class="rounded bg-base-300 px-2 py-1 font-bold">{log?.title} ({log?.call})</span>
						and all containing QSOs?
					</p>
					<div class="mt-4 flex justify-end gap-2">
						<button class="btn" on:click={() => history.back()}>Cancel</button>
						<button class="btn btn-error" on:click={deleteLog}>Delete</button>
					</div>
				</Modal>
			{/if}
		</div>
	</div>
</div>
