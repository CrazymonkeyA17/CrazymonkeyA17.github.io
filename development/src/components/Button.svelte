<script lang="ts">
  export let buttontext = "Button";
  export let largeMode = true;
</script>

<button class="{largeMode ? "big" : "small"}" on:click>
  &nbsp; {buttontext}
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
    padding-left: 0;
    box-shadow: inset 0 0 0 0 #ffffff;
    transition: ease-out 0.5s;
	}
  .big {
    border-color: white;
    border-left-width: 0.2em;
    border-left-style: solid;
  }
  .big:hover {
    color: #522e90;
    box-shadow: inset 47vw 0 0 0 #ffffff;
  }
  .small {
    text-align: center;
    font-size: 1.5em;
  }
</style>