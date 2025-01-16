<script lang="ts">
	import Map from '$lib/components/map/map.svelte';
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';
	import { supabase } from '$lib/supabase';
	import { locatorToLongLat } from '$lib/utils/locator-util';
	import countriesDict from '$lib/data/countries.json';
	import { MapMode } from './map-mode';
	import LogbookSelect from '$lib/components/logbook-select.svelte';
	import { createPskReporterState } from '$lib/states/psk-reporter-state.svelte';

	const logbook = getLogbookContext();
	const pskReporter = createPskReporterState(logbook);

	let mode = $state<MapMode>(MapMode.none);

	let gridsquares = $state<string[]>([]);
	let countries = $state<string[]>([]);
	const reports = $derived.by(() => {
		if (mode != MapMode.pskReports || !pskReporter.reports) return [];
		const mapLoc = (locator: string) => locatorToLongLat(locator.split(' ')[0].slice(0, 6));
		return pskReporter.reports.receptionReport
			.map((r) => {
				try {
					const rx = mapLoc(r.receiverLocator);
					const tx = mapLoc(r.senderLocator);
					return [rx, tx] as [[number, number], [number, number]];
				} catch (e) {
					console.error(e);
				}
			})
			.filter((r) => !!r);
	});

	$effect(() => {
		if (mode == MapMode.grid) {
			countries = [];
			pskReporter.autoUpdate = false;
			(async () => {
				const result: string[] = [];
				for (let i = 0; i < 3; i++) {
					const req = supabase.from('qso_grid_log_summary').select('*');
					if (logbook.logId) req.eq('log_id', logbook.logId);
					const { data } = await req.range(i * 1000, (i + 1) * 1000);
					if (!data || !data.length) break;
					result.push(...data.map((d) => d.grid!));
					if (data.length < 1000) break;
				}
				gridsquares = [...new Set(result)];
			})();
		} else if (mode == MapMode.country) {
			gridsquares = [];
			pskReporter.autoUpdate = false;
			const req = supabase.from('qso').select('country, count()');
			if (logbook.logId) req.eq('log_id', logbook.logId);
			req.then(({ data }) => {
				if (!data) return;
				countries = [];
				for (const c of [...new Set(data.map((d) => d.country!))]) {
					const i = countriesDict.findIndex((e) => e.includes(c));
					if (i !== -1) countries.push(...countriesDict[i]);
					else countries.push(c);
				}
			});
		} else if (mode == MapMode.pskReports) {
			gridsquares = [];
			countries = [];
			pskReporter.autoUpdate = true;
		} else if (mode == MapMode.none) {
			gridsquares = [];
			countries = [];
			pskReporter.autoUpdate = false;
		}
	});

	const center = $derived(
		logbook.selectedLog?.grid ? locatorToLongLat(logbook.selectedLog.grid) : undefined
	);
</script>

<div class="mb-6 flex flex-col items-end gap-2 sm:flex-row">
	<LogbookSelect />

	<select class="select select-bordered" bind:value={mode}>
		{#each Object.values(MapMode) as m}
			<option value={m}>{m}</option>
		{/each}
	</select>
</div>

<Map
	{center}
	class="max-h-[70vh]"
	gridSquareColors={Object.fromEntries(gridsquares.map((k) => [k, '#00ff0044']))}
	countryColors={Object.fromEntries(countries.map((k) => [k, '#33dd33']))}
	defaultCountryColor={countries.length ? '#dd3333' : undefined}
	points={reports.map((p) => p[1])}
	lines={reports}
/>
