<script lang="ts">
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';
	import type { IQso } from '$lib/supabase';
	import { getDistanceBetweenLocators } from '$lib/utils/locator-util';
	import Fa from 'svelte-fa';
	import BandBadge from './band-badge.svelte';
	import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

	const logbookState = getLogbookContext();

	interface Props {
		qso: IQso;
		onEdit?: () => void;
		onDelete?: () => void;
	}

	let { qso, onEdit, onDelete }: Props = $props();

	const log = $derived(logbookState.selectedLog);

	function formatDT(dt: string): string {
		const dtp = new Date(dt).toISOString();
		const date = dtp.slice(0, 10);
		const time = dtp.slice(11, 19);
		return `${date} ${time}`;
	}

	function formatFrequency(frequency: number): string {
		return frequency / 1_000_000 + ' MHz';
	}
</script>

<div class="flex flex-col gap-8">
	<table class="table [&_td]:text-center">
		<tbody>
			<tr>
				<th>Date & Time</th>
				<td colspan="2">
					<span>{formatDT(qso.datetime)}</span>
					<span class="text-xs opacity-80">UTC</span>
				</td>
			</tr>
			<tr>
				<th>Call</th>
				<td>{qso.call}</td>
				<td>{log?.call}</td>
			</tr>
			<tr>
				<th>Country</th>
				<td>{qso.country}</td>
				<td>{log?.country}</td>
			</tr>
			<tr>
				<th>Mode</th>
				<td colspan="2">{qso.mode}</td>
			</tr>
			<tr>
				<th>Frequency</th>
				<td colspan="2">
					<span class="mr-2">{formatFrequency(qso.frequency)}</span>
					<BandBadge {qso} />
				</td>
			</tr>
			<tr>
				<th>Report</th>
				<td><span class="mr-2 text-xs opacity-80">RECEIVED</span> {qso.rst_rcvd}</td>
				<td><span class="mr-2 text-xs opacity-80">SENT</span> {qso.rst_sent}</td>
			</tr>
			{#if qso.power}
				<tr>
					<th>Power</th>
					<td></td>
					<td>{qso.power} W</td>
				</tr>
			{/if}
			{#if qso.gridsquare || log?.grid}
				<tr>
					<th>Gridsquare</th>
					<td>{qso.gridsquare ?? ''}</td>
					<td>{log?.grid ?? ''}</td>
				</tr>
			{/if}
			{#if qso.gridsquare && log?.grid}
				{@const dist = getDistanceBetweenLocators(qso.gridsquare, log.grid) / 1000}
				<tr>
					<th>Distance</th>
					<td colspan="2">{dist.toFixed(0)} km</td>
				</tr>
			{/if}
		</tbody>
	</table>

	<div>
		<h2 class="mb-2 text-sm font-medium">Actions</h2>
		<div class="flex flex-row gap-2">
			<button class="btn btn-primary btn-sm" disabled={!onEdit} onclick={onEdit}>
				<Fa icon={faEdit} />
				<span>Edit</span>
			</button>
			<button class="btn btn-error btn-sm" disabled={!onDelete} onclick={onDelete}>
				<Fa icon={faTrash} />
				<span>Delete</span>
			</button>
		</div>
	</div>

	<div>
		{#if qso.other}
			<h2 class="mb-3 text-sm font-medium">Other fields</h2>
			<table class="table table-xs">
				<thead>
					<tr>
						<th class="w-1/2">Field</th>
						<th class="w-1/2">Value</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.entries(qso.other ?? {}) as [key, value]}
						<tr>
							<th>{key}</th>
							<td>{value}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	<table class="table table-xs">
		<thead>
			<tr>
				<th>QSO ID</th>
				<th>Log ID</th>
				<th>Created At</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>{qso.id}</td>
				<td>{qso.log_id}</td>
				<td>{formatDT(qso.created_at)}</td>
			</tr>
		</tbody>
	</table>
</div>
