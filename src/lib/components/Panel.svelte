<script lang="ts">
	import SplitPlane from "./SplitPlane.svelte";
	import Panel from "./Panel.svelte";
	import ComputationPanel from "./panel-views/ComputationPanel.svelte";
	import TransitionTablePanel from "./panel-views/TransitionTablePanel.svelte";
	import StateDiagramPanel from "./panel-views/StateDiagramPanel.svelte";

	import { SquareSplitVertical, SquareSplitHorizontal, X } from "phosphor-svelte";

	let { close_callback = undefined, initial_panel = 0, initial_split = false }: { close_callback: (() => void) | undefined, number, boolean } = $props();
	let split = $state(initial_split);
	let split_type: "vertical" | "horizontal" = $state("horizontal");

	let panel_type: number = $state(initial_panel);
</script>

{#snippet panel_control()}
<div class="w-full h-full p-1 overflow-hidden">
	<section class="flex flex-row justify-between items-center border-b-[1px]">
		<select class="w-fit text-lg p-1" bind:value={panel_type}>
			<option value={0}>State Diagram</option>
			<option value={1}>Transition Table</option>
			<option value={2}>Computations</option>
		</select>

		<span>
			<button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => { split = true; split_type = "vertical"} }><SquareSplitVertical size={20} /></button>
			<button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => { split = true; split_type = "horizontal"} }><SquareSplitHorizontal size={20} /></button>
			{#if close_callback !== undefined}
				<button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={close_callback}><X size={20}/></button>
			{/if}
		</span>
	</section>

	<section class="h-[90%] w-full p-1 overflow-y-auto overflow-x-auto">
		{#if panel_type == 0}
			<StateDiagramPanel />
		{:else if panel_type == 1}
			<TransitionTablePanel />
		{:else if panel_type == 2}
			<ComputationPanel />
		{/if}

	</section>
</div>
{/snippet}

{#if split}
	<SplitPlane type={split_type}  min="10%" max="90%" --color="black" --thickness="2px">
		{#snippet a()}
			{@render panel_control()}
		{/snippet}
		{#snippet b()}
			<Panel close_callback={() => { split = false; }} />
		{/snippet}
	</SplitPlane>
{:else}
	{@render panel_control()}
{/if}
