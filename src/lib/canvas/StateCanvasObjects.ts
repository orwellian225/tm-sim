export default class StateObject {
    ctx: CanvasRenderingContext2D;
    position: { x: number, y: number };
    radius: number;
    state_name: string;
    state_modifiers: Array<string> = [];

    constructor(
        ctx: CanvasRenderingContext2D, 
        x: number, y: number, radius: number,
        state_name: string, state_modifier_flag: number
    ) {
        this.ctx = ctx;
        this.position = { x, y };
        this.radius = radius;
        this.state_name = state_name;

        if ((state_modifier_flag & 1) == 1) { this.state_modifiers.push('#00c850'); }
        if ((state_modifier_flag & 2) == 2) { this.state_modifiers.push('#fb2c36'); }
        if ((state_modifier_flag & 4) == 4) { this.state_modifiers.push('#2b7fff'); }
    }

    click_collides(x: number, y: number): boolean {
        let radial_x = x - this.position.x;
        let radial_y = y - this.position.y;
        let radial_length = Math.sqrt(radial_x * radial_x + radial_y * radial_y);

        return radial_length <= this.radius;
    }

    draw() {
        for (let i = 1; i <= this.state_modifiers.length; ++i) {
            this.ctx.strokeStyle = this.state_modifiers[i - 1];
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
                this.ctx.arc(
                    this.position.x, this.position.y, this.radius - i * 5,
                    0, 2 * Math.PI
                );
                this.ctx.stroke();
            this.ctx.closePath();
        }

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "black";
        this.ctx.beginPath();
            this.ctx.arc(
                this.position.x, this.position.y, this.radius,
                0, 2 * Math.PI
            );
            this.ctx.stroke();
        this.ctx.closePath();


        this.ctx.font = "1em sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.state_name, this.position.x, this.position.y);
    }
}