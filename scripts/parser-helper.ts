import { DxccOverrides } from '../src/lib/models/dxcc-overrides';
import { TrieNode } from '../src/lib/models/trie';

export function fullBuildTrie(prefixes: [string, number][]): TrieNode {
	const root = buildTrie(prefixes);
	collapseNodes(root);
	mergeNodes(root);
	minimizeIds(root);
	validateTrie(root, prefixes);
	return root;
}

export function buildTrie(prefixes: [string, number][]): TrieNode {
	const root = new TrieNode();
	for (const [callRaw, entity] of prefixes) {
		const [, call, overridesRaw] = callRaw.match(/^=?((?:[A-Z\d/])+)(.*)/)!;
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

export function mergeNodes(root: TrieNode): void {
	const nodes = new Map([...root.getAllNodes()].map((node) => [node.id, node]));

	const parents: Map<number, TrieNode[]> = new Map();
	for (const node of nodes.values()) {
		for (const child of node.children.values()) {
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

			if (!existing.canMerge(node)) {
				throw new Error('Merge conflict false positive');
			}

			for (const parent of parents.get(node.id) ?? []) {
				for (const [k, v] of parent.children) {
					if (v === node) {
						parent.children.set(k, existing);
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
		const [, call, overridesRaw] = callRaw.match(/^=?((?:[A-Z\d/])+)(.*)/)!;
		const isExact = callRaw.startsWith('=');
		let node: TrieNode | null = root;
		let currentEntity: number | null = null;
		let currentOverrides: DxccOverrides = new DxccOverrides();

		let endOfCall = true;
		for (const c of call) {
			node = node.children.get(c) ?? null;
			if (!node) {
				endOfCall = false;
				break;
			}
			currentEntity = node.entity ?? currentEntity;
			currentOverrides = currentOverrides.merge(node.overrides);
		}
		if (endOfCall && isExact) {
			node = node?.children.get('') ?? null;
			currentEntity = node?.entity ?? currentEntity;
			currentOverrides = currentOverrides.merge(node?.overrides ?? null);
		}

		if (currentEntity !== entity) {
			console.error('Failed to find', call, entity);
			console.log('Found', currentEntity);
		}
		const overrides = DxccOverrides.fromString(overridesRaw);
		if (!overrides.isSubsetOf(currentOverrides)) {
			console.error('Overrides do not match', call, overridesRaw);
			console.log('Found', currentOverrides?.toString());
		}
	}
}

export function minimizeIds(root: TrieNode): void {
	let i = 0;
	for (const node of root.getAllNodes()) {
		node.id = i++;
	}
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
				long: parseFloat(long),
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
				long: parseFloat(long),
				timez: parseFloat(timez),
				otherPrefixes
			};
		})
		.filter(Boolean) as IEntity[];
