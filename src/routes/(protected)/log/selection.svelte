<script lang="ts">
	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import ExportAdiModal from './export-adif/export-adi-modal.svelte';
	import GenCsvModal from './gen-csv-qsl/gen-csv-modal.svelte';
	import { clearSelected, selectedStore } from './selected-store';

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

{#if $selectedStore.size > 0}
	<div
		class="sticky bottom-4 flex flex-col gap-4 rounded-xl bg-base-300 bg-opacity-95 p-4 @container"
	>
		<div class="flex items-center justify-between">
			<div>
				<span class="font-bold">{$selectedStore.size}</span>
				<span class="text-sm opacity-80">QSOs selected</span>
			</div>
			<button class="btn btn-outline btn-error btn-xs" on:click={clearSelected}>Clear</button>
		</div>
		<div class="flex flex-col flex-wrap gap-2 @md:flex-row">
			<button on:click={openQslModal} class="btn btn-sm">Generate QSL CSV</button>
			<button on:click={openAdiModal} class="btn btn-sm">Export ADI</button>
		</div>
	</div>
{/if}

{#if $page.state.showQslModal}
	<GenCsvModal />
{/if}

{#if $page.state.showAdiModal}
	<ExportAdiModal />
{/if}
