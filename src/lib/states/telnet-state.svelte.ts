import { invoke, isTauri } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { getContext, onDestroy, setContext } from 'svelte';

function createTelnetState(label: string) {
	let connected = $state(false);
	let listeners: ((msg: string) => void)[] = [];
	let unlistenPromise: Promise<UnlistenFn> | undefined;

	function connect(host: string, port: number) {
		if (connected || !isTauri()) return;
		connected = true;

		const isConnected = invoke('is_telnet_running', { label });
		if (!isConnected) {
			invoke('telnet_start', { host, port, label });
		}

		unlistenPromise = listen<Array<number>>(label, (event) => {
			const payload = event.payload.filter((v) => (v >= 32 && v <= 126) || v === 10);
			const msg = String.fromCharCode(...payload);

			listeners.forEach((l) => l(msg));
		});
	}

	async function disconnect() {
		if (!connected) return;
		connected = false;
		unlistenPromise?.then((unl) => unl());
		invoke('telnet_stop', { label });
	}

	function addListener(listener: (msg: string) => void) {
		listeners.push(listener);
		return () => {
			listeners = listeners.filter((l) => l == listener);
		};
	}

	function send(message: string) {
		if (!connected || message.length == 0) return;
		if (!message.endsWith('\n')) message += '\n';
		invoke('telnet_send', { label, data: message });
	}

	onDestroy(() => disconnect());

	return {
		get connected() {
			return connected;
		},
		connect,
		disconnect,
		addListener,
		send
	};
}

export type TelnetState = ReturnType<typeof createTelnetState>;

const CLUSTER_STATE = 'CLUSTER_STATE';

export function setClusterContext() {
	return setContext<TelnetState>(CLUSTER_STATE, createTelnetState('telnet-cluster'));
}

export function getClusterContext() {
	return getContext<TelnetState>(CLUSTER_STATE);
}
