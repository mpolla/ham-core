import { Projection } from '$lib/models/projection';
import {
	geoAzimuthalEqualArea,
	geoAzimuthalEquidistant,
	geoMercator,
	geoPath,
	type GeoPermissibleObjects,
	type GeoProjection
} from 'd3-geo';

self.onmessage = (
	event: MessageEvent<[Projection, [number, number], number, GeoPermissibleObjects[], number]>
) => {
	if (!event.data[3]) return;
	const [proj, center, scale, data, time] = event.data;

	let projection: GeoProjection;
	switch (proj) {
		case Projection.AzimuthalEquidistant:
			projection = geoAzimuthalEquidistant().rotate([-center[0], -center[1]]);
			break;
		case Projection.Mercator:
			projection = geoMercator().center([0, center[1]]).rotate([-center[0], 0]);
			break;
		case Projection.AzimuthalEqualArea:
			projection = geoAzimuthalEqualArea().rotate([-center[0], -center[1]]);
			break;
	}

	projection.scale(Math.pow(10, scale));
	const path = geoPath().projection(projection);
	self.postMessage([data.map((r) => path(r)), time]);
};

export {}; // this is to make typescript happy
