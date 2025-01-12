<script lang="ts">
	import { callsignInput, getDefaultRST, numberInput } from '$lib';
	import DownloadButton from '$lib/components/download-button.svelte';
	import { createQsosState } from '$lib/qsos-state.svelte';

	const state = createQsosState();

	let adifField: HTMLTextAreaElement;
</script>

<div class="overflow-x-auto rounded-md bg-base-200 p-4">
	{#if state.qsos}
		<table class="w-full">
			<thead>
				<tr>
					<th></th>
					<th class="min-w-44">Date <span class="font-light">(YYYYMMDD)</span></th>
					<th class="min-w-28">Time <span class="font-light">(HHmm)</span></th>
					<th class="min-w-44">Callsign</th>
					<th class="min-w-24">RST Sent</th>
					<th class="min-w-24">RST Recv</th>
					<th class="min-w-28">Band</th>
					<th class="min-w-28">Mode</th>
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
								class={qso.qso_date && !/^\d{8}$/.test(qso.qso_date)
									? 'border !border-amber-300'
									: ''}
								bind:value={qso.qso_date}
							/>
						</td>
						<td>
							<input
								use:numberInput
								class={qso.time_on && !/^\d{4}$/.test(qso.time_on)
									? 'border !border-amber-300'
									: ''}
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
						<td><input bind:value={qso.rst_sent} placeholder={defaultRst} /></td>
						<td><input bind:value={qso.rst_rcvd} placeholder={defaultRst} /></td>
						<td>
							<select bind:value={qso.band}>
								{#each ['80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m', '4m', '2m', '70cm'] as band}
									<option value={band}>{band}</option>
								{/each}
							</select>
						</td>
						<td>
							<select bind:value={qso.mode}>
								{#each ['SSB', 'CW', 'FM', 'AM', 'RTTY'] as mode}
									<option value={mode}>{mode}</option>
								{/each}
							</select>
						</td>
						<td>
							<button class="btn btn-circle btn-xs" onclick={() => state.removeRow(i)}>X</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<div>Loading...</div>
	{/if}
</div>

<div class="mt-3 flex justify-center">
	<button
		class="btn"
		onclick={() => {
			if (confirm('Are you sure you want to clear all qsos?')) {
				state.clearAll();
			}
		}}
	>
		Clear all
	</button>
	<button class="btn" onclick={state.addRow}>+ Add row</button>
</div>

<textarea
	bind:this={adifField}
	readonly
	value={state.adifString}
	class="textarea mt-6 h-60 w-full overflow-x-auto text-nowrap bg-base-200"
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
	<DownloadButton class="btn" content={state.adifString} filename="file.adi">
		Download ADIF
	</DownloadButton>
</div>

<style lang="postcss">
	input {
		@apply input input-sm bg-transparent text-center;
	}

	select {
		@apply select select-sm bg-transparent;
	}

	td > input,
	td > select {
		@apply w-full;
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
