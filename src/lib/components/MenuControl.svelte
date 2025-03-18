<script lang="ts">
    import RecursiveTextMenu from './RecursiveTextMenu.svelte';
    import TMFile from '$lib/tm-engine/tm-file.svelte';
    import { getContext } from 'svelte';
    import { Separator } from 'bits-ui';
    import { Copy, X } from 'phosphor-svelte';

    let current_tm: TMFile = getContext("current_turing_machine");

    function new_tm() {
        const default_tm = TMFile.default();
        // can't just assign default because it doesn't trigger updates
        current_tm.identifier = default_tm.identifier;
        current_tm.machine = default_tm.machine;
        current_tm.computations = default_tm.computations;
        current_tm.diagram = default_tm.diagram;
    }

    let dialog_element: HTMLDialogElement;
    const elements = [
        {
            text: "New",
            onclick: () => {},
            subelements: [
	           	{ text: "Save current and New", onclick: () => { current_tm.download(); new_tm(); }, subelements:[] },
	           	{ text: "Discard current and New", onclick: () => { new_tm(); }, subelements:[] }
            ]
        },
        {
            text: "Save",
            onclick: () => {},
            subelements: [
            	{ text: "JSON", onclick: () => { current_tm.download() }, subelements:[] }
            ]
        },
        {
            text: "Load",
            onclick: () => {},
            subelements: [
                {
                    text: "From File",
                    onclick: () => {
                        const file_upload = document.createElement("input")
                        file_upload.type = "file";
                        file_upload.accept = ".json";
                        file_upload.click();

                        file_upload.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files[0];
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const obj = JSON.parse((e.target as FileReader).result as string);
                                current_tm.load(obj);
                            }
                            reader.readAsText(file);
                        }

                        file_upload.remove()
                    },
                    subelements: []
                }
            ]
        },
        {
            text: "Export",
            onclick: () => {},
            subelements: [
                {
                    text: "Transition Table",
                    onclick: () => {
                        dialog_element.showModal();
                    },
                    subelements: []
                }
            ]
        }
    ];
    const menu_control = [{
    	text: "File",
     	onclick: () => {},
      	subelements: elements
    }]

    let state_counter = $state(false);
    let symbol_counter = $state(false);
    let direction_symbol = $state(true);
    let transition_seperator = $state(";");
    let field_seperator = $state("#");
    let state_base = $state(10);
    let symbol_base = $state(10);
    let direction_base = $state(10);
</script>


<ul>
    <RecursiveTextMenu values={menu_control} />
</ul>

<dialog bind:this={dialog_element} class="border-[1px] border-black p-1">
    <div class="flex flex-col justify-start items-center gap-1 py-1">
        <h3 class="text-xl">Transition Table Export</h3>

        <Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />

        <form class="flex flex-col gap-2 w-full">
            <span class="flex flex-row items-center justify-between w-full px-2 gap-5">
                <label for="state_counter">States as Counter</label>
                <span class="flex flex-row items-center justify-end gap-2">
                    <input class="border-[1px] border-black w-1/3" name="state_base" type="number" bind:value={state_base}>
                    <input name="state_counter" type="checkbox" bind:checked={state_counter}>
                </span>
            </span>
            <span class="flex flex-row items-center justify-between w-full px-2 gap-5">
                <label for="symbol_counter">Symbols as Counter</label>
                <span class="flex flex-row items-center justify-end gap-2">
                    <input class="border-[1px] border-black w-1/3" name="symbol_base" type="number" bind:value={symbol_base}>
                    <input name="symbol_counter" type="checkbox" bind:checked={symbol_counter}>
                </span>
            </span>
            <span class="flex flex-row items-center justify-between w-full px-2 gap-5">
                <label for="direction_string">Direction as Symbol</label>
                <span class="flex flex-row items-center justify-end gap-2">
                    <input class="border-[1px] border-black w-1/3" name="direction_base" type="number" bind:value={direction_base}>
                    <input name="direction_string" type="checkbox" bind:checked={direction_symbol}>
                </span>
            </span>
            <span class="flex flex-row items-center justify-between w-full px-2 gap-5">
                <label for="field_seperator">Field Seperator</label>
                <input class="border-[1px] border-black w-1/4" name="field_seperator" type="text" bind:value={field_seperator}>
            </span>
            <span class="flex flex-row items-center justify-between w-full px-2 gap-5">
                <label for="trans_seperator">Transition Seperator</label>
                <input class="border-[1px] border-black w-1/4" name="trans_seperator" type="text" bind:value={transition_seperator}>
            </span>
        </form>

        <Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />

        <span class="flex flex-row items-center justify-center w-full px-2">
            <p>{current_tm.export_transition_table({ 
                num_transitions: 3,
                state_counter: state_counter,
                symbol_counter: symbol_counter,
                direction_symbol: direction_symbol,
                transition_seperator: transition_seperator,
                field_seperator: field_seperator,
                state_base: state_base,
                symbol_base: symbol_base,
                direction_base: direction_base
            })}</p>
        </span>

        <Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />

        <span class="flex flex-row items-center justify-between w-full">
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => dialog_element.close()}><X size={24} /></button>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                navigator.clipboard.writeText(current_tm.export_transition_table({
                    state_counter: state_counter,
                    symbol_counter: symbol_counter,
                    direction_symbol: direction_symbol,
                    transition_seperator: transition_seperator,
                    field_seperator: field_seperator,
                    state_base: state_base,
                    symbol_base: symbol_base,
                    direction_base: direction_base
                }))
                    .then(() => console.log("Copied transition table to clipboard"))
                    .catch(err => console.error("Failed to copy transition table to clipboard", err));
            }}><Copy size={24} /></button>
        </span>
    </div>
</dialog>
