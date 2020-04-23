// Source image
let img;
// Processed pixels
let dest;

// Canvas
let cnv;
let cnv_w, cnv_h;

// Size of processed pixels
let w = 80;


//kernel specified by the user
let custom_kernel;
let use_custom = false;


// Where to process the pixels
let xstart = 0;
let ystart = 0;

let im_w, im_h, im_x, im_y; //width, height, offset_x, offset_y of image

//sharpen kernel
const identity_kernel = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0]
];

//predefined filters
const edge_detection = [
  [1, 0, -1],
  [0, 0, 0],
  [-1, 0, 1]
];

const sharpen = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0]
];

const gaussian_blur = [
  [1/16, 2/16, 1/16],
  [2/16, 4/16, 2/16],
  [1/16, 2/16, 1/16]
];

let kernel = identity_kernel;
let maxpooling;

// Load an image
function preload() {
  img = loadImage(path + img_name);
  //downscale image to fit the size
}

function downScaleImage(){

  let aspectRatio;

  //downscale image
  aspectRatio = img.width/img.height;

  if(img.width > windowWidth || img.height > windowHeight){
    if(aspectRatio > 1){
      //width is more
      let newWidth = windowWidth/2;
      let newHeight = (img.height * newWidth) / img.width;
      img.resize(newWidth, newHeight);
    }
    else{
      //height is more
      let newHeight = windowHeight;
      let newWidth = (img.width * newHeight) / img.height;
      img.resize(newWidth, newHeight);
    }
  }
  im_w = img.width;
  im_h = img.height;
}

function setup() {
  cnv = createCanvas(img.width, img.height-100);
  cnv.parent("my-sketch");
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  cnv.position(windowWidth/6, 20);
  // turn off HPDI displays (like retina)
  pixelDensity(1);
  dest = createImage(w, w);
  maxpooling = createCheckbox('maxpooling');
  // Button to randomize weights
  let button = createButton('randomize kernel');
  button.mousePressed(randomizekernel);

  // Pick random weights for the pixels
  function randomizekernel() {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        kernel[i][j] = random(-1, 1);
      }
    }
  }

  
  downScaleImage();
}

function draw() {
  clear();
  image(img, 0, 0, img.width, img.height);

  //draw a rectagle around image
  strokeWeight(4);
  stroke(color(0, 255, 0, 200));
  rect(0, 0, im_w, im_h);
  strokeWeight(1);

  xstart = Math.round(mouseX);
  ystart = Math.round(mouseY);
  let xend = xstart + w;
  let yend = ystart + w;
  let kernelsize = 3;


  dest.loadPixels();
  img.loadPixels();


  //the mouse must be inside image boundaries
  if(isMouseInside(0, img.width - (xend-xstart),
    0, img.height - (yend-ystart))){
    for (let x = 0; x < dest.width; x++) {
      for (let y = 0; y < dest.height; y++) {
        let result = convolution(img, x + xstart, y + ystart, kernel, kernelsize);
        let index = (x + y * dest.width) * 4;
        dest.pixels[index + 0] = result[0];
        dest.pixels[index + 1] = result[1];
        dest.pixels[index + 2] = result[2];
        dest.pixels[index + 3] = 255;
      }
    }
    dest.updatePixels();
    image(dest, xstart, ystart);
    if (maxpooling.checked()) {
      maxpool(dest, 5, xstart, ystart);
    }
    stroke(0);
    noFill();
    rectMode(CORNERS);
    rect(xstart, ystart, xend, yend);
  }
}

function updateFilter(new_filter){
  use_custom = true;
  kernel = new_filter;
}


function convolution(img, x, y, kernel, kernelsize) {

  let rsum = 0.0;
  let gsum = 0.0;
  let bsum = 0.0;

  let offset = floor(kernelsize / 2);

  for (let i = 0; i < kernelsize; i++) {
    for (let j = 0; j < kernelsize; j++) {

      let xpos = x + i - offset;
      let ypos = y + j - offset;
      let index = (xpos + img.width * ypos) * 4;

      index = constrain(index, 0, img.pixels.length - 1);

      // Calculate the convolution
      rsum += img.pixels[index + 0] * kernel[i][j];
      gsum += img.pixels[index + 1] * kernel[i][j];
      bsum += img.pixels[index + 2] * kernel[i][j];
    }
  }
  return [rsum, gsum, bsum];
}

function maxpool(img, skip, xoff, yoff) {
  for (let x = 0; x < img.width; x += skip) {
    for (let y = 0; y < img.height; y += skip) {
      let brightest = findMax(img, x, y, skip);
      fill(brightest[0], brightest[1], brightest[2]);
      noStroke();
      rectMode(CORNER);
      rect(x + xoff, y + yoff, skip, skip);
    }
  }
}

function findMax(img, xstart, ystart, skip) {
  let record = 0;
  let brightest = [0, 0, 0];
  for (let x = 0; x < skip; x++) {
    for (let y = 0; y < skip; y++) {
      let index = ((x + xstart) + (y + ystart) * img.width) * 4;
      let r = img.pixels[index + 0];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];
      let sum = r + g + b;
      if (sum > record) {
        record = sum;
        brightest = [r, g, b];
      }
    }
  }
  return brightest;
}

function windowResized(){
  downScaleImage();
  resizeCanvas(img.width, img.height-100);
  cnv.position(20, 20);
  cnv_w = cnv.width;
  cnv_h = cnv.height;
}

//jquery
$(document).ready(function(){

  //for kernel radio button input
  $('input[type=radio][name=kernel]').change(function() {
    if(this.value == "sharpen"){
      kernel = sharpen;
    }
    else if(this.value == "edge-detection"){
      kernel = edge_detection;
    }
    else{
      kernel = identity_kernel;
    }
    
  });

  //for responsiveness
  $( window ).resize(function() {
    console.log('resized');
    console.log(cnv.width, cnv.height);
    $('#my-sketch').css("width", cnv.width);
    $('#my-sketch').css("height", cnv.height + 40);
  });

  $('#custom-filter').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
        url : $(this).attr('action'),
        type: "GET",
        data: $(this).serialize(),
        success: function (data) {
          let newFilter = [];
          let val;
          let invalid = false;
          for(let i=0; i<3; ++i){
            let arr = [];
            if(invalid){
              break;
            }
            for(let j=0; j<3; ++j){
              let field = "field"+i+j;
              val = parseInt(jQuery('input[name=' + field + ']').val());
              if(isNaN(val)){
                invalid = true;
                break;
              }
              else if(!(val >= 0 && val <= 1)){
                invalid = true;
                break;
              }
              else{
                arr.push(val);
              }
            }
            newFilter.push(arr);
          }
          if(!invalid){
            updateFilter(newFilter);
          }
          else{
            alert("Invalid values for custom filter!");
          }
        },
        error: function (jXHR, textStatus, errorThrown) {
            alert(errorThrown);
        }
    });
  });
})
