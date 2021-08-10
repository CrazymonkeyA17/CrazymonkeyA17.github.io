<script lang="ts">
  import { navbarmenu, content } from "../constants";
  import ContentBlock from "./ContentBlock.svelte";

  export let section = "Home";
</script>

<div class="bottom {section === "Home" ? "":"show"}">
  {#each navbarmenu as item}
    <ContentBlock show={section['item'] === item} text={content[item]}/>
  {/each}
</div>

<style>
  .bottom {
    transition-duration: 2s;
    background-color: white;
    flex-direction: row;
  }
  .bottom.show {
    height: 100%;
    display: inherit;
    visibility: inherit;
  }
</style>