import type { MachineTransition } from "./tm-machine2.svelte";
import TuringMachine2 from "./tm-machine2.svelte";

export default class TuringComputation {
    machine: TuringMachine2;
    input_str: string;

    // @ts-ignore
    tape: Array<number>
    // @ts-ignore
    head: number;
    // @ts-ignore
    state: MachineState = $state();

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

    constructor(machine: TuringMachine2, input_str: string) {
        this.machine = machine;
        this.input_str = input_str;
        this.reset();
    }

    reset() {
        this.head = 0;
		this.state = this.machine.states[this.machine.initial_state];
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

        const trans: MachineTransition | null = this.state.transitions[this.tape[this.head]];

        // @ts-ignore
        if (trans == null) {
            this.status = -1;
            return;
        }

        this.tape[this.head] = this.machine.alphabet.indexOf(trans.write_symbol);
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

        if (this.machine.states[this.machine.accept_state] == trans.to_state)
            this.status = 1;

        if (this.machine.states[this.machine.reject_state] == trans.to_state)
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