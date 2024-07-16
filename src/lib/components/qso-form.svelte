<script lang="ts">
	import { onMount } from 'svelte';
	import { findDxcc } from 'fast-dxcc';
	import { advancedCallsignRe } from '$lib/callsign';
	import { filteredInput, uppercaseInput } from '$lib/helpers/input-helpers';
	import { Mode } from '$lib/models/mode';
	import RstInput from './inputs/rst-input.svelte';
	import FrequencyInput from './inputs/frequency-input.svelte';
	import TimeInput from './inputs/time-input.svelte';
	import { Band } from '$lib/models/band';
	import { insertQso, logbookStore } from '$lib/stores/logbook-store';

	export let onCallsignChange: ((callsign: string) => void) | undefined = undefined;

	let callsignInput: HTMLInputElement;
	let callsign = '';
	const callsignFilter = filteredInput(/[^A-Z\d/]/gi);

	let rstSent = '';
	let rstRcv = '';

	let date = '';
	let time = '';
	let dateTimeTimer: ReturnType<typeof setInterval> | null = null;

	$: isTimeValid = time.length === 4 && +time.slice(0, 2) < 24 && +time.slice(2) < 60;

	let mode = 'SSB';
	let freq = '7.150';
	let band: string | undefined = '40m';

	let power = '';

	$: dxcc = findDxcc(callsign);
	$: isValidCall = !!callsign.match(advancedCallsignRe);

	function submit() {
		if (callsign.length < 3 || !freq) return;
		insertQso({
			log_id: $logbookStore.params.logId,
			datetime: `${date}T${time.slice(0, 2)}:${time.slice(2, 4)}Z`,
			call: callsign,
			mode,
			frequency: parseFloat(freq) * 1000000,
			band: band ?? null,
			rst_sent: rstSent,
			rst_rcvd: rstRcv,
			dxcc: dxcc?.entity.dxcc ?? 0,
			country: dxcc?.entity.name ?? null,
			power: power ? parseInt(power) : null
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
		callsign = '';
		rstSent = '';
		rstRcv = '';
		if (!dateTimeTimer) setDateTimeNow();
		callsignInput.focus();
		onCallsignChange?.(callsign);
	}

	onMount(() => {
		callsignInput.focus();
		setDateTimeNow();
		toggleDateTimeTimer();
	});
</script>

<form on:submit|preventDefault={submit} class="flex flex-col gap-6 rounded-xl bg-base-300 p-6">
	<div class="flex items-start gap-4">
		<h1 class="mr-auto text-2xl font-light">New QSO</h1>
		<button type="button" class="btn btn-outline btn-xs" on:click={clear}>Clear</button>
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

	<div class="flex flex-col gap-4 sm:flex-row">
		<input
			type="text"
			use:uppercaseInput
			use:callsignFilter
			bind:this={callsignInput}
			bind:value={callsign}
			on:input={() => onCallsignChange?.(callsign)}
			class={`input w-full font-mono placeholder:font-sans sm:w-80 ${isValidCall ? 'input-success' : ''}`}
			placeholder="Callsign"
		/>

		<div class="flex gap-4">
			<RstInput class="input w-full sm:w-36" label="RST Sent" {mode} bind:value={rstSent} />
			<RstInput class="input w-full sm:w-36" label="RST Rcv" {mode} bind:value={rstRcv} />
		</div>
	</div>

	<div class="flex flex-wrap gap-4">
		<select
			class="select"
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
			class="input max-w-44"
		/>

		<select class="select" bind:value={mode}>
			{#each Mode.ALL_MODES.values() as mode}
				<option value={mode.name}>{mode.name}</option>
				{#each mode.subModes as subMode}
					<option value={subMode.name}>&nbsp;&nbsp;&nbsp;&nbsp;{subMode.name}</option>
				{/each}
			{/each}
		</select>

		<label class="input flex w-full max-w-32 items-center gap-2">
			<input type="text" class="w-full" placeholder="Power" bind:value={power} />
			<div class="select-none">W</div>
		</label>
	</div>

	<div class="flex items-end gap-4">
		{#if dxcc}
			<div>{dxcc.entity.name}</div>
			<div>{dxcc.entity.cont}</div>
			<div><span class="text-xs">CQ</span> {dxcc.entity.cqz}</div>
			<div><span class="text-xs">ITU</span> {dxcc.entity.ituz}</div>
		{/if}
		<button type="submit" on:click|preventDefault={submit} class="btn btn-primary ml-auto">
			Save
		</button>
	</div>
</form>
