import TuringMachine from "./tm-machine.svelte"
import type { TMTransition } from "./tm-machine.svelte";

export default class TMComputation {

    machine: TuringMachine = $state(new TuringMachine([], [], [], [], -1, -1, -1));
    input_str: string = $state("");

    tape: Array<number> = $state([]);
    head: number = $state(0);
    state: number = $state(-1);

    status: number = $state(0); // 0: running, 1: accepted, 2: rejected
    resources: {
        time: number,
        space: number
    } = $state({ time: 0, space: 0 });
    

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

        this.resources = { 
            time: 1, 
            space:  this.input_str.length > 0 ? this.input_str.length : 1
        };
    }

    step() {
        if (this.status != 0) return;

        let trans: TMTransition | null = null
		for (let i = 0; i < this.machine.transitions.length; ++i) {
			trans = this.machine.transitions[i];
            if (trans.from_state == this.state && trans.read_symbol == this.tape[this.head])
                break;
		}

        if (!trans) {
            this.status = -1;
            return;
        }

        this.tape[this.head] = trans.write_symbol;
        this.head += trans.direction;
        this.state = trans.to_state;

        this.resources.time++;
        if (trans.direction > 0 && this.head >= this.resources.space)
            this.resources.space = this.head + trans.direction;

        if (this.head >= this.tape.length)
			this.tape = this.tape.concat(Array(this.tape.length * 2).fill(0))

        // One way tape
        if (this.head < 0)
            this.head = 0;

        if (trans.to_state == this.machine.accept_state)
            this.status = 1;

        if (trans.to_state == this.machine.reject_state)
            this.status = 2;
    }

    step_until_halt() {
        while (this.status == 0)
            this.step();
    }
}
