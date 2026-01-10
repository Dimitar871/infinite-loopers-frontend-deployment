<script>
	import { openModal } from '../../modalStore.js';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let tasks = [];
	let sortedTasks = [];
	let originalTasksOrder = [];

	let showModal = false;
	let showDetailModal = false;

	// --- PREMADE MODAL TOGGLE ---
	let showPremadeModal = false;

	let selectedTask = null;
	let sortByPriority = 'none'; // 'none' | 'asc' | 'desc'
	let sortByDate = 'none'; // 'none' | 'asc' | 'desc'
	let filterByCategory = 'all';
	let searchQuery = '';
	let formError = '';

	let form = { title: '', endDate: '', category: '', priority: 'Medium' };
	let userId = null;
	let email = '';
	let error = '';

	// --- PREMADE QUEST DATA ---
	const premadeTemplates = {
		Study: ['Read 1 Chapter', 'Complete Assignment', 'Flashcard Session'],
		Work: ['Clear Inbox', 'Team Meeting', 'Write Report'],
		Chores: ['Wash Dishes', 'Vacuum Room', 'Take out Trash'],
		Wellness: ['30 Min Walk', 'Drink 2L Water', 'Meditation'],
		Reading: ['Read 15 Pages', 'Audiobook Session'],
		Hobbies: ['Practice Skill', 'Creative Time'],
		Social: ['Call a Friend', 'Family Dinner'],
		Events: ['Birthday Party', 'Doctor Appointment']
	};

	// --- QUICK ADD FUNCTION ---
	function selectPremade(title, category) {
		// Fill the form automatically
		form.title = title;
		form.category = category;
		form.priority = 'Medium';

		// Set date to TODAY
		const today = new Date();
		form.endDate = today.toISOString().split('T')[0];

		// Reuse existing submit function
		submitTask();

		// Close modal
		showPremadeModal = false;
	}

	onMount(async () => {
		const storedUser = localStorage.getItem('user');
		if (!storedUser) {
			error = 'No user found, please login first.';
			return;
		}

		const user = JSON.parse(storedUser);
		email = user.email;
		userId = user.id;

		const tempForm = sessionStorage.getItem('tempForm');
		const selectedDate = sessionStorage.getItem('selectedDate');
		const isSelectingDate = sessionStorage.getItem('isSelectingDate') === 'true';

		if (tempForm) {
			form = JSON.parse(tempForm);
			if (isSelectingDate && selectedDate) form.endDate = selectedDate;
			showModal = isSelectingDate;
			sessionStorage.removeItem('tempForm');
			sessionStorage.removeItem('isSelectingDate');
			sessionStorage.removeItem('selectedDate');
		}

		await loadTasks();
	});

	async function loadTasks() {
		if (!userId) return;
		try {
			const res = await fetch(`http://localhost:3011/tasks/${userId}`);
			const data = await res.json();
			if (data.success) {
				tasks = data.tasks.map((task, index) => ({
					id: task.id,
					title: task.title,
					end: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
					status: task.status,
					category: task.category,
					priority: task.priority,
					originalIndex: index,
					createdAt: task.createdAt || task.created_at || new Date().getTime(),
					notes: task.notes || '',
					suggestions: task.suggestions || '',
					subtasks: task.subtasks || []
				}));
				originalTasksOrder = [...tasks];
				sortTasks();
			} else {
				error = data.message;
			}
		} catch (err) {
			console.error(err);
			error = 'Failed to load tasks';
		}
	}

	function addTask() {
		showModal = true;
	}

	function openCalendar() {
		sessionStorage.setItem('tempForm', JSON.stringify(form));
		sessionStorage.setItem('isSelectingDate', 'true');
		goto('/calendar');
	}

	function sortTasks() {
		let filtered = tasks.filter(
			(t) =>
				t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
				(filterByCategory === 'all' || t.category.toLowerCase() === filterByCategory.toLowerCase())
		);

		if (sortByPriority === 'none' && sortByDate === 'none') {
			sortedTasks = [...filtered].sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));
			return;
		}

		const priorityOrder = { High: 3, Medium: 2, Low: 1 };

		sortedTasks = [...filtered].sort((a, b) => {
			if (sortByPriority !== 'none') {
				const diff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
				if (diff !== 0) return sortByPriority === 'asc' ? diff : -diff;
			}
			if (sortByDate !== 'none') {
				const aTime = a.end ? new Date(a.end).getTime() : 0;
				const bTime = b.end ? new Date(b.end).getTime() : 0;
				return sortByDate === 'asc' ? aTime - bTime : bTime - aTime;
			}
			return 0;
		});
	}

	function toggleSortPriority() {
		sortByPriority = sortByPriority === 'none' ? 'asc' : sortByPriority === 'asc' ? 'desc' : 'none';
	}
	function toggleSortDate() {
		sortByDate = sortByDate === 'none' ? 'asc' : sortByDate === 'asc' ? 'desc' : 'none';
	}

	$: if (tasks.length || sortByPriority || sortByDate || filterByCategory || searchQuery)
		sortTasks();

	async function submitTask() {
		formError = '';
		if (!form.title.trim()) {
			formError = 'Task name is required';
			return;
		}
		if (!userId) return;

		try {
			const res = await fetch(`http://localhost:3011/tasks/${userId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...form, userId })
			});
			const data = await res.json();
			if (data.success) {
				const newT = {
					id: data.task.id,
					title: data.task.title,
					end: data.task.endDate ? new Date(data.task.endDate).toISOString().split('T')[0] : '',
					status: data.task.status,
					category: data.task.category,
					priority: data.task.priority,
					originalIndex: tasks.length,
					createdAt: data.task.createdAt || data.task.created_at || new Date().getTime(),
					notes: data.task.notes || '',
					suggestions: data.task.suggestions || '',
					subtasks: data.task.subtasks || []
				};
				tasks = [...tasks, newT];
				originalTasksOrder = [...tasks];
				sortTasks();
				showModal = false;
				form = { title: '', endDate: '', category: '', priority: 'Medium' };
			} else {
				openModal(data.message || 'Failed to add task', 'error');
			}
		} catch (err) {
			console.error(err);
		}
	}

	async function completeTask(taskId) {
		try {
			const res = await fetch(`http://localhost:3010/tasks/${taskId}/complete`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' }
			});
			const data = await res.json();
			if (data.success) {
				if (data.unlockedAchievements?.length > 0) {
					openModal(
						`🎉 Achievement unlocked: ${data.unlockedAchievements.map((a) => a.name).join(', ')}!`,
						'success'
					);
				}
				await loadTasks();
			} else {
				openModal(data.message || 'Failed to complete task', 'error');
			}
		} catch (err) {
			console.error(err);
			openModal('Failed to complete task', 'error');
		}
	}

	function openDetailModal(taskId) {
		const task = tasks.find((t) => t.id === taskId);
		if (!task) return;

		selectedTask = {
			...task,
			notes: task.notes || '',
			suggestions: task.suggestions || '',
			subtasks: [...(task.subtasks || [])]
		};
		showDetailModal = true;
	}

	function closeDetailModal() {
		showDetailModal = false;
		selectedTask = null;
	}
	function addSubtask() {
		if (!selectedTask) return;
		selectedTask.subtasks = [
			...(selectedTask.subtasks || []),
			{ id: Date.now(), text: '', completed: false }
		];
		selectedTask = { ...selectedTask };
	}

	function removeSubtask(subtaskId) {
		if (!selectedTask || !selectedTask.subtasks) return;
		selectedTask.subtasks = selectedTask.subtasks.filter(
			(/** @type {{ id: any; }} */ st) => st.id !== subtaskId
		);
		selectedTask = { ...selectedTask };
	}

	function toggleSubtask(subtaskId) {
		if (!selectedTask || !selectedTask.subtasks) return;
		selectedTask.subtasks = selectedTask.subtasks.map(
			(/** @type {{ id: any; completed: any; }} */ st) =>
				st.id === subtaskId ? { ...st, completed: !st.completed } : st
		);
		selectedTask = { ...selectedTask };
	}

	async function saveTaskDetails() {
		if (!selectedTask || !userId) return;
		try {
			const res = await fetch(`http://localhost:3010/tasks/${selectedTask.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					notes: selectedTask.notes,
					suggestions: selectedTask.suggestions,
					subtasks: selectedTask.subtasks
				})
			});
			const data = await res.json();
			if (data.success) {
				// update task in array
				const taskIndex = tasks.findIndex(
					(/** @type {{ id: any; }} */ t) => t.id === selectedTask.id
				);
				if (taskIndex !== -1) {
					tasks[taskIndex] = {
						...tasks[taskIndex],
						notes: selectedTask.notes,
						suggestions: selectedTask.suggestions,
						subtasks: selectedTask.subtasks
					};
					tasks = [...tasks];
					sortTasks();
				}
				closeDetailModal();
			} else {
				alert(data.message || 'Failed to save task details');
			}
		} catch (err) {
			console.error(err);
			alert('Failed to save task details');
		}
	}

	async function deleteTask(taskId) {
		try {
			const res = await fetch(`http://localhost:3010/tasks/${taskId}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});

			const data = await res.json();

			if (data.success) {
				await loadTasks();
				openModal('✓ Quest deleted successfully!', 'success');
			} else {
				openModal(data.message || 'Failed to delete quest', 'error');
			}
		} catch (err) {
			console.error('Error deleting task:', err);
			openModal('Failed to delete quest', 'error');
		}
	}
</script>

<div class="min-h-screen bg-[#F8F3ED] p-4 font-serif sm:p-6">
	<h1
		class="mb-8 text-center font-['IM_Fell_Great_Primer_SC'] text-2xl tracking-wide text-[#4F3117] sm:text-3xl md:text-4xl"
	>
		Quest List
	</h1>

	<!-- Search -->
	<div class="mb-4 sm:mb-6">
		<input
			type="text"
			placeholder="Search tasks by name..."
			bind:value={searchQuery}
			class="w-full rounded-lg border border-[#4F3117] bg-white px-2 py-1 font-['Inter',sans-serif] text-sm shadow-sm focus:ring-2 focus:ring-[#4F3117] focus:outline-none sm:px-4 sm:py-2 sm:text-lg"
		/>
	</div>

	<!-- BUTTON GROUP (Custom vs Premade) -->
	<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex w-full gap-2 sm:w-auto">
			<button
				on:click={addTask}
				class="flex-1 rounded-lg bg-[#F5E8D9] px-2.5 py-1.5 font-['Inter',sans-serif] text-base font-semibold text-[#4F3117] shadow-md hover:opacity-70 sm:px-3 sm:py-1.5"
			>
				+ Custom
			</button>

			<button
				on:click={() => (showPremadeModal = true)}
				class="flex-1 rounded-lg bg-[#F5E8D9] px-2.5 py-1.5 font-['Inter',sans-serif] text-base font-semibold text-[#4F3117] shadow-md hover:opacity-70 sm:px-3 sm:py-1.5"
			>
				Premade Quests
			</button>
		</div>

		<div class="flex flex-wrap items-center gap-2 font-['Inter',sans-serif] font-semibold sm:gap-3">
			<!-- Category -->
			<div class="flex flex-wrap gap-2">
				{#each ['all', 'study', 'work', 'chores'] as cat}
					<button
						on:click={() => (filterByCategory = cat)}
						class="rounded-lg border-2 px-3 py-1 text-sm font-medium transition-all sm:px-4 sm:py-2 sm:text-base {filterByCategory ===
						cat
							? 'border-[#4F3117] bg-[#4F3117] text-white shadow-md'
							: 'border-[#4F3117] bg-white text-[#4F3117] hover:bg-[#F5E8D9]'}"
						>{cat[0].toUpperCase() + cat.slice(1)}</button
					>
				{/each}
			</div>

			<!-- Sort -->
			<button
				on:click={toggleSortPriority}
				class="flex flex-1 items-center gap-1 rounded-lg border-2 border-[#4F3117] bg-white px-2 py-1 text-sm text-[#4F3117] transition-all hover:bg-[#F5E8D9] hover:opacity-80 sm:flex-auto sm:px-4 sm:py-2 sm:text-base {sortByPriority !==
				'none'
					? 'bg-[#F5E8D9] shadow-md'
					: ''}"
				>Priority {sortByPriority === 'asc' ? '↑' : sortByPriority === 'desc' ? '↓' : '⇅'}</button
			>
			<button
				on:click={toggleSortDate}
				class="flex flex-1 items-center gap-1 rounded-lg border-2 border-[#4F3117] bg-white px-2 py-1 text-sm text-[#4F3117] transition-all hover:bg-[#F5E8D9] hover:opacity-80 sm:flex-auto sm:px-4 sm:py-2 sm:text-base {sortByDate !==
				'none'
					? 'bg-[#F5E8D9] shadow-md'
					: ''}">Date {sortByDate === 'asc' ? '↑' : sortByDate === 'desc' ? '↓' : '⇅'}</button
			>
		</div>
	</div>

	<!-- desktop -->
	<div class="hidden overflow-x-auto sm:block">
		<table class="w-full border-separate border-spacing-y-2 sm:border-spacing-y-4">
			<thead class="font-['Inter',sans-serif] text-lg font-semibold text-[#4F3117]">
				<tr>
					<th class="px-2 py-2 text-left sm:px-4">Quest</th>
					<th class="px-2 py-2 text-left sm:px-4">End day</th>
					<th class="px-2 py-2 text-left sm:px-4">Priority</th>
					<th class="px-2 py-2 text-left sm:px-4">Status</th>
					<th class="px-2 py-2 text-left sm:px-4">Category</th>
					<th class="px-2 py-2 text-left sm:px-4">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each sortedTasks as task}
					<tr
						class="rounded-xl bg-[#F4E9D8] font-['Inter',sans-serif] font-semibold text-[#4F3117] shadow-md"
					>
						<td class="sm:text-md px-2 py-2 text-base sm:px-4 sm:py-3">{task.title}</td>
						<td class="sm:text-md px-2 py-2 text-base sm:px-4 sm:py-3">{task.end}</td>
						<td class="sm:text-md px-2 py-2 text-base sm:px-4 sm:py-3">
							<span
								class={task.priority === 'High'
									? 'font-bold text-red-600'
									: task.priority === 'Medium'
										? 'text-orange-600'
										: 'text-green-600'}
							>
								{task.priority || 'Medium'}
							</span>
						</td>
						<td class="sm:text-md px-2 py-2 text-base sm:px-4 sm:py-3">{task.status}</td>
						<td class="sm:text-md px-2 py-2 text-base sm:px-4 sm:py-3">{task.category}</td>
						<td class="sm:text-md px-2 py-2 text-base sm:px-4 sm:py-3">
							<div class="flex flex-wrap items-center gap-2">
								<button
									on:click={() => openDetailModal(task.id)}
									class="rounded bg-[#4F3117] px-3 py-1 text-sm font-normal text-white hover:bg-[#3E2612]"
									>Details</button
								>
								{#if task.status !== 'Completed'}
									<button
										on:click={() => completeTask(task.id)}
										class="rounded bg-green-600 px-3 py-1 text-sm font-normal text-white hover:bg-green-700"
									>
										Complete</button
									>
								{:else}
									<span class="text-sm text-green-600">✓ Done</span>
								{/if}
								<button
									on:click={() => deleteTask(task.id)}
									class="rounded bg-red-600 px-3 py-1 text-sm font-normal text-white hover:bg-red-700"
								>
									Delete
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- mobile -->
	<div class="flex flex-col gap-4 text-[#4F3117] sm:hidden">
		{#each sortedTasks as task}
			<div class="rounded-xl bg-[#F4E9D8] p-4 font-['Inter',sans-serif] font-semibold shadow-md">
				<div class="mb-2 flex items-center justify-between">
					<h3 class="text-lg text-[#4F3117]">{task.title}</h3>
					<span
						class={task.priority === 'High'
							? 'text-red-600'
							: task.priority === 'Medium'
								? 'text-orange-600'
								: 'text-green-600'}
					>
						{task.priority || 'Medium'}
					</span>
				</div>
				<p class="text-sm">End: {task.end}</p>
				<p class="text-sm">Status: {task.status}</p>
				<p class="text-sm">Category: {task.category}</p>
				<div class="mt-2 flex flex-wrap gap-2">
					<button
						on:click={() => openDetailModal(task.id)}
						class="rounded bg-[#4F3117] px-3 py-1 text-sm font-normal text-white hover:bg-[#3E2612]"
						>Details</button
					>
					{#if task.status !== 'Completed'}
						<button
							on:click={() => completeTask(task.id)}
							class="rounded bg-green-600 px-3 py-1 text-sm font-normal text-white hover:bg-green-700"
						>
							Complete</button
						>
					{:else}
						<span class="text-sm px-3 py-2 text-green-600">✓ Done</span>
					{/if}
					<button
						on:click={() => deleteTask(task.id)}
						class="flex items-center justify-center rounded bg-red-600 p-2 text-white hover:bg-red-700"
						aria-label="Delete task"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 448 512"
							class="h-5 w-5 fill-white"
						>
							<path
								d="M136.7 5.9C141.1-7.2 153.3-16 167.1-16l113.9 0c13.8 0 26 8.8 30.4 21.9L320 32 416 32c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 8.7-26.1zM32 144l384 0 0 304c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-304zm88 64c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24zm104 0c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24zm104 0c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24z"
							/>
						</svg>
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Modal -->
{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2">
		<div
			class="w-full max-w-[90vw] overflow-hidden rounded-xl border-6 border-double border-[#ad8a6c] bg-[#fdf3e7] font-['IM_Fell_Great_Primer_SC'] shadow-[0_0_20px_rgba(0,0,0,0.5)] md:w-[520px]"
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between border-b-2 border-[#ad8a6c] px-4 py-3 text-[#4F3117]"
			>
				<h2 class="text-xl sm:text-2xl">Create New Quest</h2>
				<button
					on:click={() => (showModal = false)}
					class="text-xl transition-transform hover:rotate-12">✖</button
				>
			</div>
			<!-- Content -->
			<div class="space-y-3 p-4 text-[#4F3117] sm:space-y-4 sm:p-6">
				<input
					type="text"
					placeholder="Quest Name"
					bind:value={form.title}
					class="w-full rounded border-2 bg-[#fff8e1] p-2 text-base focus:outline-none sm:text-lg {formError
						? 'border-red-600 focus:ring-2 focus:ring-red-400'
						: 'border-[#ad8a6c] focus:ring-2 focus:ring-[#ad8a6c]'}"
				/>
				{#if formError}<p class="text-sm text-red-600">{formError}</p>{/if}
				<button
					type="button"
					on:click={openCalendar}
					class="flex w-full justify-between rounded border-2 border-[#ad8a6c] bg-[#fff8e1] p-2 text-base hover:bg-[#f1e0c5] sm:p-3 sm:text-lg"
					>{form.endDate || 'Pick a date'} <span>📅</span></button
				>
				<div>
					<label class="mb-1 block text-sm" for="priority">Priority</label>
					<select
						id="priority"
						bind:value={form.priority}
						class="w-full rounded border-2 bg-[#fff8e1] p-2 text-base sm:text-lg"
					>
						<option value="Low">Low</option>
						<option value="Medium">Medium</option>
						<option value="High">High</option>
					</select>
				</div>
				<div>
					<!-- UPDATED CATEGORIES FOR DROPDOWN -->
					<label class="mb-1 block text-sm" for="category">Category</label>
					<select
						id="category"
						bind:value={form.category}
						class="w-full rounded border-2 bg-[#fff8e1] p-2 text-base sm:text-lg"
					>
						<option value="">Select Category</option>
						<option value="Work">Work</option>
						<option value="Study">Study</option>
						<option value="Chores">Chores</option>
						<option value="Wellness">Wellness</option>
						<option value="Reading">Reading</option>
						<option value="Hobbies">Hobbies</option>
						<option value="Social">Social</option>
						<option value="Events">Events</option>
					</select>
				</div>
				<div class="mt-4 flex flex-col gap-3 sm:flex-row">
					<button
						class="flex-1 rounded-lg border-2 border-[#ad8a6c] bg-[#fff8e1] py-2 text-lg hover:bg-[#f1e0c5] sm:text-base"
						on:click={submitTask}>Submit</button
					>
					<button
						class="flex-1 rounded-lg border-2 border-[#ad8a6c] bg-[#e0d3c2] py-2 text-lg hover:bg-[#d2c1aa] sm:text-base"
						on:click={() => (showModal = false)}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- PREMADE TASKS MODAL -->
{#if showPremadeModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
		<div
			class="relative max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-xl border-6 border-double border-[#ad8a6c] bg-[#fdf3e7] p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] sm:p-8"
		>
			<div class="mb-6 flex items-center justify-between border-b-2 border-[#ad8a6c] pb-2">
				<h2 class="font-['IM_Fell_Great_Primer_SC'] text-2xl text-[#4F3117] sm:text-3xl">
					Quick Select Quest
				</h2>
				<button
					on:click={() => (showPremadeModal = false)}
					class="bg-transparent border-none font-bold text-xl text-[#4F3117] cursor-pointer transition-transform duration-200 hover:rotate-12">
					✕
				</button>
			</div>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each Object.entries(premadeTemplates) as [category, list]}
					<div class="flex flex-col gap-2">
						<h3
							class="mb-1 border-b border-[#4F3117]/20 pb-1 font-['IM_Fell_Great_Primer_SC'] text-xl text-[#4F3117]"
						>
							{category}
						</h3>
						{#each list as taskTitle}
							<button
								on:click={() => selectPremade(taskTitle, category)}
								class="rounded-lg border-2 border-[#ad8a6c] bg-[#fff8e1] px-3 py-2 text-left font-['Inter',sans-serif] text-sm text-[#4F3117] shadow-sm transition-colors hover:bg-[#4F3117] hover:text-[#fff8e1]"
							>
								{taskTitle}
							</button>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

{#if showDetailModal && selectedTask}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
		on:click={closeDetailModal}
		on:keydown={(e) => e.key === 'Escape' && closeDetailModal()}
		role="button"
		tabindex="0"
	>
		<div
			class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border-2 border-[#4F3117] bg-[#F8F3ED] p-6 shadow-2xl"
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			tabindex="-1"
		>
			<!-- header with close button -->
			<div class="mb-6 flex items-center justify-between">
				<h2 class="font-serif text-2xl text-[#4F3117] sm:text-3xl">{selectedTask.title}</h2>
				<button
					on:click={closeDetailModal}
					class="text-2xl font-bold text-[#4F3117] transition-colors hover:text-[#3E2612]"
					aria-label="Close"
				>
					×
				</button>
			</div>

			<!-- info of task -->
			<div class="mb-6 grid grid-cols-2 gap-4 text-sm sm:text-base">
				<div>
					<span class="font-semibold text-[#4F3117]">Priority:</span>
					<span
						class={selectedTask.priority === 'High'
							? 'ml-2 font-bold text-red-600'
							: selectedTask.priority === 'Medium'
								? 'ml-2 text-orange-600'
								: 'ml-2 text-green-600'}
					>
						{selectedTask.priority || 'Medium'}
					</span>
				</div>
				<div>
					<span class="font-semibold text-[#4F3117]">Category:</span>
					<span class="ml-2 text-[#4F3117]">{selectedTask.category || 'N/A'}</span>
				</div>
				<div>
					<span class="font-semibold text-[#4F3117]">End Date:</span>
					<span class="ml-2 text-[#4F3117]">{selectedTask.end || 'No date set'}</span>
				</div>
				<div>
					<span class="font-semibold text-[#4F3117]">Status:</span>
					<span class="ml-2 text-[#4F3117]">{selectedTask.status}</span>
				</div>
			</div>

			<!-- fied to add notes -->
			<div class="mb-6">
				<label for="notes" class="mb-2 block text-lg font-semibold text-[#4F3117]">Notes</label>
				<textarea
					id="notes"
					bind:value={selectedTask.notes}
					placeholder="Add your notes here..."
					class="min-h-[100px] w-full resize-y rounded-lg border-2 border-[#4F3117] bg-white p-3 text-[#4F3117] placeholder-[#A89078] focus:ring-2 focus:ring-[#4F3117] focus:outline-none"
				></textarea>
			</div>

			<!-- add suggestions -->
			<div class="mb-6">
				<label for="suggestions" class="mb-2 block text-lg font-semibold text-[#4F3117]"
					>Suggestions</label
				>
				<textarea
					id="suggestions"
					bind:value={selectedTask.suggestions}
					placeholder="Add suggestions or tips here..."
					class="min-h-[100px] w-full resize-y rounded-lg border-2 border-[#4F3117] bg-white p-3 text-[#4F3117] placeholder-[#A89078] focus:ring-2 focus:ring-[#4F3117] focus:outline-none"
				></textarea>
			</div>

			<!-- add subtasks/test version -->
			<div class="mb-6">
				<div class="mb-3 flex items-center justify-between">
					<h3 class="block text-lg font-semibold text-[#4F3117]">Subtasks</h3>
					<button
						on:click={addSubtask}
						class="rounded-lg bg-[#4F3117] px-3 py-1.5 text-sm text-white transition-colors hover:bg-[#3E2612]"
					>
						+ Add Subtask
					</button>
				</div>
				<div class="max-h-[200px] space-y-2 overflow-y-auto">
					{#if selectedTask.subtasks && selectedTask.subtasks.length > 0}
						{#each selectedTask.subtasks as subtask}
							<div
								class="flex items-center gap-2 rounded-lg border-2 border-[#4F3117] bg-white p-3"
							>
								<input
									type="checkbox"
									checked={subtask.completed}
									on:change={() => toggleSubtask(subtask.id)}
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
								<button
									on:click={() => removeSubtask(subtask.id)}
									class="text-lg font-bold text-red-600 transition-colors hover:text-red-800"
									aria-label="Remove subtask"
								>
									×
								</button>
							</div>
						{/each}
					{:else}
						<p class="text-sm text-gray-500 italic">
							No subtasks yet. Click "Add Subtask" to create one.
						</p>
					{/if}
				</div>
			</div>

			<div class="flex gap-3">
				<button
					on:click={saveTaskDetails}
					class="flex-1 rounded-lg bg-[#4F3117] py-2.5 font-medium text-white transition-colors hover:bg-[#3E2612]"
				>
					Save Changes
				</button>
				<button
					on:click={closeDetailModal}
					class="flex-1 rounded-lg bg-gray-300 py-2.5 font-medium text-[#4F3117] transition-colors hover:bg-gray-400"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}
