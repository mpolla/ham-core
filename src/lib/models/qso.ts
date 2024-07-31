import type { ILog, IQso } from '$lib/supabase';

export class Qso implements IQso {
	public band: string | null;
	public call: string;
	public comment: string | null;
	public cont: string | null;
	public country: string | null;
	public created_at: string;
	public datetime: string;
	public dxcc: number;
	public frequency: number;
	public gridsquare: string | null;
	public id: number;
	public log_id: number | null;
	public mode: string;
	public other: { [field: string]: string };
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
		let time = this.datetime.substring(11, 19).replace(/:/g, '');
		if (time.substring(4) === '00') time = time.substring(0, 4);
		const ret = {
			...this.other,
			BAND: this.band || undefined,
			CALL: this.call,
			COMMENT: this.comment || undefined,
			CONT: this.cont || undefined,
			COUNTRY: this.country || undefined,
			QSO_DATE: this.datetime.substring(0, 10).replace(/-/g, ''),
			TIME_ON: time,
			DXCC: this.dxcc.toString(),
			FREQ: (this.frequency / 1e6).toString(),
			MODE: this.mode,
			RST_RCVD: this.rst_rcvd || undefined,
			RST_SENT: this.rst_sent || undefined,
			TX_PWR: this.power?.toString(),
			GRIDSQUARE: this.gridsquare || undefined,
			// Log info
			STATION_CALLSIGN: log?.call,
			// TODO OPERATOR
			// TODO OWNER_CALLSIGN
			MY_COUNTRY: log?.country,
			MY_DXCC: log?.dxcc.toString(),
			MY_CQ_ZONE: log?.cqz?.toString() || undefined,
			MY_ITU_ZONE: log?.ituz?.toString() || undefined,
			MY_GRIDSQUARE: log?.grid || undefined,
			MY_NAME: log?.name || undefined
			// TODO MY_RIG
		};
		return Object.fromEntries(Object.entries(ret).filter(([, v]) => v !== undefined)) as {
			[field: string]: string;
		};
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
			datetime: this.formatAdifDateTime(adif.QSO_DATE, adif.TIME_ON),
			dxcc: +adif.DXCC || 0,
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

	private static formatAdifDateTime(date: string, time: string): string {
		date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
		time = `${time.substring(0, 2)}:${time.substring(2, 4)}:${time.substring(4, 6) || '00'}`;
		return `${date}T${time}Z`;
	}
}
