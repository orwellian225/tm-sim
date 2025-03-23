import TuringMachine2, { type MachineState } from "./tm-machine2";

type DiagramTransition = {
    fallback_angle: number,
};
type DiagramState = {
    state: MachineState,
    position: Vec2D
    transitions: Array<DiagramTransition>
};

type Vec2D = { x: number, y: number };

export default class TuringDiagram {
    machine: TuringMachine2;
    states: Array<DiagramState>;

    constructor(machine: TuringMachine2, states: Array<Vec2D>, transitions: Array<number>) {
        this.machine = machine;
        this.states = states.map((state_pos, idx) =>
            ({ 
                position: state_pos, 
                state: machine.states[idx], 
                transitions: transitions.slice(
                    idx * machine.states.length * machine.alphabet.length, 
                    idx * machine.states.length * machine.alphabet.length + machine.alphabet.length, 
                ) .map((fallback_angle) => ({ fallback_angle }))
            })
        );
        
    }

    static default(machine: TuringMachine2): TuringDiagram {
        return new TuringDiagram(
            machine, 
            machine.states.map((_) => ({ x: 0, y: 0 })),
            machine.states.map((_) => machine.alphabet.map((_, idx) => 2 * Math.PI / machine.alphabet.length * idx)).flat()
        );
    }

    draw(ctx: CanvasRenderingContext2D): void {

    }

    add_state(state: MachineState) { this.states.push({ position: { x: 0, y: 0 }, state: state, transitions: [] }) }
    remove_state(index: number) { this.states.splice(index, 1); }

    add_lang_symbol() { this.states.forEach(state => state.transitions.push({ fallback_angle: 0 })); }
    remove_lang_symbol(index: number) { this.states.forEach(state => state.transitions.splice(index, 1)); } 

    add_tape_symbol(symbol_idx: number) { this.states.forEach(state => state.transitions.splice(symbol_idx, 0, { fallback_angle: 0 })); }
    remove_tape_symbol(index: number) { this.states.forEach(state => state.transitions.splice(index, 1)); } 

    toJSON() {
        return {
            states: this.states.map((state: DiagramState) => state.position),
            transitions: this.states.map((state: DiagramState) => state.transitions.map((transition: DiagramTransition) => transition.fallback_angle))
        };
    }

    static fromJSON(obj: any, machine: TuringMachine2) {
        return new TuringDiagram(machine, obj.states, obj.transitions);
    }
}