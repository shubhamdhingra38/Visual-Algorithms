const popsize = 500;
let sz = 25; //number of points
let mutationRate = 0.2; //20%
let population = [];
let vert = [];
let cnv, sbtn;
let cnt = 1;
let sliderNumPoints, sliderMutRate;
let para1, para2;

function createRandomPoints() {
  for (let i = 0; i < sz; ++i) {
    v = createVector(random(40, width - 40), random(40, height - 40));
    vert.push(v);
  }
}

function resetPoints(){
  population = [];
  vert = [];
  sz = sliderNumPoints.value();
  createRandomPoints();

  for (let i = 0; i < popsize; i++) {
    population.push(shuffle(vert));
  }

  poolsize = sz * 20;
  mutationRate = sliderMutRate.value()/100;
  loop();

}



function setup() {

  cnv = createCanvas(windowWidth/1.5, windowHeight/1.5);
  cnv.parent('sketch-holder');
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y + 10);
  noLoop();

  
  sbtn = createButton("Start");
  addStopButton(cnv);
  sbtn.position(cnv.position().x + 200, cnv.position().y - 45);
  sbtn.mousePressed(resetPoints);


  sliderNumPoints = createSlider(10, 100, 50);
  sliderNumPoints.parent('sketch-holder');
  sliderNumPoints.position(cnv.position().x, cnv.position().y - 30);
  sliderNumPoints.style('width', '80px');
  para1 = createP("# Points");
  para1.style('color', color(0, 255, 0, 200));
  para1.parent('sketch-holder');
  para1.position(sliderNumPoints.position().x, sliderNumPoints.position().y - 25);
  para1.style('font-size', '13px');


  sliderMutRate = createSlider(0, 100, 50);
  sliderMutRate.parent('sketch-holder');
  sliderMutRate.position(cnv.position().x + 100, cnv.position().y - 30);
  sliderMutRate.style('width', '80px');
  para2 = createP("Mutation Rate", 5);
  para2.style('color', color(0, 255, 0, 200));
  para2.parent('sketch-holder');
  para2.position(sliderMutRate.position().x, sliderMutRate.position().y - 25);
  para2.style('font-size', '13px');

}


function draw() {
  strokeWeight(2);
  initialDraw();
  showbest();
  p = pool();
  reproduce(p);
}


function pathLength(s) {
  let sum = 0;
  for (let i = 0; i < sz; i++) {
    let d1 = s[i].dist(s[(i + 1) % sz]);
    sum += d1;
  }
  return sum;
}


function fitness(s) {
  // return 1 / (pathLength(s) + 1);
  return 1 / (pow(pathLength(s), 8) + 1); //a better fitness function, exponential
}

function windowResized(){
  resizeCanvas(windowWidth/1.5, windowHeight/2);
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y + 10);
  sbtn.position(cnv.position().x + 200, cnv.position().y - 45);
  sliderNumPoints.position(cnv.position().x, cnv.position().y - 30);
  para1.position(sliderNumPoints.position().x, sliderNumPoints.position().y - 25);
  sliderMutRate.position(cnv.position().x + 100, cnv.position().y - 30);
  para2.position(sliderMutRate.position().x, sliderMutRate.position().y - 25);
}

function showbest() {
  let best = 0;
  let bestf = 0;
  for (let i = 0; i < popsize; i++) {
    let curf = fitness(population[i]);
    if (curf > bestf) {
      bestf = curf;
      best = i;
    }
  }

  beginShape();
  for (let i = 0; i < sz; i++) {
    noFill();
    fill(color(0, 150, 0, 200));
    stroke(color(0, 255, 0, 200));
    circle(population[best][i].x, population[best][i].y, 12);
    vertex(population[best][i].x, population[best][i].y);
    fill(255);
    noStroke();
  }
  noFill();
  stroke(255);
  strokeWeight(2);
  endShape(CLOSE);

  textSize(13);
  stroke(0);
  fill(0);
  strokeWeight(0.2);
  text("Fitness: " + pathLength(population[best]).toFixed(3), 10, 30);

}


function mutate(s) {
  let mut = s;
  let k = random();
  while (k < mutationRate) {
    let i = 0;
    let j = 0;
    while (i == j) {
      i = floor(random(sz));
      j = floor(random(sz));
    }

    m = mut.slice(Math.min((i + 1) % sz, (j + 1) % sz), Math.max((i + 1) % sz, (j + 1) % sz)).reverse(); //reverse all elements between i and j
    l = mut.slice(0, Math.min((i + 1) % sz, (j + 1) % sz)); //elements before min(i,j)
    r = mut.slice(Math.max((i + 1) % sz, (j + 1) % sz), sz); //elements after max(i,j)
    mut = l.concat(m).concat(r);

    k = random();
  }
  return mut;
}


function pool() {
  let p = [];
  let sum = 0;
  for (let i = 0; i < popsize; i++) {
    sum += fitness(population[i]);
  }
  for (let i = 0; i < popsize; i++) {
    let n = fitness(population[i]) / sum * poolsize;
    for (let j = 0; j < n; j++) {
      p.push(population[i]);
    }
  }
  return p;
}


function reproduce(p) {
  population = [];
  for (let i = 0; i < popsize; i++) {
    path = mutate(random(p)); //select any from pool and mutate, no crossover
    population.push(path);
  }
}