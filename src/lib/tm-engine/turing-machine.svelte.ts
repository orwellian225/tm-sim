export type Transition = [
	number, // current state
	number, // read symbol
	number, // direction
	number, // next state
	number, // write symbol
];

export class TuringMachine {
	identifier: string = $state("");

	states: Array<string> = $state([]);
	symbols: Array<string> = $state([]);
	language_symbols: Array<string> = $state([]);

	initial_state: number = $state(0);
	accept_state: number = $state(0);
	reject_state: number = $state(0);

	transitions: Array<Transition> = $state([]);

	// the first element of tape_symbols is the blank symbol
	constructor(states: Array<string>, language_symbols: Array<string>, tape_symbols: Array<string>, initial_state: number, accept_state: number, reject_state: number, transitions: Array<Transition>) {
		this.identifier = "New Turing Machine"

		this.states = states;
		this.symbols = [...tape_symbols, ...language_symbols];
		this.language_symbols = language_symbols;
		this.initial_state = initial_state;
		this.accept_state = accept_state;
		this.reject_state = reject_state;
		this.transitions = transitions;
	}

	direction_str(value: number): string {
		if (value < 0) {
			if (value < -1) {
				return `L^${-1 * value}`
			} else {
				return "L"
			}
		} else if (value > 0) {
			if (value > 1) {
				return `R^${value}`
			} else {
				return "R"
			}
		} else {
			return "S"
		}
	}
}
