<script lang="ts">
	import LogbookSelect from '$lib/components/logbook-select.svelte';
	import QsoList from './qso-list.svelte';
	import QsoForm from './qso-form.svelte';
	import Filters from './filters.svelte';
	import Pagination from './pagination.svelte';
	import Selection from './selection.svelte';
	import Fa from 'svelte-fa';
	import { faCog } from '@fortawesome/free-solid-svg-icons';
</script>

<div class="mx-auto flex max-w-5xl flex-col gap-10">
	<div class="flex flex-wrap items-end gap-4">
		<LogbookSelect />
		<a href="/adif-import" class="btn btn-sm ml-auto">Import ADIF</a>
		<a href="/log/settings" class="btn btn-sm">
			<Fa icon={faCog} />
			<span>Settings</span>
		</a>
	</div>

	<QsoForm />

	<div class="flex w-full flex-col gap-4">
		<Filters />

		<Pagination />

		<QsoList />

		<Selection />
	</div>
</div>
