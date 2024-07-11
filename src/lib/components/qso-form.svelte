<script lang="ts">
	import { onMount } from 'svelte';
	import { findDxcc } from 'fast-dxcc';
	import { advancedCallsignRe } from '$lib/callsign';
	import { filteredInput, uppercaseInput } from '$lib/helpers/input-helpers';

	let callsignInput: HTMLInputElement;
	let callsign = '';
	const callsignFilter = filteredInput(/[^A-Z\d/]/gi);

	$: dxcc = findDxcc(callsign);
	$: isValidCall = !!callsign.match(advancedCallsignRe);

	onMount(() => {
		callsignInput.focus();
	});
</script>

<div class="flex flex-col gap-6 rounded-xl bg-base-300 p-6">
	<h1 class="text-2xl font-light">New QSO</h1>

	<div class="flex gap-4">
		<input type="text" class="input input-bordered w-full" placeholder="Date" />
		<input type="text" class="input input-bordered w-full" placeholder="Time" />
	</div>

	<div class="flex gap-4">
		<div class="flex-[2]">
			<input
				type="text"
				use:uppercaseInput
				use:callsignFilter
				bind:this={callsignInput}
				bind:value={callsign}
				class={`input input-bordered w-full ${isValidCall ? 'input-success' : ''}`}
			/>

			<div class="pl-4 pt-1">
				{#if dxcc}
					{dxcc?.entity.name}
				{:else}
					&ZeroWidthSpace;
				{/if}
			</div>
		</div>

		<div class="flex-1">
			<input type="text" class="input input-bordered w-full" placeholder="RST Sent" />
		</div>

		<div class="flex-1">
			<input type="text" class="input input-bordered w-full" placeholder="RST Received" />
		</div>
	</div>

	<div class="flex gap-4">
		<select class="select select-bordered">
			<option>SSB</option>
			<option>CW</option>
			<option>FT8</option>
			<option>RTTY</option>
		</select>

		<input type="text" class="input input-bordered w-full" placeholder="Frequency" />
	</div>

	<button class="btn btn-primary ml-auto">Save</button>
</div>
