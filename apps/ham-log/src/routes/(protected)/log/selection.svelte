<script lang="ts">
	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { getSelectedQsosContext } from '$lib/states/selected-state.svelte';
	import ExportAdiModal from './adif-export/adif-export-modal.svelte';
	import GenCsvModal from './gen-csv-qsl/gen-csv-modal.svelte';

	const selected = getSelectedQsosContext();

	function openQslModal() {
		pushState('', {
			showQslModal: true
		});
	}

	function openAdiModal() {
		pushState('', {
			showAdiModal: true
		});
	}
</script>

{#if selected.state.size > 0}
	<div
		class="sticky bottom-4 z-10 flex flex-col gap-4 rounded-xl bg-base-300 bg-opacity-85 p-4 backdrop-blur-sm @container"
	>
		<div class="flex items-center justify-between">
			<div>
				<span class="font-bold">{selected.state.size}</span>
				<span class="text-sm opacity-80">QSOs selected</span>
			</div>
			<button class="btn btn-outline btn-error btn-xs" onclick={selected.clear}>Clear</button>
		</div>
		<div class="flex flex-col flex-wrap gap-2 @md:flex-row">
			<button onclick={openQslModal} class="btn btn-sm">Generate QSL CSV</button>
			<button onclick={openAdiModal} class="btn btn-sm">Export ADI</button>
		</div>
	</div>
{/if}

{#if $page.state.showQslModal}
	<GenCsvModal />
{/if}

{#if $page.state.showAdiModal}
	<ExportAdiModal />
{/if}
