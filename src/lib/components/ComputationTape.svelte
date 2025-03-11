<script lang="ts">
	import TMComputation from "$lib/tm-engine/tm-computation.svelte";
    import Camera from "$lib/canvas/camera";
    let { in_str, machine, show_resources = false, remove_callback } = $props();

    import { ArrowCounterClockwise, Play, SkipForward, TrashSimple, MagnifyingGlassMinus, MagnifyingGlassPlus, Gear } from "phosphor-svelte";
	import { onMount } from "svelte";

    let computation: TMComputation = $derived(new TMComputation(machine, in_str));

    function status_to_string(status_value: number, computation_state: number): string {
        switch (status_value) {
            case 0: 
                return machine.states[computation_state];
            case 1: 
                return "Accepted";
            case 2: 
                return "Rejected";
            default:
                return "Error";
        }
    }

    const origin_width_ratio = 0.38;
    const origin_zoom_ratio = 0.8;

    let show_settings = $state(false);
    let settings = $state({
        max_timesteps: 10
    });

    let canvas: HTMLCanvasElement;
    let canvas_parent: HTMLElement;
    let ctx: CanvasRenderingContext2D;
    const canvas_resize_observer  = new ResizeObserver((entries) => {
        canvas.width = canvas_parent.offsetWidth;
        canvas.height = canvas_parent.offsetHeight;
        camera.updateViewport();
        camera.zoomTo(canvas.width * origin_zoom_ratio + 100);
        camera.moveTo(canvas.width * origin_width_ratio , 0);
    });
    let camera: any;

    let camera_dragging = false;

    function increase_zoom() {
        let scale = camera.distance - 100;
        camera.zoomTo(scale);
    }
    function decrease_zoom() {
        let scale = camera.distance + 100;
        camera.zoomTo(scale);
    }

    onMount(() => {
        canvas.addEventListener("mousemove", (event: MouseEvent) => {
            if (camera_dragging) {
                camera.moveTo(
                    camera.lookAt[0] - event.movementX > canvas.width * origin_width_ratio ? camera.lookAt[0] - event.movementX : canvas.width * origin_width_ratio,
                    camera.lookAt[1]
                );
            }
        });

        canvas.addEventListener("mousedown", (event) => { if (event.button == 2) { camera_dragging = true; } });
        canvas.addEventListener("mouseup", (event) => { if (event.button == 2) { camera_dragging = false; } });
        canvas_resize_observer.observe(canvas);

        canvas.width = canvas_parent.offsetWidth;
        canvas.height = canvas_parent.offsetHeight;

        //@ts-ignore
        ctx = canvas.getContext("2d");
        camera = new Camera(ctx, { distance: canvas.width * origin_zoom_ratio, initialPosition: [0, 0] });
        camera.updateViewport();

        draw();
    });

    function draw_tape_cell(x: number, y: number, idx: number) {
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.font = "1.5em mono";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.strokeRect(x, y, 30, 30);
        if (idx >= 0 && idx < computation.tape.length) {
            ctx.fillText(machine.alphabet[computation.tape[idx]], x + 15, y + 15, 30);
        } else if (idx == -1) {
            ctx.fillText(machine.alphabet[0], x + 15, y + 15, 30);
        } else if (idx == -2) { // end of tape marker
            const triangle_size = 8;
            ctx.beginPath();
                ctx.moveTo(x + 15, y + 15 - triangle_size);
                ctx.lineTo(x + 15 + triangle_size, y + 15 + triangle_size);
                ctx.lineTo(x + 15 - triangle_size, y + 15 + triangle_size);
                ctx.lineTo(x + 15, y + 15 - triangle_size);
                ctx.stroke();
            ctx.closePath();
        }
    }

    function draw_tape_head(x: number, y: number) {

        switch (computation.status) {
            case 0:
                ctx.fillStyle = "#2b7fff";
                break;
            case 1:
                ctx.fillStyle = "#00c850";
                break;
            case 2:
                ctx.fillStyle = "#fb2c36";
                break;
            default:
                ctx.fillStyle = "red";
                break;
        }
        ctx.fillRect(x, y, 30, 3);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        camera.begin();

            for (let i = 0; i < computation.tape.length; ++i) {
                draw_tape_cell(30 * i, -15, i);

                if (i == computation.head) {
                    draw_tape_head(30 * i, 13);
                }
            }
            if (computation.tape.length == 0)
                draw_tape_head(0, 13);

            // draw a ghost tape i.e. unused cells
            for (let i = 0; i < computation.tape.length + 20; ++i) {
                draw_tape_cell(computation.tape.length * 30 + 30 * i, -15, -1);
            }
            draw_tape_cell(-30, -15, -2) // end of tape marker

        camera.end();
        requestAnimationFrame(draw);
    }

</script>

<svelte:document oncontextmenu={(event) => {
    if (event.target == canvas) {
        event.preventDefault();
    }
}} />


<div class="flex flex-col gap-2">
    <section class="w-full flex flex-row items-center justify-between">
        <span class="flex flex-row items-center gap-2">
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => computation.reset()}><ArrowCounterClockwise size={20} /></button>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => computation.step()}><SkipForward size={20} /></button>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => computation.step_for(settings.max_timesteps)}><Play size={20} /></button>
            <p class="flex items-center justify-center">Status: {status_to_string(computation.status, computation.state)}</p>
        </span>

        <span class="flex flex-row items-center gap-2">
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => decrease_zoom()}><MagnifyingGlassMinus size={20} /></button>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => increase_zoom()}><MagnifyingGlassPlus size={20} /></button>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => show_settings = !show_settings}><Gear size={20} /></button>
            <button class="border-[1px] p-1 border-black hover:bg-zinc-100" onclick={() => remove_callback()}><TrashSimple size={20} /></button>
        </span>
    </section>

    {#if show_resources}
        <ul class="w-fit px-2">
            <li>Time: {computation.resources.time}</li>
            <li>Space: {computation.resources.space}</li>
        </ul>
    {/if}

    {#if show_settings}
        <ul class="w-fit px-2">
            <li>Max timesteps: <input class="border-black border-[1px] px-1" type="number" bind:value={settings.max_timesteps}></li>
        </ul>
    {/if}

    {#if computation.info.code != 0}
        <ul class="w-fit px-2">
            <li>Code: {computation.info.code}</li>
            <li>Message: {computation.info.message}</li>
        </ul>
    {/if}

     <section bind:this={canvas_parent} class="h-12">
        <canvas bind:this={canvas} class="w-full h-full"></canvas>
    </section>
</div>