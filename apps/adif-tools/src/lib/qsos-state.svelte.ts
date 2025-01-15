import { browser } from '$app/environment';
import { getDefaultRST } from '$lib';
import { writeAdifFile, type AdifRecord } from '@ham-core/adif';

type Qso = {
	CALL: string;
	QSO_DATE: string;
	TIME_ON: string;
	BAND: string;
	MODE: string;
	RST_RCVD: string;
	RST_SENT: string;
};

const STATE_KEY = 'qsos';

export function createQsosState() {
	let qsos = $state<Qso[]>();

	function addRow() {
		qsos?.push({
			CALL: '',
			QSO_DATE: '',
			TIME_ON: '',
			BAND: '',
			MODE: '',
			RST_RCVD: '',
			RST_SENT: ''
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
			const mapped: AdifRecord[] = [qsos[0]];
			for (let i = 1; i < qsos.length; i++) {
				const MODE = qsos[i].MODE || mapped[i - 1].MODE;
				mapped.push({
					CALL: qsos[i].CALL,
					QSO_DATE: qsos[i].QSO_DATE || mapped[i - 1].QSO_DATE,
					TIME_ON: qsos[i].TIME_ON || mapped[i - 1].TIME_ON,
					BAND: qsos[i].BAND || mapped[i - 1].BAND,
					MODE: MODE,
					RST_RCVD: qsos[i].RST_RCVD || getDefaultRST(MODE),
					RST_SENT: qsos[i].RST_SENT || getDefaultRST(MODE)
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
