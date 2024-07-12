<script lang="ts">
	import type { Qso } from '$lib/models/qso';

	export let qsos: Qso[] = [];

	function formatDT(dt: string): string {
		const dtp = new Date(dt).toISOString();
		const date = dtp.slice(0, 10);
		const time = dtp.slice(11, 16);
		return `${date} ${time}`;
	}
</script>

<div class="overflow-x-auto">
	<table class="table">
		<thead>
			<tr>
				<th>Date & Time</th>
				<th>Call</th>
				<th>Mode</th>
				<th>Frequency</th>
				<th>Country</th>
			</tr>
		</thead>
		<tbody>
			{#each qsos as qso}
				<tr>
					<td>{formatDT(qso.datetime)}</td>
					<td>{qso.call}</td>
					<td>{qso.mode}</td>
					<td>{(qso.frequency / 1e6).toFixed(3)}</td>
					<td>{qso.country}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
