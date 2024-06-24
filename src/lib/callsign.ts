import { findDxcc } from './dxcc-util';

export const callsignPattern = /^([A-Z\d]+\/)?([A-Z\d]+\d+[A-Z]+)(\/[A-Z\d]+)?$/i;

type CallsignData = {
	secondaryPrefix: string | null;
	basePrefix: string | null;
	baseSuffix: string | null;
	base: string;
	secondarySuffix: string | null;
	baseDxcc: number | null;
	prefixDxcc: number | null;
};

export function parseCallsign(callsign: string): CallsignData | null {
	callsign = callsign.toUpperCase();
	const match = callsign.match(callsignPattern);
	if (!match) {
		return null;
	}

	const secondaryPrefix = match[1]?.slice(0, -1) ?? null;
	const base = match[2];
	const secondarySuffix = match[3]?.slice(1) ?? null;

	const baseWithSuffix = base + (secondarySuffix ? '/' + secondarySuffix : '');
	const baseDxcc = findDxcc(baseWithSuffix);
	const prefixDxcc = secondaryPrefix ? findDxcc(callsign) : null;

	const basePrefix = baseDxcc ? baseWithSuffix.slice(0, baseDxcc.matchLength) : null;
	const baseSuffix = baseDxcc ? baseWithSuffix.slice(baseDxcc.matchLength).split('/')[0] : null;

	return {
		secondaryPrefix,
		basePrefix,
		baseSuffix,
		base,
		secondarySuffix,
		baseDxcc: baseDxcc?.entityId || null,
		prefixDxcc: prefixDxcc?.entityId || null
	};
}

export function getSecondarySuffixDescription(suffix: string): string | null {
	switch (suffix) {
		case 'P':
			return 'Portable';
		case 'M':
			return 'Mobile';
		case 'AM':
			return 'Aeronautical mobile';
		case 'MM':
			return 'Maritime mobile';
		default:
			return null;
	}
}
