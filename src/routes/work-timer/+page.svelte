<script>
	import { page } from '$app/stores';
	import { openModal } from '../../modalStore.js';
	import { onDestroy, onMount } from 'svelte';
	import { selectedTask } from '../../modalStore.js';
	import { beforeNavigate } from '$app/navigation';

	import workBackground from '$lib/assets/work-timer/work-background-1.png';
	import timerScroll from '$lib/assets/work-timer/timer-scroll.png';
	import startTimer from '$lib/assets/work-timer/start-timer.png';
	import questScroll from '$lib/assets/work-timer/quest-scroll.png';

	let minutes = 25;
	let initialSeconds = 0;
	let secondsLeft = 0;
	let timer = null;
	let running = false;
	let initialized = false;
	let alarmEnabled = true;
	let showBreakModal = false;

	let shouldWarn = true;
	let showWarningModal = false;
	let pendingNavigation = null;

	beforeNavigate(({ cancel, to }) => {
		if (shouldWarn) {
			cancel();
			pendingNavigation = to;
			showWarningModal = true;
			pause();
		}
	});

	// When user clicks OK in modal
	function confirmLeave() {
		shouldWarn = false;
		showWarningModal = false;

		if (pendingNavigation) {
			location.href = pendingNavigation.url.pathname;
		}
	}

	// When user clicks cancel in modal
	function cancelLeave() {
		showWarningModal = false;
		pendingNavigation = null;
		start();
	}

	async function saveSubtask() {
		if (!$selectedTask) return;

		try {
			const response = await fetch(`http://localhost:3011/tasks/${$selectedTask.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					subtasks: $selectedTask.subtasks
				})
			});
		} catch (err) {
			console.error(err);
		}
	}

	async function saveTimeSpent() {
		if (!$selectedTask) return;

		try {
			const response = await fetch(`http://localhost:3011/tasks/${$selectedTask.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					timeSpent: $selectedTask.timeSpent + (initialSeconds - secondsLeft)
				})
			});
		} catch (err) {
			console.error(err);
		}
	}

	function calculateCoins(seconds) {
    	const baseCoins = 5;
    	const coinsPerMinute = 2;
    	return baseCoins + coinsPerMinute * Math.floor(seconds / 60);
	}

	function toggleSubtask(subtaskId) {
		if (!$selectedTask || !$selectedTask.subtasks) return;
		$selectedTask.subtasks = $selectedTask.subtasks.map((st) =>
			st.id === subtaskId ? { ...st, completed: !st.completed } : st
		);
		saveSubtask();
	}

	$: {
		if (!initialized) {
			const m = Number($page.url.searchParams.get('minutes'));
			if (m >= 1) {
				minutes = m;
				initialSeconds = minutes * 60;
				secondsLeft = initialSeconds;
				initialized = true;
			}
		}
	}

	function toggleTimer() {
		if (running) {
			pause();
		} else {
			start();
		}
	}

	function start() {
		if (running) return;

		running = true;
		timer = setInterval(() => {
			if (secondsLeft <= 0) {
				finish();
				return;
			}
			secondsLeft--;
		}, 1000);
	}

	function pause() {
		running = false;
		clearInterval(timer);
		saveTimeSpent();
		timer = null;
	}

	function resetTimer() {
		pause();
		secondsLeft = initialSeconds;
	}

	async function editSession() {
		if (running) return;

		const input = prompt('Edit session length (minutes):', minutes);
		const m = Number(input);

		if (m >= 1) {
			minutes = m;
			initialSeconds = minutes * 60;
			secondsLeft = initialSeconds;
			try {
				const response = await fetch(`http://localhost:3011/tasks/${$selectedTask.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						duration: initialSeconds
					})
				});
			} catch (err) {
				console.error(err);
			}
		}
	}

	async function finish() {
		pause();
		secondsLeft = 0;
		shouldWarn = false;
		showBreakModal = true;

		if (alarmEnabled) {
			const audio = new Audio(''); // will put an actual alarm later
			audio.play();
		}

		try {
			const res = await fetch(`http://localhost:3011/tasks/${$selectedTask.id}/complete`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
        			coins: calculateCoins($selectedTask.timeSpent)
    			})
			});
			const data = await res.json();
			if (data.success) {
				if (data.unlockedAchievements?.length > 0) {
					openModal(
						`🎉 Achievement unlocked: ${data.unlockedAchievements.map((a) => a.name).join(', ')}!`,
						'success'
					);
				}
			} else {
				openModal(data.message || 'Failed to complete task', 'error');
			}
		} catch (err) {
			console.error(err);
			openModal('Failed to complete task', 'error');
		}
	}

	onDestroy(() => clearInterval(timer));
	onMount(() => start());

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

<div class="mt-6 flex flex-col items-center gap-0 sm:mt-8">
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

	<div class="-mt-4 flex flex-wrap justify-center gap-3 sm:-mt-6">
		<button
			onclick={editSession}
			disabled={running}
			class="
				flex h-[70px] w-[140px]
				cursor-pointer items-center
				justify-center

				font-['IM_Fell_Great_Primer_SC']
				text-lg tracking-wide
				text-[#5a3e1b]

				transition-all duration-150
				hover:scale-105 hover:text-[#B69476]
				disabled:cursor-not-allowed disabled:opacity-50

				sm:h-20 sm:w-40 sm:text-xl
			"
			style={`background-image: url(${startTimer});
			        background-size: contain;
			        background-position: center;
			        background-repeat: no-repeat;`}
		>
			Edit Session
		</button>

		<button
			onclick={resetTimer}
			class="
				flex h-[70px] w-[140px]
				cursor-pointer items-center
				justify-center

				font-['IM_Fell_Great_Primer_SC']
				text-lg tracking-wide
				text-[#5a3e1b]

				transition-all duration-150
				hover:scale-105 hover:text-[#B69476]

				sm:h-20 sm:w-40 sm:text-xl
			"
			style={`background-image: url(${startTimer});
			        background-size: contain;
			        background-position: center;
			        background-repeat: no-repeat;`}
		>
			Reset Timer
		</button>

		<button
			onclick={() => (alarmEnabled = !alarmEnabled)}
			class="
				flex h-[70px] w-[140px]
				cursor-pointer items-center
				justify-center

				font-['IM_Fell_Great_Primer_SC']
				text-lg tracking-wide
				text-[#5a3e1b]

				transition-all duration-150
				hover:scale-105 hover:text-[#B69476]

				sm:h-20 sm:w-40 sm:text-xl
			"
			style={`background-image: url(${startTimer});
			        background-size: contain;
			        background-position: center;
			        background-repeat: no-repeat;`}
		>
			Alarm: {alarmEnabled ? 'On' : 'Off'}
		</button>
	</div>

	<p>{$selectedTask.title}</p>
	<div class="max-h-[200px] space-y-2 overflow-y-auto">
		{#if $selectedTask.subtasks && $selectedTask.subtasks.length > 0}
			{#each $selectedTask.subtasks as subtask}
				<div class="flex items-center gap-2 rounded-lg border-2 border-[#4F3117] bg-white p-3">
					<input
						type="checkbox"
						checked={subtask.completed}
						onchange={() => toggleSubtask(subtask.id)}
						class="h-5 w-5 cursor-pointer rounded text-[#4F3117] focus:ring-2 focus:ring-[#4F3117]"
					/>
					<input
						type="text"
						bind:value={subtask.text}
						placeholder="Subtask description..."
						class="flex-1 border-none bg-transparent text-[#4F3117] placeholder-[#A89078] focus:outline-none {subtask.completed
							? 'text-gray-500 line-through'
							: ''}"
					/>
				</div>
			{/each}
		{:else}
			<p class="text-sm text-gray-500 italic">No subtasks yet.</p>
		{/if}
	</div>
</div>

{#if showWarningModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<article
			class="flex w-[520px] max-w-[90vw] flex-col rounded-xl border-[6px] border-double border-red-700 bg-[#fdf3e7] font-['IM_Fell_Great_Primer_SC'] shadow-[0_0_20px_rgba(0,0,0,0.5)]"
		>
			<header
				class="flex items-center justify-between border-b-2 border-red-700 px-6 py-4 text-[#4F3117]"
			>
				<h2 class="text-2xl">Warning</h2>
				<button
					onclick={cancelLeave}
					class="cursor-pointer border-none bg-transparent text-xl text-[#4F3117] transition-transform duration-200 hover:rotate-12"
				>
					✖
				</button>
			</header>

			<div class="flex flex-col p-6">
				<p class="mb-6 text-xl text-[#4F3117]">
					Are you sure you want to end your adventure? You will not be able to continue this
					session!
				</p>
				<div class="flex justify-end gap-2">
					<button
						onclick={cancelLeave}
						class="cursor-pointer rounded-lg bg-[#4F3117] px-6 py-2 text-[#EEE9E1] transition-colors hover:bg-[#3E2612]"
					>
						Cancel
					</button>
					<button
						onclick={confirmLeave}
						class="cursor-pointer rounded-lg bg-[#4F3117] px-6 py-2 text-[#EEE9E1] transition-colors hover:bg-[#3E2612]"
					>
						OK
					</button>
				</div>
			</div>
		</article>
	</div>
{/if}
