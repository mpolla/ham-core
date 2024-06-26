<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getSecondarySuffixDescription, parseCallsign } from '$lib/callsign';
	import { findDxcc } from '$lib/dxcc-util';
	import CallsignInput from '../components/callsign-input.svelte';

	let query = new URLSearchParams($page.url.searchParams.toString());

	let callsign = query.get('c') ?? '';

	$: callsignData = parseCallsign(callsign);
	$: rawDxcc = findDxcc(callsign);

	$: updateUrl(callsign);

	function updateUrl(callsign: string) {
		if (!callsign) goto('.', { keepFocus: true });
		else goto(`?c=${callsign}`, { keepFocus: true });
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

<div class="flex flex-col gap-6 py-10">
	<h1 class="text-center text-3xl font-medium">Callsign Tester</h1>

	<div>
		<div class="mb-1 text-center">Enter a callsign</div>
		<CallsignInput bind:inputText={callsign} generateStyledText={styleText} />
	</div>

	{#if rawDxcc?.matchLength === callsign.length && rawDxcc.isExact}
		<div class="data-box full cols">
			<div>
				<div class="font-mono text-2xl font-medium">{callsign}</div>
				<div>{rawDxcc.entity?.name ?? '?'}</div>
			</div>
			<div class="my-auto text-sm">
				<div>CQ Zone: {rawDxcc.entity?.cqz ?? '?'}</div>
				<div>ITU Zone: {rawDxcc.entity?.ituz ?? '?'}</div>
				<div>Continent: {rawDxcc.entity?.cont ?? '?'}</div>
			</div>
			<div class="my-auto text-sm">
				<div>Lat: {rawDxcc.entity?.lat ?? '?'}</div>
				<div>Long: {rawDxcc.entity?.long ?? '?'}</div>
				<div>TZ Offset: {rawDxcc.entity?.timez ?? '?'}</div>
			</div>
		</div>
	{:else if callsignData}
		<div class="flex flex-col gap-4">
			{#if callsignData.secondaryPrefix}
				<div class="data-box prefix cols">
					<div>
						<div class="font-mono text-2xl font-medium">{callsignData.secondaryPrefix}</div>
						<div>{callsignData.fullDxcc?.name ?? '?'}</div>
					</div>
					<div class="my-auto text-sm">
						<div>CQ Zone: {callsignData.fullDxcc?.cqz ?? '?'}</div>
						<div>ITU Zone: {callsignData.fullDxcc?.ituz ?? '?'}</div>
						<div>Continent: {callsignData.fullDxcc?.cont ?? '?'}</div>
					</div>
					<div class="my-auto text-sm">
						<div>Lat: {callsignData.fullDxcc?.lat ?? '?'}</div>
						<div>Long: {callsignData.fullDxcc?.long ?? '?'}</div>
						<div>TZ Offset: {callsignData.fullDxcc?.timez ?? '?'}</div>
					</div>
				</div>
			{/if}
			{#if callsignData.baseDxcc}
				<div class="data-box base cols">
					<div>
						<div class="font-mono text-2xl font-medium">{callsignData.basePrefix}</div>
						<div>{callsignData.baseDxcc.name ?? '?'}</div>
					</div>
					<div class="my-auto text-sm">
						<div>CQ Zone: {callsignData.baseDxcc.cqz ?? '?'}</div>
						<div>ITU Zone: {callsignData.baseDxcc.ituz ?? '?'}</div>
						<div>Continent: {callsignData.baseDxcc.cont ?? '?'}</div>
					</div>
					<div class="my-auto text-sm">
						<div>Lat: {callsignData.baseDxcc.lat ?? '?'}</div>
						<div>Long: {callsignData.baseDxcc.long ?? '?'}</div>
						<div>TZ Offset: {callsignData.baseDxcc.timez ?? '?'}</div>
					</div>
				</div>
			{/if}
			{#if callsignData.secondarySuffixes.length > 0}
				<div class="flex flex-wrap gap-4">
					{#each callsignData.secondarySuffixes as suffix}
						<div class="data-box suffix min-w-full flex-grow sm:min-w-[30%]">
							<div class="font-mono text-2xl font-medium">{suffix}</div>
							<div>{getSecondarySuffixDescription(suffix)}</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else if rawDxcc}
		<div class="data-box base cols">
			<div>
				<div class="font-mono text-2xl font-medium">{callsign.slice(0, rawDxcc.matchLength)}</div>
				<div>{rawDxcc.entity?.name ?? '?'}</div>
			</div>
			<div class="my-auto text-sm">
				<div>CQ Zone: {rawDxcc.entity?.cqz ?? '?'}</div>
				<div>ITU Zone: {rawDxcc.entity?.ituz ?? '?'}</div>
				<div>Continent: {rawDxcc.entity?.cont ?? '?'}</div>
			</div>
			<div class="my-auto text-sm">
				<div>Lat: {rawDxcc.entity?.lat ?? '?'}</div>
				<div>Long: {rawDxcc.entity?.long ?? '?'}</div>
				<div>TZ Offset: {rawDxcc.entity?.timez ?? '?'}</div>
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	.data-box {
		@apply mx-auto w-full flex-1 rounded-xl p-4 text-center;
	}
	.data-box.cols {
		@apply grid grid-cols-3;
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
