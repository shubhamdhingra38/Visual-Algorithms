const images = [];
const cards = [];
let card_values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let groups = ['S', 'H', 'C', 'D'];
const down_scale = 5;
const shift_x = 180;
let c1;
const epsilon = 1.0;
const n_cards = 7;
let anyUpdating = false;
const speed_x = 1.5;
let xPointer = yPointer = -1;


class Card {
    constructor(xPos, yPos, img) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.img = img;
        this.xTarget = -1;
        this.yTarget = -1;
        this.updating = false;
    }
    drawCard() {
        if (this.updating) {
            strokeWeight(5);
            rect(this.xPos, this.yPos, this.img.img.width / down_scale, this.img.img.height / down_scale);
        }
        image(this.img.img, this.xPos, this.yPos, this.img.img.width / down_scale, this.img.img.height / down_scale);
    }
}


//Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    //positions of cards also needs to be swapped
    var currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        swap(array, currentIndex, randomIndex);
    }

    return array;
}

//swap elements at specified index of the global array
function swap(array, i, j) {
    let x1, x2, y1, y2;
    x1 = array[i].xPos;
    y1 = array[i].yPos;
    x2 = array[j].xPos;
    y2 = array[j].yPos;
    let obj = array[i];
    array[i] = array[j];
    array[j] = obj;
    array[j].xPos = x2;
    array[j].yPos = y2;
    array[i].xPos = x1;
    array[i].yPos = y1;
}

function swapAnim(i, j) {
    return new Promise((resolve, reject) => {
        (function waitForFoo() {
            if (!anyUpdating) {
                return resolve();
            }
            setTimeout(waitForFoo, 300);
        })();
    });
}

function waitAndMovePointer() {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, 1000);
    });
}

async function insertionSort(n_loaded) {
    let j;
    for (let i = 1; i < n_loaded; ++i) {
        j = i;
        xPointer = cards[i].xPos;
        yPointer = cards[i].yPos;
        while (j >= 1 && (cards[j].img.face_value < cards[j - 1].img.face_value)) {
            cards[j].updating = true;
            cards[j - 1].updating = true;
            anyUpdating = true;
            cards[j].xTarget = cards[j - 1].xPos;
            cards[j - 1].xTarget = cards[j].xPos;
            await swapAnim(j, j - 1);
            let obj = cards[j];
            cards[j] = cards[j - 1];
            cards[j - 1] = obj;
            j -= 1;
        }
        await waitAndMovePointer();
    }
    xPointer = yPointer = -1;
}

function refreshCards() {
    while (cards.length != 0) {
        cards.pop();
    }
    shuffleArray(images);
    for (let i = 0; i < n_cards; ++i) {
        img = images[i];
        c = new Card(i * shift_x, 200, img);
        cards.push(c);
    }
    xPointer = yPointer = -1;
}

function sortCards() {
    insertionSort(n_cards);
}

//path is variable for the path used for loading the images using Django's static tag
function loadCards() {
    for (let i = 0; i < card_values.length; ++i) {
        for (let j = 0; j < groups.length; ++j) {
            let face_value;
            if (isNaN(card_values[i])) {
                if (card_values[i] == 'A') {
                    face_value = 1; //ace
                } else {
                    face_value = 10; //K, Q, J
                }
            } else {
                face_value = parseInt(card_values[i]);
            }
            let obj = {
                'img': loadImage(path + 'cards/' + card_values[i] + groups[j] + '.png'),
                'face_value': face_value
            }
            images.push(obj);
        }
    }
}

function preload() {
    //to avoid asynchronous callbacks
    loadCards();
}

function setup() {
    let cnv = createCanvas(1366, 768);
    // background(200);
    let img, c;
    shuffleArray(images);
    for (let i = 0; i < n_cards; ++i) {
        img = images[i];
        c = new Card(i * shift_x, 200, img);
        cards.push(c);
    }
}


function draw() {
    let c;
    strokeWeight(1);
    clear();
    // circle(xPointer + images[0].img.width / (2 * down_scale), yPointer - 50, 30);
    if (xPointer != -1 && yPointer != -1) {
        strokeWeight(5);
        stroke(color(255, 0, 0));
        rect(xPointer, yPointer, images[0].img.width / down_scale, images[0].img.height / down_scale);
        stroke(1);
    }
    for (let i = 0; i < n_cards; ++i) {
        c = cards[i];
        if (c.updating) {
            if (abs(c.xTarget - c.xPos) <= epsilon) {
                c.updating = false;
                anyUpdating = false;
                c.xPos = c.xTarget; //snap to target
            } else {
                if (c.xTarget < c.xPos) {
                    cards[i].xPos -= speed_x;
                } else {
                    cards[i].xPos += speed_x;
                }
            }
        }
        c.drawCard();
    }
}

//jquery
$("document").ready(function () {
    $("#shuffle-btn").on("click", function () {
        refreshCards();
    });
    $("#sort-btn").on("click", function () {
        sortCards();
    });
});