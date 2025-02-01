<script lang="ts">
	import { Download, Upload, Pencil } from "lucide-svelte";

	import TmInfo from "$lib/components/tm-info.svelte"
	import TmComputation from "$lib/components/tm-computation.svelte"

	import { TuringMachine } from "$lib/tm-engine/turing-machine.svelte"
	import TmMoore from "$lib/components/tm-moore.svelte";

	let tm: TuringMachine = $state(new TuringMachine(
		["State 0", "Accept", "Reject" ],
		["0", "1"],
		["/"],
		0, 1, 2,
		[
			[ 0, 0, 1, 0, 1 ],
			[ 0, 1, -1, 2, 1 ],
			[ 0, 2, -1, 1, 1 ],
		]
	));
</script>

<main class="flex flex-col py-4 gap-4">
	<div class="flex flex-row justify-start items-center px-2 gap-5">
		<span class="flex flex-row gap-1 border-x-4 px-2">
			<button class="border-2 border-stone-500 rounded-md p-1 w-fit h-fit"><Upload size=24 /></button>
			<button class="border-2 border-stone-500 rounded-md p-1 w-fit h-fit"><Download size=24 /></button>
		</span>
		<input type="text" class="text-3xl" bind:value={tm.identifier}>
	</div>

	<div class="flex flex-row gap-2">
		<div class="flex flex-col gap-2">
			<TmInfo bind:tm={tm} />
			<TmComputation tm={tm} />
		</div>

		<!-- <TmMoore bind:tm={tm} /> -->
	</div>
</main>
