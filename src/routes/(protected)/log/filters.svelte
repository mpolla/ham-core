<script lang="ts">
	import { callsignInput } from '$lib/helpers/input-helpers';
	import { Band } from '$lib/models/band';
	import { Mode } from '$lib/models/mode';
	import { logbookStore, refreshLogbook, setLimit, updateFilter } from '$lib/stores/logbook-store';
	import {
		faChevronDown,
		faClose,
		faFilter,
		faRefresh,
		faSearch
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	let callsignInputElement: HTMLInputElement;

	let callTimer: ReturnType<typeof setTimeout> | undefined;
	function setCallsign(v: string) {
		if (v === callsign) return;
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

<div class="rounded-lg bg-base-300 p-4">
	<div class="flex flex-wrap items-stretch justify-between gap-6 gap-y-4">
		<label class="input flex w-64 items-center gap-2">
			<Fa icon={faSearch} class="opacity-70" />
			<input
				type="text"
				use:callsignInput
				class="min-w-0 grow font-mono placeholder:font-sans"
				placeholder="Search Callsign"
				value={callsign}
				on:input={(v) => setCallsign(v.currentTarget.value)}
				bind:this={callsignInputElement}
			/>
			<button
				class="btn btn-circle btn-ghost btn-sm -mr-2 disabled:hidden"
				on:click={() => {
					updateFilter({ callsign: '' });
					callsignInputElement.focus();
				}}
				disabled={!callsign}
			>
				<Fa icon={faClose} />
			</button>
		</label>

		<label class="form-control flex-row items-center gap-2">
			<span class="label-text">Limit</span>
			<select class="select" value={limit} on:change={(e) => setLimit(+e.currentTarget.value)}>
				<option value={10}>10</option>
				<option value={25}>25</option>
				<option value={50}>50</option>
				<option value={100}>100</option>
				<option value={250}>250</option>
				<option value={500}>500</option>
				<option value={1000}>1000</option>
			</select>
		</label>

		<div class={`dropdown relative w-64 ${filterOpen ? 'dropdown-open' : ''}`}>
			<button
				class={`btn relative w-full ${filterOpen ? 'z-50' : ''}`}
				on:click={() => (filterOpen = !filterOpen)}
			>
				<Fa icon={faFilter} />
				<span>Filter by</span>
				{#if filterCount > 0}
					<span class="badge badge-primary">{filterCount}</span>
				{/if}
				<Fa class={`ml-auto transition ${filterOpen ? 'rotate-180' : ''}`} icon={faChevronDown} />
			</button>

			{#if filterOpen}
				<button class="fixed inset-0 z-40 cursor-default" on:click={() => (filterOpen = false)} />
			{/if}

			<div
				class={`dropdown-content left-0 right-0 top-0 z-40 -m-4 flex flex-col items-stretch gap-4 rounded-lg border border-white/10 bg-base-100 p-4 shadow-xl ${filterOpen ? '' : 'hidden'}`}
			>
				<div class="btn invisible" />

				<label class="a form-control">
					<span class="label-text">Band</span>
					<select
						class="select select-bordered"
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
						class="select select-bordered"
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

				<button
					class="btn btn-sm"
					on:click={() => {
						updateFilter({ band: '', mode: '' });
						filterOpen = false;
					}}
				>
					Reset
				</button>
			</div>
		</div>

		<button class="btn btn-circle" on:click={refreshLogbook}>
			<Fa icon={faRefresh} />
		</button>

		<!-- <button class="btn">
            <Fa icon={faSort} />
            <span>Sort</span>
        </button> -->
	</div>
</div>
