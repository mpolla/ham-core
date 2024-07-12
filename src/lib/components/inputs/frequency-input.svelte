<script lang="ts">
	export let value = '';
	export let label = '';
</script>

<label class="input input-bordered flex w-full max-w-44 items-center gap-2">
	<input
		type="text"
		class="w-full"
		on:keydown={(e) => {
			const field = e.currentTarget;
			const selStart = field.selectionStart;
			const selEnd = field.selectionEnd;
			console.log(e.key);
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				field.value = (parseFloat(field.value) + 0.001).toFixed(3);
				field.setSelectionRange(selStart, selEnd);
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				field.value = (parseFloat(field.value) - 0.001).toFixed(3);
				field.setSelectionRange(selStart, selEnd);
			}
		}}
		bind:value
		placeholder={label}
	/>
	<div class="select-none">MHz</div>
</label>
