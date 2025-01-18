import { onDestroy } from 'svelte';

export function createTimeState(
	updateIntervalMs = 1000,
	startNow = true,
	onTick: ((time: Date) => void) | undefined = undefined,
	pauseOnBlur = true
) {
	let time = $state(new Date());
	let interval = $state<ReturnType<typeof setInterval>>();
	let isRunning = $state(false);

	function tick() {
		// Check if browser tab is in focus
		if (interval && pauseOnBlur && document.hidden) {
			clearInterval(interval);
			interval = undefined;
			addEventListener(
				'visibilitychange',
				() => {
					if (isRunning && !interval && !document.hidden) {
						start();
					}
				},
				{ once: true }
			);
			return;
		}

		time = new Date();
		onTick?.(time);
	}

	function start() {
		if (interval) return;
		tick();
		isRunning = true;
		interval = setInterval(tick, updateIntervalMs);
	}

	function stop() {
		if (interval) clearInterval(interval);
		isRunning = false;
		interval = undefined;
	}

	if (startNow) start();

	onDestroy(() => {
		stop();
	});

	return {
		get time() {
			return time;
		},
		get isStopped() {
			return !isRunning;
		},
		tick,
		start,
		stop
	};
}
