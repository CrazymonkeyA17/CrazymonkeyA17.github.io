<script lang="ts">
  export let buttontext = "Button";
  export let largeMode = true;
</script>

<button class="{largeMode ? "" : "small"}" on:click>
  |{buttontext}
</button>

<style>
  button {
		color: #ffffff;
		font-weight: bold;
		background-color: #00000000;
		width: 100%;
		border: #00000000;
    text-align: left;
    font-size: 4em;
	}
  button:hover {
    background-color: #ffffff67;
    animation-duration: 3s;
  }
  .small {
    text-align: center;
    font-size: 2.0em;
  }
</style>