import { DxccEntity } from '../src/lib/dxcc-util';
import { fullBuildTrie, parseCsv, parseDat } from './parser-helper';

export const parseCty = async (data: string, type: 'dat' | 'csv') => {
	const entities: DxccEntity[] = [];
	const prefixes: Map<string, number> = new Map();

	const parser = type === 'dat' ? parseDat : parseCsv;
	for (const entity of parser(data)) {
		const { primaryPrefixRaw, name, dxcc, cont, cqz, ituz, lat, long, timez, otherPrefixes } =
			entity;

		const hasStar = primaryPrefixRaw.startsWith('*');
		const primaryPrefix = primaryPrefixRaw.replace('*', '');
		const entityId = entities.length + 1;

		entities.push({
			id: entityId,
			dxcc: dxcc,
			primaryPrefix,
			name,
			cqz: cqz,
			ituz: ituz,
			cont,
			lat: lat,
			long: long,
			timez: timez
		});

		for (const prefix of otherPrefixes) {
			const find = prefixes.get(prefix);
			if (find) {
				// console.error('Duplicate prefix', prefix, hasStar ? 'Overwriting' : 'Skipping');
				if (hasStar) prefixes.set(prefix, entityId);
			} else {
				prefixes.set(prefix, entityId);
			}
		}
	}
	console.log('Parsed', prefixes.size, 'prefixes');

	// Check for invalid callsigns
	const callsignPattern = /^([A-Z\d]+\/)?([A-Z\d]+\d+[A-Z]+)((?:\/[A-Z\d]+)*)$/i;

	const calls: string[] = [];
	for (const callRaw of prefixes.keys()) {
		if (!callRaw.startsWith('=')) continue;
		const [, call] = callRaw.match(/^=?((?:[A-Z\d/])+)(.*)/)!;
		if (call.match(/^VER(SION|\d{8})$/)) continue;
		const result = call.match(callsignPattern);
		if (!result) {
			calls.push(call);
		}
	}
	console.log('Invalid callsigns:', calls.join(', '));

	const root = fullBuildTrie([...prefixes.entries()]);

	return { entities, root };
};
