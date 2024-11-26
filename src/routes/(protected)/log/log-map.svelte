<script lang="ts">
	import Map from '$lib/components/map/map.svelte';
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';
	import type { IQso } from '$lib/supabase';
	import { locatorToLongLat } from '$lib/utils/locator-util';
	import { dxccEntities } from 'fast-dxcc';

	const logbook = getLogbookContext();

	function longLat(qso: IQso): [number, number] | undefined {
		if (qso.gridsquare) {
			return locatorToLongLat(qso.gridsquare, true);
		}
		if (qso.dxcc) {
			const dxccs = [...dxccEntities.values()].filter((r) => r.dxcc === qso.dxcc);
			if (dxccs.length === 1) {
				const dxcc = dxccs[0];
				if (dxcc.lat && dxcc.long) return [dxcc.long, dxcc.lat];
			}
			const dxccs2 = dxccs.filter((r) => r.name === qso.country);
			if (dxccs2.length === 1) {
				const dxcc = dxccs2[0];
				if (dxcc.lat && dxcc.long) return [dxcc.long, dxcc.lat];
			}
		}
		return undefined;
	}

	const center = $derived(
		logbook.selectedLog?.grid ? locatorToLongLat(logbook.selectedLog.grid) : undefined
	);
	const lastQsos = $derived(logbook.qsos.map(longLat).filter((q) => !!q));
</script>

<Map
	{center}
	points={[...lastQsos, ...(center ? [center] : [])]}
	lines={center && lastQsos ? lastQsos.map((p) => [p, center]) : []}
	class="max-h-80 lg:max-h-none"
/>
