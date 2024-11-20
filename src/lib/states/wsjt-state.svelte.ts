import { parseWsjtMessage, type WsjtMessage } from '$lib/wsjt/wsjt-reader';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getContext, onDestroy, setContext } from 'svelte';

const PORT = 2237;

function createWsjtState() {
	let connected = $state(false);
	let listeners: ((m: WsjtMessage) => void)[] = [];

	function addListener(listener: (m: WsjtMessage) => void) {
		listeners.push(listener);
		return () => {
			listeners = listeners.filter((l) => l !== listener);
		};
	}

	function connect() {
		if (connected || !isTauri()) return;
		connected = true;

		invoke('is_listener_running', { port: PORT }).then((isRunning) => {
			if (isRunning) return;

			invoke('start_listener', { port: PORT, label: 'wsjt-listener' });
		});

		const unlistenPromise = listen<Array<number>>('wsjt-listener', (event) => {
			const msg = parseWsjtMessage(new Uint8Array(event.payload));
			if (msg) listeners.forEach((l) => l(msg));
		});

		const statusChecker = setInterval(() => {
			invoke('is_listener_running', { port: PORT }).then((isRunning) => {
				if (!isRunning) {
					unlistenPromise.then((unlisten) => unlisten());
					clearInterval(statusChecker);
					connected = false;
				}
			});
		}, 1000);
	}

	function disconnect() {
		if (!connected) return;
		connected = false;
		invoke('stop_listener', { port: PORT });
	}

	connect();
	onDestroy(() => disconnect());

	return {
		get connected() {
			return connected;
		},
		addListener,
		connect,
		disconnect
	};
}

export type WsjtState = ReturnType<typeof createWsjtState>;

const WSJT_STATE = 'WSJT_STATE';

export function setWsjtContext() {
	return setContext<WsjtState>(WSJT_STATE, createWsjtState());
}

export function getWsjtContext() {
	return getContext<WsjtState>(WSJT_STATE);
}
