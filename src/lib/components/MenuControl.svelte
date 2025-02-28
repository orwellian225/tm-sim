<script lang="ts">
    import RecursiveTextMenu from './RecursiveTextMenu.svelte';

    import TMFile from '$lib/tm-engine/tm-file.svelte';
    import TuringMachine from '$lib/tm-engine/tm-machine.svelte';

    import { getContext } from 'svelte';

    let current_turing_machine: TMFile = getContext("current_turing_machine");

    function new_tm() {
        current_turing_machine.identifier = "New TM";
        current_turing_machine.machine = new TuringMachine(
            // Reject empty string, accept any other string
            [ "qI", "qA", "qR" ],  ['0', '1'], ['b'],
            [
                [ 0, 0, 2, 0, +1 ],
                [ 0, 1, 1, 2, +1 ],
                [ 0, 2, 1, 2, +1 ],
            ].map(t => TuringMachine.transition_array_to_obj(t)),
            0, 1, 2
        );
        current_turing_machine.computations = [ "", "0", "1" ];
    }


    const elements = [
        {
            text: "New",
            onclick: () => {},
            subelements: [
	           	{ text: "Save current and New", onclick: () => { current_turing_machine.download(); new_tm(); }, subelements:[] },
	           	{ text: "Discard current and New", onclick: () => { new_tm(); }, subelements:[] }
            ]
        },
        {
            text: "Save",
            onclick: () => {},
            subelements: [
            	{ text: "JSON", onclick: () => { current_turing_machine.download() }, subelements:[] }
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
                                current_turing_machine.load(obj);
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
                    text: "Copy Transition Table",
                    onclick: () => {
                        navigator.clipboard.writeText(current_turing_machine.export_transition_table({}))
                            .then(() => console.log("Copied transition table to clipboard"))
                            .catch(err => console.error("Failed to copy transition table to clipboard", err));
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
</script>

<ul>
    <RecursiveTextMenu values={menu_control} />
</ul>
