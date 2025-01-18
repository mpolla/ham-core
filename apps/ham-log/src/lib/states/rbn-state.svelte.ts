import { RbnClient, type RbnResponse } from '$lib/repositories/rbn-client';
import { createTimeState } from './time-state.svelte';

interface RbnParams {
	callsign?: string;
	period: number;
	updateInterval: number;
	maxRows: number;
}

export function createRbnState() {
	const params: RbnParams = {
		callsign: '',
		period: 60,
		updateInterval: 30000,
		maxRows: 40
	};
	let response = $state<RbnResponse>();
	let isLoading = $state(false);
	let autoUpdate = $state(false);

	let lastId = 0;
	const client = RbnClient.create();

	const spots = $derived.by(() => {
		if (!response?.spots) return [];
		return Object.values(response.spots).map(
			([spotter, freq, spotted, snr, wpm, , , , , timestamp]) => {
				const spotterInfo = response?.call_info?.[spotter];
				const spottedInfo = response?.call_info?.[spotted];
				return {
					spotter: {
						callsign: spotter,
						lat: spotterInfo?.[6],
						long: spotterInfo?.[7]
					},
					spotted: {
						callsign: spotted,
						lat: spottedInfo?.[6],
						long: spottedInfo?.[7]
					},
					freq: parseFloat(freq),
					snr,
					wpm,
					time: new Date(timestamp * 1000)
				};
			}
		);
	});

	function fetchRbn() {
		isLoading = true;
		client
			.getRbnReport({
				cdx: params.callsign,
				r: params.maxRows,
				ma: params.period * 60,
				s: lastId
			})
			.then((res) => {
				const allSpots = Object.entries({ ...response?.spots, ...res.spots });
				response = {
					...res,
					spots: Object.fromEntries(allSpots.slice(allSpots.length - params.maxRows)),
					call_info: {
						...response?.call_info,
						...res.call_info
					}
				};
				lastId = res.lastid_c;
			})
			.finally(() => {
				isLoading = false;
			});
	}

	const interval = createTimeState(params.updateInterval, autoUpdate, fetchRbn);

	return {
		params,
		get spots() {
			return spots;
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
		update: fetchRbn
	};
}
