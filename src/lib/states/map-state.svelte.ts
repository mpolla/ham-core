import { Projection } from '$lib/models/projection';

interface MapStore {
	projection?: Projection;
	showGridsquares?: boolean;
	showNight?: boolean;
}

const LOCAL_STORAGE_KEY = 'map-store';

export function createMapState() {
	const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}') as MapStore;

	let projection = $state<Projection>(state.projection ?? Projection.Mercator);
	let showGridsquares = $state<boolean>(state.showGridsquares ?? false);
	let showNight = $state<boolean>(state.showNight ?? true);

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
