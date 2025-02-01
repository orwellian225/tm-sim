<script lang="ts">
    import { Plus, Save, Trash2, Ellipsis, Pencil } from "lucide-svelte";

    let {tm = $bindable()} = $props();
    let new_tape_symbol: string = $state("");

    let editing_tape_symbol_idx: number = $state(-1);
    let editing_tape_symbol_value: string = $state("");
</script>

<section class="flex flex-col px-3 gap-2 w-64">
    <ul class="max-h-64 overflow-y-auto">
        {#each tm.tape_symbols as symbol, symbol_idx}
            <li class="border-r-2 px-1 flex flex-row justify-between">
                {symbol}
                <span>
                    <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => { editing_tape_symbol_idx = symbol_idx; editing_tape_symbol_value= symbol; }}><Pencil size=16 /></button>
                    {#if symbol_idx != 0}
                        <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => tm.remove_tape_symbol_by_idx(symbol_idx)}><Trash2 size=16 /></button>
                    {/if}
                </span>
            </li>
        {/each}
    </ul>
    <input bind:value={new_tape_symbol} type="text" class="border-2 px-2 rounded-md border-stone-500">
    <button class="
        px-2 py-1 border-x-2 rounded-md border-stone-500
        flex flex-row items-center justify-center gap-2
        hover:border-stone-800
        active:border-black active:bg-stone-100
        "
        onclick={() => {
            tm.add_tape_symbol(new_tape_symbol);
            new_tape_symbol = '';
        }}
    ><Plus /> Tape Symbol</button>
</section>