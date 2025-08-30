import { DxccOverrides } from '../src/lib/dxcc-overrides';
import { TrieNode } from '../src/lib/trie';

export function fullBuildTrie(prefixes: [string, number][]): TrieNode {
	const root = buildTrie(prefixes);
	collapseNodes(root);
	buildShortcuts(root);
	mergeNodes(root);
	minimizeIds(root);
	validateTrie(root, prefixes);
	return root;
}

export function buildTrie(prefixes: [string, number][]): TrieNode {
	const root = new TrieNode();
	for (const [callRaw, entity] of prefixes) {
		const [, call, overridesRaw] = callRaw.match(/^=?([A-Z\d/]+)(.*)$/)!;
		const isExact = callRaw.startsWith('=');
		const overrides = DxccOverrides.fromString(overridesRaw);
		root.insert(call, entity, isExact, overrides);
	}

	console.log('Built trie with', root.getAllNodes().size, 'nodes');
	return root;
}

export function collapseNodes(root: TrieNode): void {
	root.collapseNodes();

	console.log('Collapsed trie with', root.getAllNodes().size, 'nodes');
}

export function buildShortcuts(root: TrieNode): void {
	for (const node of root.getAllNodes()) {
		node.buildShortcuts();
	}

	console.log('Built shortcuts with', root.getAllNodes().size, 'nodes');
}

export function mergeNodes(root: TrieNode): void {
	const nodes = new Map([...root.getAllNodes()].map((node) => [node.id, node]));

	const parents: Map<number, TrieNode[]> = new Map();
	for (const node of nodes.values()) {
		for (const child of [...node.children.values(), ...node.shortcuts.values()]) {
			const list = parents.get(child.id) ?? [];
			list.push(node);
			parents.set(child.id, list);
		}
	}

	let anyChanged = true;
	while (anyChanged) {
		anyChanged = false;

		const hashed = new Map<string, TrieNode>();
		for (const node of nodes.values()) {
			const hash = node.hash();
			const existing = hashed.get(hash);
			if (!existing) {
				hashed.set(hash, node);
				continue;
			}

			for (const parent of parents.get(node.id) ?? []) {
				for (const [k, v] of parent.children) {
					if (v === node) {
						parent.children.set(k, existing);
					}
				}
				for (const [k, v] of parent.shortcuts) {
					if (v === node) {
						parent.shortcuts.set(k, existing);
					}
				}
			}
			parents.delete(node.id);
			nodes.delete(node.id);
			anyChanged = true;
		}
	}

	console.log('Finished merge with', nodes.size, 'nodes');
}

export function validateTrie(root: TrieNode, prefixes: [string, number][]): void {
	for (const [callRaw, entity] of prefixes) {
		const [, call, overridesRaw] = callRaw.match(/^=?([A-Z\d/]+)(.*)$/)!;
		const isExact = callRaw.startsWith('=');

		const node = root.findDxcc(call + (isExact ? '' : ' '));

		if (node?.entityId !== entity) {
			console.log('Failed to find', call, entity);
			console.log('Found', node?.entityId);
		}
		const overrides = DxccOverrides.fromString(overridesRaw);
		if (!overrides.isSubsetOf(node?.dxccOverrides)) {
			console.log('Overrides do not match', call, overridesRaw);
			console.log('Found', node?.dxccOverrides.toString());
		}
	}

	console.log('Finished validation');
}

export function minimizeIds(root: TrieNode): void {
	const counter = new Map<TrieNode, number>();

	for (const node of root.getAllNodes()) {
		counter.set(node, counter.get(node) ?? 0);
		for (const c of [...node.children.values(), ...node.shortcuts.values()]) {
			counter.set(node, (counter.get(c) ?? 0) + 1);
		}
	}

	const nodes = [...counter];
	nodes.sort((a, b) => {
		if (a[1] !== b[1]) return b[1] - a[1];
		return a[0].id - b[0].id;
	});

	let i = 0;
	for (const node of nodes) {
		node[0].id = i++;
	}

	const ids = nodes.map((n) => n[0].id);
	console.log('Minimized ids', Math.min(...ids), '-', Math.max(...ids));
}

interface IEntity {
	name: string;
	dxcc?: number;
	primaryPrefixRaw: string;
	cont: string;
	cqz: number;
	ituz: number;
	lat: number;
	long: number;
	timez: number;
	otherPrefixes: string[];
}

export const parseCsv = (file: string): IEntity[] =>
	file
		.trim()
		.split(';')
		.map<IEntity | null>((entity) => {
			entity = entity.trim();
			if (!entity) return null;

			const [primaryPrefixRaw, name, dxcc, cont, cqz, ituz, lat, long, timez, otherPrefixesRaw] =
				entity.split(',').map((s) => s.trim());

			const otherPrefixes = otherPrefixesRaw.split(' ').map((s) => s.trim());

			return {
				name,
				dxcc: parseInt(dxcc),
				primaryPrefixRaw,
				cont,
				cqz: parseInt(cqz),
				ituz: parseInt(ituz),
				lat: parseFloat(lat),
				long: -parseFloat(long),
				timez: parseFloat(timez),
				otherPrefixes
			};
		})
		.filter(Boolean) as IEntity[];

export const parseDat = (file: string): IEntity[] =>
	file
		.trim()
		.split(';')
		.map<IEntity | null>((entity) => {
			entity = entity.trim();
			if (!entity) return null;

			const [name, cqz, ituz, cont, lat, long, timez, primaryPrefixRaw, otherPrefixesRaw] = entity
				.split(':')
				.map((s) => s.trim());

			const otherPrefixes = otherPrefixesRaw.split(',').map((s) => s.trim());

			return {
				name,
				primaryPrefixRaw,
				cont,
				cqz: parseInt(cqz),
				ituz: parseInt(ituz),
				lat: parseFloat(lat),
				long: -parseFloat(long),
				timez: parseFloat(timez),
				otherPrefixes
			};
		})
		.filter(Boolean) as IEntity[];
