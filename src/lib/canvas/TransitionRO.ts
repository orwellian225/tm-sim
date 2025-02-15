import RenderObject from "$lib/canvas/RenderObject";
import StateRO from "$lib/canvas/StateRO";
import type { Transition, TuringMachine } from "$lib/tm-engine/turing-machine.svelte";
import { Vector2D } from "./vector";

type TransitionRenderPoint = {
    point: Vector2D,
    offset: number,

    offset_point?: Vector2D,
    offset_angle?: number, // Angle from point to offset_point
};

export default class TransitionRO extends RenderObject {
    tm: TuringMachine;
    transition: Transition;
    from: TransitionRenderPoint;
    to: TransitionRenderPoint | null;

    text_offset: number = 15;
    notch_radius: number = 7;

    constructor(context: CanvasRenderingContext2D, tm: TuringMachine, from_point: TransitionRenderPoint, to_point: TransitionRenderPoint | null, transition: Transition) {
        super(context, new Vector2D(0, 0));
        this.tm = tm;
        this.transition = transition;

        if (to_point === null) {
            
            const offset_angle = 2 * Math.PI / tm.symbols.length * transition[1];
            this.to = null;
            this.from = {
                point: from_point.point,
                offset: from_point.offset,
                offset_angle: offset_angle,
                offset_point: from_point.point.add_polar(from_point.offset, offset_angle)
            }
        } else if (to_point.point === from_point.point) {
            const offset_angle = 2 * Math.PI / tm.symbols.length * transition[1];
            this.from = {
                point: from_point.point,
                offset: from_point.offset,
                offset_angle: offset_angle,
                offset_point: from_point.point.add_polar(from_point.offset, offset_angle)
            }
            const shifted_angle = offset_angle + 2 * Math.PI / tm.symbols.length / 2;
            const shifted_point = to_point.point.add_polar(to_point.offset, shifted_angle)
            this.to = {
                point: to_point.point,
                offset: to_point.offset,
                offset_angle: shifted_angle,
                offset_point: shifted_point,
            }
        } else {
            const from_to_vec = from_point.point.sub(to_point.point)
            const to_from_vec = to_point.point.sub(from_point.point)

            this.from = {
                point: from_point.point,
                offset: from_point.offset,
                offset_angle: to_from_vec.angle(),
                offset_point: from_point.point.add_polar(from_point.offset, to_from_vec.angle())
            };

            this.to = {
                point: to_point.point,
                offset: to_point.offset,
                offset_angle: from_to_vec.angle(),
                offset_point: to_point.point.add_polar(to_point.offset, from_to_vec.angle())
            }
        }
    }

    draw() {
        this.context.strokeStyle = "black";
        this.context.fillStyle = "black";
        this.context.lineWidth = 2;

        if (this.to == null) {
            let text_vec = this.from.offset_point.add_polar(this.notch_radius + this.text_offset, this.from.offset_angle);
            this.context.beginPath();
                this.context.arc(
                    this.from.offset_point.x, 
                    this.from.offset_point.y, 
                    this.notch_radius, 0, 2 * Math.PI
                );
                this.context.fill();
            this.context.closePath();

            this.context.font = "1em sans-serif";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.fillText(
                this.tm.symbols[this.symbol_idx], text_vec.x, text_vec.y
            );
        } else {
            let line_length = this.from.point.sub(this.to.point).mag();
            let norm_line_length = 10 / line_length > 1. ? 1. : 10 / line_length;

            let control_point_1 = this.from.offset_point.add_polar(
                120 * norm_line_length,
                this.from.offset_angle as number
            );
            let control_point_2 = this.to.offset_point.add_polar(
                120 * norm_line_length, 
                this.to.offset_angle as number
            );

            this.context.fillStyle = 'black';
            this.context.strokeStyle = 'black';
            this.context.beginPath();
                this.context.moveTo(this.from.offset_point.x, this.from.offset_point.y);
                this.context.bezierCurveTo(
                    control_point_1.x, control_point_1.y,
                    control_point_2.x, control_point_2.y,
                    this.to.offset_point.x, this.to.offset_point.y
                );
                this.context.stroke();
            this.context.closePath();

            const midpoint = control_point_1.add(control_point_2).mult_cartesian(0.5);
            this.context.fillStyle = 'black';
            this.context.font = "1em sans-serif";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.save()
            this.context.translate(midpoint.x, midpoint.y);
            this.context.rotate(Math.PI + control_point_1.sub(control_point_2).angle())
            this.context.fillText(
                `${this.tm.symbols[this.transition[1]]} -> ${this.tm.symbols[this.transition[3]]}, ${this.tm.direction_str(this.transition[4])}`,
                0, this.text_offset
            );
            this.context.restore()

            // Draw Arrow Head
            this.context.fillStyle = 'black';
            this.context.strokeStyle = 'black';
            const angle = Math.PI + this.to.offset_angle; // offset angle points outwards
            const start = this.to.offset_point.add_polar(2, angle);
            const left = this.to.offset_point.add_polar(-9, angle - Math.PI / 6);
            const right = this.to.offset_point.add_polar(-9, angle + Math.PI / 6);
            this.context.beginPath();
                this.context.moveTo(start.x, start.y)
                this.context.lineTo(left.x, left.y);
                this.context.lineTo(right.x, right.y);
                this.context.lineTo(start.x, start.y)
            this.context.closePath();
            this.context.fill();
        }
    }

}