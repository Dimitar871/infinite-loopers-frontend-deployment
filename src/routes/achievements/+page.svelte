<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	import knight from '$lib/assets/achievements_knight.png';
	import mage from '$lib/assets/achievements_wizard.png';
	import medal from '$lib/assets/medal.png';
	import achievementsRectangle from '$lib/assets/achievements_rectangle.png';

	let achievements = [];
	let stats = { achievementsUnlocked: 0, totalAchievements: 0, completionRate: 0, totalXP: 0 };
	let user = null;

	onMount(async () => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) user = JSON.parse(storedUser);
		if (user?.id) {
			await fetchAchievements(user.id);
			await fetchStats(user.id);
		}
	});

	async function fetchAchievements(userId) {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/achievements/user/${userId}`, {
				credentials: 'include'
			});
			const data = await response.json();
			if (data.success) achievements = data.achievements;
		} catch (error) {
			console.error(error);
		}
	}

	async function fetchStats(userId) {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/achievements/user/${userId}/stats`, {
				credentials: 'include'
			});
			const data = await response.json();
			if (data.success) stats = data.stats;
		} catch (error) {
			console.error(error);
		}
	}

	function handleAchievementClick(ach) {
		const taskKeys = [
			'first_task',
			'task_warrior_5',
			'task_master_10',
			'task_legend_25',
			'task_century_100',
			'speedster',
			'early_bird',
			'productive_day'
		];
		if (taskKeys.includes(ach.key)) window.location.href = '/quest-log';
	}
</script>

<div class="min-h-screen" style="background-color: #E3D3BF;">
	<div class="mx-auto max-w-7xl px-4 py-4 sm:py-6">
		<div
			class="relative px-4 py-6 sm:px-8 sm:py-10"
			style="background-image: url({achievementsRectangle}); background-size: 100% 100%; background-repeat: no-repeat;"
		>
			<div class="grid grid-cols-1 gap-6 text-center sm:grid-cols-3 sm:gap-8">
				{#each [['Achievements<br/>Unlocked', `${stats.achievementsUnlocked} / ${stats.totalAchievements}`], ['Completion<br/>Rate', `${stats.completionRate}%`], ['Total<br/>XP', stats.totalXP]] as [label, val]}
					<div class="flex flex-col justify-center">
						<div
							class="mb-1 font-['IM_Fell_Great_Primer_SC'] text-lg leading-tight font-medium tracking-wider text-[#4F3117] sm:text-2xl"
						>
							{@html label}
						</div>
						<div
							class="font-['IM_Fell_Great_Primer_SC'] text-3xl text-[#4F3117] sm:text-4xl md:text-6xl"
						>
							{val}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="pb-12 sm:pb-20" style="background-color: #EEE9E1;">
		<div class="mx-auto max-w-[1400px] px-4 py-8 sm:py-12">
			<h2
				class="mb-2 text-center font-['IM_Fell_Great_Primer_SC'] text-4xl text-[#4F3117] sm:text-5xl"
			>
				Achievements
			</h2>
			<p
				class="mb-10 text-center font-['IM_Fell_Great_Primer_SC'] text-base font-bold tracking-widest text-[#4F3117] uppercase sm:mb-16 sm:text-lg"
			>
				Unlock badges and milestones
			</p>

			<div class="flex flex-col gap-16 sm:gap-24 xl:gap-32">
				<div class="flex flex-col items-center justify-center gap-10 xl:flex-row xl:gap-16">
					<div
						class="relative hidden shrink-0 items-center justify-center bg-[#3E3845] xl:flex"
						style="width: 480px; height: 520px; border-radius: 60% 40% 55% 45% / 50% 55% 45% 50%;"
					>
						<img src={knight} alt="Knight" class="absolute -bottom-5 h-[650px] max-w-none" />
					</div>

					<div
						class="mx-auto grid w-full max-w-[300px] grid-cols-1 gap-6 sm:gap-10 md:max-w-[640px] md:grid-cols-2"
					>
						{#each achievements.slice(0, 4) as ach}
							<button
								on:click={() => handleAchievementClick(ach)}
								class="relative mx-auto aspect-square w-full max-w-[340px] rounded-xl border-4 border-[#4F3117] bg-[#E3D3BF] p-6 text-left shadow-2xl transition-transform hover:scale-[1.02] sm:border-[5px] sm:p-7 sm:hover:-translate-y-2"
							>
								{#if ach.unlocked}
									<span
										class="absolute top-3 right-3 rounded border-2 border-[#4F3117] bg-[#EEE9E1] px-2 py-1 font-['IM_Fell_Great_Primer_SC'] text-[10px] font-bold text-[#4F3117] uppercase sm:top-4 sm:right-4 sm:text-xs"
										>Unlocked ✓</span
									>
								{/if}

								<h3
									class="mb-1 pr-12 font-['IM_Fell_Great_Primer_SC'] text-2xl leading-tight font-bold text-[#4F3117] sm:pr-16 sm:text-3xl"
								>
									{ach.name}
								</h3>
								<p
									class="mb-4 font-['IM_Fell_Great_Primer_SC'] text-sm text-[#4F3117] uppercase sm:text-base"
								>
									{ach.description}
								</p>

								{#if ach.target_value}
									<div
										class="mb-1 h-2.5 w-full overflow-hidden rounded-full border border-[#8B7355] bg-[#D9C5B2] sm:h-3"
									>
										<div
											class="h-full bg-white transition-all"
											style="width: {(ach.current_value / ach.target_value) * 100}%"
										></div>
									</div>
									<div class="mb-4 text-[10px] text-[#4F3117]">
										{ach.current_value}/{ach.target_value}
									</div>
								{/if}

								<div
									class="absolute right-6 bottom-5 left-6 flex items-end justify-between sm:right-7 sm:bottom-6 sm:left-7"
								>
									<span
										class="font-['IM_Fell_Great_Primer_SC'] text-xl font-bold text-[#4F3117] sm:text-2xl"
										>+ {ach.points} xp</span
									>
									<img src={medal} alt="Medal" class="h-16 w-16 sm:h-20 sm:w-20" />
								</div>
							</button>
						{/each}
					</div>
				</div>

				<div class="flex flex-col items-center justify-center gap-10 xl:flex-row xl:gap-16">
					<div
						class="mx-auto grid w-full max-w-[300px] grid-cols-1 gap-6 sm:gap-10 md:max-w-[640px] md:grid-cols-2"
					>
						{#each achievements.slice(4, 8) as ach}
							<button
								on:click={() => handleAchievementClick(ach)}
								class="relative mx-auto aspect-square w-full max-w-[340px] rounded-xl border-4 border-[#4F3117] bg-[#E3D3BF] p-6 text-left shadow-2xl transition-transform hover:scale-[1.02] sm:border-[5px] sm:p-7 sm:hover:-translate-y-2"
							>
								{#if ach.unlocked}
									<span
										class="absolute top-3 right-3 rounded border-2 border-[#4F3117] bg-[#EEE9E1] px-2 py-1 font-['IM_Fell_Great_Primer_SC'] text-[10px] font-bold text-[#4F3117] uppercase sm:top-4 sm:right-4 sm:text-xs"
										>Unlocked ✓</span
									>
								{/if}

								<h3
									class="mb-1 pr-12 font-['IM_Fell_Great_Primer_SC'] text-2xl leading-tight font-bold text-[#4F3117] sm:pr-16 sm:text-3xl"
								>
									{ach.name}
								</h3>
								<p
									class="mb-4 font-['IM_Fell_Great_Primer_SC'] text-sm text-[#4F3117] uppercase sm:text-base"
								>
									{ach.description}
								</p>

								<div
									class="absolute right-6 bottom-5 left-6 flex items-end justify-between sm:right-7 sm:bottom-6 sm:left-7"
								>
									<span
										class="font-['IM_Fell_Great_Primer_SC'] text-xl font-bold text-[#4F3117] sm:text-2xl"
										>+ {ach.points} xp</span
									>
									<img src={medal} alt="Medal" class="h-16 w-16 sm:h-20 sm:w-20" />
								</div>
							</button>
						{/each}
					</div>

					<div
						class="relative order-1 hidden shrink-0 items-center justify-center bg-[#3E3845] xl:order-2 xl:flex"
						style="width: 480px; height: 520px; border-radius: 45% 55% 50% 50% / 55% 45% 55% 45%;"
					>
						<img src={mage} alt="Mage" class="absolute -bottom-5 h-[650px] max-w-none" />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
