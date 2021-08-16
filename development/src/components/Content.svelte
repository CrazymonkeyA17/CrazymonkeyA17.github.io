<script lang="ts">
  import { navbarmenu } from "../constants";
  import ContentBlock from "./ContentBlock.svelte";
  import Navigation from "./Navigation.svelte";

  export let section = "Home";
</script>

<div class="bottom {section === "Home" ? "":"show"}">
  <Navigation bind:selection={section} topMode={true}/>
  <div class="blockcontainer">
    {#each navbarmenu as item}
      <ContentBlock show={section['item'] === item} text={item}/>
    {/each}
  </div>
</div>

<style>
  .bottom {
    background-color: white;
    flex-direction: row;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s ease-out;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
  }
  .bottom.show {
    height: 100%;
    max-height: 100vh;
  }
  .blockcontainer {
    display: flex;
    flex-direction: row;
    height: 90vh;
  }
</style>