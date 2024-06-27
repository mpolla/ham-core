<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getSecondarySuffixDescription, parseCallsign } from '$lib/callsign';
	import { findDxcc } from '$lib/dxcc-util';
	import CallsignInput from '../components/callsign-input.svelte';
	import DxccEntityInfo from './dxcc-entity-info.svelte';

	let query = new URLSearchParams($page.url.searchParams.toString());

	let callsign = query.get('c') ?? '';

	$: callsignData = parseCallsign(callsign);
	$: rawDxcc = findDxcc(callsign);

	$: updateUrl(callsign);

	function updateUrl(callsign: string) {
		if (!callsign) goto('.', { keepFocus: true, replaceState: true });
		else goto(`?c=${callsign}`, { keepFocus: true, replaceState: true });
	}

	function styleText(): string {
		const baseClass = 'text-cyan-300';
		const prefixClass = 'text-blue-400';
		const suffixClass = 'text-green-400';

		if (rawDxcc?.matchLength === callsign.length && rawDxcc.isExact) {
			return `<span class="text-amber-400">${callsign}</span>`;
		}

		if (!callsignData) {
			const dxcc = findDxcc(callsign);
			if (!dxcc) return callsign;
			return `<span class="text-cyan-300">${callsign.slice(0, dxcc.matchLength)}</span>${callsign.slice(dxcc.matchLength)}`;
		}

		const { base, basePrefix, baseSuffix, secondaryPrefix, secondarySuffixes } = callsignData;

		// TODO Check if base and prefix same dxcc
		return [
			secondaryPrefix ? `<span class="${prefixClass}">${secondaryPrefix}/</span>` : '',
			basePrefix ? `<span class="${baseClass}">${basePrefix}</span>${baseSuffix}` : base,
			secondarySuffixes.length
				? `<span class="${suffixClass}">/${secondarySuffixes.join('/')}</span>`
				: ''
		].join('');
	}
</script>

<div class="py-10">
	<h1 class="mb-10 text-center text-5xl font-light">Callsign Tester</h1>

	<div class="mb-4">
		<div class="mb-1 text-center text-sm font-light">Enter a callsign</div>
		<CallsignInput bind:inputText={callsign} generateStyledText={styleText} />
	</div>

	{#if rawDxcc?.matchLength === callsign.length && rawDxcc.isExact}
		<div class="data-box full cols">
			<DxccEntityInfo prefix={callsign} dxccEntity={rawDxcc.entity} />
		</div>
	{:else if callsignData}
		{@const { secondaryPrefix, fullDxcc, basePrefix, baseDxcc, secondarySuffixes } = callsignData}
		<div class="flex flex-col gap-4">
			{#if secondaryPrefix && fullDxcc}
				<div class="data-box prefix cols">
					<DxccEntityInfo prefix={secondaryPrefix} dxccEntity={fullDxcc} />
				</div>
			{/if}
			{#if baseDxcc && basePrefix}
				<div class="data-box base cols">
					<DxccEntityInfo prefix={basePrefix} dxccEntity={baseDxcc} />
				</div>
			{/if}
			{#if secondarySuffixes.length > 0}
				<div class="flex flex-wrap gap-4">
					{#each secondarySuffixes as suffix}
						<div class="data-box suffix min-w-full flex-grow sm:min-w-[30%]">
							<div>
								<div class="font-mono text-2xl font-medium">{suffix}</div>
								<div>{getSecondarySuffixDescription(suffix)}</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else if rawDxcc}
		<div class="data-box base cols">
			<DxccEntityInfo prefix={callsign.slice(0, rawDxcc.matchLength)} dxccEntity={rawDxcc.entity} />
		</div>
	{/if}
</div>

<style lang="postcss">
	.data-box {
		@apply mx-auto grid w-full flex-1 rounded-xl p-4 text-center;

		& > * {
			@apply my-auto;
		}
	}
	.data-box.cols {
		@apply grid-cols-3;
	}
	.data-box.full {
		@apply bg-amber-600/40;
	}
	.data-box.prefix {
		@apply bg-blue-600/40;
	}
	.data-box.base {
		@apply bg-cyan-600/40;
	}
	.data-box.suffix {
		@apply bg-green-600/40;
	}
</style>
