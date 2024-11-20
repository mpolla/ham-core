import { getContext, setContext } from 'svelte';

function createSelectedQsosState() {
	let state = $state(new Set<number>());

	return {
		get state() {
			return state;
		},
		setOne(qsoId: number, selected: boolean) {
			if (selected) {
				state = state.union(new Set([qsoId]));
			} else {
				state = state.difference(new Set([qsoId]));
			}
		},
		setMany(qsoIds: number[], selected: boolean) {
			if (selected) {
				state = state.union(new Set(qsoIds));
			} else {
				state = state.difference(new Set(qsoIds));
			}
		},
		clear() {
			state = new Set();
		}
	};
}

const SELECTED_STATE = 'SELECTED_STATE';

export function setSelectedQsosContext() {
	return setContext(SELECTED_STATE, createSelectedQsosState());
}

export function getSelectedQsosContext() {
	return getContext<ReturnType<typeof setSelectedQsosContext>>(SELECTED_STATE);
}
