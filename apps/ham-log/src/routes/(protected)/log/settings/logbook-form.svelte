<script lang="ts">
	import { callsignInput, gridsquareInput, numberInput } from '$lib/helpers/input-helpers';
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';
	import { getLogsContext } from '$lib/states/logs-state.svelte';
	import { locatorRegex } from '$lib/utils/locator-util';
	import { dxccEntities, findDxcc } from '@ham-core/fast-dxcc';
	import { createLogbookFields } from './logbook-fields.svelte';
	import { supabase } from '$lib/supabase';

	const logs = getLogsContext();
	const logbook = getLogbookContext();

	let { mode }: { mode: 'new' | 'edit' } = $props();

	const f = createLogbookFields(mode === 'new' ? undefined : logbook.selectedLog);

	const parsedDxcc = $derived(findDxcc(f.call)?.entity);
	const dxccs = [...dxccEntities.values()].sort((a, b) => a.name.localeCompare(b.name));

	const dxcc = $derived(dxccEntities.get(f.dxcc));

	const canSave = $derived(f.call && f.dxcc && !f.isPure);

	const data = $derived(
		canSave
			? {
					call: f.call,
					title: f.title || null,
					dxcc: dxcc!.dxcc!,
					country: dxcc!.name,
					cqz: +f.cqz || null,
					ituz: +f.ituz || null,
					name: f.name || null,
					grid: f.grid || null
				}
			: undefined
	);

	function create() {
		if (!canSave) return;
		supabase
			.from('log')
			.insert(data!)
			.select()
			.single()
			.then((res) => {
				if (res.error) return console.error(res.error);
				logs.refresh();
				logbook.logId = res.data!.id;
				history.back();
			});
	}

	function update() {
		if (!canSave) return;
		supabase
			.from('log')
			.update(data!)
			.eq('id', logbook.logId!)
			.select()
			.single()
			.then((res) => {
				if (res.error) return console.error(res.error);
				logs.refresh();
				history.back();
			});
	}
</script>

<div class="flex flex-col gap-4">
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		<label class="form-control col-span-2">
			<div class="label">
				<span class="label-text">Callsign</span>
			</div>
			<input
				type="text"
				class="input input-bordered font-mono placeholder:font-sans"
				use:callsignInput
				bind:value={f.call}
			/>
		</label>
		<label class="form-control col-span-2">
			<div class="label">
				<span class="label-text">Title</span>
			</div>
			<input type="text" class="input input-bordered" bind:value={f.title} />
		</label>

		<label class="form-control col-span-2">
			<div class="label">
				<span class="label-text">Country</span>
			</div>
			<select
				class="select select-bordered {dxcc && parsedDxcc && parsedDxcc.id !== dxcc.id
					? 'select-warning'
					: ''}"
				bind:value={f.dxcc}
			>
				<option disabled selected>Select Country</option>
				{#each dxccs as { id, name }}
					<option value={id}>{name}</option>
				{/each}
			</select>
		</label>

		<label class="form-control">
			<div class="label">
				<span class="label-text">CQ Zone</span>
			</div>
			<input
				type="text"
				class="input input-bordered {f.cqz && dxcc && +f.cqz !== dxcc.cqz ? 'input-warning' : ''}"
				use:numberInput
				bind:value={f.cqz}
			/>
		</label>
		<label class="form-control">
			<div class="label">
				<span class="label-text">ITU Zone</span>
			</div>
			<input
				type="text"
				class="input input-bordered {f.ituz && dxcc && +f.ituz !== dxcc.ituz
					? 'input-warning'
					: ''}"
				use:numberInput
				bind:value={f.ituz}
			/>
		</label>

		<label class="form-control col-span-2">
			<div class="label">
				<span class="label-text">Name</span>
			</div>
			<input type="text" class="input input-bordered" bind:value={f.name} />
		</label>
		<label class="form-control col-span-2">
			<div class="label">
				<span class="label-text">Gridsquare</span>
			</div>
			<input
				type="text"
				class="input input-bordered {f.grid && !f.grid.match(locatorRegex) ? 'input-error' : ''}"
				use:gridsquareInput
				bind:value={f.grid}
			/>
		</label>
	</div>

	<button
		class="btn btn-primary ml-auto"
		disabled={!canSave}
		onclick={mode === 'new' ? create : update}
	>
		{mode === 'new' ? 'Create' : 'Save'}
	</button>
</div>
