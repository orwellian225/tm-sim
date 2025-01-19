<script lang="ts">
    let { children, text } = $props();

    let is_hovered = $state(false);
    let x = $state();
    let y = $state();
    let display_timeout_id: number;

    function mouse_enter(event: MouseEvent) {
        display_timeout_id = setTimeout(() => is_hovered = true, 500);
        x = event.pageX + 15;
        y = event.pageY + 15;
    }

    function mouse_move(event: MouseEvent) {
        x = event.pageX + 15;
        y = event.pageY + 15;
    }

    function mouse_leave() {
        clearTimeout(display_timeout_id);
        is_hovered = false;
    }
</script>

<div
    on:mousemove={mouse_move}
    on:mouseenter ={mouse_enter}
    on:mouseleave={mouse_leave}
>
    {@render children()}
</div>

{#if is_hovered}
    <div style="top: {y}px; left: {x}px;" 
    class="absolute bg-white p-1">{text}</div>
{/if}

