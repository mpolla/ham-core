import { findDxcc, type DxccEntity } from 'fast-dxcc';

export const callsignPattern = /^([A-Z\d]+\/)?([A-Z\d]+\d+[A-Z]+)((?:\/[A-Z\d]+)*)$/i;

type CallsignData = {
	secondaryPrefix: string | null;
	basePrefix: string | null;
	baseSuffix: string | null;
	base: string;
	secondarySuffixes: string[];
	baseDxcc: DxccEntity | null;
	fullDxcc: DxccEntity | null;
};

export function parseCallsign(callsign: string): CallsignData | null {
	callsign = callsign.toUpperCase();
	const match = callsign.match(callsignPattern);
	if (!match) {
		return null;
	}

	const secondaryPrefix = match[1]?.slice(0, -1) ?? null;
	const base = match[2];
	const secondarySuffixes = match[3].slice(1).split('/').filter(Boolean);

	const baseDxccResult = findDxcc(base);
	const fullDxccResult = findDxcc(callsign);

	const basePrefix = baseDxccResult ? base.slice(0, baseDxccResult.matchLength) : null;
	const baseSuffix = baseDxccResult ? base.slice(baseDxccResult.matchLength).split('/')[0] : null;

	return {
		secondaryPrefix,
		basePrefix,
		baseSuffix,
		base,
		secondarySuffixes,
		baseDxcc: baseDxccResult?.entity ?? null,
		fullDxcc: fullDxccResult?.entity ?? null
	};
}

export function getSecondarySuffixDescription(suffix: string): string {
	switch (suffix) {
		case 'P':
			return 'Portable';
		case 'M':
			return 'Mobile';
		case 'AM':
			return 'Aeronautical mobile';
		case 'MM':
			return 'Maritime mobile';
		case 'QRP':
			return 'Low power';
		default:
			return 'Alternative location';
	}
}
