import { describe, expect, test } from 'vitest';
import { TrieNode } from './trie';

describe('parseString', () => {
	test('Basic test', () => {
		const encoded = `
            31-YAP-4
            3=401
            31-X-3
            4=400
        `;

		const root = TrieNode.decodeFromString(encoded);

		// Check root node
		expect(root).not.toBe(null);
		expect(root.id).toBe(31);
		expect(root.children.size).toBe(4);
		expect(root.entity).toBe(null);
		expect(new Set([...root.children.keys()])).toEqual(new Set(['Y', 'X', 'A', 'P']));

		// Check children
		const y = root.children.get('Y');
		expect(y).not.toBe(null);
		const a = root.children.get('A');
		expect(a).toBe(y);
		const p = root.children.get('P');
		expect(p).toBe(y);

		expect(y!.id).toBe(4);
		expect(y!.entity).toBe(400);
		expect(y!.children.size).toBe(0);

		const x = root.children.get('X');
		expect(x).not.toBe(null);
		expect(x).not.toBe(y);

		expect(x!.id).toBe(3);
		expect(x!.entity).toBe(401);
		expect(x!.children.size).toBe(0);
	});
});
