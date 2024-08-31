import type { Projection } from '$lib/models/projection';
import { writable } from 'svelte/store';

interface MapStore {
	projection?: Projection;
	showGridsquares?: boolean;
	showNight?: boolean;
}

const state = (() => {
	const value = localStorage.getItem('map-store') || '{}';
	return JSON.parse(value) as MapStore;
})();

export const mapStore = writable<MapStore>(state);

mapStore.subscribe((value) => {
	localStorage.setItem('map-store', JSON.stringify(value));
});

export function setProjection(projection: Projection) {
	mapStore.update((value) => ({ ...value, projection }));
}

export function setShowGridsquares(showGridsquares: boolean) {
	mapStore.update((value) => ({ ...value, showGridsquares }));
}

export function setShowNight(showNight: boolean) {
	mapStore.update((value) => ({ ...value, showNight }));
}
