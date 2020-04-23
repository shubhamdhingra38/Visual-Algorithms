let lifetime;
let population;
let lifecycle;
let target;
let cnv;
const obstacles = [];
let sbtn;
let cnt = 1;


class DNA {
  constructor(newgenes) {
    this.maxforce = 0.1;
    if (newgenes) {
      this.genes = newgenes;
    } else {
      this.genes = [];
      for (let i = 0; i < lifetime; i++) {
        let angle = random(TWO_PI);
        this.genes[i] = createVector(cos(angle), sin(angle));
        this.genes[i].mult(random(0, this.maxforce));
      }
    }
    this.genes[0].normalize();
  }
  crossover(partner) {
    let child = new Array(this.genes.length);
    let crossover = int(random(this.genes.length));
    for (let i = 0; i < this.genes.length; i++) {
      if (i > crossover) child[i] = this.genes[i];
      else child[i] = partner.genes[i];
    }
    let newgenes = new DNA(child);
    return newgenes;
  }

  mutate(m) {
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) < m) {
        let angle = random(TWO_PI);
        this.genes[i] = createVector(cos(angle), sin(angle));
        this.genes[i].mult(random(0, this.maxforce));
        if (i == 0) this.genes[i].normalize();
      }
    }
  }
}

class Obstacle {
  constructor(x, y, w, h, isTarget) {
    this.position = createVector(x, y);
    this.w = w;
    this.h = h;
    this.isTarget = isTarget;
  }

  display() {
    stroke(0);
    if(this.isTarget){
      fill(0, 255, 150);
    }
    else{
      fill(127, 127, 127);
    }
    strokeWeight(2);
    rect(this.position.x, this.position.y, this.w, this.h);
  }

  contains(spot) {
    if (spot.x > this.position.x && spot.x < this.position.x + this.w && spot.y > this.position.y && spot.y < this.position.y + this.h) {
      return true;
    } else {
      return false;
    }
  }

}

class Population {
  constructor(m, num){
  this.mutationRate = m; //mutation rate
  this.population = new Array(num);
  this.matingPool = [];
  this.generations = 0; //number of generations
  for (let i = 0; i < this.population.length; i++) {
    let position = createVector(width / 2, height + 20);
    this.population[i] = new Rocket(position, new DNA(), this.population.length);
  }
  }


  live(os) {
    for (let i = 0; i < this.population.length; i++) {
      this.population[i].checkTarget();
      this.population[i].run(os);
    }
  }

  targetReached() {
    for (let i = 0; i < this.population.length; i++) {
      if (this.population[i].hitTarget) return true;
    }
    return false;
  }

  fitness(){
    for (let i = 0; i < this.population.length; i++) {
      this.population[i].fitness();
    }
  }

  selection(){
    this.matingPool = [];

    let maxFitness = this.getMaxFitness();

    for (let i = 0; i < this.population.length; i++) {
      let fitnessNormal = map(this.population[i].getFitness(), 0, maxFitness, 0, 1);
      let n = int(fitnessNormal * 100); // Arbitrary multiplier
      for (let j = 0; j < n; j++) {
        this.matingPool.push(this.population[i]);
      }
    }
  }

  reproduction(){
    for (let i = 0; i < this.population.length; i++) {
      let m = int(random(this.matingPool.length));
      let d = int(random(this.matingPool.length));
      let mom = this.matingPool[m];
      let dad = this.matingPool[d];
      let momgenes = mom.getDNA();
      let dadgenes = dad.getDNA();
      let child = momgenes.crossover(dadgenes);
      child.mutate(this.mutationRate);
      let position = createVector(width / 2, height + 20);
      this.population[i] = new Rocket(position, child, this.population.length);
    }
    this.generations++;
  }

  getGenerations(){
    return this.generations;
  }

  getMaxFitness(){
    let record = 0;
    for (let i = 0; i < this.population.length; i++) {
      if (this.population[i].getFitness() > record) {
        record = this.population[i].getFitness();
      }
    }
    return record;
  }

}

class Rocket{
  constructor(pos, dna, totalRockets){
  this.acceleration = createVector();
  this.velocity = createVector();
  this.position = pos.copy();
  this.r = 4;
  this.dna = dna;
  this.finishTime = 0;
  this.recordDist = 10000;

  this.fitnessScore = 0;
  this.geneCounter = 0;
  this.hitObstacle = false;
  this.hitTarget = false;
  }

  fitness() {
    if (this.recordDist < 1) this.recordDist = 1;

    this.fitnessScore = (1 / (this.finishTime * this.recordDist));

    this.fitnessScore = pow(this.fitnessScore, 4);

    if (this.hitObstacle) this.fitnessScore *= 0.1;
    if (this.hitTarget) this.fitnessScore *= 2;
  }

  run(os) {
    if (!this.hitObstacle && !this.hitTarget) {
      this.applyForce(this.dna.genes[this.geneCounter]);
      this.geneCounter = (this.geneCounter + 1) % this.dna.genes.length;
      this.update();
      this.obstacles(os);
    }
    if (!this.hitObstacle) {
      this.display();
    }
  }

  checkTarget() {
    let d = dist(this.position.x, this.position.y, target.position.x, target.position.y);
    if (d < this.recordDist) this.recordDist = d;

    if (target.contains(this.position) && !this.hitTarget) {
      this.hitTarget = true;
    } else if (!this.hitTarget) {
      this.finishTime++;
    }
  }

  obstacles(os) {
    for (let i = 0; i < os.length; i++) {
      let obs = os[i];
      if (obs.contains(this.position)) {
        this.hitObstacle = true;
      }
    }
  }

  applyForce(f) {
    this.acceleration.add(f);
  }


  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    let theta = this.velocity.heading() + PI / 2;
    fill(200, 100);
    stroke(0);
    strokeWeight(1);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);

    rectMode(CENTER);
    fill(0);

    fill(255, 0, 255, 150);
    beginShape(TRIANGLES);
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape();

    pop();
  }

  getFitness() {
    return this.fitnessScore;
  }

  getDNA() {
    return this.dna;
  }

  stopped() {
    return this.hitObstacle;
  }
}


function setup() {
  cnv = createCanvas(windowWidth/1.5, windowHeight/2);
  cnv.parent('sketch-holder');
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
  lifetime = 300;
  lifecycle = 0;
  recordtime = lifetime;
  target = new Obstacle(width / 2 - 12, 24, 24, 24, true);
  let mutationRate = 0.01;
  population = new Population(mutationRate, 50);
  obstacles.push(new Obstacle(width / 2 - 100, height / 2, 200, 10));
  sbtn = createButton("Stop");
  addStopButton(cnv);
  sbtn.position(cnv.position().x, cnv.position().y - 45);
}

function windowResized(){
  resizeCanvas(windowWidth/1.5, windowHeight/2);
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
  sbtn.position(cnv.position().x, cnv.position().y - 45);

}

function draw() {
  initialDraw();
  // background(200);
  target.display();

  if (lifecycle < lifetime) {
    population.live(obstacles);
    if ((population.targetReached()) && (lifecycle < recordtime)) {
      recordtime = lifecycle;
    }
    lifecycle++;
  } else {
    lifecycle = 0;
    population.fitness();
    population.selection();
    population.reproduction();
  }

  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].display();
  }
  fill(0);
  noStroke();
  text("Generation #: " + population.getGenerations(), 10, 18);
}

function mousePressed() {
  if(isMouseInside(0, width + cnv.position().x, 0, height)){
    if (mouseButton == LEFT) { //move the target if inside
        target.position.x = mouseX;
        target.position.y = mouseY;
      }
    else if(mouseButton == RIGHT){ //add new obstacles
      let obs = new Obstacle(mouseX, mouseY, random(50, 150), random(20, 50));
      obstacles.push(obs);
    }
  }
}


//jquery to disable right click pop-up
$("document").ready(function () {
  $('#sketch-holder').bind('contextmenu', function (e) {
    return false;
  });
});