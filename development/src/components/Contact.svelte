<script lang="ts">
  import ContactContent from "./ContactContent.svelte";
	import { name } from "../constants";

  export let defaultMode = true;
</script>

<div class="left {defaultMode ? "default":"notdefault"}">
  <div class="contact_card">
    <h1 class="contactTitle" on:click>{name}</h1>
    <ContactContent maxMode={defaultMode}/>
  </div>
</div>

<style>
  .left {
    height: 100%;
		padding: 0;
    transition-duration: 2s;
    display: flex;
  }
	.left.default {
		width: 100%;
	}
  .left.notdefault {
    width: 40vw;
  }
  .contact_card h1 {
    color: #522e90;
    text-transform: uppercase;
    font-weight: bolder;
    margin-block-start: 0em;
    margin-block-end: 0em;
    width: 95%;
    transition-duration: 1s;
  }
	.default .contact_card h1 {
		font-size: 5em;
    padding-left: 0vw;
    padding-right: 0%;
    margin-block-end: 0em;
    text-align: right;
	}
  .notdefault .contact_card h1 {
		font-size: 3em;
    padding-left: 2.5%;
    padding-right: 2.5%;
    text-align: center;
	}
  .contact_card {
    margin: 0;
    transition-duration: 2s;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
  }
  .notdefault .contact_card {
    justify-content: space-around;
  }
</style>