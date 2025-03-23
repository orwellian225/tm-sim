<script lang="ts">
	import TMFile2 from '$lib/tm-engine/tm-file2.svelte';
	import { type MachineTransition } from '$lib/tm-engine/tm-machine2.svelte';
	import { getContext } from 'svelte';

	import { TrashSimple } from 'phosphor-svelte';

	let current_tm: TMFile2 = getContext('current_turing_machine');
</script>

<ul class="space-y-2 p-1">
	{#each current_tm.machine.states as state, state_idx}
		{#each current_tm.machine.alphabet as symbol, symbol_idx}
			{#if state_idx != current_tm.machine.accept_state && state_idx != current_tm.machine.reject_state}
				{@const transition = state.transitions[symbol_idx]}
				<li class="w-fit flex flex-row items-center justify-center gap-2 h-8">
					{state.name}, {symbol} ->
					{#if transition !== null}
						<!-- {transition.to_state.name}, {transition.write_symbol}, {transition.direction} -->
						<select value={current_tm.machine.states.indexOf(transition.to_state)} class="p-1 bg-white" onchange={(event: Event) => {
							current_tm.edit_transition(
								state,
								symbol_idx,
								{ to_state: current_tm.machine.states[event.target?.value], write_symbol: transition.write_symbol, direction: transition.direction } as MachineTransition
							);
						}}>
							{#each current_tm.machine.states as other_states, q_idx}
								<option value={q_idx}>{other_states.name}</option>
							{/each}
						</select>
						<select value={transition.write_symbol} class="p-1 bg-white" onchange={(event: Event) => {
							current_tm.edit_transition(
								state,
								symbol_idx,
								{ to_state: transition.to_state, write_symbol: event.target?.value, direction: transition.direction } as MachineTransition
							);
						}}>
							{#each current_tm.machine.alphabet as other_symbols}
								<option value={other_symbols}>{other_symbols}</option>
							{/each}
						</select>
						<select value={transition.direction + 1} class="p-1 bg-white" onchange={(event: Event) => {
							current_tm.edit_transition(
								state,
								symbol_idx,
								// negative numbers break selects for some reason. So just offset up and then down
								// not a fix for more expressive TM but that can be fixed by making this a number input
								{ to_state: transition.to_state, write_symbol: transition.write_symbol, direction: event.target?.value - 1} as MachineTransition
							);
						}}>
							<option value={0}>Left</option>
							<option value={2}>Right</option>
						</select>
						<button
							class="border-[1px] p-1 border-black hover:bg-zinc-100"
							onclick={() => {
								current_tm.edit_transition(state, symbol_idx, null);
							}}><TrashSimple size={18} /></button
						>
					{:else}
						<button
							class="border-[1px] p-1 border-black hover:bg-zinc-100"
							onclick={() => {
								current_tm.edit_transition(state, symbol_idx, { to_state: state, write_symbol: current_tm.machine.alphabet[symbol_idx], direction: 1 } as MachineTransition);
							}}>No Transition</button
						>
					{/if}
				</li>
			{/if}
		{/each}
	{/each}
</ul>
