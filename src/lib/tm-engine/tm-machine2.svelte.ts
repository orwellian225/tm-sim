export type MachineTransition = {
    to_state: MachineState,
    write_symbol: string,
    direction: number
}

export type MachineState = {
    name: string,
    transitions: Array<MachineTransition | null>
}

export default class TuringMachine2 {
    states: Array<MachineState> = $state([]);
    lang_alphabet: Array<string> = $state([]);
    tape_alphabet: Array<string> = $state([]);
    alphabet: Array<string> = $state([]);
    initial_state: number = $state(0);
    accept_state: number = $state(0);
    reject_state: number = $state(0);


    // A critical assumption here: A new Turing Machine is created with the states and symbols correctly synced with transitions
    constructor(
        states: Array<string>, 
        lang_alphabet: Array<string>, tape_alphabet: Array<string>,
        transitions: Array<{ from_state_idx: number, read_symbol_idx: number, transition : { to_state_idx: number, write_symbol_idx: number, integer_direction: number } | null  }>,
        initial_state: number, accept_state: number, reject_state: number 
    ) {
        this.states = [];
        this.alphabet = [];
        this.lang_alphabet = lang_alphabet;
        this.tape_alphabet = tape_alphabet;
        this.initial_state = initial_state;
        this.accept_state = accept_state;
        this.reject_state = reject_state;
        this.refresh_alphabet();

        // each state gets the transition per symbol, but as null
        for (const [_, state] of states.entries())
            this.states.push({
                name: state,
                transitions: new Array(this.alphabet.length).fill(null)
            }); 

        // now update the known transitions
        for (const [_, t] of transitions.entries()) {
            if (t.transition == null)
                continue;

            this.states[t.from_state_idx].transitions[t.read_symbol_idx] = {
                to_state: this.states[t.transition.to_state_idx],
                write_symbol: this.alphabet[t.transition.write_symbol_idx],
                direction: t.transition.integer_direction
            };
        }
    }

    static default(): TuringMachine2 {
        return new TuringMachine2(
            ["qI", "qA", "qR"],
            ["0", "1"], ["_"],
            [ 
                { from_state_idx: 0, read_symbol_idx: 0, transition: { to_state_idx: 1, write_symbol_idx: 0, integer_direction: 1 } }, 
                { from_state_idx: 0, read_symbol_idx: 1, transition: { to_state_idx: 0, write_symbol_idx: 1, integer_direction: 1 } }, 
                { from_state_idx: 0, read_symbol_idx: 2, transition: { to_state_idx: 2, write_symbol_idx: 2, integer_direction: -1 }}, 
                { from_state_idx: 1, read_symbol_idx: 0, transition: null }, 
                { from_state_idx: 1, read_symbol_idx: 1, transition: null }, 
                { from_state_idx: 1, read_symbol_idx: 2, transition: null }, 
                { from_state_idx: 2, read_symbol_idx: 0, transition: null }, 
                { from_state_idx: 2, read_symbol_idx: 1, transition: null }, 
                { from_state_idx: 2, read_symbol_idx: 2, transition: null }, 
            ],
            0, 1, 2
        );
    }

    refresh_alphabet(): void { this.alphabet = [...this.tape_alphabet, ...this.lang_alphabet]; }

    add_state(state: string) {
        this.states.push({
            name: state,
            transitions: new Array(this.alphabet.length).fill(null)
        });
    }
    edit_state(index: number, new_name: string) { this.states[index].name = new_name; }
    remove_state(index: number) {
        this.states.forEach((state) => state.transitions = state.transitions.filter((t, idx) => this.states[index] != t?.to_state));
        this.states.splice(index, 1);
    }

    add_lang_symbol(symbol: string) { 
        this.lang_alphabet.push(symbol); 
        this.refresh_alphabet();
        this.states.forEach(state => state.transitions.push(null));
    }
    edit_lang_symbol(index: number, new_symbol: string) { this.lang_alphabet[index] = new_symbol; }
    remove_lang_symbol(index: number) {
        this.states.forEach(state => {
            console.log(state.transitions)
            state.transitions = state.transitions.map((t, idx) => this.alphabet[index + this.tape_alphabet.length] != t?.write_symbol ? t : null)
            state.transitions.splice(index + this.tape_alphabet.length, 1); 
        });
        this.lang_alphabet.splice(index, 1);
        this.refresh_alphabet();
    }

    add_tape_symbol(symbol: string) { 
        this.tape_alphabet.push(symbol); 
        this.refresh_alphabet();
        this.states.forEach(state => state.transitions.splice(this.alphabet.indexOf(symbol), 0, null));
    }
    edit_tape_symbol(index: number, new_symbol: string) { this.tape_alphabet[index] = new_symbol; }
    remove_tape_symbol(index: number) {
        this.states.forEach(state => {
            state.transitions = state.transitions.map((t, idx) => this.alphabet[index] != t?.write_symbol ? t : null)
            state.transitions.splice(index, 1); 
        });
        this.tape_alphabet.splice(index, 1);
        this.refresh_alphabet();
    }

    toJSON() {
        return {
            states: this.states.map((state: MachineState) => state.name),
            lang_alphabet: this.lang_alphabet,
            tape_alphabet: this.tape_alphabet,
            transitions: this.states.map((state, state_i) =>
                state.transitions.map((t, symbol_i) =>
                    [
                        state_i, symbol_i, 
                        t == null ? null : this.states.indexOf(t.to_state),
                        t == null ? null : this.alphabet.indexOf(t.write_symbol),
                        t == null ? null : t.direction,
                    ]
            )).flat(),
            initial_state: this.initial_state,
            accept_state: this.accept_state,
            reject_state: this.reject_state
        }
    }

    static fromJSON(obj: any) {
        obj = JSON.parse(obj);
        return new TuringMachine2(
            obj.states, obj.lang_alphabet, obj.tape_alphabet,
            obj.transitions.map((t: [number, number, number | null, number | null, number | null]) => { return {
                from_state_idx: t[0],
                read_symbol_idx: t[1],
                transition: t[2] == null ? null : {
                    to_state_idx: t[2],
                    write_symbol_idx: t[3],
                    integer_direction: t[4]
                }
            }}),
            obj.initial_state, obj.accept_state, obj.reject_state
        );
    }
}