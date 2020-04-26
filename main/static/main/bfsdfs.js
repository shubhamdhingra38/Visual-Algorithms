let counter = 0;
const sizeOfText = 30;
const radCircle = 50;
const timeout = 800;
let vertices = [];
let v;
let node1, node2;
let highlightColor, defaultColor, defaultFill;
let nodeToJoin = null;
//graph may contain cycles, which is allowed. self loops are not allowed here
let adjMat = {};
let edges = []
let cnv; //canvas
let result;
let type = "bfs";

//speedup
p5.disableFriendlyErrors = true; // disables FES


class Vertex {
  constructor(xPos, yPos) {
    this.color = defaultColor;
    this.mouseX = xPos;
    this.mouseY = yPos;
    this.fill = defaultFill;
    this.visitedFill = 0;
    this.counter = counter;

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
    translate(p5.Vector(this.tx, this.ty));
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

function resetSketch() {
  loop();
  clear();
  //reset stuff
  node1.markVisited();
  node2.markVisited();
  isVisiting = false;
  counter = 0;
  vertices = [];
  edges = [];
  adjMat = {};
}

function waitNext(idx) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res([vertices[result[idx]], vertices[result[idx + 1]]]);
    }, timeout);
  });
}

async function initBFS(res){
  result = res;
  let nextNodes;
  vertices[res[0]].markVisited();
  for (let i = 0; i < res.length - 1; ++i) {
    nextNodes = await waitNext(i);
    node1 = nextNodes[0];
    node2 = nextNodes[1];
    node1.markVisited();
    node2.markVisited();
  }
  noLoop();
}

async function initDFS(res) {
  result = res;
  let nextNodes;
  vertices[res[0]].markVisited();
  for (let i = 0; i < res.length - 1; ++i) {
    nextNodes = await waitNext(i);
    node1 = nextNodes[0];
    node2 = nextNodes[1];
    node1.markVisited();
    node2.markVisited();
  }
  noLoop();
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
  resizeCanvas(windowWidth - 100, windowHeight - 100);
  cnv.position(25, 30);
  resetSketch();
  isUpdating = false;
}


function setup() {
  setAttributes('antialias', true);
  cnv = createCanvas(windowWidth - 100, windowHeight - 100);
  cnv.parent('sketch-holder');
  cnv.position(25, 30);
  clear();
  // background('rgba(0,255,0, 0.25)');
  // cnv.position(0, 0); //center
  defaultFill = 100;
  highlightColor = color(255, 0, 0, 200);
  defaultColor = color(255, 255, 255, 200);
  smallCirc = new Vertex(200, 200);
  smallCirc.tx = 100;
  // smallCirc.translateCircle();

}


function draw() {
  clear();
  fill('rgba(255, 255, 255, 0.1)');
  stroke(color(0, 255, 0, 200));
  rect(0, 0, cnv.width, cnv.height);

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
}

//jquery
//source: https://stackoverflow.com/questions/28062979/disable-right-click-on-specific-div-or-class
$("document").ready(function () {
  //get type of traversal
  $('input[type=radio][name=traversal-type]').change(function () {
    type = this.value;
  });
  $('#sketch-holder').bind('contextmenu', function (e) {
    return false;
  });
    $("#reset-btn").on("click", function () {
        resetSketch();
    });
    $("#submit-btn").on("click", function () {
        var src = $("#source").val();
        var mat = getAdjMat();
        //ajax call (computation is done backend)
        $.ajax({
            type: 'POST',
            url: '/home/traversal/',
            data: {
                values: JSON.stringify({
                    'type': type,
                    'src': src,
                    'mat': mat
                }),
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
            },
            success: function (data) {
                var result = data["result"];
                if (type.toLowerCase() == 'bfs')
                    initBFS(result);
                else
                    initDFS(result);
            }

        })
    });
});