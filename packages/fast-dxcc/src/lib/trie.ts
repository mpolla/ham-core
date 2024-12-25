import { DxccOverrides } from './dxcc-overrides';

let nodeCounter = 0;

export class TrieNode {
	public id: number;
	public entity: number | null;
	public overrides: DxccOverrides;
	public children: Map<string, TrieNode>;
	public shortcuts: Map<string, TrieNode>;

	constructor({
		id,
		entity,
		overrides,
		children
	}: {
		id?: number | null;
		entity?: number | null;
		overrides?: DxccOverrides;
		children?: Map<string, TrieNode>;
	} = {}) {
		if (id) this.id = id;
		else this.id = ++nodeCounter;
		this.entity = entity ?? null;
		this.children = children ?? new Map();
		this.overrides = overrides ?? new DxccOverrides();
		this.shortcuts = new Map();
	}

	/**
	 * Insert a prefix into the trie.
	 */
	insert(
		prefix: string,
		entity: number,
		isExact: boolean = false,
		overrides?: DxccOverrides
	): void {
		if (!prefix) {
			if (isExact) {
				const child = this.children.get('');
				if (child) throw new Error(`Exact prefix conflict: ${child.entity} vs ${entity}`);
				this.children.set('', new TrieNode({ entity, overrides }));
				return;
			}

			if (this.entity && this.entity !== entity)
				throw new Error(`Prefix conflict: ${this.entity} vs ${entity}`);
			this.entity = entity;

			if (this.overrides.toString() && overrides && !this.overrides.isEqual(overrides)) {
				throw new Error(
					`Overrides conflict: ${JSON.stringify(this.overrides)} vs ${JSON.stringify(overrides)}`
				);
			}
			this.overrides = this.overrides.merge(overrides);
			return;
		}

		let next = this.children.get(prefix[0]);
		if (!next) {
			next = new TrieNode();
			this.children.set(prefix[0], next);
		}
		next.insert(prefix.slice(1), entity, isExact, overrides);
	}

	/**
	 * Traverse the trie to find the node that matches the prefix.
	 */
	findRaw(prefix: string): TrieNode | null {
		if (!prefix) return this;
		const next = this.children.get(prefix[0]);
		return next ? next.findRaw(prefix.slice(1)) : null;
	}

	/**
	 * Step through the trie to find the next node that matches the prefix.
	 */
	step(prefix: string): { node: TrieNode; length: number } | null {
		// Check for exact match
		if (!prefix) {
			const exact = this.children.get('');
			return exact ? { node: exact, length: 0 } : null;
		}
		// Check for children
		const next = this.children.get(prefix[0]);
		if (next) return { node: next, length: 1 };
		// Check for shortcuts
		for (const [k, v] of this.shortcuts) {
			if (prefix.startsWith(k)) return { node: v, length: k.length };
		}
		return null;
	}

	/**
	 * Find the DXCC entity that matches the prefix.
	 */
	findDxcc(prefix: string): RawDxccResult {
		if (!prefix) {
			const exact = this.children.get('');
			// console.log(prefix, exact);
			return {
				entityId: exact?.entity ?? this.entity,
				dxccOverrides: this.overrides.merge(exact?.overrides),
				matchLength: 0,
				isExact: !!exact
			};
		}

		const next = this.step(prefix);
		if (!next) {
			// console.log(prefix, this);
			return {
				entityId: this.entity,
				dxccOverrides: this.overrides,
				matchLength: 0,
				isExact: false
			};
		}

		const ret = next.node.findDxcc(prefix.slice(next.length));

		// console.log(prefix, ret);

		const anyC = ret.dxccOverrides.toString() || ret.entityId;
		return {
			dxccOverrides: this.overrides.merge(ret?.dxccOverrides),
			entityId: ret?.entityId ?? this.entity,
			isExact: ret?.isExact ?? false,
			matchLength: ret.matchLength + (anyC ? next.length : 0)
		};
	}

	/**
	 * Returns all the nodes in the trie.
	 */
	getAllNodes(): Set<TrieNode> {
		const nodes: TrieNode[] = [this];
		for (const child of [...this.children.values(), ...this.shortcuts.values()]) {
			nodes.push(...child.getAllNodes());
		}
		return new Set(nodes);
	}

	/**
	 * Collapse nodes that do not cause changes.
	 * Returns true if node can be deleted, false otherwise.
	 */
	collapseNodes(
		currentEntity: number | null = null,
		currentOverrides: DxccOverrides = new DxccOverrides()
	): boolean {
		if (currentEntity && currentEntity === this.entity) this.entity = null;
		if (currentOverrides.cqz && currentOverrides.cqz === this.overrides.cqz)
			this.overrides.cqz = undefined;
		if (currentOverrides.ituz && currentOverrides.ituz === this.overrides.ituz)
			this.overrides.ituz = undefined;
		if (currentOverrides.cont && currentOverrides.cont === this.overrides.cont)
			this.overrides.cont = undefined;
		if (currentOverrides.lat && currentOverrides.lat === this.overrides.lat)
			this.overrides.lat = undefined;
		if (currentOverrides.long && currentOverrides.long === this.overrides.long)
			this.overrides.long = undefined;
		if (currentOverrides.timez && currentOverrides.timez === this.overrides.timez)
			this.overrides.timez = undefined;

		const newEntity = this.entity ?? currentEntity;
		const newOverrides = currentOverrides.merge(this.overrides);
		for (const [k, child] of [...this.children.entries(), ...this.shortcuts.entries()]) {
			if (child.collapseNodes(newEntity, newOverrides)) {
				this.children.delete(k);
			}
		}

		return (
			this.children.size === 0 &&
			this.shortcuts.size === 0 &&
			!this.entity &&
			!this.overrides.toString()
		);
	}

	buildShortcuts(): void {
		for (const child of new Set(this.children.values())) {
			let k: string | null = null;
			for (const [key, value] of this.children.entries()) {
				if (value === child) {
					if (k) {
						k = null;
						break;
					}
					k = key;
				}
			}
			if (!k) continue;
			if (child.children.size + child.shortcuts.size !== 1) continue;

			let curr = child;
			let stack = k;
			while (
				curr.children.size + curr.shortcuts.size === 1 &&
				!curr.entity &&
				!curr.overrides.toString()
			) {
				const [key, value] = [...curr.children.entries(), ...curr.shortcuts.entries()][0];
				if (key === '') break;
				curr = value;
				stack += key;
			}

			if (stack.length < 2) continue;

			this.shortcuts.set(stack, curr);
			this.children.delete(k);
		}
	}

	/**
	 * Generate a hash for merging nodes.
	 */
	hash(): string {
		const children = [...this.children.entries(), ...this.shortcuts.entries()]
			.map(([k, v]) => `${k}:${v.id}`)
			.sort()
			.join(',');
		const overrides = this.overrides?.toString() ?? '';
		return `${this.entity ?? ''}_${children}_${overrides}`;
	}

	/**
	 * Returns an encoded string of the whole trie.
	 */
	encodeToString(): string {
		return [...this.getAllNodes()].map((n) => n._encodeToString()).join('\n');
	}

	_encodeToString(): string {
		const overrides = this.overrides?.toString() ?? '';
		const s = [`${this.id}${overrides}`];
		if (this.entity) {
			s[0] += `=${this.entity}`;
		}
		for (const c of new Set(this.children.values())) {
			const chars = [];
			for (const [k, v] of this.children) {
				if (v === c) chars.push(k);
			}
			chars.sort();
			s.push(`-${chars.join('')}-${c.id}`);
		}
		for (const [k, v] of this.shortcuts.entries()) {
			s.push(`>${k}-${v.id}`);
		}
		return s.join('\n');
	}

	/**
	 * Decodes a trie from an encoded string.
	 */
	static decodeFromString(s: string): TrieNode {
		let root: TrieNode | null = null;
		const nodes: Map<number, TrieNode> = new Map();
		function getNode(id: number): TrieNode {
			let node = nodes.get(id);
			if (!node) {
				node = new TrieNode({ id });
				nodes.set(id, node);
				// Assert root is the first node
				root ??= node;
			}
			return node;
		}

		let currentNode: TrieNode | null = null;
		for (let line of s.split('\n')) {
			line = line.trim();
			if (!line) continue;
			if (line.startsWith('-')) {
				const [, chars, child] = line.split('-');
				const childNode = getNode(parseInt(child));
				if (chars === '') currentNode!.children.set('', childNode);
				for (const char of chars) {
					currentNode!.children.set(char, childNode);
				}
			} else if (line.startsWith('>')) {
				const [shortcut, child] = line.slice(1).split('-');
				const childNode = getNode(parseInt(child));
				currentNode!.shortcuts.set(shortcut, childNode);
			} else {
				currentNode = getNode(parseInt(line));
				const match = /\d+(=\d+)?(.*)/.exec(line);
				const entity = match?.[1];
				if (entity) currentNode.entity = parseInt(entity.slice(1));
				const overrides = match?.[2];
				if (overrides) currentNode.overrides = DxccOverrides.fromString(overrides);
			}
		}

		return root!;
	}
}

export interface RawDxccResult {
	entityId: number | null;
	dxccOverrides: DxccOverrides;
	matchLength: number;
	isExact: boolean;
}
