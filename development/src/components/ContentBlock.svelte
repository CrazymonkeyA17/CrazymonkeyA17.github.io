<script lang="ts">
  import About from "./content/About.svelte";
  import Knowledge from "./content/Knowledge/Knowledge.svelte";
  import Current from "./content/Current.svelte";
  import Experience from "./content/Experience.svelte";
  import Projects from "./content/Projects.svelte";

  export let text = "";
  export let show;
 
  const content = {
    "ABOUT":About,
    "KNOWLEDGE":Knowledge,
    "CURRENT":Current,
    "EXPERIENCE":Experience,
    "PROJECTS":Projects,
  }
</script>

<div class="{show ? "show":""}">
  <svelte:component this={content[text]}/>
</div>

<style>
  div {
    height: 100%;
    width: 100%;
    max-width: 0vw;
    overflow: hidden;
    font-size: xx-large;
    transition: max-width 0.5s ease-in-out;
  }
  .show {
    max-width: 100vw;
    background-color: #00000000;
  }
</style>