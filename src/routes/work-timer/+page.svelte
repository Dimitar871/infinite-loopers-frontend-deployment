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
	let initialized = false;

	$: {
		if (!initialized) {
			const m = Number($page.url.searchParams.get('minutes'));
			if (m > 0) {
				minutes = m;
				secondsLeft = minutes * 60;
				initialized = true;
			}
		}
	}

	function toggleTimer() {
		if (running) {
			running = false;
			clearInterval(timer);
			timer = null;
		} else {
			running = true;
			timer = setInterval(() => {
				if (secondsLeft <= 0) {
					stop();
					return;
				}
				secondsLeft--;
			}, 1000);
		}
	}

	function stop() {
		running = false;
		clearInterval(timer);
		timer = null;
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
		relative
		-translate-y-2 font-['IM_Fell_Great_Primer_SC'] text-xl
		tracking-wide
		text-[#4F3117]
		sm:-translate-y-2.5
		sm:text-2xl lg:-translate-y-3 lg:text-3xl"
				>
					{display}
				</span>
			</div>
		</div>
	</div>
</section>

<div class="relative mt-6 flex justify-center sm:mt-8">
	<button
		onclick={toggleTimer}
		class="
			flex h-[100px]
			w-[200px] cursor-pointer
			items-center justify-center

			font-['IM_Fell_Great_Primer_SC'] text-2xl tracking-[-0.5%]
			text-[#5a3e1b]
			transition-all duration-150 hover:scale-105
			hover:text-[#B69476]
			disabled:opacity-60

			sm:h-[130px]
			sm:w-[260px] sm:text-3xl
			md:h-[150px]
			md:w-[300px]

			md:text-4xl
		"
		style={`background-image: url(${startTimer});
		        background-size: contain;
		        background-position: center;
		        background-repeat: no-repeat;`}
	>
		{running ? 'Stop Timer' : 'Start Timer'}
	</button>
</div>
