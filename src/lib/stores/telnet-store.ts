import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { get, writable } from 'svelte/store';

interface ClusterStore {
	connected: boolean;
	messages: string;
	spots: {
		spotter: string;
		dxCall: string;
		time: Date;
		freq: number;
		comment: string;
	}[];
	unlisten?: UnlistenFn;
	listeners?: ((msg: string) => void)[];
}

const LABEL = 'telnet-cluster';

export const clusterStore = writable<ClusterStore>({
	connected: false,
	messages: '',
	spots: []
});

export async function connectTelnet(url: string) {
	if (get(clusterStore).connected) return;

	const isConnected = await invoke('is_telnet_running', { label: LABEL });
	if (isConnected) {
		clusterStore.update((store) => ({
			...store,
			connected: true
		}));
		createTelnetListener();
		return;
	}

	clusterStore.update((store) => ({
		...store,
		connected: true
	}));
	const [host, port] = url.split(':');
	invoke('telnet_start', { host: host, port: parseInt(port), label: LABEL });
	createTelnetListener();
}

function createTelnetListener() {
	get(clusterStore).unlisten?.();
	listen<Array<number>>(LABEL, (event) => {
		const payload = event.payload.filter((v) => (v >= 32 && v <= 126) || v === 10);

		for (const listener of get(clusterStore).listeners || []) {
			listener(String.fromCharCode(...payload));
		}
	}).then((unlisten) => clusterStore.update((store) => ({ ...store, unlisten })));
}

export function addTelnetListener(listener: (msg: string) => void) {
	clusterStore.update((store) => ({ ...store, listeners: [...(store.listeners || []), listener] }));
	return () => {
		clusterStore.update((store) => ({
			...store,
			listeners: store.listeners?.filter((l) => l !== listener)
		}));
	};
}

export function disconnectTelnet() {
	const { connected, unlisten } = get(clusterStore);
	if (!connected) return;
	unlisten?.();
	invoke('telnet_stop', { label: LABEL });
	clusterStore.update((store) => ({ ...store, connected: false }));
}

export function sendTelnet(message: string) {
	if (!get(clusterStore).connected) return;
	if (message.length === 0) return;
	if (!message.endsWith('\n')) message += '\n';
	invoke('telnet_send', { label: LABEL, data: message });
}
