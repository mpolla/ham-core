import { SolarClient } from '$lib/data/solar-client';
import { type RequestHandler, json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const date = url.searchParams.get('date');
	if (!date) return new Response('Missing date parameter', { status: 400 });

	const d = new Date(date);
	const res = await new SolarClient(fetch).getAll(d);

	return json(res);
};
