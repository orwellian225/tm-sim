<script lang="ts">
    let { computation } = $props();

    const width = $derived(10 + computation.tape.length * 30);
    const height = 40;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    let draw_tape_cell = (x: number, y: number, idx: number) => {
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.font = "1.5em sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeRect(x, y, 30, 30);
        if (idx >= 0 && idx < computation.tape.length) {
            ctx.fillText(computation.tm.symbols[computation.tape[idx]], x + 15, y + 15, 30);
        }
    };

    let draw_tape_head = (x: number, y: number) => {
        ctx.fillStyle = "blue";
        ctx.fillRect(x, y, 30, 3);
    }

    let draw = () => {
        // @ts-ignore
        ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < computation.tape.length; ++i) {
            draw_tape_cell(5 + 30 * i, 2, i);

            if (i == computation.head) {
                draw_tape_head(5 + 30 * i, 34);
            }
        }
    }

    $effect(() => { draw(); });
</script>

<canvas {width} {height} class="overflow-x-auto" bind:this={canvas}></canvas>