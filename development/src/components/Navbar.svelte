<script lang="ts">
  import { navbarmenu } from "../constants";
	import Button from "./Button.svelte";

	export let navtop = false;
	export let navSelection = "Home";

	function btnClick(val) {
		navSelection = val;
	}
</script>

<div class="right {navtop ? "top":""}">
  <ul>
    {#each navbarmenu as item}
			<li>
				<Button buttontext={item} largeMode={!navtop} on:click={() => btnClick({item})}/>
			</li>
		{/each}
  </ul>
</div>

<style>
  .right {
		background-color: #522e90;
		width: 100%;
		height: 100%;
		display: flex;
    flex-direction: column;
    align-content: flex-start;
    justify-content: center;
    align-items: flex-start;
	}
	.top ul {
		flex-direction: row;
		padding-inline-start: 0%;
	}
	ul {
		width: 100%;
    padding-inline-start: 5%;
		display: flex;
		flex-direction: column;
		transition: 2s;
	}
	li {
		list-style-type: none;
		width: 100%;
	}
</style>