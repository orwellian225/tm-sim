<script lang="ts">
    import TMFile from "$lib/tm-engine/tm-file.svelte";
    import type TMTransition from "$lib/tm-engine/tm-machine.svelte";

    import { getContext, onMount, untrack } from "svelte";
    import Camera from "$lib/canvas/camera";

    let current_tm: TMFile = getContext("current_turing_machine")

    let canvas_parent: HTMLDivElement;
    let canvas: HTMLCanvasElement;
    const canvas_resize_observer  = new ResizeObserver((entries) => {
        canvas.width = canvas_parent.offsetWidth;
        canvas.height = canvas_parent.offsetHeight;
        camera.updateViewport();
        camera.zoomTo(1300);
    });
    let ctx: CanvasRenderingContext2D;
    let camera: any;
    let camera_dragging = false;

    let dragging_state_idx: number = -1;
    let dragging_transition_idx = -1;


    onMount(() => {
        canvas.addEventListener("mousemove", (event: MouseEvent) => {
            if (camera_dragging) {
                camera.moveTo(
                    camera.lookAt[0] - event.movementX,
                    camera.lookAt[1] - event.movementY
                );
            }

            if (dragging_transition_idx != -1) {
                let world_mouse = camera.screenToWorld(event.offsetX, event.offsetY, {x: 0, y: 0})
                current_tm.diagram.transitions[dragging_transition_idx].fallback_angle = Math.atan2(
                    world_mouse.y - current_tm.diagram.transitions[dragging_transition_idx].origin_point.state_position.y,
                    world_mouse.x - current_tm.diagram.transitions[dragging_transition_idx].origin_point.state_position.x
                );
                current_tm.diagram.transitions[dragging_transition_idx].refresh_angles();
            }

            if (dragging_state_idx != -1) {
                let world_mouse = camera.screenToWorld(event.offsetX, event.offsetY, {x: 0, y: 0})
                current_tm.update_diagram_state(dragging_state_idx, world_mouse);
            }
        });
        canvas.addEventListener("mousedown", (event) => { 
            if (event.button == 2) { camera_dragging = true; } 
            if (event.button == 0) {
                for (let i = 0; i < current_tm.diagram.states.length; ++i) {
                    let world_mouse = camera.screenToWorld(event.offsetX, event.offsetY, {x: 0, y: 0})
                    if (current_tm.diagram.states[i].point_collide(world_mouse.x, world_mouse.y)) {
                        dragging_state_idx = i;
                        return;
                    }
                }
                
                for (let i = 0; i < current_tm.diagram.transitions.length; ++i) {
                    let world_mouse = camera.screenToWorld(event.offsetX, event.offsetY, {x: 0, y: 0})
                    if (current_tm.diagram.transitions[i].point_collide(world_mouse.x, world_mouse.y)) {
                        dragging_transition_idx = i;
                        return;
                    }
                }
            }
        });
        canvas.addEventListener("mouseup", (event) => {
             if (event.button == 2) { camera_dragging = false; } 
             if (event.button == 0) { dragging_state_idx = -1; dragging_transition_idx = -1; }
        });
        canvas.addEventListener("wheel", (event: WheelEvent) => { camera.zoomTo(camera.distance + (event.deltaY / 2)) });
        canvas_resize_observer.observe(canvas);

        canvas.width = canvas_parent.offsetWidth;
        canvas.height = canvas_parent.offsetHeight;

        //@ts-ignore
        ctx = canvas.getContext("2d");
        camera = new Camera(ctx, { distance: 1600 });
        camera.updateViewport();

        draw(0);
    });

    let prev_time: number;
    function draw(now_time: number) {
        let delta = now_time - prev_time;
        prev_time = now_time;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        camera.begin();

            for (let diagram_state of current_tm.diagram.states)
                diagram_state.draw(ctx);

            for (let diagram_transtion of current_tm.diagram.transitions)
                diagram_transtion.draw(ctx);

        camera.end();
        requestAnimationFrame(draw);
    }

</script>

<svelte:document oncontextmenu={(event) => {
    if (event.target == canvas) {
        event.preventDefault();
    }
}} />

<div bind:this={canvas_parent} class="w-full h-full">
    <canvas bind:this={canvas} class="w-full h-full"></canvas>
</div>