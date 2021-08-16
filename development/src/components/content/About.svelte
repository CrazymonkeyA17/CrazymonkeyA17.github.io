<div class="aboutcontainer">
    <div class="profilecontainer">
      <img src="./img/author.jpg" alt="Nikhil Malhotra">
    </div>
    <div class="abouttext">
        <h1>About Me.</h1>
        <h2>Background</h2>
        <p>I have lived in Canada for a majority of my life. An interest in robots through tv, lego and just a general passion for problem solving lead me towards engineering. By education I am a mechatronics engineer a branch of systems engineering. I am always excited to learn new technical skills. If I feel I need a new skill I will usually start or find a project to learn it.</p>
        <hr>
        <h2>At Work</h2>
        <p>At work I enjoy solving problems whether it involves coming up with a solution from scratch or generating improvements to an existing system. My life long career goal is to go beyond a T shaped specialist and become a block of knowledge. I have made this my goal as I have learned that sometimes a problem in one industry has already been solved by another industry and having knowledge of technologies/solutions outside a single industry can lead to some pretty effective solutions.</p>
        <hr>
        <h2>At Home</h2>
        <p>Despite being an avid problem solver I rarely do engineering projects at home due to some space limitations. My hope is to setup a lab space in the future so I have an excuse to work on some larger hardware based personal projects. I do have some small software projects, but I only recently started tossing them into github and started introducing some quality control into the code.</p>
    </div>
</div>

<style>
  div.aboutcontainer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 100%;
  }
  div.profilecontainer {
    width: 40vw;
  }
  div.abouttext {
    width: 60vw;
    padding-right: 5vw;
    height: 100%;
    overflow-y: auto;
    scroll-behavior: smooth;
  }
  img {
    border-radius: 17.5em;
    padding: 5vw;
    width: 30vw;
  }
</style>