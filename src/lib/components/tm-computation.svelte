<script lang="ts">
	import { Trash2, Ellipsis, RotateCcw, Plus, StepForward, Play, Clock, Microchip, Loader, Check, X } from "lucide-svelte";
	import { TMComputation } from "$lib/tm-engine/computation.svelte";
	import TMTape from "$lib/components/tm-tape.svelte";
	import Tooltip from "$lib/components/tooltip.svelte";
	import TuringMachineData from "$lib/tm-engine/tm-data.svelte";

	let { tm_data } = $props();
	let input_str: string = $state('');
	let computations: Array<TMComputation> = $state([]);
	for (let input_case of tm_data.computation_cases)
		computations.push(new TMComputation(tm_data.tm, input_case));

	let left_zeropad = (num: number, places: number) => {
		const zero = places - num.toString().length + 1;
		return Array(+(zero > 0 && zero)).join("0") + num;
	}
</script>

<div class="flex flex-col gap-2 outline-red-500 outline-2">
	<h3 class="text-2xl px-2">Computation</h3>

	<section class="px-3 flex flex-row justify-start items-center gap-5">
		<span>
			<label for="tm-input-str">Input: </label>
			<input bind:value={input_str} name="tm-input-str" type="text" class="border-2 px-2 rounded-md border-stone-500">
		</span>

		<span class="flex flex-row justify-start items-center gap-2">
			<Tooltip text="Add new computation"><button class="border-2 rounded-md border-stone-500 p-1"
				onclick={() => {
					if (input_str.length != 0) {
						tm_data.add_computation_case(input_str)
						computations.push(new TMComputation(tm_data.tm, input_str));
					} else {
						tm_data.add_computation_case("")
						computations.push(new TMComputation(tm_data.tm, tm_data.tm.tape_symbols[0]));
					}
				}}
			><Plus size=18/></button></Tooltip>
		</span>
	</section>

	<section class="px-3 space-y-1">
		{#each computations as computation, idx}
			<span class="flex flex-row items-center justify-start gap-1 h-12">
				<div class="flex flex-row gap-1 border-x-4 px-2 max-h-fit h-full justify-start items-center">
					<Tooltip text="Delete computation"><button onclick={() => {
						computations.splice(computations.indexOf(computation), 1)
						tm_data.remove_computation_case(computation.input_str)
					}} class="border-2 border-rose-400 bg-rose-100 text-black rounded-md p-1"><Trash2 size=21 /></button></Tooltip>
					<Tooltip text="Reset computation"><button onclick={() => {computation.reset()}} class="border-2 border-amber-400 bg-amber-100 text-black rounded-md p-1"><RotateCcw size=21 /></button></Tooltip>
					<Tooltip text="Step computation by one"><button onclick={() => {computation.step()}} class="border-2 border-lime-400 bg-lime-100 text-black rounded-md p-1"><StepForward size=21 /></button></Tooltip>
					<Tooltip text="Run computation"><button onclick={() => {computation.step_till_terminate()}} class="border-2 border-lime-400 bg-lime-100 text-black rounded-md p-1"><Play size=21 /></button></Tooltip>

					{#if computation.status == 0}
						<Tooltip text="Computation state"><span class="bg-sky-100 border-sky-500 border-2 rounded-md p-1 flex flex-row gap-1 items-center text-center align-middle"><Loader size=16></Loader>{tm_data.tm.states[computation.current_state]}</span></Tooltip>
					{:else if computation.status == 1}
						<Tooltip text="Computation status - Accepted"><span class="bg-lime-200 border-lime-500 border-2 rounded-md p-1 flex flex-row gap-1 items-center text-center align-middle"><Check size=16></Check>{tm_data.tm.states[computation.current_state]}</span></Tooltip>
					{:else if computation.status == 2}
						<Tooltip text="Computation status - Rejected"><span class="bg-rose-200 border-rose-500 border-2 rounded-md p-1 flex flex-row gap-1 items-center text-center align-middle"><X size=16></X>{tm_data.tm.states[computation.current_state]}</span></Tooltip>
					{/if}
					<span class="flex flex-col justify-start items-center">
						<Tooltip text="Time usage"><span class="px-1 flex flex-row gap-1 items-center text-center align-middle"><Clock size=16></Clock> {left_zeropad(computation.time_used, 4)}</span></Tooltip>
						<Tooltip text="Space usage"><span class="px-1 flex flex-row gap-1 items-center text-center align-middle"><Microchip size=16></Microchip> {left_zeropad(computation.space_used, 4)}</span></Tooltip>
					</span>
				</div>
				<TMTape {computation}></TMTape>
			</span>
		{/each}
	</section>
</div>
