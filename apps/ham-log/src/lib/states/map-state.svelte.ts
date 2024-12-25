import { Projection } from '$lib/models/projection';
import { createPersistedState } from './persisted-state.svelte';

interface MapStore {
	projection: Projection;
	showGridsquares: boolean;
	showNight: boolean;
}

const LOCAL_STORAGE_KEY = 'map-state';

export function createMapState() {
	const { value: s } = createPersistedState<MapStore>(LOCAL_STORAGE_KEY, {
		projection: Projection.Mercator,
		showGridsquares: false,
		showNight: true
	});

	// TODO on major typia version remove
	if (Object.values(Projection).indexOf(s.projection) === -1) s.projection = Projection.Mercator;
	if (typeof s.showGridsquares !== 'boolean') s.showGridsquares = false;
	if (typeof s.showNight !== 'boolean') s.showNight = true;

	return {
		get projection() {
			return s.projection;
		},
		set projection(value) {
			s.projection = value;
		},
		get showGridsquares() {
			return s.showGridsquares;
		},
		set showGridsquares(value) {
			s.showGridsquares = value;
		},
		get showNight() {
			return s.showNight;
		},
		set showNight(value) {
			s.showNight = value;
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
