import TuringMachine from "./tm-machine.svelte"
import { TMTransition } from "./tm-machine.svelte";

export default class TMComputation {

    machine: TuringMachine;
    input_str: string;

    tape: Array<number>;
    head: number;
    state: number;

    status: number; // 0: running, 1: accepted, 2: rejected
    resources: {
        time: number,
        space: number
    }
    

    constructor(machine: TuringMachine, input_str: string) {
        this.machine = machine;
        this.input_str = input_str;
        this.reset();
    }

    reset() {
        this.head = 0;
		this.state = this.machine.initial_state;
		this.status = 0;

		this.tape = [];
		let potential_symbol: string = ""
		for (let i = 0; i < this.input_str.length; ++i) {
			potential_symbol += this.input_str[i];
			const symbol_idx = this.machine.alphabet.indexOf(potential_symbol);
			if (symbol_idx != -1) {
				this.tape.push(symbol_idx);
				potential_symbol = "";
			}
		}

		this.resources.time = 1;
		this.resources.space = this.input_str.length > 0 ? this.input_str.length : 1;
    }

    step() {
        if (this.status != 0) return;

        let trans: TMTransition;
		for (let i = 0; i < this.machine.transitions.length; ++i) {
			trans = this.machine.transitions[i];
            if (trans.from_state == this.state && trans.read_symbol == this.tape[this.head])
                break;
		}

        this.resources.time++;
        if (trans.direction > 0 && this.head >= this.resources.space)
            this.resources.space = this.head + trans.direction;

        if (this.head >= this.tape.length)
			this.tape = this.tape.concat(Array(this.tape.length * 2).fill(0))

        // One way tape
        if (this.head < 0)
            this.head = 0;

        if (trans.next_state == this.machine.accept_state)
            this.status = 1;

        if (trans.next_state == this.machine.reject_state)
            this.status = 2;
    }

    step_until_halt() {
        while (this.status == 0)
            this.step();
    }
}
