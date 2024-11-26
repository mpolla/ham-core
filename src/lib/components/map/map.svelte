<script lang="ts">
	import { geoPath, geoCircle } from 'd3-geo';
	import { zoom } from 'd3-zoom';
	import { select } from 'd3-selection';
	import { feature } from 'topojson-client';
	import type { Topology, GeometryCollection } from 'topojson-specification';
	import Fa from 'svelte-fa';
	import { faClose, faCog, faExpand, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
	import world50 from '$lib/data/geo/countries-50m.json';
	import { page } from '$app/stores';
	import { pushState } from '$app/navigation';
	import { Projection } from '$lib/models/projection';
	import { createMapState } from '$lib/states/map-state.svelte';
	import { createTimeState } from '$lib/states/time-state.svelte';
	import { createProjection, getSun, gridFields, gridSquares } from '.';

	const mapState = createMapState();

	interface Props {
		center?: [number, number];
		points?: [number, number][];
		lines?: [[number, number], [number, number]][];
		countryColors?: Record<string, string>;
		class?: string;
	}

	let {
		center = [0, 0],
		points = [],
		lines = [],
		countryColors = {},
		class: className = ''
	}: Props = $props();

	function getColor(name: string) {
		return countryColors[name] ?? '#9b9';
	}

	// Sun position
	const timeState = createTimeState(60000);
	const sun = $derived(getSun(timeState.time));

	let settingsOpen = $state(false);
	const mapExpanded = $derived($page.state.showExpandedMap);

	const projection = $derived(createProjection(mapState.projection, center));
	const path = $derived(geoPath(projection));

	let countries = $state<{ path: string; name: string }[]>([]);

	$effect(() => {
		countries = feature(
			world50 as Topology<any>,
			world50.objects.countries as GeometryCollection
		).features.map((e) => ({
			path: path(e)!,
			name: (e.properties as any).name
		}));
	});

	// Drag & zoom state
	let transform = $state({ k: 1, x: 0, y: 0 });
	let svg: Element;
	const zoomState = zoom()
		.on('zoom', (e) => {
			transform = e.transform;
		})
		.scaleExtent([0.1, 10]);
	$effect(() => {
		select(svg).call(zoomState);
	});
</script>

<div class={mapExpanded ? 'fixed inset-0 z-40 flex p-8 [&>*]:flex-1' : 'flex ' + className}>
	{#if mapExpanded}
		<button
			aria-label="Shrink map"
			class="absolute inset-0 bg-base-300/80"
			onclick={() => history.back()}
		></button>
	{/if}

	<div
		class="relative flex h-auto max-h-full w-full items-center overflow-hidden rounded-lg bg-base-200"
	>
		<svg bind:this={svg} viewBox="0 0 800 800" class="h-full w-full">
			<g transform="translate({transform.x} {transform.y}) scale({transform.k})">
				<!-- Map sphere / globe / water -->
				<path d={path({ type: 'Sphere' })} fill="#335" stroke="none" />

				<!-- Countries -->
				{#each countries as { path, name }}
					<path
						d={path}
						fill={getColor(name)}
						stroke="#555"
						stroke-width={1 / Math.max(transform.k, 0.5)}
					/>
				{/each}

				<!-- Night / dark overlay -->
				{#if mapState.showNight}
					<path
						d={path(
							geoCircle()
								.center([sun[0] + 180, -sun[1]])
								.radius(90)()
						)}
						fill="#0003"
						stroke="none"
					/>
				{/if}

				<!-- Gridsquares -->
				{#if mapState.showGridsquares}
					{@const precice = transform.k > 2}
					{#if precice}
						<path d={path(gridSquares)} fill="none" stroke="#6664" stroke-width={1 / transform.k} />
					{/if}
					<path
						d={path(gridFields)}
						fill="none"
						stroke="#6669"
						stroke-width={(precice ? 2 : 1) / Math.max(transform.k, 0.5)}
					/>
				{/if}

				<!-- Lines -->
				{#each lines as line}
					<path
						d={path({ type: 'LineString', coordinates: line })}
						fill="none"
						stroke="#f80"
						stroke-width={1 / transform.k}
					/>
				{/each}

				<!-- Points -->
				{#each points as point}
					{@const p = projection(point)}
					{#if p}
						<g transform="translate({p[0]} {p[1]}) scale({1 / transform.k}) translate(0, -2)">
							<path
								d="M 0 0 L -8 -16 A 10 10 0 1 1 8 -16 Z"
								fill="#f80"
								stroke="#653600"
								stroke-width="2"
							/>
							<circle cy="-22" r="3" fill="#653600" />
						</g>
					{/if}
				{/each}
			</g>
		</svg>

		<div class="absolute right-3 top-3 flex flex-col gap-2 [&>*]:z-20">
			{#if settingsOpen}
				<button
					aria-label="Close settings"
					class="fixed inset-0 z-10 cursor-auto"
					onclick={() => (settingsOpen = false)}
				></button>
			{/if}

			<button
				class="btn btn-circle btn-sm"
				onclick={mapExpanded
					? () => history.back()
					: () => pushState('', { showExpandedMap: true })}
			>
				<Fa icon={mapExpanded ? faClose : faExpand} />
			</button>

			<div class="relative">
				<button class="btn btn-circle btn-sm" onclick={() => (settingsOpen = !settingsOpen)}>
					<Fa icon={faCog} />
				</button>

				<div class={`absolute right-[calc(100%+.5rem)] top-0 ${settingsOpen ? '' : 'hidden'}`}>
					<div class="flex flex-col gap-4 rounded-xl bg-base-300 p-3">
						<div class="flex gap-2">
							{#each Object.values(Projection) as p}
								<button
									class={`btn btn-sm flex-1 ${mapState.projection === p ? 'btn-primary' : ''}`}
									onclick={() => (mapState.projection = p)}
								>
									{p}
								</button>
							{/each}
						</div>
						<div>
							<div class="text-sm">Zoom</div>
							<input
								type="range"
								min="-1"
								max="1"
								step="0.1"
								value={Math.log10(transform.k)}
								oninput={(e) =>
									zoomState.scaleTo(select(svg), Math.pow(10, +e.currentTarget.value))}
								class="range range-primary range-sm mt-1 w-full"
							/>
						</div>
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text">Show grid squares</span>
								<input
									type="checkbox"
									bind:checked={mapState.showGridsquares}
									class="checkbox-primary checkbox checkbox-sm"
								/>
							</label>
						</div>
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text">Show Night</span>
								<input
									type="checkbox"
									bind:checked={mapState.showNight}
									class="checkbox-primary checkbox checkbox-sm"
								/>
							</label>
						</div>
					</div>
				</div>
			</div>

			<button class="btn btn-circle btn-sm" onclick={() => zoomState.scaleBy(select(svg), 2)}>
				<Fa icon={faPlus} />
			</button>

			<button class="btn btn-circle btn-sm" onclick={() => zoomState.scaleBy(select(svg), 0.5)}>
				<Fa icon={faMinus} />
			</button>
		</div>
	</div>
</div>
