<script lang="ts">
	import { callsignPattern } from '$lib/callsign';
	import { dxccTree, findDxcc } from '$lib/dxcc-util';
	import CallsignInput from '../components/callsign-input.svelte';

	let callsign = '9a/s52kj/p';

	function generateStyledText(text: string): string {
		const match = text.match(callsignPattern);
		if (!match) return text;

		const [, prefix, base, suffix] = match;
		const baseDxcc = findDxcc(base);
		const prefixDxcc = prefix ? findDxcc(text) : null;
		return [
			prefixDxcc ? `<span class="prefix">${prefix}</span>` : prefix,
			`<span class="base">${base}</span>`,
			`<span class="dxcc">${base}</span>`,
			suffix ? `<span class="suffix">${suffix}</span>` : null
		]
			.filter(Boolean)
			.join('');
	}
</script>

<div class="mx-auto py-10 max-w-3xl flex flex-col gap-6 px-6">
	<h1 class="text-3xl font-medium text-center">Callsign Tester</h1>

	<CallsignInput bind:inputText={callsign} {generateStyledText} />
</div>
