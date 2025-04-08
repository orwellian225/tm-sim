<script lang="ts">
    import TMFile2 from "$lib/tm-engine/tm-file2.svelte";

	import { getContext, onMount } from "svelte";
    import Camera from "$lib/canvas/camera";

    let current_tm: TMFile2 = getContext("current_turing_machine");

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
    let dragging_transition: { state_idx: number, symbol_idx: number } = { state_idx: -1, symbol_idx: -1 };

    onMount(() => {
        canvas.addEventListener("mousemove", (event: MouseEvent) => {
            if (camera_dragging) {
                camera.moveTo(
                    camera.lookAt[0] - event.movementX,
                    camera.lookAt[1] - event.movementY
                );
            }

            if (dragging_state_idx != -1) {
                let world_mouse = camera.screenToWorld(event.offsetX, event.offsetY, {x: 0, y: 0})
                current_tm.diagram.edit_state(current_tm.diagram.states[dragging_state_idx], { position: world_mouse });
            }

            if (dragging_transition.state_idx != -1) {
                let world_mouse = camera.screenToWorld(event.offsetX, event.offsetY, {x: 0, y: 0})
                let angle = Math.atan2(
                    world_mouse.y - current_tm.diagram.states[dragging_transition.state_idx].position.y,
                    world_mouse.x - current_tm.diagram.states[dragging_transition.state_idx].position.x,
                );
                current_tm.diagram.edit_transition(current_tm.diagram.states[dragging_transition.state_idx].transitions[dragging_transition.symbol_idx], { fallback_angle: angle });
            }
        });

        canvas.addEventListener("mousedown", (event) => { 
            if (event.button == 2) { camera_dragging = true; } 
            if (event.button == 0) {
                let world_mouse = camera.screenToWorld(event.offsetX, event.offsetY, {x: 0, y: 0})
                dragging_transition = current_tm.diagram.collide_transition_point(world_mouse)
                if (dragging_transition.state_idx == -1) { dragging_state_idx = current_tm.diagram.collide_state_point(world_mouse); }
            }
        });

        canvas.addEventListener("mouseup", (event) => {
            if (event.button == 2) { camera_dragging = false; } 
            if (event.button == 0) {
                dragging_state_idx = -1;
                dragging_transition.state_idx = -1;
                dragging_transition.symbol_idx = -1;
            }
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

            current_tm.diagram.draw(ctx);

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