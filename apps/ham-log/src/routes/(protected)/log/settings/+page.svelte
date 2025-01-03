<script lang="ts">
	import LogbookSelect from '$lib/components/logbook-select.svelte';
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';
	import { getUserContext } from '$lib/states/user-state.svelte';
	import {
		faEdit,
		faHeart,
		faMagnifyingGlass,
		faPlus,
		faTrash
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import LogbookForm from './logbook-form.svelte';
	import { page } from '$app/state';
	import { pushState, replaceState } from '$app/navigation';
	import Modal from '$lib/components/modal.svelte';
	import { supabase } from '$lib/supabase';
	import { getLogsContext } from '$lib/states/logs-state.svelte';

	const user = getUserContext();
	const logsState = getLogsContext();
	const logbook = getLogbookContext();

	const logbookModal = $derived(page.state.logbookModal);
	const deleteConfirmation = $derived(page.state.showConfirmModal);

	function deleteLog() {
		if (!logbook.selectedLog) return;
		supabase
			.from('log')
			.update({ deleted_at: new Date().toISOString() })
			.eq('id', logbook.selectedLog.id)
			.then((res) => {
				if (res.error) {
					console.error(res.error);
					return;
				}
				logsState.refresh();
				replaceState('', {});
				logbook.logId = undefined;
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
				onclick={() => logbook.logId && (user.defaultLogId = logbook.logId)}
				disabled={!logbook.logId || user.defaultLogId === logbook.logId}
				class="btn"
			>
				<Fa icon={faHeart} />
				<span>Set default</span>
			</button>

			<button
				onclick={() => pushState('', { logbookModal: 'edit' })}
				class="btn"
				disabled={!logbook.selectedLog}
			>
				<Fa icon={faEdit} />
				<span>Edit Log</span>
			</button>

			<button
				onclick={() => pushState('', { showConfirmModal: true })}
				class="btn"
				disabled={!logbook.selectedLog}
			>
				<Fa icon={faTrash} />
				<span>Delete Log</span>
			</button>

			<a class="btn" href="/log/analyze">
				<Fa icon={faMagnifyingGlass} />
				<span>Analyze</span>
			</a>

			<button onclick={() => pushState('', { logbookModal: 'new' })} class="btn">
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
						<span class="rounded bg-base-300 px-2 py-1 font-bold"
							>{logbook.selectedLog?.title} ({logbook.selectedLog?.call})</span
						>
						and all containing QSOs?
					</p>
					<div class="mt-4 flex justify-end gap-2">
						<button class="btn" onclick={() => history.back()}>Cancel</button>
						<button class="btn btn-error" onclick={deleteLog}>Delete</button>
					</div>
				</Modal>
			{/if}
		</div>
	</div>
</div>
