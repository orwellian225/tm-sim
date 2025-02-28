<script lang="ts">
	import SplitPlane from "./SplitPlane.svelte";
	import Panel from "./Panel.svelte";

	import { SquareSplitVertical, SquareSplitHorizontal, X } from "phosphor-svelte";

	let { close_callback = undefined }: { close_callback: () => void | undefined } = $props();
	let split = $state(false);
	let split_type: "vertical" | "horizontal" = $state("vertical");
</script>

{#snippet panel_control()}
<div class="w-full h-full p-1 overflow-hidden">
	<section class="flex flex-row justify-between items-center border-b-[1px]">
		<h1>Panel</h1>

		<span>
			<button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => { split = true; split_type = "vertical"} }><SquareSplitVertical size={20} /></button>
			<button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => { split = true; split_type = "horizontal"} }><SquareSplitHorizontal size={20} /></button>
			{#if close_callback !== undefined}
				<button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={close_callback}><X size={20}/></button>
			{/if}
		</span>
	</section>

	<section class="h-full">
		<!-- {@render children()} -->
	</section>
</div>
{/snippet}

{#if split}
	<SplitPlane type={split_type}  min="10%" max="90%" --color="black" --thickness="2px">
		{#snippet a()}
			{@render panel_control()}
		{/snippet}
		{#snippet b()}
			<Panel close_callback={() => { split = false; }}/>
		{/snippet}
	</SplitPlane>
{:else}
	{@render panel_control()}
{/if}
