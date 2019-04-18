
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
  gfx.coinSheet = loadImage('gfx/coinSheet.png');

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
  sfx.teleport = loadSound('sfx/teleport.wav');
  sfx.teleport.setVolume(0.4);
  sfx.forestAmbience = loadSound('sfx/forestAmbience.mp3');
  sfx.forestAmbience.setLoop(true);
  sfx.forestAmbience.setVolume(0);
  sfx.caveAmbience = loadSound('sfx/caveAmbience.mp3');
  sfx.caveAmbience.setLoop(true);
  sfx.caveAmbience.setVolume(0);
  sfx.wind = loadSound('sfx/wind.mp3');
  sfx.wind.setLoop(true);
  sfx.wind.setVolume(0);
}

function setup() {
  let canvas = createCanvas(ssx, ssy);
  canvas.parent('sketch');
  $('canvas').bind('contextmenu', function(e) {
    return false;
  });
  $('canvas').bind('mousedown', function(e) {
    if (e.detail > 1) {
      e.preventDefault();
    }
  });
  strokeJoin(ROUND);
  noiseSeed(0);
  menu.load();
  physics.load();
  cam.load();
  earth.load();
  player.load();
  infoBot.load();
  coinMachine.load();
  portal.load();
  tutorial.load();
}

function update() {
  let dt = min(1/frameRate(), 1/4);
  document.body.style.cursor = 'default';
  if (gameState === 'menu') {
    menu.update(dt);
  } else if (gameState == 'playing') {
    time += dt;
    world.step(dt)
    player.update(dt);
    infoBot.update(dt);
    cam.update(dt);
    effects.update(dt);
    earth.update(dt);
    trees.update(dt);
    plants.update(dt);
    rocks.update(dt);
    coins.update(dt);
    ambience.update(dt);
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
        ambience.pause();
        break;
      case 75: // k
        let wmx = constrain(mouseX, 0, 800) - 400 + cam.x;
        let wmy = constrain(mouseY, 0, 600) - 300 + cam.y;
        let ts = earth.tileSize;
        console.log(floor(wmx/ts), floor(wmy/ts));
        //coins.spawn(wmx, wmy);
        infoBot.speak();
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
    infoBot.draw();
    plants.draw();
    rocks.draw();
    coins.draw();
    if (player.activeItem === 'pickaxe' && player.pickaxePoint) {
      fill(255);
      ellipse(player.pickaxePoint.x, player.pickaxePoint.y, 10, 10);
    }
    cam.reset();

    let pos = player.body.getPosition();
    let px = pos.x*meterScale, py = pos.y*meterScale;
    noStroke();
    fill(0, constrain((py - 2000)/8000*255, 0, 100));
    rect(0, 0, ssx, ssy);

    ui.draw();
  }
}