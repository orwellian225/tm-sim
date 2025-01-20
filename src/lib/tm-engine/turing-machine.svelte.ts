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
	tape_symbols: Array<string> = $state([]);

	initial_state: number = $state(0);
	accept_state: number = $state(0);
	reject_state: number = $state(0);

	transitions: Array<Transition> = $state([]);

	// the first element of tape_symbols is the blank symbol
	constructor(states: Array<string>, language_symbols: Array<string>, tape_symbols: Array<string>, initial_state: number, accept_state: number, reject_state: number, transitions: Array<Transition>) {
		this.identifier = "New Turing Machine"

		this.states = states;
		this.symbols = [...tape_symbols, ...language_symbols];
		this.tape_symbols = tape_symbols;
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

	// ---------------------------------------------------------------------
	// States

	update_state_by_idx(state_idx: number, state: string) { this.states[state_idx] = state; }
	remove_state_by_idx(state_idx: number) { 
		if (this.initial_state == state_idx) { this.initial_state = 0; }
		if (this.accept_state == state_idx) { this.accept_state = 0; }
		if (this.reject_state == state_idx) { this.reject_state = 0; }

		const removed_transitions: Array<number> = [];
		for (let i = 0; i < this.transitions.length; ++i) {
			if (this.transitions[i][0] == state_idx || this.transitions[i][3] == state_idx) {
				removed_transitions.push(i);
			}
		}

		this.transitions = this.transitions.filter((_, index) => !removed_transitions.includes(index));
		this.states.splice(state_idx, 1); 
	}

	remove_state(state: string) { this.remove_state_by_idx(this.states.indexOf(state)); }
	update_state(old_state: string, new_state: string) { this.update_state_by_idx(this.states.indexOf(old_state), new_state); }
	add_state(state: string) { this.states.push(state); };

	// ---------------------------------------------------------------------
	// Language Symbols

	update_language_symbol_by_idx(symbol_idx: number, symbol: string) { this.language_symbols[symbol_idx] = symbol; this.symbols = [...this.tape_symbols, ...this.language_symbols]; };
	remove_language_symbol_by_idx(symbol_idx: number) {
		const removed_transitions: Array<number> = [];
		for (let i = 0; i < this.transitions.length; ++i) {
			if (this.transitions[i][1] == symbol_idx || this.transitions[i][4] == symbol_idx) {
				removed_transitions.push(i);
			}
		}

		this.transitions = this.transitions.filter((_, index) => !removed_transitions.includes(index));
		this.language_symbols.splice(symbol_idx, 1); 
		this.symbols = [...this.tape_symbols, ...this.language_symbols];
	};

	update_language_symbol(old_symbol: string, new_symbol: string) { this.update_language_symbol_by_idx(this.language_symbols.indexOf(old_symbol), new_symbol); };
	remove_language_symbol(symbol: string) { this.remove_language_symbol_by_idx(this.language_symbols.indexOf(symbol)); };
	add_language_symbol(symbol: string) {
		this.language_symbols.push(symbol);
		this.symbols = [...this.tape_symbols, ...this.language_symbols];
	};

	// ---------------------------------------------------------------------
	// Tape Symbols

	update_tape_symbol_by_idx(symbol_idx: number, symbol: string) { this.tape_symbols[symbol_idx] = symbol; this.symbols = [...this.tape_symbols, ...this.language_symbols]; };
	remove_tape_symbol_by_idx(symbol_idx: number) {
		if (symbol_idx == 0) { return; } // Can't delete the blank symbol

		const removed_transitions: Array<number> = [];
		for (let i = 0; i < this.transitions.length; ++i) {
			if (this.transitions[i][1] == symbol_idx || this.transitions[i][4] == symbol_idx) {
				removed_transitions.push(i);
			}
		}

		this.transitions = this.transitions.filter((_, index) => !removed_transitions.includes(index));
		this.tape_symbols.splice(symbol_idx, 1); 
		this.symbols = [...this.tape_symbols, ...this.language_symbols];
	};

	update_tape_symbol(old_symbol: string, new_symbol: string) { this.update_tape_symbol_by_idx(this.tape_symbols.indexOf(old_symbol), new_symbol); };
	remove_tape_symbol(symbol: string) { this.remove_tape_symbol_by_idx(this.tape_symbols.indexOf(symbol)); };
	add_tape_symbol(symbol: string) {
		this.tape_symbols.push(symbol);
		this.symbols = [...this.tape_symbols, ...this.language_symbols];
	};

	// ---------------------------------------------------------------------
	// All Symbols

	update_symbol_by_idx(symbol_idx: number, symbol: string) {
		if (symbol_idx < this.tape_symbols.length) {
			this.update_tape_symbol_by_idx(symbol_idx, symbol);
		} else {
			this.update_language_symbol_by_idx(symbol_idx - this.tape_symbols.length, symbol);
		}
	};
	remove_symbol_by_idx(symbol_idx: number) {
		if (symbol_idx < this.tape_symbols.length) {
			this.remove_tape_symbol_by_idx(symbol_idx);
		} else {
			this.remove_language_symbol_by_idx(symbol_idx - this.tape_symbols.length);
		}
	}

	update_symbol(old_symbol: string, new_symbol: string) { this.update_symbol_by_idx(this.symbols.indexOf(old_symbol), new_symbol); };
	remove_symbol(symbol: string) { this.remove_symbol_by_idx(this.symbols.indexOf(symbol)); };

	// ---------------------------------------------------------------------
	// Transitions
}
