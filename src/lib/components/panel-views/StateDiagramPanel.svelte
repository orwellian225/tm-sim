<script lang="ts">
    import TMFile from "$lib/tm-engine/tm-file.svelte";
    import type TMTransition from "$lib/tm-engine/tm-machine.svelte";

    import { getContext, onMount, untrack } from "svelte";
    import Camera from "$lib/canvas/camera";

	import StateObject from "$lib/canvas/StateCanvasObjects";
    import TransitionObject, { type TransitionRenderPoint } from "$lib/canvas/TransitionCanvasObject";

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

    let dragging_state_idx: number = -1;
    let dragging_transition_idx = -1;

    // Condition computes some REAL number property of the sector
    function find_circle_sector(from_angle: number, to_angle: number, condition: (from_angle: number, to_angle: number) => number, condition_threshold: number) {
        if (to_angle - from_angle < Math.PI / 12 || condition(from_angle, to_angle) < condition_threshold)
            return { start_angle: from_angle, end_angle: to_angle };
        
        // 3 subdivied sectors:
        // 1. from -> from + range / 3
        // 2. from + range / 3 -> from + 2 * range / 3
        // 3. from + 2 * range / 3 -> to
        const num_subdived_sectors = 6;
        const sector_range = to_angle - from_angle
        const sector_angles: Array<number> = [ from_angle ];
        for (let i = 1; i < num_subdived_sectors + 1; ++i)
            sector_angles.push( sector_angles[i - 1] + i * sector_range / num_subdived_sectors );

        for (let i = 0; i < num_subdived_sectors - 1; ++i) {
            let smallest_sector = true;
            smallest_sector = smallest_sector && (condition(sector_angles[i], sector_angles[i + 1]) < condition(sector_angles[i + 1], sector_angles[i + 2]));

            if (smallest_sector)
                return find_circle_sector(sector_angles[i], sector_angles[i + 1], condition, condition_threshold);
        }

        return find_circle_sector(sector_angles[sector_angles.length - 2], sector_angles[sector_angles.length - 1], condition, condition_threshold);
    }

    let state_objects: Array<StateObject> = $derived(current_turing_machine.machine.states.map((state, idx) => {
        let state_modifier_flag = 0;
        if (idx == current_turing_machine.machine.accept_state) { state_modifier_flag = state_modifier_flag | 1 }
        if (idx == current_turing_machine.machine.reject_state ) { state_modifier_flag = state_modifier_flag | 2 }
        if (idx == current_turing_machine.machine.initial_state ) { state_modifier_flag = state_modifier_flag | 4 }

        return new StateObject(
            ctx, current_turing_machine.diagram[idx].x, current_turing_machine.diagram[idx].y, 40,
            state, state_modifier_flag
        );
    }));
    let transition_objects: Array<TransitionObject> = [];
    function update_transition_objects() {
        transition_objects.splice(0, transition_objects.length);
        const same_states: Array<number> = [];
        const defined_transitions: Array<Array<boolean>> = current_turing_machine.machine.states.map(() => current_turing_machine.machine.alphabet.map(() => false));
        const transition_angles: Array<Array<number>> = current_turing_machine.machine.states.map(() => []); 
        
        const from_offset = 40;
        const to_offset = 45;

        for (let trans_idx = 0; trans_idx < current_turing_machine.machine.transitions.length; ++trans_idx) {
            const transition = current_turing_machine.machine.transitions[trans_idx];
            defined_transitions[transition.from_state][transition.read_symbol] = true;

            if (transition.from_state === transition.to_state) {
                same_states.push(trans_idx);
                continue;
            }

            const from_point = current_turing_machine.diagram[transition.from_state];
            const to_point = current_turing_machine.diagram[transition.to_state];
            const from_to = { x: from_point.x - to_point.x, y: from_point.y - to_point.y };
            const to_from = { x: to_point.x - from_point.x, y: to_point.y - from_point.y };
            const from_to_angle = Math.atan2(from_to.y, from_to.x);
            const to_from_angle = Math.atan2(to_from.y, to_from.x);

            transition_angles[transition.from_state].push( to_from_angle );
            const from_render_point: TransitionRenderPoint = {
                point: from_point,
                offset: from_offset,
                offset_angle: to_from_angle,
                offset_point: {
                    x: from_point.x + from_offset * Math.cos(to_from_angle), 
                    y: from_point.y + from_offset * Math.sin(to_from_angle), 
                }
            };
            const to_render_point : TransitionRenderPoint = {
                point: to_point,
                offset: to_offset,
                offset_angle: from_to_angle,
                offset_point: {
                    x: to_point.x + to_offset * Math.cos(from_to_angle),
                    y: to_point.y + to_offset * Math.sin(from_to_angle)
                }
            };

            let state_modifier_flag = 0;
            if (transition.from_state == current_turing_machine.machine.accept_state) { state_modifier_flag = state_modifier_flag | 1 }
            if (transition.from_state == current_turing_machine.machine.reject_state ) { state_modifier_flag = state_modifier_flag | 2 }
            transition_objects.push(new TransitionObject(
                ctx, from_render_point, to_render_point, [{ 
                    state_idx: transition.from_state,
                    read_symbol_idx: transition.read_symbol,
                    state_modifier: state_modifier_flag,
                    read_symbol: current_turing_machine.machine.alphabet[transition.read_symbol],
                    write_symbol: current_turing_machine.machine.alphabet[transition.write_symbol],
                    direction: transition.direction >= 1 ? "R" : transition.direction <= -1 ? "L" : "S"
                }]
            ));
        }

        for (let trans_idx of same_states) {
            const transition = current_turing_machine.machine.transitions[trans_idx];
            const from_diagram = current_turing_machine.diagram[transition.from_state];
            const offset_angle = from_diagram.fallback_transition_angles[transition.read_symbol];
            const from_render_point: TransitionRenderPoint = {
                point: { x: from_diagram.x, y: from_diagram.y },
                offset: from_offset,
                offset_angle: offset_angle,
                offset_point: {
                    x: from_diagram.x + from_offset * Math.cos(offset_angle), 
                    y: from_diagram.y + from_offset * Math.sin(offset_angle), 
                }
            };
            const shifted_angle = offset_angle + Math.PI / current_turing_machine.machine.alphabet.length;
            const to_render_point : TransitionRenderPoint = {
                point: { x: from_diagram.x, y: from_diagram.y },
                offset: to_offset,
                offset_angle: shifted_angle,
                offset_point: {
                    x: from_diagram.x + to_offset * Math.cos(shifted_angle),
                    y: from_diagram.y + to_offset * Math.sin(shifted_angle)
                }
            };

            let state_modifier_flag = 0;
            if (transition.from_state == current_turing_machine.machine.accept_state) { state_modifier_flag = state_modifier_flag | 1 }
            if (transition.from_state == current_turing_machine.machine.reject_state ) { state_modifier_flag = state_modifier_flag | 2 }
            transition_objects.push(new TransitionObject(
                ctx, from_render_point, to_render_point, [{ 
                    state_idx: transition.from_state,
                    read_symbol_idx: transition.read_symbol,
                    state_modifier: state_modifier_flag,
                    read_symbol: current_turing_machine.machine.alphabet[transition.read_symbol],
                    write_symbol: current_turing_machine.machine.alphabet[transition.write_symbol],
                    direction: transition.direction >= 1 ? "R" : transition.direction <= -1 ? "L" : "S"
                }]
            ));
        }

        for (let state_idx = 0; state_idx < current_turing_machine.machine.states.length; ++state_idx)
            for (let symbol_idx = 0; symbol_idx < current_turing_machine.machine.alphabet.length; ++symbol_idx)
                if (!defined_transitions[state_idx][symbol_idx]) {
                    const from_point = current_turing_machine.diagram[state_idx];
                    const offset_angle = current_turing_machine.diagram[state_idx].fallback_transition_angles[symbol_idx];
                    const from_render_point: TransitionRenderPoint = {
                        point: from_point,
                        offset: from_offset,
                        offset_angle: offset_angle,
                        offset_point: {
                            x: from_point.x + from_offset * Math.cos(offset_angle), 
                            y: from_point.y + from_offset * Math.sin(offset_angle), 
                        }
                    };

                    let state_modifier_flag = 0;
                    if (state_idx == current_turing_machine.machine.accept_state) { state_modifier_flag = state_modifier_flag | 1 }
                    if (state_idx == current_turing_machine.machine.reject_state ) { state_modifier_flag = state_modifier_flag | 2 }
                    transition_objects.push(new TransitionObject(
                        ctx, from_render_point, null, [{ 
                            state_idx: state_idx,
                            read_symbol_idx: symbol_idx,
                            state_modifier: state_modifier_flag,
                            read_symbol: current_turing_machine.machine.alphabet[symbol_idx],
                            write_symbol: null,
                            direction: null
                        }]
                    ));
                }
    }

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
                current_turing_machine.diagram[dragging_state_idx] = { x: world_mouse.x, y: world_mouse.y, fallback_transition_angles: current_turing_machine.diagram[dragging_state_idx].fallback_transition_angles };
            }

            if (dragging_transition_idx != -1) {
                let world_mouse = camera.screenToWorld(event.offsetX, event.offsetY, {x: 0, y: 0})
                const current_point = transition_objects[dragging_transition_idx].from_point;
                const offset_angle = Math.atan2(
                    world_mouse.y  - current_point.point.y,
                    world_mouse.x - current_point.point.x
                );
                current_turing_machine.diagram[transition_objects[dragging_transition_idx].transitions[0].state_idx]
                    .fallback_transition_angles[transition_objects[dragging_transition_idx].transitions[0].read_symbol_idx] 
                    = offset_angle;
            }
        });
        canvas.addEventListener("mousedown", (event) => { 
            if (event.button == 2) { camera_dragging = true; } 
            if (event.button == 0) {
                for (let i = 0; i < transition_objects.length; ++i) {
                    let world_mouse = camera.screenToWorld(event.offsetX, event.offsetY, {x: 0, y: 0})
                    if (transition_objects[i].click_collides(world_mouse.x, world_mouse.y)) {
                        dragging_transition_idx = i;
                        return;
                    }
                }

                for (let i = 0; i < state_objects.length; ++i) {
                    let world_mouse = camera.screenToWorld(event.offsetX, event.offsetY, {x: 0, y: 0})
                    if (state_objects[i].click_collides(world_mouse.x, world_mouse.y)) {
                        dragging_state_idx = i;
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

        if (delta > 16)
            console.log(delta)

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        camera.begin();

            for (let i = 0; i < state_objects.length; ++i)
                state_objects[i].draw();

            for (let i = 0; i < transition_objects.length; ++i)
                transition_objects[i].draw();

        camera.end();
        requestAnimationFrame(draw);
    }

    $effect(update_transition_objects);
</script>

<svelte:document oncontextmenu={(event) => {
    if (event.target == canvas) {
        event.preventDefault();
    }
}} />

<div bind:this={canvas_parent} class="w-full h-full">
    <canvas bind:this={canvas} class="w-full h-full"></canvas>
</div>