<script lang="ts">
    import TMFile from "$lib/tm-engine/tm-file.svelte";
    import { getContext } from "svelte"

    import { Plus, Check, ChartLine } from "phosphor-svelte";

    import { Separator } from "bits-ui";
    import ComputationTape from "$lib/components/ComputationTape.svelte";

    let current_turing_machine: TMFile = getContext("current_turing_machine")

    let add_computation: boolean = $state(false);
    let add_computation_input: string = $state("");

    let show_resources: boolean = $state(false);
</script>

<span class="flex flex-row justify-start items-center gap-2">
    {#if add_computation}
        <input class="w-1/2 border-2 border-black text-xl" bind:value={add_computation_input}>
        <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
            current_turing_machine.add_computation(add_computation_input);
            add_computation = false;
        }}><Check size={20} /></button>
    {:else}
        <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => add_computation = true}><Plus size={20} /></button>
        <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => show_resources = !show_resources}><ChartLine size={20} /></button>
    {/if}
</span>

<Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />

<section class="space-y-2">
    {#each current_turing_machine.computations as comp, idx}
        <ComputationTape machine={current_turing_machine.machine} in_str={comp} remove_callback={() => {
            current_turing_machine.computations.splice(idx, 1);
        }} {show_resources} />
    {/each}
</section>