const GRID_SIZE = 50;
const WALL_RATE = 0.5; // Percent chance  
const SEARCH_RATE = 60; // FPS

let grid;
let openSet = [];
let closedSet = [];
let start, end;

let colW, rowH;

let path;
let solved = false;

function setup() {
  createCanvas(600, 600);
  frameRate(SEARCH_RATE);
  
  grid = new Grid(GRID_SIZE, GRID_SIZE);
  start = grid.grid[0][0]; // Start top-left
  end = grid.grid[grid.cols-1][grid.rows-1]; // Find bottom-right
  
  openSet.push(start);
  
  colW = width / grid.cols;
  rowH = height / grid.rows;
}

function draw() {
  background(191);

  astar();
  
  strokeWeight(colW - 2);
  stroke(0);
  fill(0);
  for (let x = 0; x < grid.cols - 1; ++x) {
    for (let y = 0; y < grid.rows - 1; ++y) {
      if (grid.grid[x][y].isWall) {
        let hWall = grid.grid[x+1][y].isWall;
        let vWall = grid.grid[x][y+1].isWall;
        if (hWall && vWall && grid.grid[x+1][y+1].isWall) {
          rect((x+0.5)*colW, (y+0.5)*rowH, colW, rowH);
        } else {
          if (hWall) {
            line((x+0.5)*colW, (y+0.5)*rowH, (x+1.5)*colW, (y+0.5)*rowH);
          }
          if (vWall) {
            line((x+0.5)*colW, (y+0.5)*rowH, (x+0.5)*colW, (y+1.5)*rowH);
          }
        }
      }
    }
  }
  
  openSet.forEach(c => c.draw(color(0, 140, 0, 127)));
  closedSet.forEach(c => c.draw(color(170)));
  
  strokeWeight(colW/3);
  if (solved) stroke(0, 255, 0);
  else if (openSet.length == 0) stroke(255, 0, 0);
  else stroke(255, 255, 0);
  let prevPos = path[0].pos;
  for (let i = 1; i < path.length; ++i) {
    let nextPos = path[i].pos;
    line((prevPos.x+0.5)*colW, (prevPos.y+0.5)*rowH, (nextPos.x+0.5)*colW, (nextPos.y+0.5)*rowH);
    prevPos = nextPos;
  }
}

function astar() {
  if (!solved && openSet.length > 0) {
    let bestIndex = 0;
    for (let i = 0; i < openSet.length; ++i) {
      if (openSet[i].f < openSet[bestIndex].f) {
        bestIndex = i;
      }
    }
    
    let current = openSet[bestIndex];
    
    let pathCell = current;
    path = [ pathCell ];
    while (pathCell.prev) {
      path.push(pathCell.prev);
      pathCell = pathCell.prev;
    }
    
    if (current == end) {
      solved = true;
      return;
    }
    
    openSet.splice(bestIndex, 1);
    closedSet.push(current);
    
    current.neighbors.forEach(neighbor => {
      if (closedSet.some(c => c == neighbor)) return;
      
      let g = current.g + current.pos.dist(neighbor.pos);
      
      if (!openSet.some(c => c == neighbor)) {
        openSet.push(neighbor);
      } else if (g >= neighbor.g) {
        return;
      }
      
      neighbor.g = g;
      neighbor.h = heuristic(neighbor, end);
      neighbor.f = neighbor.g + neighbor.h;
      neighbor.prev = current;
    });
  }}

function heuristic(a, b) {
  let dx = abs(a.pos.x - b.pos.x);
  let dy = abs(a.pos.y - b.pos.y);
  
  if (dx <= dy) {
    return dx * sqrt(2) + (dy - dx);
  }
  return dy * sqrt(2) + (dx - dy);
}

// Grid

class Grid {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.grid = [];
    
    // Generate cells
    for (let x = 0; x < this.cols; ++x) {
      this.grid[x] = [];
      for (let y = 0; y < this.rows; ++y) {
        this.grid[x][y] = new Cell(createVector(x, y));
      }
    }
    
    // Generate walls
    for (let x = 0; x < this.cols; ++x) {
      for (let y = 0; y < this.rows; ++y) {
        if ((x == 0 && y == 0) || (x == this.cols - 1 && y == this.rows - 1)) {
          continue;
        }
        this.grid[x][y].isWall = (random() < WALL_RATE);
      }
    }
    
    // Build neighbor maps
    for (let x = 0; x < this.cols; ++x) {
      for (let y = 0; y < this.rows; ++y) {
        this.grid[x][y].addNeighbors(this.grid);
      }
    }
  }
  
  draw() {
    noFill();
    strokeWeight(1);
    stroke(255);
    let colW = width / this.cols, rowH = height / this.rows;
    for (let x = 0; x < this.cols; ++x) {
      for (let y = 0; y < this.cols; ++y) {
        this.grid[x][y].draw();
      }
    }
  }
}

// Cell

class Cell {
  constructor(pos) {
    this.pos = pos;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.isWall = false;
    this.prev = undefined;
  }
  
  addNeighbors(grid) {
    let addNeighborIfValid = function(cell, x, y) {
      if (x >= 0 && x < grid.length && y >= 0 && y < grid[0].length) {
        let neighbor = grid[x][y];
        if (!neighbor.isWall) {
          cell.neighbors.push(neighbor);
        }
      }
    }
    
    this.neighbors = [];
    for (let x = -1; x <= 1; ++x) {
      for (let y = -1; y <= 1; ++y) {
        addNeighborIfValid(this, this.pos.x + x, this.pos.y + y);
      }
    }
  }
  
  draw(col) {
    let x = (this.pos.x + 0.5) * colW;
    let y = (this.pos.y + 0.5) * rowH;
    
    if (this.isWall || col) {
      noStroke();
      fill(this.isWall ? 42 : col);
      ellipse(x, y, colW - 4, rowH - 4);
    }
   }
}
