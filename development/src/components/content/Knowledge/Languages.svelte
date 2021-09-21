<script>
  import LangBlock from "./LangBlock.svelte";
  import { languages } from "../../../constants";
</script>

<div class="titleblock">
  <h1>Languages</h1>
  <p>All the languages that I know. Maybe....</p>
</div>
{#each languages as language}
  <LangBlock name={language.name} level={language.level} comment={language.comment} imgsrc={language.img}/>
{/each}