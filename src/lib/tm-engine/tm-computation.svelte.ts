import TuringMachine from "./tm-machine.svelte"
import type { TMTransition } from "./tm-machine.svelte";

export default class TMComputation {

    machine: TuringMachine;
    input_str: string;

    tape: Array<number>;
    head: number;
    state: number = $state(0);

    status: number = $state(0); // 0: running, 1: accepted, 2: rejected, 3: timeout_terminated
    resources: {
        time: number,
        space: number
    } = $state({ time: 0, space: 0 });
    info: {
        // Info Codes
        // 0: None - no information
        // 1: Error - something has gone wrong
        code: number, 
        message: string,
    } = $state({ code: 0, message: "" })
    

    constructor(machine: TuringMachine, input_str: string) {
        this.machine = machine;
        this.input_str = input_str;
        this.reset();
    }

    reset() {
        this.head = 0;
		this.state = this.machine.initial_state;
		this.status = 0;
        this.info = { code: 0, message: "" };

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

        let trans: TMTransition;
		for (let i = 0; i < this.machine.transitions.length; ++i) {
			trans = this.machine.transitions[i];
            if (trans.from_state == this.state && trans.read_symbol == this.tape[this.head])
                break;
		}

        // @ts-ignore
        if (trans == null || trans.direction == null || trans.write_symbol == null || trans.to_state == null) {
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
			this.tape = this.tape.concat(Array(this.tape.length).fill(0))

        if (this.head < 0) {
            this.head = this.tape.length + trans.direction;
            this.tape = Array(this.tape.length).fill(0).concat(this.tape)
        }

        if (trans.to_state == this.machine.accept_state)
            this.status = 1;

        if (trans.to_state == this.machine.reject_state)
            this.status = 2;
    }

    step_for(num_steps: number) {
        for (let i = 0; i < num_steps; ++i) {
            if (this.status != 0) return;

            this.step();
        }
        this.info.code = 1;
        this.info.message = `Timeout - Exceeded step limit of ${num_steps}`;
    }

    // WARNING: Inifinitely running Turing Machines will cause the tab to hang
    // DO NOT USE
    // Rather use step_for with a large number of steps
    step_until_halt() {
        while (this.status == 0)
            this.step();
    }
}
