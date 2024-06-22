export const capitalize = (s: string) => {
	s = s.toLowerCase();
	const re = /\b\w+/g;
	while (true) {
		const result = re.exec(s);
		if (!result) break;
		s = s.replace(result[0], result[0][0].toUpperCase() + result[0].slice(1));
	}
	return s;
};

export const rangeToString = (start: string, end: string): string => {
	if (start === end) return start;
	if (end.charCodeAt(0) - start.charCodeAt(0) === 1) return start + end;
	return start + '-' + end;
};

export const compactChars = (s: string[]): string => {
	s.sort();
	const ranges = [[s[0], s[0]]];
	for (let i = 1; i < s.length; i++) {
		const last = ranges[ranges.length - 1];
		if (s[i].charCodeAt(0) - last[1].charCodeAt(0) === 1) {
			last[1] = s[i];
		} else {
			ranges.push([s[i], s[i]]);
		}
	}
	return ranges.map(([start, end]) => rangeToString(start, end)).join('');
};
