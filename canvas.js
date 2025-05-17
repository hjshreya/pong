/** @type {CanvasRenderingContext2D} */
const canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

// Resizing
canvas.height = window.innerHeight - 10;
canvas.width = window.innerWidth - 10;
let dx = 8;
let dy = 8;
let speed = Math.sqrt(2) * dy;
let x = 150;
let y = 250;
let ballRadius = 15;
let paddleHeight = 20;
let paddleWidth = 150;
let paddleX = (canvas.width - paddleWidth) / 2;
let restartX = 10;
let restartY = 10;
let restartRadius = 20;

var brickRowCount = 5;
var brickColumnCount = 40;
var brickWidth = 150;
var brickHeight = 30;
var brickPadding = 5;
var brickOffsetTop = 5;
var brickOffsetLeft = 40;

let firstBrickColumn = 0;
let lastBrickColumn = brickColumnCount - 1;
let firstBrickRow = 0;
let lastBrickRow = brickRowCount - 1;
let numberOfBricksDestroyed = 0;
let bricks = {};
let brickPerMinute = 0;
let startTimestamp = Date.now();

for (let c = 0; c < brickColumnCount; c++) {
  if (
    c * (brickWidth + brickPadding) + brickOffsetLeft + 0.85 * brickWidth >
    canvas.width
  ) {
    lastBrickColumn = c - 1;
    break;
  } // stop if more than 15% of the brick is out of the canvas
  for (let r = 0; r < brickRowCount; r++) {
    const key = `c${c}_r${r}`;
    bricks[key] = {
      x: c * (brickWidth + brickPadding) + brickOffsetLeft,
      y: r * (brickHeight + brickPadding) + brickOffsetTop,
      status: 1,
      width: brickWidth,
      height: brickHeight,
    };
  }
}

function mapOnBricks(fn) {
  for (let c = firstBrickColumn; c <= lastBrickColumn; c++) {
    for (let r = firstBrickRow; r <= lastBrickRow; r++) {
      const key = `c${c}_r${r}`;
      bricks[key] = fn(bricks[key]) || bricks[key];
    }
  }
}

function drawBricks() {
  mapOnBricks((brick) => {
    if (brick.status == 1) {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brickWidth, brickHeight);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    }
  });
}

function collisionDetection() {
  let vertical_refleciton = false;
  let horizontal_reflection = false;
  mapOnBricks((brick) => {
    if (brick.status == 1) {
      let circle = { x: x, y: y, r: ballRadius };

      if (intersects(circle, brick)) {
        if (brick.x > circle.x || brick.x + brick.width < circle.x) {
          vertical_refleciton = true;
        } else {
          horizontal_reflection = true;
        }
        brick.status = 0;
        numberOfBricksDestroyed++;
      }
    }
  });
  if (vertical_refleciton) dx = -dx;
  if (horizontal_reflection) dy = -dy;
}

let num_transitions = 0;
let queue = [];
function intersects(circle, b) {
  let circleDistance = {};
  let abs = Math.abs;
  let rect = Object.assign({}, b);
  rect.x += rect.width / 2;
  rect.y += rect.height / 2;
  circleDistance.x = abs(circle.x - rect.x);
  circleDistance.y = abs(circle.y - rect.y);

  if (circleDistance.x > rect.width / 2 + circle.r) {
    return false;
  }
  if (circleDistance.y > rect.height / 2 + circle.r) {
    return false;
  }

  if (circleDistance.x <= rect.width / 2) {
    return true;
  }
  if (circleDistance.y <= rect.height / 2) {
    return true;
  }

  cornerDistance_sq =
    (circleDistance.x - rect.width / 2) ^
    (2 + (circleDistance.y - rect.height / 2)) ^
    2;

  return cornerDistance_sq <= (circle.r ^ 2);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  transitionBricksAndCheckColumns();
  drawPaddle();
  collisionDetection();
  drawBall();
  drawBricks();
  drawMenu();
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }

  if (y + dy < ballRadius || y + dy > canvas.height - ballRadius + 10) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius - paddleHeight) {
    if (x > paddleX && x < paddleX + paddleWidth && dy > 0) {
      // dy = -dy;
      dx = (10 * (x - paddleX - paddleWidth / 2)) / (paddleWidth / 2);
      if (dx > speed) dx = speed - 3;
      if (-dx > speed) dx = -speed + 3;
      dy = -Math.sqrt(speed * speed - dx * dx);
      // console.log(dx, dy, speed);
    } else {
      // alert("GAME OVER");
      // document.location.reload();
      // clearInterval(interval);
    }
  }

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}
draw();

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawMenu() {
  ctx.beginPath();
  ctx.arc(restartX, restartY, restartRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
  // display number of bricks destroyed
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Destroyed: " + numberOfBricksDestroyed, 20, 200);
  // display bricks per minute
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  let elapsedMinutes = (Date.now() - startTimestamp) / 60000;
  brickPerMinute = numberOfBricksDestroyed / elapsedMinutes;
  ctx.fillText("Bricks/min: " + brickPerMinute.toFixed(0), 20, 220);
}

function movePaddle(e) {
  paddleX = e.clientX - paddleWidth / 2;
  if (paddleX + paddleWidth > canvas.width) {
    paddleX = canvas.width - paddleWidth;
  }
  if (paddleX < 0) {
    paddleX = 0;
  }
}

function gameActions(e) {
  if (
    restartX - restartRadius < e.clientX &&
    e.clientX < restartX + restartRadius &&
    restartY - restartRadius < e.clientY &&
    e.clientY < restartY + restartRadius
  ) {
    document.location.reload();
  }
}

canvas.addEventListener("mousemove", movePaddle);
canvas.addEventListener("mousedown", gameActions);
canvas.addEventListener("touchmove", function (e) {
  var touch = e.touches[0];
  e.preventDefault();
  movePaddle(touch);
});

window.addEventListener("resize", () => {
  // Resizing
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
});

// Brick functions
function addBrickRowOrColumn({ type = "column", atStart = false }) {
  if (type === "column") {
    const columnReference = atStart ? firstBrickColumn : lastBrickColumn;
    const columnToAdd = atStart ? --firstBrickColumn : ++lastBrickColumn;
    for (let r = firstBrickRow; r <= lastBrickRow; r++) {
      const key = `c${columnToAdd}_r${r}`;
      const referenceKey = `c${columnReference}_r${r}`;
      const referenceBrick = bricks[referenceKey];
      bricks[key] = {
        x: atStart
          ? referenceBrick.x - (brickWidth + brickPadding)
          : referenceBrick.x + referenceBrick.width + brickPadding,
        y: referenceBrick.y,
        status: 1,
        width: brickWidth,
        height: brickHeight,
      };
    }
  } else if (type === "row") {
    const rowReference = atStart ? firstBrickRow : lastBrickRow;
    const rowToAdd = atStart ? --firstBrickRow : ++lastBrickRow;
    for (let c = firstBrickColumn; c <= lastBrickColumn; c++) {
      const key = `c${c}_r${rowToAdd}`;
      const referenceKey = `c${c}_r${rowReference}`;
      const referenceBrick = bricks[referenceKey];
      bricks[key] = {
        x: referenceBrick.x,
        y: atStart
          ? referenceBrick.y - (brickHeight + brickPadding)
          : referenceBrick.y + referenceBrick.height + brickPadding,
        status: 1,
        width: brickWidth,
        height: brickHeight,
      };
    }
  } else {
    throw new Error("Invalid type. Must be 'row' or 'column'.");
  }
}

function transitionBricks(xTransition, yTransition) {
  mapOnBricks((brick) => {
    if (brick) {
      // Ensure the brick exists before attempting to modify it
      brick.x += xTransition;
      brick.y += yTransition;
    }
  });
}

function isColumnEmpty(brickColumn) {
  let key;
  try {
    for (let r = firstBrickRow; r <= lastBrickRow; r++) {
      key = `c${brickColumn}_r${r}`;
      if (bricks[key].status === 1) return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function transitionBricksAndCheckColumns() {
  if (num_transitions > 0) {
    num_transitions -= 1;
    transitionBricks(1, 0);
  } else if (num_transitions < 0) {
    num_transitions += 1;
    transitionBricks(-1, 0);
  }

  let firstBrickColumnAux = firstBrickColumn;
  while (isColumnEmpty(firstBrickColumnAux)) {
    firstBrickColumn += 1;
    addBrickRowOrColumn({ type: "column", atStart: false });
    num_transitions -= brickWidth + brickPadding;
    firstBrickColumnAux += 1;
  }

  let lastBrickColumnAux = lastBrickColumn;
  while (isColumnEmpty(lastBrickColumnAux)) {
    addBrickRowOrColumn({ type: "column", atStart: true });
    lastBrickColumn -= 1;
    num_transitions += brickWidth + brickPadding;
    lastBrickColumnAux -= 1;
  } 
}
