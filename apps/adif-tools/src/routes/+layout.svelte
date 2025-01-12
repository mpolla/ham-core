<script lang="ts">
	import { page } from '$app/state';
	import '../app.css';
	let { children } = $props();

	const routes = [
		{
			name: 'QSO Entry',
			subtitle: 'Mini QSO entry tool',
			href: '/'
		},
		{
			name: 'ADIF Viewer',
			subtitle: 'Inspect ADIF files',
			href: '/viewer'
		},
		{
			name: 'ADIF Merger',
			subtitle: 'Merge multiple ADIF files into one',
			href: '/merger'
		},
		{
			name: 'Dupe Checker',
			subtitle: 'Check for duplicate QSOs',
			href: '/dupes'
		}
	];

	const current = $derived(routes.find((r) => r.href === page.url.pathname));
</script>

<svelte:head>
	<title>{current?.name} | ADIF Tools</title>
	<meta name="description" content="Online tool for working with ADIF files" />
</svelte:head>

<div class="h-full min-h-screen">
	<div class="container mx-auto px-8 py-12">
		<div class="mb-10 flex flex-col gap-2 md:flex-row md:items-center">
			<div class="md:mr-auto">
				<h1 class="text-3xl font-medium">{current?.name}</h1>
				<p class="mt-1 font-light">{current?.subtitle}</p>
			</div>

			{#each routes as route}
				<a
					class="btn btn-ghost rounded-lg px-4 py-2 font-medium {route === current
						? 'btn-active'
						: ''}"
					href={route.href}
				>
					{route.name}
				</a>
			{/each}
		</div>

		{@render children()}
	</div>
</div>
