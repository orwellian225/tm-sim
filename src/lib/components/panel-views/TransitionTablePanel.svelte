<script lang="ts">
    import TMFile from "$lib/tm-engine/tm-file.svelte";
    import { getContext } from "svelte"

    let current_turing_machine: TMFile = getContext("current_turing_machine")
</script>

<ul class="space-y-1">
    {#each current_turing_machine.machine.transitions as transition, trans_idx}
        <li>
            {current_turing_machine.machine.states[transition.from_state]},
            {current_turing_machine.machine.alphabet[transition.read_symbol]}
            ->
            <select bind:value={transition.to_state} class="p-1">
                {#each current_turing_machine.machine.states as state, idx}
                    <option value={idx}>{state}</option>
                {/each}
            </select>,
            <select bind:value={transition.write_symbol} class="p-1">
                {#each current_turing_machine.machine.states as state, idx}
                    <option value={idx}>{state}</option>
                {/each}
            </select>,
            <select bind:value={transition.direction} class="p-1">
                <option value={-1}>Left</option>
                <option value={1}>Right</option>
            </select>
        </li>
    {/each}
</ul>