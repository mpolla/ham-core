import { geoAzimuthalEquidistant, geoMercator, geoPath, type GeoPermissibleObjects } from 'd3-geo';

self.onmessage = (
	event: MessageEvent<
		['mercator' | 'azimuthal', [number, number], number, GeoPermissibleObjects[], number]
	>
) => {
	if (!event.data[3]) return;
	const [proj, center, scale, data, time] = event.data;
	const projection = proj === 'mercator' ? geoMercator() : geoAzimuthalEquidistant();
	if (proj === 'azimuthal') {
		projection.rotate([-center[0], -center[1]]);
	} else {
		projection.center(center);
	}
	projection.scale(Math.pow(10, scale));
	const path = geoPath().projection(projection);
	self.postMessage([data.map((r) => path(r)), time]);
};

export {}; // this is to make typescript happy
