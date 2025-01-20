<script lang="ts">
	import { Plus, Pencil, Trash2, Ellipsis, Save } from 'lucide-svelte';
    import { DropdownMenu } from 'bits-ui';

	let {tm = $bindable()} = $props();
	let new_state_name: string = $state('');

	let editing_state_idx: number = $state(-1);
	let editing_state_value: string = $state("");
</script>

<section class="flex flex-col border-r-4 px-3 gap-2 w-64">
    <h3 class="text-lg py-2 underline">TM States</h3>
    <ul class="list-disc list-inside max-h-96 overflow-y-auto">
        {#each tm.states as tm_state, state_idx}
            {#if state_idx != editing_state_idx}
                <li class="border-r-2 px-1 flex flex-row justify-between">
                    {tm_state}
                    <span class="flex flex-row gap-1 items-center">
                        {#if state_idx == tm.initial_state}
                            <div class="w-1 h-5 bg-blue-500"></div>
                        {/if}
                        {#if state_idx == tm.accept_state}
                            <div class="w-1 h-5 bg-green-500"></div>
                        {/if}
                        {#if state_idx == tm.reject_state}
                            <div class="w-1 h-5 bg-red-500"></div>
                        {/if}

                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1"><Ellipsis size=16 /></DropdownMenu.Trigger> <!-- Change to start, accept or reject state -->
                            <DropdownMenu.Content
                                class="w-fit rounded-xl bg-white p-1 border-stone-900 border-2"
                            >
                                {#if state_idx != tm.initial_state}
                                    <DropdownMenu.Item class="flex flex-row items-center justify-start"><button onclick={() => {tm.initial_state = state_idx}} class="px-1 w-44 text-left">Make Initial state</button><div class="w-1 h-5 bg-blue-500"></div></DropdownMenu.Item>
                                {/if}
                                {#if state_idx != tm.accept_state}
                                    <DropdownMenu.Item class="flex flex-row items-center justify-start"><button onclick={() => {tm.accept_state = state_idx}} class="px-1 w-44 text-left">Make Accept state</button><div class="w-1 h-5 bg-green-500"></div></DropdownMenu.Item>
                                {/if}
                                {#if state_idx != tm.reject_state}
                                    <DropdownMenu.Item class="flex flex-row items-center justify-start"><button onclick={() => {tm.reject_state = state_idx}} class="px-1 w-44 text-left">Make Reject state</button><div class="w-1 h-5 bg-red-500"></div></DropdownMenu.Item>
                                {/if}
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                        <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => { editing_state_idx = state_idx; editing_state_value = tm_state; }}><Pencil size=16 /></button>
                        <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => tm.remove_state_by_idx(state_idx) }><Trash2 size=16 /></button>
                    </span>
                </li>
            {:else}
                <li class="border-r-2 px-1 border-white flex flex-row justify-between gap-1">
                    <input class="border-2 px-2 rounded-md border-stone-500 w-40" type="text" bind:value={editing_state_value}>
                    <span class="flex flex-row gap-1">
                        <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => { tm.update_state_by_idx(state_idx, editing_state_value); editing_state_idx = -1; }}><Save size=16 /></button>
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
            tm.add_state(new_state_name);
            new_state_name = ''
        }}
    ><Plus /> State</button>
</section>