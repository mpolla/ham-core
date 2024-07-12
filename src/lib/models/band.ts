import bands from '../data/bandplan.json';

export class Band {
	private constructor(
		public readonly name: string,
		public readonly lower: number,
		public readonly upper: number
	) {}

	static readonly ALL_BANDS = new Map<string, Band>(
		bands.map((band) => [band['band'], new Band(band['band'], band['lower'], band['upper'])])
	);

	static getBand(freq: number): Band | null {
		for (const band of Band.ALL_BANDS.values()) {
			if (freq >= band.lower && freq <= band.upper) {
				return band;
			}
		}

		return null;
	}
}
