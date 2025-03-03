<script lang="ts">
	import TMComputation from "$lib/tm-engine/tm-computation.svelte";
    let { in_str, machine, show_resources = false, remove_callback } = $props();

    import { ArrowCounterClockwise, Play, SkipForward, TrashSimple } from "phosphor-svelte";

    let computation: TMComputation = new TMComputation(machine, in_str);

    function status_to_string(status_value: number, computation_state: number): string {
        switch (status_value) {
            case 0: 
                return machine.states[computation_state];
            case 1: 
                return "Accepted";
            case 2: 
                return "Rejected";
            default:
                return "Err";
        }
    }
</script>

<div class="flex flex-col gap-2">
    <section class="w-full flex flex-row items-center justify-between">
        <span class="flex flex-row items-center gap-2">
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => computation.reset()}><ArrowCounterClockwise size={20} /></button>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => computation.step()}><SkipForward size={20} /></button>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => computation.step_until_halt()}><Play size={20} /></button>
            <p class="flex items-center justify-center">Status: {status_to_string(computation.status, computation.state)}</p>
        </span>

        <span class="flex flex-row items-center gap-2">
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => remove_callback()}><TrashSimple size={20} /></button>
        </span>
    </section>

    {#if show_resources}
        <table class="w-fit">
            <tbody>
                <tr>
                    <td>Time:</td>
                    <td>{computation.resources.time}</td>
                </tr>
                <tr>
                    <td>Space:</td>
                    <td>{computation.resources.space}</td>
                </tr>
            </tbody>
        </table>
    {/if}

    <p class="w-full h-8 border-green-500 border-[1px]">{in_str}</p>
</div>