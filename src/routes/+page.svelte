<script lang="ts">
	import TmInfo from "$lib/components/tm-info.svelte"
	import TmComputation from "$lib/components/tm-computation.svelte"

	import { TuringMachine } from "$lib/tm-engine/turing-machine.ts"

	let tm: TuringMachine = $state(new TuringMachine(
		["State 0", "State 1", "State 2", "State 3"],
		["0", "1"],
		["b"],
		0, 1, 2,
		[
			[0, 0, 1, 0, 0],
			[0, 1, 1, 1, 1],
			[0, 2, 1, 2, 2]
		]
	));

	// $inspect(tm);
</script>

<main class="flex flex-col py-4 gap-4">
	<h1 class="text-3xl px-2">{tm.identifier}</h1>

	<TmInfo bind:tm={tm} />

	<TmComputation tm={tm} />
</main>
