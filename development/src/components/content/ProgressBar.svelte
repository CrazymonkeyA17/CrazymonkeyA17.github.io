<script>
  export let notch = 1;

  let canvaswidth = 1000;
  let canvasheight = 250;

  let segwidth = 250;
  let segheight = 80;
  let start = 25;
  let vert = 125;
  let mid = canvasheight/2;
  let gap = 5;
  let overLapGap = 1.5

  let squareDim = 150;
  let shapeOneX = start;
  let shapeOneY = (canvasheight-squareDim)*0.5;

  let shapeTwoX = shapeOneX+squareDim;
  let shapeTwoY = shapeOneY+segheight*0.5;
  let slantAngle = Math.atan(segheight/(segwidth*overLapGap));
  let shapeTwoSlantWidth = segwidth*Math.cos(slantAngle);
  let shapeTwoSlantHeight = segwidth*Math.sin(slantAngle);

  let shapeThreeX = shapeTwoX + (segwidth*overLapGap) - shapeTwoSlantWidth;
  let shapeThreeY = shapeTwoY + shapeTwoSlantHeight;

  let shapeFourX = shapeTwoX + (segwidth*overLapGap);
  let shapeFourY = shapeTwoY;

  let shapeFiveX = shapeFourX + segwidth*1.35;
  let shapeFiveY = mid;

  let fillColor = "#522e90";
  let innerBorder = "#522e9080";
  let outerBorder = "#00000080";

  function toRadians (angle) {
    return angle * (Math.PI / 180);
  }

  function round(val) {
    return Math.round(val * 100 + Number.EPSILON)/100;
  }

  function generateStar(x,y,outerRadius,innerRadius){
    let result = [];
    let tempX = 0;
    let tempY = 0;
    let offset = 0;
    let outercounter = -1;
    let innercounter = -1;
    let counter = 0;
    let radius = 0;
    for(let i = 0; i<10 ; i++) {
      if(i%2 == 0){
        offset = 0;
        outercounter++;
        counter = outercounter;
        radius = outerRadius;
      }else{
        offset = 36;
        innercounter++;
        counter = innercounter;
        radius = innerRadius;
      }
      tempX = round(x+radius*Math.cos(toRadians(counter*72+offset)));
      tempY = round(y+radius*Math.sin(toRadians(counter*72+offset)));
      result.push(tempX);
      result.push(tempY);
    }
    tempX = round(result[0]+(result[result.length-2]-result[0])/2);
    tempY = round(result[1]+(result[result.length-1]-result[1])/2);
    result.unshift(tempY);
    result.unshift(tempX);
    return result.join(" ");
  }
</script>

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="{canvaswidth}" height="{canvasheight}" viewBox="0 0 {canvaswidth} {canvasheight}">
  
  <rect x="{shapeOneX}" y="{shapeOneY}" width="{squareDim}" height="{squareDim}" fill={notch>1?(fillColor+"80"):"transparent"} stroke={innerBorder} stroke-width="5"/>
  <path d="
    M {shapeTwoX} {shapeTwoY} 
    L {shapeTwoX+shapeTwoSlantWidth} {shapeTwoY-shapeTwoSlantHeight} 
    V {shapeTwoY-shapeTwoSlantHeight+segheight} 
    L {shapeTwoX} {shapeTwoY+segheight} z"
    fill={notch>1?(fillColor+"90"):"transparent"} stroke={innerBorder} stroke-width="5"/>

  <path d="
    M {shapeThreeX} {shapeThreeY} 
    L {shapeThreeX+shapeTwoSlantWidth} {shapeThreeY-shapeTwoSlantHeight} 
    V {shapeThreeY-shapeTwoSlantHeight+segheight} 
    L {shapeThreeX} {shapeThreeY+segheight} z" 
    fill={notch>2?(fillColor+"aa"):"transparent"} stroke={innerBorder} stroke-width="5"/>

  <path d="
    M {shapeFourX} {shapeFourY} 
    H {shapeFourX+segwidth} 
    V {shapeFourY+segheight} 
    H {shapeFourX} z" 
    fill={notch>3?(fillColor+"dd"):"transparent"} stroke={innerBorder} stroke-width="5"/>

  <polygon points={generateStar(shapeFiveX,shapeFiveY,segheight,segheight/2)} stroke="white" fill={notch>4?fillColor:"transparent"} stroke-width="{gap}"/>
  
  <path d="
    M {shapeOneX-gap} {shapeOneY-gap} 
    H {squareDim+gap*6} 
    V {shapeTwoY-gap} 
    L {shapeTwoX+shapeTwoSlantWidth+gap} {shapeTwoY-shapeTwoSlantHeight-gap} 
    V {shapeTwoY-shapeTwoSlantHeight+segheight-gap}
    L {shapeFourX} {shapeFourY-gap}
    H {shapeFourX+segwidth+gap}
    V {shapeFourY+segheight+gap}
    H {shapeFourX}
    L {shapeThreeX-gap} {shapeThreeY+segheight+gap}
    V {shapeThreeY+gap}
    L {shapeTwoX+gap} {shapeTwoY+segheight+gap}
    V {shapeOneY+squareDim+gap}
    H {shapeOneX-gap}
    z"
    fill="transparent" stroke={outerBorder} stroke-width="5"/>

</svg>

<style>
  svg {
    height: 10vh;
    width: auto;
  }
</style>