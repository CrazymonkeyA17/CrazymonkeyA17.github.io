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
    <div class="containIcon" href="mailto:{email}"><Fa class="icon" icon={faEnvelope}/></div>
    <div class="containIcon" href="tel:{phonenum}"><Fa class="icon" icon={faPhone}/></div>
    <div class="containIcon" href={github}><Fa class="icon" icon={faGithub}/></div>
    <div class="containIcon" href={linkedin}><Fa class="icon" icon={faLinkedinIn}/></div>
  </div>
  <div class="row"><div class="text" href="mailto:{email}">{email}</div><div class="containIcon" href="mailto:{email}"><Fa class="icon" icon={faEnvelope}/></div></div>
  <div class="row"><div class="text" href="tel:{phonenum}">{phonenum}</div><div class="containIcon" href="tel:{phonenum}"><Fa class="icon" icon={faPhone}/></div></div>
  <div class="row"><div class="text" href={github}>{github}</div><div class="containIcon" href={github}><Fa class="icon" icon={faGithub}/></div></div>
  <div class="row"><div class="text" href={linkedin}>{linkedin}</div><div class="containIcon" href={linkedin}><Fa class="icon" icon={faLinkedinIn}/></div></div>
</div>

<style>
  .contactContent {
    display: flex;
    width: 45vw;
    flex-direction: column;
    transform: translateY(0vh);
    transition-duration: 2s;
    text-align: right;
    padding-right: 5vw;
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
  .contactContent :global(.icon) {
    color:#522e90;
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