<script lang="ts">
	import { Play, Pause } from "lucide-svelte";
	import { TMComputation } from "$lib/tm-engine/computation.ts";

	let { tm } = $props();
	let input_str: string = $state('');
	let computation: TMComputation = $state(new TMComputation(tm, input_str));
</script>

<div class="flex flex-col gap-2">
	<h3 class="text-2xl px-2">Computation</h3>

	<section class="px-3 flex flex-row justify-start items-center gap-5">
		<span>
			<label for="tm-input-str">Input: </label>
			<input bind:value={input_str} name="tm-input-str" type="text" class="border-2 px-2 rounded-md border-black">
		</span>

		<span>
			<button class="border-2 rounded-md border-lime-500 bg-lime-200 p-1"
				onclick={() => {
					computation = new TMComputation(tm, input_str);
				}}
			><Play /></button>
			<button class="border-2 rounded-md border-amber-500 bg-amber-200 p-1"><Pause /></button>
		</span>
	</section>

	<section class="px-3">
		<!-- <canvas class='border-2 border-black rounded-md' width='800' height='150' id="tape_cvs"></canvas> -->
		<p>{computation.tape.join("")}</p>
	</section>
</div>
