import { Vector2D } from "./vector";

export default abstract class RenderObject {
    context: CanvasRenderingContext2D;
    position: Vector2D;

    constructor(context: CanvasRenderingContext2D, position: Vector2D) {
        this.context = context;
        this.position = position;
    }

    render() {
        this.context.save();

        this.draw();
        
        this.context.restore();
    }

    abstract draw(): void;
}