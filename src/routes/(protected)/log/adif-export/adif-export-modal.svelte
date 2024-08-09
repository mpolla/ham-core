<script lang="ts">
	import Modal from '$lib/components/modal.svelte';
	import View from './view.svelte';
</script>

<Modal onClose={() => history.back()} title="Export ADI">
	<View />
</Modal>
