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
            this.diagram = {
                states: this.build_states(),
                transitions: this.build_transitions()
            };
        }
    }

    build_states(from_scratch: boolean = true): Array<DiagramState> {
        const radius = 200;
        const position_angle = 2 * Math.PI / this.machine.states.length;
        return this.machine.states.map((obj, idx) => { 
            return new DiagramState({
                x: from_scratch ? radius * Math.cos(position_angle * idx + Math.PI) : this.diagram.states[idx].position.x,
                y: from_scratch ? radius * Math.sin(position_angle * idx + Math.PI) : this.diagram.states[idx].position.y,
            }, idx, this.machine);
        });
    }

    build_transitions(from_scratch: boolean = true): Array<DiagramTransition> {
        const radius = 200;
        const position_angle = 2 * Math.PI / this.machine.states.length;
        return this.machine.transitions.map((obj, idx) => {
            const origin_point: TransitionRenderPoint = {
                state_position: {
                    x: radius * Math.cos(position_angle * obj.from_state + Math.PI),
                    y: radius * Math.sin(position_angle * obj.from_state + Math.PI),
                },
                radius: DiagramState.radius,
                angle: obj.to_state != null && obj.to_state != obj.from_state ? Math.atan2(
                    radius * Math.sin(position_angle * obj.to_state + Math.PI) - radius * Math.sin(position_angle * obj.from_state + Math.PI),
                    radius * Math.cos(position_angle * obj.to_state + Math.PI) - radius * Math.cos(position_angle * obj.from_state + Math.PI),
                ) : obj.read_symbol * 2 * Math.PI / this.machine.alphabet.length
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
                origin_point, terminal_point, from_scratch ? obj.read_symbol * 2 * Math.PI / this.machine.alphabet.length : this.diagram.transitions[idx].fallback_angle, 
                idx, this.machine
            );
        })
    }

    static default() {
        return new TMFile(
            "New TM",
            new TuringMachine(
                // Reject empty string, accept any other string
                [ "qI", "qA", "qR" ],  ['0', '1'], ['_'],
                [
                    [ 0, 0, 2, 0, +1 ],
                    [ 0, 1, 0, 2, +1 ],
                    [ 0, 2, 1, 2, +1 ],
                    [ 1, 0, null, null, null ],
                    [ 1, 1, null, null, null ],
                    [ 1, 2, null, null, null ],
                    [ 2, 0, null, null, null ],
                    [ 2, 1, null, null, null ],
                    [ 2, 2, null, null, null ]
                ].map(t => TuringMachine.transition_array_to_obj(t)),
                0, 1, 2
            ),
            [ "_", "0", "1" ],
        )
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
                state_position: this.diagram.states[this.machine.states.length - 1].position,
                radius: DiagramState.radius,
                angle: symbol_idx * 2 * Math.PI / this.machine.alphabet.length
            };
            this.diagram.transitions.push(new DiagramTransition(
                origin_point, null, 2 * Math.PI / this.machine.alphabet.length * symbol_idx,
                this.machine.transitions.length - 1, this.machine
            ));
        }

    }
    edit_state(index: number, new_name: string) { this.machine.states[index] = new_name; }
    remove_state(index: number) {
        this.machine.states.splice(index, 1);
        this.diagram.states.splice(index, 1);

        // decrement the state index of every state after the removed state
        if (this.machine.accept_state > index) { this.machine.accept_state -= 1; }
        if (this.machine.reject_state > index) { this.machine.accept_state -= 1; }
        if (this.machine.initial_state > index) { this.machine.accept_state -= 1; }

        for (let i = index; i < this.machine.states.length; ++i) {
             this.diagram.states[i].state_idx -= 1;
             this.diagram.states[i].update_modifiers();
        }

        let left_shift_amount = 0;
        const removed_transitions: Array<number> = [];
        for (let [i, transition] of this.machine.transitions.entries()) { 
            if (transition.from_state == index) {
                removed_transitions.push(i);
                left_shift_amount += 1;
                continue;
            } else {
                this.diagram.transitions[i].update_index(i - left_shift_amount);
            }

            if (transition.from_state > index) { this.machine.transitions[i].from_state -= 1; }
            if (transition.to_state != null && transition.to_state > index) { transition.to_state -= 1; }
                
            if (this.machine.transitions[i].to_state == index) {
                this.machine.transitions[i].to_state = null;
                this.machine.transitions[i].write_symbol = null;
                this.machine.transitions[i].direction = null;
                this.diagram.transitions[i].terminal_point = null;
            }
        }

        this.machine.transitions = this.machine.transitions.filter((val, idx) => removed_transitions.indexOf(idx) == -1);
        this.diagram.transitions = this.diagram.transitions.filter((val, idx) => removed_transitions.indexOf(idx) == -1);
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

        const removed_transitions: Array<number> = [];
        let left_shift_amount = 0;
        for (let [i, transition] of this.machine.transitions.entries()) { 
            if (this.machine.transitions[i].read_symbol == index + this.machine.tape_alphabet.length) {
                removed_transitions.push(i);
                left_shift_amount += 1;
                continue;
            } else {
                this.diagram.transitions[i].update_index(i - left_shift_amount);
            }

            if (this.machine.transitions[i].write_symbol == index + this.machine.tape_alphabet.length) {
                this.machine.transitions[i].to_state = null;
                this.machine.transitions[i].write_symbol = null;
                this.machine.transitions[i].direction = null;
                this.diagram.transitions[i].terminal_point = null;
            }

            if (transition.read_symbol > index + this.machine.tape_alphabet.length)
                transition.read_symbol -= 1;
            if (transition.write_symbol != null && transition.write_symbol > index + this.machine.tape_alphabet.length)
                transition.write_symbol -= 1;
        }
        this.machine.transitions = this.machine.transitions.filter((val, idx) => removed_transitions.indexOf(idx) == -1);
        this.diagram.transitions = this.diagram.transitions.filter((val, idx) => removed_transitions.indexOf(idx) == -1);
        this.machine.lang_alphabet.splice(index, 1);
        this.machine.alphabet = [...this.machine.tape_alphabet, ...this.machine.lang_alphabet];
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
        const removed_transitions: Array<number> = [];
        let left_shift_amount = 0;
        for (let [i, transition] of this.machine.transitions.entries()) { 
            if (this.machine.transitions[i].read_symbol == index) {
                removed_transitions.push(i);
                left_shift_amount += 1;
                continue;
            } else {
                this.diagram.transitions[i].update_index(i - left_shift_amount);
            }

            if (this.machine.transitions[i].write_symbol == index) {
                this.machine.transitions[i].to_state = null;
                this.machine.transitions[i].write_symbol = null;
                this.machine.transitions[i].direction = null;
                this.diagram.transitions[i].terminal_point = null;
            }
            if (transition.read_symbol >= this.machine.tape_alphabet.length)
                transition.read_symbol -= 1;
            if (transition.write_symbol != null && transition.write_symbol >= this.machine.tape_alphabet.length)
                transition.write_symbol -= 1;
        }

        this.machine.transitions = this.machine.transitions.filter((val, idx) => removed_transitions.indexOf(idx) == -1);
        this.diagram.transitions = this.diagram.transitions.filter((val, idx) => removed_transitions.indexOf(idx) == -1);
        this.machine.tape_alphabet.splice(index, 1);
        this.machine.alphabet = [...this.machine.tape_alphabet, ...this.machine.lang_alphabet];
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
        const diagram_states = obj.diagram.states.map((val, idx) => DiagramState.fromJSON(this.machine, val, idx));
        this.diagram = {
            states: diagram_states,
            transitions: obj.diagram.transitions.map((obj, idx) => DiagramTransition.fromJSON(this.machine, diagram_states, obj, idx))
        };
    }

    export_transition_table({
        num_transitions = 0,
        transition_seperator = ";",
        field_seperator = "#", 
        state_base = 10, // print as base n
        symbol_base = 10, // print as base n
        direction_base = 10,
        state_counter = false , // print as state as index or as state name
        symbol_counter = false, // print as symbol as index or as symbol
        direction_symbol = true // print direction as L, S, R or as -1, 0, 1
    }) {
        if (num_transitions <= 0)
            num_transitions = this.machine.transitions.length;

        let table = this.machine.transitions.slice(0, num_transitions).filter((val) => val.to_state != null).map((transition) => {
            return [
                state_counter ? transition.from_state.toString(state_base) : this.machine.states[transition.from_state],
                symbol_counter ? transition.read_symbol.toString(symbol_base) : this.machine.alphabet[transition.read_symbol],
                state_counter ? transition.to_state.toString(state_base) : this.machine.states[transition.to_state],
                symbol_counter ? transition.write_symbol.toString(symbol_base) : this.machine.alphabet[transition.write_symbol],
                direction_symbol ? ["L", "S", "R"][transition.direction + 1] : transition.direction.toString(direction_base)
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
            diagram: {
                states: this.diagram.states.map((val) => val.toJSON(key)),
                transitions: this.diagram.transitions.map((val) => val.toJSON(key))
            }
        };
    }

    static fromJSON(obj: any) {
        const machine = TuringMachine.fromJSON(obj.machine);
        const diagram_states = obj.diagram.states.map((val, idx) => DiagramState.fromJSON(machine, val, idx));
        return new TMFile(
            obj.identifier,
            machine, 
            obj.computations,
            {
                states: diagram_states,
                transitions: obj.diagram.transitions.map((val, idx) => DiagramTransition.fromJSON(machine, diagram_states, val, idx))
            }
        );
    }
}