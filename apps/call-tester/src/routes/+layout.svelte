<script>
	import '../app.css';
	import Umami from '../components/umami.svelte';
</script>

<svelte:head>
	<title>Callsign Checker</title>
	<meta name="description" content="Check what country / DXCC entity a callsign belongs to" />
	<meta name="keywords" content="callsign, ham radio, amateur radio, dxcc, country" />
	<meta name="author" content="Jakob Kordež S52KJ" />
	<meta property="og:url" content="https://cc.jkob.cc/" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Callsign Checker" />
	<meta
		property="og:description"
		content="Check what country / DXCC entity a callsign belongs to"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col bg-[#333] text-[#eee]">
	<div class="c flex-1 py-12">
		<slot />
	</div>

	<footer class="bg-[#444] py-3">
		<div class="c flex flex-wrap justify-between gap-4">
			<div>
				Website by <a href="https://jkob.cc/">S52KJ</a>
			</div>
			<div>
				Data by <a href="https://www.country-files.com/">AD1C</a>
			</div>
			<div>
				Source code on <a href="https://github.com/jakobkordez/call-tester">GitHub</a>
			</div>
		</div>
	</footer>
</div>

<Umami />

<style lang="postcss">
	.c {
		@apply mx-auto w-full max-w-3xl px-6;
	}

	footer a {
		@apply text-blue-300;
	}
</style>
