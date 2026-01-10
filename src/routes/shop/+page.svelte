<script>
    import { openModal } from '../../modalStore.js';
	import background from '$lib/assets/shop/shop-background.png';
	import sign from '$lib/assets/sign.png';
    let { data } = $props();
    let coins = $state(data.user.coins);
    const userId = data.user.id;
    let ownedCharacterIds = $state(data.ownedCharacters.map(ch => ch.id));
    let ownedDecorationIds = $state(data.ownedDecorations.map(deco => deco.id));
    let activeSection = $state('characters');

    /**
     * Purchase a character from the shop
     * @param {number} characterId
     */
    async function buyCharacter(characterId) {
        try {
            const res = await fetch(`http://localhost:3011/users/${userId}/characters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ characterId })
            });

            const result = await res.json();

            if (res.ok && result.message) {
                coins = result.newCoins;
                ownedCharacterIds = [...ownedCharacterIds, characterId];
                openModal(result.message, 'success');
            } else {
                openModal(result.message, 'error');
            }
        } catch (error) {
            openModal('Error occurred while purchasing the character.', 'error');
        }
    }

    /**
     * Purchase a decoration for the room
     * @param {number} decorationId
     */
    async function buyDecoration(decorationId) {
        try {
            const res = await fetch(`http://localhost:3011/users/${userId}/decorations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decorationId })
            });

            const result = await res.json();

            if (res.ok && result.message) {
                coins = result.newCoins;
                ownedDecorationIds = [...ownedDecorationIds, decorationId];
                openModal(result.message, 'success');
            } else {
                openModal(result.message, 'error');
            }
        } catch (error) {
            openModal('Error occurred while purchasing the decoration.', 'error');
        }
    }
</script>

<section class="relative h-[530px] w-full bg-center bg-cover" style="background-image: url({background});">
    <div class="absolute inset-0 bg-black/30"></div>
    
    <div class="absolute top-8 left-1/2 -translate-x-1/2 z-10 bg-no-repeat bg-contain bg-center 
            w-60 h-32 sm:h-50 
            flex flex-col items-center justify-center text-[#4F3117] font-['IM_Fell_Great_Primer_SC']" 
         style="background-image: url({sign});">
        <h1 class="text-3xl mb-5">Shop</h1>
        
        <div class="absolute top-52 sm:top-56 left-1/2 -translate-x-1/2 w-40 h-40 sm:w-56 sm:h-56 bg-[#4F3117] rounded-full blur-2xl z-0 border border-[#4F3117]">
        </div>
        
        <img src={data.character.imageUrl} alt={data.character.name} class="absolute top-50 left-1/2 -translate-x-1/2 w-50 h-40 sm:w-40 sm:h-60 object-contain z-10 drop-shadow-lg"/>
    </div>
</section>

<div class="flex flex-wrap items-center justify-between pt-8 pb-8 px-6 bg-[#F8F3ED] font-['IM_Fell_Great_Primer_SC'] gap-4">
    <div class="flex gap-5">
        <button 
            class="px-6 py-2 rounded-lg text-lg transition-colors border-3 border-solid border-[#4F3117]
            {activeSection === 'characters' ? 'bg-[#4F3117] text-[#EEE9E1]' : 'bg-[#E3D3BF] text-[#4F3117] hover:bg-[#bba890c0]'}"
            onclick={() => activeSection = 'characters'}>
            Characters
        </button>
        <button 
            class="px-6 py-2 rounded-lg text-lg transition-colors border-3 border-solid border-[#4F3117]
            {activeSection === 'decorations' ? 'bg-[#4F3117] text-[#EEE9E1]' : 'bg-[#E3D3BF] text-[#4F3117] hover:bg-[#bba890c0]'}"
            onclick={() => activeSection = 'decorations'}>
            Decorations
        </button>
    </div>

    <div class="ml-auto flex items-center bg-[#fbf5ec] border-2 border-[#4f311747] px-4 py-2 rounded-lg shadow-sm">
        <span class="text-[#4F3117] text-xl">
            Wallet: <span class="font-bold text-2xl">{coins}</span> Coins
        </span>
    </div>
</div>

<div class="bg-[#F8F3ED] px-5 pb-5 min-h-screen font-['IM_Fell_Great_Primer_SC']">
    <section class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start auto-rows-max">
        {#if activeSection === 'characters'}
            {#each data.characters as character}
                <article class="bg-[#fbf5ec] border-4 border-[#4f311747] rounded-md flex flex-col p-6 text-center hover:shadow-md transition-shadow">
                    <div class="flex justify-center mb-6">
                        <img src={character.imageUrl} alt={character.name} class="w-32 h-32 object-contain p-2 rounded-lg bg-white border border-[#e0d3c4]" />
                    </div>
                    
                    <div class="flex flex-col grow mb-6 items-center">
                        <h2 class="text-xl text-[#4F3117] mb-1">{character.name}</h2>
                        <p class="text-xl text-[#4F3117]">Price: {character.price} coins</p>
                    </div>

                    <button 
                        class="bg-[#4F3117] text-lg cursor-pointer text-[#EEE9E1] hover:bg-[#3E2612] px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-default active:scale-95 transition-transform"
                        onclick={() => buyCharacter(character.id)}
                        disabled={ownedCharacterIds.includes(character.id)}>
                        {ownedCharacterIds.includes(character.id) ? 'Owned' : 'Buy'}
                    </button>
                </article>
            {/each}
        {:else if activeSection === 'decorations'}
            {#each data.decorations as decoration}
                <article class="bg-[#fbf5ec] border-4 border-[#4f311747] rounded-md flex flex-col p-6 text-center hover:shadow-md transition-shadow">
                    <div class="flex justify-center mb-6">
                        <img src={decoration.imageUrl} alt={decoration.name} class="w-32 h-32 object-contain p-2 rounded-lg bg-white border border-[#e0d3c4]" />
                    </div>
                    
                    <div class="flex flex-col grow mb-6 items-center">
                        <h2 class="text-xl text-[#4F3117] mb-1">{decoration.name}</h2>
                        <p class="text-xl text-[#4F3117]">Price: {decoration.price} coins</p>
                    </div>

                    <button 
                        class="bg-[#4F3117] text-lg cursor-pointer text-[#EEE9E1] hover:bg-[#3E2612] px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-default active:scale-95 transition-transform"
                        onclick={() => buyDecoration(decoration.id)}
                        disabled={ownedDecorationIds?.includes(decoration.id)}>
                        {ownedDecorationIds?.includes(decoration.id) ? 'Owned' : 'Buy'}
                    </button>
                </article>
            {/each}
        {/if}
    </section>
</div>