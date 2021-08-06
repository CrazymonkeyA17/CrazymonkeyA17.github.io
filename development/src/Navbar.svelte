<script lang="ts">
  import { navbarmenu } from "./constants";
</script>

<div class="right">
  <ul>
    {#each navbarmenu as item}<li>{item}</li>{/each}
  </ul>
</div>

<style>
  .right {
		background-color: #522e90;
		width: 100%;
		height: 100%;
	}
	li {
		list-style-type: none;
	}
</style>