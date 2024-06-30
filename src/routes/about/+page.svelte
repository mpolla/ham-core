<script>
	import Mail from './mail.svelte';
</script>

<div class="mx-auto mb-6 text-blue-300">
	<a href="/">&lt; Home</a>
</div>

<div class="prose prose-invert mx-auto max-w-none">
	<h1>About <i>Callsign Checker</i></h1>

	<p>
		Callsign Checker uses a <a href="https://en.wikipedia.org/wiki/Trie">prefix trie</a>
		to quickly find the country / DXCC entity, CQ and ITU zones, continent, latitude and longitude and
		timezone offset for a given callsign.
	</p>

	<h2><i>Building</i> the Trie</h2>

	<p>
		The <i>trie</i> is built from the <a href="https://www.country-files.com/">Country Files</a> by AD1C.
		These files are regularly updated to contain the latest information about callsign prefixes and exceptions.
		Parsing the files and building the trie is done beforehand and the resulting trie is then saved in
		a custom text format.
	</p>

	<p>
		Each prefix and callsign exception is added to the trie, with the corresponding DXCC entity and
		other information. Once the initial trie is built, it goes through a series of optimizations to
		reduce the size and remove redundant data.
	</p>

	<h3>Trie <i>optimizations</i></h3>

	<p>
		The first step is to traverse the trie and remove any fields and nodes, that when traversed, do
		not change the result of the lookup. The next step is to look for any nodes that have only one
		outbound edge and contain no additional information. These nodes get compressed to form a so
		called <a href="https://en.wikipedia.org/wiki/Radix_tree">Radix tree</a>. Compressing the trie
		is not that useful when parsing only prefixes, as these are usually very short, but when parsing
		exceptions, the trie gets significantly smaller with this optimization.
	</p>

	<p>
		Once the trie is compressed, we can continue with the next step. Analyzing the trie, we can see
		that there are many nodes that match when comparing them by their outbound edges. These nodes
		can be merged into a single node, the only change being the inbound edges. We do this in
		multiple passes, until no more nodes can be merged. Multiple passes are needed, as merging one
		node can cause another node to be mergeable. This step is the most important one, as it reduces
		the trie size most significantly.
	</p>

	<p>
		After all the optimizations are done, the node ids are reassigned to be in a continuous range.
		This is done to reduce the size of the trie in the final format. The trie is then saved in a
		custom text format. The format is optimized for size and speed of parsing.
	</p>

	<h3>Resulting trie</h3>

	<p>
		Using the latest <a href="https://www.country-files.com/category/big-cty/">BIG CTY</a>
		file (19 June 2024) that has 27.000 prefixes + exceptions and building the raw trie makes 78.000
		nodes which written in the custom format is 1.2MB. With all the optimizations applied, the trie is
		reduced to 5.700 nodes and a file size of 0.2MB.
	</p>

	<h2><i>Traversing</i> the Trie</h2>

	<p>
		The beauty of using tries is that the lookup time is <i>O(n)</i>, where <i>n</i> is the length of
		the callsign. This means that the lookup time is constant, no matter how many prefixes or exceptions
		are in the trie.
	</p>

	<h2>Questions?</h2>

	<p>
		If you have any questions or suggestions, feel free to contact me at <Mail />.
	</p>
</div>

<style lang="postcss">
	h1,
	h2,
	h3 {
		@apply font-medium;
	}
</style>
