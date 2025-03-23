import TuringMachine2, { type MachineState, type MachineTransition } from './tm-machine2.svelte';
import TuringDiagram from './tm-diagram2.svelte';

type FileInfo = {
    identifier: string,
    description: string,
}

export default class TMFile2 {
    info: FileInfo;
    machine: TuringMachine2;
    diagram: TuringDiagram;
    computations: Array<string>;

    constructor(info: FileInfo, machine: TuringMachine2, diagram: TuringDiagram, computations: Array<string>) {
        this.info = info;
        this.machine = machine;
        this.diagram = diagram;
        this.computations = computations;
    }

    static default() {
        const machine = TuringMachine2.default();
        return new TMFile2(
            { identifier: "New TM", description: "" },
            machine, TuringDiagram.default(machine),
            [ machine.tape_alphabet[0] ].concat(machine.lang_alphabet.map((s) => s))
        );
    }

    add_state(new_state: string) { 
        this.machine.add_state(new_state);
        this.diagram.add_state(this.machine.states[this.machine.states.length - 1]);
    }
    edit_state(index: number, new_state: string) { this.machine.edit_state(index, new_state); }
    remove_state(index: number) {
        this.machine.remove_state(index);
        this.diagram.remove_state(index);
    }

    add_lang_symbol(new_symbol: string) {
        this.machine.add_lang_symbol(new_symbol);
        this.diagram.add_lang_symbol();
    }
    edit_lang_symbol(index: number, new_symbol: string) { this.machine.edit_lang_symbol(index, new_symbol); }
    remove_lang_symbol(index: number) {
        this.machine.remove_lang_symbol(index);
        this.diagram.remove_lang_symbol(index);
    }

    add_tape_symbol(new_symbol: string) {
        this.machine.add_tape_symbol(new_symbol);
        this.diagram.add_tape_symbol(this.machine.alphabet.indexOf(new_symbol));
    }
    edit_tape_symbol(index: number, new_symbol: string) { this.machine.edit_tape_symbol(index, new_symbol); }
    remove_tape_symbol(index: number) {
        this.machine.remove_tape_symbol(index);
        this.diagram.remove_tape_symbol(index);
    }

    edit_transition(state: MachineState, symbol_idx: number, value: MachineTransition | null) { state.transitions[symbol_idx] = value; }

    static fromJSON(obj: any) {
        const machine = TuringMachine2.fromJSON(obj.machine);
        return new TMFile2(
            obj.info,
            machine,
            TuringDiagram.fromJSON(obj.diagram, machine),
            obj.computations
        );
    }

    toJSON() {
        return {
            info: this.info,
            machine: this.machine.toJSON(),
            diagram: this.diagram.toJSON(),
            computations: this.computations,
        };
    }
}