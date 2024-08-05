<script lang="ts">
	export let text: string = 'Loading';
</script>

<div class="flex items-center justify-center gap-4">
	<div class="loading loading-spinner loading-lg" />
	<span>{text}</span>
</div>
