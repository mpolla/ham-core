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

	let log = $derived($logsStore?.find((l) => l.id === $logbookStore.params.logId));

	let center = $derived(
		(log?.grid ? locatorToLongLat(log.grid) : undefined) as [number, number] | undefined
	);
	let lastQsos = $derived(
		($logbookStore.result?.qsos.map(longLat).filter((q) => !!q) ?? []) as [number, number][]
	);
</script>

<Map
	{center}
	points={[...(lastQsos ? lastQsos : []), ...(center ? [center] : [])]}
	lines={center && lastQsos ? lastQsos.map((p) => [p, center]) : []}
/>
