<script lang="ts">
	import { clusterStore } from '$lib/stores/telnet-store';
	import { isTauri } from '@tauri-apps/api/core';

	let textArea: HTMLTextAreaElement;

	let url: string = 'sv2hrt.ath.cx:7300';
	let messages: string = '';
	let sendMessage: string = '';
	let endsWithNL = false;
	let unlisten: (() => void) | undefined;

	const onMessage = (message: string) => {
		if (endsWithNL) messages += '\n';
		endsWithNL = message.endsWith('\n');
		if (endsWithNL) message = message.substring(0, message.length - 1);
		messages += message;

		if (messages.length > 5000)
			messages = messages.substring(messages.length - 5000, messages.length);

		const isOnBottom = textArea.scrollTop + textArea.clientHeight >= textArea.scrollHeight;
		if (isOnBottom) {
			setTimeout(() => (textArea.scrollTop = textArea.scrollHeight), 0);
		}
	};

	function send() {
		clusterStore.send(sendMessage);
		sendMessage = '';
	}

	function connect() {
		unlisten = clusterStore.addListener(onMessage);
		clusterStore.connect(url);
	}

	function disconnect() {
		unlisten?.();
		clusterStore.disconnect();
	}
</script>

{#if isTauri()}
	<div class="flex flex-col gap-3 rounded-lg bg-base-200 p-4">
		<div class="flex flex-row gap-2">
			<input
				type="text"
				bind:value={url}
				placeholder="URL"
				disabled={$clusterStore.connected}
				class="input input-sm grow"
			/>
			{#if !$clusterStore.connected}
				<button on:click={connect} class="btn btn-outline btn-sm">Connect</button>
			{:else}
				<button on:click={disconnect} class="btn btn-outline btn-sm">Disconnect</button>
			{/if}
		</div>

		<textarea bind:this={textArea} bind:value={messages} rows="10" readonly class="textarea" />

		<div class="flex flex-row gap-2">
			<input
				type="text"
				bind:value={sendMessage}
				placeholder="Message"
				class="input input-sm grow"
				on:keypress={(e) => (e.key === 'Enter' ? send() : null)}
			/>
			<button on:click={send} class="btn btn-outline btn-sm">Send</button>
		</div>
	</div>
{/if}
