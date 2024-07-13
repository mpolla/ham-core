<script lang="ts">
	export let value = '';

	function uppercaseInput(field: HTMLInputElement) {
		function handleInput() {
			const selStart = field.selectionStart;
			field.value = field.value.slice(0, 2).toUpperCase() + field.value.slice(2).toLowerCase();
			field.setSelectionRange(selStart, selStart);
		}
		field.addEventListener('input', handleInput);
		return {
			destroy() {
				field.removeEventListener('input', handleInput);
			}
		};
	}
</script>

<input type="text" use:uppercaseInput bind:value placeholder="Gridsquare" {...$$restProps} />
