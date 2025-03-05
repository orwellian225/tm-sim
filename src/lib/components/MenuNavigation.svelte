<script lang="ts">
    let { url } = $props();

    let show = $state(false);
    let nav_map = {
    	"/": "Editor",
    	"/info": "Info",
    	"/examples": "Examples",
    	"/help": "Help",
    	"/tools": "Tools",
    };
</script>

<nav>
	<span class="flex flex-row gap-2">>
		<button class="hover:underline underline-offset-1 w-full text-left" onclick={() => show = !show}> Nav - {nav_map[url]}</button>
	</span>
    {#if show}
    	<ul class="pl-3">
		    <li><a href="/">{#if url == "/"}□{:else}>{/if} Editor</a> </li>
		    <li><a href="/info">{#if url == "/info"}□{:else}>{/if} Information</a></li>
		    <li><a href="/examples">{#if url == "/examples"}□{:else}>{/if} Examples </a></li>
		    <li><a href="/help">{#if url == "/help"}□{:else}>{/if} Help</a></li>
		    <li><a href="/tools">{#if url == "/tools"}□{:else}>{/if} Other Tools</a></li>
     	</ul>
    {/if}
</nav>
