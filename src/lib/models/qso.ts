import type { QsoType } from '$lib/supabase';

export class Qso implements QsoType {
	public call: string;
	public comment: string | null;
	public country: string | null;
	public created_at: string;
	public datetime: string;
	public dxcc: number;
	public frequency: number;
	public id: number;
	public mode: string;
	public other: { [field: string]: string };
	public power: number | null;
	public profile_id: number | null;
	public rst_rcvd: string | null;
	public rst_sent: string | null;
	public updated_at: string;
	public user_id: string;

	constructor(fields: QsoType) {
		this.call = fields.call;
		this.comment = fields.comment;
		this.country = fields.country;
		this.created_at = fields.created_at;
		this.datetime = fields.datetime;
		this.dxcc = fields.dxcc;
		this.frequency = fields.frequency;
		this.id = fields.id;
		this.mode = fields.mode;
		this.other = fields.other as { [field: string]: string };
		this.power = fields.power;
		this.profile_id = fields.profile_id;
		this.rst_rcvd = fields.rst_rcvd;
		this.rst_sent = fields.rst_sent;
		this.updated_at = fields.updated_at;
		this.user_id = fields.user_id;
	}

	toAdif(): { [field: string]: string | undefined } {
		let time = this.datetime.substring(11, 19).replace(/:/g, '');
		if (time.substring(4) === '00') time = time.substring(0, 4);
		return {
			...this.other,
			CALL: this.call,
			COMMENT: this.comment || undefined,
			COUNTRY: this.country || undefined,
			QSO_DATE: this.datetime.substring(0, 10).replace(/-/g, ''),
			TIME_ON: time,
			DXCC: this.dxcc.toString(),
			FREQ: (this.frequency / 1e6).toString(),
			MODE: this.mode,
			RST_RCVD: this.rst_rcvd || undefined,
			RST_SENT: this.rst_sent || undefined,
			TX_PWR: this.power?.toString()
		};
	}

	static fromAdif(adif: { [field: string]: string }): Qso {
		const other = { ...adif };
		delete other.CALL;
		delete other.COMMENT;
		delete other.COUNTRY;
		delete other.QSO_DATE;
		delete other.TIME_ON;
		delete other.DXCC;
		delete other.FREQ;
		delete other.MODE;
		delete other.RST_RCVD;
		delete other.RST_SENT;
		delete other.TX_PWR;

		return new Qso({
			call: adif.CALL,
			comment: adif.COMMENT,
			country: adif.COUNTRY,
			datetime: this.formatAdifDateTime(adif.QSO_DATE, adif.TIME_ON),
			dxcc: +adif.DXCC || 0,
			frequency: parseFloat(adif.FREQ) * 1e6,
			id: 0,
			mode: adif.MODE,
			other,
			power: adif.TX_PWR ? +adif.TX_PWR : null,
			profile_id: null,
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
