<script lang="ts">
	import { onMount } from "svelte";
    import Camera from "$lib/canvas/camera";
	import type RenderObject from "$lib/canvas/RenderObject";
	import StateRO from "$lib/canvas/StateRO";
	import TransitionRO from "$lib/canvas/TransitionRO";
    import { Vector2D } from "$lib/canvas/vector";

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
                new Vector2D(250 * Math.sin(angle), 250 * Math.cos(angle)),
                tm, i
            ));
        }

        for (let state_idx = 0; state_idx <  tm.states.length; ++state_idx) {
            for (let symbol_idx = 0; symbol_idx < tm.symbols.length; ++symbol_idx) {
                if (state_idx == tm.accept_state || state_idx == tm.reject_state) {
                    continue;
                }

                let transition = tm.has_transition({from_state: state_idx, read_symbol: symbol_idx});
                const from_obj = render_objects[state_idx];
                if (transition) {
                    const to_obj = render_objects[transition[3]];
                    let self_transition_flag = 0.;

                    let offset_angle = 0.;

                    if (to_obj === from_obj) {
                        offset_angle = -Math.PI / 12;
                        self_transition_flag = 1.;
                    }

                    render_objects.push(new TransitionRO(
                        ctx,
                        tm,
                        { point: from_obj.position, offset: from_obj.draw_radius },
                        { point: to_obj.position, offset: to_obj.draw_radius + 5. },
                        transition
                    ));
                } else {
                    render_objects.push(new TransitionRO(
                        ctx,
                        tm,
                        { point: from_obj.position, offset: from_obj.draw_radius },
                        null,
                        transition
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
    <h2 class="text-2xl px-2">State Machine</h2>

    <section bind:this={canvas_parent} class="h-full p-2">
        <canvas class="border-2 border-black" bind:this={canvas}></canvas>
    </section>
</div>