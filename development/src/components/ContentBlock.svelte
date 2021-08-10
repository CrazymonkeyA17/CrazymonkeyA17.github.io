<script lang="ts">
  import About from "./content/About.svelte";
  import Skills from "./content/Skills.svelte";
  import Current from "./content/Current.svelte";
  import Career from "./content/Career.svelte";
  import Projects from "./content/Projects.svelte";

  export let text = "";
  export let show;
 
  const content = {
    "ABOUT":About,
    "SKILLS":Skills,
    "CURRENT":Current,
    "CAREER":Career,
    "PROJECTS":Projects,
  }
</script>

<div class="{show ? "show":""}">
  <svelte:component this={content[text]}/>
</div>

<style>
  div {
    height: 100%;
    max-width: 0vw;
    overflow: hidden;
    font-size: xx-large;
    transition: max-width 0.5s ease-out;
  }
  .show {
    max-width: 100vw;
    width: 100%;
    background-color: #00000000;
  }
</style>