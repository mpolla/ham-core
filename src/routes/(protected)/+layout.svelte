<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { userStore } from '$lib/stores/user-store';

	userStore.subscribe((value) => {
		if (value === null) {
			goto(`/login?redirect=${$page.url}`);
		}
	});
</script>

<slot />
