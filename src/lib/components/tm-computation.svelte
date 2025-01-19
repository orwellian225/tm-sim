<script lang="ts">
	import { Trash2, RotateCcw, Plus, StepForward, Play } from "lucide-svelte";
	import { TMComputation } from "$lib/tm-engine/computation.svelte";
	import TMTape from "$lib/components/tm-tape.svelte";
	import Tooltip from "$lib/components/tooltip.svelte";

	let { tm } = $props();
	let input_str: string = $state('');
	let computations: Array<TMComputation> = $state([]);
</script>

<div class="flex flex-col gap-2">
	<h3 class="text-2xl px-2">Computation</h3>

	<section class="px-3 flex flex-row justify-start items-center gap-5">
		<span>
			<label for="tm-input-str">Input: </label>
			<input bind:value={input_str} name="tm-input-str" type="text" class="border-2 px-2 rounded-md border-stone-500">
		</span>

		<span>
			<Tooltip text="Add new computation"><button class="border-2 rounded-md border-stone-500 p-1"
				onclick={() => {
					computations.push(new TMComputation(tm, input_str));
				}}
			><Plus size=18/></button></Tooltip>
		</span>
	</section>

	<section class="px-3 space-y-1">
		{#each computations as computation, idx}
			<span class="flex flex-row items-center justify-start gap-2">
				<div class="flex flex-row gap-1 border-x-4 px-2">
					<Tooltip text="Delete computation"><button onclick={() => {computations.splice(computations.indexOf(computation), 1)}} class="border-2 border-rose-400 bg-rose-100 text-black rounded-md p-1"><Trash2 size=21 /></button></Tooltip>
					<Tooltip text="Reset computation"><button onclick={() => {computation.reset()}} class="border-2 border-amber-400 bg-amber-100 text-black rounded-md p-1"><RotateCcw size=21 /></button></Tooltip>
					<Tooltip text="Step computation by one"><button onclick={() => {computation.step()}} class="border-2 border-lime-400 bg-lime-100 text-black rounded-md p-1"><StepForward size=21 /></button></Tooltip>
					<Tooltip text="Run computation"><button onclick={() => {computation.step_till_terminate()}} class="border-2 border-lime-400 bg-lime-100 text-black rounded-md p-1"><Play size=21 /></button></Tooltip>
				</div>
				<TMTape {computation}></TMTape>
			</span>
		{/each}
	</section>
</div>
