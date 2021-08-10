<script lang="ts">
	import Contact from "./Contact.svelte";
	import Navbar from "./Navbar.svelte";

  export let selection;
</script>

<main class="{selection === "Home" ? "":"bar"}">
  <Contact on:click={() => selection="Home"} defaultMode={selection === "Home"}/>
  <Navbar bind:navSelection={selection}/>
</main>

<style>
	main {
		padding: 0;
		margin: 0 auto;
		flex-direction: row;
		display: inline-flex;
		height: 100%;
		max-width: 100%;
		width: 100%;
    transition-duration: 1s;
	}
  .bar {
    height: 10%;
  }
</style>