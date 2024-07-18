<script lang="ts">
	import LogbookSelect from '$lib/components/logbook-select.svelte';
	import QsoForm from '$lib/components/qso-form.svelte';
	import QsoList from '$lib/components/qso-list.svelte';
</script>

<div class="flex flex-col gap-10">
	<div class="flex flex-wrap items-end gap-4">
		<LogbookSelect />
		<a href="/adif-import" class="btn btn-sm ml-auto">Import ADIF</a>
		<!-- <a href="/settings" class="btn btn-sm">Settings</a> -->
	</div>

	<QsoForm />

	<QsoList />
</div>
