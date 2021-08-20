<script>
  import ProgressBar from "./ProgressBar.svelte";

  export let name = "Language";
  export let level = 1;
  export let comment = "Some Comment";
  export let imgsrc = "";
</script>

<div class="langblock">
  <div class="cardheader">
    <img src={imgsrc} alt="">
    <div class="progress"><h3>{name}</h3><ProgressBar notch={level}/></div>
  </div>
  
  <div class="description">
    {comment}
  </div>
</div>

<style>
  .progress {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 50%;
  }
</style>