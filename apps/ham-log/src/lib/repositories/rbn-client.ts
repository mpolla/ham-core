import { browser } from '$app/environment';
import { isTauri } from '@tauri-apps/api/core';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { fetch as proxyFetch } from '$lib/utils/proxy-fetch';

export interface RbnRequestParameters {
	/** RBN version hash */
	h?: string;
	/** Spotter callsign (de) */
	cde?: string;
	/** Spotted callsign (dx) */
	cdx?: string;
	/** Bands
	 * - 91 - 630m
	 * - 3 - 160m
	 * - 7 - 80m
	 * - 84 - 60m
	 * - 12 - 40m
	 * - 17 - 30m
	 * - 22 - 20m
	 * - 27 - 17m
	 * - 32 - 15m
	 * - 37 - 12m
	 * - 42 - 10m
	 * - 50 - 6m
	 * - 55 - 4m
	 * - 62 - 2m
	 */
	b?: string;
	/** Max age in seconds (eg. 36000) */
	ma?: number;
	/**
	 * Mode
	 * - 1 - CW
	 * - 11 - RTTY
	 * - 10 - PSK31
	 * - 30 - PSK63
	 */
	m?: string;
	/** Min WPM (eg. 10) */
	min_wpm?: number;
	/** Max WPM (eg. 30) */
	max_wpm?: number;
	/** Show spotters (eg. 1) */
	spotters?: string;
	/**
	 * Beacon categories (eg. 1,2,3,4,5)
	 * - 1 - CQ
	 * - 2 - DX
	 * - 3 - BCN
	 * - 4 - /B
	 * - 5 - NCDXF
	 */
	bc?: string;
	/** Last sequence number (eg. 1963015527) */
	s?: number;
	/** Max rows (eg. 40) */
	r?: number;
}

export interface RbnResponse {
	lastid_c: number;
	now: number;
	/** ID: [Spotter, Freq, Spotted, SNR, WPM, TimeString, ?, ?, ?, ?, ?, TimestampS] */
	spots?: {
		[key: number]: [
			string,
			string,
			string,
			number,
			number,
			string,
			number,
			number,
			number,
			number,
			number,
			number
		];
	};
	/** [Callsign, Lat, Long] */
	spotters?: [string, number, number][];
	/** Callsign: [DXCCCode, Country, Continent, Flag, ITUz, CQz, Lat, Long] */
	call_info?: {
		[key: string]: [string, string, string, string, string, string, string, string];
	};
	ver_h: string;
}

export class RbnClient {
	static create(): RbnClient {
		if (browser && isTauri()) return new RbnClient(tauriFetch);
		if (browser) return new RbnClient(proxyFetch);
		return new RbnClient(fetch);
	}

	constructor(
		private readonly fetcher: typeof proxyFetch,
		private readonly baseUrl: string = 'https://www.reversebeacon.net/spots.php'
	) {}

	async getRbnReport(parameters: RbnRequestParameters): Promise<RbnResponse> {
		parameters.h = '4f6ae8';

		const url = new URL(this.baseUrl)!;
		for (const [key, value] of Object.entries(parameters)) {
			if (!value) continue;
			url.searchParams.set(key, value.toString());
		}

		const res = await this.fetcher(url.toString());
		return await res.json();
	}
}
