<script lang="ts">
	import { getContext } from 'svelte';
	// import even_string_tm_json from "/tm_examples/is_even_string.json";

	import TMFile from '$lib/tm-engine/tm-file.svelte';

	let current_turing_machine: TMFile = getContext('current_turing_machine');
	const all_examples: any = $state([]);
	// TODO: Fix these examples
	// fetch('/tm_examples/is_even_string.json')
	// 	.then((val) => val.json())
	// 	.then((val) => all_examples.push(val));
	// fetch('/tm_examples/all_zeros.json')
	// 	.then((val) => val.json())
	// 	.then((val) => all_examples.push(val));
	fetch('/tm_examples/palindrome.json')
		.then((val) => val.json())
		.then((val) => all_examples.push(val));

	function load_example(example: any) {
		current_turing_machine.load(example);
	}
</script>

<h1 class="text-3xl">Example Turing Machines</h1>

<ol>
	{#each all_examples as example}
		<li class="flex flex-row justify-centers items-start pl-1">
			<button class="w-fit hover:underline underline-offset-1" onclick={() => load_example(example)}>{example.identifier}</button>
		</li>
	{/each}
</ol>
