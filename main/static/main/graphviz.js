//create a graph with p5.js
var counter = 0;
var radius = 50;
var sizeOfText = 30;
var radCircle = 70,
  radSmallCircle = 30;
var edgeColor;
var vertices = [];
var v;
var node1, node2;
var highlightColor, defaultColor, defaultFill;
var nodeToJoin = null;
//graph may contain cycles, which is allowed. self loops are not allowed here
var adjMat = {};
var visX = 0,
  visY = 0,
  slopeM;
var isVisiting = false;
var edges = []
var x1, x2, y1, y2;
var directionX = 1,
  directionY = 0;
var transX = 2,
  transY = 2;
var epsilon = 2;
var cnv; //canvas
var result;
var next = 0,
  len = 0,
  numRoot = 0,
  currRoot;
var visited = {};
var timeout = 1000;



class Vertex {
  constructor(xPos, yPos) {
    this.color = defaultColor;
    this.mouseX = xPos;
    this.mouseY = yPos;
    this.fill = defaultFill;
    this.visitedFill = 0;
    this.counter = counter
    if (counter >= 10) {
      this.size = sizeOfText / 1.25;
      this.xPos = xPos - sizeOfText / 2.5;
      this.yPos = yPos + sizeOfText / 4;
    } else {
      this.size = sizeOfText;
      this.xPos = xPos - sizeOfText / 4;
      this.yPos = yPos + sizeOfText / 4;
    }
  }
  display() {
    fill(this.visitedFill, 0, 0, this.fill);
    stroke(this.color);
    circle(this.mouseX, this.mouseY, radCircle);
    fill(255, 255, 255);
    stroke(color(255, 255, 255));
    strokeWeight(1.5);
    textSize(this.size);
    text(this.counter, this.xPos, this.yPos);
  }
  markVisited() {
    this.visitedFill = 150;
  }
}

function isInside() {
  //returns null if none of the circles satisfy, otherwise the Vertex object which does
  for (var i = 0; i < vertices.length; ++i) {
    v = vertices[i];
    if (mouseX <= v.mouseX + radCircle / 2 && mouseX >= v.mouseX - radCircle / 2 &&
      mouseY <= v.mouseY + radCircle / 2 && mouseY >= v.mouseY - radCircle / 2) {
      return v;
    }
  }
  return null;
}


//only place a node if no overlap with any existing node
function isOverlapping(v) {
  //(x1-x2)^2 + (y1-y2)^2 <= (r1 + r2)^2
  for (var i = 0; i < vertices.length; ++i) {
    if (Math.pow(vertices[i].mouseX - v.mouseX, 2) +
      Math.pow(vertices[i].mouseY - v.mouseY, 2) <= (radCircle * radCircle) / 2) {
      return true;
    }
  }
  return false;
}


function mousePressed() {
  //if mouse inside canvas
  if (!(mouseX >= radCircle / 2 && mouseX <= width - radCircle / 2 && mouseY >= radCircle / 2 && mouseY <= height - radCircle / 2)) {
    return; //outside, don't draw anaything
  }
  if (mouseButton === LEFT) {
    counter += 1;
    v = new Vertex(mouseX, mouseY);
    // v.display();
    if (!isOverlapping(v))
      vertices.push(v);
    else
      counter -= 1;
  } else if (mouseButton === RIGHT) {
    //check if mouse position is inside the circle
    v = isInside();
    if (v != null) {
      if (nodeToJoin != null && nodeToJoin != v) {
        if (adjMat[v.counter] == null || adjMat[v.counter].indexOf(nodeToJoin.counter) == -1) {
          if (adjMat[v.counter] == null)
            adjMat[v.counter] = [];
          if (adjMat[nodeToJoin.counter] == null)
            adjMat[nodeToJoin.counter] = [];
          adjMat[v.counter].push(nodeToJoin.counter);
          adjMat[nodeToJoin.counter].push(v.counter);
          // line(nodeToJoin.mouseX, nodeToJoin.mouseY, v.mouseX, v.mouseY);
          edges.push([nodeToJoin.mouseX, nodeToJoin.mouseY, v.mouseX, v.mouseY]);
          nodeToJoin.color = defaultColor;
          node1 = nodeToJoin;
          node2 = v;
          // calculate();
          nodeToJoin.fill = 255;
          nodeToJoin = null;
          v.fill = 255;
          v = null;
        }
      } else {
        nodeToJoin = v;
        nodeToJoin.color = color(100, 255, 50, 180);
      }
    }
  }
}


function mapForward(valX, valY) {
  let x, y;
  x = map(valX, 0, width, 0, 1);
  y = map(valY, 0, height, 1, 0);
  return [x, y];
}

function mapBackward(valX, valY) {
  let x, y;
  x = map(valX, 0, 1, 0, width);
  y = map(valY, 0, 1, height, 0);
  return [x, y];
}

function moveSmallCircle() {
  //translate from v1 to v2 (v1 ----> v2)
  //slope can be calcualted
  //then for some increment in x, value for y can be determined and plotted
  //y = m*x + c
  //m = (y2-y1)/(x2-x1)
  //(y2-y1) = m(x2-x1)
  //x1 = x2 - (y2-y1)/m
  let newX = visX + directionX * transX;
  let newY = visY + directionY * transY;
  res = mapForward(newX, newY);
  newX = res[0];
  newY = res[1];
  if (directionY == 0) {
    visY = y2 - slopeM * (x2 - newX);
    res = mapBackward(newX, visY);
  } else {
    visX = x2 - ((y2 - newY) / slopeM);
    res = mapBackward(visX, newY);
  }
  visX = res[0];
  visY = res[1];
}


function resetSketch() {
  clear();
  //reset stuff
  node1.markVisited();
  node2.markVisited();
  isVisiting = false;
  counter = 0;
  vertices = [];
  edges = [];
  adjMat = {};
  visited = {};
}


function calculate() {
  visX = node1.mouseX;
  visY = node1.mouseY;
  let res = mapForward(node1.mouseX, node1.mouseY);
  x1 = res[0];
  y1 = res[1];
  res = mapForward(node2.mouseX, node2.mouseY);
  x2 = res[0];
  y2 = res[1];
  slopeM = (y2 - y1) / (x2 - x1);
  if (abs(slopeM) >= 1) {
    directionX = 0;
    directionY = node1.mouseY < node2.mouseY ? 1 : -1;
  } else {
    directionX = node1.mouseX < node2.mouseX ? 1 : -1;
    directionY = 0;
  }
  isVisiting = true;
}

function sendNext() {
  // u ---> v
  if (next == len) {
    currRoot += 1;
    if (currRoot == numRoot)
      return;
    node1 = vertices[result[currRoot][0]];
    len = result[currRoot][1].length;
    next = 0; //reset
  }
  // node1 = vertices[result[next]];
  let nd = result[currRoot][1][next];
  if (!visited[nd]) {
    visited[nd] = true;
    node2 = vertices[result[currRoot][1][next]];
    calculate();
    next += 1;
  } else {
    next += 1;
    //make a recursive call, skip current vertex as it is already visited
    sendNext();
  }
}

function initBFS(res) {
  node1 = vertices[res[0][0]];
  numRoot = res.length;
  currRoot = 0;
  result = res;
  len = result[0][1].length;
  next = 0;
  sendNext();
}


function dfsUtil(idx) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res([vertices[result[idx]], vertices[result[idx + 1]]]);
    }, timeout);
  });
}


async function initDFS(res) {
  result = res;
  let nextNodes;
  vertices[res[0]].markVisited();
  for (let i = 0; i < res.length - 1; ++i) {
    nextNodes = await dfsUtil(i);
    node1 = nextNodes[0];
    node2 = nextNodes[1];
    node1.markVisited();
    node2.markVisited();
  }
}

function getAdjMat() {
  //change from dictionary representation to N x N adjacency matrix
  let l = Object.keys(adjMat).length;
  let mat = [];
  for (let i = 1; i <= counter; ++i) {
    let row = [];
    if (adjMat[i] == null) {
      for (let j = 1; j <= counter; ++j)
        row.push(0);
    } else {
      for (let j = 1; j <= counter; ++j) {
        if (adjMat[i].indexOf(j) != -1)
          row.push(1);
        else
          row.push(0);
      }
    }
    mat.push(row);
  }
  return mat;
}

function windowResized() {
  resizeCanvas(windowWidth / 2, windowHeight - 200);
  resetSketch();
  isUpdating = false;
}


function setup() {
  setAttributes('antialias', true);
  cnv = createCanvas(windowWidth / 2, windowHeight - 200);
  cnv.parent('sketch-holder');
  clear();
  // background('rgba(0,255,0, 0.25)');
  // cnv.position(0, 0); //center
  defaultFill = 100;
  highlightColor = color(255, 0, 0, 200);
  defaultColor = color(255, 255, 255, 200);
}


function draw() {
  clear();
  // background('rgba(0,255,0, 0.25)');
  fill('rgba(255, 255, 255, 0.1)');
  stroke(color(0, 255, 0, 200));
  rect(0, 0, cnv.width, cnv.height);
  if (isVisiting) {
    if (abs(visX - node2.mouseX) <= epsilon && (visY - node2.mouseY) <= epsilon) {
      node1.markVisited();
      node2.markVisited();
      isVisiting = false; //reset
      sendNext();
    } else {
      moveSmallCircle();
      fill(0, 255, 0, 100);
      stroke(color(0, 255, 0, 200));
      circle(visX, visY, radSmallCircle);
    }
  }

  for (let i = 0; i < edges.length; ++i) {
    stroke(defaultColor);
    strokeWeight(5);
    line(edges[i][0], edges[i][1], edges[i][2], edges[i][3]);
    strokeWeight(1);
  }

  for (let i = 0; i < vertices.length; ++i) {
    if (vertices[i] == v)
      strokeWeight(4);
    vertices[i].display();
  }

  //TODO
  //debug info, useful errors to users such as where node cannot be placed
}