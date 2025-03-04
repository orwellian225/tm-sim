export type TMTransition = {
    from_state: number;
    read_symbol: number;
    to_state: number;
    write_symbol: number;
    direction: number;
}

export default class TuringMachine {
    states: Array<string> = $state([]);
    lang_alphabet: Array<string> = $state([]);
    tape_alphabet: Array<string> = $state([]); // blank symbol is tape_alphabet[0], and Union(tape, lang) = empty (i.e. not merged alphabets)
    alphabet: Array<string> = $state([]); // Union(tape, lang)
    transitions: Array<TMTransition> = $state([]);
    initial_state: number = $state(-1); // index into states
    accept_state: number = $state(-1); // index into states
    reject_state: number = $state(-1); // index into states

    constructor(states: Array<string>, lang_alphabet: Array<string>, tape_alphabet: Array<string>, transitions: Array<TMTransition>, initial_state: number, accept_state: number, reject_state: number) {
        this.states = states;
        this.lang_alphabet = lang_alphabet;
        this.tape_alphabet = tape_alphabet;
        this.alphabet = [...tape_alphabet, ...lang_alphabet];
        this.transitions = transitions;
        this.initial_state = initial_state;
        this.accept_state = accept_state;
        this.reject_state = reject_state;
    }

    add_state(name: string) { this.states.push(name); }
    edit_state(index: number, new_name: string) { this.states[index] = new_name; }
    remove_state(index: number) { this.states.splice(index, 1); }

    add_lang_symbol(symbol: string) { this.lang_alphabet.push(symbol); this.alphabet = [...this.tape_alphabet, ...this.lang_alphabet]; }
    edit_lang_symbol(index:number, symbol: string) { this.lang_alphabet[index] = symbol; this.alphabet = [...this.tape_alphabet, ...this.lang_alphabet]; }
    remove_lang_symbol(index:number) { this.lang_alphabet.splice(index, 1); this.alphabet = [...this.tape_alphabet, ...this.lang_alphabet]; }

    add_tape_symbol(symbol: string) { this.tape_alphabet.push(symbol); this.alphabet = [...this.tape_alphabet, ...this.lang_alphabet]; }
    edit_tape_symbol(index:number, symbol: string) { this.tape_alphabet[index] = symbol; this.alphabet = [...this.tape_alphabet, ...this.lang_alphabet]; }
    remove_tape_symbol(index:number) {
        if (index == 0)
            return; // can't remove blank symbol

        this.tape_alphabet.splice(index, 1); this.alphabet = [...this.tape_alphabet, ...this.lang_alphabet];
    }

    find_transition(state_idx: number, symbol_idx: number): TMTransition | null {
		for (let i = 0; i < this.transitions.length; ++i)
			if (this.transitions[i].from_state == state_idx && this.transitions[i].read_symbol == symbol_idx)
				return this.transitions[i];

		return null;
    }

    toJSON(key: string) {
        return {
            states: this.states,
            lang_alphabet: this.lang_alphabet,
            tape_alphabet: this.tape_alphabet,
            transitions: this.transitions.map((transition: TMTransition) => TuringMachine.transition_obj_to_array(transition)),
            initial_state: this.initial_state,
            accept_state: this.accept_state,
            reject_state: this.reject_state
        }
    }

    static fromJSON(obj: any) {
        return new TuringMachine(
            obj.states, obj.lang_alphabet, obj.tape_alphabet,
            obj.transitions.map((transition: Array<number>) => TuringMachine.transition_array_to_obj(transition)),
            obj.initial_state, obj.accept_state, obj.reject_state
        )
    }

    static transition_obj_to_array(obj: TMTransition) {
        return [obj.from_state, obj.read_symbol, obj.to_state, obj.write_symbol, obj.direction];
    }
    static transition_array_to_obj(array: Array<number>) {
        return {
            from_state: array[0],
            read_symbol: array[1],
            to_state: array[2],
            write_symbol: array[3],
            direction: array[4]
        }
    }
}
