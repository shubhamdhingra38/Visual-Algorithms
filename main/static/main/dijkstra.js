let vertices = [];
let edges = [];
let nodeToJoin = null;
let actualPos;

const radCircle = 25;

let done = false;

let length = 0;
let indexVertexHighlight = -1,
  indexEdgeHighlight;

const timeout = 500;

let flag = false;

let parent = []; //keep track of the path for printing the shortest path
let highlightedEdges = [];
let srcToV, edgeWt, currDist;

const LEGEND_HEIGHT = 100,
  LEGEND_WIDTH = 200; //height, width of the legend box at bottom

//leaflet map code
let myMap;
let canvas;
const mappa = new Mappa('Leaflet');
const options = {
  lat: 39,
  lng: -90,
  zoom: 4,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}


function isInside() {
  //returns null if none of the circles satisfy, otherwise the Vertex object which does
  for (var i = 0; i < vertices.length; ++i) {
    v = vertices[i];
    actualPos = myMap.latLngToPixel(v.x, v.y);
    if (mouseX <= actualPos.x + radCircle / 2 && mouseX >= actualPos.x - radCircle / 2 &&
      mouseY <= actualPos.y + radCircle / 2 && mouseY >= actualPos.y - radCircle / 2) {
      return v;
    }
  }
  return null;
}

//SOURCE: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d.toFixed(2);
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

function highlightUtil(t) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res("DONE waiting");
    }, t);
  });
}

function isOverlapping(v) {
  //(x1-x2)^2 + (y1-y2)^2 <= (r1 + r2)^2
  actualPos = myMap.pixelToLatLng(v.x, v.y);
  for (var i = 0; i < vertices.length; ++i) {
    let pos = myMap.pixelToLatLng(vertices[i].x, vertices[i].y);
    if (Math.pow(pos.x - actualPos.x, 2) +
      Math.pow(pos.y - actualPos.y, 2) <= (radCircle * radCircle) / 2) {
      return true;
    }
  }
  return false;
}

function findEdge(u, v) {
  for (let i = 0; i < edges.length; ++i) {
    if ((vertices[u] == edges[i][0] && vertices[v] == edges[i][1]) ||
      (vertices[u] == edges[i][1] && vertices[v] == edges[i][0])) {
      return i;
    }
  }
}


class Graph {
  constructor(v) {
    this.n_vertices = v;
    let adjMat = [];
    for (let i = 0; i < v; ++i) {
      let row = [];
      for (let j = 0; j < v; ++j) {
        row.push(0);
      }
      adjMat.push(row);
    }
    this.adjMat = adjMat;
  }

  addEdge(u, v) {
    //adds an edge from u to v and from v to u (undirected graph)
    this.adjMat[u][v] = 1;
    this.adjMat[v][u] = 1;
  }

  addEdgeWeighted(u, v, w) {
    //adds edge from u to v and from v to u with weight w (undirected graph)
    this.adjMat[u][v] = w;
    this.adjMat[v][u] = w;
  }

  printAdjMat() {
    for (let i = 0; i < this.n_vertices; ++i) {
      console.log(this.adjMat[i]);
    }
  }
}

class Dijkstra {
  constructor(g) {
    this.graph = g;
    this.V = this.graph.n_vertices;
    let visited = [],
      distances = [];
    for (let i = 0; i < this.V; ++i) {
      visited.push(false);
      distances.push(Number.POSITIVE_INFINITY);
    }
    this.visited = visited;
    this.distances = distances;
    for (let i = 0; i < this.V; ++i) {
      parent[i] = 0;
    }
  }
  findMinDistance() {
    //finds minimum distance vertex not yet visited and returns the index
    let minDist = Number.POSITIVE_INFINITY;
    let minIdx;
    for (let i = 0; i < this.V; ++i) {
      if (!this.visited[i] && this.distances[i] < minDist) {
        minDist = this.distances[i];
        minIdx = i;
      }
    }
    return minIdx;
  }
  printResult() {
    console.log("Result is:", this.distances);
  }
  async performDijkstra(u) {
    //u is the source vertex since this is SSP algorithm
    this.distances[u] = 0;
    parent[u] = -1;
    let r;
    for (let i = 0; i < this.V - 1; ++i) {
      indexEdgeHighlight = -1; //reset
      let u = this.findMinDistance();
      indexVertexHighlight = u; //highlight the source vertex and then every neighboring vertex being checked
      this.visited[u] = true;
      let currVertex = u;
      highlightedEdges = [];
      while (parent[currVertex] != -1) {
        highlightedEdges.push([currVertex, parent[currVertex]]);
        currVertex = parent[currVertex];
      }
      //for each neighbor of u
      for (let v = 0; v < this.V; ++v) {
        r = await highlightUtil(1000);
        indexEdgeHighlight = findEdge(u, v);
        srcToV = this.distances[u];
        edgeWt = this.graph.adjMat[u][v];
        currDist = this.distances[v];
        if (this.graph.adjMat[u][v] != 0 && !this.visited[v] && this.distances[v] > this.distances[u] + this.graph.adjMat[u][v]) {
          parent[v] = u;
          flag = true;
          r = await highlightUtil(1000);
          this.distances[v] = this.distances[u] + this.graph.adjMat[u][v];
          flag = false;
        }
      }
    }
    indexEdgeHighlight = -1; //reset
    highlightedEdges = [];
    done = true;
  }
}


class Vertex {
  constructor(x, y, l) {
    this.x = x;
    this.y = y;
    this.number = l;
    this.r = radCircle;
    this.num = length;
    this.color = color(0, 0, 0);
    this.distance = Number.POSITIVE_INFINITY;
  }
  drawVertex() {
    stroke(this.color);
    actualPos = myMap.latLngToPixel(this.x, this.y);
    if (indexVertexHighlight == this.number) {
      stroke(color(255, 0, 0));
    }
    circle(actualPos.x, actualPos.y, this.r);
    stroke(0);
    strokeWeight(1);
  }
  highlightVertex() {
    this.color = color(0, 255, 0, 200);
  }
}


function windowResized() {
  //clear everything
  vertices = [];
  edges = [];
  parent = [];
  nodeToJoin = null;
}


function setup() {
  canvas = createCanvas(windowWidth - 50, windowHeight);
  canvas.parent('sketch-holder');
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);

  //for legend
  rectX1 = 60;
  rectY1 = LEGEND_HEIGHT + 5;
  rectX2 = LEGEND_WIDTH;
  rectY2 = LEGEND_HEIGHT + 10;
}

function drawLegend(x, y, color, weight, name, size = 14, type = 'circle') {
  let posX = rectX1 + 20 + (250 * x);
  let posY = LEGEND_HEIGHT + 20 + (30 * y);
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


function setUpGraph() {
  if (vertices.length < 2 || edges.length < 1) {
    return; //invalid input
  }
  done = false;
  let g = new Graph(length);
  for (let i = 0; i < edges.length; ++i) {
    g.addEdgeWeighted(edges[i][0].number, edges[i][1].number, parseFloat(edges[i][2]));
  }
  g.printAdjMat();
  let d = new Dijkstra(g);
  d.performDijkstra(0);
}



async function showShortestPath(v) {
  //shows the shortest path from source vertex to entered vertex v
  v -= 1;
  if (v >= vertices.length || v < 0 || isNaN(v) || v >= parent.length) {
    return; //invalid input
  }
  let currVertex = v;
  let r;
  while (parent[currVertex] != -1) {
    console.log(parent[currVertex]);
    highlightedEdges.push([currVertex, parent[currVertex]]);
    r = highlightUtil(1000);
    currVertex = parent[currVertex];
  }
}



function mousePressed() {

  if (!(mouseX >= radCircle / 2 && mouseX <= width - radCircle / 2 && mouseY >= radCircle / 2 && mouseY <= height - radCircle / 2)) {
    return; //outside, don't draw anaything
  }

  if (mouseButton == LEFT) {
    let position;
    position = myMap.pixelToLatLng(mouseX, mouseY);
    let v = new Vertex(position.lat, position.lng, length);
    length++;
    if (!isOverlapping(v)) {
      vertices.push(v);
    }
  } else if (mouseButton == RIGHT) {
    let v = isInside();
    if (v != null) {
      v.highlightVertex();
      if (nodeToJoin != null && nodeToJoin != v) {
        //TODO: check if already connected
        let distBetweenVertices = getDistanceFromLatLonInKm(v.x, v.y, nodeToJoin.x, nodeToJoin.y);
        edges.push([v, nodeToJoin, distBetweenVertices]);
        nodeToJoin = null;
      } else {
        //mark this node to be joined with another node later
        nodeToJoin = v;
      }
    }
  }
}


function draw() {
  clear();
  let uPos, vPos, u, v, dist;
  strokeWeight(2);
  //draw edges and show the edge weights
  for (let i = 0; i < edges.length; ++i) {
    u = edges[i][0];
    v = edges[i][1];
    dist = edges[i][2];
    uPos = myMap.latLngToPixel(u.x, u.y);
    vPos = myMap.latLngToPixel(v.x, v.y);
    strokeWeight(1);
    if (i == indexEdgeHighlight) {
      if (flag) {
        stroke(color(0, 0, 0));
        fill(0);
        textSize(20);
        text("Found shorter path", width - 500, 20);
        text(srcToV.toFixed(2) + " + " + edgeWt.toFixed(2) + " < " + currDist.toFixed(2), width - 500, 50);
        stroke(0);
      } else {
        stroke(color(255, 0, 0));
      }
    }
    strokeWeight(2);
    line(uPos.x, uPos.y, vPos.x, vPos.y);
    stroke(0);
    textSize(20);
    fill(255);
    text(dist, (uPos.x + vPos.x) / 2, (uPos.y + vPos.y) / 2);
    fill(0);
  }

  //draw highlighted edges from source vertex to current vertex
  for (let i = 0; i < highlightedEdges.length; ++i) {
    u = highlightedEdges[i][0];
    v = highlightedEdges[i][1];
    u = vertices[u];
    v = vertices[v];
    uPos = myMap.latLngToPixel(u.x, u.y);
    vPos = myMap.latLngToPixel(v.x, v.y);
    strokeWeight(5);
    stroke(color(255, 255, 51, 200));
    line(uPos.x, uPos.y, vPos.x, vPos.y);
    stroke(0);

  }

  //draw vertices
  strokeWeight(1);
  stroke(0);
  for (let i = 0; i < vertices.length; ++i) {
    if (i == 0) {
      fill(color(0, 0, 255, 100));
      vertices[0].color = color(0, 0, 255);
      vertices[i].drawVertex();
      fill(color(0, 0, 0, 100));
    } else {
      vertices[i].drawVertex();

    }
  }
  //legend
  fill(0, 0, 0, 200);
  rect(rectX1, rectY1, rectX2, rectY2);
  drawLegend(0, 0, color(0, 0, 255, 255), 1, "Source Vertex");
  drawLegend(0, 1, color(0, 0, 0, 150), 2, "Other Vertices");
  drawLegend(0, 2, color(255, 255, 51, 200), 3, "Shortest Path from Source", 13.5, 'line');
}

//JQuery
$(document).ready(function () {
  $('#sketch-holder').bind('contextmenu', function (e) {
    return false;
  });
  $("#start-btn").click(() => {
    setUpGraph();
  });
  $("#destination-btn").click(() => {
    if (!done) {
      return;
    }
    highlightedEdges = [];
    clear();
    var dest = $("#destination").val();
    showShortestPath(dest);
  });
});