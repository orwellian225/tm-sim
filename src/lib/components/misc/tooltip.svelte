<script lang="ts">
    import { Tooltip } from "bits-ui";

    let { trigger, content } = $props();
</script>

<Tooltip.Provider>
    <Tooltip.Root>

        <Tooltip.Trigger delayDuration={200}>
            {@render trigger()}
        </Tooltip.Trigger>
        <Tooltip.Content>
            <div class="p-1 w-fit flex flex-col justify-start items-center bg-white border-black border-[1px]">
                {@render content()}
            </div>
        </Tooltip.Content>

    </Tooltip.Root>
</Tooltip.Provider>