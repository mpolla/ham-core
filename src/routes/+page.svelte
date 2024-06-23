<script lang="ts">
	import { getSecondarySuffixDescription, parseCallsign } from '$lib/callsign';
	import { dxccEntities } from '$lib/dxcc-util';
	import CallsignInput from '../components/callsign-input.svelte';

	const baseClass = 'text-red-400';
	const prefixClass = 'text-blue-400';
	const suffixClass = 'text-green-400';

	let callsign = '9a/s52kj/p';

	$: callsignData = parseCallsign(callsign);

	$: suffixPartOf = [null, 'base', 'prefix'].indexOf(callsignData?.suffixPartOf ?? null);

	function styleText(): string {
		if (!callsignData) return callsign;

		const { base, basePrefix, baseSuffix, secondaryPrefix, secondarySuffix } = callsignData;

		// TODO Check if base and prefix same dxcc
		const suffClass = [suffixClass, baseClass, prefixClass][suffixPartOf];
		return [
			secondaryPrefix ? `<span class="${prefixClass}">${secondaryPrefix}/</span>` : '',
			basePrefix ? `<span class="${baseClass}">${basePrefix}</span>${baseSuffix}` : base,
			secondarySuffix ? `<span class="${suffClass}">/${secondarySuffix}</span>` : ''
		].join('');
	}
</script>

<div class="flex flex-col gap-6 py-10">
	<h1 class="text-center text-3xl font-medium">Callsign Tester</h1>

	<div>
		<div class="text-center">Enter a callsign</div>
		<CallsignInput bind:inputText={callsign} generateStyledText={styleText} />
	</div>

	{#if callsignData}
		<div class="flex flex-col gap-4 md:flex-row">
			{#if callsignData.prefixDxcc}
				<div class="data-box prefix">
					<h2 class="text-xl">Secondary prefix</h2>
					<div class="font-mono text-2xl font-medium">{callsignData.secondaryPrefix}</div>
					<div>{dxccEntities.get(callsignData.prefixDxcc)?.name}</div>
				</div>
			{/if}
			{#if callsignData.baseDxcc}
				<div class="data-box base">
					<h2 class="text-xl">Prefix</h2>
					<div class="font-mono text-2xl font-medium">{callsignData.basePrefix}</div>
					<div>{dxccEntities.get(callsignData.baseDxcc)?.name}</div>
				</div>
			{/if}
			{#if callsignData.secondarySuffix}
				<div class={`data-box ${['suffix', 'base', 'prefix'][suffixPartOf]}`}>
					<h2 class="text-xl">Secondary suffix</h2>
					<div class="font-mono text-2xl font-medium">{callsignData.secondarySuffix}</div>
					<div>{getSecondarySuffixDescription(callsignData) ?? ''}</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="postcss">
	.data-box {
		@apply flex-1 rounded-xl p-4;
	}
	.data-box.prefix {
		@apply bg-blue-700/40;
	}
	.data-box.base {
		@apply bg-red-700/40;
	}
	.data-box.suffix {
		@apply bg-green-700/40;
	}
</style>
