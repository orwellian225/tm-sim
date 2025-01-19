<script lang="ts">
	import TmStateInfo from "$lib/components/tm-state-info.svelte";

	let {tm = $bindable()} = $props();
</script>

<h2 class="text-2xl px-2">Information</h2>

<div class="flex flex-row">

	<TmStateInfo bind:tm={tm}></TmStateInfo>

	<section class="flex flex-col border-r-4 px-3">
		<h3 class="text-lg py-2 underline">TM Tape Symbols</h3>
		<ul class="list-disc list-inside">
			{#each tm.symbols as tm_symbol}
				<li>{tm_symbol}</li>
			{/each}
		</ul>
	</section>

	<section class="flex flex-col border-r-4 px-3">
		<h3 class="text-lg py-2 underline">TM Language Symbols</h3>
		<ul class="list-disc list-inside">
			{#each tm.language_symbols as tm_symbol}
				<li>{tm_symbol}</li>
			{/each}
		</ul>
	</section>

	<section class="flex flex-col border-r-4 px-3">
		<h3 class="text-lg py-2 underline">TM Transitions</h3>
		<ul class="list-disc list-inside">
			{#each tm.transitions as t}
				<li>{tm.states[t[0]]}, {tm.symbols[t[1]]}, {tm.direction_str(t[2])} -> {tm.states[t[3]]}, {tm.symbols[t[4]]} </li>
			{/each}
		</ul>
	</section>
</div>
