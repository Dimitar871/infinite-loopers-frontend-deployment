<script>
    let { 
        showModal = $bindable(), 
        minutes = $bindable(), 
        title = "Edit Duration", 
        label = "Set time:",
        max = 120,
        onSave 
    } = $props();

    let dialog;
    let tempMinutes = $state(minutes);

    $effect(() => {
        if (showModal) {
            tempMinutes = minutes;
            if (!dialog?.open) dialog?.showModal();
        } else if (dialog?.open) {
            dialog.close();
        }
    });

    const close = () => (showModal = false);

    function handleSave() {
        if (tempMinutes < 1) return;
        if (tempMinutes > max) tempMinutes = max;
        onSave(tempMinutes);
        close();
    }
</script>

<dialog
    bind:this={dialog}
    onclose={close}
    onclick={(e) => e.target === dialog && close()}
    class="fixed top-1/2 left-1/2 w-[400px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border-[6px] border-double border-[#ad8a6c] bg-[#fdf3e7] p-0 font-['IM_Fell_Great_Primer_SC'] shadow-[0_0_20px_rgba(0,0,0,0.5)]"
>
    <div class="flex items-center justify-between border-b-2 border-[#ad8a6c] px-6 py-4 text-[#4F3117]">
        <h2 class="text-2xl tracking-wide">{title}</h2>
        <button onclick={close} class="cursor-pointer border-none bg-transparent text-xl hover:rotate-12 transition-transform">✖</button>
    </div>

    <div class="flex flex-col items-center space-y-4 p-6">
        <p class="text-center text-xl text-[#4F3117]">{label}</p>
        <div class="relative w-full">
            <input type="number" min="1" {max} bind:value={tempMinutes}
                class="w-full rounded-lg border-2 border-[#ad8a6c] bg-white/50 p-3 text-center text-2xl text-[#4F3117] focus:outline-none" />
            <span class="absolute top-1/2 right-4 -translate-y-1/2 text-[#4F3117] opacity-60">min</span>
        </div>
        <div class="flex w-full gap-3 pt-2">
            <button onclick={handleSave} class="flex-1 rounded-lg border-2 border-[#ad8a6c] bg-[#fff8e1] py-3 text-lg text-[#4F3117] hover:bg-[#f1e0c5] transition-all">Update</button>
            <button onclick={close} class="flex-1 rounded-lg border-2 border-[#ad8a6c] bg-[#fff8e1] py-3 text-lg text-[#4F3117] hover:bg-[#f1e0c5] transition-all">Cancel</button>
        </div>
    </div>
</dialog>

<style>
    dialog::backdrop { background: rgba(0, 0, 0, 0.5); }
</style>