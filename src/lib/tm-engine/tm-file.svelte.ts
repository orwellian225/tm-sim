import TuringMachine from "./tm-machine.svelte";

export default class TMFile {
    identifier: string = $state("");

    machine: TuringMachine = $state(new TuringMachine([], [], [], [], 0, 0, 0));
    computations: Array<string> = $state([]);
    diagram: Array<{x: number, y: number, fallback_transition_angles: Array<number> }> = $state([]); // Parallel array to machine.states

    constructor(identifier: string, machine: TuringMachine, computations: Array<string>, diagram: Array<{x: number, y: number, fallback_transition_angles: Array<number>}> | null = null) {
        this.identifier = identifier;
        this.machine = machine;
        this.computations = computations;

        if (diagram) {
            this.diagram = diagram;
        } else {
            this.diagram = [];
            const radius = (this.machine.states.length - 1) * 100;
            const angle = 2 * Math.PI / this.machine.states.length;
            for (let i = 0; i < this.machine.states.length; i++) {
                this.diagram.push({
                    x: radius * Math.cos(i * angle), 
                    y: radius * Math.sin(i * angle),
                    fallback_transition_angles: machine.alphabet.map((_, idx) => idx * 2 * Math.PI / machine.alphabet.length)
                });
            }
        }
    }

    add_computation(computation: string) { return this.computations.push(computation); }
    remove_computation(index: number) { this.computations.splice(index, 1); }

    add_diagram_point(point: {x: number, y: number, fallback_transition_angles: Array<number> }) { return this.diagram.push(point); }
    remove_diagram_point(index: number) { this.diagram.splice(index, 1); }

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
        this.diagram = obj.diagram;
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