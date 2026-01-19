<script>
    import { openModal } from '../../modalStore.js';
    import background from '$lib/assets/wardrobe-background.png';
	import sign from '$lib/assets/sign.png';
    let { data } = $props();
    const userId = data.user.id;
    let currentCharacter = $state(data.user.currentCharacterId);
    let activeCharacter = $derived(data.characters.find(c => c.id === currentCharacter) || data.characters[0]);
    
/**
 * Set a character as current 
 * @param {number} characterId
 */
async function equipCharacter(characterId) {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/users/${userId}/characters/current`,
            {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ characterId })
            }
        );

        const result = await res.json();

        if (res.ok && result.message) {
            currentCharacter = characterId;
            openModal(result.message, 'success');
        } else {
            openModal(result.message, 'error');
        }
    } catch (error) {
        openModal('Error occurred while equipping the character.', 'error');
    }
}
</script>

<section class="relative h-[530px] w-full bg-center" style="background-image: url({background});">
    <div class="absolute inset-0 bg-black/30"></div>
    
    <div class="absolute top-8 left-1/2 -translate-x-1/2 z-10 bg-no-repeat bg-contain bg-center 
            w-60 h-40 sm:h-50 
            flex flex-col items-center justify-center text-[#4F3117] font-['IM_Fell_Great_Primer_SC']" 
         style="background-image: url({sign});">
        <h1 class="text-3xl mb-5">Wardrobe</h1>
        
        <div class="absolute top-52 sm:top-56 left-1/2 -translate-x-1/2 w-40 h-40 sm:w-56 sm:h-56 bg-[#4F3117] rounded-full blur-2xl z-0 border border-[#4F3117]">
        </div>
        
        <img src={activeCharacter.imageUrl} alt={activeCharacter.name} class="absolute top-50 left-1/2 -translate-x-1/2 w-50 h-40 sm:w-40 sm:h-60 object-contain z-10 drop-shadow-lg"/>
    </div>
</section>

<div class="bg-[#F8F3ED] pt-10 pb-2 px-8 font-['IM_Fell_Great_Primer_SC']">
    <h2 class="text-3xl text-[#4F3117] border-b-2 border-[#4F3117]/20 pb-2">
        Your Characters
    </h2>
</div>

<section class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 p-8 bg-[#F8F3ED] font-['IM_Fell_Great_Primer_SC'] min-h-screen items-start auto-rows-max">
    {#each data.characters as character}
        <article class="bg-[#fbf5ec] border-4 border-[#4f311747] rounded-md flex flex-col p-6 text-center">
            <div class="flex justify-center mb-6">
                <img src={character.imageUrl} alt={character.name} class="w-32 h-32 object-contain p-2 rounded-lg bg-white border border-[#e0d3c4]"/>
            </div>
            
            <div class="flex flex-col items-center mb-4">
                <h2 class="text-xl text-[#4F3117] mb-1">
                    {character.name}
                </h2>
            </div>

            <button class="bg-[#4F3117] text-lg cursor-pointer text-[#EEE9E1] hover:bg-[#3E2612] px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-default"
                onclick={() => equipCharacter(character.id)}
                disabled={currentCharacter === character.id}>
                {currentCharacter === character.id ? 'Equipped' : 'Equip'}
            </button>
        </article>
    {/each}
</section>
