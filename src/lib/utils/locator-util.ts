import { getDistance } from './geo-util';

export const locatorRegex = /^[A-R]{2}(?:\d{2}[A-X]{2})*(?:\d{2})?$/i;

export function locatorToLongLat(locator: string, center: boolean = false): [number, number] {
	locator = locator.toUpperCase();
	if (!locatorRegex.test(locator)) {
		throw new Error(`Invalid locator: ${locator}`);
	}

	const aInd = 65;
	const zeroInd = 48;

	let long = 0;
	let lat = 0;

	let div = 1;
	for (let i = 0; i < locator.length; i += 2) {
		const sub = i % 4 == 0 ? aInd : zeroInd;
		long += (locator.charCodeAt(i) - sub) * 2;
		lat += locator.charCodeAt(i + 1) - sub;

		const mult = i % 4 == 0 ? 10 : 24;
		div *= mult;
		long *= mult;
		lat *= mult;
	}

	if (center) {
		long += locator.length % 4 == 0 ? 24 : 10;
		lat += locator.length % 4 == 0 ? 12 : 5;
	}

	long = (long / div) * 10 - 180;
	lat = (lat / div) * 10 - 90;

	return [long, lat];
}

export function getDistanceBetweenLocators(loc1: string, loc2: string): number {
	const [long1, lat1] = locatorToLongLat(loc1, true);
	const [long2, lat2] = locatorToLongLat(loc2, true);
	return getDistance(lat1, long1, lat2, long2);
}
