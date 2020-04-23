let x_vals = [];
let y_vals = [];

let cnv;
let sliderLearningRate;

let l; //mean squared error
let num_loss = 0.0;

let m, b;

const f = (pred, label) => pred.sub(label).square().mean(); // mean squared error


let learningRate = 0.5;
let optimizer;


function windowResized(){
  resizeCanvas(windowWidth/2, windowHeight/2);
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, 70);
  sliderLearningRate.position(cnv.position().x, cnv.position().y - 30);
  para1.position(sliderLearningRate.position().x, sliderLearningRate.position().y - 25);
}


function setup() {
  cnv = createCanvas(windowWidth/2, windowHeight/2);
  cnv.parent('sketch-holder');
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, 70);
  m = tf.variable(tf.scalar(random(1)));
  b = tf.variable(tf.scalar(random(1)));

  sliderLearningRate = createSlider(1, 50, 50);
  sliderLearningRate.parent('sketch-holder');
  sliderLearningRate.position(cnv.position().x, cnv.position().y - 30);
  sliderLearningRate.style('width', '80px');
  para1 = createP("Learning Rate");
  para1.style('color', color(0, 255, 0, 200));
  para1.parent('sketch-holder');
  para1.position(sliderLearningRate.position().x, sliderLearningRate.position().y - 25);
  para1.style('font-size', '13px');
  optimizer = tf.train.sgd(learningRate);
  sliderLearningRate.mouseClicked(() => {
    learningRate = sliderLearningRate.value()/100;
    optimizer =  tf.train.sgd(learningRate);
  });
}

function loss(pred, labels) {
  return pred.sub(labels).square().mean();
}

function predict(x) {
  const xs = tf.tensor1d(x);
  // y = mx + b;
  const ys = xs.mul(m).add(b);
  return ys;
}

function mousePressed() {
  if(isMouseInside(0, width, 0, height)){
    let x = map(mouseX, 0, width, 0, 1);
    let y = map(mouseY, 0, height, 1, 0);
    x_vals.push(x);
    y_vals.push(y);
  }
}

function draw() {
  clear();
  initialDraw();
  tf.tidy(() => {
    if (x_vals.length > 0) {
      const ys = tf.tensor1d(y_vals);
      optimizer.minimize(() => loss(predict(x_vals), ys));
    }
  });

  const lineX = [0, 1];

  const ys = tf.tidy(() => {
    if (x_vals.length > 0) {
      l = f(tf.tensor1d(x_vals).mul(m).add(b), y_vals);
      l.data().then((res) => {
        num_loss = res;
      });
    }
    return predict(lineX);
  });


  let lineY = ys.dataSync();
  ys.dispose();

  let x1 = map(lineX[0], 0, 1, 0, width);
  let x2 = map(lineX[1], 0, 1, 0, width);

  let y1 = map(lineY[0], 0, 1, height, 0);
  let y2 = map(lineY[1], 0, 1, height, 0);
  let slope = (y2 - y1) / (x2 - x1);

  stroke(0);

  let x, y;
  //mean squared error
  for (let i = 0; i < x_vals.length; ++i) {
    strokeWeight(2);
    x = map(x_vals[i], 0, 1, 0, width);
    y = map(y_vals[i], 0, 1, height, 0);

    let yL = y2 - slope * (x2 - x);
    line(x, y, x, yL);
  }

  stroke(255);
  strokeWeight(8);
  for (let i = 0; i < x_vals.length; i++) {
    let px = map(x_vals[i], 0, 1, 0, width);
    let py = map(y_vals[i], 0, 1, height, 0);
    fill(color(0, 255, 255, 200));
    stroke(color(255, 0, 0, 200));
    strokeWeight(10);
    point(px, py);
    stroke(0);
  }
  strokeWeight(4);
  stroke(color(0, 255, 0, 200));
  line(x1, y1, x2, y2);

  strokeWeight(1);
  stroke(color(0, 0, 0));
  fill(color(0, 0, 0));
  textSize(16);
  text("Loss:  " + parseFloat(num_loss).toFixed(4), 20, 20);
}