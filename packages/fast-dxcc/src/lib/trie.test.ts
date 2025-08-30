import { describe, expect, test } from 'vitest';
import { TrieNode } from './trie';
import { DxccOverrides } from './dxcc-overrides';

describe('parseString', () => {
	test('Basic test', () => {
		const encoded = `
            31
            -X-3
			-APY-4
			>OOP-4
            3=401(32)
            --700
			700=500
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
		expect(y?.overrides).toEqual({});

		const x = root.children.get('X');
		expect(x).not.toBe(null);
		expect(x).not.toBe(y);

		expect(x!.id).toBe(3);
		expect(x!.entity).toBe(401);
		expect(x!.children.size).toBe(1);
		expect(x?.overrides).toEqual({ cqz: 32 });

		const xx = x!.children.get('');
		expect(xx).not.toBe(null);
		expect(xx!.id).toBe(700);
		expect(xx!.entity).toBe(500);
		expect(xx!.children.size).toBe(0);
		expect(xx?.overrides).toEqual({});

		expect(root!.shortcuts.size).toBe(1);
		expect(root!.shortcuts.get('OOP')).toBe(y);

		expect(root.encodeToString()).toBe(
			encoded
				.trim()
				.split('\n')
				.map((s) => s.trim())
				.join('\n')
		);
	});
});

test('getAllNodes', () => {
	const root = new TrieNode();
	const a = new TrieNode();
	const b = new TrieNode();

	root.children.set('A', a);
	a.shortcuts.set('CB', b);

	expect([...root.getAllNodes()]).toEqual([root, a, b]);
});

describe('insert', () => {
	test('Single character', () => {
		const root = new TrieNode();
		root.insert('A', 1);

		expect(root.children.size).toBe(1);

		const node = root.children.get('A');
		expect(node).not.toBe(null);
		expect(node?.entity).toBe(1);
		expect(node?.overrides).toEqual({});
		expect(node?.children.size).toBe(0);
		expect(node?.shortcuts.size).toBe(0);
		expect(node?.id).not.toBe(root.id);

		expect(root.entity).toBe(null);
		expect(root.shortcuts.size).toBe(0);
	});

	test('Single character - exact', () => {
		const root = new TrieNode();
		root.insert('A', 1, true);

		expect(root.children.size).toBe(1);

		const node = root.children.get('A');
		expect(node).not.toBe(null);
		expect(node?.entity).toBe(null);
		expect(node?.overrides).toEqual({});
		expect(node?.children.size).toBe(1);
		expect(node?.shortcuts.size).toBe(0);
		expect(node?.id).not.toBe(root.id);

		const exact = node?.children.get('');
		expect(exact).not.toBe(null);
		expect(exact?.entity).toBe(1);
		expect(exact?.overrides).toEqual({});
		expect(exact?.children.size).toBe(0);
		expect(exact?.shortcuts.size).toBe(0);
		expect(exact?.id).not.toBe(root.id);
		expect(exact?.id).not.toBe(node?.id);

		expect(root.entity).toBe(null);
		expect(root.shortcuts.size).toBe(0);
	});

	test('Single character - conflict', () => {
		const root = new TrieNode();
		root.insert('A', 1);
		expect(() => root.insert('A', 2)).toThrowError();
	});

	test('Single character - exact conflict', () => {
		const root = new TrieNode();
		root.insert('A', 1, true);
		expect(() => root.insert('A', 2, true)).toThrowError();
	});

	test('Single character - overrides conflict', () => {
		const root = new TrieNode();
		root.insert('A', 1, false, new DxccOverrides({ cqz: 1 }));
		expect(() => root.insert('A', 1, false, new DxccOverrides({ cqz: 2 }))).toThrowError();
	});
});

describe('hash', () => {
	test('Empty', () => {
		const root = new TrieNode();
		expect(root.hash()).toBe('__');
	});

	test('With entity', () => {
		const root = new TrieNode({ entity: 100 });
		expect(root.hash()).toBe('100__');
	});

	test('With children', () => {
		const root = new TrieNode();
		root.children.set('A', new TrieNode({ id: 2 }));
		root.shortcuts.set('B', new TrieNode({ id: 3 }));
		expect(root.hash()).toBe('_A:2,B:3_');
	});

	test('With overrides', () => {
		const root = new TrieNode();
		root.overrides = new DxccOverrides({ cqz: 1, cont: 'AS', ituz: 2, lat: 3, long: 4, timez: 5 });
		expect(root.hash()).toBe(`__${root.overrides.toString()}`);
	});
});

describe('collapseNodes', () => {
	test('Empty', () => {
		const root = new TrieNode();
		expect(root.collapseNodes()).toBe(true);
	});

	test.each([
		{ entity: 100 },
		{ children: new Map([['A', new TrieNode({ entity: 100 })]]) },
		{ shortcuts: new Map([['B', new TrieNode({ entity: 100 })]]) },
		{ overrides: new DxccOverrides({ cqz: 1, cont: 'AS', ituz: 2, lat: 3, long: 4, timez: 5 }) }
	])('With %o', (node) => {
		const root = new TrieNode(node);
		expect(root.collapseNodes()).toBe(false);
		expect(
			root.collapseNodes(
				100,
				new DxccOverrides({ cqz: 1, cont: 'AS', ituz: 2, lat: 3, long: 4, timez: 5 })
			)
		).toBe(true);
	});
});

describe('buildShortcuts', () => {
	test('Basic shortcut', () => {
		const root = new TrieNode();
		const a = new TrieNode();
		const b = new TrieNode();

		root.children.set('A', a);
		a.children.set('B', b);

		root.buildShortcuts();
		expect(root.shortcuts.size).toBe(1);
		expect(root.children.size).toBe(0);
		expect(root.shortcuts.get('AB')).toBe(b);
	});

	test('No shortcut', () => {
		const root = new TrieNode();
		const a = new TrieNode({ entity: 100 });
		const b = new TrieNode();

		root.children.set('A', a);
		a.children.set('B', b);

		root.buildShortcuts();
		expect(root.shortcuts.size).toBe(0);
		expect(root.children.size).toBe(1);
		expect(root.children.get('A')).toBe(a);
	});

	test('With exact', () => {
		const root = new TrieNode();

		root.insert('AB', 100, true);

		root.buildShortcuts();
		expect(root.shortcuts.size).toBe(1);
		expect(root.children.size).toBe(0);
		expect(root.shortcuts.get('AB')?.children.size).toBe(1);
		expect(root.shortcuts.get('AB')?.children.get('')?.entity).toBe(100);
	});
});
