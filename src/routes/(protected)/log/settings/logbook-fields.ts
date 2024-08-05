import type { ILog } from '$lib/supabase';
import { dxccEntities, findDxcc } from 'fast-dxcc';
import { writable } from 'svelte/store';

interface Field<T> {
	value: T;
	isPure: boolean;
}

interface LogbookFields {
	isPure: boolean;
	call: Field<string>;
	title: Field<string>;
	dxcc: Field<number>;
	cqz: Field<string>;
	ituz: Field<string>;
	name: Field<string>;
	grid: Field<string>;
}

export const logbookFields = writable<LogbookFields>({
	isPure: true,
	call: { value: '', isPure: true },
	title: { value: '', isPure: true },
	dxcc: { value: 0, isPure: true },
	cqz: { value: '', isPure: true },
	ituz: { value: '', isPure: true },
	name: { value: '', isPure: true },
	grid: { value: '', isPure: true }
});

export function copyFrom(log: ILog | undefined) {
	if (!log) {
		logbookFields.set({
			isPure: true,
			call: { value: '', isPure: true },
			title: { value: '', isPure: true },
			dxcc: { value: 0, isPure: true },
			cqz: { value: '', isPure: true },
			ituz: { value: '', isPure: true },
			name: { value: '', isPure: true },
			grid: { value: '', isPure: true }
		});
		return;
	}

	let dxccs = [...dxccEntities.values()].filter((d) => d.dxcc === log.dxcc);
	let dxccId = dxccs.length == 1 ? dxccs[0].id : undefined;
	if (!dxccId) {
		dxccs = dxccs.filter((d) => d.name === log.country);
		dxccId = dxccs.length == 1 ? dxccs[0].id : undefined;
	}
	if (!dxccId) dxccId = findDxcc(log.call)?.entity.id;
	logbookFields.set({
		isPure: true,
		call: { value: log.call, isPure: true },
		title: { value: log.title ?? '', isPure: true },
		dxcc: { value: dxccId ?? 0, isPure: true },
		cqz: { value: log.cqz?.toString() ?? '', isPure: true },
		ituz: { value: log.ituz?.toString() ?? '', isPure: true },
		name: { value: log.name ?? '', isPure: true },
		grid: { value: log.grid ?? '', isPure: true }
	});
}

export function setCall(call: string) {
	logbookFields.update((fields) => {
		const d = findDxcc(call)?.entity;
		return {
			...fields,
			isPure: false,
			call: { value: call, isPure: false },
			dxcc: fields.dxcc.isPure ? { value: d?.id ?? 0, isPure: true } : fields.dxcc,
			cqz:
				fields.dxcc.isPure && fields.cqz.isPure
					? { value: d?.cqz?.toString() ?? '', isPure: true }
					: fields.cqz,
			ituz:
				fields.dxcc.isPure && fields.ituz.isPure
					? { value: d?.ituz?.toString() ?? '', isPure: true }
					: fields.ituz
		};
	});
}

export function setTitle(title: string) {
	logbookFields.update((fields) => ({
		...fields,
		isPure: false,
		title: { value: title, isPure: false }
	}));
}

export function setDxcc(dxcc: number) {
	const d = dxccEntities.get(dxcc);
	logbookFields.update((fields) => ({
		...fields,
		isPure: false,
		dxcc: { value: dxcc, isPure: false },
		cqz: fields.cqz.isPure && d?.cqz ? { value: d.cqz.toString() ?? '', isPure: true } : fields.cqz,
		ituz:
			fields.ituz.isPure && d?.ituz ? { value: d.ituz.toString() ?? '', isPure: true } : fields.ituz
	}));
}

export function setCqz(cqz: string) {
	logbookFields.update((fields) => ({
		...fields,
		isPure: false,
		cqz: { value: cqz, isPure: false }
	}));
}

export function setItuz(ituz: string) {
	logbookFields.update((fields) => ({
		...fields,
		isPure: false,
		ituz: { value: ituz, isPure: false }
	}));
}

export function setName(name: string) {
	logbookFields.update((fields) => ({
		...fields,
		isPure: false,
		name: { value: name, isPure: false }
	}));
}

export function setGrid(grid: string) {
	logbookFields.update((fields) => ({
		...fields,
		isPure: false,
		grid: { value: grid, isPure: false }
	}));
}
