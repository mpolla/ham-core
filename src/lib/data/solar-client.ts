/*
 * Solar data from https://kp.gfz-potsdam.de/en
 *
 * The meaning of some of the different indices is explained here:
 * https://www.swpc.noaa.gov/sites/default/files/images/u2/TheK-index.pdf
 */

type SolarIndex =
	| 'Kp'
	| 'ap'
	| 'Ap'
	| 'Cp'
	| 'C9'
	| 'Hp30'
	| 'Hp60'
	| 'ap30'
	| 'ap60'
	| 'SN'
	| 'Fobs'
	| 'Fadj';

interface SolarData {
	time: Date;
	value: number;
}

export interface CombinedSolarData {
	time: Date;
	Kp: number;
	Ap: number;
	SN: number;
	flux: number;
}

export class SolarClient {
	constructor(private readonly fetcher: typeof fetch) {}

	/**
	 * Gets the latest planetary K (Kp) index
	 */
	async getKp(date: Date): Promise<SolarData> {
		const r = await this.getGfzData(date, 'Kp');
		if (r.length === 0) throw new Error('No data');
		return r[r.length - 1];
	}

	/**
	 * Gets the planetary A (Ap) index calculated from the past 24 hours
	 */
	async getAp(date: Date): Promise<SolarData> {
		const r = await this.getGfzData(date, 'ap');
		if (r.length === 0) throw new Error('No data');
		const sum = r.reduce((acc, cur) => acc + cur.value, 0);
		return {
			time: r[r.length - 1].time,
			value: Math.round(sum / r.length)
		};
	}

	/**
	 * Gets the number of Sunspots (SN)
	 */
	async getSunspots(date: Date): Promise<SolarData> {
		const r = await this.getGfzData(date, 'SN');
		if (r.length === 0) throw new Error('No data');
		return r[r.length - 1];
	}

	/**
	 * Gets the observed Solar flux (F10.7obs)
	 */
	async getFlux(date: Date): Promise<SolarData> {
		const r = await this.getGfzData(date, 'Fobs');
		if (r.length === 0) throw new Error('No data');
		return r[r.length - 1];
	}

	async getAll(date: Date): Promise<CombinedSolarData> {
		const [Kp, Ap, SN, flux] = await Promise.all([
			this.getKp(date),
			this.getAp(date),
			this.getSunspots(date),
			this.getFlux(date)
		]);
		return {
			time: new Date(
				Math.max(...[Kp.time.valueOf(), Ap.time.valueOf(), SN.time.valueOf(), flux.time.valueOf()])
			),
			Kp: Kp.value,
			Ap: Ap.value,
			SN: SN.value,
			flux: flux.value
		};
	}

	static formatDate(date: Date) {
		return date.toISOString().substring(0, 19) + 'Z';
	}

	async getGfzData(date: Date, index: SolarIndex): Promise<SolarData[]> {
		const dayAgo = new Date(date);
		dayAgo.setDate(dayAgo.getDate() - 10);
		const url = `https://kp.gfz-potsdam.de/app/json/?start=${SolarClient.formatDate(dayAgo)}&end=${SolarClient.formatDate(date)}&index=${index}`;

		const ret: SolarData[] = [];

		const res = await this.fetcher(url).then((res) => res.json());
		for (let i = 0; i < res[index].length; i++) {
			ret.push({
				time: new Date(res['datetime'][i] as string),
				value: res[index][i] as number
			});
		}

		return ret;
	}
}
