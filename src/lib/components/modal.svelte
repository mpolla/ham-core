<script lang="ts">
	export let children: any;
	export let onClose: () => void;
</script>

<div class="fixed inset-0 z-30 flex items-center justify-center">
	<button class="absolute inset-0 cursor-default bg-black/80" on:click={onClose}></button>
	<div class="m-10 rounded-lg bg-base-100 p-10">
		{children}
	</div>
</div>
