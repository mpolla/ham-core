<script lang="ts">
	import { geoPath, geoMercator, geoAzimuthalEquidistant } from 'd3-geo';
	import { feature } from 'topojson-client';
	import type { Topology, GeometryCollection } from 'topojson-specification';
	import Fa from 'svelte-fa';
	import { faCog, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
	import world110 from '$lib/data/geo/countries-110m.json';
	import world50 from '$lib/data/geo/countries-50m.json';
	import MapWorker from '$lib/helpers/map-worker?worker';

	export let center: [number, number] = [0, 0];
	export let projection: 'mercator' | 'azimuthal' = 'mercator';
	export let points: [number, number][] = [];
	export let lines: [[number, number], [number, number]][] = [];
	export let countryColors: Record<string, string> = {};
	export let showGridsquares = true;

	let scale = 2.2;
	function setScale(v: number) {
		v = Math.min(4, Math.max(2, v));
		if (v !== scale) scale = v;
	}
	const zoomIn = (f = 0.2) => setScale(scale + f);
	const zoomOut = (f = 0.2) => setScale(scale - f);

	$: _projection = (projection === 'mercator' ? geoMercator : geoAzimuthalEquidistant)();
	let path = geoPath(_projection);

	let countries: string[] = [];
	let _countries: typeof countries110;

	let mapWorker = new MapWorker();
	let lastRender = Date.now();
	mapWorker.addEventListener('message', (e: MessageEvent<[string[], number]>) => {
		if (e.data[1] != lastRender) return;
		countries = e.data[0];
		_countries = countries50;
	});

	let hqTimeout: ReturnType<typeof setTimeout>;
	function setT() {
		if (!hqTimeout) clearTimeout(hqTimeout);
		lastRender = Date.now();
		if (scale < 2.5) return;
		hqTimeout = setTimeout(() => {
			mapWorker?.postMessage([projection, center, scale, countries50, lastRender]);
		}, 100);
	}

	$: {
		if (projection === 'azimuthal') _projection.rotate([-center[0], -center[1]]);
		if (projection === 'mercator') _projection.center([0, center[1]]).rotate([-center[0], 0]);
		_projection = _projection.scale(Math.pow(10, scale));
		path = geoPath(_projection);
		setT();
		countries = countries110.map((e) => path(e)!);
		_countries = countries110;
	}

	let countries110 = feature(
		world110 as Topology<any>,
		world110.objects.countries as GeometryCollection
	).features;
	let countries50 = feature(
		world50 as Topology<any>,
		world50.objects.countries as GeometryCollection
	).features;

	function getColor(i: number) {
		const country = (_countries?.[i]?.properties as any)?.name ?? '';
		return countryColors[country] ?? '#fff6';
	}

	function scrolled(e: WheelEvent) {
		zoomOut(e.deltaY * 0.001);
		e.preventDefault();
	}
</script>

<div class="relative">
	<svg viewBox="0 0 975 610" width="100%" height="100%" on:wheel={scrolled}>
		<path d={path({ type: 'Sphere' })} fill="#fff2" stroke="none" />

		{#each countries as country, i}
			<path d={country} fill={getColor(i)} stroke="#0009" />
		{/each}

		{#if showGridsquares}
			{@const div = 20}
			{@const subdiv = 5}
			<path
				d={path({
					type: 'MultiLineString',
					coordinates: [
						...Array(360 / div)
							.fill(0)
							.map((_, yi) =>
								Array(360 / subdiv + 1)
									.fill(0)
									.map((_, i) => [i * subdiv, yi * (div / 2) - 90])
							),

						...Array(360 / div)
							.fill(0)
							.map((_, xi) => [
								[xi * div, -90],
								[xi * div, 0],
								[xi * div, 90]
							])
					]
				})}
				fill="none"
				stroke="#fff4"
			/>
			<!-- {#each Array(180 / (div / 2)).fill(0) as _, yi}
				{#each Array(360 / div).fill(0) as _, xi}
					{@const [x, y] = _projection([xi * div, yi * (div / 2) - 90]) ?? [0, 0]}
					<text {x} {y} fill="#f00" font-size="30">
						{xi * div}/{yi * (div / 2) - 90}
					</text>
				{/each}
			{/each} -->
		{/if}

		{#each lines as line}
			<path d={path({ type: 'LineString', coordinates: line })} fill="none" stroke="#f80" />
		{/each}

		{#each points as point}
			{@const [x, y] = _projection(point) ?? [0, 0]}
			<circle cx={x} cy={y} r="6" fill="#f80" />
			<circle cx={x} cy={y} r="4" fill="#34c" />
			<circle cx={x} cy={y} r="2" fill="#f80" />
		{/each}
	</svg>

	<div class="absolute right-3 top-3 flex flex-col gap-2">
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="btn btn-circle btn-sm">
				<Fa icon={faCog} />
			</div>
			<div class="dropdown-content pt-2">
				<div class="flex flex-col gap-4 rounded-xl bg-base-300 p-3">
					<div class="flex gap-2">
						<button
							class={`btn btn-sm flex-1 ${projection === 'mercator' ? 'btn-primary' : ''}`}
							on:click={() => (projection = 'mercator')}
						>
							Mercator
						</button>
						<button
							class={`btn btn-sm flex-1 ${projection === 'azimuthal' ? 'btn-primary' : ''}`}
							on:click={() => (projection = 'azimuthal')}
						>
							Azimuthal
						</button>
					</div>
					<div>
						<div class="text-sm">Zoom</div>
						<input
							type="range"
							min="2"
							max="4"
							step="0.1"
							bind:value={scale}
							class="range range-primary range-sm mt-1 w-full"
						/>
					</div>
				</div>
			</div>
		</div>

		<button class="btn btn-circle btn-sm" on:click={() => zoomIn()}>
			<Fa icon={faPlus} />
		</button>

		<button class="btn btn-circle btn-sm" on:click={() => zoomOut()}>
			<Fa icon={faMinus} />
		</button>
	</div>
</div>
