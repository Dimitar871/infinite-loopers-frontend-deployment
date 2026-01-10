<script>
	// 1. IMPORTS
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';

	// Images
	import coinIcon from '$lib/assets/coinbag.png';
	import starIcon from '$lib/assets/superstar.png';
	import owlImage from '$lib/assets/owl.png';
	import frogImage from '$lib/assets/frog.png';
	import parchment from '$lib/assets/review-panel.png';
	import coinSmall from '$lib/assets/coin.png';
	import Footer from '$lib/components/Footer.svelte';

	// 2. TYPE DEFINITIONS (Keeps VS Code happy)
	/**
	 * @typedef {Object} WeeklyData
	 * @property {string} day
	 * @property {number} completed
	 * @property {number} pending
	 */

	/**
	 * @typedef {Object} Category
	 * @property {string} name
	 * @property {number} value
	 * @property {string} color
	 */

	/**
	 * @typedef {Object} Stats
	 * @property {number} totalCompleted
	 * @property {number} completionRate
	 * @property {number} avgPerDay
	 * @property {number} coins
	 * @property {number} level
	 * @property {number} currentXp
	 * @property {number} maxXp
	 * @property {WeeklyData[]} weeklyData
	 * @property {Category[]} categories
	 * @property {Object} insights
	 * @property {string} insights.bestDay
	 * @property {number} insights.bestDayCount
	 * @property {string} insights.topCategory
	 * @property {number} insights.topCategoryCount
	 * @property {number} insights.streak
	 */

	// 3. STATE
	/** @type {Stats} */
	let stats = {
		totalCompleted: 0,
		completionRate: 0,
		avgPerDay: 0,
		coins: 0,
		level: 1,
		currentXp: 0,
		maxXp: 100,
		weeklyData: [],
		categories: [],
		insights: {
			bestDay: '-',
			bestDayCount: 0,
			topCategory: '-',
			topCategoryCount: 0,
			streak: 0
		}
	};

	// Helper to convert "Sun" -> "Sunday"
	/** @type {Record<string, string>} */
	const fullDayNames = {
		Mon: 'Monday',
		Tue: 'Tuesday',
		Wed: 'Wednesday',
		Thu: 'Thursday',
		Fri: 'Friday',
		Sat: 'Saturday',
		Sun: 'Sunday'
	};

	// 4. FETCH DATA
	onMount(async () => {
		try {
			const userId = localStorage.getItem('userId');

			if (!userId) {
				goto('/signin');
				return;
			}

			// 1. Fetch Charts from TASKS Service
			const taskResponse = await fetch(`http://localhost:3010/tasks/progress/${userId}`);
			const taskData = await taskResponse.json();

			// 2. Fetch Coins from USERS Service
			let userData = null;
			try {
				const userResponse = await fetch(`http://localhost:3012/users/${userId}`);
				userData = await userResponse.json();
			} catch (e) {
				console.error('Could not fetch user details (coins)', e);
			}

			if (taskData.success) {
				// Load the chart data
				stats = taskData.stats;

				// 3. Update Coins (With Fallbacks)
				if (userData) {
					const userObj = userData.user || userData.data || userData;

					// Try to find coins
					if (userObj.coins !== undefined) {
						stats.coins = userObj.coins;
					} else {
						const localUser = JSON.parse(localStorage.getItem('user') || '{}');
						if (localUser.coins) {
							stats.coins = localUser.coins;
						}
					}
					stats.level = userObj.level;
					stats.currentXp = userObj.xp;
					stats.maxXp = userObj.maxXp;
				}

				// Recalculate pie chart
				pieSlices = getPieSlices(stats.categories);
			}
		} catch (error) {
			console.error('Failed to load progress:', error);
		}
	});

	let chartCeiling = 12;
	let yAxisLabels = [12, 10, 8, 6, 4, 2, 0];

	$: {
		const maxVal = Math.max(...stats.weeklyData.map((d) => Math.max(d.completed, d.pending)));
		let ceiling = maxVal % 2 !== 0 ? maxVal + 1 : maxVal;
		chartCeiling = Math.max(ceiling, 12);
		yAxisLabels = Array.from({ length: chartCeiling / 2 + 1 }, (_, i) => chartCeiling - i * 2);
	}

	// 3. PIE CHART MATH LOGIC
	/**
	 * @param {Array<{name: string, value: number, color: string}>} data
	 */
	function getPieSlices(data) {
		if (!data || data.length === 0) return [];

		const total = data.reduce((sum, item) => sum + item.value, 0);
		if (total === 0) return [];

		let cumulativeAngle = -90;

		return data.map((item) => {
			const sliceAngle = (item.value / total) * 360;
			const midAngle = cumulativeAngle + sliceAngle / 2;

			// -- MATH HELPERS --
			const rad = (deg) => deg * (Math.PI / 180);
			const cos = Math.cos(rad(midAngle));
			const sin = Math.sin(rad(midAngle));

			// 1. Calculate Path
			// Handle Full Circle edge case
			let path = '';
			if (sliceAngle > 359.9) {
				path = `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0 Z`;
			} else {
				const x1 = Math.cos(rad(cumulativeAngle));
				const y1 = Math.sin(rad(cumulativeAngle));
				const x2 = Math.cos(rad(cumulativeAngle + sliceAngle));
				const y2 = Math.sin(rad(cumulativeAngle + sliceAngle));
				const largeArc = sliceAngle > 180 ? 1 : 0;
				path = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`;
			}

			// 2. Dynamic Text Anchor (The Fix!)
			// If cos > 0 (Right side), align Start (Left).
			// If cos < 0 (Left side), align End (Right).
			const textAnchor = cos >= 0 ? 'start' : 'end';

			// 3. Calculate Line & Text Positions
			// We push the text slightly further out (1.8) and add dynamic padding
			const lineStart = 0.95;
			const lineEnd = 1.45;
			const textRadius = 1.6;

			const lineX1 = cos * lineStart;
			const lineY1 = sin * lineStart;
			const lineX2 = cos * lineEnd;
			const lineY2 = sin * lineEnd;

			// Add small padding to text so it doesn't touch the line tip
			const padding = 0.1;
			const labelX = cos * textRadius + (cos >= 0 ? padding : -padding);
			const labelY = sin * textRadius;

			cumulativeAngle += sliceAngle;

			return {
				...item,
				path,
				textAnchor, // <--- New Property
				labelX,
				labelY,
				lineX1,
				lineY1,
				lineX2,
				lineY2
			};
		});
	}

	let pieSlices = getPieSlices(stats.categories);
</script>

<!-- TOP STATS -->
<section class="bg-[#E8DCCD] px-4 py-12 sm:px-12 lg:px-28">
	<h1
		class="mb-12 text-center font-['IM_Fell_Great_Primer_SC'] text-3xl text-[#4F3117] sm:text-5xl"
	>
		Your Adventure Progress
	</h1>

	<div class="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
		<!-- Card 1 -->
		<div
			class="relative mx-auto flex w-full max-w-[320px] items-center justify-center transition-transform duration-300 hover:-translate-y-2"
		>
			<img
				src={parchment}
				alt="parchment background"
				class="pointer-events-none h-auto w-full object-contain drop-shadow-md select-none"
			/>
			<div
				class="absolute inset-0 flex flex-col items-center justify-center px-6 pt-4 pb-2 text-center"
			>
				<h3
					class="font-['IM_Fell_Great_Primer_SC'] text-lg leading-tight text-[#5A3E1B] sm:text-xl"
				>
					Total Completed
				</h3>
				<div class="my-1 font-['IM_Fell_Great_Primer_SC'] text-5xl text-[#4F3117] sm:text-6xl">
					{stats.totalCompleted}
				</div>
				<p
					class="font-['Inter'] text-xs font-bold tracking-widest text-[#8C7B65] uppercase sm:text-sm"
				>
					This Week
				</p>
			</div>
		</div>
		<!-- Card 2 -->
		<div
			class="relative mx-auto flex w-full max-w-[320px] items-center justify-center transition-transform duration-300 hover:-translate-y-2"
		>
			<img
				src={parchment}
				alt="parchment background"
				class="pointer-events-none h-auto w-full object-contain drop-shadow-md select-none"
			/>
			<div
				class="absolute inset-0 flex flex-col items-center justify-center px-6 pt-4 pb-2 text-center"
			>
				<h3
					class="font-['IM_Fell_Great_Primer_SC'] text-lg leading-tight text-[#5A3E1B] sm:text-xl"
				>
					Completion Rate
				</h3>
				<div class="my-1 font-['IM_Fell_Great_Primer_SC'] text-5xl text-[#4F3117] sm:text-6xl">
					{stats.completionRate}%
				</div>
				<p
					class="font-['Inter'] text-xs font-bold tracking-widest text-[#8C7B65] uppercase sm:text-sm"
				>
					Success Rate
				</p>
			</div>
		</div>
		<!-- Card 3 -->
		<div
			class="relative mx-auto flex w-full max-w-[320px] items-center justify-center transition-transform duration-300 hover:-translate-y-2"
		>
			<img
				src={parchment}
				alt="parchment background"
				class="pointer-events-none h-auto w-full object-contain drop-shadow-md select-none"
			/>
			<div
				class="absolute inset-0 flex flex-col items-center justify-center px-6 pt-4 pb-2 text-center"
			>
				<h3
					class="font-['IM_Fell_Great_Primer_SC'] text-lg leading-tight text-[#5A3E1B] sm:text-xl"
				>
					Avg Per Day
				</h3>
				<div class="my-1 font-['IM_Fell_Great_Primer_SC'] text-5xl text-[#4F3117] sm:text-6xl">
					{stats.avgPerDay}
				</div>
				<p
					class="font-['Inter'] text-xs font-bold tracking-widest text-[#8C7B65] uppercase sm:text-sm"
				>
					Quests Completed
				</p>
			</div>
		</div>
	</div>
</section>

<!-- OWL & COINS -->
<section class="bg-[#FAF6F0] px-4 py-16 sm:px-12 lg:px-28">
	<!-- Currency & Level -->
	<div class="mx-auto mb-20 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
		<div
			class="flex transform items-center gap-4 rounded-lg border-4 border-[#5C4B35] bg-[#E0D8C8] p-4 shadow-lg transition-transform hover:scale-[1.02] sm:gap-6 sm:p-6"
		>
			<img
				src={coinIcon}
				alt="Coins"
				class="h-16 w-16 object-contain drop-shadow-md sm:h-20 sm:w-20"
			/>
			<div>
				<h3 class="font-['IM_Fell_Great_Primer_SC'] text-xl text-[#5C4B35] sm:text-2xl">Coins</h3>
				<span class="font-['IM_Fell_Great_Primer_SC'] text-4xl text-[#4F3117] sm:text-5xl"
					>{stats.coins}</span
				>
			</div>
		</div>
		<div
			class="flex transform items-center gap-4 rounded-lg border-4 border-[#5C4B35] bg-[#E0D8C8] p-4 shadow-lg transition-transform hover:scale-[1.02] sm:gap-6 sm:p-6"
		>
			<img
				src={starIcon}
				alt="Level"
				class="h-16 w-16 object-contain drop-shadow-md sm:h-20 sm:w-20"
			/>
			<div class="w-full">
				<div class="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
					<h3 class="font-['IM_Fell_Great_Primer_SC'] text-xl text-[#5C4B35] sm:text-2xl">
						Level {stats.level}
					</h3>
					<span class="font-['IM_Fell_Great_Primer_SC'] text-sm text-[#6D5C45] sm:text-lg"
						>{stats.currentXp}/{stats.maxXp} xp</span
					>
				</div>
				<div
					class="h-4 w-full overflow-hidden rounded-full border border-[#5C4B35] bg-[#FAF6F0] sm:h-5"
				>
					<div
						class="h-full border-r border-[#5C4B35] bg-[#A89F91]"
						style="width: {(stats.currentXp / stats.maxXp) * 100}%"
					></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Weekly Quest Completion-->
	<div class="mx-auto mb-8 max-w-6xl">
		<h2 class="text-center font-['IM_Fell_Great_Primer_SC'] text-2xl text-[#4F3117] sm:text-4xl">
			Weekly Quest Completion
		</h2>
		<p
			class="mb-8 text-center font-['Inter'] text-xs font-bold text-[#6D5C45] uppercase sm:text-base"
		>
			Quests completed vs pending this week
		</p>

		<div
			class="relative mt-8 flex flex-col items-center lg:flex-row lg:items-end lg:justify-center"
		>
			<!-- OWL -->
			<div
				class="pointer-events-none relative z-10 order-1 -mb-16 flex w-48 justify-center sm:w-64 lg:order-1 lg:-mr-4 lg:-mb-8 lg:w-80"
			>
				<img src={owlImage} alt="Owl Wizard" class="relative z-10 w-full drop-shadow-2xl" />
			</div>

			<div
				class="z-0 order-2 flex h-80 w-full flex-col rounded-lg border-2 border-[#5C4B35] bg-[#E0D8C8] p-6 shadow-inner sm:h-96 lg:w-2/3"
			>
				<div class="flex flex-1 items-stretch">
					<div
						class="flex flex-col justify-between border-r border-[#5C4B35]/30 pr-2 pb-1 font-['Inter'] text-xs text-[#6D5C45]"
					>
						{#each yAxisLabels as label}
							<span class="flex h-0 items-center justify-end">{label}-</span>
						{/each}
					</div>

					<div class="flex flex-1 items-end justify-between px-2">
						{#each stats.weeklyData as data}
							<div class="mx-1 flex h-full flex-1 items-end justify-center gap-1">
								<div
									class="w-4 rounded-t-sm border-t border-r border-l border-[#5C4B35]/20 bg-[#B5AFA2] transition-all hover:opacity-80 sm:w-6"
									style="height: {(data.completed / chartCeiling) * 100}%"
								></div>
								<div
									class="w-4 rounded-t-sm bg-[#4F3117] transition-all hover:opacity-80 sm:w-6"
									style="height: {(data.pending / chartCeiling) * 100}%"
								></div>
							</div>
						{/each}
					</div>
				</div>

				<div class="flex w-full border-t border-[#5C4B35]/20 pt-2">
					<div class="w-[35px]"></div>

					<div class="flex flex-1 justify-between px-2">
						{#each stats.weeklyData as data}
							<div class="flex flex-1 justify-center">
								<span
									class="font-['IM_Fell_Great_Primer_SC'] text-[10px] tracking-widest text-[#4F3117] uppercase sm:text-xs"
								>
									{data.day}
								</span>
							</div>
						{/each}
					</div>
				</div>

				<div class="flex justify-center gap-8 pt-4">
					<div class="flex items-center gap-2">
						<div class="h-4 w-4 rounded-sm border border-[#5C4B35]/30 bg-[#B5AFA2]"></div>
						<span
							class="font-['IM_Fell_Great_Primer_SC'] text-xs text-[#4F3117] uppercase sm:text-sm"
							>Completed</span
						>
					</div>
					<div class="flex items-center gap-2">
						<div class="h-4 w-4 rounded-sm bg-[#4F3117]"></div>
						<span
							class="font-['IM_Fell_Great_Primer_SC'] text-xs text-[#4F3117] uppercase sm:text-sm"
							>Pending</span
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- FROG -->
<section class="bg-[#E8DCCD] px-4 py-16 sm:px-12 lg:px-28">
	<div class="mx-auto max-w-6xl">
		<h2 class="text-center font-['IM_Fell_Great_Primer_SC'] text-2xl text-[#4F3117] sm:text-4xl">
			Quests By Category
		</h2>
		<p
			class="mb-8 text-center font-['Inter'] text-xs font-bold text-[#6D5C45] uppercase sm:text-base"
		>
			Distribution of completed quests
		</p>

		<div
			class="relative mt-8 flex flex-col items-center lg:flex-row lg:items-end lg:justify-center"
		>
			<div
				class="pointer-events-none relative z-10 order-1 -mb-16 flex w-48 justify-center sm:w-64 lg:order-2 lg:-mb-8 lg:-ml-4 lg:w-80"
			>
				<img src={frogImage} alt="Frog Traveler" class="relative z-10 w-full drop-shadow-2xl" />
			</div>

			<!-- PIE CHART BOX -->
			<div
				class="relative z-0 order-2 flex h-80 w-full items-center justify-center overflow-visible rounded-lg border-2 border-[#5C4B35] bg-[#FAF6F0] p-4 shadow-inner sm:h-96 lg:order-1 lg:mt-0 lg:w-2/3"
			>
				<!-- Increased viewBox slightly to fit wider text -->
				<svg viewBox="-2.4 -2.4 4.8 4.8" class="h-full w-full max-w-[500px] overflow-visible">
					{#each pieSlices as slice}
						<path d={slice.path} fill={slice.color} stroke="#FAF6F0" stroke-width="0.02" />
					{/each}

					{#each pieSlices as slice}
						<!-- UPDATED: Uses text-anchor={slice.textAnchor} -->
						<text
							x={slice.labelX}
							y={slice.labelY}
							text-anchor={slice.textAnchor}
							dominant-baseline="middle"
							class="fill-[#4F3117] font-['IM_Fell_Great_Primer_SC'] text-[0.22px] uppercase"
						>
							{slice.name}: {slice.value}
						</text>

						<line
							x1={slice.lineX1}
							y1={slice.lineY1}
							x2={slice.lineX2}
							y2={slice.lineY2}
							stroke="#5C4B35"
							stroke-width="0.015"
							opacity="0.5"
						/>
					{/each}
				</svg>
			</div>
		</div>
	</div>
</section>

<!-- INSIGHTS -->
<section class="bg-[#FAF6F0] px-4 py-16 sm:px-12 lg:px-28">
	<div class="mx-auto max-w-4xl">
		<h2 class="text-center font-['IM_Fell_Great_Primer_SC'] text-2xl text-[#4F3117] sm:text-4xl">
			Weekly Insights
		</h2>
		<p
			class="mb-8 text-center font-['Inter'] text-xs font-bold text-[#6D5C45] uppercase sm:text-base"
		>
			FROM YOUR BEST DAYS TO YOUR GREATEST ACHIEVEMENTS
		</p>

		<div class="flex flex-col gap-4">
			<!-- Best Day -->
			<div
				class="flex items-center gap-4 rounded-lg border-2 border-[#5C4B35] bg-[#E0D8C8] p-4 shadow-md sm:px-8 sm:py-6"
			>
				<img src={coinSmall} alt="coin" class="h-8 w-8 sm:h-10 sm:w-10" />
				<div class="flex flex-col">
					<span class="font-['IM_Fell_Great_Primer_SC'] text-lg text-[#4F3117] sm:text-xl"
						>Best Day</span
					>
					<span class="font-['IM_Fell_Great_Primer_SC'] text-base text-[#5C4B35] sm:text-lg">
						{fullDayNames[stats.insights.bestDay] || stats.insights.bestDay} with {stats.insights
							.bestDayCount} quests completed
					</span>
				</div>
			</div>

			<!-- Top Category -->
			<div
				class="flex items-center gap-4 rounded-lg border-2 border-[#5C4B35] bg-[#E0D8C8] p-4 shadow-md sm:px-8 sm:py-6"
			>
				<img src={coinSmall} alt="coin" class="h-8 w-8 sm:h-10 sm:w-10" />
				<div class="flex flex-col">
					<span class="font-['IM_Fell_Great_Primer_SC'] text-lg text-[#4F3117] sm:text-xl"
						>Top Category</span
					>
					<span class="font-['IM_Fell_Great_Primer_SC'] text-base text-[#5C4B35] sm:text-lg">
						{stats.insights.topCategory} ( {stats.insights.topCategoryCount} completed )
					</span>
				</div>
			</div>

			<!-- Current Streak -->
			<div
				class="flex items-center gap-4 rounded-lg border-2 border-[#5C4B35] bg-[#E0D8C8] p-4 shadow-md sm:px-8 sm:py-6"
			>
				<img src={coinSmall} alt="coin" class="h-8 w-8 sm:h-10 sm:w-10" />
				<div class="flex flex-col">
					<span class="font-['IM_Fell_Great_Primer_SC'] text-lg text-[#4F3117] sm:text-xl"
						>Current Streak</span
					>
					<span class="font-['IM_Fell_Great_Primer_SC'] text-base text-[#5C4B35] sm:text-lg">
						{stats.insights.streak}
						{stats.insights.streak === 1 ? 'day' : 'days'} of consistent work
					</span>
				</div>
			</div>
		</div>
	</div>
</section>
