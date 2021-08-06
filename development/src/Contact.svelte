<script lang="ts">
  import Fa from 'svelte-fa';
	import { name, email, phonenum, github, linkedin } from "./constants";
  import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
  import { faPhone } from '@fortawesome/free-solid-svg-icons';
  import { faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
</script>

<div class="left">
  <div>
    <h1>{name}</h1>
    <ul>
      <li><Fa class="icon" icon={faEnvelope}/> {email}</li>
      <li><Fa class="icon" icon={faPhone}/> {phonenum}</li>
      <li><Fa class="icon" icon={faGithub}/> {github}</li>
      <li><Fa class="icon" icon={faLinkedinIn}/> {linkedin}</li>
    </ul>
  </div>
</div>

<style>
	h1 {
		color: #522e90;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: bolder;
		padding-top: 75%;
		text-align: right;
		width: 100%;
	}
	.left {
		width:100%;
		height: 100%;
		padding: 0;
	}
  .left div{
    width: fit-content;
  }
	li {
		list-style-type: none;
	}
  li :global(.icon) {
    color:#522e90;
  }
</style>