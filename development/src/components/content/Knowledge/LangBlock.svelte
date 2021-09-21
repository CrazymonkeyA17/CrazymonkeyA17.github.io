<script>
  import ProgressBar from "../ProgressBar.svelte";
  import { maincolor } from "../../../constants.js"

  export let name = "Language";
  export let level = 1;
  export let comment = "Some Comment";
  export let imgsrc = "";
  let levelAlt = ["Novice","Learning","Proficient","Expert","Master"];
</script>

<div class="langblock" style="--theme-color: {maincolor}">
  <div class="cardleft">
    <img src={imgsrc} alt="{name} logo">
  </div>
  <div class="cardright">
    <div class="skilltitle">
      <h3 class="title">{name}</h3>
      <div class="progress">
        <ProgressBar notch={level}/><h3 class="progresstext">{levelAlt[level-1]}</h3>
      </div>
    </div>
    <div class="description">
      {comment}
    </div>
  </div>
</div>

<style>
  .langblock {
    display: flex;
    flex-direction: row;
    width: 100%;
    padding-bottom: 25px;
    margin-bottom: 25px;
    border-bottom: var(--theme-color);
    border-bottom-width: 2px;
    border-bottom-style: solid;
  }
  .cardleft {
    display: flex;
    flex-grow: 1;
    width: 25%;
    justify-content: center;
  }
  .cardright {
    flex-grow: 3;
    display: flex;
    flex-direction: column;
    padding-left: 50px;
    width: 75%;
  }
  .skilltitle {
    display: flex;
  }
  .title {
    margin: 0px;
    width: 25%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .progress {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
  }
  .progresstext {
    min-width: 250px;
    text-align: end;
  }
  img {
    max-width: 250px;
    object-fit: contain;
  }
</style>