<script lang="ts">
	import { parseAdifDateTime } from '@ham-core/adif';

	type Qso = { [key: string]: string | undefined };

	let { qsos }: { qsos: Qso[] } = $props();

	let qsoDetails = $state<Qso>();
</script>

<div class="overflow-x-auto">
	<table class="table w-full">
		<thead>
			<tr>
				<th></th>
				<th>Date Time</th>
				<th>Call</th>
				<th>Band / Freq</th>
				<th>Mode</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each qsos as qso, i}
				<tr>
					<td>{i + 1}</td>
					<td>{parseAdifDateTime(qso)?.toISOString().slice(0, 16).replace('T', ' ')}</td>
					<td>{qso.CALL}</td>
					<td>{qso.FREQ ?? qso.BAND}</td>
					<td>{qso.MODE}</td>
					<td>
						<button class="btn btn-xs" onclick={() => (qsoDetails = qso)}>Details</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if qsoDetails}
	<div class="fixed inset-0 z-30 flex items-center justify-center">
		<button
			aria-label="Close modal"
			class="absolute inset-0 cursor-default bg-black/80"
			onclick={() => (qsoDetails = undefined)}
		></button>

		<div class="relative m-10 max-h-[90vh] min-w-[60%] overflow-y-auto rounded-lg bg-base-100 p-10">
			<h1 class="mb-8 text-2xl">QSO Details</h1>

			<table class="table w-full">
				<thead>
					<tr>
						<th>Field</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.entries(qsoDetails) as [key, value]}
						<tr>
							<th>{key}</th>
							<td>{value}</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<button
				class="btn btn-circle btn-ghost btn-sm absolute right-4 top-4"
				onclick={() => (qsoDetails = undefined)}
			>
				X
			</button>
		</div>
	</div>
{/if}
