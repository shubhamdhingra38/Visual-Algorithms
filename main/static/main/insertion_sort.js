const images = [];
const cards = [];
let card_values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let groups = ['S', 'H', 'C', 'D'];
const down_scale = 5;
const shift_x = 180;
let max_load = 13,
    min_load = 7;
let setLoad = false;
let c1;
const epsilon = 0.5;



class Card {
    constructor(xPos, yPos, img) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.img = img;
        this.xTarget = -1;
        this.yTarget = -1;
        this.updating = false;
    }
    translate() {
        this.xPos += 0.5;
    }
    drawCard() {
        image(this.img.img, this.xPos, this.yPos, this.img.img.width / down_scale, this.img.img.height / down_scale);
    }
}


//Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    //positions of cards also needs to be swapped
    var currentIndex = array.length,
        temporaryValue, randomIndex;
    let x1, x2, y1, y2;

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
        setTimeout(() => {
            cards[i].updating = false;
            cards[j].updating = false;
            console.log("stopped updating");
            resolve();
        }, 4500);
    });
}


async function insertionSort(n_loaded) {
    let j;
    for (let i = 1; i < n_loaded; ++i) {
        j = i;
        while (j >= 1 && (cards[j].img.face_value < cards[j - 1].img.face_value)) {
            cards[j].updating = true;
            cards[j - 1].updating = true;
            cards[j].xTarget = cards[j - 1].xPos;
            cards[j].yTarget = cards[j - 1].yPos;
            cards[j - 1].xTarget = cards[j].xPos;
            cards[j - 1].yTarget = cards[j].yPos;
            await swapAnim(j, j - 1);
            let obj = cards[j];
            cards[j] = cards[j - 1];
            cards[j - 1] = obj;
            j -= 1;
        }
    }
    console.log("done");
}

function refreshCards() {
    while (cards.length != 0) {
        cards.pop();
    }
    shuffleArray(images);
    for (let i = 0; i < 10; ++i) {
        img = images[i];
        c = new Card(i * shift_x, 200, img);
        cards.push(c);
    }
    setLoad = true;
}

function sortCards() {
    insertionSort(10);
    setLoad = true;
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
                'img': loadImage(path + '/' + card_values[i] + groups[j] + '.png'),
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
    background(200);
    let img, c;
    shuffleArray(images);
    for (let i = 0; i < 10; ++i) {
        img = images[i];
        c = new Card(i * shift_x, 200, img);
        cards.push(c);
    }
}

function draw() {
    let c;
    background(200);
    for (let i = 0; i < 10; ++i) {
        c = cards[i];
        if (c.updating) {
            if (abs(c.xTarget - c.xPos) <= epsilon) {
                c.updating = false;
                c.xPos = c.xTarget; //snap to target
            } else {
                if (c.xTarget < c.xPos) {
                    cards[i].xPos -= 1;
                } else {
                    cards[i].xPos += 1;
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