let nodeCounter = 0;

export class TrieNode {
	public id: number;
	public entity: number | null;
	public exactEntity: number | null;
	public children: Map<string, TrieNode>;

	constructor({
		id,
		entity,
		exactEntity,
		children
	}: {
		id?: number | null;
		entity?: number | null;
		exactEntity?: number | null;
		children?: Map<string, TrieNode>;
	} = {}) {
		if (id) this.id = id;
		else this.id = ++nodeCounter;
		this.entity = entity ?? null;
		this.exactEntity = exactEntity ?? null;
		this.children = children ?? new Map();
	}

	/**
	 * Insert a prefix into the trie.
	 */
	insert(prefix: string, entity: number, isExact: boolean = false): void {
		if (!prefix) {
			if (isExact) {
				if (this.exactEntity && this.exactEntity !== entity)
					throw new Error(`Exact prefix conflict: ${this.exactEntity} vs ${entity}`);
				this.exactEntity = entity;
			} else {
				if (this.entity && this.entity !== entity)
					throw new Error(`Prefix conflict: ${this.entity} vs ${entity}`);
				this.entity = entity;
			}
			return;
		}
		let next = this.children.get(prefix[0]);
		if (!next) {
			next = new TrieNode();
			this.children.set(prefix[0], next);
		}
		next.insert(prefix.slice(1), entity, isExact);
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
	collapseNodes(currentEntity: number | null = null): boolean {
		for (const [k, child] of this.children.entries()) {
			if (child.collapseNodes(this.entity ?? currentEntity)) {
				this.children.delete(k);
			}
		}
		return (
			this.children.size == 0 &&
			(!this.entity || this.entity === currentEntity) &&
			(!this.exactEntity || this.exactEntity === currentEntity)
		);
	}

	/**
	 * Generate a hash for merging nodes.
	 */
	hash(): string {
		const children = [...this.children.entries()]
			.map(([k, v]) => `${k}:${v.id}`)
			.sort()
			.join(',');
		return `${this.entity ?? ''}_${this.exactEntity ?? ''}_${children}`;
	}

	/**
	 * Checks if this node can be merged with another node.
	 */
	canMerge(other: TrieNode): boolean {
		if (this === other) return false;
		if (this.exactEntity !== other.exactEntity) return false;
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
		const s = [`${this.id}`];
		if (this.entity) {
			s.push(`=${this.entity}`);
		}
		if (this.exactEntity) {
			s.push(`!${this.exactEntity}`);
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
			} else if (line.includes('!')) {
				const entity = line.slice(1);
				currentNode!.exactEntity = parseInt(entity);
			} else if (line.startsWith('-')) {
				const [, chars, child] = line.split('-');
				const childNode = getNode(parseInt(child));
				for (const char of chars) {
					currentNode!.children.set(char, childNode);
				}
			} else {
				currentNode = getNode(parseInt(line));
			}
		}

		return root!;
	}
}
