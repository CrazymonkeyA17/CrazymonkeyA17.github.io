<script lang="ts">
	import Contact from "./Contact.svelte";
	import Navbar from "./Navbar.svelte";

  export let selection="Home";
	export let topMode = false;
</script>

<main class="{topMode ? "bar":""} {(!topMode && selection !== "Home") ? "hide":""}">
  <Contact on:click={() => selection="Home"} defaultMode={!topMode}/>
  <Navbar bind:navSelection={selection} navtop={topMode}/>
</main>

<style>
	main {
		padding: 0;
		margin: 0;
		flex-direction: row;
		display: inline-flex;
		max-height: 100vh;
		max-width: 100%;
		width: 100%;
		height: 100%;
    transition: max-height 0.5s ease-out;
		overflow: hidden;
	}
	main.hide {
		max-height: 0;
	}
  .bar {
		max-height: 10vh;
  }
</style>