<script lang="ts">
	import '../app.css';

	let { children } = $props();

	// ---------------------------------------------------------

	import TMFile from "$lib/tm-engine/tm-file.svelte";
	import TuringMachine from "$lib/tm-engine/tm-machine.svelte";

	import { setContext } from "svelte";
	import { page } from "$app/state";

	console.log("page.url.pathname", page.url.pathname);

	import { Separator } from "bits-ui"

	let current_turing_machine = new TMFile(
		"New Turing Machine",
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
	);
	setContext("current_turing_machine", current_turing_machine );
</script>

<main class="flex gap-2 h-screen w-screen">
	<div class="w-1/5 h-full px-2 flex flex-col gap-4">
		<div class="w-full h-fit">
			<h1 class="text-4xl">Menu</h1>
			<h2 class="text-2xl">{current_turing_machine.identifier}</h2>

			<Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />

			<ol>
				<li><button>> New</button></li>
				<li><button>> Save</button></li>
				<li><button>> Load</button></li>
				<li><button>> Export</button></li>
			</ol>

			<Separator.Root class="bg-black my-2 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full" />

			<nav><ol>
				<li><a href="/">{#if page.url.pathname == "/"}□{:else}>{/if} Editor</a> </li>
				<li><a href="/info">{#if page.url.pathname == "/info"}□{:else}>{/if} Information</a></li>
				<li><a href="/examples">{#if page.url.pathname == "/examples"}□{:else}>{/if} Examples </a></li>
				<li><a href="/help">{#if page.url.pathname == "/help"}□{:else}>{/if} Help</a></li>
				<li><a href="/tools">{#if page.url.pathname == "/tools"}□{:else}>{/if} Other Tools</a></li>
			</ol></nav>
		</div>	

		<div class="w-full h-fit">
			<h1 class="text-4xl">Machine</h1>
			<h2 class="text-2xl border-b-2 border-black">States</h2>
			<h2 class="text-2xl border-b-2 border-black">Language Alphabet</h2>
			<h2 class="text-2xl border-b-2 border-black">Tape Alphabet</h2>
		</div>	
	</div>

	<div class="border-2 border-red-500 w-full h-full">
		This is the page content
		{@render children()}
	</div>
</main>