<script lang="ts">
	import { getContext } from "svelte";

	import { PencilSimple } from "phosphor-svelte";
	import { Separator } from "bits-ui";

	import type TMFile from "$lib/tm-engine/tm-file.svelte";

    let current_turing_machine: TMFile = getContext("current_turing_machine");
    let show = $state(false);
</script>

<div>
	<div class="w-full flex justify-between items-center">
	    <h2 class="text-2xl">{current_turing_machine.identifier}</h2>
	    <span class="flex justify-evenly items-center gap-[1px]">
	        <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
	        }}><PencilSimple size={20}/></button>
	    </span>
	</div>

	<Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />
</div>
