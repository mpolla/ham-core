<script lang="ts">
	let { text = 'Loading' }: { text?: string } = $props();
</script>

<div class="flex items-center justify-center gap-4">
	<div class="loading loading-spinner loading-lg"></div>
	<span>{text}</span>
</div>
