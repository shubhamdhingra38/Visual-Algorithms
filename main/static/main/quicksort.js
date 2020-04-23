let values = [];
let cnv;
let sliderSpeed, sliderNum;
let para1, para2;
let states = [];
let numPoints = 50;
let sleepTime = 50;

function windowResized(){
    resizeCanvas(windowWidth/1.5, windowHeight/2);
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    cnv.position(x, 70);
    sliderSpeed.position(cnv.position().x, cnv.position().y - 30);
    para1.position(sliderSpeed.position().x, sliderSpeed.position().y - 25);
    sliderNum.position(cnv.position().x + 110, cnv.position().y - 30);
    para2.position(sliderNum.position().x, sliderNum.position().y - 25);
}


function initRandomArray(){
    values = new Array(numPoints);
    for (let i = 0; i < values.length; i++) {
        values[i] = random(height);
        states[i] = -1;
    }
}

function setup() {
  cnv = createCanvas(windowWidth/1.5, windowHeight/2);
  cnv.parent('sketch-holder');
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, 70);

  sliderSpeed = createSlider(1, 100, 50);
  sliderSpeed.parent('sketch-holder');
  sliderSpeed.position(cnv.position().x, cnv.position().y - 30);
  sliderSpeed.style('width', '80px');
  para1 = createP("Speed");
  para1.style('color', color(0, 255, 0, 200));
  para1.parent('sketch-holder');
  para1.position(sliderSpeed.position().x, sliderSpeed.position().y - 25);

  sliderNum = createSlider(10, 100, 200);
  sliderNum.parent('sketch-holder');
  sliderNum.position(cnv.position().x + 110, cnv.position().y - 30);
  sliderNum.style('width', '80px');
  para2 = createP("Size");
  para2.style('color', color(0, 255, 0, 200));
  para2.parent('sketch-holder');
  para2.position(sliderNum.position().x, sliderNum.position().y - 25);

  sliderSpeed.mouseClicked(() => {
    speed = sliderSpeed.value();
    sleepTime = 100-speed;
  });

  sliderNum.mouseClicked(() => {
    numPoints = sliderNum.value();
    initRandomArray();
    quickSort(values, 0, values.length - 1);
  });

  w = width/numPoints;
  console.log(w);
  initRandomArray();
  quickSort(values, 0, values.length - 1);
}

async function quickSort(arr, start, end) {
  if (start >= end) {
    return;
  }
  let index = await partition(arr, start, end);
  states[index] = -1;

  await Promise.all([
    quickSort(arr, start, index - 1),
    quickSort(arr, index + 1, end)
  ]);
}

async function partition(arr, start, end) {
  for (let i = start; i < end; i++) {
    states[i] = 1;
  }

  let pivotValue = arr[end];
  let pivotIndex = start;
  states[pivotIndex] = 0;
  for (let i = start; i < end; i++) {
    if (arr[i] < pivotValue) {
      await swap(arr, i, pivotIndex);
      states[pivotIndex] = -1;
      pivotIndex++;
      states[pivotIndex] = 0;
    }
  }
  await swap(arr, pivotIndex, end);

  for (let i = start; i < end; i++) {
    if (i != pivotIndex) {
      states[i] = -1;
    }
  }

  return pivotIndex;
}

function draw() {
  initialDraw();
  for (let i = 0; i < values.length; i++) {
    noStroke();
    if (states[i] == 0) {
      fill(color(255, 0, 0, 200));
    } else if (states[i] == 1) {
      fill(color(0, 255, 0, 100));
    } else {
      fill(255);
    }
    rect(i * w, height - values[i], w, values[i]);
  }
}

async function swap(arr, a, b) {
  await sleep(sleepTime);
  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
