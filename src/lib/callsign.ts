import { findDxcc } from './dxcc-util';

export const callsignPattern = /^([A-Z\d]+\/)?([A-Z\d]+\d+[A-Z]+)(\/[A-Z\d]+)?$/i;

type CallsignData = {
	secondaryPrefix: string | null;
	basePrefix: string | null;
	baseSuffix: string | null;
	base: string;
	secondarySuffix: string | null;
	suffixPartOf: 'base' | 'prefix' | null;
	suffixDescription?: string;
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
	const baseDxcc = findDxcc(base + '/' + secondarySuffix);
	const prefixDxcc = secondaryPrefix ? findDxcc(callsign) : null;

	const basePrefix = baseDxcc ? base.slice(0, baseDxcc.prefixLength) : null;
	const baseSuffix = baseDxcc ? base.slice(baseDxcc.prefixLength) : null;

	const suffixPartOf = prefixDxcc?.withSuffix
		? 'prefix'
		: !prefixDxcc && baseDxcc?.withSuffix
			? 'base'
			: null;

	return {
		secondaryPrefix,
		basePrefix,
		baseSuffix,
		base,
		secondarySuffix,
		suffixPartOf,
		baseDxcc: baseDxcc?.entity || null,
		prefixDxcc: prefixDxcc?.entity || null
	};
}

export function getSecondarySuffixDescription(callsign: CallsignData): string | null {
	if (!callsign.secondarySuffix) {
		return null;
	}

	if (callsign.suffixPartOf === 'base') {
		return 'Part of prefix';
	}

	if (callsign.suffixPartOf === 'prefix') {
		return 'Part of secondary prefix';
	}

	switch (callsign.secondarySuffix) {
		case 'P':
			return 'Portable';
		case 'M':
			return 'Mobile';
		case 'AM':
			return 'Aeronautical mobile';
		case 'MM':
			return 'Maritime mobile';
	}
	return null;
}
