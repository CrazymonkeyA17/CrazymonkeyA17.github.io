<script>
  import Fa from 'svelte-fa';
  import { faTimes } from '@fortawesome/free-solid-svg-icons';

  export let title = "";
  export let content = "";
  export let display = false;

  let toggle = () => {
    if(display){
      display=false;
    }
  }
</script>

<div class="popupBody {display ? "show" : "hide"}">
  <div class="popupContainer">
    <div class="popupHeader">
      <h1>{title}</h1><span on:click={toggle}><Fa size="2x" icon={faTimes}/></span>
    </div>
    <p>{content}</p>
  </div>
</div>

<style>
  .popupBody {
    visibility: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.5);
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
  }

  .popupBody.show {
    visibility: visible;
  }

  .popupContainer {
    width: 0;
    height: 0;
    min-width: 0;
    max-width: 1000px;
    max-height: 750px;
    background-color: white;
    border-radius: 25px;
    box-shadow: 25px 25px;
    padding: 50px;
    transition: 1s;
    animation-timing-function: ease-in-out;
    overflow: hidden;
  }

  .show .popupContainer {
    width:75%;
    min-width: 500px;
    height: 75%;
    min-height: 500px;
    overflow-y: auto;
  }

  .popupHeader {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>