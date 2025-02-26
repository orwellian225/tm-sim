import { TuringMachine } from "./turing-machine.svelte";

export default class TuringMachineData {
    identifier: string = $state("");
    tm: TuringMachine = $state(new TuringMachine([], [], [], 0, 0, 0, []));
    computation_cases: Array<string> = $state([]);
    diagram_positions: Array<{ x: number, y: number }> = $state([]);

    constructor(identifier: string, tm: TuringMachine) {
        this.identifier = identifier;
        this.tm = tm;
    }

    add_computation_case(computation_case: string) { this.computation_cases.push(computation_case); }
    remove_computation_case(computation_case: string) { this.computation_cases.splice(this.computation_cases.indexOf(computation_case), 1); }

    toJSON(key: any) {
        return {
            identifier: this.identifier,
            tm: this.tm,
            computation_cases: this.computation_cases,
            diagram_positions: this.diagram_positions
        };
    }
} 