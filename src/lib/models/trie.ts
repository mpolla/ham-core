let nodeCounter = 0;

export class TrieNode {
	public id: number;

	constructor(
		public children: Map<string, TrieNode> = new Map(),
		public entity: number | null = null,
		id: number | null = null
	) {
		if (id) this.id = id;
		else this.id = ++nodeCounter;
	}

	/**
	 * Insert a prefix into the trie.
	 */
	insert(prefix: string, entity: number): void {
		if (!prefix) {
			if (this.entity && this.entity !== entity)
				throw new Error(`Prefix conflict: ${this.entity} vs ${entity}`);
			this.entity = entity;
			return;
		}
		let next = this.children.get(prefix[0]);
		if (!next) {
			next = new TrieNode();
			this.children.set(prefix[0], next);
		}
		next.insert(prefix.slice(1), entity);
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
	 * Checks if this node can be merged with another node.
	 */
	canMerge(other: TrieNode): boolean {
		if (this === other) return false;
		if (this.entity !== other.entity) return false;
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
		const s = [];
		if (this.entity) {
			s.push(`${this.id}=${this.entity}`);
		}
		for (const c of new Set(this.children.values())) {
			const chars = [];
			for (const [k, v] of this.children) {
				if (v === c) chars.push(k);
			}
			chars.sort();
			s.push(`${this.id}-${chars.join('')}-${c.id}`);
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
				node = new TrieNode(undefined, undefined, id);
				nodes.set(id, node);
				// Assert root is the first node
				root ??= node;
			}
			return node;
		}

		for (let line of s.trim().split('\n')) {
			line = line.trim();
			if (!line) continue;
			const parts = line.split('=');
			if (parts.length === 2) {
				const [id, entity] = parts;
				const node = getNode(parseInt(id));
				node.entity = parseInt(entity);
			} else {
				const [id, chars, child] = line.split('-');
				const parent = getNode(parseInt(id));
				const childNode = getNode(parseInt(child));
				for (const char of chars) {
					parent.children.set(char, childNode);
				}
			}
		}

		return root!;
	}
}
