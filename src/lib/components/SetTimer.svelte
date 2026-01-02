<script>
	import { goto } from '$app/navigation';

	let { showModal = $bindable(), selectedTask } = $props();

	/**
	 * @type {HTMLDialogElement}
	 */
	let dialog;

	let minutes = 25;

	$effect(() => {
		if (showModal) dialog?.showModal();
	});

	function close() {
		showModal = false;
		dialog.close();
	}

	function startTimer() {
		close();

		goto(`/work-timer?minutes=${minutes}`);
	}
</script>

<dialog
	bind:this={dialog}
	onclose={close}
	onclick={(e) => {
		if (e.target === dialog) close();
	}}
	class="
        fixed top-1/2 left-1/2 w-[520px] max-w-[90vw]
        -translate-x-1/2 -translate-y-1/2
        rounded-xl
        border-[6px] border-double border-[#ad8a6c]
        bg-[#fdf3e7]
        p-0
        font-['IM_Fell_Great_Primer_SC']
        shadow-[0_0_20px_rgba(0,0,0,0.5)]
    "
>
	<div
		class="
            flex items-center justify-between
            border-b-2
            border-[#ad8a6c] px-6
            py-4 text-[#4F3117]
        "
	>
		<h2 class="text-2xl">
			Set Timer for: {selectedTask.title}
		</h2>

		<button
			onclick={close}
			aria-label="Close"
			class="
                cursor-pointer border-none
                bg-transparent text-xl
                text-[#4F3117]
                transition-transform duration-200
                hover:rotate-12
            "
		>
			✖
		</button>
	</div>

	<div class="space-y-4 p-6">
		<p class="text-[#4F3117]">Configure your timer here:</p>
		<input
			type="number"
			min="1"
			bind:value={minutes}
			placeholder="Minutes"
			class="w-full rounded-lg border-2 border-[#ad8a6c] p-3 text-lg"
		/>

		<button
			onclick={startTimer}
			class="
                cursor-pointer rounded-lg border-2
                border-[#ad8a6c] bg-[#fff8e1] px-4 py-2
                text-lg
                transition-all duration-200 ease-in-out
                hover:scale-[1.03] hover:bg-[#f1e0c5]
            "
		>
			Start Timer
		</button>
	</div>
</dialog>
