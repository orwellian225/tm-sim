<script lang="ts">
	import '../app.css';

	let { children } = $props();

	// ---------------------------------------------------------

	import TMFile from "$lib/tm-engine/tm-file.svelte";
	import MenuControl from '$lib/components/MenuControl.svelte';
	import MenuNavigation from '$lib/components/MenuNavigation.svelte';
	import StateMenu from '$lib/components/StateMenu.svelte';
	import TapeAlphabetMenu from '$lib/components/TapeAlphabetMenu.svelte';
	import LangAlphabetMenu from '$lib/components/LangAlphabetMenu.svelte';

	import { setContext } from "svelte";
	import { page } from "$app/state";

	import MachineMenu from '$lib/components/MachineMenu.svelte';


	let current_turing_machine = $state(TMFile.default());
	setContext("current_turing_machine", current_turing_machine );

</script>

<main class="flex gap-2 h-screen w-screen">
	<div class="w-1/4 min-w-[200px] h-full px-2 py-1 flex flex-col gap-4">
		<div class="w-full h-fit">
			<h1 class="text-4xl">Menu</h1>

			<MenuControl />
			<MenuNavigation url={page.url.pathname}/>
		</div>

		<div class="w-full h-fit space-y-5">
			<h1 class="text-4xl">Machine</h1>

			<MachineMenu />
			<StateMenu />
			<TapeAlphabetMenu />
			<LangAlphabetMenu />
		</div>
	</div>

	<div class="w-full h-full p-1">
		<!-- This is the page content -->
		{@render children()}
	</div>
</main>
