<script lang="ts">
	import LogbookSelect from '$lib/components/logbook-select.svelte';
	import QsoList from './qso-list.svelte';
	import QsoForm from './qso-form.svelte';
	import Filters from './filters.svelte';
</script>

<div class="flex flex-col gap-10">
	<div class="flex flex-wrap items-end gap-4">
		<LogbookSelect />
		<a href="/adif-import" class="btn btn-sm ml-auto">Import ADIF</a>
		<!-- <a href="/settings" class="btn btn-sm">Settings</a> -->
	</div>

	<QsoForm />

	<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-center">
		<div class="w-full lg:max-w-xs">
			<Filters />
		</div>

		<div class="flex flex-col gap-4">
			<QsoList />
		</div>
	</div>
</div>
