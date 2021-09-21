<script>
  import Fa from 'svelte-fa';
  import LangBlock from "./LangBlock.svelte";
  import { languages, maincolor } from "../../constants";
  import { faCrop, faTools, faCode } from '@fortawesome/free-solid-svg-icons';
  
  let section = 0;
  let tab = ["nothing","start", "middle", "end"]

  const toggleSection = (val) => {
    if (val === section) {
      section = 0;
    } else {
      section = val;
    }
  }

</script>

<div class="knowledgecontainer {section === 0?"hidecontent":"seecontent"}"  style="--theme-color: {maincolor}">
  <div class="titlebanner code {section === 1?"showmine":"hidemine"}" on:click={() => toggleSection(1)}>
    <div class="icon">
      <Fa icon={faCode}/>
      <div class="iconcaption">Languages</div>
    </div>
  </div>
  <div class="languagecontainer content {section === 1?"show":"hide"}">
    <div class="titleblock">
      <h1>Languages</h1>
      <p>All the languages that I know. Maybe....</p>
    </div>
    {#each languages as language}
      <LangBlock name={language.name} level={language.level} comment={language.comment} imgsrc={language.img}/>
    {/each}
  </div>
  <div class="titlebanner tools {section === 2?"showmine":"hidemine"}" on:click={() => toggleSection(2)}>
    <div class="icon">
      <Fa icon={faTools}/>
      <div class="iconcaption">Tools</div>
    </div>
  </div>
  <div class="toolscontainer content {section === 2?"show":"hide"}">
    <div class="titleblock">
      <h1>Languages</h1>
      <p>All the languages that I know. Maybe....</p>
    </div>
  </div>
  <div class="titlebanner framework {section === 3?"showmine":"hidemine"}" on:click={() => toggleSection(3)}>
    <div class="icon">
      <Fa icon={faCrop}/>
      <div class="iconcaption">Frameworks</div>
    </div>
  </div>
  <div class="frameworkscontainer content {section === 3?"show":"hide"}">
    <div class="titleblock">
      <h1>Languages</h1>
      <p>All the languages that I know. Maybe....</p>
    </div>
    
  </div>
</div>

<style>
  .knowledgecontainer {
    display: flex;
    flex-direction: row;
    height: 100%;
    overflow: hidden;
    color: var(--theme-color);
  }
  .titlebanner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100vw / 3);
    font-size: 4em;
    animation-timing-function: linear;
    transition: 0.5s;
  }

  .seecontent .titlebanner {
    width: 5vw;
    font-size: 2em;
  }

  .icon {
    justify-content: center;
    display: flex;
    flex-direction: column;
    transition: 0.25s;
  }
  .code:hover .icon {
    color: lightblue;
  }
  .tools:hover .icon {
    color: lightcoral;
  }
  .framework:hover .icon {
    color: lightgreen;
  }
  .iconcaption {
    font-size: 0.4em;
  }

  .content {
    animation-timing-function: linear;
    transition: 0.5s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    overflow-y: auto;
  }

  .show {
    width: 85vw;
    padding-right: 5vw;
    padding-left: 5vw;
  }
  .hide {
    width: 0vw;
    padding: 0vw;
  }

</style>