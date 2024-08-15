<script lang="ts">
	import Map from '$lib/components/map.svelte';
	import { logbookStore } from '$lib/stores/logbook-store';
	import { logsStore } from '$lib/stores/logs-store';
	import type { IQso } from '$lib/supabase';
	import { locatorToLongLat } from '$lib/utils/locator-util';
	import { dxccEntities } from 'fast-dxcc';

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

	$: log = $logsStore?.find((l) => l.id === $logbookStore.params.logId);

	$: center = log?.grid ? locatorToLongLat(log.grid) : undefined;
	$: lastQsos = $logbookStore.result?.qsos.map(longLat).filter((q) => !!q) as
		| [number, number][]
		| undefined;
</script>

<Map
	{center}
	points={center && lastQsos ? [...lastQsos, center] : []}
	lines={center && lastQsos ? lastQsos.map((p) => [p, center]) : []}
/>
