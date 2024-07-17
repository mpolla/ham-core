import { parseAdifFile } from '$lib/adif-parser';
import { Qso } from '$lib/models/qso';
import { supabase } from '$lib/supabase';
import { get, writable } from 'svelte/store';

export enum ImportStatus {
	InProgress,
	Success,
	Error
}

export interface FileResult {
	fileName: string;
	result: Promise<{
		qsos: Qso[];
		minDate: Date | undefined;
		maxDate: Date | undefined;
		warnings: string[];
		stationCallsigns: string[];
	}>;
	importStatus?: ImportStatus;
}

export const adifFilesStore = writable<FileResult[] | undefined>(undefined);

export function setFiles(files: FileList | null) {
	console.log(files);
	if (!files) adifFilesStore.set(undefined);
	adifFilesStore.set(
		[...files!].map((file) => {
			const qsosPromise = file.text().then((text) => {
				const res = parseAdifFile(text);
				const warnings = res.warnings.length
					? [`${res.warnings.length} warnings parsing file`]
					: [];
				const stationCallsigns = new Set<string>();

				const qsos = [];
				for (const r of res.result.records) {
					try {
						qsos.push(Qso.fromAdif(r));
						stationCallsigns.add(r.STATION_CALLSIGN);
					} catch (e) {
						console.log(r);
						console.log(e);
						warnings.push(`Error parsing QSO: ${e}`);
					}
				}

				let minDate = undefined;
				let maxDate = undefined;
				for (const qso of qsos) {
					const date = new Date(qso.datetime).valueOf();
					if (!minDate || date < minDate) minDate = date;
					if (!maxDate || date > maxDate) maxDate = date;
				}

				return {
					qsos: qsos ?? [],
					minDate: minDate ? new Date(minDate) : undefined,
					maxDate: maxDate ? new Date(maxDate) : undefined,
					warnings,
					stationCallsigns: [...stationCallsigns]
				};
			});

			return {
				fileName: file.name,
				result: qsosPromise
			};
		})
	);
}

export async function uploadFiles(logId: number) {
	const files = get(adifFilesStore);
	if (!files) return;
	adifFilesStore.set(files.map((f) => ({ ...f, importStatus: ImportStatus.InProgress })));

	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		const { qsos } = await f.result;
		if (!qsos)
			adifFilesStore.update((files) => [
				...files!.slice(0, i),
				{ ...f, importStatus: ImportStatus.Success },
				...files!.slice(i + 1)
			]);

		supabase
			.from('qso')
			.insert(
				qsos.map((qso) => ({
					...qso,
					created_at: undefined,
					updated_at: undefined,
					id: undefined,
					user_id: undefined,
					log_id: logId
				})),
				{
					defaultToNull: false
				}
			)
			.then((res) => {
				adifFilesStore.update((files) => [
					...files!.slice(0, i),
					{ ...f, importStatus: res.error ? ImportStatus.Error : ImportStatus.Success },
					...files!.slice(i + 1)
				]);
			});
	}
}
