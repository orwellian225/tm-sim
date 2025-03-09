import TuringMachine, { type TMTransition } from "./tm-machine.svelte";

export default class DiagramState {
    machine: TuringMachine;
    state_modifiers: Array<string>;
    state_idx: number;

    position: { x: number, y: number };

    static radius = 50;
    static state_modifier_colours = {
        initial: "#2b7fff",
        accept: "#00c850",
        reject: "#fb2c36",
    }

    constructor(
        position: { x: number, y: number },
        state_idx: number, machine: TuringMachine
    ) {
        this.machine = machine;
        this.state_idx = state_idx;
        this.state_modifiers = [];

        this.update_modifiers();
        this.position = position;
    }

    update_modifiers() {
        this.state_modifiers.splice(0, this.state_modifiers.length);
        if (this.state_idx == this.machine.accept_state) { this.state_modifiers.push(DiagramState.state_modifier_colours.accept); }
        if (this.state_idx == this.machine.reject_state) { this.state_modifiers.push(DiagramState.state_modifier_colours.reject); }
        if (this.state_idx == this.machine.initial_state) { this.state_modifiers.push(DiagramState.state_modifier_colours.initial); }
    }

    point_collide(x: number, y: number): boolean {
        let radial_x = x - this.position.x;
        let radial_y = y - this.position.y;
        let radial_length = Math.sqrt(radial_x * radial_x + radial_y * radial_y);

        return radial_length <= DiagramState.radius;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.beginPath();
            ctx.arc(
                this.position.x, this.position.y, DiagramState.radius,
                0, 2 * Math.PI
            );
            ctx.stroke();
        ctx.closePath();

        for (let i = 1; i <= this.state_modifiers.length; ++i) {
            ctx.strokeStyle = this.state_modifiers[i - 1];
            ctx.lineWidth = 4;
            ctx.beginPath();
                ctx.arc(
                    this.position.x, this.position.y, DiagramState.radius - i * 5,
                    0, 2 * Math.PI
                );
                ctx.stroke();
            ctx.closePath();
        }

        ctx.font = "1em sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.machine.states[this.state_idx], this.position.x, this.position.y);
    }

    toJSON(key: string) {
        return {
            x: this.position.x, 
            y: this.position.y
        }
    }

    static fromJSON(machine: TuringMachine, obj: any, state_idx: number) {
        return new DiagramState(obj, state_idx, machine);
    }
}

export type TransitionRenderPoint = {
    state_position: { x: number, y: number },
    radius: number,
    angle: number,
}
export class DiagramTransition {
    origin_point: TransitionRenderPoint;
    terminal_point: TransitionRenderPoint | null;
    fallback_angle: number;

    transition_idx: number;
    machine: TuringMachine;
    transition: TMTransition;

    static notch_radius = 7;
    static text_offset = 15;

    constructor(
        origin_point: TransitionRenderPoint, terminal_point: TransitionRenderPoint | null, fallback_angle: number,
        transition_idx: number, machine: TuringMachine
    ) {
        this.origin_point = origin_point;
        this.terminal_point = terminal_point;
        this.fallback_angle = fallback_angle;
        this.transition_idx = transition_idx;
        this.machine = machine;
        this.transition = this.machine.transitions[transition_idx];
    };

    // Point Type = 1, 2, 3
    //  1: Origin
    //  2: Terminal
    //  3: Text
    point_collide(x: number, y: number, point_type = 1): boolean {
        let position;
        if (point_type == 1)
            position = {
                x: this.origin_point.state_position.x + this.origin_point.radius * Math.cos(this.origin_point.angle),
                y: this.origin_point.state_position.y + this.origin_point.radius * Math.sin(this.origin_point.angle),
            };
        else if (this.terminal_point != null && point_type == 2) 
            position = {
                x: this.terminal_point.state_position.x + this.terminal_point.radius * Math.cos(this.terminal_point.angle),
                y: this.terminal_point.state_position.y + this.terminal_point.radius * Math.sin(this.terminal_point.angle),
            };
        else 
            return false;

        let radial_x = x - position.x;
        let radial_y = y - position.y;
        let radial_length = Math.sqrt(radial_x * radial_x + radial_y * radial_y);

        return radial_length <= DiagramTransition.notch_radius * 2;
    }

    refresh_angles() {
        if (this.terminal_point && this.transition.to_state != null) {
            if (this.transition.from_state != this.transition.to_state) {
                this.origin_point.angle = Math.atan2(
                    this.terminal_point.state_position.y - this.origin_point.state_position.y,
                    this.terminal_point.state_position.x - this.origin_point.state_position.x,
                );
                this.terminal_point.angle = Math.atan2(
                    this.origin_point.state_position.y - this.terminal_point.state_position.y,
                    this.origin_point.state_position.x - this.terminal_point.state_position.x,
                );
            } else {
                this.origin_point.angle = this.fallback_angle;
                this.terminal_point.angle = this.fallback_angle + Math.PI / 3;
            }
        } else {
            this.origin_point.angle = this.fallback_angle;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.lineWidth = 2;
        ctx.font = "1em sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (this.transition.from_state == this.machine.accept_state || this.transition.from_state == this.machine.reject_state)
            return;

        const origin_position = {
            x: this.origin_point.state_position.x + this.origin_point.radius * Math.cos(this.origin_point.angle),
            y: this.origin_point.state_position.y + this.origin_point.radius * Math.sin(this.origin_point.angle),
        };

        const terminal_position = this.terminal_point != null ? {
            x: this.terminal_point.state_position.x + this.terminal_point.radius * Math.cos(this.terminal_point.angle),
            y: this.terminal_point.state_position.y + this.terminal_point.radius * Math.sin(this.terminal_point.angle),
        } : null;

        if (this.transition.to_state == null || this.transition.from_state == this.transition.to_state) {
            ctx.beginPath();
                ctx.arc(
                    origin_position.x,
                    origin_position.y,
                    DiagramTransition.notch_radius, 0, 2 * Math.PI
                );
                ctx.fill();
            ctx.closePath();
        }

        if (this.transition.to_state != null) {
            const origin_terminal = { x: this.origin_point.state_position.x - this.terminal_point.state_position.x, y: this.origin_point.state_position.y - this.terminal_point.state_position.y };
            const line_length = Math.sqrt(origin_terminal.x * origin_terminal.x + origin_terminal.y * origin_terminal.y);
            const norm_line_length = 10 / line_length > 1. ? 1. : 10 / line_length;

            const control_point_1 = {
                x: origin_position.x + (120 * norm_line_length) * Math.cos(this.origin_point.angle),
                y: origin_position.y + (120 * norm_line_length) * Math.sin(this.origin_point.angle),
            };
            const control_point_2 = {
                x: terminal_position.x + (120 * norm_line_length) * Math.cos(this.terminal_point.angle),
                y: terminal_position.y + (120 * norm_line_length) * Math.sin(this.terminal_point.angle),
            };

            ctx.beginPath();
                ctx.moveTo(origin_position.x, origin_position.y);
                ctx.bezierCurveTo(
                    control_point_1.x, control_point_1.y,
                    control_point_2.x, control_point_2.y,
                    terminal_position.x, terminal_position.y
                );
                ctx.stroke();
            ctx.closePath();

            const midpoint = {
                x: (control_point_1.x + control_point_2.x) / 2,
                y: (control_point_1.y + control_point_2.y) / 2,
            }
            const rotation = Math.PI + Math.atan2( control_point_1.y - control_point_2.y, control_point_1.x - control_point_2.x );
            ctx.save()
            ctx.translate(midpoint.x, midpoint.y);
            ctx.rotate(rotation);
            //@ts-ignore
            const text = `${this.machine.alphabet[this.transition.read_symbol]} -> ${this.machine.alphabet[this.transition.write_symbol]}, ${DiagramTransition.string_direction(this.transition.direction)}` ;
            if (rotation > Math.PI / 2 && rotation < 3 * Math.PI / 2)
                ctx.scale(-1,-1);
            ctx.fillText( text, 0, 1 * DiagramTransition.text_offset );
            ctx.scale(1,1);
            ctx.restore();
            
            // draw arrow head
            ctx.fillStyle = 'black';
            ctx.strokeStyle = 'black';
            const angle = Math.PI + this.terminal_point.angle; // offset angle points outwards
            const start = { x: terminal_position.x + 2 * Math.cos(angle), y: terminal_position.y + 2 * Math.sin(angle) };
            const left = { x: terminal_position.x + -9 * Math.cos(angle - Math.PI / 6), y: terminal_position.y + -9 * Math.sin(angle - Math.PI / 6) };
            const right = { x: terminal_position.x + -9 * Math.cos(angle + Math.PI / 6), y: terminal_position.y + -9 * Math.sin(angle + Math.PI / 6) };
            ctx.beginPath();
                ctx.moveTo(start.x, start.y)
                ctx.lineTo(left.x, left.y);
                ctx.lineTo(right.x, right.y);
                ctx.lineTo(start.x, start.y)
            ctx.closePath();
            ctx.fill();
        } else {
            const text_vec = {
                x: origin_position.x + (DiagramTransition.notch_radius + DiagramTransition.text_offset) * Math.cos(this.origin_point.angle),
                y: origin_position.y + (DiagramTransition.notch_radius + DiagramTransition.text_offset) * Math.sin(this.origin_point.angle),
            }
            ctx.font = "1em sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
                this.machine.alphabet[this.transition.read_symbol], text_vec.x, text_vec.y
            );
        }
    }

    static string_direction(direction: number): string {
        switch (direction) {
            case 0:
                return "S";
            case 1:
                return "R";
            case 2:
                return "L"
            default:
                return direction < 0 ? `${Math.abs(direction)}L` : `${direction}R`;
        }
    }

    toJSON(key: string) {
        return {
            origin: this.origin_point,
            terminal: this.terminal_point,
            fallback_angle: this.fallback_angle
        }
    }

    static fromJSON(machine: TuringMachine, obj: any, transition_idx: number) {
        return new DiagramTransition(
            obj.origin, obj.terminal, obj.fallback_angle,
            transition_idx, machine
        );
    }
}