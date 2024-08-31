<script lang="ts">
	import {
		geoPath,
		geoMercator,
		geoAzimuthalEquidistant,
		geoCircle,
		geoAzimuthalEqualArea
	} from 'd3-geo';
	import { feature } from 'topojson-client';
	import type { Topology, GeometryCollection } from 'topojson-specification';
	import Fa from 'svelte-fa';
	import { faClose, faCog, faExpand, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
	import world110 from '$lib/data/geo/countries-110m.json';
	import world50 from '$lib/data/geo/countries-50m.json';
	import MapWorker from '$lib/helpers/map-worker?worker';
	import { page } from '$app/stores';
	import { pushState } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Projection } from '$lib/models/projection';
	import { mapStore, setProjection, setShowGridsquares, setShowNight } from '$lib/stores/map-store';

	$: projection = $mapStore.projection ?? Projection.Mercator;
	$: showGridsquares = $mapStore.showGridsquares ?? true;
	$: showNight = $mapStore.showNight ?? true;

	export let center: [number, number] = [0, 0];
	export let points: [number, number][] = [];
	export let lines: [[number, number], [number, number]][] = [];
	export let countryColors: Record<string, string> = {};

	$: mapExpanded = $page.state.showExpandedMap;

	let scale = 2.2;
	function setScale(v: number) {
		v = Math.min(4, Math.max(2, v));
		if (v !== scale) scale = v;
	}
	const zoomIn = (f = 0.2) => setScale(scale + f);
	const zoomOut = (f = 0.2) => setScale(scale - f);

	$: _projection = (
		projection === Projection.Mercator
			? geoMercator
			: projection === Projection.AzimuthalEquidistant
				? geoAzimuthalEquidistant
				: geoAzimuthalEqualArea
	)();
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
		if (center) {
			switch (projection) {
				case Projection.AzimuthalEquidistant:
				case Projection.AzimuthalEqualArea:
					_projection.rotate([-center[0], -center[1]]);
					break;
				case Projection.Mercator:
					_projection.center([0, center[1]]).rotate([-center[0], 0]);
					break;
			}
		}
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

	function getColor(i: number, c: any) {
		const country = (c?.[i]?.properties as any)?.name ?? '';
		return countryColors[country] ?? '#9b9';
	}

	function scrolled(e: WheelEvent) {
		zoomOut(e.deltaY * 0.001);
		e.preventDefault();
	}

	// Sun position
	const getSun = (date: Date) => {
		const start = new Date(date.getUTCFullYear(), 0, 0);
		const diff = date.valueOf() - start.valueOf();
		const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

		// Calculate solar declination (latitude)
		const latitude = -23.44 * Math.cos((360 * (dayOfYear + 10) * Math.PI) / 180 / 365);

		// Calculate the time difference from UTC in hours
		const utcTime = date.getUTCHours() + date.getUTCMinutes() / 60;

		// Calculate the longitude
		const longitude = (utcTime - 12) * 15;
		return [-longitude, latitude];
	};
	let sun = getSun(new Date());

	onMount(() => {
		const interval = setInterval(() => {
			sun = getSun(new Date());
		}, 60000);
		return () => clearInterval(interval);
	});

	let settingsOpen = false;
</script>

<div class={mapExpanded ? 'fixed inset-0 z-40 flex p-8 [&>*]:flex-1' : ''}>
	{#if mapExpanded}
		<button class="absolute inset-0 bg-base-300/80" on:click={() => history.back()} />
	{/if}

	<div class="relative">
		<svg viewBox="0 0 975 610" width="100%" height="100%" on:wheel={scrolled}>
			<path d={path({ type: 'Sphere' })} fill="#335" stroke="none" />

			{#each countries as country, i}
				<path d={country} fill={getColor(i, _countries)} stroke="#0009" />
			{/each}

			{#if showNight}
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

			{#if showGridsquares}
				{@const div = 20}
				{@const subdiv = 3}
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
					stroke="#6669"
				/>
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

		<div class="absolute right-3 top-3 flex flex-col gap-2 [&>*]:z-20">
			{#if settingsOpen}
				<button class="fixed inset-0 z-10 cursor-auto" on:click={() => (settingsOpen = false)} />
			{/if}

			<button
				class="btn btn-circle btn-sm"
				on:click={mapExpanded
					? () => history.back()
					: () => pushState('', { showExpandedMap: true })}
			>
				<Fa icon={mapExpanded ? faClose : faExpand} />
			</button>

			<div class="relative">
				<button class="btn btn-circle btn-sm" on:click={() => (settingsOpen = !settingsOpen)}>
					<Fa icon={faCog} />
				</button>

				<div class={`absolute right-[calc(100%+.5rem)] top-0 ${settingsOpen ? '' : 'hidden'}`}>
					<div class="flex flex-col gap-4 rounded-xl bg-base-300 p-3">
						<div class="flex gap-2">
							<button
								class={`btn btn-sm flex-1 ${projection === Projection.Mercator ? 'btn-primary' : ''}`}
								on:click={() => setProjection(Projection.Mercator)}
							>
								Mercator
							</button>
							<button
								class={`btn btn-sm flex-1 ${projection === Projection.AzimuthalEquidistant ? 'btn-primary' : ''}`}
								on:click={() => setProjection(Projection.AzimuthalEquidistant)}
							>
								Azimuthal ED
							</button>
							<button
								class={`btn btn-sm flex-1 ${projection === Projection.AzimuthalEqualArea ? 'btn-primary' : ''}`}
								on:click={() => setProjection(Projection.AzimuthalEqualArea)}
							>
								Azimuthal EA
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
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text">Show grid squares</span>
								<input
									type="checkbox"
									checked={showGridsquares}
									on:input={() => setShowGridsquares(!showGridsquares)}
									class="checkbox-primary checkbox checkbox-sm"
								/>
							</label>
						</div>
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text">Show Night</span>
								<input
									type="checkbox"
									checked={showNight}
									on:input={() => setShowNight(!showNight)}
									class="checkbox-primary checkbox checkbox-sm"
								/>
							</label>
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
</div>
