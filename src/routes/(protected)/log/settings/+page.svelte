<script lang="ts">
	import LogbookSelect from '$lib/components/logbook-select.svelte';
	import { logbookStore } from '$lib/stores/logbook-store';
	import { setDefaultLog, userStore } from '$lib/stores/user-store';
	import { faEdit, faHeart, faPlus } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import LogbookForm from './logbook-form.svelte';
	import { page } from '$app/stores';
	import { pushState } from '$app/navigation';
	import Modal from '$lib/components/modal.svelte';

	$: defaultLog = $userStore?.info?.default_log_id;
	$: selectedLog = $logbookStore.params.logId;
</script>

<div class="flex flex-col gap-8">
	<h2 class="text-3xl">Settings</h2>

	<div>
		<h3 class="mb-4 text-2xl">Logbooks</h3>

		<div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
			<LogbookSelect class="w-full sm:max-w-xs" />

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

			<button on:click={() => pushState('', { logbookModal: 'new' })} class="btn">
				<Fa icon={faPlus} />
				<span>New Log</span>
			</button>

			{#if $page.state.logbookModal}
				<Modal onClose={() => history.back()}>
					<LogbookForm mode={$page.state.logbookModal} />
				</Modal>
			{/if}
		</div>
	</div>
</div>
