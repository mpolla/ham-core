export interface AdifRecord {
	BAND?: string;
	BAND_RX?: string;
	CALL?: string;
	DXCC?: string;
	FREQ?: string;
	FREQ_RX?: string;
	GRIDSQUARE?: string;
	MODE?: string;
	QSO_DATE?: string;
	QSO_DATE_OFF?: string;
	TIME_OFF?: string;
	TIME_ON?: string;
	[field: string]: string | undefined;
}
