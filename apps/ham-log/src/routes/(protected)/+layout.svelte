<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getUserContext } from '$lib/states/user-state.svelte';
	import Fa from 'svelte-fa';
	import { faUser } from '@fortawesome/free-solid-svg-icons';
	import Clock from '$lib/components/clock.svelte';
	import type { Snippet } from 'svelte';
	import { setLogsContext } from '$lib/states/logs-state.svelte';
	import { setLogbookContext } from '$lib/states/logbook-state.svelte';
	import { setWsjtContext } from '$lib/states/wsjt-state.svelte';
	import { setSelectedQsosContext } from '$lib/states/selected-state.svelte';
	import { WsjtQsoLogged } from '$lib/wsjt/wsjt-reader';
	import { findDxcc } from '@ham-core/fast-dxcc';
	import { Band } from '$lib/models/band';
	import SolarData from '$lib/components/solar-data.svelte';

	const user = getUserContext();

	setSelectedQsosContext();
	const logs = setLogsContext();
	const logbook = setLogbookContext(user, logs);
	const wsjt = setWsjtContext();

	wsjt.addListener((m) => {
		if (!(m instanceof WsjtQsoLogged)) return;
		const dxcc = findDxcc(m.dxCall)?.entity;
		logbook.insert({
			log_id: logbook.logId,
			datetime: m.dateTimeOn.toISOString(),
			call: m.dxCall,
			mode: m.mode,
			frequency: Number(m.txFrequency),
			band: Band.getBand(Number(m.txFrequency))?.name,
			rst_sent: m.reportSent,
			rst_rcvd: m.reportReceived,
			dxcc: dxcc?.dxcc,
			country: dxcc?.name,
			power: parseInt(m.txPower) || null,
			gridsquare: m.dxGrid,
			cont: dxcc?.cont,
			other: {
				CQZ: dxcc?.cqz,
				ITUZ: dxcc?.ituz
			}
		});
	});

	let { children }: { children?: Snippet } = $props();

	$effect(() => {
		if (user.loggedIn === false) {
			const p = $page.url.pathname;
			const r = p.match(/^\/(?:log)?$/) ? '' : `?redirect=${p}`;
			goto(`/login${r}`);
		}
	});
</script>

<div class="navbar justify-between bg-base-100 shadow-xl">
	<a href="/" class="btn btn-ghost text-xl">HAM Log</a>

	<Clock />

	<SolarData />

	<div class="flex-none">
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="btn btn-ghost">
				<Fa icon={faUser} />
				<div>{user.call}</div>
			</div>
			<ul class="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow">
				<li><button onclick={user.logout} class="text-red-300">Logout</button></li>
			</ul>
		</div>
	</div>
</div>

<div class="container py-10">
	{@render children?.()}
</div>
