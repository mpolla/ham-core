<script lang="ts">
	import { callsignInput, getDefaultRST, numberInput } from '$lib';
	import { createQsosState } from '$lib/qsos-state.svelte';

	const state = createQsosState();

	let adifField: HTMLTextAreaElement;
</script>

<div class="overflow-x-auto rounded-md bg-[#444] p-4">
	{#if state.qsos}
		<table class="w-full">
			<thead>
				<tr>
					<th></th>
					<th>Date <span class="font-light">(YYYYMMDD)</span></th>
					<th>Time <span class="font-light">(HHmm)</span></th>
					<th>Callsign</th>
					<th>RST Sent</th>
					<th>RST Recv</th>
					<th>Band</th>
					<th>Mode</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each state.qsos as qso, i}
					{@const defaultRst = getDefaultRST(qso.mode)}
					<tr>
						<td>{i + 1}</td>
						<td>
							<input
								use:numberInput
								class="!w-44 {qso.qso_date && !/^\d{8}$/.test(qso.qso_date)
									? 'border !border-amber-300'
									: ''}"
								bind:value={qso.qso_date}
							/>
						</td>
						<td>
							<input
								use:numberInput
								class="!w-20 {qso.time_on && !/^\d{4}$/.test(qso.time_on)
									? 'border !border-amber-300'
									: ''}"
								bind:value={qso.time_on}
							/>
						</td>
						<td>
							<input
								use:callsignInput
								class="font-mono {!/^[\dA-Z/]{3,}$/.test(qso.call)
									? 'border !border-amber-300'
									: ''}"
								bind:value={qso.call}
							/>
						</td>
						<td><input class="!w-16" bind:value={qso.rst_sent} placeholder={defaultRst} /></td>
						<td><input class="!w-16" bind:value={qso.rst_rcvd} placeholder={defaultRst} /></td>
						<td>
							<select class="w-16" bind:value={qso.band}>
								{#each ['80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m', '4m', '2m', '70cm'] as band}
									<option value={band}>{band}</option>
								{/each}
							</select>
						</td>
						<td>
							<select class="w-16" bind:value={qso.mode}>
								{#each ['SSB', 'CW', 'FM', 'AM', 'RTTY'] as mode}
									<option value={mode}>{mode}</option>
								{/each}
							</select>
						</td>
						<td><button onclick={() => state.removeRow(i)}>X</button></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<div>Loading...</div>
	{/if}
</div>

<div class="mt-3 flex justify-center">
	<button class="btn" onclick={state.addRow}>+ Add row</button>
</div>

<textarea
	bind:this={adifField}
	readonly
	value={state.adifString}
	class="mt-6 h-60 w-full overflow-x-auto text-nowrap rounded-md bg-[#444] p-2 text-sm"
></textarea>

<div class="mt-3 flex justify-center gap-2">
	<button
		class="btn"
		onclick={() => {
			navigator.clipboard.writeText(state.adifString);
			adifField.select();
			adifField.setSelectionRange(0, 99999);
		}}
	>
		Copy to clipboard
	</button>
</div>

<style lang="postcss">
	input,
	select {
		@apply w-auto rounded-md border-gray-400 bg-[#444] px-2 py-1 text-center;
	}

	td,
	th {
		@apply border-gray-400 px-2 py-1 text-center align-middle;
	}

	td {
		@apply border-t;
	}

	td:not(:first-child),
	th:not(:first-child) {
		@apply border-l;
	}
</style>
