import { Projection } from '$lib/models/projection';

interface MapStore {
	projection?: Projection;
	showGridsquares?: boolean;
	showNight?: boolean;
}

const LOCAL_STORAGE_KEY = 'map-store';

export function createMapState() {
	let state: MapStore;
	try {
		state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
	} catch {
		state = {};
	}

	let projection = $state<Projection>(state.projection ?? Projection.Mercator);
	let showGridsquares = $state<boolean>(state.showGridsquares ?? false);
	let showNight = $state<boolean>(state.showNight ?? true);

	// Type checking
	if (Object.values(Projection).indexOf(projection) === -1) projection = Projection.Mercator;
	if (typeof showGridsquares !== 'boolean') showGridsquares = false;
	if (typeof showNight !== 'boolean') showNight = true;

	$effect(() => {
		localStorage.setItem(
			LOCAL_STORAGE_KEY,
			JSON.stringify({ projection, showGridsquares, showNight })
		);
	});

	return {
		get projection() {
			return projection;
		},
		set projection(value) {
			projection = value;
		},
		get showGridsquares() {
			return showGridsquares;
		},
		set showGridsquares(value) {
			showGridsquares = value;
		},
		get showNight() {
			return showNight;
		},
		set showNight(value) {
			showNight = value;
		}
	};
}

// export type MapState = ReturnType<typeof createMapState>;

// const MAP_STATE = 'MAP_STATE';

// export function setMapContext() {
// 	return setContext<MapState>(MAP_STATE, createMapState());
// }

// export function getMapContext() {
// 	return getContext<MapState>(MAP_STATE);
// }
