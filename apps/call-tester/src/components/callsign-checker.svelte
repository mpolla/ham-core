<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getSecondarySuffixDescription, parseCallsign } from '$lib/callsign';
	import { findDxcc } from '@ham-core/fast-dxcc';
	import StyledInput from '../components/styled-input.svelte';
	import DxccEntityInfo from '../components/dxcc-entity-info.svelte';
	import { browser } from '$app/environment';

	let query = new URLSearchParams(browser ? page.url.searchParams.toString() : '');
	let callsign = $state(query.get('c') ?? '');

	let callsignData = $derived(parseCallsign(callsign));
	let rawDxcc = $derived(findDxcc(callsign));

	$effect(() => {
		if (!browser) return;
		const url = callsign ? `?c=${callsign}` : '.';
		goto(url, { keepFocus: true, replaceState: true });
	});
</script>

<div class="mb-4">
	<StyledInput
		bind:inputText={callsign}
		inputRe={/^[A-Z\d/]*$/i}
		autofocus
		placeholder="Enter a callsign"
	>
		{#if rawDxcc?.matchLength === callsign.length && rawDxcc.isExact}
			<span class="text-amber-400">{callsign}</span>
		{:else if !callsignData && !rawDxcc}
			{callsign}
		{:else if !callsignData}
			<span class="text-cyan-300">{callsign.slice(0, rawDxcc!.matchLength)}</span>{callsign.slice(
				rawDxcc!.matchLength
			)}
		{:else}
			{@const { base, basePrefix, baseSuffix, secondaryPrefix, secondarySuffixes } = callsignData}
			<div class="flex items-baseline justify-center">
				{#if secondaryPrefix}
					<span class="text-blue-400">{secondaryPrefix}/</span>
				{/if}
				{#if basePrefix}
					<span class="text-cyan-300">{basePrefix}</span>
					<span>{baseSuffix}</span>
				{:else}
					<span>{base}</span>
				{/if}
				{#if secondarySuffixes.length > 0}
					<span class="text-green-400">/{secondarySuffixes.join('/')}</span>
				{/if}
			</div>
		{/if}&ZeroWidthSpace;
	</StyledInput>
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

<style lang="postcss">
	.data-box {
		@apply mx-auto flex w-full flex-1 flex-wrap items-center justify-evenly gap-4 rounded-xl p-4 text-center sm:grid;

		& > *:first-child {
			@apply w-full;
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
