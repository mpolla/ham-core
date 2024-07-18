<script lang="ts">
	import { callsignInput } from '$lib/helpers/input-helpers';
	import { Band } from '$lib/models/band';
	import { Mode } from '$lib/models/mode';
	import { logbookStore, setLimit, updateFilter } from '$lib/stores/logbook-store';
	import { faChevronRight, faSearch } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	let callTimer: ReturnType<typeof setTimeout> | undefined;
	function setCallsign(v: string) {
		clearTimeout(callTimer);
		callTimer = setTimeout(() => updateFilter({ callsign: v }), 500);
	}

	$: callsign = $logbookStore.params.filter.callsign ?? '';
	$: limit = $logbookStore.params.limit;
	let filterOpen = false;
	$: band = $logbookStore.params.filter.band ?? '';
	$: mode = $logbookStore.params.filter.mode ?? '';
	$: filterCount = [band, mode].filter((v) => !!v).length;
</script>

<div class="flex flex-col gap-4 rounded-xl bg-base-300 p-4 @container">
	<div class="flex flex-1 flex-col items-stretch gap-2 @xl:flex-row @xl:items-end">
		<label class="input flex items-center gap-2">
			<input
				type="text"
				use:callsignInput
				class="min-w-0 grow"
				placeholder="Search Callsign"
				value={callsign}
				on:input={(v) => setCallsign(v.currentTarget.value)}
			/>
			<Fa icon={faSearch} class="opacity-70" />
		</label>

		<label class="a form-control">
			<span class="label-text">Limit</span>
			<select
				class="select select-sm"
				value={limit}
				on:change={(e) => setLimit(+e.currentTarget.value)}
			>
				<option value={10}>10</option>
				<option value={25}>25</option>
				<option value={50}>50</option>
				<option value={100}>100</option>
				<option value={250}>250</option>
				<option value={500}>500</option>
			</select>
		</label>

		<button class="btn" on:click={() => (filterOpen = !filterOpen)}>
			<Fa class={`transition ${filterOpen ? 'rotate-90' : ''}`} icon={faChevronRight} />
			<span>Filters</span>
			{#if filterCount > 0}
				<span class="badge badge-primary">{filterCount}</span>
			{/if}
		</button>
		<!-- <button class="btn">
            <Fa icon={faSort} />
            <span>Sort</span>
        </button> -->
	</div>

	{#if filterOpen}
		<div
			class="flex flex-col items-stretch gap-2 @xl:flex-row @xl:items-end [*>&]:w-full [*>&]:@xl:w-auto"
		>
			<label class="a form-control">
				<span class="label-text">Band</span>
				<select
					class="select select-sm"
					value={band}
					on:change={(e) => updateFilter({ band: e.currentTarget.value })}
				>
					<option value="">All</option>
					{#each Band.ALL_BANDS.values() as band}
						<option value={band.name}>{band.name}</option>
					{/each}
				</select>
			</label>

			<label class="a form-control">
				<span class="label-text">Mode</span>
				<select
					class="select select-sm"
					value={mode}
					on:change={(e) => updateFilter({ mode: e.currentTarget.value })}
				>
					<option value="">All</option>
					{#each Mode.ALL_MODES.values() as mode}
						<option value={mode.name}>{mode.name}</option>
						{#each mode.subModes as subMode}
							<option value={subMode.name}>&nbsp;&nbsp;&nbsp;&nbsp;{subMode.name}</option>
						{/each}
					{/each}
				</select>
			</label>

			<button class="btn btn-sm" on:click={() => updateFilter({ band: '', mode: '' })}>
				Reset
			</button>
		</div>
	{/if}
</div>

<style lang="postcss">
	.a {
		@apply flex-row items-center gap-2 @xl:flex-col @xl:items-start @xl:gap-0;
		& > :not(:first-child) {
			@apply flex-1;
		}
	}
</style>
