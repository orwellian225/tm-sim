import type { TuringMachine } from "./turing-machine";

export class TMComputation {
	tm: TuringMachine;
	input_str: string;
	tape: Array<string>;
	head: number;
	current_state: number;

	constructor(turing_machine: TuringMachine, input_str: string) {
		this.head = 0;
		this.current_state = turing_machine.initial_state;
		this.tm = turing_machine;
		this.input_str = input_str;

		this.tape = []
		let potential_symbol: string = ""
		for (let i = 0; i < input_str.length; ++i) {
			potential_symbol += input_str[i];
			if (this.tm.symbols.includes(potential_symbol)) {
				this.tape.push(potential_symbol);
				potential_symbol = "";
			}
		}

		console.log(this.tape)
	}
}
