import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { derived, get, writable } from 'svelte/store';

interface TelnetStore {
	connected: boolean;
	unlisten?: UnlistenFn;
	listeners: ((msg: string) => void)[];
}

export function createTelnetStore(label: string) {
	const store = writable<TelnetStore>({
		connected: false,
		listeners: []
	});

	function update(state: Partial<TelnetStore>) {
		store.update((store) => ({ ...store, ...state }));
	}

	async function connect(url: string) {
		if (get(store).connected) return;

		const isConnected = await invoke('is_telnet_running', { label });
		if (!isConnected) {
			const [host, port] = url.split(':');
			invoke('telnet_start', { host: host, port: parseInt(port), label });
		}

		update({ connected: true });
		listen<Array<number>>(label, (event) => {
			const payload = event.payload.filter((v) => (v >= 32 && v <= 126) || v === 10);

			for (const listener of get(store).listeners) {
				listener(String.fromCharCode(...payload));
			}
		}).then((unlisten) => update({ unlisten }));
	}

	function disconnect() {
		const { connected, unlisten } = get(store);
		if (!connected) return;
		unlisten?.();
		invoke('telnet_stop', { label });
		update({ connected: false, unlisten: undefined });
	}

	function addListener(listener: (msg: string) => void) {
		update({ listeners: [...get(store).listeners, listener] });
		return () => {
			update({ listeners: get(store).listeners.filter((l) => l !== listener) });
		};
	}

	function send(message: string) {
		if (!get(store).connected) return;
		if (message.length === 0) return;
		if (!message.endsWith('\n')) message += '\n';
		invoke('telnet_send', { label, data: message });
	}

	return {
		...derived([store], ([store]) => ({ connected: store.connected })),
		connect,
		disconnect,
		addListener,
		send
	};
}
