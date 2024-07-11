export const callsignRe = /^(?:[\dA-Z]+\/)?[\dA-Z]+\d+[A-Z]+(?:\/[\dA-Z]+)*$/;
export const advancedCallsignRe =
	/^(?:(?=[^/]*[A-Z])[\dA-Z]+\/)?(?=[\dA-Z]*[A-Z][\dA-Z]*\d)[\dA-Z]+\d+[A-Z]+(?:\/[\dA-Z]+)*$/;
