
var trees = {};
trees.tiles = {};

function Tree(t) {
  this.x = t.x;
  this.y = t.y;
  this.w = t.w || random(140, 200);
  this.h = t.h || random(400, 450);
  this.alive = true;
  this.life = 3;
  this.fallTimer = 1;
  this.fallDir = 1;
}

Tree.prototype.hoveredInPlayerRange = function() {
  let wmx = constrain(mouseX, 0, 800) - 400 + cam.x;
  let wmy = constrain(mouseY, 0, 600) - 300 + cam.y;
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  let range = 150;
  return (
    wmx > this.x - 15 && wmx < this.x + 15
    && wmy > this.y - 150 && wmy < this.y
    && px > this.x - 15 - range && px < this.x + 15 + range
    && py > this.y - 150 - range && py < this.y + range
  );
}

Tree.prototype.update = function(dt) {
  if (this.life <= 0) {
    this.alive = false;
  }
  if (!this.alive) {
    this.fallTimer -= dt*0.5;
  }
}

Tree.prototype.draw = function() {
  translate(round(this.x), round(this.y));
  let a = -(1 - this.fallTimer)*PI/2*this.fallDir;
  rotate(a);
  fill(96, 88, 86);
  if (player.activeItem === 'hatchet' && this.hoveredInPlayerRange() && this.life > 0) {
    stroke(255);
  }
  rect(-15, -150, 30, 150);
  ellipse(0.5, 0, 30, 30);
  noStroke();
  rect(-14, -16, 29, 16);
  stroke(0);
  tint(255, 255, 255, 80);
  if (this.life < 1) {
    image(gfx.treeCrack3, -15, -150);
  } else if (this.life < 2) {
    image(gfx.treeCrack2, -15, -150);
  } else if (this.life < 3) {
    image(gfx.treeCrack1, -15, -150);
  }
  fill(74, 108, 111);
  beginShape();
  let vx = 0;
  let vy = -this.h;
  let sx = this.w/180;
  vertex(vx*sx, vy);
  for (let i=0; i < 4; i++) {
    vx += 30;
    vy += 80;
    vertex(vx*sx, vy);
    if (i != 3) {
      vx -= 10;
      vertex(vx*sx, vy);
    }
  }
  vx = -vx;
  vertex(vx*sx, vy);
  for (let i=0; i < 3; i++) {
    vx += 30;
    vy -= 80;
    vertex(vx*sx, vy);
    vx -= 10;
    vertex(vx*sx, vy);
  }
  endShape(CLOSE);
  rotate(-a);
  translate(-round(this.x), -round(this.y));
}


trees.removeTile = function(i, j) {
  if (trees.tiles[i] && trees.tiles[i][j]) {
    delete trees.tiles[i][j];
  }
}

trees.updateTile = function(i, j) {
  i = Number(i), j = Number(j);
  let ts = earth.tileSize;
  trees.removeTile(i, j);
  trees.tiles[i] = trees.tiles[i] || {};
  trees.tiles[i][j] = [];
  let et = earth.tiles;
  if (et[i] && et[i][j] && (et[i][j].pid === 8 || et[i][j].pid === 4
  || et[i][j].pid === 12 || et[i][j].pid === 13 || et[i][j].pid === 14)
  && et[i][j].type === 'grass'){
    let edge = et[i][j].edges[0];
    let x1 = edge[0].x, y1 = edge[0].y, x2 = edge[1].x, y2 = edge[1].y;
    if (x2 < x1) {
      let tx = x1, ty = y1;
      x1 = x2, y1 = y2;
      x2 = tx, y2 = ty;
    }
    let m = (y2 - y1)/(x2 - x1);
    let b = y1 - m*x1;
    if (abs(m) < 1) {
      if (random() < 0.1) {
        let x = random(x1, x2);
        let y = m*x + b;
        trees.tiles[i][j].push(new Tree({x: i*ts + x, y: j*ts + y}));
      }
    }
  }
}

trees.update = function(dt) {
  let ts = earth.tileSize;
  let newTiles = {}
  let i1 = floor((cam.x - ssx/2)/ts) - 10;
  let i2 = floor((cam.x + ssx/2)/ts) + 10;
  let j1 = floor((cam.y - ssy/2)/ts) - 10;
  let j2 = floor((cam.y + ssy/2)/ts) + 10;
  for (let i=i1; i <= i2; i++) {
    newTiles[i] = {};
    for (let j=j1; j <= j2; j++) {
      newTiles[i][j] = true;
    }
  }
  for (let i in trees.tiles) {
    for (let j in trees.tiles[i]) {
      if (newTiles[i] && newTiles[i][j]) {
        delete newTiles[i][j];
      } else {
        let isFalling = false;
        let treeList = trees.tiles[i][j];
        for (let tli in treeList) {
          let v = treeList[tli];
          if (!v.alive) {
            isFalling = true;
          }
        }
        if (!isFalling) {
          trees.removeTile(i, j);
        }
      }
    }
  }
  for (let i in newTiles) {
    for (let j in newTiles[i]) {
      trees.updateTile(i, j);
    }
  }
  for (let i in trees.tiles) {
    for (let j in trees.tiles[i]) {
      let treeList = trees.tiles[i][j];
      for (let tli in treeList) {
        let v = treeList[tli];
        v.update(dt);
        if (v.fallTimer < 0) {
          player.wood++;
          delete treeList[tli];
        }
      }
    }
  }
}

trees.draw = function() {
  for (let i in trees.tiles) {
    for (let j in trees.tiles[i]) {
      let treeList = trees.tiles[i][j];
      for (let tli in treeList) {
        treeList[tli].draw();
      }
    }
  }
}