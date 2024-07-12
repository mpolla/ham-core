import modes from '../data/modes.json';

export class Mode {
	public readonly subModes: Mode[] = [];

	private constructor(
		public readonly name: string,
		sumModes: string[] = []
	) {
		for (const subMode of sumModes) {
			this.subModes.push(new Mode(subMode));
		}
	}

	static readonly ALL_MODES = new Map<string, Mode>(
		modes.map((mode) => [mode[0], new Mode(mode[0], mode.slice(1))])
	);
}
