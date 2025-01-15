import type { Json } from '$lib/database.types';
import type { ILog, IQso } from '$lib/supabase';
import { formatAdifDateTime, parseAdifDateTime } from '@ham-core/adif';

export class Qso implements IQso {
	public band: string | null;
	public call: string;
	public comment: string | null;
	public cont: string | null;
	public country: string | null;
	public created_at: string;
	public datetime: string;
	public deleted_at: string | null;
	public dxcc: number | null;
	public frequency: number;
	public gridsquare: string | null;
	public id: number;
	public log_id: number | null;
	public mode: string;
	public other: { [field: string]: Json };
	public power: number | null;
	public rst_rcvd: string | null;
	public rst_sent: string | null;
	public updated_at: string;
	public user_id: string;

	constructor(fields: IQso) {
		this.band = fields.band;
		this.call = fields.call;
		this.comment = fields.comment;
		this.cont = fields.cont;
		this.country = fields.country;
		this.created_at = fields.created_at;
		this.datetime = fields.datetime;
		this.deleted_at = fields.deleted_at;
		this.dxcc = fields.dxcc;
		this.frequency = fields.frequency;
		this.gridsquare = fields.gridsquare;
		this.id = fields.id;
		this.log_id = fields.log_id;
		this.mode = fields.mode;
		this.other = fields.other as { [field: string]: string };
		this.power = fields.power;
		this.rst_rcvd = fields.rst_rcvd;
		this.rst_sent = fields.rst_sent;
		this.updated_at = fields.updated_at;
		this.user_id = fields.user_id;
	}

	toAdif(log?: ILog): { [field: string]: string } {
		const { date, time } = formatAdifDateTime(new Date(this.datetime));
		const ret: { [field: string]: string | null | undefined } = {
			BAND: this.band,
			CALL: this.call,
			COMMENT: this.comment,
			CONT: this.cont,
			COUNTRY: this.country,
			QSO_DATE: date,
			TIME_ON: time,
			DXCC: this.dxcc?.toString(),
			FREQ: (this.frequency / 1e6).toString(),
			MODE: this.mode,
			RST_RCVD: this.rst_rcvd,
			RST_SENT: this.rst_sent,
			TX_PWR: this.power?.toString(),
			GRIDSQUARE: this.gridsquare,
			// Log info
			STATION_CALLSIGN: log?.call,
			// TODO OPERATOR
			// TODO OWNER_CALLSIGN
			MY_COUNTRY: log?.country,
			MY_DXCC: log?.dxcc.toString(),
			MY_CQ_ZONE: log?.cqz?.toString(),
			MY_ITU_ZONE: log?.ituz?.toString(),
			MY_GRIDSQUARE: log?.grid,
			MY_NAME: log?.name
			// TODO MY_RIG
		};

		for (const [k, v] of Object.entries(this.other)) {
			ret[k] ||= v?.toString();
		}

		return Object.fromEntries(
			Object.entries(ret)
				.map(([k, v]) => [k, v || undefined])
				.filter(([, v]) => !!v)
		);
	}

	static fromAdif(adif: { [field: string]: string }): Qso {
		const other = { ...adif };
		delete other.BAND;
		delete other.CALL;
		delete other.COMMENT;
		delete other.CONT;
		delete other.COUNTRY;
		delete other.QSO_DATE;
		delete other.TIME_ON;
		delete other.DXCC;
		delete other.FREQ;
		delete other.MODE;
		delete other.RST_RCVD;
		delete other.RST_SENT;
		delete other.TX_PWR;
		delete other.GRIDSQUARE;
		delete other.STATION_CALLSIGN;
		if (adif.BAND?.toLowerCase() === other.BAND_RX?.toLowerCase()) delete other.BAND_RX;
		if (adif.FREQ === other.FREQ_RX) delete other.FREQ_RX;
		if (adif.GRIDSQUARE) {
			delete other.LAT;
			delete other.LON;
		}
		if (adif.QSO_DATE === other.QSO_DATE_OFF && adif.TIME_ON === other.TIME_OFF) {
			delete other.QSO_DATE_OFF;
			delete other.TIME_OFF;
		}
		for (const key in adif) if (key.startsWith('MY_')) delete other[key];

		return new Qso({
			band: adif.BAND.toLowerCase(),
			call: adif.CALL,
			comment: adif.COMMENT,
			cont: adif.CONT,
			country: adif.COUNTRY,
			datetime: parseAdifDateTime(adif)!.toISOString(),
			deleted_at: null,
			dxcc: adif.DXCC ? +adif.DXCC : null,
			frequency: parseFloat(adif.FREQ) * 1e6,
			gridsquare: adif.GRIDSQUARE,
			id: 0,
			log_id: null,
			mode: adif.MODE,
			other,
			power: adif.TX_PWR ? +adif.TX_PWR : null,
			rst_rcvd: adif.RST_RCVD,
			rst_sent: adif.RST_SENT,
			user_id: '',
			created_at: '',
			updated_at: ''
		});
	}
}
