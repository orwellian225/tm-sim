<script lang="ts">
    import RecursiveTextMenu from '$lib/components/RecursiveTextMenu.svelte';

    type Value = {
        text: string;
        onclick: () => void;
        subelements: Array<Value>;
    }

    let { values } = $props();
    let showing: Array<boolean> = $state([])

    for (let i = 0; i < values.length; i++) {
        showing.push(false);
    }
</script>

{#each values as value, i}
    <li class="w-full flex flex-row gap-2">>
        <button class="hover:underline underline-offset-1 w-full text-left" onclick={() => {showing[i] = !showing[i]; value.onclick(); }}>
            {value.text}
        </button>
    </li>
        {#if showing[i]}
            <ul class="pl-3">
                <RecursiveTextMenu values={value.subelements} />            
            </ul>
        {/if}
{/each}