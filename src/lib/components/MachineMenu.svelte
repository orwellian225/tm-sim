<script lang="ts">
	import { getContext } from "svelte";

	import { PencilSimple, Check } from "phosphor-svelte";
	import { Separator } from "bits-ui";

	import type TMFile from "$lib/tm-engine/tm-file.svelte";

    let current_turing_machine: TMFile = getContext("current_turing_machine");

    let edit_identifier = $state(false);
    let edit_identifier_value = $state("");
</script>

<div>
	<div class="w-full flex justify-between items-center">

		{#if !edit_identifier}
		    <h2 class="text-2xl">{current_turing_machine.identifier}</h2>
		    <span class="flex justify-evenly items-center gap-[1px]">
		        <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
					edit_identifier = true;
					edit_identifier_value = current_turing_machine.identifier;
		        }}><PencilSimple size={20}/></button>
		    </span>
		{:else}
			<input class="w-4/5 border-2 border-black text-2xl" type="text" bind:value={edit_identifier_value} autofocus>
		    <span class="flex justify-evenly items-center gap-[1px]">
		        <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => {
					edit_identifier = false;
					current_turing_machine.identifier = edit_identifier_value;
		        }}><Check size={20}/></button>
		    </span>
		{/if}

	</div>

	<Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />
</div>
