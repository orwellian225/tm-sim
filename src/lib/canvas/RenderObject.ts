export default abstract class RenderObject {
    context: CanvasRenderingContext2D;
    position: {x: number, y: number};

    constructor(context: CanvasRenderingContext2D, position: {x: number, y: number}) {
        this.context = context;
        this.position = position;
    }

    render() {
        this.context.save();
        this.context.translate(this.position.x, this.position.y);

        this.draw();
        
        this.context.restore();
    }

    abstract draw(): void;
}