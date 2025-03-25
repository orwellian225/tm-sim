<script lang="ts">
    import RecursiveTextMenu from '../RecursiveTextMenu.svelte';
    import TMFile2 from '$lib/tm-engine/tm-file2.svelte';
    import { getContext } from 'svelte';
    import { Separator } from 'bits-ui';
    import { Copy, X, DownloadSimple } from 'phosphor-svelte';
	import TuringMachine2 from '$lib/tm-engine/tm-machine2.svelte';
	import TuringDiagram from '$lib/tm-engine/tm-diagram2.svelte';

    let current_tm: TMFile2 = getContext("current_turing_machine");

    function new_tm() {
        const default_tm = TMFile2.default();
        // can't just assign default because it doesn't trigger updates
        current_tm.info = default_tm.info;
        current_tm.machine = default_tm.machine;
        current_tm.computations = default_tm.computations;
        current_tm.diagram = default_tm.diagram;
    }

    function save_tm_json() {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(current_tm.toJSON())));
        element.setAttribute('download', `${current_tm.info.identifier}.json`);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();
        document.body.removeChild(element);
    }

    function load_tm_json(json_obj: any) {
        if (!json_obj.info || !json_obj.machine || !json_obj.diagram || !json_obj.computations)
            return

        current_tm.info = json_obj.info;
        current_tm.machine = TuringMachine2.fromJSON(json_obj.machine);
        current_tm.diagram = TuringDiagram.fromJSON(json_obj.diagram, current_tm.machine);
        current_tm.computations = json_obj.computations;
    }

    function export_tm_table({
        num_transitions = current_tm.machine.states.length * current_tm.machine.alphabet.length,
        transition_seperator = ";",
        field_seperator = "#", 
        base = 10, // print as base n
        state_counter = false , // print as state as index or as state name
        symbol_counter = false, // print as symbol as index or as symbol
        direction_enum = 0, 
    }) {
        return current_tm.machine.states.map(( state, q_idx ) => 
            state.transitions.filter((trans) => trans != null).map(( trans, s_idx ) => [
                state_counter ? q_idx.toString(base) : state.name, 
                symbol_counter ? s_idx.toString(base) : current_tm.machine.alphabet[s_idx], 
                state_counter ? current_tm.machine.states.indexOf(trans.to_state).toString(base) : trans.to_state.name,
                symbol_counter ? current_tm.machine.alphabet.indexOf(trans.write_symbol).toString(base) : trans.write_symbol,
                direction_enum == 0 ? ["L", "S", "R"][trans.direction + 1] :
                    direction_enum == 1 ? [0, null, 1][trans.direction + 1] :
                    direction_enum == 2 ? trans.direction?.toString(base) : ["L", "S", "R"][trans.direction + 1],
            ].join(field_seperator)
        )).flat().slice(0, num_transitions).join(transition_seperator) + transition_seperator;
    }

    let dialog_element: HTMLDialogElement;
    const elements = [
        {
            text: "New",
            onclick: () => {},
            subelements: [
	           	{ text: "Save current and New", onclick: () => { save_tm_json(); new_tm(); }, subelements:[] },
	           	{ text: "Discard current and New", onclick: () => { new_tm(); }, subelements:[] }
            ]
        },
        {
            text: "Save",
            onclick: () => {},
            subelements: [
            	{ text: "JSON", onclick: () => { save_tm_json(); }, subelements:[] }
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
                                load_tm_json(obj);
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

    let table_options = $state({
        state_counter: false,
        symbol_counter: false,
        direction_enum: 0,
        transition_seperator: ";",
        field_seperator: "#",
        base: 10
    });
    let preview_table = $derived(export_tm_table({num_transitions: 3, ...table_options}));
    let complete_table = $derived(export_tm_table(table_options));
</script>


<ul>
    <RecursiveTextMenu values={menu_control} />
</ul>

<dialog bind:this={dialog_element} class="border-[1px] border-black p-1">
    <div class="flex flex-col justify-start items-center gap-1 py-1">
        <span class="flex flex-row w-full items-center justify-between">
            <h3 class="text-xl">Transition Table Export</h3>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => dialog_element.close()}><X size={24} /></button>
        </span>

        <Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />

        <form class="flex flex-col gap-2 w-full">
            <span class="flex flex-row items-center justify-between w-full px-2 gap-5">
                <label for="state_counter">States as Counter</label>
                <span class="flex flex-row items-center justify-end gap-2">
                    <input name="state_counter" type="checkbox" bind:checked={table_options.state_counter}>
                </span>
            </span>
            <span class="flex flex-row items-center justify-between w-full px-2 gap-5">
                <label for="symbol_counter">Symbols as Counter</label>
                <span class="flex flex-row items-center justify-end gap-2">
                    <input name="symbol_counter" type="checkbox" bind:checked={table_options.symbol_counter}>
                </span>
            </span>
            <span class="flex flex-row items-center justify-between w-full px-2 gap-5">
                <label for="direction_string">Direction</label>
                <span class="flex flex-row items-center justify-end gap-2">
                    <!-- <input name="direction_string" type="checkbox" bind:checked={direction_symbol}> -->
                     <select class="w-fit p-1" bind:value={table_options.direction_enum}>
                        <option value={0}>Direction as Symbol</option>
                        <option value={1}>Direction as Natural (L = 0, R = 1)</option>
                        <option value={2}>Direction as Integer (L = -1, R = +1)</option>
                     </select>
                </span>
            </span>
            <span class="flex flex-row items-center justify-between w-full px-2 gap-5">
                <label for="counter_base">Number Base</label>
                <input class="border-[1px] border-black w-1/4" name="counter_base" type="number" bind:value={table_options.base} min={2} max={36}>
            </span>
            <span class="flex flex-row items-center justify-between w-full px-2 gap-5">
                <label for="field_seperator">Field Seperator</label>
                <input class="border-[1px] border-black w-1/4" name="field_seperator" type="text" bind:value={table_options.field_seperator}>
            </span>
            <span class="flex flex-row items-center justify-between w-full px-2 gap-5">
                <label for="trans_seperator">Transition Seperator</label>
                <input class="border-[1px] border-black w-1/4" name="trans_seperator" type="text" bind:value={table_options.transition_seperator}>
            </span>
        </form>

        <Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />

        <span class="flex flex-row items-center justify-center w-full px-2">
            <p>{preview_table}</p>
        </span>

        <Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />

        <span class="flex flex-row items-center justify-start w-full gap-2">
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(complete_table));
                element.setAttribute('download', `${current_tm.info.identifier}_table.txt`);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();
                document.body.removeChild(element);
            }}><DownloadSimple size={24} /></button>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
                navigator.clipboard.writeText(complete_table)
                    .then(() => console.log("Copied transition table to clipboard"))
                    .catch(err => console.error("Failed to copy transition table to clipboard", err));
            }}><Copy size={24} /></button>
        </span>
    </div>
</dialog>
