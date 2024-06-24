<script>
	import '../app.css';
</script>

<svelte:head>
	<title>Callsign Tester</title>
	<meta name="description" content="Callsign tester for ham radio operators" />
	<meta name="keywords" content="callsign, ham radio, dxcc" />
	<meta name="author" content="Jakob Kordež S52KJ" />
</svelte:head>

<div class="flex min-h-screen flex-col bg-[#333] text-[#eee]">
	<div class="c flex-1">
		<slot />
	</div>

	<footer class="bg-[#444] py-3">
		<div class="c flex justify-between gap-4">
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

<style lang="postcss">
	.c {
		@apply mx-auto w-full max-w-3xl px-6;
	}

	footer a {
		@apply text-[#bbe];
	}
</style>
