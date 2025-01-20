import type { TuringMachine, Transition } from "./turing-machine.svelte";

// Manual Enum:
// 0 = executing
// 1 = accepted
// 2 = rejected
export type TMStatus = number;


export class TMComputation {
	tm: TuringMachine;
	input_str: string;
	// @ts-ignore
	tape: Array<number> = $state();
	// @ts-ignore
	head: number = $state();
	// @ts-ignore
	current_state: number = $state();
	// @ts-ignore
	status: TMStatus = $state(0);

	time_used: number = $state(0);
	space_used: number = $state(0);

	/// Potential Optimisations:
	/// ----------------------
	///	1. Cache instructions and transitions

	constructor(turing_machine: TuringMachine, input_str: string) {
		this.tm = turing_machine;
		this.input_str = input_str;
		this.reset();
	}

	reset = () => {
		this.head = 0;
		this.current_state = this.tm.initial_state;
		this.input_str = this.input_str;
		this.status = 0;

		this.tape = [];
		let potential_symbol: string = ""
		for (let i = 0; i < this.input_str.length; ++i) {
			potential_symbol += this.input_str[i];
			const symbol_idx = this.tm.symbols.indexOf(potential_symbol);
			if (symbol_idx != -1) {
				this.tape.push(symbol_idx);
				potential_symbol = "";
			}
		}

		this.time_used = 1;
		this.space_used = this.input_str.length > 0 ? this.input_str.length : 1;
	};

	step = () => {
		if (this.status != 0) {
			return;
		}

		const current_symbol = this.tape[this.head];

		// finding transition
		let trans: Transition;
		for (let i = 0; i < this.tm.transitions.length; ++i) {
			trans = this.tm.transitions[i];
			if (trans[0] == this.current_state && trans[1] == current_symbol)
				break
		}

		// An assumption made for this computation is that it is a deterministic turing machine
		// therefore every state & symbol pair will have a transition, and the trans variable will alwyas be defined
		// if an error is encountered here, there are problems elsewhere in the code
		// @ts-ignore
		const direction = trans[2];
		// @ts-ignore
		const next_state = trans[3];
		// @ts-ignore
		const write_symbol = trans[4];

		this.tape[this.head] = write_symbol;
		this.head += direction;
		this.current_state = next_state;

		this.time_used += 1;
		if (direction > 0 && this.head >= this.space_used) {
			this.space_used = this.head + direction;
		}

		if (this.head >= this.tape.length)
			this.tape = this.tape.concat(Array(this.tape.length * 2).fill(0))

		// One way tape
		if (this.head < 0)
			this.head = 0;


		if (next_state == this.tm.accept_state) {
			this.status = 1;
		}
		if (next_state == this.tm.reject_state) {
			this.status = 2;
		}
	}

	step_till_terminate = (delay = 100) => {
		while (this.status == 0) {
			this.step(); 
		}
	}

	print_tape = () => {
		return this.tape.map(idx => this.tm.symbols[idx]).join("");
	}
}
