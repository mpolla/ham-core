<script lang="ts">
	import { Band } from '$lib/models/band';
	import type { IQso } from '$lib/supabase';

	interface Props {
		qso?: IQso;
		freq?: number;
		band?: string;
	}

	let { qso, freq, band }: Props = $props();

	const _freq = $derived(freq ?? qso?.frequency);
	const _band = $derived(band ?? (_freq ? Band.getBand(_freq)?.name : undefined));
</script>

<span class="badge font-medium text-black band{_band}">{_band}</span>

<style lang="postcss">
	.band160m {
		background-color: rgba(120, 221, 20, 0.9);
	}
	.band80m {
		background-color: rgba(241, 117, 241, 0.9);
	}
	.band60m {
		background-color: rgb(184, 112, 247);
	}
	.band40m {
		background-color: rgb(111, 149, 253);
	}
	.band30m {
		background-color: rgba(98, 217, 98, 0.9);
	}
	.band20m {
		background-color: rgba(242, 196, 12, 0.9);
	}
	.band17m {
		background-color: rgba(242, 242, 97, 0.9);
	}
	.band15m {
		background-color: rgba(204, 161, 102, 0.9);
	}
	.band12m {
		background-color: rgb(194, 66, 66);
	}
	.band10m {
		background-color: rgba(255, 105, 180, 0.9);
	}
	.band6m {
		background-color: rgba(255, 63, 63, 0.9);
	}
	.band4m {
		background-color: rgba(204, 0, 68, 0.9);
	}
	.band2m {
		background-color: rgba(255, 20, 147, 0.9);
	}
	.band70cm {
		background-color: rgba(153, 153, 0, 0.9);
	}
</style>
