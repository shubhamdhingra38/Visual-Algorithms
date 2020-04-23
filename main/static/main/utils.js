function initialDraw(){
    clear();
    fill('rgba(255, 255, 255, 0.2)');
    stroke(color(0, 255, 0));
    rect(0, 0, cnv.width, cnv.height);
}

function isMouseInside(x1, x2, y1, y2) {
    if (mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2) {
      return true;
    }
    return false;
}

function addStartButton(cnv, fn){
  btn = createButton("Start");
  btn.parent('sketch-holder');
  //style
  btn.class('btn');
  btn.class('btn-sm'); btn.class('btn-success');
  btn.style('border-radius: 5px');
  btn.position(cnv.position().x + 100, cnv.position().y - 45);
  btn.mousePressed(fn);
}

function startStopFunctionality(){
  if(cnt%2 == 0){
    sbtn.html("Stop");
    loop();
  }
  else{
    console.log("here");
    sbtn.html("Start");
    noLoop();
  }
  cnt++;
}

function addStopButton(cnv){
  sbtn.parent('sketch-holder');
  //style
  sbtn.class('btn');
  sbtn.class('btn-sm'); sbtn.class('btn-success');
  sbtn.style('border-radius: 5px');
  sbtn.position(cnv.position().x + 200, cnv.position().y - 45);
  sbtn.mousePressed(startStopFunctionality);
}

function drawLegend(x, y, color, weight, name, size = 14, type = 'circle') {
  let posX = rectX1 + 20 + (250 * x);
  let posY = height - LEGEND_HEIGHT + 20 + (30 * y);
  push();
  stroke(color);
  strokeWeight(weight);
  if (type == 'line') {
    line(posX - 8, posY + 10, posX + 8, posY - 10);
  } else {
    fill(color);
    circle(posX, posY, 10);
  }
  fill(200);
  textSize(size);
  noStroke();
  text(name, posX + 16, posY + 7);
  pop();
}

