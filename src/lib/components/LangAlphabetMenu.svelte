<script lang="ts">
    import { getContext } from "svelte";

    import { Plus, PencilSimple, TrashSimple, EyeClosed, Eye, Check, X } from "phosphor-svelte";
    import { Separator } from "bits-ui";

    import TuringMachine from "$lib/tm-engine/tm-machine.svelte";

    let current_turing_machine: TuringMachine = getContext("current_turing_machine");

    let show_alphabet = $state(true);

    let editing_symbol_idx = $state(-1);
    let editing_symbol_value = $state("");
</script>

<div>
    <div class="w-full flex justify-between items-center">
        <h2 class="text-2xl">Lang Alphabet</h2>

        <span class="flex justify-evenly items-center gap-[1px]">
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => { 
                current_turing_machine.machine.add_lang_symbol("new_lang_symbol");
                editing_symbol_idx = current_turing_machine.machine.lang_alphabet.length - 1;
                editing_symbol_value = "new_lang_symbol";
            }}><Plus size={20}/></button>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => show_alphabet = !show_alphabet}>
                {#if show_alphabet}
                    <Eye size={20}/>
                {:else}
                    <EyeClosed size={20}/>
                {/if}
            </button>
        </span>
    </div>

    <Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />

    {#if show_alphabet}
        <ul class="space-y-[1px] max-h-[200px] overflow-y-auto">
            {#each current_turing_machine.machine.lang_alphabet as symbol, idx}
                <li class="flex justify-between items-center">
                    {#if editing_symbol_idx != idx}
                        <p>* {symbol}</p>
                        <span class="flex justify-evenly items-center gap-[1px] pr-1">
                            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                editing_symbol_idx = idx;
                                editing_symbol_value = symbol;
                            }}><PencilSimple size={16}/></button>
                            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                current_turing_machine.machine.remove_lang_symbol(idx);
                            }}><TrashSimple size={16}/></button>
                        </span>
                    {:else}
                        <span>* <input class="border-[1px] border-black" type="text" bind:value={editing_symbol_value} autofocus/></span>
                        <span class="flex justify-evenly items-center gap-[1px] pr-1">
                            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                current_turing_machine.machine.edit_lang_symbol(idx, editing_symbol_value); 
                                editing_symbol_value = "";
                                editing_symbol_idx = -1; 
                            }}><Check size={16}/></button>
                            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                editing_symbol_value = ""; 
                                editing_symbol_idx = -1;
                            }}><X size={16}/></button>
                        </span>
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</div>