<script lang="ts">
	import TMFile from "$lib/tm-engine/tm-file.svelte";
	import TuringMachine from "$lib/tm-engine/tm-machine.svelte";
	import { setContext } from "svelte";

	let current_turing_machine = new TMFile(
		"New Turing Machine",
		new TuringMachine( 
			// Reject empty string, accept any other string
			[ "qI", "qA", "qR" ],  ['0', '1'], ['b'],
			[
				[ 0, 0, 2, 0, +1 ],
				[ 0, 1, 1, 2, +1 ],
				[ 0, 2, 1, 2, +1 ],
			].map(t => TuringMachine.transition_array_to_obj(t)), 
			0, 1, 2
		),
		[ "", "0", "1" ], 
	);
	setContext("current_turing_machine", current_turing_machine );
</script>

<main class="flex gap-2 h-screen w-screen">
	<div class="border-2 border-black w-1/5 h-full">
		This is the side bar
	</div>

	<div class="border-2 border-red-500 w-full h-full">
		This is the page content
	</div>
</main>
