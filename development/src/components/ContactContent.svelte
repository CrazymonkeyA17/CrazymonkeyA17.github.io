<script lang="ts">
  import Fa from 'svelte-fa';
	import { email, phonenum, github, linkedin } from "../constants";
  import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
  import { faPhone } from '@fortawesome/free-solid-svg-icons';
  import { faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

  export let maxMode = true;
</script>

<div class="contactContent {maxMode ? "":"minMode"}">
  <div class="minrow">
    <a class="containIcon" href="mailto:{email}"><Fa class="icon" icon={faEnvelope}/></a>
    <a class="containIcon" href="tel:{phonenum}"><Fa class="icon" icon={faPhone}/></a>
    <a class="containIcon" href={github}><Fa class="icon" icon={faGithub}/></a>
    <a class="containIcon" href={linkedin}><Fa class="icon" icon={faLinkedinIn}/></a>
  </div>
  <div class="row"><a class="text" href="mailto:{email}">{email}</a><a class="containIcon" href="mailto:{email}"><Fa class="icon" icon={faEnvelope}/></a></div>
  <div class="row"><a class="text" href="tel:{phonenum}">{phonenum}</a><a class="containIcon" href="tel:{phonenum}"><Fa class="icon" icon={faPhone}/></a></div>
  <div class="row"><a class="text" href={github}>{github}</a><a class="containIcon" href={github}><Fa class="icon" icon={faGithub}/></a></div>
  <div class="row"><a class="text" href={linkedin}>{linkedin}</a><a class="containIcon" href={linkedin}><Fa class="icon" icon={faLinkedinIn}/></a></div>
</div>

<style>
  .contactContent {
    display: flex;
    width: 90%;
    flex-direction: column;
    transform: translateY(0vh);
    transition-duration: 2s;
    text-align: right;
    padding-right: 10%;
  }
  .contactContent .row {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    flex-wrap: nowrap;
    align-content: center;
    align-items: center;
    transition-duration: 2s;
    width: 100%;
  }
  .contactContent.minMode {
    padding-right: 0%;
    width: 100%;
  }
  .contactContent :global(.icon) {
    color:#522e90;
  }
  .contactContent .minrow :global(.icon) {
    font-size:2em;
  }
  .row .containIcon {
    padding-left:1%;
    transition-duration: 2s;
  }
  .row {
    transition-duration: 2s;
  }
  .minMode .row {
    transform: scaleY(0);
    height: 0px;
  }
  .minrow {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-evenly;
    align-content: center;
    align-items: center;
    transform: scaleY(0);
    height: 0px;
    transition-duration: 2s;
  }
  .minMode .minrow {
    transform: scaleY(1);
    height:auto;
  }
</style>