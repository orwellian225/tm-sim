<script lang="ts">
    import { Plus, Save, Trash2, Ellipsis, Pencil } from "lucide-svelte";
    import { DropdownMenu } from "bits-ui";

    let {tm = $bindable()} = $props();
    let new_language_symbol: string = $state("");

    let editing_language_symbol_idx: number = $state(-1);
    let editing_language_symbol_value: string = $state("");
</script>

<section class="flex flex-col px-3 gap-2 w-64">
    <ul>
        {#each tm.language_symbols as symbol, symbol_idx}
            <li class="border-r-2 px-1 flex flex-row justify-between">
                {symbol}
                <span>
                    <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => { editing_language_symbol_idx = symbol_idx; editing_language_symbol_value = symbol; }}><Pencil size=16 /></button>
                    <button class="border-2 border-stone-500 hover:bg-stone-100 rounded-md p-1" onclick={() => tm.remove_language_symbol_by_idx(symbol_idx) }><Trash2 size=16 /></button>
                </span>
            </li>
        {/each}
    </ul>
    <input bind:value={new_language_symbol} type="text" class="border-2 px-2 rounded-md border-stone-500">
    <button class="
        px-2 py-1 border-x-2 rounded-md border-stone-500
        flex flex-row items-center justify-center gap-2
        hover:border-stone-800
        active:border-black active:bg-stone-100
        "
        onclick={() => {
            tm.add_language_symbol(new_language_symbol);
            new_language_symbol = '';
        }}
    ><Plus /> Language Symbol</button>
</section>