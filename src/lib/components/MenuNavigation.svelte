<script lang="ts">
    let { url } = $props();
</script>

<nav><ol>
    <li><a href="/">{#if url == "/"}□{:else}>{/if} Editor</a> </li>
    <li><a href="/info">{#if url == "/info"}□{:else}>{/if} Information</a></li>
    <li><a href="/examples">{#if url == "/examples"}□{:else}>{/if} Examples </a></li>
    <li><a href="/help">{#if url == "/help"}□{:else}>{/if} Help</a></li>
    <li><a href="/tools">{#if url == "/tools"}□{:else}>{/if} Other Tools</a></li>
</ol></nav>