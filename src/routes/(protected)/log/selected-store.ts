import { writable } from 'svelte/store';

export const selectedStore = writable(new Set<number>());

export function setSelected(qsoId: number, selected: boolean): void {
	selectedStore.update((old) => {
		if (selected) {
			old.add(qsoId);
		} else {
			old.delete(qsoId);
		}
		return new Set(old);
	});
}

export function setSelectedAll(qsoIds: number[] | undefined, selected: boolean): void {
	if (!qsoIds) return;
	selectedStore.update((old) => {
		if (selected) {
			qsoIds.forEach((qsoId) => old.add(qsoId));
		} else {
			qsoIds.forEach((qsoId) => old.delete(qsoId));
		}
		return new Set(old);
	});
}

export function clearSelected(): void {
	selectedStore.set(new Set());
}
