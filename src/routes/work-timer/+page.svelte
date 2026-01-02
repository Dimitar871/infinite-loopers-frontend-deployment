<script>
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';
	import workBackground from '$lib/assets/work-timer/work-background-1.png';
	import timerScroll from '$lib/assets/work-timer/timer-scroll.png';
	import startTimer from '$lib/assets/work-timer/start-timer.png';

	let minutes = 25;
	let secondsLeft = 0;
	let timer = null;
	let running = false;

	$: {
		const m = Number($page.url.searchParams.get('minutes'));
		if (m > 0) {
			minutes = m;
			secondsLeft = minutes * 60;
		}
	}

	function start() {
		if (running) return;

		running = true;
		timer = setInterval(() => {
			if (secondsLeft <= 0) {
				stop();
				return;
			}
			secondsLeft--;
		}, 1000);
	}

	function stop() {
		running = false;
		clearInterval(timer);
	}

	onDestroy(() => clearInterval(timer));
	$: display = `${Math.floor(secondsLeft / 60)
		.toString()
		.padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`;
</script>

<section
	class="relative grid place-items-center border-b-2 border-[#4F3117]"
	style={`background-image: url(${workBackground}); background-size: cover; background-position: center;`}
>
	<div class="relative aspect-square w-full max-w-[700px] overflow-hidden">
		<!-- TIMER SCROLL -->
		<div class="absolute top-4 left-1/2 z-20 -translate-x-1/2 sm:top-6">
			<div
				class="
				relative flex h-[110px] w-[220px]
				items-center justify-center
				sm:h-[140px] sm:w-[280px]
				lg:h-[170px] lg:w-[340px]
			"
				style={`background-image: url(${timerScroll});
			        background-size: contain;
			        background-repeat: no-repeat;
			        background-position: center;`}
			>
				<span
					class="
		font-['IM_Fell_Great_Primer_SC']
		text-xl sm:text-2xl lg:text-3xl
		text-[#4F3117]
		tracking-wide
		relative
		-translate-y-2 sm:-translate-y-2.5 lg:-translate-y-3"
				>
					{display}
				</span>
			</div>
		</div>
	</div>
</section>

<button onclick={start} class="rounded-lg border-2 px-6 py-3 text-lg"> Start </button>
