<script>
  import Fa from 'svelte-fa';
  import Languages from "./Languages.svelte";
  import Tools from "./Tools.svelte";
  import Frameworks from "./Frameworks.svelte";
  import { maincolor } from "../../../constants";
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

<div class="knowledgecontainer {section === 0?"hidecontent":"seecontent"}"  style="--theme-color: {maincolor}">
  <div class="titlebanner code" on:click={() => toggleSection(1)}>
    <div class="icon">
      <Fa icon={faCode}/>
      <div class="iconcaption">Languages</div>
    </div>
  </div>
  <div class="content {section === 1?"show":"hide"}">
    <Languages/>
  </div>
  <div class="titlebanner tools" on:click={() => toggleSection(2)}>
    <div class="icon">
      <Fa icon={faTools}/>
      <div class="iconcaption">Tools</div>
    </div>
  </div>
  <div class="content {section === 2?"show":"hide"}">
    <Tools/>
  </div>
  <div class="titlebanner framework" on:click={() => toggleSection(3)}>
    <div class="icon">
      <Fa icon={faCrop}/>
      <div class="iconcaption">Frameworks</div>
    </div>
  </div>
  <div class="content {section === 3?"show":"hide"}">
    <Frameworks/>
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