<script>
  import { tools, maincolor } from "../../../constants";
  import ToolBlock from "./ToolBlock.svelte";

  let popup = false;
  let popupTitle = "";
  let popupComment = "";

  const iconClick = (name, comment) => {
    popup = true;
    popupTitle = name;
    popupComment = comment;
  };
</script>

<div class="titleblock">
  <h1>Tools</h1>
  <p>The current tools at my command, until I find better ones</p>
</div>
<div class="toolscontainer">
  {#each tools as tool}
    <div class="logocontainer" on:click={() => iconClick(tool.name, tool.comment)}>
      <img style="--theme-color: {maincolor}" src={tool.img} alt="{tool.name} logo">
    </div>
  {/each}
</div>
<ToolBlock bind:display={popup} title={popupTitle} content={popupComment}/>

<style>
  .toolscontainer {
    display: grid;
    align-items: center;
    height: 100%;
    grid-template-columns: repeat(4, 1fr);
    justify-items: center;
    align-content: center;
  }
  .logocontainer {
    width: 300px;
    height: 300px;
    display: flex;
    margin: 10px;
    padding: 5px;
    border-style: solid;
    border-width: 5px;
    backdrop-filter: drop-shadow(2px 4px 6px black);
  }
  img {
    object-fit: contain;
    width: 100%;
    background-color: #0000001a;
    filter: drop-shadow(2px 4px 6px black);
  }
</style>