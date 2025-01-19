<script lang="ts">
	import { Plus, Pencil, Trash2, Ellipsis, Save } from 'lucide-svelte';
	import Tooltip from '$lib/components/tooltip.svelte';

	let {tm = $bindable()} = $props();
	let new_state_name: string = $state('');

	let remove_state = (state: string) => { tm.states.splice(tm.states.indexOf(state), 1); };
	let update_state = (old_state: string, new_state: string) => { tm.states[tm.states.indexOf(old_state)] = new_state; };
	let editing_state_idx: number = $state(-1);
	let editing_state_value: string = $state("");

    $inspect(tm.states);
</script>

<section class="flex flex-col border-r-4 px-3 gap-2">
    <h3 class="text-lg py-2 underline">TM States</h3>
    <ul class="list-disc list-inside">
        {#each tm.states as tm_state, state_idx}
            {#if state_idx != editing_state_idx}
                {#if tm_state == tm.states[tm.initial_state]}
                    <li class="border-r-2 px-1 border-blue-500 flex flex-row justify-between">
                        <Tooltip text="Initial state">{tm_state}</Tooltip>
                        <span class="flex flex-row gap-1">
                            <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => { editing_state_idx = state_idx; editing_state_value = tm_state; }}><Pencil size=16 /></button>
                            <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => remove_state(tm_state)}><Trash2 size=16 /></button>
                        </span>
                    </li>
                {:else if tm_state == tm.states[tm.accept_state]}
                    <li class="border-r-2 px-1 border-green-500 flex flex-row justify-between">
                        <Tooltip text="Accept state">{tm_state}</Tooltip>
                        <span class="flex flex-row gap-1">
                            <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => { editing_state_idx = state_idx; editing_state_value = tm_state; }}><Pencil size=16 /></button>
                            <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => remove_state(tm_state)}><Trash2 size=16 /></button>
                        </span>
                    </li>
                {:else if tm_state == tm.states[tm.reject_state]}
                    <li class="border-r-2 px-1 border-red-500 flex flex-row justify-between">
                        <Tooltip text="Reject state">{tm_state}</Tooltip>
                        <span class="flex flex-row gap-1">
                            <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => { editing_state_idx = state_idx; editing_state_value = tm_state; }}><Pencil size=16 /></button>
                            <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => remove_state(tm_state)}><Trash2 size=16 /></button>
                        </span>
                    </li>
                {:else}
                    <li class="border-r-2 px-1 border-white flex flex-row justify-between">
                        {tm_state}
                        <span class="flex flex-row gap-1">
                            <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1"><Ellipsis size=16 /></button> <!-- Change to start, accept or reject state -->
                            <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => { editing_state_idx = state_idx; editing_state_value = tm_state; }}><Pencil size=16 /></button>
                            <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => remove_state(tm_state)}><Trash2 size=16 /></button>
                        </span>
                    </li>
                {/if}
            {:else}
                <li class="border-r-2 px-1 border-white flex flex-row justify-between gap-1">
                    <input class="border-2 px-2 rounded-md border-stone-500 w-40" type="text" bind:value={editing_state_value}>
                    <span class="flex flex-row gap-1">
                        <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => { update_state(tm_state, editing_state_value); editing_state_idx = -1; }}><Save size=16 /></button>
                    </span>
                </li>
            {/if}
        {/each}
    </ul>

    <input bind:value={new_state_name} type="text" class="border-2 px-2 rounded-md border-stone-500">
    <button class="
        px-2 py-1 border-x-2 rounded-md border-stone-500
        flex flex-row items-center justify-center gap-2
        hover:border-stone-800
        active:border-black active:bg-stone-100
        "
        onclick={() => {
            tm.states.push(new_state_name)
            new_state_name = ''
        }}
    ><Plus /> State</button>
</section>