export type TMTransition = {
    from_state: number;
    read_symbol: number;
    to_state: number;
    write_symbol: number;
    direction: number;
}

export default class TuringMachine {
    states: Array<string>;
    lang_alphabet: Array<string>;
    tape_alphabet: Array<string>; // blank symbol is tape_alphabet[0], and Union(tape, lang) = empty (i.e. not merged alphabets)
    alphabet: Array<string>; // Union(tape, lang)
    transitions: Array<TMTransition>;
    initial_state: number; // index into states
    accept_state: number; // index into states
    reject_state: number; // index into states

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