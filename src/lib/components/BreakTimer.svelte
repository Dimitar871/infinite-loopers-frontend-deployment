<script>
    import { goto } from '$app/navigation';
    import { openModal } from '../../modalStore.js';

    let { showModal = $bindable() } = $props();

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
        <h2 class="text-2xl tracking-wide">Take a Break</h2>

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

    <div class="space-y-4 p-6 flex flex-col items-center">
        <p class="text-[#4F3117] text-xl text-center">How long is your rest?</p>
        
        <div class="relative w-full">
            <input
                type="number"
                min="1"
                max="60"
                bind:value={minutes}
                class="w-full rounded-lg border-2 border-[#ad8a6c] bg-white/50 p-3 text-center text-2xl text-[#4F3117]"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[#4F3117] opacity-60">min</span>
        </div>

        {#if isMinExceeded}
            <p class="text-red-700 text-sm italic text-center">Even heroes must return! (Max 60 minutes)</p>
        {/if}

        <button
            onclick={startBreak}
            class="
                mt-2 w-full
                cursor-pointer rounded-lg border-2
                border-[#ad8a6c] bg-[#fff8e1] px-4 py-3
                text-xl font-bold text-[#4F3117]
                transition-all duration-200 ease-in-out
                hover:scale-[1.02] hover:bg-[#f1e0c5]
                active:scale-[0.98]
            "
        >
            Begin Rest
        </button>
    </div>
</dialog>