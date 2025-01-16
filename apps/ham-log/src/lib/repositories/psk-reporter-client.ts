/**
 * https://pskreporter.info/pskdev.html
 */

import { browser } from '$app/environment';
import { isTauri } from '@tauri-apps/api/core';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { fetch as proxyFetch } from '$lib/utils/proxy-fetch';

export interface RequestParameters {
	/**
	 * Specifies the sending callsign of interest.
	 */
	senderCallsign?: string;

	/**
	 * Specifies the receiving callsign of interest.
	 */
	receiverCallsign?: string;

	/**
	 * Specifies the callsign of interest. Specify only one of these three parameters.
	 */
	callsign?: string;

	/**
	 * A negative number of seconds to indicate how much data to retrieve. This cannot be more than 24 hours.
	 */
	flowStartSeconds?: number;

	/**
	 * The mode of the signal that was detected.
	 */
	mode?: string;

	/**
	 * Limit the number of records returned.
	 */
	rptlimit?: number;

	/**
	 * Only return the reception report records if non zero
	 */
	rronly?: number;

	/**
	 * Do not return the active monitors if non zero
	 */
	noactive?: number;

	/**
	 * A lower and upper limit of frequency. E.g. 14000000-14100000
	 */
	frange?: number;

	/**
	 * If non zero, then include reception reports that do not include a locator.
	 */
	nolocator?: number;

	/**
	 * Causes the returned document to be javascript, and it will invoke the function named in the callback.
	 */
	callback?: string;

	/**
	 * Includes some statistical information
	 */
	statistics?: number;

	/**
	 * If this has the value 'grid' then the callsign are interpreted as grid squares
	 */
	modify?: string;

	/**
	 * Limits search to records with a sequence number greater than or equal to this parameter. The last sequence number in the database is returned on each response.
	 */
	lastseqno?: number;
}

export interface PskResponse {
	currentSeconds: number;
	'time1-startup': number;
	badQrg: {
		[key: string]: {
			[band: string]: number;
		};
	};
	'time2-activeReceivers-cache': number;
	activeReceiver: {
		callsign?: string;
		locator?: string;
		frequency?: number;
		bands?: string;
		region?: string;
		DXCC?: string;
		decoderSoftware?: string;
		antennaInformation?: string;
		mode?: string;
		rigInformation?: string;
	}[];
	lastSequenceNumber: number;
	maxFlowStartSeconds: number;
	receptionReport: {
		isReceiver: number;
		isSender: number;
		receiverCallsign: string;
		receiverDXCC: string;
		reveiverRegion: string;
		receiverLocator: string;
		frequency: number;
		flowStartSeconds: number;
		mode: string;
		senderCallsign: string;
		senderLocator: string;
		senderDXCC: string;
		senderDXCCCode: string;
		senderDXCCLocator: string;
		senderLotwUpload: string;
		senderEqslAuthGuar: string;
		senderRegion: string;
		sNR: number;
	}[];
	receptionReportLimited: {
		oldest: number;
		oldestRequested: number;
	};
	'time3-receptionReport': number;
	activeCallsign: {
		callsign: string;
		reports: number;
		DXCC: string;
		DXCCcode: string;
		frequency: number;
	}[];
	'time4-activeCallsign': number;
	'time5-countryNotification': number;
}

export class PskReporterClient {
	static create(): PskReporterClient {
		if (browser && isTauri()) return new PskReporterClient(tauriFetch);
		if (browser) return new PskReporterClient(proxyFetch);
		return new PskReporterClient(fetch);
	}

	constructor(
		private readonly fetcher: typeof proxyFetch,
		private readonly baseUrl: string = 'https://retrieve.pskreporter.info/query'
		// private readonly baseUrl: string = 'https://pskreporter.info/cgi-bin/pskquery5.pl'
	) {}

	async getPskReport(parameters: RequestParameters): Promise<PskResponse> {
		if (!parameters.callsign) throw new Error('Callsign is required');
		parameters = {
			...parameters,
			callback: 'callback',
			noactive: 1,
			nolocator: 1
		};

		const url = new URL(this.baseUrl)!;
		for (const [key, value] of Object.entries(parameters)) {
			if (!value) continue;
			url.searchParams.set(key, value.toString());
		}

		const res = await this.fetcher(url.toString());
		let text = await res.text();

		const tag = `${parameters.callback}(`;
		const tagStart = text.indexOf(tag);
		if (tagStart !== -1) {
			const tagEnd = text.lastIndexOf(')');
			text = text.slice(tagStart + tag.length, tagEnd);
		}

		return JSON.parse(text);
	}
}
