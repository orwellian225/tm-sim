import RenderObject from "$lib/canvas/RenderObject";
import StateRO from "$lib/canvas/StateRO";
import type { Transition, TuringMachine } from "$lib/tm-engine/turing-machine.svelte";

export default class TransitionRO extends RenderObject {
    tm: TuringMachine;
    from_state: StateRO;
    to_state: StateRO | null;
    symbol_idx: number;

    text_offset: number = 15;

    constructor(context: CanvasRenderingContext2D, tm: TuringMachine, from_state: StateRO, to_state: StateRO | null, read_symbol_idx: number) {
        super(context, {x: 0, y: 0});
        this.from_state = from_state;
        this.to_state = to_state;
        this.symbol_idx = read_symbol_idx;
        this.tm = tm;
    }

    draw() {
        this.context.strokeStyle = "black";
        this.context.lineWidth = 2;

        if (this.to_state == null) {
            this.context.beginPath();
                this.context.arc(
                    this.from_state.position.x + this.from_state.draw_radius * Math.cos(2 * Math.PI * this.symbol_idx / this.tm.symbols.length - Math.PI / 2),
                    this.from_state.position.y + this.from_state.draw_radius * Math.sin(2 * Math.PI * this.symbol_idx / this.tm.symbols.length - Math.PI / 2),
                    0.15 * this.from_state.draw_radius, 0, 2 * Math.PI
                );
                this.context.fill();
            this.context.closePath();

            this.context.fillStyle = "black";
            this.context.font = "1em sans-serif";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.fillText(
                this.tm.symbols[this.symbol_idx], 
                this.from_state.position.x + (this.from_state.draw_radius + this.text_offset) * Math.cos(2 * Math.PI * this.symbol_idx / this.tm.symbols.length - Math.PI / 2),
                this.from_state.position.y + (this.from_state.draw_radius + this.text_offset) * Math.sin(2 * Math.PI * this.symbol_idx / this.tm.symbols.length - Math.PI / 2)
            );
        } else if (this.from_state != this.to_state) {
            const from_vec = { x: this.from_state.position.x, y: this.from_state.position.y };
            const to_vec = { x: this.to_state.position.x, y: this.to_state.position.y };
            const between_vec = {
                x: from_vec.x - to_vec.x,
                y: from_vec.y - to_vec.y
            };

            const from_mag = Math.sqrt(from_vec.x * from_vec.x + from_vec.y * from_vec.y);
            const to_mag = Math.sqrt(to_vec.x * to_vec.x + to_vec.y * to_vec.y);
            const between_mag = Math.sqrt(between_vec.x * between_vec.x + between_vec.y * between_vec.y);

            // From Vector & Between Vector
            const fb_dot = from_vec.x * between_vec.x + from_vec.y * between_vec.y;
            const fb_angle = Math.acos( fb_dot / (from_mag * between_mag) );
            const fb_pos = { 
                x: from_vec.x + this.from_state.draw_radius * Math.sin(fb_angle), 
                y: from_vec.y + this.from_state.draw_radius * Math.cos(fb_angle) 
            };

            // To Vector & Between Vector
            const tb_dot = to_vec.x * between_vec.x + to_vec.y * between_vec.y;
            const tb_angle = Math.acos( tb_dot / (to_mag * between_mag) );
            const tb_pos = {
                x: to_vec.x + this.from_state.draw_radius * Math.sin(2 * Math.PI - tb_angle), 
                y: to_vec.y + this.from_state.draw_radius * Math.cos(2 * Math.PI - tb_angle) 
            };

            this.context.beginPath();
                this.context.moveTo(fb_pos.x, fb_pos.y);
                this.context.lineTo(tb_pos.x + 5 * Math.sin(2 * Math.PI - tb_angle), tb_pos.y + 5 * Math.cos(2 * Math.PI - tb_angle));
                this.context.stroke();
            this.context.closePath();

            // Change to arrow at some point in the future
            this.context.beginPath();
                this.context.fillStyle = "orange";
                this.context.arc(
                    tb_pos.x + 5 * Math.sin(2 * Math.PI - tb_angle),
                    tb_pos.y + 5 * Math.cos(2 * Math.PI - tb_angle),
                    4, 0, 2 * Math.PI
                )
                this.context.fill();
            this.context.closePath();

            //@ts-ignore
            const transition = this.tm.has_transition({ from_state: this.from_state.state_idx, read_symbol: this.symbol_idx, to_state: this.to_state.state_idx });
            this.context.beginPath();
                this.context.translate((fb_pos.x + tb_pos.x) / 2, (fb_pos.y + tb_pos.y) / 2);
                this.context.rotate(Math.atan2(tb_pos.y - fb_pos.y, tb_pos.x - fb_pos.x));
                this.context.fillStyle = "black";
                this.context.font = "1em sans-serif";
                this.context.textAlign = "center";
                this.context.textBaseline = "middle";
                this.context.fillText(
                    `${this.tm.symbols[transition[1]]} -> ${this.tm.symbols[transition[4]]}, ${this.tm.direction_str(transition[2])}`,
                    0,-10 
                );
            this.context.closePath();
        }
    }
}