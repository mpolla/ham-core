const overrideRe = /([([<{~])([^)\]>}~]+)[)\]>}~]/g;

export class DxccOverrides {
	public cqz?: number;
	public ituz?: number;
	public lat?: number;
	public long?: number;
	public cont?: string;
	public timez?: number;

	constructor(
		params: {
			cqz?: number;
			ituz?: number;
			lat?: number;
			long?: number;
			cont?: string;
			timez?: number;
		} = {}
	) {
		this.cqz = params.cqz;
		this.ituz = params.ituz;
		this.lat = params.lat;
		this.long = params.long;
		this.cont = params.cont;
		this.timez = params.timez;
	}

	static fromString(data: string): DxccOverrides {
		let cqz: number | undefined;
		let ituz: number | undefined;
		let lat: number | undefined;
		let long: number | undefined;
		let cont: string | undefined;
		let timez: number | undefined;

		for (const match of data.matchAll(overrideRe)) {
			const value = match[2];
			switch (match[1]) {
				case '(':
					cqz = parseInt(value);
					break;
				case '[':
					ituz = parseInt(value);
					break;
				case '{':
					cont = value;
					break;
				case '~':
					timez = parseFloat(value);
					break;
			}
			if (match[1] === '<') {
				const [latR, longR] = value.split('/');
				lat = parseFloat(latR);
				long = parseFloat(longR);
			}
		}
		return new DxccOverrides({ cqz, ituz, lat, long, cont, timez });
	}

	toString(): string {
		return [
			this.cqz ? `(${this.cqz})` : '',
			this.ituz ? `[${this.ituz}]` : '',
			this.cont ? `{${this.cont}}` : '',
			this.timez ? `~${this.timez}~` : '',
			this.lat && this.long ? `<${this.lat}/${this.long}>` : ''
		].join('');
	}

	isEqual(other: DxccOverrides | null): boolean {
		if (!other) return false;
		return (
			this.cqz === other.cqz &&
			this.ituz === other.ituz &&
			this.lat === other.lat &&
			this.long === other.long &&
			this.cont === other.cont &&
			this.timez === other.timez
		);
	}

	/**
	 * Other takes precedence over this.
	 */
	merge(other?: DxccOverrides | null): DxccOverrides {
		if (!other) return this;
		return new DxccOverrides({
			cqz: other.cqz ?? this.cqz,
			ituz: other.ituz ?? this.ituz,
			lat: other.lat ?? this.lat,
			long: other.long ?? this.long,
			cont: other.cont ?? this.cont,
			timez: other.timez ?? this.timez
		});
	}

	isSubsetOf(other: DxccOverrides): boolean {
		return (
			(!this.cqz || this.cqz === other.cqz) &&
			(!this.ituz || this.ituz === other.ituz) &&
			(!this.lat || this.lat === other.lat) &&
			(!this.long || this.long === other.long) &&
			(!this.cont || this.cont === other.cont) &&
			(!this.timez || this.timez === other.timez)
		);
	}
}
