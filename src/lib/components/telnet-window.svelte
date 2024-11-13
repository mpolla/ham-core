<script lang="ts">
	import {
		addTelnetListener,
		clusterStore,
		connectTelnet,
		disconnectTelnet,
		sendTelnet
	} from '$lib/stores/telnet-store';
	import { onDestroy, onMount } from 'svelte';

	let textArea: HTMLTextAreaElement;

	let url: string = 'sv2hrt.ath.cx:7300';
	let messages: string = '';
	let sendMessage: string = '';
	$: isConnected = $clusterStore.connected;
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
		sendTelnet(sendMessage);
		sendMessage = '';
	}

	function connect() {
		unlisten?.();
		connectTelnet(url);
		unlisten = addTelnetListener(onMessage);
	}

	function disconnect() {
		unlisten?.();
		disconnectTelnet();
	}

	onMount(() => {
		unlisten?.();
		unlisten = addTelnetListener(onMessage);
	});

	onDestroy(() => disconnect);
</script>

<div class="flex flex-col gap-3 rounded-lg bg-base-200 p-4">
	<div class="flex flex-row gap-2">
		<input
			type="text"
			bind:value={url}
			placeholder="URL"
			disabled={isConnected}
			class="input input-sm grow"
		/>
		{#if !isConnected}
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
