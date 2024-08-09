<script lang="ts">
	import { callsignInput, gridsquareInput, numberInput } from '$lib/helpers/input-helpers';
	import { logbookStore, selectLog } from '$lib/stores/logbook-store';
	import { logsStore } from '$lib/stores/logs-store';
	import { locatorRegex } from '$lib/utils/locator-util';
	import { dxccEntities, findDxcc } from 'fast-dxcc';
	import {
		copyFrom,
		logbookFields as f,
		setCall,
		setCqz,
		setDxcc,
		setGrid,
		setItuz,
		setName,
		setTitle
	} from './logbook-fields';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let mode: 'new' | 'edit';

	$: log =
		mode === 'new' ? undefined : $logsStore?.find((l) => l.id === $logbookStore.params.logId);

	$: parsedDxcc = findDxcc($f.call.value)?.entity;
	const dxccs = [...dxccEntities.values()].sort((a, b) => a.name.localeCompare(b.name));

	$: dxcc = dxccEntities.get($f.dxcc.value);

	$: canSave = $f.call.value && $f.dxcc.value && !$f.isPure;

	$: data = canSave
		? {
				call: $f.call.value,
				title: $f.title.value || null,
				dxcc: dxcc!.dxcc!,
				country: dxcc!.name,
				cqz: +$f.cqz.value || null,
				ituz: +$f.ituz.value || null,
				name: $f.name.value || null,
				grid: $f.grid.value || null
			}
		: undefined;

	function create() {
		if (!canSave) return;
		supabase
			.from('log')
			.insert(data!)
			.select()
			.single()
			.then((res) => {
				if (res.error) return console.error(res.error);
				logsStore.update((logs) => [...logs!, res.data!]);
				selectLog(res.data!.id);
				history.back();
			});
	}

	function update() {
		if (!canSave) return;
		supabase
			.from('log')
			.update(data!)
			.eq('id', $logbookStore.params.logId!)
			.select()
			.single()
			.then((res) => {
				if (res.error) return console.error(res.error);
				logsStore.update((logs) => logs!.map((l) => (l.id === res.data!.id ? res.data : l)));
				history.back();
			});
	}

	onMount(() => copyFrom(log));
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
				value={$f.call.value}
				on:input={(e) => setCall(e.currentTarget.value)}
			/>
		</label>
		<label class="form-control col-span-2">
			<div class="label">
				<span class="label-text">Title</span>
			</div>
			<input
				type="text"
				class="input input-bordered"
				value={$f.title.value}
				on:input={(e) => setTitle(e.currentTarget.value)}
			/>
		</label>

		<label class="form-control col-span-2">
			<div class="label">
				<span class="label-text">Country</span>
			</div>
			<select
				class={`select select-bordered ${dxcc && parsedDxcc && parsedDxcc.id !== dxcc.id ? 'select-warning' : ''}`}
				value={$f.dxcc.value}
				on:change={(e) => setDxcc(+e.currentTarget.value)}
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
				class={`input input-bordered ${$f.cqz.value && dxcc && +$f.cqz.value !== dxcc.cqz ? 'input-warning' : ''}`}
				use:numberInput
				value={$f.cqz.value}
				on:input={(e) => setCqz(e.currentTarget.value)}
			/>
		</label>
		<label class="form-control">
			<div class="label">
				<span class="label-text">ITU Zone</span>
			</div>
			<input
				type="text"
				class={`input input-bordered ${$f.ituz.value && dxcc && +$f.ituz.value !== dxcc.ituz ? 'input-warning' : ''}`}
				use:numberInput
				value={$f.ituz.value}
				on:input={(e) => setItuz(e.currentTarget.value)}
			/>
		</label>

		<label class="form-control col-span-2">
			<div class="label">
				<span class="label-text">Name</span>
			</div>
			<input
				type="text"
				class="input input-bordered"
				value={$f.name.value}
				on:input={(e) => setName(e.currentTarget.value)}
			/>
		</label>
		<label class="form-control col-span-2">
			<div class="label">
				<span class="label-text">Gridsquare</span>
			</div>
			<input
				type="text"
				class={`input input-bordered ${$f.grid.value && !$f.grid.value.match(locatorRegex) ? 'input-error' : ''}`}
				use:gridsquareInput
				value={$f.grid.value}
				on:input={(e) => setGrid(e.currentTarget.value)}
			/>
		</label>
	</div>

	<button
		class="btn btn-primary ml-auto"
		disabled={!canSave}
		on:click={mode === 'new' ? create : update}
	>
		{mode === 'new' ? 'Create' : 'Save'}
	</button>
</div>
