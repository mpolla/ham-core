<script lang="ts">
	import { filteredInput, uppercaseInput } from '$lib/helpers/input-helpers';
	import { Band } from '$lib/models/band';
	import { Mode } from '$lib/models/mode';
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';
	import {
		faChevronDown,
		faClose,
		faFilter,
		faRefresh,
		faSearch
	} from '@fortawesome/free-solid-svg-icons';
	import { onDestroy } from 'svelte';
	import Fa from 'svelte-fa';

	const logbook = getLogbookContext();

	let callsignInputElement: HTMLInputElement;

	let callTimer: ReturnType<typeof setTimeout> | undefined;
	function setCallsign(v: string) {
		if (v === callsign) return;
		clearTimeout(callTimer);
		callTimer = setTimeout(() => {
			logbook.filter.callsign = v;
			callTimer = undefined;
		}, 500);
	}

	onDestroy(() => {
		if (callTimer) clearTimeout(callTimer);
	});

	const callsign = $derived(logbook.filter.callsign ?? '');
	let filterOpen = $state(false);
	const filterCount = $derived(
		[logbook.filter.band, logbook.filter.mode].filter((v) => !!v).length
	);

	const searchFilter = filteredInput(/[^A-Z0-9/%]/g);
</script>

<div class="rounded-lg bg-base-300 p-4">
	<div class="flex flex-wrap items-stretch justify-between gap-6 gap-y-4">
		<label class="input flex w-64 items-center gap-2">
			<Fa icon={faSearch} class="opacity-70" />
			<input
				type="text"
				use:uppercaseInput
				use:searchFilter
				class="min-w-0 grow font-mono placeholder:font-sans"
				placeholder="Search Callsign"
				value={callsign}
				oninput={(v) => setCallsign(v.currentTarget.value)}
				bind:this={callsignInputElement}
			/>
			<button
				class="btn btn-circle btn-ghost btn-sm -mr-2 disabled:hidden"
				onclick={() => {
					logbook.filter.callsign = '';
					callsignInputElement.focus();
				}}
				disabled={!callsign}
			>
				<Fa icon={faClose} />
			</button>
		</label>

		<label class="form-control flex-row items-center gap-2">
			<span class="label-text">Limit</span>
			<select class="select" bind:value={logbook.limit}>
				{#each [10, 25, 50, 100, 250, 500, 1000] as val}
					<option value={val}>{val}</option>
				{/each}
			</select>
		</label>

		<div class="dropdown relative w-64 {filterOpen ? 'dropdown-open' : ''}">
			<button
				class="btn relative w-full {filterOpen ? 'z-50' : ''}"
				onclick={() => (filterOpen = !filterOpen)}
			>
				<Fa icon={faFilter} />
				<span>Filter by</span>
				{#if filterCount > 0}
					<span class="badge badge-primary">{filterCount}</span>
				{/if}
				<Fa class="ml-auto transition {filterOpen ? 'rotate-180' : ''}" icon={faChevronDown} />
			</button>

			{#if filterOpen}
				<button
					aria-label="Dismiss filter"
					class="fixed inset-0 z-40 cursor-default"
					onclick={() => (filterOpen = false)}
				></button>
			{/if}

			<div
				class="dropdown-content left-0 right-0 top-0 z-40 -m-4 flex flex-col items-stretch gap-4 rounded-lg border border-white/10 bg-base-100 p-4 shadow-xl {filterOpen
					? ''
					: 'hidden'}"
			>
				<div class="btn invisible"></div>

				<label class="a form-control">
					<span class="label-text">Band</span>
					<select class="select select-bordered" bind:value={logbook.filter.band}>
						<option value={undefined}>All</option>
						{#each Band.ALL_BANDS.values() as band}
							<option value={band.name}>{band.name}</option>
						{/each}
					</select>
				</label>

				<label class="a form-control">
					<span class="label-text">Mode</span>
					<select class="select select-bordered" bind:value={logbook.filter.mode}>
						<option value={undefined}>All</option>
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
					onclick={() => {
						logbook.filter.band = undefined;
						logbook.filter.mode = undefined;
						filterOpen = false;
					}}
				>
					Reset
				</button>
			</div>
		</div>

		<button class="btn btn-circle" onclick={logbook.refresh}>
			<Fa icon={faRefresh} />
		</button>

		<!-- <button class="btn">
            <Fa icon={faSort} />
            <span>Sort</span>
        </button> -->
	</div>
</div>
