import type { ILog } from '$lib/supabase';
import { dxccEntities, findDxcc } from '@ham-core/fast-dxcc';

interface Field<T> {
	value: T;
	isPure: boolean;
}

interface LogbookFields {
	call: Field<string>;
	title: Field<string>;
	dxcc: Field<number>;
	cqz: Field<string>;
	ituz: Field<string>;
	name: Field<string>;
	grid: Field<string>;
}

export function createLogbookFields(initialValue: ILog | undefined) {
	let isPure = $state(true);
	const fields = $state<LogbookFields>({
		call: { value: initialValue?.call ?? '', isPure: true },
		title: { value: initialValue?.title ?? '', isPure: true },
		dxcc: { value: getDxccIdFromLog(initialValue), isPure: true },
		cqz: { value: initialValue?.cqz?.toString() ?? '', isPure: true },
		ituz: { value: initialValue?.ituz?.toString() ?? '', isPure: true },
		name: { value: initialValue?.name ?? '', isPure: true },
		grid: { value: initialValue?.grid ?? '', isPure: true }
	});

	return {
		get isPure() {
			return isPure;
		},
		get call() {
			return fields.call.value;
		},
		set call(value: string) {
			isPure = false;
			fields.call = { value, isPure: false };

			if (fields.dxcc.isPure) {
				const d = findDxcc(value)?.entity;
				fields.dxcc.value = d?.id ?? 0;

				if (fields.cqz.isPure && d?.cqz) {
					fields.cqz.value = d.cqz.toString();
				}
				if (fields.ituz.isPure && d?.ituz) {
					fields.ituz.value = d.ituz.toString();
				}
			}
		},
		get title() {
			return fields.title.value;
		},
		set title(value: string) {
			isPure = false;
			fields.title = { value, isPure: false };
		},
		get dxcc() {
			return fields.dxcc.value;
		},
		set dxcc(value: number) {
			isPure = false;
			fields.dxcc = { value, isPure: false };

			const d = dxccEntities.get(value);
			if (fields.cqz.isPure && d?.cqz) {
				fields.cqz.value = d.cqz.toString();
			}
			if (fields.ituz.isPure && d?.ituz) {
				fields.ituz.value = d.ituz.toString();
			}
		},
		get cqz() {
			return fields.cqz.value;
		},
		set cqz(value: string) {
			isPure = false;
			fields.cqz = { value, isPure: false };
		},
		get ituz() {
			return fields.ituz.value;
		},
		set ituz(value: string) {
			isPure = false;
			fields.ituz = { value, isPure: false };
		},
		get name() {
			return fields.name.value;
		},
		set name(value: string) {
			isPure = false;
			fields.name = { value, isPure: false };
		},
		get grid() {
			return fields.grid.value;
		},
		set grid(value: string) {
			isPure = false;
			fields.grid = { value, isPure: false };
		}
	};
}

function getDxccIdFromLog(log: ILog | undefined) {
	if (!log) return 0;

	let dxccs = [...dxccEntities.values()].filter((d) => d.dxcc === log.dxcc);
	let dxccId = dxccs.length == 1 ? dxccs[0].id : undefined;
	if (!dxccId) {
		dxccs = dxccs.filter((d) => d.name === log.country);
		dxccId = dxccs.length == 1 ? dxccs[0].id : undefined;
	}
	if (!dxccId) dxccId = findDxcc(log.call)?.entity.id;

	return dxccId ?? 0;
}
