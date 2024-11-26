import { Projection } from '$lib/models/projection';
import {
	geoAzimuthalEqualArea,
	geoAzimuthalEquidistant,
	geoGraticule,
	geoMercator,
	type GeoProjection
} from 'd3-geo';

export function createProjection(projection: Projection, center: [number, number]) {
	let p: GeoProjection;
	switch (projection) {
		case Projection.AzimuthalEquidistant:
			p = geoAzimuthalEquidistant();
			break;
		case Projection.AzimuthalEqualArea:
			p = geoAzimuthalEqualArea();
			break;
		case Projection.Mercator:
			p = geoMercator();
			break;
	}
	switch (projection) {
		case Projection.AzimuthalEquidistant:
		case Projection.AzimuthalEqualArea:
			p.rotate([-center[0], -center[1]]);
			break;
		case Projection.Mercator:
			p.center([0, center[1]]).rotate([-center[0], 0]);
			break;
	}
	return p.translate([400, 400]).scale(1000);
}

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
