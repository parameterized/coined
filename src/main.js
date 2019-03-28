
var ssx = 800, ssy = 600;
var time = 0;
var gameState = 'menu';

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
  } else if (gameState === 'playing') {
    player.mousePressed()
  }
}

function mouseReleased() {
  if (gameState === 'menu') {
    menu.mouseReleased();
  } else if (gameState === 'playing') {

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
    player.keyPressed()
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
    effects.draw();
    player.draw();
    plants.draw();
    if (player.activeItem === 'pickaxe' && player.pickaxePoint) {
      fill(255, 255, 255);
      ellipse(player.pickaxePoint.x, player.pickaxePoint.y, 10, 10);
    }

    resetMatrix();

    ui.draw();
  }
}
