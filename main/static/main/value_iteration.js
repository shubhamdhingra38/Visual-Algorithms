//Gridworld
//Author: Shubham Dhingra


let widthBox, heightBox;
let start, end;
const gridSize = 5; //n x n grid


let solutionFound;

let sliderGamma;
let done = false;

//default end at top left start at bottom right
end = {
    'x': 0,
    'y': 0
};
start = {
    'x': gridSize - 1,
    'y': gridSize - 1
};

let cells = [];
let values = [];
let policy = [];
let blockages = [];
let blockStates = [];

let agent;

function waitUntil(t) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res("done");
        }, t);
    });
}

class Agent {
    constructor(env) {
        this.num_states = env.num_states;
        this.num_actions = env.num_actions;
        this.actions = env.actions;
        this.valueFunction = [];
        this.assignRandom(); //sequence of value function for all states
        this.policy = []; //maps state to action
        this.epsilon = 0.05; //maximum allowed difference in value function to accept convergence finally
        this.discountFactor = 0.95; //gamma value
        this.converged = false;
        this.state = {
            'x': 0,
            'y': 0
        }; //initial state;
    }

    assignRandom() {
        //arbitrary initialization for value function
        for (let i = 0; i < this.num_states; ++i) {
            this.valueFunction.push(0); //value is between 0 and 1
        }
    }


    getCoordinates(idx) {
        return {
            'x': idx % gridSize,
            'y': Math.floor(idx / gridSize)
        };
    }

    getIndex(coordinates) {
        return coordinates.y * gridSize + coordinates.x;
    }

    updateValueFunction(env) {
        //while not done (value function converges using epsilon value), repeat this
        let newValueFunction = [];
        for (let i = 0; i < this.num_states; ++i) {
            newValueFunction.push(0);
        }
        let nextState, reward, done;
        let result;
        for (let i = 0; i < this.num_states; ++i) {
            //if this a blocked state, skip it
            if (blockStates[i] == 1) {
                continue;
            }
            //for each state
            let r = Number.NEGATIVE_INFINITY; //best reward
            let bestAction = -1; //select action which maximizes this
            for (let j = 0; j < this.num_actions; ++j) {
                result = env.step(j, this.getCoordinates(i)); //take action j from state i
                nextState = result.obs;
                reward = result.reward;
                done = result.done;
                let currReward = reward + this.discountFactor * this.valueFunction[this.getIndex(nextState)];
                //immediate reward + discounted future reward according to bellman equation
                if (currReward > r) {
                    r = currReward;
                    bestAction = j;
                }
            }
            newValueFunction[i] = r; //best possible reward from this state
        }
        this.converged = this.hasConverged(this.valueFunction, newValueFunction);
        if (!this.converged) {
            this.valueFunction = newValueFunction;
        }
    }

    hasConverged(v1, v2) {
        let maxDiff = 0;
        for (let i = 0; i < v1.length; ++i) {
            maxDiff = Math.max(Math.abs(v1[i] - v2[i]), maxDiff);
        }
        if (maxDiff <= this.epsilon) {
            return true;
        }
        return false;
    }

    calcOptimalPolicy(env) {
        //after the value function converges
        for (let i = 0; i < this.num_states; ++i) {
            let r = Number.NEGATIVE_INFINITY;
            let bestAction = -1;
            let result, reward, nextState;
            for (let j = 0; j < this.num_actions; ++j) {
                result = env.step(j, this.getCoordinates(i));
                nextState = result.obs;
                reward = result.reward;
                let currReward = reward + this.discountFactor * this.valueFunction[this.getIndex(nextState)];
                if (currReward > r) {
                    r = currReward;
                    bestAction = j;
                }
            }
            //argmax a over reward
            this.policy[i] = bestAction;
        }
    }
}

class Env {
    constructor(deterministic) {
        this.num_actions = 4; //4 directions
        this.deterministic = deterministic; //effects state transition probabilities
        this.num_states = gridSize * gridSize;
        this.actions = {
            0: 'U',
            1: 'D',
            2: 'L',
            3: 'R'
        };
    }

    isValid(action, state) {
        //is the action valid given the state (prevents moving outside bounds)
        if (action == 0) {
            //up
            if (state.y - 1 < 0) {
                return false;
            }
        } else if (action == 1) {
            //down
            if (state.y + 1 >= gridSize) {
                return false;
            }
        } else if (action == 2) {
            //left
            if (state.x - 1 < 0) {
                return false;
            }
        } else {
            //right
            if (state.x + 1 >= gridSize) {
                return false;
            }
            //now checking for blockages if move is valid
            let possibleNextState = {
                'x': state.x,
                'y': state.y
            };
            if (action == 0) {
                possibleNextState.y = possibleNextState.y - 1;
            } else if (action == 1) {
                possibleNextState.y = possibleNextState.y + 1;
            } else if (action == 2) {
                possibleNextState.x = possibleNextState.x - 1;
            } else {
                possibleNextState.x = possibleNextState.x + 1;
            }
            for (let i = 0; i < blockages.length; ++i) {
                if (possibleNextState.x == blockages[i].x && possibleNextState.y == blockages[i].y) {
                    return false;
                }
            }
        }

        return true; //valid
    }

    step(action, currState) {
        //take a given step
        let obs, reward, done;
        done = false;
        reward = 0;
        if (this.deterministic) {
            //if it is a valid action, always take the step
            if (this.isValid(action, currState)) {
                if (action == 0) {
                    currState.y = currState.y - 1;
                } else if (action == 1) {
                    currState.y = currState.y + 1;
                } else if (action == 2) {
                    currState.x = currState.x - 1;
                } else {
                    currState.x = currState.x + 1;
                }
                //is the current state in final position
                if (currState.x == end.x && currState.y == end.y) {
                    reward = 1;
                    done = true; //end of episode
                }
                obs = currState;
            } else {
                //invalid action, stay in the same state
                obs = currState;
            }
        } else {
            //with a slight chance, take a random action despite given action taken by agent
            //TODO
        }
        return {
            'obs': obs,
            'done': done,
            'reward': reward
        };
    }

}


class Cell {
    constructor(x, y, num) {
        this.x = x;
        this.y = y;
        this.val = '0.00'; //value function
        this.pol = ''; //optimal policy
        this.num = num;
        this.highlight = false;
        this.highlightColor = null;
    }

    display() {
        fill(127);
        if (this.highlight) {
            fill(this.highlightColor);
        }
        rect(this.x, this.y, widthBox, heightBox);
        fill(0);
        textSize(16);
        text(this.val, this.x + widthBox / 2, this.y + heightBox / 4);
        textSize(25);
        text(this.pol, this.x + widthBox / 2.5, this.y + heightBox / 1.5);
        stroke(0);
    }

}

async function valueIteration() {
    let env = new Env(true);
    agent = new Agent(env);
    agent.discountFactor = sliderGamma.value() / 100;

    for (let i = 0; i < 100; ++i) {
        agent.updateValueFunction(env);
        if (agent.converged) {
            break;
        }
        let wait = await waitUntil(200);
        for (let j = 0; j < agent.num_states; ++j) {
            values[j] = agent.valueFunction[j];
            agent.calcOptimalPolicy(env);
            policy[j] = agent.actions[agent.policy[j]];
        }
    }
    // noLoop();
    done = true;
}


function initiateEnvironment() {
    done = false;
    cells = [];
    for (let i = 0; i < gridSize * gridSize; ++i) {
        blockStates.push(0);
    }
    values = [];
    policy = [];
    widthBox = width / gridSize;
    heightBox = height / gridSize;
    let counter = 0;
    for (let i = 0; i < height; i += heightBox) {
        for (let j = 0; j < width; j += widthBox) {
            counter += 1;
            let c = new Cell(j, i, counter);
            c.text = counter;
            cells.push(c);
        }
    }
}

function setup() {
    let cnv = createCanvas(400, 400);
    cnv.position(50, 50);
    initiateEnvironment();
    sliderGamma = createSlider(0, 100, 50); //for gamma
    sliderGamma.position(50, 10);
    sliderGamma.style('width', '80px');
}

function mousePressed() {
    if (mouseButton == LEFT || mouseButton == CENTER || mouseButton == RIGHT) {
        for (let i = 0; i < cells.length; ++i) {
            cells[i].highlight = false;
        }
        if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
            for (let i = 0; i < cells.length; ++i) {
                if (cells[i].x < mouseX && mouseX < cells[i].x + widthBox &&
                    cells[i].y < mouseY && mouseY < cells[i].y + heightBox) {
                    let startIdx, endIdx;
                    startIdx = gridSize * start.y + start.x;
                    endIdx = gridSize * end.y + end.x;
                    if (mouseButton == LEFT) {
                        //change position of start
                        cells[startIdx].highlight = false;
                        start = {
                            'x': (cells[i].num - 1) % gridSize,
                            'y': Math.floor((cells[i].num - 1) / gridSize)
                        };
                    } else if (mouseButton == CENTER) {
                        cells[endIdx].highlight = false;
                        //change position of end
                        end = {
                            'x': (cells[i].num - 1) % gridSize,
                            'y': Math.floor((cells[i].num - 1) / gridSize)
                        };
                    } else {
                        //add obstacles in the grid
                        block = {
                            'x': (cells[i].num - 1) % gridSize,
                            'y': Math.floor((cells[i].num - 1) / gridSize)
                        };
                        if ((block.x != start.x || block.y != start.y) && (block.x != end.x || block.y != end.y)) {
                            blockages.push(block);
                            blockStates[gridSize * block.y + block.x] = 1;
                        }
                    }
                    break; //found cell
                }
            }
        }
    }
}

function draw() {
    background(220);
    for (let i = 0; i < cells.length; ++i) {
        cells[i].display();
    }
    //start cell
    //end cell
    for (let i = 0; i < values.length; ++i) {
        cells[i].val = values[i].toFixed(2);
    }
    for (let i = 0; i < policy.length; ++i) {
        cells[i].pol = policy[i];
    }


    // highlight the path from start
    if (done) {
        let currCell = Object.assign({}, start);
        while (currCell.x != end.x || currCell.y != end.y) {
            let idx = agent.getIndex(currCell);
            console.log(idx);
            if (idx < 0 || idx >= gridSize * gridSize) {
                solutionFound = false;
                for (let i = 0; i < cells.length; ++i) {
                    cells[i].highlight = false;
                }
                break;
            }
            cells[idx].highlight = true;
            cells[idx].highlightColor = color(0, 0, 255, 50);
            if (policy[idx] == 'U') {
                currCell.y -= 1;
            } else if (policy[idx] == 'D') {
                currCell.y += 1;
            } else if (policy[idx] == 'L') {
                currCell.x -= 1;
            } else {
                currCell.x += 1;
            }
        }
        done = false;
        solutionFound = true;
    }


    let startIdx, endIdx, blockIdx;
    startIdx = gridSize * start.y + start.x;
    endIdx = gridSize * end.y + end.x;
    for (let i = 0; i < blockages.length; ++i) {
        blockIdx = gridSize * blockages[i].y + blockages[i].x;
        cells[blockIdx].highlight = true;
        cells[blockIdx].highlightColor = color(0, 0, 0, 150);
    }
    cells[startIdx].highlight = true;
    cells[startIdx].highlightColor = color(255, 0, 0, 50);
    cells[endIdx].highlight = true;
    cells[endIdx].highlightColor = color(0, 255, 0, 50);
}

$(document).ready(function () {
    $("#start-btn").click(() => {
        initiateEnvironment();
        valueIteration();
    });
});