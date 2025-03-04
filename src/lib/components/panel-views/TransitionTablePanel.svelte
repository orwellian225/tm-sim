<script lang="ts">
	import TMFile from '$lib/tm-engine/tm-file.svelte';
	import TMTransition from '$lib/tm-engine/tm-machine.svelte';
	import { getContext } from 'svelte';

	import { TrashSimple } from 'phosphor-svelte';
	import { Currency } from 'lucide-svelte';

	let current_turing_machine: TMFile = getContext('current_turing_machine');
</script>

<ul class="space-y-1 p-1">
	{#each current_turing_machine.machine.states as state, state_idx}
		{#each current_turing_machine.machine.alphabet as symbol, symbol_idx}
			{@const transition: TMTransition | null = current_turing_machine.machine.find_transition(state_idx, symbol_idx)}
			{@debug transition}
			{#if state_idx != current_turing_machine.machine.accept_state && state_idx != current_turing_machine.machine.reject_state}
				<li class="w-fit flex flex-row items-center justify-center gap-2">
					{state}
					{symbol}
					->
					{#if transition !== null}
						<select bind:value={transition.to_state} class="p-1">
							{#each current_turing_machine.machine.states as state, idx}
								<option value={idx}>{state}</option>
							{/each}
						</select>
						<select bind:value={transition.write_symbol} class="p-1">
							{#each current_turing_machine.machine.alphabet as symbol, idx}
								<option value={idx}>{symbol}</option>
							{/each}
						</select>
						<select bind:value={transition.direction} class="p-1">
							<option value={-1}>Left</option>
							<option value={1}>Right</option>
						</select>
						<button
							class="border-[1px] p-1 border-black hover:bg-zinc-100"
							onclick={() => {
								current_turing_machine.machine.transitions.splice(
									current_turing_machine.machine.transitions.indexOf(transition),
									1
								);
							}}><TrashSimple size={18} /></button
						>
					{:else}
						<button
							class="border-[1px] p-1 border-black hover:bg-zinc-100"
							onclick={() => {
								current_turing_machine.machine.transitions.push({
									from_state: state_idx,
									read_symbol: symbol_idx,
									to_state: 0,
									write_symbol: 0,
									direction: 1
								});
							}}>No Transition</button
						>
					{/if}
				</li>
			{/if}
		{/each}
	{/each}
</ul>
