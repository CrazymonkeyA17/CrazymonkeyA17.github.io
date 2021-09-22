<script>
  import { tools, maincolor } from "../../../constants";
</script>

<div class="titleblock">
  <h1>Tools</h1>
  <p>The current tools at my command, until I find better ones</p>
</div>
<div class="toolscontainer">
  {#each tools as tool}
    <div class="logocontainer">
      <img style="--theme-color: {maincolor}" src={tool.img} alt="{tool.name} logo">
    </div>
  {/each}
</div>

<style>
  .toolscontainer {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    height: 100%;
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
    object-fit: contain;
    width: 100%;
    background-color: #0000001a;
    filter: drop-shadow(2px 4px 6px black);
  }

</style>