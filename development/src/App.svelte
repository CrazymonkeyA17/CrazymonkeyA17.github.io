<script lang="ts">
	import Contact from "./Contact.svelte";
	import Navbar from "./Navbar.svelte";
</script>

<main>
	<Contact/>
	<Navbar/>
</main>

<style>
	main {
		padding: 0;
		margin: 0 auto;
		flex-direction: row;
		display: inline-flex;
		height: 100%;
		max-width: 100%;
		width:100%;
	}
</style>
