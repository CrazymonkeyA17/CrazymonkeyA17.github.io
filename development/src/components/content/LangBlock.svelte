<script>
  import ProgressBar from "./ProgressBar.svelte";

  export let name = "Language";
  export let level = 1;
  export let comment = "Some Comment";
</script>

<div class="langblock">
  <div class="progress"><h3>{name}</h3><ProgressBar notch={level}/></div>
  <div>
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