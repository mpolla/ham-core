<script lang="ts">
	import { onMount } from 'svelte';
	import { dxccEntities, findDxcc, type DxccEntity } from 'fast-dxcc';
	import { advancedCallsignRe } from '$lib/callsign';
	import { callsignInput, gridsquareInput } from '$lib/helpers/input-helpers';
	import TimeInput from '$lib/components/inputs/time-input.svelte';
	import RstInput from '$lib/components/inputs/rst-input.svelte';
	import FrequencyInput from '$lib/components/inputs/frequency-input.svelte';
	import { Mode } from '$lib/models/mode';
	import { Band } from '$lib/models/band';
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';
	import {
		getDistanceBetweenLocators,
		locatorRegex,
		locatorToLongLat
	} from '$lib/utils/locator-util';
	import { getDistance } from '$lib/utils/geo-util';
	import type { IQso } from '$lib/supabase';

	const logbook = getLogbookContext();

	let callsignInputElement = $state<HTMLInputElement>();
	let callsign = $state('');

	let rstSent = $state('');
	let rstRcv = $state('');

	let date = $state('');
	let time = $state('');
	let dateTimeTimer: ReturnType<typeof setInterval> | null = $state(null);

	let mode = $state('');
	let freq = $state('');
	let band: string | undefined = $state('');

	let power = $state('');
	let gridsquare = $state('');

	function getDist(gridsquare: string, dxcc: DxccEntity | undefined) {
		if (!selectedLog?.grid) return;
		if (gridsquareValid) {
			return getDistanceBetweenLocators(gridsquare, selectedLog.grid);
		}
		if (dxcc?.lat && dxcc.long) {
			const [long, lat] = locatorToLongLat(selectedLog.grid, true);
			return getDistance(lat, long, dxcc.lat!, dxcc.long!);
		}
	}

	function submit() {
		if (!canSubmit) return;
		logbook
			.insert({
				log_id: selectedLog?.id,
				datetime: `${date}T${time.slice(0, 2)}:${time.slice(2, 4)}Z`,
				call: callsign,
				mode,
				frequency: parseFloat(freq) * 1000000,
				band: band || null,
				rst_sent: rstSent,
				rst_rcvd: rstRcv,
				dxcc: dxcc?.dxcc,
				country: dxcc?.name || null,
				power: power ? parseInt(power) : null,
				gridsquare: gridsquare || null,
				cont: dxcc?.cont || null,
				other: {
					CQZ: dxcc?.cqz,
					ITUZ: dxcc?.ituz
				}
			})
			.then((r) => {
				if (r) clear();
			});
	}

	function setDateTimeNow() {
		const now = new Date();
		date = now.toISOString().slice(0, 10);
		time = `${now.getUTCHours().toString().padStart(2, '0')}${now.getUTCMinutes().toString().padStart(2, '0')}`;
	}

	function toggleDateTimeTimer() {
		if (dateTimeTimer) {
			clearInterval(dateTimeTimer);
			dateTimeTimer = null;
		} else {
			setDateTimeNow();
			dateTimeTimer = setInterval(setDateTimeNow, 1000);
		}
	}

	function clear() {
		isPure = true;
		callsign = '';
		rstSent = '';
		rstRcv = '';
		gridsquare = '';
		if (!dateTimeTimer) toggleDateTimeTimer();
		callsignInputElement?.focus();
	}

	let isPure = $state(true);

	function getFreq(qso: IQso) {
		const f = qso.frequency / 1000000;
		const ff = f.toFixed(3);
		const full = f.toFixed(6).replace(/0+$/, '');
		return full.length > ff.length ? full : ff;
	}

	onMount(() => {
		callsignInputElement?.focus();
		setDateTimeNow();
		toggleDateTimeTimer();
	});
	const selectedLog = $derived(logbook.selectedLog);
	let isTimeValid = $derived(time.length === 4 && +time.slice(0, 2) < 24 && +time.slice(2) < 60);
	let dxcc = $state<DxccEntity>();
	$effect(() => {
		dxcc = findDxcc(callsign)?.entity;
	});
	let isValidCall = $derived(!!callsign.match(advancedCallsignRe));
	let gridsquareValid = $derived(gridsquare.match(locatorRegex));
	let distance = $derived(getDist(gridsquare, dxcc));
	let lastQso = $derived(logbook.qsos[0]);
	$effect(() => {
		if (isPure && lastQso) {
			mode = lastQso.mode;
			freq = getFreq(lastQso);
			band = lastQso.band ?? undefined;
			power = lastQso.power?.toString() ?? '';
		}
	});
	let canSubmit = $derived(callsign.length >= 3 && freq && !!selectedLog);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
	onsubmit={(e) => {
		e.preventDefault();
		submit();
	}}
	onbeforeinput={() => (isPure = false)}
	oninput={() => (isPure = false)}
	onkeydown={({ key, altKey }) => key === 'w' && altKey && clear()}
	class="flex min-w-80 flex-col gap-6 rounded-xl bg-base-300 p-6 @container"
>
	<div class="flex items-start gap-4">
		<div class="font-light">New QSO</div>
		{#if selectedLog}
			<h1 class="mx-auto text-2xl font-semibold">
				{selectedLog.call}
			</h1>
		{/if}
		<button type="button" class="btn btn-xs" onclick={clear} disabled={isPure}>Clear</button>
	</div>

	<div class="flex flex-wrap justify-start gap-4">
		<input
			type="date"
			bind:value={date}
			class="input w-full max-w-44 disabled:input-sm"
			placeholder="Date"
			disabled={!!dateTimeTimer}
		/>
		<TimeInput
			label="Time"
			bind:value={time}
			class={`input w-full max-w-24 disabled:input-sm ${isTimeValid ? '' : 'input-error'}`}
			disabled={!!dateTimeTimer}
		/>
		{#if !dateTimeTimer}
			<button class="btn btn-outline btn-xs my-auto" type="button" onclick={setDateTimeNow}>
				Now
			</button>
		{/if}
		<button class="btn btn-outline btn-xs my-auto" type="button" onclick={toggleDateTimeTimer}>
			{#if dateTimeTimer}Manual{:else}Auto{/if} time
		</button>
	</div>

	<div class="flex flex-col gap-4 @xl:flex-row">
		<div class="flex gap-4">
			<select
				class="select flex-1"
				bind:value={band}
				onchange={() => {
					const b = Band.ALL_BANDS.get(band ?? '');
					if (!b) return;
					const f = parseFloat(freq) * 1000000;
					if (isNaN(f) || f < b.lower || f > b.upper) {
						freq = (b.lower / 1000000).toFixed(3);
					}
				}}
			>
				{#each Band.ALL_BANDS.values() as band}
					<option value={band.name}>{band.name}</option>
				{/each}
			</select>

			<FrequencyInput
				bind:value={freq}
				onChange={() => (band = Band.getBand(parseFloat(freq) * 1000000)?.name)}
				class="input flex-[2] @xl:max-w-44"
			/>
		</div>

		<div class="flex flex-wrap gap-4">
			<select class="select flex-1" bind:value={mode}>
				<optgroup label="Favorites">
					<option value="SSB">SSB</option>
					<option value="CW">CW</option>
					<option value="FT8">FT8</option>
				</optgroup>
				<optgroup label="All">
					{#each Mode.ALL_MODES.values() as mode}
						<option value={mode.name}>{mode.name}</option>
						{#each mode.subModes as subMode}
							<option value={subMode.name}>&nbsp;&nbsp;&nbsp;&nbsp;{subMode.name}</option>
						{/each}
					{/each}
				</optgroup>
			</select>

			<label class="input flex w-full min-w-32 flex-1 items-center gap-2 @xl:max-w-32">
				<input type="text" class="w-full" placeholder="Power" bind:value={power} />
				<div class="select-none">W</div>
			</label>
		</div>
	</div>

	<div class="flex flex-col gap-4 @xl:flex-row">
		<input
			type="text"
			use:callsignInput
			bind:this={callsignInputElement}
			bind:value={callsign}
			class={`input w-full font-mono placeholder:font-sans @xl:w-80 ${isValidCall ? 'input-success' : ''}`}
			placeholder="Callsign"
		/>

		<div class="flex gap-4">
			<RstInput class="input w-full @xl:w-36" label="RST Sent" {mode} bind:value={rstSent} />
			<RstInput class="input w-full @xl:w-36" label="RST Rcv" {mode} bind:value={rstRcv} />
		</div>
	</div>

	<input
		type="text"
		use:gridsquareInput
		bind:value={gridsquare}
		class={`input @xl:max-w-xs ${gridsquare && !gridsquareValid ? 'input-error' : ''}`}
		placeholder="Gridsquare"
	/>

	<div class="flex items-end gap-4">
		<div class="flex flex-1 flex-wrap items-end gap-4">
			<select
				class="select select-sm max-w-60"
				value={dxcc?.id ?? 0}
				onchange={(e) => (dxcc = dxccEntities.get(+e.currentTarget.value))}
			>
				<option value="0"></option>
				{#each [...dxccEntities.values()].sort((a, b) => a.name.localeCompare(b.name)) as dxcc}
					<option value={dxcc.id}>{dxcc.name}</option>
				{/each}
			</select>

			<div class="flex gap-4">
				{#if dxcc}
					<div>{dxcc.cont}</div>
					<div><span class="text-xs">CQ</span> {dxcc.cqz}</div>
					<div><span class="text-xs">ITU</span> {dxcc.ituz}</div>
				{/if}
				{#if distance}
					<div class={gridsquareValid ? '' : 'opacity-70'}>
						{(distance / 1000).toFixed(1)} <span class="text-xs">km</span>
					</div>
				{/if}
			</div>
		</div>

		<div class="ml-auto flex items-center gap-4">
			{#if !selectedLog}
				<div class="text-error">Please select logbook</div>
			{/if}
			<button class="btn btn-primary" disabled={!canSubmit}>Save</button>
		</div>
	</div>
</form>
