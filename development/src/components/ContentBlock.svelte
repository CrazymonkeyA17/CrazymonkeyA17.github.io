<script lang="ts">
  export let text = "";
  export let show;
</script>

<div class="{show ? "show":""}">
  {text}
</div>

<style>
  div {
    height: 0%;
    display: none;
    visibility: hidden;
    transition-duration: 2s;
  }
  div.show {
    height: 100%;
    display: inherit;
    visibility: inherit;
    background-color: #00000000;
    font: xx-large;
    transition-duration: 2s;
  }
</style>