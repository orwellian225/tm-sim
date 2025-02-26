<script lang="ts">
	import StateRO from "$lib/canvas/StateRO";
	import TransitionRO from "$lib/canvas/TransitionRO";
    import { Vector2D } from "$lib/canvas/vector";
	import { onMount } from "svelte";

    let { tm = $bindable() } = $props();

    let canvas: HTMLCanvasElement;
    let canvas_parent: HTMLElement;
    let ctx: CanvasRenderingContext2D;
    let camera: any;

    // Render objects
    let ro_states: Array<StateRO> = [];
    let ro_transitions: Array<TransitionRO> = [];

    function update_ro() {}

    function draw() {
        for (let ro_s of ro_states) { ro_s.render(); }
        for (let ro_t of ro_transitions) { ro_t.render(); }

        requestAnimationFrame(draw);
    }

    onMount(() => {
        requestAnimationFrame(draw);
    });

</script>

<div class="w-full h-[70vh]">
    <h2 class="text-2xl px-2">State Machine</h2>

    <section bind:this={canvas_parent} class="h-full p-2">
        <canvas class="border-2 border-black" bind:this={canvas}></canvas>
    </section>
</div>