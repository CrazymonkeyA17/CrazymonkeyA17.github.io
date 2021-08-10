<script lang="ts">
	import Navigation from "./components/Navigation.svelte";
	import Content from "./components/Content.svelte";

	let contentSection;
</script>

<main>
	<Navigation bind:selection={contentSection}/>
	<Content bind:section={contentSection}/>
</main>

<style>
	main {
		padding: 0;
		margin: 0 auto;
		flex-direction: column;
		display: inline-flex;
		height: 100%;
		max-width: 100%;
		width:100%;
	}
</style>
