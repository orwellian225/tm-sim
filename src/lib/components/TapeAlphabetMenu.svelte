<script lang="ts">
    import { getContext } from "svelte";

    import { Plus, PencilSimple, TrashSimple, EyeClosed, Eye, Check, X } from "phosphor-svelte";
    import { Separator, Tooltip } from "bits-ui";

	import type TMFile from "$lib/tm-engine/tm-file.svelte";

    let current_turing_machine: TMFile = getContext("current_turing_machine");

    let show_alphabet = $state(true);

    let editing_symbol_idx = $state(-1);
    let editing_symbol_value = $state("");
</script>

<div>
    <div class="w-full flex justify-between items-center">
        <h2 class="text-2xl">Tape Alphabet</h2>

        <span class="flex justify-evenly items-center gap-[1px]">
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                current_turing_machine.add_tape_symbol("t");
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
            {#each current_turing_machine.machine.tape_alphabet as symbol, idx}
                <li class="flex justify-between items-center">
                    {#if editing_symbol_idx != idx}
                        {#if idx != 0}
                            <p>* {symbol}</p>
                            <span class="flex justify-evenly items-center gap-[1px] pr-1">
                                <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                    editing_symbol_idx = idx;
                                    editing_symbol_value = symbol;
                                }}><PencilSimple size={16}/></button>
                                <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                    current_turing_machine.remove_tape_symbol(idx);
                                }}><TrashSimple size={16}/></button>
                            </span>
                        {:else}
                            <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger class="w-full flex justify-between items-center">
                                    <p>* {symbol}</p>
                                    <span class="flex justify-evenly items-center gap-[1px] pr-1">
                                        <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                            editing_symbol_idx = idx;
                                            editing_symbol_value = symbol;
                                        }}><PencilSimple size={16}/></button>
                                    </span>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                <div class="p-1 w-fit flex flex-col justify-start items-center bg-white border-black border-[1px]">
                                    <p>Blank Symbol - cannot be removed</p>
								</div>
                                </Tooltip.Content>
                            </Tooltip.Root>
                            </Tooltip.Provider>
                        {/if}
                    {:else}
                        <span>* <input class="border-[1px] border-black w-4/5" type="text" bind:value={editing_symbol_value} autofocus/></span>
                        <span class="flex justify-evenly items-center gap-[1px] pr-1">
                            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                current_turing_machine.edit_tape_symbol(idx, editing_symbol_value);
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
