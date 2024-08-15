<script lang="ts">
	import { onMount } from 'svelte';
	import { findDxcc, type DxccEntity } from 'fast-dxcc';
	import { advancedCallsignRe } from '$lib/callsign';
	import { callsignInput, gridsquareInput } from '$lib/helpers/input-helpers';
	import TimeInput from '$lib/components/inputs/time-input.svelte';
	import RstInput from '$lib/components/inputs/rst-input.svelte';
	import FrequencyInput from '$lib/components/inputs/frequency-input.svelte';
	import { Mode } from '$lib/models/mode';
	import { Band } from '$lib/models/band';
	import { insertQso, logbookStore } from '$lib/stores/logbook-store';
	import {
		getDistanceBetweenLocators,
		locatorRegex,
		locatorToLongLat
	} from '$lib/utils/locator-util';
	import { getDistance } from '$lib/utils/geo-util';
	import { logsStore } from '$lib/stores/logs-store';

	$: selectedLog = $logbookStore.params.logId;
	$: log = $logsStore?.find((l) => l.id === selectedLog);

	let callsignInputElement: HTMLInputElement;
	let callsign = '';

	let rstSent = '';
	let rstRcv = '';

	let date = '';
	let time = '';
	let dateTimeTimer: ReturnType<typeof setInterval> | null = null;

	$: isTimeValid = time.length === 4 && +time.slice(0, 2) < 24 && +time.slice(2) < 60;

	let mode = '';
	let freq = '';
	let band: string | undefined = '';

	let power = '';
	let gridsquare = '';

	$: dxcc = findDxcc(callsign)?.entity;
	$: isValidCall = !!callsign.match(advancedCallsignRe);

	$: gridsquareValid = gridsquare.match(locatorRegex);
	$: distance = getDist(gridsquare, dxcc);

	function getDist(gridsquare: string, dxcc: DxccEntity | undefined) {
		if (!log?.grid) return;
		if (gridsquareValid) {
			return getDistanceBetweenLocators(gridsquare, log.grid);
		}
		if (dxcc?.lat && dxcc.long) {
			const [long, lat] = locatorToLongLat(log.grid, true);
			return getDistance(lat, long, dxcc.lat!, dxcc.long!);
		}
	}

	$: canSubmit = callsign.length >= 3 && freq && !!selectedLog;

	function submit() {
		if (!canSubmit) return;
		insertQso({
			log_id: selectedLog,
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
		}).then((r) => {
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
		callsignInputElement.focus();
	}

	let isPure = true;
	$: lastQso = $logbookStore.result?.qsos[0];
	$: if (isPure && lastQso) {
		mode = lastQso.mode;
		freq = (lastQso.frequency / 1000000).toFixed(3);
		band = lastQso.band ?? undefined;
		power = lastQso.power?.toString() ?? '';
	}

	onMount(() => {
		callsignInputElement.focus();
		setDateTimeNow();
		toggleDateTimeTimer();
	});
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<form
	on:submit|preventDefault={submit}
	on:beforeinput={() => (isPure = false)}
	on:input={() => (isPure = false)}
	on:keydown={({ key, altKey }) => key === 'w' && altKey && clear()}
	class="flex min-w-80 flex-col gap-6 rounded-xl bg-base-300 p-6 @container"
>
	<div class="flex items-start gap-4">
		<h1 class="mr-auto text-2xl font-light">New QSO</h1>
		<button type="button" class="btn btn-xs" on:click={clear} disabled={isPure}>Clear</button>
	</div>

	<div class="flex justify-start gap-4">
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
			<button class="btn btn-outline btn-xs my-auto" type="button" on:click={setDateTimeNow}>
				Now
			</button>
		{/if}
		<button class="btn btn-outline btn-xs my-auto" type="button" on:click={toggleDateTimeTimer}>
			{#if dateTimeTimer}Manual{:else}Auto{/if} time
		</button>
	</div>

	<div class="flex flex-col gap-4 @xl:flex-row">
		<div class="flex gap-4">
			<select
				class="select flex-1"
				bind:value={band}
				on:change={() => {
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

		<div class="flex gap-4">
			<select class="select flex-1" bind:value={mode}>
				{#each Mode.ALL_MODES.values() as mode}
					<option value={mode.name}>{mode.name}</option>
					{#each mode.subModes as subMode}
						<option value={subMode.name}>&nbsp;&nbsp;&nbsp;&nbsp;{subMode.name}</option>
					{/each}
				{/each}
			</select>

			<label class="input flex w-full flex-1 items-center gap-2 @xl:max-w-32">
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
		{#if dxcc}
			<div>{dxcc.name}</div>
			<div>{dxcc.cont}</div>
			<div><span class="text-xs">CQ</span> {dxcc.cqz}</div>
			<div><span class="text-xs">ITU</span> {dxcc.ituz}</div>
		{/if}
		{#if distance}
			<div class={gridsquareValid ? '' : 'opacity-70'}>
				{(distance / 1000).toFixed(1)} <span class="text-xs">km</span>
			</div>
		{/if}
		<div class="ml-auto flex items-center gap-4">
			{#if !selectedLog}
				<div class="text-error">Please select logbook</div>
			{/if}
			<button
				type="submit"
				on:click|preventDefault={submit}
				class="btn btn-primary"
				disabled={!canSubmit}
			>
				Save
			</button>
		</div>
	</div>
</form>
