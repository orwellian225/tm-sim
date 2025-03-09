<script lang="ts">
	import TMFile from '$lib/tm-engine/tm-file.svelte';
	import TMTransition from '$lib/tm-engine/tm-machine.svelte';
	import { getContext } from 'svelte';

	import { TrashSimple } from 'phosphor-svelte';
	import { Currency } from 'lucide-svelte';
	import DiagramState from '$lib/tm-engine/tm-diagram';

	let current_tm: TMFile = getContext('current_turing_machine');
</script>

<ul class="space-y-2 p-1">
	{#each current_tm.machine.transitions as transition, idx}
		{#if transition.from_state != current_tm.machine.accept_state && transition.from_state != current_tm.machine.reject_state}
			<li class="w-fit flex flex-row items-center justify-center gap-2 h-8">
				{current_tm.machine.states[transition.from_state]},
				{current_tm.machine.alphabet[transition.read_symbol]}
				->
				{#if transition.to_state !== null}
					<select bind:value={transition.to_state} onchange={() => {
						current_tm.diagram.transitions[idx].terminal_point = { 
							state_position: current_tm.diagram.states[transition.to_state].position,
							radius: DiagramState.radius + 5,
							angle: 0
						};
						current_tm.diagram.transitions[idx].refresh_angles();
					}} class="p-1">
						{#each current_tm.machine.states as state, idx}
							<option value={idx}>{state}</option>
						{/each}
					</select>
					<select bind:value={transition.write_symbol} class="p-1">
						{#each current_tm.machine.alphabet as symbol, idx}
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
							transition.to_state = null;
							transition.write_symbol = null;
							transition.direction = null;
							current_tm.diagram.transitions[idx].terminal_point = null;
							current_tm.diagram.transitions[idx].refresh_angles();
						}}><TrashSimple size={18} /></button
					>
				{:else}
					<button
						class="border-[1px] p-1 border-black hover:bg-zinc-100"
						onclick={() => {
							transition.to_state = transition.from_state;
							transition.write_symbol = transition.read_symbol;
							transition.direction = 1;
							current_tm.diagram.transitions[idx].terminal_point = { 
								state_position: current_tm.diagram.states[transition.to_state].position,
								radius: DiagramState.radius + 5,
								angle: 0
							};
							current_tm.diagram.transitions[idx].refresh_angles();
						}}>No Transition</button
					>
				{/if}
			</li>
		{/if}
	{/each}
</ul>
