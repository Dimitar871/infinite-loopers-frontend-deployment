<script>
    import { page } from '$app/stores';
    import { onDestroy, onMount } from 'svelte';
    import { goto } from '$app/navigation';

    // Assets
    import breakBackground from '$lib/assets/break-timer/break-background-1.png'; 
    import timerScroll from '$lib/assets/work-timer/timer-scroll.png';
    import startTimer from '$lib/assets/work-timer/start-timer.png';
    import breakScroll from '$lib/assets/break-timer/break-scroll.png';

    import EditSession from '$lib/components/EditSession.svelte';

    let minutes = $state(5);
    let secondsLeft = $state(0);
    let initialSeconds = $state(0);
    let running = $state(false);
    let initialized = $state(false);
    let timer = null;
    let showEditModal = $state(false);

    const display = $derived(
        `${Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`
    );

    $effect(() => {
        if (!initialized) {
            const m = Number($page.url.searchParams.get('minutes')) || 5;
            minutes = m;
            initialSeconds = m * 60;
            secondsLeft = initialSeconds;
            initialized = true;
            start(); 
        }
    });

    function start() {
        if (timer) return;
        running = true;
        timer = setInterval(() => {
            if (secondsLeft <= 0) {
                finishBreak();
            } else {
                secondsLeft--;
            }
        }, 1000);
    }

    function pause() {
        running = false;
        if (timer) clearInterval(timer);
        timer = null;
    }

    function resetTimer() {
        pause();
        secondsLeft = initialSeconds;
    }

    	function openEditModal() {
		if (running) return;
		showEditModal = true;
	}

    function editSession(newMinutes) {
            minutes = Number(newMinutes);
            initialSeconds = minutes * 60;
            secondsLeft = initialSeconds;
    }

    function finishBreak() {
        pause();
        goto('/home'); 
    }

    onDestroy(() => {
        if (timer) clearInterval(timer);
    });
</script>

<div class="flex flex-col items-center min-h-screen bg-[#fdf3e7] pb-20">
    <section
        class="relative grid w-full place-items-center border-b-2 border-[#4F3117]"
        style={`background-image: url(${breakBackground}); background-size: cover; background-position: center;`}
    >
        <div class="relative aspect-square w-full max-w-[700px] overflow-hidden">
            <div class="absolute top-4 left-1/2 z-20 -translate-x-1/2 sm:top-6">
                <div
                    class="relative flex h-[110px] w-[220px] items-center justify-center sm:h-[140px] sm:w-[280px] lg:h-[170px] lg:w-[340px]"
                    style={`background-image: url(${timerScroll}); background-size: contain; background-repeat: no-repeat; background-position: center;`}
                >
                    <span class="relative -translate-y-2 font-['IM_Fell_Great_Primer_SC'] text-xl tracking-wide text-[#4F3117] sm:-translate-y-2.5 sm:text-2xl lg:-translate-y-3 lg:text-3xl">
                        {display}
                    </span>
                </div>
            </div>
        </div>
    </section>

    <div class="mt-6 flex flex-col items-center gap-0 sm:mt-8">
        <button
            onclick={() => running ? pause() : start()}
            class="flex h-[100px] w-[200px] cursor-pointer items-center justify-center font-['IM_Fell_Great_Primer_SC'] text-2xl text-[#5a3e1b] transition-all duration-150 hover:scale-105 hover:text-[#B69476] sm:h-[130px] sm:w-[260px] sm:text-3xl md:h-[150px] md:w-[300px] md:text-4xl"
            style={`background-image: url(${startTimer}); background-size: contain; background-position: center; background-repeat: no-repeat;`}
        >
            {running ? 'Stop Rest' : 'Resume'}
        </button>

        <div class="-mt-4 flex flex-wrap justify-center gap-3 sm:-mt-6">
            <button
                onclick={openEditModal}
                disabled={running}
                class="flex h-[70px] w-[140px] cursor-pointer items-center justify-center font-['IM_Fell_Great_Primer_SC'] text-lg text-[#5a3e1b] transition-all hover:scale-105 hover:text-[#B69476] disabled:cursor-not-allowed disabled:opacity-50 sm:h-20 sm:w-40 sm:text-xl"
                style={`background-image: url(${startTimer}); background-size: contain; background-position: center; background-repeat: no-repeat;`}
            >
                Edit Rest
            </button>

            <button
                onclick={resetTimer}
                class="flex h-[70px] w-[140px] cursor-pointer items-center justify-center font-['IM_Fell_Great_Primer_SC'] text-lg text-[#5a3e1b] transition-all hover:scale-105 hover:text-[#B69476] sm:h-20 sm:w-40 sm:text-xl"
                style={`background-image: url(${startTimer}); background-size: contain; background-position: center; background-repeat: no-repeat;`}
            >
                Reset Timer
            </button>
        </div>
        
        <button
            onclick={finishBreak}
            class="mt-6 font-['IM_Fell_Great_Primer_SC'] text-lg text-[#4F3117] underline decoration-[#ad8a6c] underline-offset-4 hover:text-[#ad8a6c]"
        >
            Skip Rest and Return to Home
        </button>
    </div>

    <section 
        class="relative mt-12 flex w-full max-w-[650px] flex-col items-center px-10 py-16 font-['IM_Fell_Great_Primer_SC']"
        style={`background-image: url(${breakScroll}); background-size: 100% 100%; background-repeat: no-repeat;`}
    >
        <div class="relative text-center">
            <span class="absolute -left-12 -top-4 text-3xl animate-star">⭐</span>
            <span class="absolute -left-6 bottom-0 text-xl animate-star opacity-70" style="animation-delay: 0.5s">⭐</span>
            <span class="absolute -right-12 top-0 text-3xl animate-star" style="animation-delay: 0.2s">⭐</span>
            <span class="absolute -right-6 bottom-8 text-xl animate-star opacity-70" style="animation-delay: 0.7s">⭐</span>

            <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-[#4F3117]">
                Stand up and drink some water!
            </h2>
        </div>
    </section>
</div>

<style>
    @keyframes star-pulse {
        0%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 5px gold); }
        50% { transform: scale(1.2); opacity: 0.7; filter: drop-shadow(0 0 10px yellow); }
    }
    .animate-star {
        display: inline-block;
        animation: star-pulse 2.5s infinite ease-in-out;
        color: #FFD700;
    }
</style>

<EditSession
	bind:showModal={showEditModal}
	bind:minutes={minutes}
	title="Edit Break Length"
	label="How many minutes shall the break last?"
	max={60}
	onSave={editSession}
/>