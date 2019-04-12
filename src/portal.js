
var portal = {}

portal.load = function() {
  portal.x = 100*PI + 264;
  portal.y = -70;
}

portal.inRange = function() {
  let x = portal.x, y = portal.y;
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  let range = 80;
  return (abs(px - x) < range && abs(py - y) < range);
}

portal.keyPressed = function() {
  if (keyCode === 69 && portal.inRange()) { // e
    player.teleport(0, 0, function() {
      player.resetPosition();
      for (let i in earth.tiles) {
        for (let j in earth.tiles[i]) {
          earth.removeTile(i, j);
        }
      }
      earth.tiles = {};
      earth.modified = {};
      earth.updateWindow();
      // todo: updateWindow functions
      trees.tiles = {};
      trees.update(0);
      plants.tiles = {};
      plants.update(0);
      rocks.tiles = {};
      rocks.update(0);
    });
  }
}

portal.frame2xy = function(i) {
  let spriteW = 69;
  return {x: i*spriteW, y: 0};
}

portal.draw = function() {
  push();
  translate(round(portal.x), round(portal.y));
  let spriteW = 69, spriteH = 105;
  let framePos = portal.frame2xy(floor(time*10) % 7);
  let sheet = gfx.portalSheet;
  if (portal.inRange()) {
    sheet = gfx.portalHighlightSheet;
  }
  image(sheet, round(-spriteW/2), round(-spriteH/2),
    spriteW, spriteH, framePos.x, framePos.y, spriteW, spriteH);
  if (portal.inRange()) {
    fill(128, 128, 128, 100);
    rect(-56, -78, 112, 20);
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(18);
    text('Reload world', 0, -66);
  }
  pop();
}