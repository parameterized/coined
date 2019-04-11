
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
  gfx.playerSheet = loadImage('gfx/playerSheet.png');
  gfx.sky = loadImage('gfx/sky.png');
  gfx.mountains1 = loadImage('gfx/mountains1.png');
  gfx.mountains2 = loadImage('gfx/mountains2.png');
  gfx.mountains3 = loadImage('gfx/mountains3.png');
  gfx.portalSheet = loadImage('gfx/portalSheet.png');
  gfx.portalHighlightSheet = loadImage('gfx/portalHighlightSheet.png');

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
  sfx.anvil = loadSound('sfx/anvil.wav');
}

function setup() {
  createCanvas(ssx, ssy);
  $('canvas').bind('contextmenu', function(e) {
    return false;
  });
  strokeJoin(ROUND);
  noiseSeed(0);
  menu.load();
  physics.load();
  player.load();
  cam.load();
  earth.load();
  coinMachine.load();
  portal.load();
  tutorial.load();
}

function update() {
  let dt = min(1/frameRate(), 1/4);
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
    rocks.update(dt);
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
    portal.keyPressed();
    switch (keyCode) {
      case 27: // escape
        gameState = 'menu';
        break;
      case 82: // r
        player.resetPosition();
        break;
      case 84: // t
        player.resetPosition(0, -10000 - 200);
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
    strokeWeight(1);
    stroke(0);
    cam.set();
    bg.draw();
    trees.draw();
    earth.draw();
    tutorial.draw();
    coinMachine.draw();
    portal.draw();
    effects.draw();
    player.draw();
    plants.draw();
    rocks.draw();
    if (player.activeItem === 'pickaxe' && player.pickaxePoint) {
      fill(255);
      ellipse(player.pickaxePoint.x, player.pickaxePoint.y, 10, 10);
    }
    cam.reset();
    ui.draw();
  }
}