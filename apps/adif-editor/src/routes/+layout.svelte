<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>ADIF Editor</title>
	<meta name="description" content="ADIF Editor" />
</svelte:head>

<div class="h-full min-h-screen bg-[#333] text-[#eee]">
	<div class="container mx-auto px-8 py-12">
		<div class="mb-6 text-center">
			<h1 class="text-3xl font-medium">ADIF Editor</h1>
			<p class="mt-1 font-light">Mini QSO entry tool</p>
		</div>

		{@render children()}
	</div>
</div>
