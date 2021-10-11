<script>
  import { frameworks } from "../../../constants";

  const generateRadius = () => {
    return (Math.random()*300+150).toString(10) + "px";
  }

  export let status = false;
</script>

<div >
  {#each frameworks as framework}
    <img class="bubble {status?"":"nobubbles"}" src={framework.img} alt={frameworks.name} style="--radius: {generateRadius()}">
  {/each}
</div>

<style>
  .bubble {
    object-fit: contain;
    border-radius: 50%;
    width: var(--radius);
    height: var(--radius);
    border-style: solid;
    box-shadow: 5px 5px;
    position: absolute;
  }

  .nobubbles {
    position: relative;
  }
</style>