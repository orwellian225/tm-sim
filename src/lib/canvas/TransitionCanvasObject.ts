export type TransitionRenderPoint = {
    point: { x: number, y: number },
    offset: number,
    offset_point: { x: number, y: number },
    offset_angle: number
}

export default class TransitionObject {
    ctx: CanvasRenderingContext2D;
    from_point: TransitionRenderPoint;
    to_point: TransitionRenderPoint | null;

    transitions: Array<{ state_modifier: number, state_idx: number, read_symbol_idx: number, read_symbol: string, write_symbol: string | null, direction: string | null }>;

    text_offset: number = 15;
    notch_radius: number = 7;

    constructor(
        ctx: CanvasRenderingContext2D, 
        from_point: TransitionRenderPoint, to_point: TransitionRenderPoint | null = null,
        transitions: Array<{ state_modifier: number, state_idx: number, read_symbol_idx: number, read_symbol: string, write_symbol: string | null, direction: string | null }>
    ) {
        this.ctx = ctx;
        this.from_point = from_point;
        this.to_point = to_point;
        this.transitions = transitions;
    }

    click_collides(x: number, y: number): boolean {
        let radial_x: number, radial_y: number;
        if (this.to_point == null || 
            (this.to_point.point.x == this.from_point.point.x && this.to_point.point.y == this.from_point.point.y)
        ) {
            radial_x = x - this.from_point.offset_point.x;
            radial_y = y - this.from_point.offset_point.y;
        } else {
            radial_x = x - this.to_point.offset_point.x;
            radial_y = y - this.to_point.offset_point.y;
        }

        let radial_length = Math.sqrt(radial_x * radial_x + radial_y * radial_y);

        return radial_length <= this.notch_radius * 1.3;
    }

    draw() {
        if ((this.transitions[0].state_modifier & 1) == 1 || (this.transitions[0].state_modifier & 2) == 2)
            return;

        this.ctx.strokeStyle = "black";
        this.ctx.fillStyle = "black";
        this.ctx.lineWidth = 2;
        this.ctx.font = "1em sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        if (this.to_point == null || 
            (this.to_point.point.x == this.from_point.point.x && this.to_point.point.y == this.from_point.point.y)
        ) {
            this.ctx.beginPath();
                this.ctx.arc(
                    this.from_point.offset_point.x, 
                    this.from_point.offset_point.y, 
                    this.notch_radius, 0, 2 * Math.PI
                );
                this.ctx.fill();
            this.ctx.closePath();
        }

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
                this.transitions[0].read_symbol, text_vec.x, text_vec.y
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
            const rotation = Math.PI + Math.atan2( control_point_1.y - control_point_2.y, control_point_1.x - control_point_2.x );


            this.ctx.save()
            this.ctx.translate(midpoint.x, midpoint.y);
            this.ctx.rotate(rotation);
            for (let i = 0; i < this.transitions.length; ++i) {
                const text = `${this.transitions[i].read_symbol} -> ${this.transitions[i].write_symbol}, ${this.transitions[i].direction}` ;
                if (rotation > Math.PI / 2 && rotation < 3 * Math.PI / 2)
                    this.ctx.scale(-1,-1);
                this.ctx.fillText( text, 0, -1 * (i + 1) * this.text_offset );
                this.ctx.scale(1,1);
            }
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