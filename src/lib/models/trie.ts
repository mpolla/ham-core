import { DxccOverrides } from './dxcc-overrides';

let nodeCounter = 0;

export class TrieNode {
	public id: number;
	public entity: number | null;
	public overrides: DxccOverrides;
	public children: Map<string, TrieNode>;

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
			this.overrides = this.overrides.merge(overrides ?? null);
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
	 * Returns all the nodes in the trie.
	 */
	getAllNodes(): Set<TrieNode> {
		const nodes: TrieNode[] = [this];
		for (const child of this.children.values()) {
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
		for (const [k, child] of this.children.entries()) {
			if (child.collapseNodes(newEntity, newOverrides)) {
				this.children.delete(k);
			}
		}

		return this.children.size == 0 && !this.entity && !this.overrides.toString();
	}

	/**
	 * Generate a hash for merging nodes.
	 */
	hash(): string {
		const children = [...this.children.entries()]
			.map(([k, v]) => `${k}:${v.id}`)
			.sort()
			.join(',');
		const overrides = this.overrides?.toString() ?? '';
		return `${this.entity ?? ''}_${children}_${overrides}`;
	}

	/**
	 * Checks if this node can be merged with another node.
	 */
	canMerge(other: TrieNode): boolean {
		if (this === other) return false;
		if (this.entity !== other.entity) return false;
		if (!this.overrides.isEqual(other.overrides)) return false;
		// Union set of all children keys
		const l = new Set([...this.children.keys(), ...other.children.keys()]);
		for (const key of l) {
			const a = this.children.get(key);
			const b = other.children.get(key);
			if (a !== b) return false;
		}
		return true;
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
			s.push(`=${this.entity}`);
		}
		for (const c of new Set(this.children.values())) {
			const chars = [];
			for (const [k, v] of this.children) {
				if (v === c) chars.push(k);
			}
			chars.sort();
			s.push(`-${chars.join('')}-${c.id}`);
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
		for (let line of s.trim().split('\n')) {
			line = line.trim();
			if (!line) continue;
			if (line.startsWith('=')) {
				const entity = line.slice(1);
				currentNode!.entity = parseInt(entity);
			} else if (line.startsWith('-')) {
				const [, chars, child] = line.split('-');
				const childNode = getNode(parseInt(child));
				if (chars === '') currentNode!.children.set('', childNode);
				for (const char of chars) {
					currentNode!.children.set(char, childNode);
				}
			} else {
				currentNode = getNode(parseInt(line));
				const overrides = /\d+(.*)/.exec(line)?.[1];
				if (overrides) currentNode.overrides = DxccOverrides.fromString(overrides);
			}
		}

		return root!;
	}
}
