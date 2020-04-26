let cols = 50;
let rows = 50;

let grid = [];

let openSet = [];
let closedSet = [];

let started = false;

let start;
let end;
let w, h;
let path = [];

let cnv;
let startBtn;
let resetBtn;

let current;

class Cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = undefined;
    this.wall = false;
  }

  show(col){
    if (this.wall) {
      fill(0);
      noStroke();
      ellipse(this.i * w + w / 1.5, this.j * h + h / 1.5, w / 1.5, h / 1.5);
    } else if (col) {
      fill(col);
      rect(this.i * w, this.j * h, w, h);
    }
  }
  
  addNeighbors(grid){
    let i = this.i;
    let j = this.j;
    if (i < cols - 1) {
      this.neighbors.push(grid[i + 1][j]);
    }
    if (i > 0) {
      this.neighbors.push(grid[i - 1][j]);
    }
    if (j < rows - 1) {
      this.neighbors.push(grid[i][j + 1]);
    }
    if (j > 0) {
      this.neighbors.push(grid[i][j - 1]);
    }
    if (i > 0 && j > 0) {
      this.neighbors.push(grid[i - 1][j - 1]);
    }
    if (i < cols - 1 && j > 0) {
      this.neighbors.push(grid[i + 1][j - 1]);
    }
    if (i > 0 && j < rows - 1) {
      this.neighbors.push(grid[i - 1][j + 1]);
    }
    if (i < cols - 1 && j < rows - 1) {
      this.neighbors.push(grid[i + 1][j + 1]);
    }
  }
}


function removeFromArray(arr, elt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function mouseDragged() { //add obstacles
  for (let i = 0; i < grid.length; ++i) {
    for (let j = 0; j < grid[i].length; ++j) {
      if (mouseX > w * grid[i][j].i && mouseX < w * grid[i][j].i + w && mouseY > h * grid[i][j].j && mouseY < h * grid[i][j].j + h) {
        grid[i][j].wall = true;
      }
    }
  }
}

function heuristic(a, b) {
  //euclidean distance
  let d = dist(a.i, a.j, b.i, b.j);
  return d;
}


function initialize() {
  if (started) {
    started = false;
    reset();
  }
  clear();
  openSet.push(start);
  started = true;
  loop();
}


function setup() {
  let m = Math.min(windowWidth, windowHeight)
  cnv = createCanvas(m-50, m-50);
  cnv.parent('sketch-holder');
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, 70);

  frameRate(25);

  w = width / cols;
  h = height / rows;

  reset();

  startBtn = createButton("Start");
  startBtn.parent('sketch-holder');
  startBtn.position(cnv.position().x, cnv.position().y - 50);
  startBtn.mousePressed(initialize);

  resetBtn = createButton("Reset");
  resetBtn.parent('sketch-holder');
  resetBtn.position(cnv.position().x + 100, cnv.position().y - 50);
  resetBtn.mousePressed(reset);

  applyStyle(startBtn);
  applyStyle(resetBtn);
}

function applyStyle(btn){
  btn.class('btn');
  btn.class('btn-sm'); btn.class('btn-success');
  btn.style('border-radius: 5px');
}

function windowResized(){
  let m = Math.min(windowWidth, windowHeight)
  resizeCanvas(m-50, m-50);
  w = width / cols;
  h = height / rows;
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, 70);
  startBtn.position(cnv.position().x, cnv.position().y - 50);
  resetBtn.position(cnv.position().x + 100, cnv.position().y - 50);
  reset();

}

function reset() {
  clear();
  background(200);
  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j);
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }
  start = grid[0][0];
  end = grid[cols - 1][rows - 1];
  start.wall = false;
  end.wall = false;
  started = false;
  openSet = [];
  closedSet = [];
  path = [];
  loop();
}


function draw() {
  if (openSet.length > 0) {
    let winner = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    current = openSet[winner];

    if (current === end) {
      noLoop();
      return;
    }

    removeFromArray(openSet, current);
    closedSet.push(current);

    let neighbors = current.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        let tempG = current.g + heuristic(neighbor, current);
        let newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }
        if (newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = current;
        }
      }
    }
  }

  initialDraw();
  start.show(color(255, 0, 255, 200));
  end.show(color(0, 255, 0, 200));


  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }



  for (let i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(255, 0, 0, 80));
  }


  for (let i = 0; i < openSet.length; i++) {
    openSet[i].show(color(0, 255, 0, 80));
  }


  if (started && (openSet.length != 0)) {
    path = [];
    let temp = current;
    path.push(temp);
    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
    }

    noFill();
    stroke(0, 0, 0, 200);
    strokeWeight(w / 2);
    beginShape();
    for (let i = 0; i < path.length; i++) {
      vertex(path[i].i * w + w / 1.5, path[i].j * h + h / 1.5);
    }
    endShape();
    stroke(0);
    fill(0);
  }
}