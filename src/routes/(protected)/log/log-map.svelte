<script lang="ts">
	import Map from '$lib/components/map.svelte';
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
		}
		return undefined;
	}

	let center = $derived(
		(logbook.selectedLog?.grid ? locatorToLongLat(logbook.selectedLog.grid) : undefined) as
			| [number, number]
			| undefined
	);
	let lastQsos = $derived(
		(logbook.qsos.map(longLat).filter((q) => !!q) ?? []) as [number, number][]
	);
</script>

<Map
	{center}
	points={[...(lastQsos ? lastQsos : []), ...(center ? [center] : [])]}
	lines={center && lastQsos ? lastQsos.map((p) => [p, center]) : []}
/>
