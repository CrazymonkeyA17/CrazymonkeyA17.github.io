<script>
  import Fa from 'svelte-fa';
  import LangBlock from "./LangBlock.svelte";
  import { languages } from "../../constants";
  import { faCrop, faTools, faCode } from '@fortawesome/free-solid-svg-icons';
  let section = 0;

  const toggleSection = (val) => {
    if (val === section) {
      section = 0;
    } else {
      section = val;
    }
  }

</script>

<div class="knowledgecontainer">
  <div class="titlebanner" on:click={toggleSection(1)}>
    <Fa class="icon" icon={faCode}/>
  </div>
  <div class="languagecontainer {section === 1?"show":"hide"}">
    <div class="titleblock">
      <h1>Languages</h1>
      <p>All the languages that I know. Maybe....</p>
    </div>
    {#each languages as language}
      <LangBlock name={language.name} level={language.level} comment={language.comment}/>
    {/each}
  </div>
  <div class="titlebanner" on:click={toggleSection(2)}>
    <Fa class="icon" icon={faTools}/>
  </div>
  <div class="toolscontainer {section === 2?"show":"hide"}">
    <div class="titleblock">
      <h1>Languages</h1>
      <p>All the languages that I know. Maybe....</p>
    </div>
    
  </div>
  <div class="titlebanner" on:click={toggleSection(3)}>
    <Fa class="icon" icon={faCrop}/>
  </div>
  <div class="frameworkscontainer {section === 3?"show":"hide"}">
    <div class="titleblock">
      <h1>Languages</h1>
      <p>All the languages that I know. Maybe....</p>
    </div>
    
  </div>
</div>

<style>
  .languagecontainer {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    overflow-y: auto;
    width: 90vw;
    padding-right: 5vw;
    padding-left: 5vw;
  }
  .hide {
    width: 0;
  }
</style>