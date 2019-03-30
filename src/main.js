
var ssx = 800, ssy = 600;
var time = 0;
var gameState = 'menu';
var uiMouseDown = false;

var gfx = {};
var sfx = {};

function preload() {
  gfx.treeCrack1 = loadImage('gfx/treeCrack1.png');
  gfx.treeCrack2 = loadImage('gfx/treeCrack2.png');
  gfx.treeCrack3 = loadImage('gfx/treeCrack3.png');
  sfx.select = loadSound('sfx/select.wav');
  sfx.jump = loadSound('sfx/jump.wav');
  sfx.dash = loadSound('sfx/dash.wav');
  sfx.grapple = loadSound('sfx/grapple.wav');
  sfx.treeChop = loadSound('sfx/treeChop.wav');
  sfx.treeFall = loadSound('sfx/treeFall.wav');
  sfx.dirt = loadSound('sfx/dirt.wav');
  sfx.dirt.setVolume(0.4);
  sfx.rock = loadSound('sfx/rock.wav');
  sfx.rock.setVolume(0.6);
  sfx.gold = loadSound('sfx/gold.wav');
}

function setup() {
  createCanvas(ssx, ssy);
  $('canvas').bind('contextmenu', function(e) {
    return false;
  });
  strokeJoin(ROUND);
  menu.load();
  physics.load();
  player.load();
  cam.load();
  earth.load();
  coinMachine.load();
}

function update() {
  let dt = min(1/frameRate(), 1/2);
  time += dt;
  document.body.style.cursor = 'default';
  if (gameState === 'menu') {
    menu.update(dt);
  } else if (gameState == 'playing') {
    world.step(dt)
    player.update(dt);
    cam.update(dt);
    effects.update(dt);
    earth.update(dt);
    trees.update(dt);
    plants.update(dt);
  }
}

function mousePressed() {
  if (gameState === 'menu') {
    menu.mousePressed();
    uiMouseDown = true;
  } else if (gameState === 'playing') {
    if (!uiMouseDown) {
      player.mousePressed()
    }
  }
}

function mouseReleased() {
  uiMouseDown = false;
  if (gameState === 'menu') {
    menu.mouseReleased();
  } else if (gameState === 'playing' && !uiMouseDown) {

  }
}

function mouseWheel(event) {
  if (gameState === 'menu') {

  } else if (gameState === 'playing') {
    player.mouseWheel(event);
  }
}

function keyPressed() {
  if (gameState === 'menu') {
    menu.keyPressed();
  } else if (gameState == 'playing') {
    player.keyPressed();
    coinMachine.keyPressed();
    switch (keyCode) {
      case 27: // escape
        gameState = 'menu';
        break;
      case 82: // r
        player.body.setPosition(Vec2(player.spawnX/meterScale, player.spawnY/meterScale));
        player.body.setLinearVelocity(Vec2(0, 0));
        player.dashed = true;
        player.resetGrapple();
        cam.x = player.spawnX;
        cam.y = player.spawnY;
        break;
      case 75: // k
        let wmx = constrain(mouseX, 0, 800) - 400 + cam.x;
        let wmy = constrain(mouseY, 0, 600) - 300 + cam.y;
        let ts = earth.tileSize;
        console.log(floor(wmx/ts), floor(wmy/ts));
        break;
    }
  }
}

function draw() {
  update();
  noStroke();
  textAlign(CENTER, CENTER);
  if (gameState === 'menu') {
    background(195, 196, 158);
    menu.draw();
  } else if (gameState === 'playing') {
    translate(round(-(cam.x - ssx/2)), round(-(cam.y - ssy/2)));

    strokeWeight(1);
    stroke(0);
    background(142, 168, 195);
    trees.draw();
    earth.draw();
    coinMachine.draw();
    effects.draw();
    player.draw();
    plants.draw();
    if (player.activeItem === 'pickaxe' && player.pickaxePoint) {
      fill(255);
      ellipse(player.pickaxePoint.x, player.pickaxePoint.y, 10, 10);
    }

    resetMatrix();

    ui.draw();
  }
}