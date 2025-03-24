import TuringMachine2, { type MachineState, type MachineTransition } from "./tm-machine2.svelte";

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
            machine.states.map((_, idx) => ({ 
                x: 200 * Math.cos(idx * 2 * Math.PI / machine.states.length), 
                y: 200 * Math.sin(idx * 2 * Math.PI / machine.states.length), 
            })),
            machine.states.map((_) => machine.alphabet.map((_, idx) => 2 * Math.PI / machine.alphabet.length * idx)).flat()
        );
    }

    draw(ctx: CanvasRenderingContext2D,
        { states = true, transitions = true, state_modifiers = true } = {}
    ): void {

        if (states) {
            this.states.forEach((state, idx) => this.draw_state(ctx, state) );
        }

        if (state_modifiers) {
            this.draw_state_modifier( ctx, this.states[this.machine.initial_state], 1, "#2b7fff");
            this.draw_state_modifier(ctx, this.states[this.machine.accept_state], 
                // if true, then count = 2
                1 + (+(this.machine.accept_state == this.machine.initial_state)), 
                "#00c850"
            );
            this.draw_state_modifier(ctx, this.states[this.machine.reject_state], 
                // if one is true, then count = 2, if both are true then count = 3
                1 + (+(this.machine.reject_state == this.machine.initial_state)) + (+(this.machine.reject_state == this.machine.accept_state)),  
                "#fb2c36"
            );
        }

        if (transitions) {
            this.states.forEach((state, q_idx) => {
                    let merge_counts: any = {};
                    this.machine.states[q_idx].transitions.forEach((transition, s_idx) => {
                        if (transition != null)
                            merge_counts[transition?.to_state.name] = merge_counts[transition?.to_state.name] + 1 || 0;
                    });
                    state.transitions.forEach((transition, s_idx) => {
                        this.draw_transition(ctx, q_idx, s_idx, transition, merge_counts[this.machine.states[q_idx].transitions[s_idx]?.to_state.name] - s_idx);
                    })
            });
        }
    }

    static state_radius = 50;
    static handle_radius = 8;

    draw_state(ctx: CanvasRenderingContext2D, diagram_state: DiagramState) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.beginPath();
            ctx.arc(
                diagram_state.position.x, diagram_state.position.y, TuringDiagram.state_radius,
                0, 2 * Math.PI
            );
            ctx.stroke();
        ctx.closePath();

        ctx.font = "1em sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(diagram_state.state.name, diagram_state.position.x, diagram_state.position.y);
    }

    draw_state_modifier(ctx: CanvasRenderingContext2D, diagram_state: DiagramState, count: number, colour: string) {
        ctx.strokeStyle = colour;
        ctx.lineWidth = 4;
        ctx.beginPath();
            ctx.arc(
                diagram_state.position.x, diagram_state.position.y, TuringDiagram.state_radius - count * 5,
                0, 2 * Math.PI
            );
            ctx.stroke();
        ctx.closePath();
    }

    draw_transition(ctx: CanvasRenderingContext2D, state_idx: number, symbol_idx: number, transition: DiagramTransition, merge_count: number = 0) {
        const machine_transition: MachineTransition | null = this.machine.states[state_idx].transitions[symbol_idx];

        if (machine_transition == null) {
            const diagram_state: DiagramState = this.states[state_idx];
            const origin_point: Vec2D = {
                x: diagram_state.position.x + TuringDiagram.state_radius * Math.cos(transition.fallback_angle),
                y: diagram_state.position.y + TuringDiagram.state_radius * Math.sin(transition.fallback_angle)
            }
            const text_point: Vec2D = {
                x: origin_point.x + TuringDiagram.handle_radius * 3 * Math.cos(transition.fallback_angle),
                y: origin_point.y + TuringDiagram.handle_radius * 3 * Math.sin(transition.fallback_angle),
            };

            this.draw_null_transition(ctx, origin_point, text_point, this.machine.alphabet[symbol_idx]);

        } else if (machine_transition.to_state == this.machine.states[state_idx]) {
            const diagram_state: DiagramState = this.states[state_idx];
            const origin: [ Vec2D, number ] = [ { 
                x: diagram_state.position.x + TuringDiagram.state_radius * Math.cos(transition.fallback_angle), 
                y: diagram_state.position.y + TuringDiagram.state_radius * Math.sin(transition.fallback_angle)
            }, transition.fallback_angle ]
            const terminal: [ Vec2D, number ] = [ { 
                x: diagram_state.position.x + 1.2 * TuringDiagram.state_radius * Math.cos(transition.fallback_angle + Math.PI / 3), 
                y: diagram_state.position.y + 1.2 * TuringDiagram.state_radius * Math.sin(transition.fallback_angle + Math.PI / 3)
            }, transition.fallback_angle + Math.PI / 3 ]

            this.draw_bezier_transition(ctx, origin, terminal, 0, {
                read_symbol: this.machine.alphabet[symbol_idx],
                write_symbol: machine_transition.write_symbol,
                string_direction: machine_transition.direction
            }, true);

        } else {
            const origin_diagram_state: DiagramState = this.states[state_idx];
            const terminal_diagram_state: DiagramState = this.states[this.machine.states.indexOf(machine_transition.to_state)];

            const origin_terminal: Vec2D = {
                x: origin_diagram_state.position.x - terminal_diagram_state.position.x,
                y: origin_diagram_state.position.y - terminal_diagram_state.position.y
            };
            const terminal_origin: Vec2D = {
                x: terminal_diagram_state.position.x - origin_diagram_state.position.x,
                y: terminal_diagram_state.position.y - origin_diagram_state.position.y
            };
            const origin_angle = Math.atan2(terminal_origin.y, terminal_origin.x);
            const terminal_angle = Math.atan2(origin_terminal.y, origin_terminal.x);

            const origin_point: Vec2D = {
                x: origin_diagram_state.position.x + TuringDiagram.state_radius * Math.cos(origin_angle),
                y: origin_diagram_state.position.y + TuringDiagram.state_radius * Math.sin(origin_angle)
            };
            const terminal_point: Vec2D = {
                x: terminal_diagram_state.position.x + 1.2 * TuringDiagram.state_radius * Math.cos(terminal_angle),
                y: terminal_diagram_state.position.y + 1.2 * TuringDiagram.state_radius * Math.sin(terminal_angle)
            };

            this.draw_bezier_transition(ctx, [origin_point, origin_angle], [terminal_point, terminal_angle], merge_count, {
                read_symbol: this.machine.alphabet[symbol_idx],
                write_symbol: machine_transition.write_symbol,
                string_direction: machine_transition.direction
            }, false);
        }
    } 

    draw_bezier_transition(ctx: CanvasRenderingContext2D, origin: [Vec2D, number], terminal: [Vec2D, number], count: number, 
        transition: { read_symbol: string, write_symbol: string, string_direction: string }, self_loop: boolean
    ) {
        const [origin_point, origin_angle] = origin;
        const [terminal_point, terminal_angle] = terminal;

        const origin_terminal = { x: origin_point.x - terminal_point.x, y: origin_point.y - terminal_point.y };
        const length_sqr = origin_terminal.x * origin_terminal.x + origin_terminal.y * origin_terminal.y;
        const length_norm = 1000 / length_sqr > 1. ? 1. : 1000 / length_sqr;

        const control_1: Vec2D = {
            x: origin_point.x + (330 + (+self_loop) * 30) * length_norm * Math.cos(origin_angle),
            y: origin_point.y + (330 + (+self_loop) * 30) * length_norm * Math.sin(origin_angle),
        };
        const control_2: Vec2D = {
            x: terminal_point.x + 330 * length_norm * Math.cos(terminal_angle),
            y: terminal_point.y + 330 * length_norm * Math.sin(terminal_angle),
        }

        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.lineWidth = 2;
        ctx.font = "1em sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.beginPath();
            ctx.moveTo(origin_point.x, origin_point.y);
            ctx.bezierCurveTo(
                control_1.x, control_1.y,
                control_2.x, control_2.y,
                terminal_point.x, terminal_point.y
            );
            ctx.stroke();
        ctx.closePath();

        if (self_loop) {
            ctx.beginPath();
                ctx.arc(
                    origin_point.x,
                    origin_point.y,
                    TuringDiagram.handle_radius, 0, 2 * Math.PI
                );
                ctx.fill();
            ctx.closePath();
        }

        const midpoint = {
            x: (control_1.x + control_2.x) / 2,
            y: (control_1.y + control_2.y) / 2,
        }
        const rotation = Math.PI + Math.atan2( control_1.y - control_2.y, control_1.x - control_2.x );
        ctx.save()
        ctx.translate(midpoint.x, midpoint.y);
        ctx.rotate(rotation);
        //@ts-ignore
        const text = `${transition.read_symbol} → ${transition.write_symbol}, ${transition.string_direction}` ;
        if (rotation > Math.PI / 2 && rotation < 3 * Math.PI / 2)
            ctx.scale(-1,-1);
        ctx.fillText( text, 0, (+!self_loop) * -15 + count * -25 );
        ctx.scale(1,1);
        ctx.restore();

        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';
        const angle = Math.PI + terminal_angle; // offset angle points outwards
        const start = { x: terminal_point.x + 2 * Math.cos(angle), y: terminal_point.y + 2 * Math.sin(angle) };
        const left = { x: terminal_point.x + -9 * Math.cos(angle - Math.PI / 6), y: terminal_point.y + -9 * Math.sin(angle - Math.PI / 6) };
        const right = { x: terminal_point.x + -9 * Math.cos(angle + Math.PI / 6), y: terminal_point.y + -9 * Math.sin(angle + Math.PI / 6) };
        ctx.beginPath();
            ctx.moveTo(start.x, start.y)
            ctx.lineTo(left.x, left.y);
            ctx.lineTo(right.x, right.y);
            ctx.lineTo(start.x, start.y)
        ctx.closePath();
        ctx.fill();
    }

    draw_null_transition(ctx: CanvasRenderingContext2D, origin_point: Vec2D, text_point: Vec2D, read_symbol: string) {
        ctx.fillStyle = 'black';
        ctx.font = "1em sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.beginPath();
            ctx.arc(
                origin_point.x,
                origin_point.y,
                TuringDiagram.handle_radius, 0, 2 * Math.PI
            );
            ctx.fill();
        ctx.closePath();

        ctx.fillText(
            read_symbol, text_point.x, text_point.y
        );
    }

    add_state(state: MachineState) { this.states.push({ position: { x: 0, y: 0 }, state: state, transitions: [] }) }
    edit_state(state: DiagramState, { position = state.position }) { 
        state.position = position;
    }
    remove_state(index: number) { this.states.splice(index, 1); }

    add_lang_symbol() { this.states.forEach(state => state.transitions.push({ fallback_angle: 0 })); }
    remove_lang_symbol(index: number) { this.states.forEach(state => state.transitions.splice(index, 1)); } 

    add_tape_symbol(symbol_idx: number) { this.states.forEach(state => state.transitions.splice(symbol_idx, 0, { fallback_angle: 0 })); }
    remove_tape_symbol(index: number) { this.states.forEach(state => state.transitions.splice(index, 1)); } 

    edit_transition(transition: DiagramTransition, { fallback_angle = transition.fallback_angle }) {
        transition.fallback_angle = fallback_angle;
    }

    collide_state_point(point: Vec2D): number {
        for (const [idx, state] of this.states.entries()) {
            let radial_x = point.x - state.position.x;
            let radial_y = point.y - state.position.y;
            let radial_length = Math.sqrt(radial_x * radial_x + radial_y * radial_y);

            if (radial_length <= TuringDiagram.state_radius)
                return idx;
        }

        return -1;
    }

    collide_transition_point(point: Vec2D): {state_idx: number, symbol_idx: number} {
        for (const [q_idx, state] of this.states.entries()) {
            for (const [s_idx, transition] of state.transitions.entries() ) {
                if (
                    (this.machine.states[q_idx].transitions[s_idx] == null || this.machine.states[q_idx].transitions[s_idx].to_state == this.machine.states[q_idx]) 
                    && this.collide_origin_transition_point(point, state, transition)
                ) {
                    return { state_idx: q_idx, symbol_idx: s_idx };
                } 
            }
        }

        return { state_idx: -1, symbol_idx: -1 };
    }

    collide_origin_transition_point(point: Vec2D, state: DiagramState, trans: DiagramTransition): boolean {
        const origin_point: Vec2D = {
            x: state.position.x + TuringDiagram.state_radius * Math.cos(trans.fallback_angle),
            y: state.position.y + TuringDiagram.state_radius * Math.sin(trans.fallback_angle),
        }


        let radial_x = point.x - origin_point.x;
        let radial_y = point.y - origin_point.y;
        let radial_length = Math.sqrt(radial_x * radial_x + radial_y * radial_y);
        return radial_length <= 2 * TuringDiagram.handle_radius;
    }

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