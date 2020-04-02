const images = [];
let card_values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let groups = ['S', 'H', 'C', 'D'];
const down_scale = 5;
const shift_x = 70;
let max_load = 13,
    min_load = 7;
let setLoad = false;

//Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

//swap elements at specified index of the global array
function swap(i, j) {
    let obj = images[i];
    images[i] = images[j];
    images[j] = obj;
}

function insertionSort(n_loaded) {
    let j;
    for (let i = 1; i < n_loaded; ++i) {
        j = i;
        while (j >= 1 && (images[j].face_value < images[j - 1].face_value)) {
            swap(j, j - 1);
            j -= 1;
        }
    }
}

function refreshCards() {
    shuffleArray(images);
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

function drawCards(n_loaded) {
    let img;
    for (let i = 0; i < n_loaded; ++i) {
        img = images[i];
        image(img.img, i * shift_x, 0, img.img.width / down_scale, img.img.height / down_scale);
    }
}

function preload() {
    //to avoid asynchronous callbacks
    loadCards();
}

function setup() {
    createCanvas(1366, 768);
    background(200);

    // insertionSort(10);
    // for (let i = 0; i < 10; ++i) {
    //     img = images[i];
    //     // tint(255, 0, 0, 50);
    //     image(img.img, i * shift_x, 300, img.img.width / down_scale, img.img.height / down_scale);
    // }
}

function draw() {
    if (setLoad) {
        background(200); //reset background
        setLoad = false;
        drawCards(10);
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