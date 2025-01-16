import type { RequestHandler } from '@sveltejs/kit';

const allowedOrigins = [
	'https://kp.gfz-potsdam.de',
	'https://pskreporter.info',
	'https://retrieve.pskreporter.info'
];

export const GET: RequestHandler = async ({ url }) => {
	const b64 = url.searchParams.get('url');
	if (!b64) return new Response('No URL provided', { status: 400 });
	const reqUrl = atob(b64);
	if (!allowedOrigins.some((o) => reqUrl.startsWith(o)))
		return new Response('Origin not allowed', { status: 400 });
	const res = await fetch(reqUrl);
	return new Response(res.body, { status: res.status });
};
