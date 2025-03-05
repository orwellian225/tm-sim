<script lang="ts">
    import TMFile from "$lib/tm-engine/tm-file.svelte";
    import type TMTransition from "$lib/tm-engine/tm-machine.svelte";

    import { getContext, onMount } from "svelte";
    import Camera from "$lib/canvas/camera";

	import StateObject from "$lib/canvas/StateCanvasObjects";
    import TransitionObject from "$lib/canvas/TransitionCanvasObject";

    let current_turing_machine: TMFile = getContext("current_turing_machine")

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

    const state_objects: Array<StateObject> = [];
    let dragging_state_idx: number = -1;

    const transition_objects: Array<TransitionObject> = [];

    function update_objects() {
        state_objects.splice(0, state_objects.length);
        let state_modifier_flag;
        for (let i = 0; i < current_turing_machine.machine.states.length; ++i) {
            state_modifier_flag = 0;
            if (i == current_turing_machine.machine.accept_state) { state_modifier_flag = state_modifier_flag | 1 }
            if (i == current_turing_machine.machine.reject_state ) { state_modifier_flag = state_modifier_flag | 2 }
            if (i == current_turing_machine.machine.initial_state ) { state_modifier_flag = state_modifier_flag | 4 }

            state_objects.push(new StateObject(
                ctx, current_turing_machine.diagram[i].x, current_turing_machine.diagram[i].y, 40,
                current_turing_machine.machine.states[i], state_modifier_flag
            ));
        }

        transition_objects.splice(0, transition_objects.length);
        for (let state_idx = 0; state_idx < current_turing_machine.machine.states.length; ++state_idx) {
            for (let symbol_idx = 0; symbol_idx < current_turing_machine.machine.alphabet.length; ++symbol_idx) {
                const transition: TMTransition | null = current_turing_machine.machine.find_transition(state_idx, symbol_idx);

                if (transition) {
                    transition_objects.push(new TransitionObject(
                        ctx,
                        { point: {x: state_objects[transition.from_state].position.x, y: state_objects[transition.from_state].position.y}, offset: 40 }, 
                        { point: {x: state_objects[transition.to_state].position.x, y: state_objects[transition.to_state].position.y}, offset: 45 }, 
                        current_turing_machine.machine.alphabet[symbol_idx], 
                        current_turing_machine.machine.alphabet[transition.write_symbol], 
                        transition.direction >= 1 ? "R" : transition.direction <= -1 ? "R" : "S",
                        current_turing_machine.machine.alphabet.length, symbol_idx
                    ));
                } else {
                    transition_objects.push(new TransitionObject(
                        ctx,
                        { point: {x: state_objects[state_idx].position.x, y: state_objects[state_idx].position.y}, offset: 40 }, 
                        null,
                        current_turing_machine.machine.alphabet[symbol_idx], null, null,
                        current_turing_machine.machine.alphabet.length, symbol_idx
                    ));
                }
            }
        }
    }

    $effect(update_objects);

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
                state_objects[dragging_state_idx].position.x = world_mouse.x;
                state_objects[dragging_state_idx].position.y = world_mouse.y;
                current_turing_machine.diagram[dragging_state_idx] = { x: world_mouse.x, y: world_mouse.y };
            }
        });
        canvas.addEventListener("mousedown", (event) => { 
            if (event.button == 2) { camera_dragging = true; } 
            if (event.button == 0) {
                for (let i = 0; i < state_objects.length; ++i) {
                    let world_mouse = camera.screenToWorld(event.offsetX, event.offsetY, {x: 0, y: 0})
                    if (state_objects[i].click_collides(world_mouse.x, world_mouse.y)) {
                        dragging_state_idx = i;
                        break;
                    }
                }
            }
        });
        canvas.addEventListener("mouseup", (event) => {
             if (event.button == 2) { camera_dragging = false; } 
             if (event.button == 0) { dragging_state_idx = -1; }
        });
        canvas.addEventListener("wheel", (event: WheelEvent) => { camera.zoomTo(camera.distance + (event.deltaY / 2)) });
        canvas_resize_observer.observe(canvas);

        canvas.width = canvas_parent.offsetWidth;
        canvas.height = canvas_parent.offsetHeight;

        //@ts-ignore
        ctx = canvas.getContext("2d");
        camera = new Camera(ctx, { distance: 1600 });
        camera.updateViewport();

        update_objects();
        draw();
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        camera.begin();

            for (let i = 0; i < state_objects.length; ++i)
                state_objects[i].draw();

            for (let i = 0; i < transition_objects.length; ++i)
                transition_objects[i].draw();

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