import type { ILog, IQso } from '$lib/supabase';

const QSOS_PER_QSL = 3;

interface Fields {
	station: string;
	grid: string;
	cqz: string;
	ituz: string;
	call: string;
	via: string;
	date: string;
	time: string;
	freq: string;
	mode: string;
	rst_sent: string;
	power: string;
}

export function generateText(qsos: IQso[], logs: ILog[]): string {
	const mapped = qsos.map((q) => {
		const dt = new Date(q.datetime);
		const log = logs?.find((l) => l.id === q.log_id);
		const ret: Fields = {
			station: log?.call ?? '',
			grid: log?.grid ?? '',
			cqz: log?.cqz?.toString() ?? '',
			ituz: log?.ituz?.toString() ?? '',
			call: q.call,
			via: '',
			date: dt.toISOString().slice(0, 10),
			time: dt.toISOString().slice(11, 16),
			freq: (q.frequency / 1000000).toFixed(3),
			mode: q.mode,
			rst_sent: q.rst_sent ?? '',
			power: q.power ? `${q.power} W` : ''
		};
		return ret;
	});

	mapped.sort((a, b) => {
		if (a.station !== b.station) return a.station.localeCompare(b.station);
		if (a.grid !== b.grid) return a.grid.localeCompare(b.grid);
		if (a.call !== b.call) return a.call.localeCompare(b.call);
		if (a.date !== b.date) return a.date.localeCompare(b.date);
		return a.time.localeCompare(b.time);
	});

	const rows: Fields[][] = [];
	let row: Fields[] = [];
	for (const q of mapped) {
		if (row.length === QSOS_PER_QSL) {
			rows.push(row);
			row = [];
		}
		if (row.length === 0) {
			row = [q];
			continue;
		}
		if (q.station === row[0].station && q.call === row[0].call && q.grid === row[0].grid) {
			row.push(q);
		} else {
			rows.push(row);
			row = [q];
		}
	}
	if (row.length > 0) rows.push(row);

	let text = 'i,Station,Callsign,Via,Grid,Cqz,Ituz';
	for (let i = 1; i <= QSOS_PER_QSL; ++i)
		text += `,Q${i}Date,Q${i}Utc,Q${i}Mhz,Q${i}Mode,Q${i}Rst,Q${i}Pwr`;

	return (
		text +
		'\n' +
		rows
			.map((row, i) => {
				const f = row[0];
				let r = `${i},${f.station},${f.call},${f.via},${f.grid},${f.cqz},${f.ituz}`;
				for (const q of row) {
					r += `,${q.date},${q.time},${q.freq},${q.mode},${q.rst_sent},${q.power}`;
				}
				for (let i = row.length; i < QSOS_PER_QSL; ++i) r += ',,,,,,';
				return r;
			})
			.join('\n')
	);
}

export function generateUrl(csv: string): string {
	const blob = new Blob([csv], { type: 'text/csv' });
	return URL.createObjectURL(blob);
}
