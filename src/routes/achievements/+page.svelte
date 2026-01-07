<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import logo from '$lib/assets/Logo.png';

	// Your actual image imports
	import knight from '$lib/assets/achievements_knight.png';
	import mage from '$lib/assets/achievements_wizard.png';
	import medal from '$lib/assets/medal.png';
	import achievementsRectangle from '$lib/assets/achievements_rectangle.png';

	$: currentPath = $page.url.pathname;

	let user = null;

	let achievements = [];
	let stats = {
		achievementsUnlocked: 0,
		totalAchievements: 0,
		completionRate: 0,
		totalXP: 0
	};

	onMount(async () => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			user = JSON.parse(storedUser);
		}

		if (user && user.id) {
			await fetchAchievements(user.id);
			await fetchStats(user.id);
		}
	});

	async function fetchAchievements(userId) {
		try {
			const response = await fetch(`http://localhost:3020/achievements/user/${userId}`);
			const data = await response.json();
			if (data.success) {
				achievements = data.achievements;
			}
		} catch (error) {
			console.error('Error fetching achievements:', error);
		}
	}

	async function fetchStats(userId) {
		try {
			const response = await fetch(`http://localhost:3020/achievements/user/${userId}/stats`);
			const data = await response.json();
			if (data.success) {
				stats = data.stats;
			}
		} catch (error) {
			console.error('Error fetching stats:', error);
		}
	}

	function handleLogout() {
		localStorage.removeItem('user');
		user = null;
		window.location.href = '/signin';
	}

	// Handle achievement click
	function handleAchievementClick(achievement) {
		// List of task-related achievement keys
		const taskAchievements = [
			'first_task',
			'task_warrior_5',
			'task_master_10',
			'task_legend_25',
			'task_century_100',
			'speedster',
			'early_bird',
			'productive_day'
		];

		// If it's a task achievementredirect to quest-log page
		if (taskAchievements.includes(achievement.key)) {
			window.location.href = '/quest-log';
		}
	}
</script>

<div class="min-h-screen" style="background-color: #B5A490;">
	<!-- STATS BAR -->
	<div class="mx-auto max-w-7xl px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6">
		<div
			class="relative px-4 py-4 shadow-xl sm:px-8 sm:py-6 md:px-12 md:py-8"
			style="background-image: url({achievementsRectangle}); background-size: 100% 100%; background-position: center; background-repeat: no-repeat;"
		>
			<!-- Torn paper effect -->
			<div
				class="absolute right-0 bottom-0 left-0 h-3"
				style="background: linear-gradient(90deg, transparent 0%, transparent 40%, #B5A490 40%, #B5A490 60%, transparent 60%, transparent 100%); background-size: 20px 100%;"
			></div>

			<div class="grid grid-cols-1 gap-4 text-center sm:grid-cols-3 sm:gap-8">
				<div>
					<div
						class="mb-2 font-serif text-xs font-medium tracking-wider text-[#4F3117] uppercase sm:mb-3 sm:text-base"
					>
						Achievements<br />Unlocked
					</div>
					<div class="font-serif text-3xl font-bold text-[#3E2612] sm:text-4xl md:text-6xl">
						{stats.achievementsUnlocked}/{stats.totalAchievements}
					</div>
				</div>
				<div>
					<div
						class="mb-2 font-serif text-xs font-medium tracking-wider text-[#4F3117] uppercase sm:mb-3 sm:text-base"
					>
						Completion<br />Rate
					</div>
					<div class="font-serif text-3xl font-bold text-[#3E2612] sm:text-4xl md:text-6xl">
						{stats.completionRate}%
					</div>
				</div>
				<div>
					<div
						class="mb-2 font-serif text-xs font-medium tracking-wider text-[#4F3117] uppercase sm:mb-3 sm:text-base"
					>
						Total<br />XP
					</div>
					<div class="font-serif text-3xl font-bold text-[#3E2612] sm:text-4xl md:text-6xl">
						{stats.totalXP}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- ACHIEVEMENTS SECTION -->
	<div class="pb-6" style="background-color: #E3D3BF;">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
			<h2 class="mb-2 text-center font-serif text-3xl font-bold text-[#3E2612] sm:text-4xl md:text-5xl">Achievements</h2>
			<p class="mb-4 text-center font-serif text-sm tracking-widest text-[#4F3117] uppercase sm:mb-6 sm:text-base">
				Unlock badges and milestones
			</p>

			<!-- ACHIEVEMENTS -->
			<section class="relative">
				<!-- Left Knight Character with drop-shaped background -->
				<div class="absolute -top-5 left-[-250px] hidden xl:block">
					<div
						class="bg-[#3E3845] p-10"
						style="width: 520px; height: 580px; border-radius: 60% 40% 55% 45% / 50% 55% 45% 50%; display: flex; align-items: center; justify-content: center;"
					>
						<img src={knight} alt="Knight" class="h-[680px]" />
					</div>
				</div>

				<!-- Right Mage Character with drop-shaped background -->
				<div class="absolute right-[-250px] -bottom-5 hidden xl:block">
					<div
						class="bg-[#3E3845] p-10"
						style="width: 520px; height: 580px; border-radius: 45% 55% 50% 50% / 55% 45% 55% 45%; display: flex; align-items: center; justify-content: center;"
					>
						<img src={mage} alt="Mage" class="h-[680px]" />
					</div>
				</div>

				<div class="space-y-4 sm:space-y-5">
					<!-- Row 1 -->
					<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5 xl:justify-end">
						{#each achievements.slice(0, 2) as ach}
							<button
								type="button"
								on:click={() => handleAchievementClick(ach)}
								class="relative w-full max-w-[380px] cursor-pointer rounded-lg bg-[#F5EFE6] p-5 pb-20 shadow-xl transition-transform hover:-translate-y-0.5 sm:aspect-square sm:w-[380px] sm:p-7 sm:pb-7"
								style="border: 5px solid #6e5c3d;"
							>
								{#if ach.unlocked}
									<span
										class="absolute top-3 right-3 rounded-md bg-[#EEE9E1] px-3 py-1.5 text-xs font-bold tracking-wide text-[#3E2612] uppercase sm:top-4 sm:right-4 sm:px-4 sm:py-2 sm:text-sm"
										style="border: 2px solid #8B7355;"
									>
										Unlocked
									</span>
								{/if}

								<h2 class="mb-2 pr-20 font-serif text-xl font-bold text-[#3E2612] sm:mb-3 sm:pr-0 sm:text-2xl">{ach.name}</h2>
								<p class="mb-2 text-sm leading-relaxed text-[#5C4633] sm:mb-3 sm:text-base">{ach.description}</p>

								<div class="absolute right-4 bottom-4 left-4 flex items-center justify-between sm:right-6 sm:bottom-6 sm:left-6">
									<span class="text-sm font-semibold text-[#3E2612] sm:text-base"
										>{ach.icon}
										{ach.points} points</span
									>
									<img src={medal} alt="Medal" class="h-16 w-16 sm:h-34 sm:w-34" />
								</div>
							</button>
						{/each}
					</div>

					<!-- Row 2 -->
					<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5 xl:justify-end">
						{#each achievements.slice(2, 4) as ach}
							<button
								type="button"
								on:click={() => handleAchievementClick(ach)}
								class="relative w-full max-w-[380px] cursor-pointer rounded-lg bg-[#F5EFE6] p-5 pb-20 shadow-xl transition-transform hover:-translate-y-0.5 sm:aspect-square sm:w-[380px] sm:p-7 sm:pb-7"
								style="border: 5px solid #6e5c3d;"
							>
								{#if ach.unlocked}
									<span
										class="absolute top-3 right-3 rounded-md bg-[#EEE9E1] px-3 py-1.5 text-xs font-bold tracking-wide text-[#3E2612] uppercase sm:top-4 sm:right-4 sm:px-4 sm:py-2 sm:text-sm"
										style="border: 2px solid #8B7355;"
									>
										Unlocked
									</span>
								{/if}

								<h2 class="mb-2 pr-20 font-serif text-xl font-bold text-[#3E2612] sm:mb-3 sm:pr-0 sm:text-2xl">{ach.name}</h2>
								<p class="mb-2 text-sm leading-relaxed text-[#5C4633] sm:mb-3 sm:text-base">{ach.description}</p>

								<div class="absolute right-4 bottom-4 left-4 flex items-center justify-between sm:right-6 sm:bottom-6 sm:left-6">
									<span class="text-sm font-semibold text-[#3E2612] sm:text-base"
										>{ach.icon}
										{ach.points} points</span
									>
									<img src={medal} alt="Medal" class="h-16 w-16 sm:h-34 sm:w-34" />
								</div>
							</button>
						{/each}
					</div>

					<!-- Row 3 - aligned LEFT -->
					<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5 xl:justify-start">
						{#each achievements.slice(4, 6) as ach}
							<button
								type="button"
								on:click={() => handleAchievementClick(ach)}
								class="relative w-full max-w-[380px] cursor-pointer rounded-lg bg-[#F5EFE6] p-5 pb-20 shadow-xl transition-transform hover:-translate-y-0.5 sm:aspect-square sm:w-[380px] sm:p-7 sm:pb-7"
								style="border: 5px solid #6e5c3d;"
							>
								{#if ach.unlocked}
									<span
										class="absolute top-3 right-3 rounded-md bg-[#EEE9E1] px-3 py-1.5 text-xs font-bold tracking-wide text-[#3E2612] uppercase sm:top-4 sm:right-4 sm:px-4 sm:py-2 sm:text-sm"
										style="border: 2px solid #8B7355;"
									>
										Unlocked
									</span>
								{/if}

								<h2 class="mb-2 pr-20 font-serif text-xl font-bold text-[#3E2612] sm:mb-3 sm:pr-0 sm:text-2xl">{ach.name}</h2>
								<p class="mb-2 text-sm leading-relaxed text-[#5C4633] sm:mb-3 sm:text-base">{ach.description}</p>

								<div class="absolute right-4 bottom-4 left-4 flex items-center justify-between sm:right-6 sm:bottom-6 sm:left-6">
									<span class="text-sm font-semibold text-[#3E2612] sm:text-base"
										>{ach.icon}
										{ach.points} points</span
									>
									<img src={medal} alt="Medal" class="h-16 w-16 sm:h-34 sm:w-34" />
								</div>
							</button>
						{/each}
					</div>

					<!-- Row 4 - aligned LEFT -->
					<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5 xl:justify-start">
						{#each achievements.slice(6, 8) as ach}
							<button
								type="button"
								on:click={() => handleAchievementClick(ach)}
								class="relative w-full max-w-[380px] cursor-pointer rounded-lg bg-[#F5EFE6] p-5 pb-20 shadow-xl transition-transform hover:-translate-y-0.5 sm:aspect-square sm:w-[380px] sm:p-7 sm:pb-7"
								style="border: 5px solid #6e5c3d;"
							>
								{#if ach.unlocked}
									<span
										class="absolute top-3 right-3 rounded-md bg-[#EEE9E1] px-3 py-1.5 text-xs font-bold tracking-wide text-[#3E2612] uppercase sm:top-4 sm:right-4 sm:px-4 sm:py-2 sm:text-sm"
										style="border: 2px solid #8B7355;"
									>
										Unlocked
									</span>
								{/if}

								<h2 class="mb-2 pr-20 font-serif text-xl font-bold text-[#3E2612] sm:mb-3 sm:pr-0 sm:text-2xl">{ach.name}</h2>
								<p class="mb-2 text-sm leading-relaxed text-[#5C4633] sm:mb-3 sm:text-base">{ach.description}</p>

								<div class="absolute right-4 bottom-4 left-4 flex items-center justify-between sm:right-6 sm:bottom-6 sm:left-6">
									<span class="text-sm font-semibold text-[#3E2612] sm:text-base"
										>{ach.icon}
										{ach.points} points</span
									>
									<img src={medal} alt="Medal" class="h-16 w-16 sm:h-34 sm:w-34" />
								</div>
							</button>
						{/each}
					</div>
				</div>
			</section>
		</div>
	</div>
</div>