<script lang="ts">
	import TmStateInfo from "$lib/components/tm-state-info.svelte";
	import TmLangSymbolInfo from "$lib/components/tm-lang-symbol-info.svelte";
	import TmTapeSymbolInfo from "$lib/components/tm-tape-symbol-info.svelte";

	let {tm = $bindable()} = $props();
</script>

<h2 class="text-2xl px-2">Information</h2>

<div class="flex flex-col w-fit gap-2">
	<TmStateInfo bind:tm={tm}></TmStateInfo>
	<TmTapeSymbolInfo bind:tm={tm}></TmTapeSymbolInfo>	
	<TmLangSymbolInfo bind:tm={tm}></TmLangSymbolInfo>	
</div>
