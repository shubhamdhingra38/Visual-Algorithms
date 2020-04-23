let min_x = Number.POSITIVE_INFINITY,
    min_idx = -1;
const points = [];
const hull = []; //points in the hull
let n_points = 10;
let p, q;
let done = true;
let idx = 0;
let cnv; //canvas
var value;


class Point {
    constructor(xPos, yPos) {
        this.x = xPos;
        this.y = yPos;
    }
    plot() {
        point(this.x, this.y);
    }
}


//compute cross product to find the left most vertex in hull
function crossProduct(a, b, c) {
    //returns the cross product of vectors ab and ac
    let x1, x2, y1, y2;
    x1 = a.x - b.x;
    y1 = a.y - b.y;
    x2 = a.x - c.x;
    y2 = a.y - c.y;
    //(x1, y1), (x2, y2) vectors with origin at point a
    return x1 * y2 - x2 * y1;
}

function centerCanvas() {
    let x = (windowWidth - width) / 2;
    let y = 10;
    cnv.position(x, y);
}

function windowResized() {
    centerCanvas();
}

function setPoints() {
    let x, y;
    for (let i = 0; i < n_points; ++i) {
        x = random(1, width);
        y = random(40, height);
        let p = new Point(x, y);
        points.push(p);
    }
    for (let i = 0; i < n_points; ++i) {
        x = points[i].x;
        if (x < min_x) {
            min_x = x;
            min_idx = i;
        }
        points[i].plot();
    }
    p = min_idx;
    done = false;
    hull.push(p);
    q = (p + 1) % n_points; //pick the next point as candidate
}

function windowResized() {

}


function setup() {
    cnv = createCanvas(windowWidth, windowHeight - 200);
    cnv.parent('sketch-holder');
    centerCanvas();
}

function resetSketch() {
    //reset stuff
    done = true;
    for (let i = 0; i < n_points; ++i) {
        hull.pop();
    }
    for (let i = 0; i < n_points; ++i) {
        points.pop();
    }
    min_x = Number.POSITIVE_INFINITY;
    min_idx = -1;
    n_points = value;
    loop();
    setPoints();
}


function draw() {
    // let val = slider.value();
    // console.log(val);
    clear();
    background('rgba(255, 255, 255, 0.1)');
    stroke(0, 255, 0, 220);
    strokeWeight(13);
    for (let i = 0; i < points.length; ++i) {
        points[i].plot();
    }

    strokeWeight(4);
    stroke(232, 14, 94);
    fill(232, 14, 94, 50);
    beginShape();
    for (let p of hull) {
        vertex(points[p].x, points[p].y);
    }
    endShape(CLOSE);
    for (let i = 0; i < hull.length; ++i) {
        stroke(color(255, 0, 0));
        strokeWeight(5);
        points[hull[i]].plot();
    }
    if (!done) {
        stroke(color(0, 255, 0));
        strokeWeight(5);
        points[p].plot();


        stroke(color(207, 17, 102));
        strokeWeight(5);
        points[q].plot();

        stroke(color(255, 255, 255));
        strokeWeight(3);
        line(points[p].x, points[p].y, points[q].x, points[q].y);

        if (idx < n_points) {
            stroke(color(255, 255, 0, 200));
            line(points[q].x, points[q].y, points[idx].x, points[idx].y);

            if (crossProduct(points[p], points[q], points[idx]) < 0) {
                q = idx;
            }
        }

        if (idx == n_points) {
            if (q == min_idx) {
                done = true;
                noLoop();

            } else {
                hull.push(q);
                p = q;
                q = (p + 1) % n_points;
            }
            idx = -1;
        }
        idx += 1;
    }
}


// jquery
$("document").ready(function () {
    // $("#myRange").sl
    $("#btn-start").click(function () {
        value = $("#myRange").val();
        resetSketch();
    });
})