import { browser } from '$app/environment';
import { getDefaultRST } from '$lib';
import { writeAdifFile } from '@ham-core/adif';

export type Qso = {
	call: string;
	qso_date: string;
	time_on: string;
	band: string;
	station_callsign: string;
	freq: string;
	mode: string;
	rst_rcvd: string;
	rst_sent: string;
	tx_pwr: string;
	operator: string;
};

const STATE_KEY = 'qsos';

export function createQsosState() {
	let qsos = $state<Qso[]>();

	function addRow() {
		qsos?.push({
			call: '',
			qso_date: '',
			time_on: '',
			band: '',
			station_callsign: '',
			freq: '',
			mode: '',
			rst_rcvd: '',
			rst_sent: '',
			tx_pwr: '',
			operator: ''
		});
	}

	function removeRow(i: number) {
		qsos?.splice(i, 1);
	}

	if (browser) {
		if (localStorage.getItem(STATE_KEY)) {
			qsos = JSON.parse(localStorage.getItem(STATE_KEY)!);
		} else {
			qsos = [];
			addRow();
		}
	}

	$effect(() => {
		localStorage.setItem(STATE_KEY, JSON.stringify(qsos));
	});

	return {
		get qsos() {
			return qsos;
		},
		clearAll() {
			qsos = [];
		},
		addRow,
		removeRow,
		get adifString() {
			if (!qsos || qsos.length === 0) return '';
			const mapped: Qso[] = [qsos[0]];
			for (let i = 1; i < qsos.length; i++) {
				const mode = qsos[i].mode || mapped[i - 1].mode;
				mapped.push({
					call: qsos[i].call,
					qso_date: qsos[i].qso_date || mapped[i - 1].qso_date,
					time_on: qsos[i].time_on || mapped[i - 1].time_on,
					band: qsos[i].band || mapped[i - 1].band,
					station_callsign: qsos[i].station_callsign || mapped[i - 1].station_callsign,
					freq: qsos[i].freq || mapped[i - 1].freq,
					mode: mode,
					rst_rcvd: qsos[i].rst_rcvd || getDefaultRST(mode),
					rst_sent: qsos[i].rst_sent || getDefaultRST(mode),
					tx_pwr: qsos[i].tx_pwr || mapped[i - 1].tx_pwr,
					operator: qsos[i].operator || mapped[i - 1].operator
				});
			}
			return writeAdifFile(
				{
					header: {
						ADIF_VER: '3.1.5',
						PROGRAMID: 'ADIF Tools'
					},
					records: mapped
				},
				{ fieldSep: ' ', rowSep: '\n' }
			).trim();
		}
	};
}
