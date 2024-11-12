import { parseWsjtMessage, WsjtQsoLogged, type WsjtMessage } from '$lib/wsjt/wsjt-reader';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { get, writable } from 'svelte/store';
import { insertQso, logbookStore } from './logbook-store';
import { findDxcc } from 'fast-dxcc';
import { Band } from '$lib/models/band';

interface WsjtStore {
	connected: boolean;
	listeners: ((m: WsjtMessage) => void)[];
}

const PORT = 2237;

export const wsjtStore = writable<WsjtStore>(
	{
		connected: false,
		listeners: []
	},
	() => {
		if (!isTauri()) return;

		connectWsjt();
		return disconnectWsjt;
	}
);

export function connectWsjt() {
	invoke('is_listener_running', { port: PORT }).then((isRunning) => {
		if (isRunning) return;

		invoke('start_listener', { port: PORT, label: 'wsjt-listener' });
	});

	const unlistenPromise = listen<Array<number>>('wsjt-listener', (event) => {
		const msg = parseWsjtMessage(new Uint8Array(event.payload));
		if (msg) get(wsjtStore).listeners.forEach((l) => l(msg));
	});

	wsjtStore.set({
		listeners: [
			// (m: WsjtMessage) => console.log(m),
			(m: WsjtMessage) => {
				if (!(m instanceof WsjtQsoLogged)) return;
				const dxcc = findDxcc(m.dxCall)?.entity;
				insertQso({
					log_id: get(logbookStore).params.logId,
					datetime: m.dateTimeOn.toISOString(),
					call: m.dxCall,
					mode: m.mode,
					frequency: Number(m.txFrequency),
					band: Band.getBand(Number(m.txFrequency))?.name,
					rst_sent: m.reportSent,
					rst_rcvd: m.reportReceived,
					dxcc: dxcc?.dxcc,
					country: dxcc?.name,
					power: parseInt(m.txPower) || null,
					gridsquare: m.dxGrid,
					cont: dxcc?.cont,
					other: {
						CQZ: dxcc?.cqz,
						ITUZ: dxcc?.ituz
					}
				});
			}
		],
		connected: true
	});

	const statusChecker = setInterval(() => {
		invoke('is_listener_running', { port: PORT }).then((isRunning) => {
			if (!isRunning) {
				unlistenPromise.then((unlisten) => unlisten());
				clearInterval(statusChecker);
				wsjtStore.update((s) => ({ ...s, connected: false }));
			}
		});
	}, 1000);
}

export function disconnectWsjt() {
	wsjtStore.update((s) => ({ ...s, connected: false }));
	invoke('stop_listener', { port: PORT });
}

export function addWsjtListener(listener: (m: WsjtMessage) => void) {
	wsjtStore.update((s) => ({
		...s,
		listeners: [...s.listeners, listener]
	}));
}

export function removeWsjtListener(listener: (m: WsjtMessage) => void) {
	wsjtStore.update((s) => ({
		...s,
		listeners: s.listeners.filter((l) => l !== listener)
	}));
}
