<script lang="ts">
	import { base } from "$app/paths";

    let { url } = $props();

    let show = $state(false);
    let nav_map: any = {};
	nav_map[`${base}/`] = "Editor";
	nav_map[`${base}/info`] = "Info";
	nav_map[`${base}/examples`] = "Examples";
	nav_map[`${base}/help`] = "Help";
	nav_map[`${base}/tools`] = "Tools";
</script>

<nav>
	<span class="flex flex-row gap-2">>
		<button class="hover:underline underline-offset-1 w-full text-left" onclick={() => show = !show}> Nav - {nav_map[url]}</button>
	</span>
    {#if show}
    	<ul class="pl-3">
		    <li><a href="{base}/">{#if url == `${base}/`}□{:else}>{/if} Editor</a> </li>
		    <li><a href="{base}/info">{#if url == `${base}/info`}□{:else}>{/if} Information</a></li>
		    <li><a href="{base}/examples">{#if url == `${base}/examples`}□{:else}>{/if} Examples </a></li>
		    <li><a href="{base}/help">{#if url == `${base}/help`}□{:else}>{/if} Help</a></li>
		    <li><a href="{base}/tools">{#if url == `${base}/tools`}□{:else}>{/if} Other Tools</a></li>
     	</ul>
    {/if}
</nav>
