export class Vector2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(v: Vector2D): Vector2D {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    sub(v: Vector2D): Vector2D {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    add_polar(radius: number, angle: number): Vector2D {
        return new Vector2D(
            this.x + radius * Math.cos(angle),
            this.y + radius * Math.sin(angle)
        );
    }

    add_cartesian(x: number, y: number): Vector2D {
        return new Vector2D(this.x + x, this.y + y);
    }

    mult_cartesian(scalar: number): Vector2D {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    dot(v: Vector2D): number { return this.x * v.x + this.y * v.y; }
    mag(): number { return Math.sqrt(this.x * this.x + this.y * this.y); }
    angle(): number { return Math.atan2(this.y, this.x); }
}