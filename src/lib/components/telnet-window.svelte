<script lang="ts">
	import { getClusterContext } from '$lib/states/telnet-state.svelte';
	import { isTauri } from '@tauri-apps/api/core';

	const cluster = getClusterContext();

	let textArea = $state<HTMLTextAreaElement>();

	let url: string = $state('sv2hrt.ath.cx:7300');
	let messages: string = $state('');
	let sendMessage: string = $state('');
	let endsWithNL = false;
	let unlisten: (() => void) | undefined;

	const onMessage = (message: string) => {
		if (endsWithNL) messages += '\n';
		endsWithNL = message.endsWith('\n');
		if (endsWithNL) message = message.substring(0, message.length - 1);
		messages += message;

		if (messages.length > 5000)
			messages = messages.substring(messages.length - 5000, messages.length);

		if (!textArea) return;
		const ta = textArea;

		const isOnBottom = ta.scrollTop + ta.clientHeight >= ta.scrollHeight;
		if (isOnBottom) {
			setTimeout(() => (ta.scrollTop = ta.scrollHeight), 0);
		}
	};

	function send() {
		cluster.send(sendMessage);
		sendMessage = '';
	}

	function connect() {
		unlisten = cluster.addListener(onMessage);
		const [host, port] = url.split(':');
		cluster.connect(host, parseInt(port));
	}

	function disconnect() {
		unlisten?.();
		cluster.disconnect();
	}
</script>

{#if isTauri()}
	<div class="flex flex-col gap-3 rounded-lg bg-base-200 p-4">
		<div class="flex flex-row gap-2">
			<input
				type="text"
				bind:value={url}
				placeholder="URL"
				disabled={cluster.connected}
				class="input input-sm grow"
			/>
			{#if !cluster.connected}
				<button onclick={connect} class="btn btn-outline btn-sm">Connect</button>
			{:else}
				<button onclick={disconnect} class="btn btn-outline btn-sm">Disconnect</button>
			{/if}
		</div>

		<textarea bind:this={textArea} bind:value={messages} rows="10" readonly class="textarea"
		></textarea>

		<div class="flex flex-row gap-2">
			<input
				type="text"
				bind:value={sendMessage}
				placeholder="Message"
				class="input input-sm grow"
				onkeypress={(e) => (e.key === 'Enter' ? send() : null)}
			/>
			<button onclick={send} class="btn btn-outline btn-sm">Send</button>
		</div>
	</div>
{/if}
