<script lang="ts">
    import { getContext } from "svelte";

    import { Plus, PencilSimple, TrashSimple, EyeClosed, Eye, Check, X } from "phosphor-svelte";
    import { Separator, Tooltip } from "bits-ui";
	import RecursiveTextMenu from "./RecursiveTextMenu.svelte";

	import type TMFile from "$lib/tm-engine/tm-file.svelte";

    let current_turing_machine: TMFile = getContext("current_turing_machine");

    let show_states = $state(true);

    let modify_state_type = $state(-1);

    let editing_state_idx = $state(-1);
    let editing_state_value = $state("");

    function modify_state_values(idx: number) {
        const result = [
            // { text: "Edit state name", onclick: () => { modify_state_type = -1; }, subelements: [] },
            // { text: "Delete state" , onclick: () => { modify_state_type = -1; }, subelements: [] },
        ];

        if (idx != current_turing_machine.machine.initial_state)
            result.push({ text: "Make initial state", onclick: () => { current_turing_machine.machine.initial_state = idx; modify_state_type = -1; }, subelements: [] });
        if (idx != current_turing_machine.machine.accept_state)
            result.push({ text: "Make accept state", onclick: () => { current_turing_machine.machine.accept_state = idx; modify_state_type = -1; }, subelements: [] });
        if (idx != current_turing_machine.machine.reject_state)
            result.push({ text: "Make reject state", onclick: () => { current_turing_machine.machine.reject_state = idx; modify_state_type = -1; }, subelements: [] });

        return result;
    }
</script>


<div>
    <div class="w-full flex justify-between items-center">
        <h2 class="text-2xl">States</h2>

        <span class="flex justify-evenly items-center gap-[1px]">
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                current_turing_machine.machine.add_state("new_state");
                current_turing_machine.diagram.push({ x: 0, y: 0 });
            }}><Plus size={20}/></button>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => show_states = !show_states}>
                {#if show_states}
                    <Eye size={20}/>
                {:else}
                    <EyeClosed size={20}/>
                {/if}
            </button>
        </span>
    </div>

    <Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />

    {#if show_states}
        <ul class="space-y-[1px] max-h-[200px] overflow-y-auto">
            {#each current_turing_machine.machine.states as state, idx}
                <li class="flex justify-between items-center">
                    {#if editing_state_idx != idx}
                        <p>* {state}</p>
                        <span class="flex justify-evenly items-center gap-[1px] pr-1">
                        	<Tooltip.Provider><Tooltip.Root>

	                            <Tooltip.Trigger delayDuration={200}><button class="border-[1px] w-[26px] h-[26px] p-1 border-black hover:bg-zinc-100 flex items-center justify-center" onclick={() => {
	                                if (modify_state_type == idx)
	                                    modify_state_type = -1;
	                                else
	                                    modify_state_type = idx;
	                            }}>
	                                {#if idx == current_turing_machine.machine.initial_state}
	                                    <div class="w-full h-full bg-blue-500"></div>
	                                {/if}
	                                {#if idx == current_turing_machine.machine.accept_state}
	                                    <div class="w-full h-full bg-green-500"></div>
	                                {/if}
	                                {#if idx == current_turing_machine.machine.reject_state}
	                                    <div class="w-full h-full bg-red-500"></div>
	                                {/if}
	                                {#if idx != current_turing_machine.machine.initial_state && idx != current_turing_machine.machine.accept_state && idx != current_turing_machine.machine.reject_state}
	                                    >
	                                {/if}
	                            </button></Tooltip.Trigger>
								<Tooltip.Content><div class="p-1 w-fit flex flex-col justify-start items-center bg-white border-black border-[1px]">
							        {#if idx == current_turing_machine.machine.initial_state}
										<p>Initial State</p>
							        {/if}
							        {#if idx == current_turing_machine.machine.accept_state}
										<p>Accept State</p>
							        {/if}
							        {#if idx == current_turing_machine.machine.reject_state}
										<p>Reject State</p>
							        {/if}
								</div></Tooltip.Content>
							</Tooltip.Root></Tooltip.Provider>
                            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                editing_state_idx = idx;
                                editing_state_value = state;
                            }}><PencilSimple size={16}/></button>
                            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                current_turing_machine.machine.remove_state(idx)
                                current_turing_machine.diagram.splice(idx, 1);
                            }}><TrashSimple size={16}/></button>
                        </span>
                    {:else}
                        <span>* <input class="border-[1px] border-black w-4/5" type="text" bind:value={editing_state_value} autofocus/></span>
                        <span class="flex justify-evenly items-center gap-[1px] pr-1">
                            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                current_turing_machine.machine.edit_state(idx, editing_state_value);
                                editing_state_value = "";
                                editing_state_idx = -1;
                            }}><Check size={16}/></button>
                            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                                editing_state_value = "";
                                editing_state_idx = -1;
                            }}><X size={16}/></button>
                        </span>
                    {/if}
                </li>
                {#if modify_state_type == idx}
                    <div class="pl-3">
                        <RecursiveTextMenu values={modify_state_values(idx)} />
                    </div>
                {/if}
            {/each}
        </ul>
    {/if}
</div>
