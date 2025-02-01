<script lang="ts">
	import { onMount } from "svelte";
    import Camera from "$lib/canvas/camera";

    let { tm = $bindable() } = $props();
    let loop_handle = null;

    let canvas: HTMLCanvasElement;
    let canvas_parent: HTMLElement;
    let ctx: CanvasRenderingContext2D;
    let camera: any;

    let dragging = false;

    onMount(() => {
        canvas.addEventListener("mousemove", (event) => {
            if (dragging) {
                camera.moveTo(
                    camera.lookAt[0] - event.movementX,
                    camera.lookAt[1] - event.movementY
                );
            }
        });

        canvas.addEventListener("mousedown", (event) => { if (event.button == 2) { dragging = true; } });
        canvas.addEventListener("mouseup", (event) => { if (event.button == 2) { dragging = false; } });

        canvas.onwheel = (event) => {
            let scale = camera.distance + (event.deltaY / 2);
            camera.zoomTo(scale);
        };
        canvas.width = 0.98 * canvas_parent.offsetWidth;
        canvas.height = 0.92 * canvas_parent.offsetHeight;

        // @ts-ignore
        ctx = canvas.getContext('2d');
        camera = new Camera(ctx, { distance: 1700 });
        camera.updateViewport();

        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.font = "1em sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        draw();
    });

    let draw = () => {{
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        camera.begin();

        // for (let i = 0; i < 100; ++i) {
        //     for (let j = 0; j < 100; ++j) {
        //         ctx.fillStyle = (i % 2) != (j % 2) ? "green" : "blue";
        //         ctx.fillRect(i * 10 - 50, j * 10 - 50, 10 , 10);
        //     }
        // }

        for (let i = 0; i < tm.states.length; ++i) {
            let x = 250 * Math.cos(2 * Math.PI * i / tm.states.length - Math.PI / 2);
            let y = 250 * Math.sin(2 * Math.PI * i / tm.states.length - Math.PI / 2);
            let ring_colours = [];

            ctx.strokeStyle = "black";
            ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.arc(x, y, 40, 0, 2 * Math.PI);
                ctx.stroke();
            ctx.closePath();
            ctx.fillText(tm.states[i], x, y);

            if (tm.accept_state == i) { ring_colours.push("#00c850"); }
            if (tm.reject_state == i) { ring_colours.push("#fb2c36"); }
            if (tm.initial_state == i) { ring_colours.push("#2b7fff"); }

            for (let j = 0; j < ring_colours.length; ++j) {
                ctx.beginPath();
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = ring_colours[j];
                    ctx.arc(x, y, 40 - 3 * (j + 1), 0, 2 * Math.PI);
                    ctx.stroke();
                ctx.closePath();
            }
        }
        camera.end();

        loop_handle = setTimeout(draw, 30);
    };}
</script>

<svelte:document oncontextmenu={(event) => {
    if (event.target == canvas) {
        event.preventDefault();
    }
}} />

<div class="w-full h-[70vh]">
    <h2 class="text-2xl px-2">Moore Diagram</h2>

    <section bind:this={canvas_parent} class="h-full p-2">
        <canvas bind:this={canvas}></canvas>
    </section>
</div>