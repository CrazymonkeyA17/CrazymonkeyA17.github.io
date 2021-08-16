<script>
  import LangBlock from "./LangBlock.svelte";
  import { languages } from "../../constants";
</script>

<div class="skillscontainer">
  <div class="skillstext">
      <h1>Skills</h1>
      <p>Just going over what I have learned so far and how much I know.</p>
  </div>
  {#each languages as language}
    <LangBlock name={language.name} level={language.level} comment={language.comment}/>
  {/each}
</div>

<style>
div.skillscontainer {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  overflow-y: auto;
  width: 90vw;
  padding-right: 5vw;
  padding-left: 5vw;
}
div.skillstext {
  
}
</style>