// DOM
const container = document.getElementById('container');
const scoreP1 = document.getElementById('score_p1');
const scoreP2 = document.getElementById('score_p2');
const misc = document.getElementById('misc');

// Numbers
const width = 800;
const height = 450;
var size = 16;
const resize = 2;
const center_x = width / 2 - size;
const center_y = height / 2 - size;
size *= resize; // square = 32px
const paddle_ratio = 3;
const paddle_height = size * paddle_ratio;

const ballSpeed = 8; // ball speed
const speed = 6; // paddle speed
const low_height = height - size*3;
const boundary_left = size * 2;
const boundary_right = (width - size * 2) - size;

// Controls

var pressed = {};
var velocity = {
    x: ballSpeed,
    y: 0,
}
var score = {
    '1': 0,
    '2': 0,
}
var game = {
    paused: false,
    winstate: false,
}


// Canvas
let app = new PIXI.Application({ width:width, height:height });
container.appendChild(app.view);

/** Creates a sprite and returns it */
function addSprite(sX=resize, sY=resize, posX=0, posY=0) {
    let sprite = PIXI.Sprite.from('./assets/white.png');
    sprite.scale.x = sX;
    sprite.scale.y = sY;
    sprite.position.x = posX;
    sprite.position.y = posY;
    app.stage.addChild(sprite);
    return sprite;
}

// Sprites
let ball = addSprite(resize, resize, center_x, center_y);
let player1 = addSprite(resize, resize * paddle_ratio, size, center_y - size);
let player2 = addSprite(resize, resize * paddle_ratio, width - (size * 2), center_y - size);

function reset() {
    velocity.x = ballSpeed;
    velocity.y = 0;
    ball.position.x = center_x;
    ball.position.y = center_y;
    scoreP1.innerText = score['1'];
    scoreP2.innerText = score['2'];
    game.winstate = false;
}

// Add a ticker callback to move the sprite back and forth
let elapsed = 0.0;
app.ticker.add((delta) => {
    elapsed += delta;
    if(game.paused) return;

    const s = speed * delta;

    if(pressed['w'] == true && player1.position.y - s >= 0) player1.position.y -= s;
    if(pressed['s'] == true && player1.position.y + s <= low_height) player1.position.y += s;

    if(pressed['ArrowUp'] == true && player2.position.y - s >= 0) player2.position.y -= s;
    if(pressed['ArrowDown'] == true && player2.position.y + s <= low_height) player2.position.y += s;
    

    // Left
    if(ball.position.x <= boundary_left && !game.winstate) {
        // Paddle aligned
        if(ball.position.y + size >= player1.position.y && ball.position.y <= player1.position.y + paddle_height) {
            console.log('bounce!');
            velocity.x *= -1;
            velocity.y = (ball.position.y - player1.position.y - 32) / 10;
        } else {
            console.log('out of bounds, left');
            game.winstate = true;
            score['2']++;
            setTimeout(() => {
                reset();
            }, 1000);
        }
    }

    // Right
    if(ball.position.x >= boundary_right && !game.winstate) {
        // Paddle aligned
        if(ball.position.y + size >= player2.position.y && ball.position.y <= player2.position.y + paddle_height) {
            console.log('bounce!');
            velocity.x *= -1;
            velocity.y = (ball.position.y - player2.position.y - 32) / 10;
        } else {
            console.log('out of bounds, right');
            game.winstate = true;
            score['1']++;
            setTimeout(() => {
                reset();
            }, 1000);
        }
    }

    // Vertical bounce
    if(ball.position.y <= 0 || ball.position.y >= low_height + 64) {
        console.log('out of bounds, up/down');
        velocity.y *= -1;
    }

    ball.x += velocity.x * delta;
    ball.y += velocity.y * delta;
});


document.addEventListener('keydown', event => {
    pressed[event.key] = true;
});
document.addEventListener('keyup', event => {
    if(event.key == 'Escape') {
        game.paused = !game.paused;
        misc.style.visibility = game.paused ? 'visible' : 'hidden';
    }
    pressed[event.key] = false;
});