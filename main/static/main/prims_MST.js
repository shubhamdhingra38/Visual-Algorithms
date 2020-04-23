let nodes = [];
let connections = [];
let defaultColor;
let countNodes = 0;
let fillColor;
let sliderSpeedAnimation;
let startButton;
let cnv;
let para;
const radCircle = 10;
const LEGEND_HEIGHT = 140,
  LEGEND_WIDTH = 150; //height, width of the legend box at bottom
let rectX1, rectY1, rectX2, rectY2;

function Connection(newConnectedNode, connectingNode) {
  this.n1 = newConnectedNode;
  this.n2 = connectingNode;

  connectingNode.isLeaf = false;
}

class Node {
  constructor(location) {
    this.location = location;
    this.isReached = false;
    this.isLeaf = true;
  }

  static drawNodes() {
    nodes.forEach(function (node) {
      noStroke();
      let size = radCircle;

      if (node.isReached) {
        fill(0, 150, 0, 255);
        if (node.isLeaf) {
          stroke(0);
          size += 10;
          fill(0, 255, 0, 150);
        }
      } else {
        fill(220, 0, 0);
      }

      ellipse(node.location.x, node.location.y, size, size);
    });
  }

}

function drawConnections() {
  connections.forEach(function (connection) {
    fill(0);
    stroke(0);
    strokeWeight(2);
    line(connection.n1.location.x, connection.n1.location.y, connection.n2.location.x, connection.n2.location.y);
    strokeWeight(1);
  });
}

function prim() {
  let reached = [];
  let unreached = nodes.slice();

  //reset
  connections = [];
  nodes.forEach(function (node) {
    node.isReached = false;
    node.isLeaf = true;
  });

  // a random first node
  let firstNode = unreached.splice(random(unreached.length), 1)[0];
  firstNode.isReached = true;
  reached.push(firstNode);

  function calculateConnection() {
    let record = width;
    let closestNode, connectingNode;

    reached.forEach(function (reachedNode) {
      unreached.forEach(function (unreachedNode) {
        let d = dist(reachedNode.location.x, reachedNode.location.y, unreachedNode.location.x, unreachedNode.location.y);

        if (d < record) {
          record = d;
          closestNode = unreachedNode;
          connectingNode = reachedNode;
        }
      });
    });

    connections.push(new Connection(closestNode, connectingNode));
    closestNode.isReached = true;
    //remove element from unreached and at the same time push it to reached
    reached.push(unreached.splice(unreached.indexOf(closestNode), 1)[0]);
  }

  //trigger the calculations sequentially
  function doCalculation() {
    if (unreached.length > 0) {
      calculateConnection();
      setTimeout(doCalculation, 1000 - 5 * sliderSpeedAnimation.value());
    } else {
      console.log("done");
    }
  }

  doCalculation();
}

function setup() {
  cnv = createCanvas(windowWidth - 100, windowHeight - 100);
  cnv.parent('sketch-holder');
  cnv.position(25, 80);
  clear();


  //slider to control animation speed
  sliderSpeedAnimation = createSlider(1, 100, 50);
  sliderSpeedAnimation.parent('sketch-holder');
  sliderSpeedAnimation.position(cnv.position().x + 80, cnv.position().y - 40);
  sliderSpeedAnimation.style('width', '80px');

  //start button
  button = createButton('Start');
  button.parent('sketch-holder');
  button.position(cnv.position().x, cnv.position().y - 50);
  button.mousePressed(prim)
  para = createP("Speed");
  para.style('color', color(0, 255, 0, 200));
  para.parent('sketch-holder');
  para.position(sliderSpeedAnimation.position().x, sliderSpeedAnimation.position().y - 25);


  defaultColor = color(0, 200, 0, 100);
  fillColor = 255;


  //for legend
  rectX1 = 60
  rectY1 = height - LEGEND_HEIGHT + 10;
  rectX2 = LEGEND_WIDTH;
  rectY2 = LEGEND_HEIGHT - 20;
}


function isMouseInside(x1, x2, y1, y2) {
  if (mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2) {
    return true;
  }
  return false;
}

function windowResized() {
  //resize the canvas
  resizeCanvas(windowWidth - 100, windowHeight - 100);
}

function mousePressed() {
  if (mouseButton == LEFT) {
    if ((!isMouseInside(radCircle / 2, width - radCircle / 2, radCircle / 2, height - radCircle / 2))) {
      return;
      //collision with legends on the bottom of the canvas or outside border
    } else {
      nodes.push(new Node(createVector(mouseX, mouseY)));
    }
  }
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


function draw() {

  initialDraw();
  stroke(0);
  drawConnections();
  Node.drawNodes();

  //legend
  fill(0, 0, 0, 200);
  rect(rectX1, rectY1, rectX2, rectY2);
  drawLegend(0, 0, defaultColor, 1, "Internal Nodes");
  drawLegend(0, 1, color(0, 255, 0, 150), 2, "Leaf Nodes");
  drawLegend(0, 2, color(220, 0, 0), 3, "Nodes not in MST", 13.5);
  drawLegend(0, 3, color(0), 4, "Edges in MST", 13.5, 'line');
}