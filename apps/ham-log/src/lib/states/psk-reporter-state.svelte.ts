import { PskReporterClient, type PskResponse } from '$lib/repositories/psk-reporter-client';
import type { LogbookState } from './logbook-state.svelte';

interface PskReporterParams {
	callsign?: string;
	period: number;
	updateInterval: number;
}

export function createPskReporterState(logbook: LogbookState) {
	const params: PskReporterParams = $state({
		period: 15,
		updateInterval: 1000 * 60 * 5,
		callsign: logbook.selectedLog?.call
	});
	let reports = $state<PskResponse>();
	let isLoading = $state(false);
	let autoUpdate = $state(false);

	const client = PskReporterClient.create();

	function updateReports() {
		if (!params.callsign) return;
		isLoading = true;
		client
			.getPskReport({
				callsign: params.callsign,
				flowStartSeconds: -60 * params.period,
				lastseqno: reports?.lastSequenceNumber
			})
			.then((data) => {
				if (data.currentSeconds) {
					reports = data;
				} else {
					console.error('Failed to update reports', data);
				}
			})
			.finally(() => {
				isLoading = false;
			});
	}

	let interval: ReturnType<typeof setInterval>;

	$effect(() => {
		if (autoUpdate && !interval) {
			interval = setInterval(updateReports, params.updateInterval);
		} else if (interval) {
			clearInterval(interval);
		}
	});

	return {
		params,
		get reports() {
			return reports;
		},
		get isLoading() {
			return isLoading;
		},
		get autoUpdate() {
			return autoUpdate;
		},
		set autoUpdate(value) {
			if (value && !autoUpdate) {
				updateReports();
			}
			autoUpdate = value;
		},
		update: updateReports
	};
}
