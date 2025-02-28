<script lang="ts">
	import '../app.css';

	let { children } = $props();

	// ---------------------------------------------------------

	import TMFile from "$lib/tm-engine/tm-file.svelte";
	import TuringMachine from "$lib/tm-engine/tm-machine.svelte";
	import MenuControl from '$lib/components/MenuControl.svelte';
	import MenuNavigation from '$lib/components/MenuNavigation.svelte';
	import StateMenu from '$lib/components/StateMenu.svelte';
	import TapeAlphabetMenu from '$lib/components/TapeAlphabetMenu.svelte';
	import LangAlphabetMenu from '$lib/components/LangAlphabetMenu.svelte';

	import { setContext } from "svelte";
	import { page } from "$app/state";

	import { Separator } from "bits-ui"
	import { PencilSimple, FloppyDisk } from "phosphor-svelte";


	let current_turing_machine = $state(new TMFile(
		"New TM",
		new TuringMachine(
			// Reject empty string, accept any other string
			[ "qI", "qA", "qR" ],  ['0', '1'], ['b'],
			[
				[ 0, 0, 2, 0, +1 ],
				[ 0, 1, 1, 2, +1 ],
				[ 0, 2, 1, 2, +1 ],
			].map(t => TuringMachine.transition_array_to_obj(t)),
			0, 1, 2
		),
		[ "", "0", "1" ],
	));
	setContext("current_turing_machine", current_turing_machine );

	let edit_identifier = $state(false);
</script>

<main class="flex gap-2 h-screen w-screen">
	<div class="w-1/5 min-w-[200px] h-full px-2 flex flex-col gap-4">
		<div class="w-full h-fit">
			<h1 class="text-4xl">Menu</h1>

			<!-- <Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" /> -->
			<MenuControl />
			<!-- <Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" /> -->
			<MenuNavigation url={page.url.pathname}/>

		</div>

		<div class="w-full h-fit space-y-5">
			<h1 class="text-4xl">Machine</h1>
			<h2 class="text-2xl flex justify-between items-center">
				{#if edit_identifier}
					<input class="w-4/5 border-[1px] border-black px-1" type="text" bind:value={current_turing_machine.identifier} autofocus/>
					<button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => edit_identifier = false}><FloppyDisk size={20}/></button>
				{:else}
					{current_turing_machine.identifier}
					<button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => edit_identifier = true}><PencilSimple size={20}/></button>
				{/if}
			</h2>
			<StateMenu />
			<TapeAlphabetMenu />
			<LangAlphabetMenu />
		</div>
	</div>

	<div class="border-2 border-red-500 w-full h-full">
		This is the page content
		{@render children()}
	</div>
</main>
