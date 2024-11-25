import { geoGraticule } from 'd3-geo';

export function getSun(date: Date) {
	const start = new Date(date.getUTCFullYear(), 0, 0);
	const diff = date.valueOf() - start.valueOf();
	const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

	// Calculate solar declination (latitude)
	const latitude = -23.44 * Math.cos((360 * (dayOfYear + 10) * Math.PI) / 180 / 365);

	// Calculate the time difference from UTC in hours
	const utcTime = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

	// Calculate the longitude
	const longitude = (utcTime - 12) * 15;
	return [-longitude, latitude];
}

export const gridFields = geoGraticule().step([20, 10])();
export const gridSquares = geoGraticule().step([2, 1])();
