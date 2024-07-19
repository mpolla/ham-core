<script lang="ts">
	import { clearSelected, selectedStore } from './selected-store';
</script>

{#if $selectedStore.size > 0}
	<div class="flex flex-col gap-4 rounded-xl bg-base-300 p-4 @container">
		<div class="flex items-center justify-between">
			<div>
				<span class="font-bold">{$selectedStore.size}</span>
				<span class="text-sm opacity-80">QSOs selected</span>
			</div>
			<button class="btn btn-outline btn-error btn-xs" on:click={clearSelected}>Clear</button>
		</div>
		<div class="flex flex-col flex-wrap gap-2 @md:flex-row">
			<a href="/log/gen-csv-qsl" class="btn btn-sm">Generate QSL CSV</a>
			<button class="btn btn-sm" disabled>Export ADI</button>
		</div>
	</div>
{/if}
