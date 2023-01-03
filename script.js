// DOM
// const container = document.getElementById('container');
const c_container = document.getElementById('c');
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
const low_height = height - size*3;
const boundary_left = size * 2;
const boundary_right = (width - size * 2) - size;

// Game
var config = {
    ball_speed: 8,
    paddle_speed: 6,
    paddle_size: 3, // ratio, 1 would be a square
}
var pressed = {};
var velocity = {
    x: config.ball_speed,
    y: 0,
}
var score = {
    '1': 0,
    '2': 0,
}
var game = {
    paused: false,
    winstate: false,
    ball_owner: false,
}

// Canvas
let app = new PIXI.Application({ width:width, height:height });
PIXI.settings.SCALE_MODE = "nearest";
c_container.appendChild(app.view);

/** Creates a sprite and returns it */
function addSprite(sX=resize, sY=resize, posX=0, posY=0, asset="./assets/blank.png") {
    let sprite = PIXI.Sprite.from(asset);
    sprite.scale.x = sX;
    sprite.scale.y = sY;
    sprite.position.x = posX;
    sprite.position.y = posY;
    app.stage.addChild(sprite);
    return sprite;
}

// Sprites
let divider = addSprite(resize, 30, center_x, 0, './assets/divide.png');
let ball = addSprite(resize, resize, center_x, center_y/*, "./assets/ball2.png"*/);
var player = {
    1: addSprite(resize, resize * config.paddle_size, size, center_y - size),
    2: addSprite(resize, resize * config.paddle_size, width - (size * 2), center_y - size),
}
player['1'].keyrise = 'w';
player['1'].keyfall = 's';
player['2'].keyrise = 'ArrowUp';
player['2'].keyfall = 'ArrowDown';

// Game

/** Reset ball and display scores */
function reset() {
    velocity.x = config.ball_speed;
    velocity.y = 0;
    ball.position.x = center_x;
    ball.position.y = center_y;
    game.ball_owner = false;
    game.winstate = false;
    scoreP1.innerText = score['1'];
    scoreP2.innerText = score['2'];
}

// Game ticker
let elapsed = 0.0;
app.ticker.add((delta) => {
    elapsed += delta;
    if(game.paused) return;
    const s = config.paddle_speed * delta;
    let paddleSize = size * config.paddle_size;

    /** Moves the player when button is pressed */
    function moveCheck(p='1') {
        let target = player[p];
        if(pressed[target.keyrise] && target.position.y - s >= 0) target.position.y -= s;
        if(pressed[target.keyfall] && target.position.y + s <= height - paddleSize) target.position.y += s;
    }
    moveCheck('1');
    moveCheck('2');
    
    /** Detect collision */
    function paddleCheck(p='1') {
        if(p == '1' && ball.position.x > boundary_left  || game.winstate) return;
        if(p == '2' && ball.position.x < boundary_right || game.winstate) return;
        let sign = p == '2' ? 1 : -1;
        if(Math.sign(velocity.x) != sign) return; // going in opposite direction, no need to test

        // Paddle aligned
        if(ball.position.y + size >= player[p].position.y && ball.position.y <= player[p].position.y + paddleSize) {
            // console.log('bounce!');
            velocity.x *= -1;
            velocity.y = (ball.position.y - player[p].position.y - (paddleSize / 3)) / 10;
            game.ball_owner = p;
        } else {
            // console.log('out of bounds');
            game.winstate = true;
            let winner = p == '1' ? '2' : '1';
            console.log(`Player ${winner} has scored`)
            score[winner]++;
            setTimeout(reset, 1000);
        }
    }
    paddleCheck('1');
    paddleCheck('2');

    // Vertical bounce
    if(ball.position.y <= 0 || ball.position.y >= low_height + 64) {
        // console.log('out of bounds, up/down');
        velocity.y *= -1;
    }

    // Move ball
    ball.x += velocity.x * delta;
    ball.y += velocity.y * delta;
});

// Keyboard
document.addEventListener('keydown', event => {
    pressed[event.key] = true;

    // Pause
    if(event.key == 'Escape') {
        game.paused = !game.paused;
        misc.innerText = 'Paused';
        misc.style.visibility = game.paused ? 'visible' : 'hidden';
    }

    // Prevent scrolling
    if(event.key == 'ArrowUp' || event.key == 'ArrowDown' || event.key == ' ') event.preventDefault();
});
document.addEventListener('keyup', event => {
    pressed[event.key] = false;
});

// Config
document.querySelectorAll('.config').forEach(element => element.addEventListener('change', event => {
    // if(event.key != 'Enter') return;
    let name = element.id;
    let value = element.value;
    config[name] = value;
    if(name == 'paddle_size') {
        for(i in player) {
            let p = player[i];
            p.scale.y = config[name] * resize;
        }
    }
    reset();
}));
