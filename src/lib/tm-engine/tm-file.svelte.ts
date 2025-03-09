import DiagramState, { DiagramTransition, type TransitionRenderPoint } from "./tm-diagram";
import TuringMachine from "./tm-machine.svelte";

export default class TMFile {
    identifier: string = $state("");

    machine: TuringMachine = $state(new TuringMachine([], [], [], [], 0, 0, 0));
    computations: Array<string> = $state([]);
    diagram: {
        states: Array<DiagramState>,
        transitions: Array<DiagramTransition>
    } = $state({ states: [], transitions: [] }); // Parallel array to machine.states

    constructor(identifier: string, machine: TuringMachine, computations: Array<string>, diagram: { states: Array<DiagramState>, transitions: Array<DiagramTransition> } | null = null) {
        this.identifier = identifier;
        this.machine = machine;
        this.computations = computations;

        if (diagram) {
            this.diagram = diagram;
        } else {
            const radius = 200;
            const position_angle = 2 * Math.PI / machine.states.length;
            this.diagram = {
                states: machine.states.map((obj, idx) => { 
                    return new DiagramState({
                        x: radius * Math.cos(position_angle * idx + Math.PI),
                        y: radius * Math.sin(position_angle * idx + Math.PI),
                    }, idx, machine);
                }),
                transitions: machine.transitions.map((obj, idx) => {
                    const origin_point: TransitionRenderPoint = {
                        state_position: {
                            x: radius * Math.cos(position_angle * obj.from_state + Math.PI),
                            y: radius * Math.sin(position_angle * obj.from_state + Math.PI),
                        },
                        radius: DiagramState.radius,
                        angle: obj.to_state != null && obj.to_state != obj.from_state ? Math.atan2(
                            radius * Math.sin(position_angle * obj.to_state + Math.PI) - radius * Math.sin(position_angle * obj.from_state + Math.PI),
                            radius * Math.cos(position_angle * obj.to_state + Math.PI) - radius * Math.cos(position_angle * obj.from_state + Math.PI),
                        ) : obj.read_symbol * 2 * Math.PI / machine.alphabet.length
                    };
                    const terminal_point: TransitionRenderPoint | null = obj.to_state != null ? {
                        state_position: {
                            x: radius * Math.cos(position_angle * obj.to_state + Math.PI),
                            y: radius * Math.sin(position_angle * obj.to_state + Math.PI),
                        },
                        radius: DiagramState.radius + 5,
                        angle: obj.to_state != obj.from_state ? Math.atan2(
                            radius * Math.sin(position_angle * obj.from_state + Math.PI) - radius * Math.sin(position_angle * obj.to_state + Math.PI),
                            radius * Math.cos(position_angle * obj.from_state + Math.PI) - radius * Math.cos(position_angle * obj.to_state + Math.PI),
                        ) : origin_point.angle + Math.PI / 3,
                    } : null;
                    return new DiagramTransition(
                        origin_point, terminal_point, obj.read_symbol * 2 * Math.PI / machine.alphabet.length, 
                        idx, this.machine
                    );
                })
            };
        }
    }

    add_computation(computation: string) { return this.computations.push(computation); }
    remove_computation(index: number) { this.computations.splice(index, 1); }

    add_state(name: string) {
        this.machine.states.push(name);
        this.diagram.states.push(new DiagramState({ x: 0, y: 0 }, this.machine.states.length - 1, this.machine));

        for (let symbol_idx = 0; symbol_idx < this.machine.alphabet.length; ++symbol_idx) {
            this.machine.transitions.push({
                from_state: this.machine.states.length - 1,
                read_symbol: symbol_idx,
                to_state: null,
                write_symbol: null,
                direction: null
            });

            const origin_point: TransitionRenderPoint = {
                state_position: { x: 0, y: 0 },
                radius: DiagramState.radius,
                angle: symbol_idx * 2 * Math.PI / this.machine.alphabet.length
            };
            this.diagram.transitions.push(new DiagramTransition(
                origin_point, null, 2 * Math.PI / this.machine.alphabet.length * symbol_idx,
                symbol_idx, this.machine
            ));
        }

    }
    edit_state(index: number, new_name: string) { this.machine.states[index] = new_name; }
    remove_state(index: number) {
        this.machine.states.splice(index, 1);
        this.diagram.states.splice(index, 1);

        const removed_transitions: Array<number> = [];
        for (let i = 0; i < this.machine.transitions.length; ++i) {
            if (this.machine.transitions[i].from_state == index)
                removed_transitions.push(i);
            if (this.machine.transitions[i].to_state == index) {
                this.machine.transitions[i].to_state = null;
                this.machine.transitions[i].write_symbol = null;
                this.machine.transitions[i].direction = null;
            }
        }

        this.machine.transitions = this.machine.transitions.filter((_, idx) => removed_transitions.indexOf(idx) == -1 ); // remove transitions not in array
        this.diagram.transitions = this.diagram.transitions.filter((_, idx) => removed_transitions.indexOf(idx) == -1 ); // remove transitions not in array
    }

    add_lang_symbol(symbol: string) {
        this.machine.lang_alphabet.push(symbol);
        this.machine.alphabet = [...this.machine.tape_alphabet, ...this.machine.lang_alphabet];
        for (let state_idx = 0; state_idx < this.machine.states.length; ++state_idx) {
            this.machine.transitions.push({
                from_state: state_idx,
                read_symbol: this.machine.alphabet.length - 1,
                to_state: null,
                write_symbol: null,
                direction: null
            });
            const origin_point: TransitionRenderPoint = {
                state_position: this.diagram.states[state_idx].position,
                radius: DiagramState.radius,
                angle: 0
            }
            this.diagram.transitions.push(new DiagramTransition(
                origin_point, null, 0,
                this.machine.transitions.length - 1, this.machine 
            ));
        }
    }
    edit_lang_symbol(index:number, symbol: string) { this.machine.lang_alphabet[index] = symbol; this.machine.alphabet = [...this.machine.tape_alphabet, ...this.machine.lang_alphabet]; }
    remove_lang_symbol(index: number) {
        this.machine.lang_alphabet.splice(index, 1);
        this.machine.alphabet = [...this.machine.tape_alphabet, ...this.machine.lang_alphabet];

        const removed_transitions: Array<number> = [];
        for (let i = 0; i < this.machine.transitions.length; ++i) {
            if (this.machine.transitions[i].read_symbol == index + this.machine.tape_alphabet.length)
                removed_transitions.push(i);
            if (this.machine.transitions[i].write_symbol == index + this.machine.tape_alphabet.length) {
                this.machine.transitions[i].to_state = null;
                this.machine.transitions[i].write_symbol = null;
                this.machine.transitions[i].direction = null;
                this.diagram.transitions[i].terminal_point = null;
            }
        }

        this.machine.transitions = this.machine.transitions.filter((_, idx) => removed_transitions.indexOf(idx) == -1 ); // remove transitions not in array
        this.diagram.transitions = this.diagram.transitions.filter((_, idx) => removed_transitions.indexOf(idx) == -1 ); // remove transitions not in array
    }

    add_tape_symbol(symbol: string) {
        for (let [i, transition] of this.machine.transitions.entries()) {
            if (transition.read_symbol >= this.machine.tape_alphabet.length)
                transition.read_symbol += 1;
            if (transition.write_symbol != null && transition.write_symbol >= this.machine.tape_alphabet.length)
                transition.write_symbol += 1;

            if (transition.to_state == null || transition.write_symbol == null || transition.direction == null)
                continue;

        }

        this.machine.tape_alphabet.push(symbol);
        this.machine.alphabet = [...this.machine.tape_alphabet, ...this.machine.lang_alphabet];
        for (let state_idx = 0; state_idx < this.machine.states.length; ++state_idx) {
            this.machine.transitions.push({
                from_state: state_idx,
                read_symbol: this.machine.tape_alphabet.length - 1,
                to_state: null,
                write_symbol: null,
                direction: null
            });
            const origin_point: TransitionRenderPoint = {
                state_position: this.diagram.states[state_idx].position,
                radius: DiagramState.radius,
                angle: 0
            }
            this.diagram.transitions.push(new DiagramTransition(
                origin_point, null, 0,
                this.machine.transitions.length - 1, this.machine 
            ));
        }
    }
    edit_tape_symbol(index:number, symbol: string) { this.machine.tape_alphabet[index] = symbol; this.machine.alphabet = [...this.machine.tape_alphabet, ...this.machine.lang_alphabet]; }
    remove_tape_symbol(index: number) {
        this.machine.tape_alphabet.splice(index, 1);
        this.machine.alphabet = [...this.machine.tape_alphabet, ...this.machine.lang_alphabet];

        const removed_transitions: Array<number> = [];
        for (let [i, transition] of this.machine.transitions.entries()) {
            if (this.machine.transitions[i].read_symbol == index)
                removed_transitions.push(i);
            if (transition.read_symbol >= this.machine.tape_alphabet.length)
                transition.read_symbol -= 1;
            if (transition.write_symbol != null && transition.write_symbol >= this.machine.tape_alphabet.length)
                transition.write_symbol -= 1;
            if (this.machine.transitions[i].write_symbol == index) {
                this.machine.transitions[i].to_state = null;
                this.machine.transitions[i].write_symbol = null;
                this.machine.transitions[i].direction = null;
                this.diagram.transitions[i].terminal_point = null;
            }
        }

        this.machine.transitions = this.machine.transitions.filter((_, idx) => removed_transitions.indexOf(idx) == -1 ); // remove transitions not in array
        this.diagram.transitions = this.diagram.transitions.filter((_, idx) => removed_transitions.indexOf(idx) == -1 ); // remove transitions not in array
    }

    update_diagram_state(state_idx: number, position: { x: number, y: number }) {
        for (let [i, diagram_transition] of this.diagram.transitions.entries()) {
            if ( diagram_transition.transition.from_state == state_idx ) {
                diagram_transition.origin_point.state_position = position;
                diagram_transition.refresh_angles();
            }
            if (diagram_transition.terminal_point != null && diagram_transition.transition.to_state == state_idx) {
                diagram_transition.terminal_point.state_position = position;
                diagram_transition.refresh_angles();
            }
        }
        this.diagram.states[state_idx].position = position;
    }

    download() {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this)));
        element.setAttribute('download', `${this.identifier}.json`);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();
        document.body.removeChild(element);
    }

    save() {
        const local_machines_json = localStorage.getItem("saved_machines");
        if (local_machines_json) {
            const local_machines = JSON.parse(local_machines_json);
            local_machines.push(JSON.stringify(this));
        } else {
            localStorage.setItem("saved_machines", JSON.stringify([JSON.stringify(this)]));
        }
    }

    load(obj: any) {
        this.identifier = obj.identifier;
        this.machine = TuringMachine.fromJSON(obj.machine);
        this.computations = obj.computations;
        this.diagram = {
            states: obj.diagram.states.map((obj, idx) => DiagramState.fromJSON(this.machine, obj, idx)),
            transitions: obj.diagram.transitions.map((obj, idx) => DiagramTransition.fromJSON(this.machine, obj, idx))
        };
    }

    export_transition_table({
        transition_seperator = ";\n",
        field_seperator = "#", 
        base = 10 , // print as base n
        state_counter = false , // print as state as index or as state name
        symbol_counter = false, // print as symbol as index or as symbol
        direction_symbol = true // print direction as L, S, R or as -1, 0, 1
    }) {
        let table = this.machine.transitions.map((transition) => {
            return [
                state_counter ? transition.from_state.toString(base) : this.machine.states[transition.from_state],
                symbol_counter ? transition.read_symbol.toString(base) : this.machine.alphabet[transition.read_symbol],
                state_counter ? transition.to_state.toString(base) : this.machine.states[transition.to_state],
                symbol_counter ? transition.write_symbol.toString(base) : this.machine.alphabet[transition.write_symbol],
                direction_symbol ? ["L", "S", "R"][transition.direction + 1] : transition.direction.toString(base)
            ].join(field_seperator);
        }).join(transition_seperator);
        table += transition_seperator;

        return table;
    }

    toJSON(key: string) {
        return {
            identifier: this.identifier,
            machine: this.machine.toJSON(key),
            computations: this.computations,
            diagram: this.diagram
        };
    }

    static fromJSON(obj: any) {
        return new TMFile(
            obj.identifier,
            TuringMachine.fromJSON(obj.machine),
            obj.computations,
            obj.diagram
        );
    }
}