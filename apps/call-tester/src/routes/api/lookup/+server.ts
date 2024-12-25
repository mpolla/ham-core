import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { findDxcc, type DxccEntity } from 'fast-dxcc';

export const POST: RequestHandler = async ({ request }) => {
	let req;
	try {
		req = await request.json();
	} catch {
		error(400, 'Invalid request body');
	}

	if (!(req instanceof Array)) error(400, 'Invalid request body');

	const res: (DxccEntity | null)[] = [];

	req.forEach((item, i) => {
		if (typeof item !== 'string') error(400, 'Invalid request body item at index ' + i);
		res.push(findDxcc(item)?.entity || null);
	});

	return json(res);
};
