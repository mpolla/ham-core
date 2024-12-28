import { parseAdifFile } from '@ham-core/adif';
import { Qso } from '$lib/models/qso';
import { supabase } from '$lib/supabase';
import type { LogbookState } from '$lib/states/logbook-state.svelte';

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

export function createAdifUploadState(logbook: LogbookState) {
	let files = $state<FileList | null>(null);
	let results = $state<FileResult[] | undefined>(undefined);

	async function uploadReady() {
		if (!results || !logbook.selectedLog) return Promise.resolve(false);
		return Promise.all(results.map((f) => f.result)).then((r) => r.every((f) => f));
	}

	async function upload() {
		if (!results || !logbook.selectedLog) return;
		if (!(await uploadReady())) return;

		const reqs: PromiseLike<void>[] = [];

		for (let i = 0; i < results.length; i++) {
			results[i].importStatus = ImportStatus.InProgress;

			const f = results[i];
			const { qsos } = await f.result;
			if (!qsos) results[i].importStatus = ImportStatus.Success;

			const req = supabase
				.from('qso')
				.insert(
					qsos.map((qso) => ({
						...qso,
						created_at: undefined,
						updated_at: undefined,
						id: undefined,
						user_id: undefined,
						log_id: logbook.logId
					})),
					{
						defaultToNull: false
					}
				)
				.then((res) => {
					if (!results) return;
					results[i].importStatus = res.error ? ImportStatus.Error : ImportStatus.Success;
				});

			reqs.push(req);
		}

		await Promise.all(reqs);
	}

	return {
		get files() {
			return files;
		},
		set files(value) {
			files = value;
			if (!value) results = undefined;
			else results = analyzeFiles(value);
		},
		get results() {
			return results;
		},
		get uploadReady() {
			return uploadReady();
		},
		upload
	};
}

function analyzeFiles(files: FileList) {
	return [...files].map((file) => {
		const qsosPromise = file.text().then((text) => {
			const res = parseAdifFile(text);
			if (res.warnings) console.warn('ADI parsing warnings\n', res.warnings.join('\n'));
			const warnings = res.warnings.length ? [`${res.warnings.length} warnings parsing file`] : [];
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
	});
}
