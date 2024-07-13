<script lang="ts">
	import { onMount } from 'svelte';
	import { findDxcc } from 'fast-dxcc';
	import { advancedCallsignRe } from '$lib/callsign';
	import { filteredInput, uppercaseInput } from '$lib/helpers/input-helpers';
	import { Mode } from '$lib/models/mode';
	import RstInput from './inputs/rst-input.svelte';
	import FrequencyInput from './inputs/frequency-input.svelte';
	import TimeInput from './inputs/time-input.svelte';

	let callsignInput: HTMLInputElement;
	let callsign = '';
	const callsignFilter = filteredInput(/[^A-Z\d/]/gi);

	let date = '';
	let time = '';

	$: isTimeValid = time.length === 4 && +time.slice(0, 2) < 24 && +time.slice(2) < 60;

	$: defaultRst = ((): [string, number, number] | [] => {
		switch (mode?.name) {
			case 'SSB':
			case 'LSB':
			case 'USB':
				return ['59', 1, 2];
			case 'CW':
			case 'RTTY':
				return ['599', 1, 2];
			default:
				return [];
		}
	})();

	let mode = Mode.ALL_MODES.get('SSB');
	let freq = '7.150';

	$: dxcc = findDxcc(callsign);
	$: isValidCall = !!callsign.match(advancedCallsignRe);

	function setDateTimeNow() {
		const now = new Date();
		date = now.toISOString().slice(0, 10);
		time = `${now.getUTCHours().toString().padStart(2, '0')}${now.getUTCMinutes().toString().padStart(2, '0')}`;
	}

	onMount(() => {
		callsignInput.focus();
		setDateTimeNow();
	});
</script>

<div class="flex flex-col gap-6 rounded-xl bg-base-300 p-6">
	<h1 class="text-2xl font-light">New QSO</h1>

	<div class="flex justify-start gap-4">
		<input type="date" bind:value={date} class="input w-full max-w-44" placeholder="Date" />
		<TimeInput
			label="Time"
			bind:value={time}
			class={`input w-full max-w-24 ${isTimeValid ? '' : 'input-error'}`}
		/>
		<button class="btn btn-outline btn-xs my-auto" on:click={setDateTimeNow}>Now</button>
	</div>

	<div class="flex flex-col gap-4 sm:flex-row">
		<div class=" max-w-2xl flex-grow-[2]">
			<input
				type="text"
				use:uppercaseInput
				use:callsignFilter
				bind:this={callsignInput}
				bind:value={callsign}
				class={`input w-full ${isValidCall ? 'input-success' : ''}`}
				placeholder="Callsign"
			/>
		</div>

		<div class="flex max-w-2xl flex-grow gap-4">
			<RstInput
				defaultValue={defaultRst[0]}
				defaultStartSel={defaultRst[1]}
				defaultEndSel={defaultRst[2]}
				class="input"
				label="RST Sent"
			/>
			<RstInput
				defaultValue={defaultRst[0]}
				defaultStartSel={defaultRst[1]}
				defaultEndSel={defaultRst[2]}
				class="input"
				label="RST Rcv"
			/>
		</div>
	</div>

	<div class="flex gap-4">
		<select class="select" bind:value={mode}>
			{#each Mode.ALL_MODES.values() as mode}
				<option value={mode}>{mode.name}</option>
				{#each mode.subModes as subMode}
					<option value={subMode}>&nbsp;&nbsp;&nbsp;&nbsp;{subMode.name}</option>
				{/each}
			{/each}
		</select>

		<FrequencyInput bind:value={freq} class="input max-w-44" />

		<label class="input flex w-full max-w-32 items-center gap-2">
			<input type="text" class="w-full" placeholder="Power" />
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
		<button class="btn btn-primary ml-auto">Save</button>
	</div>
</div>
