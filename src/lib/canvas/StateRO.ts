import RenderObject from '$lib/canvas/RenderObject';
import type { TuringMachine } from '$lib/tm-engine/turing-machine.svelte';

export default class StateRO extends RenderObject {
    tm: TuringMachine;
    state_idx: number;

    draw_radius: number = 40;

    constructor(context: CanvasRenderingContext2D, position: {x: number, y: number}, tm: TuringMachine, state_idx: number) {
        super(context, position);
        this.tm = tm;
        this.state_idx = state_idx;
    }

    draw() {
        this.context.strokeStyle = "black";
        this.context.lineWidth = 2;
        this.context.beginPath();
            this.context.arc(0, 0, this.draw_radius, 0, 2 * Math.PI);
            this.context.stroke();
        this.context.closePath();

        this.context.strokeStyle = "black";
        this.context.fillStyle = "black";
        this.context.font = "1em sans-serif";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(this.tm.states[this.state_idx], 0, 0);

        let ring_colours = [];
        if (this.tm.accept_state == this.state_idx) { ring_colours.push("#00c850"); }
        if (this.tm.reject_state == this.state_idx) { ring_colours.push("#fb2c36"); }
        if (this.tm.initial_state == this.state_idx) { ring_colours.push("#2b7fff"); }

        this.context.lineWidth = 4;
        for (let j = 0; j < ring_colours.length; ++j) {
            this.context.strokeStyle = ring_colours[j];
            this.context.beginPath();
                this.context.arc(0, 0, this.draw_radius - 3 * (j + 1), 0, 2 * Math.PI);
                this.context.stroke();
            this.context.closePath();
        }
    }
};