export type TransitionRenderPoint = {
    point: { x: number, y: number },
    offset: number,

    offset_point?: { x: number, y: number },
    offset_angle?: number
}

export default class TransitionObject {
    ctx: CanvasRenderingContext2D;
    // @ts-ignore
    from_point: TransitionRenderPoint;
    // @ts-ignore
    to_point: TransitionRenderPoint | null;

    read_symbol: string;
    write_symbol: string | null;
    direction: string | null;

    text_offset: number = 15;
    notch_radius: number = 7;

    constructor(
        ctx: CanvasRenderingContext2D, 
        from_point: TransitionRenderPoint, to_point: TransitionRenderPoint | null = null,
        read_symbol: string, write_symbol: string | null = null, direction: string | null = null,
        alphabet_length: number, read_symbol_idx: number
    ) {
        this.ctx = ctx;
        this.read_symbol = read_symbol;
        this.write_symbol = write_symbol;
        this.direction = direction;
        this.refresh_points(from_point, to_point, alphabet_length, read_symbol_idx);
    }

    refresh_points(from_point: TransitionRenderPoint, to_point: TransitionRenderPoint | null, alphabet_length: number, read_symbol_idx: number) {
        if (to_point === null) {
            const offset_angle = 2 * Math.PI / alphabet_length * read_symbol_idx;
            this.to_point = null;
            this.from_point = {
                point: from_point.point,
                offset: from_point.offset,
                offset_angle: offset_angle,
                offset_point: {
                    x: from_point.point.x + from_point.offset * Math.cos(offset_angle),
                    y: from_point.point.y + from_point.offset * Math.sin(offset_angle),
                }
            };
        } else if (to_point.point.x == from_point.point.x && to_point.point.y == from_point.point.y) {
            const offset_angle = 2 * Math.PI / alphabet_length * read_symbol_idx;
            this.from_point = {
                point: from_point.point,
                offset: from_point.offset,
                offset_angle: offset_angle,
                offset_point: {
                    x: from_point.point.x + from_point.offset * Math.cos(offset_angle),
                    y: from_point.point.y + from_point.offset * Math.sin(offset_angle),
                }
            };

            const shifted_angle = offset_angle + 2 * Math.PI / alphabet_length / 2;
            this.to_point = {
                point: to_point.point,
                offset: to_point.offset,
                offset_angle: shifted_angle,
                offset_point: {
                    x: to_point.point.x + to_point.offset * Math.cos(shifted_angle), 
                    y: to_point.point.y + to_point.offset * Math.sin(shifted_angle)
                }
            };
        } else {
            const from_to = { 
                x: from_point.point.x - to_point.point.x,
                y: from_point.point.y - to_point.point.y
            };
            const from_to_angle = Math.atan2(from_to.y, from_to.x);
            const to_from = { 
                x: to_point.point.x - from_point.point.x,
                y: to_point.point.y - from_point.point.y
            };
            const to_from_angle = Math.atan2(to_from.y, to_from.x);

            this.from_point = {
                point: from_point.point,
                offset: from_point.offset,
                offset_angle: to_from_angle,
                offset_point: {
                    x: from_point.point.x + from_point.offset * Math.cos(to_from_angle),
                    y: from_point.point.y + from_point.offset * Math.sin(to_from_angle),
                }
            };

            this.to_point = {
                point: to_point.point,
                offset: to_point.offset,
                offset_angle: from_to_angle,
                offset_point: {
                    x: to_point.point.x + to_point.offset * Math.cos(from_to_angle),
                    y: to_point.point.y + to_point.offset * Math.sin(from_to_angle),
                }
            };
        }
    }

    click_collide(x: number, y: number): boolean {
        return false;
    }

    draw() {
        this.ctx.strokeStyle = "black";
        this.ctx.fillStyle = "black";
        this.ctx.lineWidth = 2;
        this.ctx.font = "1em sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        if (this.to_point == null) {
            const text_vec = {
                x: this.from_point.offset_point.x + (this.notch_radius + this.text_offset) * Math.cos(this.from_point.offset_angle),
                y: this.from_point.offset_point.y + (this.notch_radius + this.text_offset) * Math.sin(this.from_point.offset_angle),
            }

            this.ctx.beginPath();
                this.ctx.arc(
                    this.from_point.offset_point.x, 
                    this.from_point.offset_point.y, 
                    this.notch_radius, 0, 2 * Math.PI
                );
                this.ctx.fill();
            this.ctx.closePath();

            this.ctx.font = "1em sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(
                this.read_symbol, text_vec.x, text_vec.y
            );
        } else if (this.to_point) {
            const from_to = {
                x: this.from_point.point.x - this.to_point.point.x,
                y: this.from_point.point.y - this.to_point.point.y
            };

            const line_length = Math.sqrt(from_to.x * from_to.x + from_to.y * from_to.y);
            const norm_line_length = 10 / line_length > 1. ? 1. : 10 / line_length;

            const control_point_1 = {
                x: this.from_point.offset_point.x + (120 * norm_line_length) * Math.cos(this.from_point.offset_angle),
                y: this.from_point.offset_point.y + (120 * norm_line_length) * Math.sin(this.from_point.offset_angle),
            };
            const control_point_2 = {
                x: this.to_point.offset_point.x + (120 * norm_line_length) * Math.cos(this.to_point.offset_angle),
                y: this.to_point.offset_point.y + (120 * norm_line_length) * Math.sin(this.to_point.offset_angle),
            };
            this.ctx.beginPath();
                this.ctx.moveTo(this.from_point.offset_point.x, this.from_point.offset_point.y);
                this.ctx.bezierCurveTo(
                    control_point_1.x, control_point_1.y,
                    control_point_2.x, control_point_2.y,
                    this.to_point.offset_point.x, this.to_point.offset_point.y
                );
                this.ctx.stroke();
            this.ctx.closePath();

            const midpoint = {
                x: (control_point_1.x + control_point_2.x) / 2,
                y: (control_point_1.y + control_point_2.y) / 2,
            }
            this.ctx.save()
            this.ctx.translate(midpoint.x, midpoint.y);
            this.ctx.rotate(Math.PI + Math.atan2(
                control_point_1.y - control_point_2.y, control_point_1.x - control_point_2.x
            ));
            this.ctx.fillText(
                `${this.read_symbol} -> ${this.write_symbol}, ${this.direction}`,
                0, this.text_offset
            );
            this.ctx.restore()

            // Draw Arrow Head
            this.ctx.fillStyle = 'black';
            this.ctx.strokeStyle = 'black';
            const angle = Math.PI + this.to_point.offset_angle; // offset angle points outwards
            const start = { x: this.to_point.offset_point.x + 2 * Math.cos(angle), y: this.to_point.offset_point.y + 2 * Math.sin(angle) };
            const left = { x: this.to_point.offset_point.x + -9 * Math.cos(angle - Math.PI / 6), y: this.to_point.offset_point.y + -9 * Math.sin(angle - Math.PI / 6) };
            const right = { x: this.to_point.offset_point.x + -9 * Math.cos(angle + Math.PI / 6), y: this.to_point.offset_point.y + -9 * Math.sin(angle + Math.PI / 6) };
            this.ctx.beginPath();
                this.ctx.moveTo(start.x, start.y)
                this.ctx.lineTo(left.x, left.y);
                this.ctx.lineTo(right.x, right.y);
                this.ctx.lineTo(start.x, start.y)
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
}