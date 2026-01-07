<script>
	import { goto } from '$app/navigation';
	import { openModal } from '../../modalStore.js';

	let { showModal = $bindable(), onReset } = $props();

	/**
	 * @type {HTMLDialogElement}
	 */
	let dialog;

	let minutes = $state(5);
	let isMinExceeded = $state(false);

	$effect(() => {
		if (showModal) dialog?.showModal();
	});

	function close() {
		showModal = false;
		isMinExceeded = false;
		dialog?.close();
	}

	function startBreak() {
		if (minutes > 120) {
			isMinExceeded = true;
			return;
		}

		close();
		goto(`/break-timer?minutes=${minutes}`);
	}

	function skipToHome() {
		close();
		goto('/home');
	}

	function handleReset() {
		close();
		if (onReset) onReset();
	}
</script>

<dialog
	bind:this={dialog}
	onclose={close}
	onclick={(e) => {
		if (e.target === dialog) close();
	}}
	class="
        fixed top-1/2 left-1/2 w-[400px] max-w-[90vw]
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
		<h2 class="text-2xl tracking-wide">Take a Break?</h2>

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

	<div class="flex flex-col items-center space-y-4 p-6">
		<p class="text-center text-xl text-[#4F3117]">How long is your rest?</p>

		<div class="relative w-full">
			<input
				type="number"
				min="1"
				max="60"
				bind:value={minutes}
				class="w-full rounded-lg border-2 border-[#ad8a6c] bg-white/50 p-3 text-center text-2xl text-[#4F3117]"
			/>
			<span class="absolute top-1/2 right-4 -translate-y-1/2 text-[#4F3117] opacity-60">min</span>
		</div>

		{#if isMinExceeded}
			<p class="text-center text-sm text-red-700 italic">
				Even heroes must return! (Max 60 minutes)
			</p>
		{/if}

	<div class="flex w-full flex-col gap-2">
            <div class="flex w-full gap-3">
                <button
                    onclick={startBreak}
                    class="flex-1 cursor-pointer rounded-lg border-2 border-[#ad8a6c] bg-[#fff8e1] px-2 py-3 text-lg text-[#4F3117] transition-all duration-200 hover:scale-[1.02] hover:bg-[#f1e0c5]"
                >
                    Begin Rest
                </button>

                <button
                    onclick={skipToHome}
                    class="flex-1 cursor-pointer rounded-lg border-2 border-[#ad8a6c] bg-[#fff8e1] px-2 py-3 text-lg text-[#4F3117] transition-all duration-200 hover:scale-[1.02] hover:bg-[#f1e0c5]"
                >
                    No, Thanks.
                </button>
            </div>

            <button
                onclick={handleReset}
                class="w-full cursor-pointer rounded-lg border-2 border-[#ad8a6c] bg-[#fff8e1] px-2 py-3 text-lg text-[#4F3117] transition-all duration-200 hover:scale-[1.01] hover:bg-[#f1e0c5]"
            >
                Reset Timer
            </button>
        </div>
	</div>
</dialog>
