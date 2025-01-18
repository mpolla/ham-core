import { PskReporterClient, type PskResponse } from '$lib/repositories/psk-reporter-client';
import { createTimeState } from './time-state.svelte';

interface PskReporterParams {
	callsign?: string;
	period: number;
	updateInterval: number;
}

export function createPskReporterState() {
	const params: PskReporterParams = $state({
		period: 15,
		updateInterval: 1000 * 60 * 5
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

	const interval = createTimeState(params.updateInterval, autoUpdate, updateReports);

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
			if (value && interval.isStopped) interval.start();
			if (!value && !interval.isStopped) interval.stop();
			autoUpdate = value;
		},
		update: updateReports
	};
}
