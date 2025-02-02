<script lang="ts">
	import { onMount } from "svelte";
    import Camera from "$lib/canvas/camera";
	import type RenderObject from "$lib/canvas/RenderObject";
	import StateRO from "$lib/canvas/StateRO";
	import TransitionRO from "$lib/canvas/TransitionRO";

    let { tm = $bindable() } = $props();

    let canvas: HTMLCanvasElement;
    let canvas_parent: HTMLElement;
    let ctx: CanvasRenderingContext2D;
    let camera: any;

    let loop_handle = null;

    const render_objects: Array<RenderObject> = [];
    let dragging = false;

    let update_render_objects = () => {
        // This function is very messy
        // THe state render objects are the first tm.states.length elements of the render_objects array
        // So the two arrays are essentially parallel
        // Cleaning this should be done be moving the state render objects and transition render objects into different arrays
        // THe parallelism can be maintained but the two render objects should not be in the same array
        // If the render objects are in the same array, the parallelism should be discarded or enforced by some mechanism

        render_objects.splice(0, render_objects.length);
        for (let i = 0; i < tm.states.length; ++i) {
            const angle = 2 * Math.PI * i / tm.states.length - Math.PI / 2;
            render_objects.push(new StateRO(
                ctx, 
                { x: 250 * Math.cos(angle), y: 250 * Math.sin(angle) }, 
                tm, i
            ));
        }

        for (let state_idx = 0; state_idx <  tm.states.length; ++state_idx) {
            for (let symbol_idx = 0; symbol_idx < tm.symbols.length; ++symbol_idx) {
                let transition = tm.has_transition({from_state: state_idx, read_symbol: symbol_idx});
                if (transition) {
                    render_objects.push(new TransitionRO(
                        ctx,
                        tm,
                        //@ts-ignore
                        render_objects[state_idx], render_objects[transition[3]], symbol_idx
                    ));
                } else {
                    render_objects.push(new TransitionRO(
                        ctx,
                        tm,
                        //@ts-ignore
                        render_objects[state_idx], null, symbol_idx
                    ));
                }
            }
        }
    };

    $effect(() => { update_render_objects(); });

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

        update_render_objects();

        draw();
    });

    let draw = () => {{
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        camera.begin();

            for (let i = 0; i < render_objects.length; ++i) {
                render_objects[i].render();
            }

        camera.end();

        loop_handle = setTimeout(draw, 10);
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