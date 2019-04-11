
var rocks = {};
rocks.tiles = {};

function Rock(t) {
  this.x = orDefault(t.x, 0);
  this.y = orDefault(t.y, 0);
  this.w = orDefault(t.w, 10);
  this.h = orDefault(t.h, 10);
  this.s = orDefault(t.s, random(0.8, 1.2));
  this.a = orDefault(t.a, 0);
  this.verts = t.verts;
  if (!this.verts) {
    this.verts = [];
    let flip = random() < 0.5 ? 1 : -1;
    this.verts.push(Vec2(6, -1));
    this.verts.push(Vec2(0, 0))
    this.verts.push(Vec2(-6, -1));
    this.verts.push(Vec2(-4, -7));
    this.verts.push(Vec2(0, -10));
    this.verts.push(Vec2(4, -9));
    this.verts = this.verts.map(Vec2.scaleFn(this.s*flip, this.s));
  }
}

Rock.prototype.draw = function() {
  push();
  translate(this.x, this.y);
  rotate(this.a);
  //fill(106, 107, 131);
  fill(131);
  beginShape();
  for (let i=0; i < this.verts.length; i++) {
    let v = this.verts[i];
    vertex(v.x, v.y);
  }
  endShape(CLOSE);
  pop();
}


rocks.removeTile = function(i, j) {
  if (rocks.tiles[i] && rocks.tiles[i][j]) {
    delete rocks.tiles[i][j];
  }
}

rocks.updateTile = function(i, j) {
  i = Number(i), j = Number(j);
  let ts = earth.tileSize;
  rocks.removeTile(i, j);
  rocks.tiles[i] = rocks.tiles[i] || {};
  rocks.tiles[i][j] = [];
  let et = earth.tiles;
  if (et[i] && et[i][j] && (et[i][j].pid === 8 || et[i][j].pid === 4
  || et[i][j].pid === 12 || et[i][j].pid === 13 || et[i][j].pid === 14)
  && (et[i][j].type === 'rock')){
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
      let dx = x2 - x1;
      let n_rocks = round(abs(x2 - x1)/ts);
      for (let k=0; k < n_rocks; k++) {
        let x = random(x1 + dx/n_rocks*k, x1 + dx/n_rocks*(k+1));
        let y = m*x + b;
        rocks.tiles[i][j].push(new Rock({x: i*ts + x, y: j*ts + y + 4, a: atan(m)}));
      }
    }
  }
}

rocks.update = function(dt) {
  let ts = earth.tileSize;
  let newTiles = {}
  let i1 = floor((cam.x - ssx/2)/ts) - 1;
  let i2 = floor((cam.x + ssx/2)/ts) + 1;
  let j1 = floor((cam.y - ssy/2)/ts) - 1;
  let j2 = floor((cam.y + ssy/2)/ts) + 1;
  for (let i=i1; i <= i2; i++) {
    newTiles[i] = {};
    for (let j=j1; j <= j2; j++) {
      newTiles[i][j] = true;
    }
  }
  for (let i in rocks.tiles) {
    for (let j in rocks.tiles[i]) {
      if (newTiles[i] && newTiles[i][j]) {
        delete newTiles[i][j];
      } else {
        rocks.removeTile(i, j);
      }
    }
  }
  for (let i in newTiles) {
    for (let j in newTiles[i]) {
      rocks.updateTile(i, j);
    }
  }
}

rocks.draw = function() {
  for (let i in rocks.tiles) {
    for (let j in rocks.tiles[i]) {
      let rockList = rocks.tiles[i][j];
      for (let rli in rockList) {
        rockList[rli].draw();
      }
    }
  }
}