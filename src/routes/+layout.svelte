<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<header class="flex flex-row justify-evenly items-center border-b-4 py-2">
	<a href="/"> Editor </a>
	<a href="/info"> Information </a>
	<a href="/examples"> Examples </a>
</header>

{@render children()}

<footer class="flex flex-row justify-evenly items-center border-t-4 py-2">
	&copy; 2025
</footer>
