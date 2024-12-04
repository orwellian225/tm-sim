<script lang="ts">
	import { Plus, Pencil, Trash2, Ellipsis } from 'lucide-svelte';
	import { TuringMachine } from "$lib/tm-engine/turing-machine.ts"

	let {tm = $bindable()} = $props();
	let new_state_name: string = $state('');
</script>

<h2 class="text-2xl px-2">Information</h2>

<div class="flex flex-row">
	<section class="flex flex-col border-r-4 px-3 gap-2">
		<h3 class="text-lg py-2 underline">TM States</h3>
		<ul class="list-disc list-inside">
			{#each tm.states as tm_state}
				{#if tm_state == tm.states[tm.initial_state]}
					<li class="border-r-2 px-1 border-blue-500 flex flex-row justify-between">
						{tm_state}
						<span class="flex flex-row gap-1">
							<button class="border-2 border-stone-500 rounded-md p-1"><Pencil size=16 /></button>
							<button class="border-2 border-stone-500 rounded-md p-1"><Trash2 size=16 /></button>
						</span>
					</li>
				{:else if tm_state == tm.states[tm.accept_state]}
					<li class="border-r-2 px-1 border-green-500 flex flex-row justify-between">
						{tm_state}
						<span class="flex flex-row gap-1">
							<button class="border-2 border-stone-500 rounded-md p-1"><Pencil size=16 /></button>
							<button class="border-2 border-stone-500 rounded-md p-1"><Trash2 size=16 /></button>
						</span>
					</li>
				{:else if tm_state == tm.states[tm.reject_state]}
					<li class="border-r-2 px-1 border-red-500 flex flex-row justify-between">
						{tm_state}
						<span class="flex flex-row gap-1">
							<button class="border-2 border-stone-500 rounded-md p-1"><Pencil size=16 /></button>
							<button class="border-2 border-stone-500 rounded-md p-1"><Trash2 size=16 /></button>
						</span>
					</li>
				{:else}
					<li class="border-r-2 px-1 border-white flex flex-row justify-between">
						{tm_state}
						<span class="flex flex-row gap-1">
							<button class="border-2 border-stone-500 rounded-md p-1"><Ellipsis size=16 /></button> <!-- Change to start, accept or reject state -->
							<button class="border-2 border-stone-500 rounded-md p-1"><Pencil size=16 /></button>
							<button class="border-2 border-stone-500 rounded-md p-1"><Trash2 size=16 /></button>
						</span>
					</li>
				{/if}
			{/each}
		</ul>

		<input bind:value={new_state_name} type="text" class="border-2 px-2 rounded-md border-black">
		<button class="
			px-2 py-1 border-x-2 rounded-md border-stone-500
			flex flex-row items-center justify-center gap-2
			hover:border-stone-800
			active:border-black active:bg-stone-100
			"
			onclick={() => {
				tm.states.push(new_state_name)
				new_state_name = ''
			}}
		><Plus /> State</button>
	</section>

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
