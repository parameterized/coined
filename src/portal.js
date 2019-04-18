
var portal = {}

portal.load = function() {
  portal.x = 100*PI + 264;
  earth.updateTile(11, -1);
  let edge = earth.tiles[11][-1].edges[0];
  if (edge) {
    let x1 = edge[0].x, y1 = edge[0].y, x2 = edge[1].x, y2 = edge[1].y;
    if (x2 < x1) {
      let tx = x1, ty = y1;
      x1 = x2, y1 = y2;
      x2 = tx, y2 = ty;
    }
    let m = (y2 - y1)/(x2 - x1);
    let b = y1 - m*x1;
    let ts = earth.tileSize;
    portal.y = -ts + m*(portal.x - ts*11) + b - 52;
  } else {
    portal.y = -52;
  }
}

portal.inRange = function() {
  let x = portal.x, y = portal.y;
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  let range = 80;
  return (abs(px - x) < range && abs(py - y) < range);
}

portal.keyPressed = function() {
  if (keyCode === 69 && portal.inRange() && player.coins >= 24) { // e
    player.coins -= 24;
    player.teleport(0, 0, function() {
      player.resetPosition();
      if (earth.sample === earth.sampleRect) {
        earth.sample = earth.sampleCross;
      } else if (earth.sample === earth.sampleCross) {
        earth.sample = earth.sampleVoronoi;
      } else {
        earth.sample = earth.sampleRect;
        if (!menu.showedEnd) {
          gameState = 'menu';
          menu.state = 'end';
          let date = new Date(round(time)*1000);
          let timeStr = '';
          if (date.getUTCHours() > 0) {
            timeStr += date.getUTCHours() + 'h';
          }
          timeStr += date.getUTCMinutes() + 'm';
          timeStr += date.getUTCSeconds() + 's';
          menu.addLabel({state: 'end', text: 'Completed in: ' + timeStr, y: 200});
          menu.showedEnd = true;
          ambience.pause();
        }
      }
      for (let i in earth.tiles) {
        for (let j in earth.tiles[i]) {
          earth.removeTile(i, j);
        }
      }
      earth.tiles = {};
      earth.modified = {};
      earth.updateWindow();
      coinMachine.load();
      portal.load();
      // todo: updateWindow functions
      trees.tiles = {};
      trees.update(0);
      plants.tiles = {};
      plants.update(0);
      rocks.tiles = {};
      rocks.update(0);
      infoBot.load();
      infoBot.speak();
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
    if (!infoBot.sawPortal) {
      infoBot.speak();
      infoBot.sawPortal = true;
    }
  }
  image(sheet, round(-spriteW/2), round(-spriteH/2),
    spriteW, spriteH, framePos.x, framePos.y, spriteW, spriteH);
  if (portal.inRange()) {
    textAlign(CENTER, CENTER);
    textSize(18);
    let s = 'Next World (24 coins)';
    fill(128, 128, 128, 100);
    let w = textWidth(s);
    rect(round(-w/2 - 2), -78, w + 4, 20);
    noStroke();
    fill(0);
    text(s, 0, -66);
    stroke(0);
  }
  pop();
}