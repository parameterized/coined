
var plants = {};
plants.tiles = {};

function Plant(t) {
  this.x = t.x || 0;
  this.y = t.y || 0;
  this.w = t.w || 10;
  this.h = t.h || 20 + random(-5, 5);
  this.a = t.a || 0;
  this.verts = t.verts;
  if (!this.verts) {
    this.verts = [];
    let flip = random() < 0.5 ? 1 : -1;
    this.verts.push({x: 0, y: 0});
    this.verts.push({x: 5*flip, y: -6});
    this.verts.push({x: 5*flip, y: -this.h});
    this.verts.push({x: -2*flip, y: -10});
    this.verts.push({x: -2*flip, y: -6});
  }
}

Plant.prototype.update = function(dt) {
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  if (px + 20 > this.x - this.w/2 && px - 20 < this.x + this.w/2
  && py + 40 > this.y - this.h && py - 40 < this.y) {
    let lv = player.body.getLinearVelocity();
    this.a = lerp(this.a, atan(lv.x), min(dt*abs(lv.x)*2, 1));
  }
  this.a = lerp(this.a, 0, min(dt*8, 1));
}

Plant.prototype.draw = function() {
  translate(this.x, this.y);
  rotate(this.a);
  fill(67, 154, 134, 100);
  //rect(-this.w/2, -this.h, this.w, this.h);
  fill(67, 154, 134);
  beginShape();
  for (let i=0; i < this.verts.length; i++) {
    let v = this.verts[i];
    vertex(v.x, v.y);
  }
  endShape(CLOSE);
  rotate(-this.a);
  translate(-this.x, -this.y);
}


plants.removeTile = function(i, j) {
  if (plants.tiles[i] && plants.tiles[i][j]) {
    delete plants.tiles[i][j];
  }
}

plants.updateTile = function(i, j) {
  i = Number(i), j = Number(j);
  let ts = earth.tileSize;
  plants.removeTile(i, j);
  plants.tiles[i] = plants.tiles[i] || {};
  plants.tiles[i][j] = [];
  if (i === 4 && j === -1) {
    return;
  }
  let et = earth.tiles;
  if (et[i] && et[i][j] && (et[i][j].pid === 8 || et[i][j].pid === 4
  || et[i][j].pid === 12 || et[i][j].pid === 13 || et[i][j].pid === 14)
  && (et[i][j].type === 'grass' || et[i][j].type === 'dirt')){
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
      let n_plants = 2;
      for (let k=0; k < n_plants; k++) {
        let x = random(x1 + dx/n_plants*k, x1 + dx/n_plants*(k+1));
        let y = m*x + b;
        plants.tiles[i][j].push(new Plant({x: i*ts + x, y: j*ts + y}));
      }
    }
  }
}

plants.update = function(dt) {
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
  for (let i in plants.tiles) {
    for (let j in plants.tiles[i]) {
      if (newTiles[i] && newTiles[i][j]) {
        delete newTiles[i][j];
      } else {
        plants.removeTile(i, j);
      }
    }
  }
  for (let i in newTiles) {
    for (let j in newTiles[i]) {
      plants.updateTile(i, j);
    }
  }
  for (let i in plants.tiles) {
    for (let j in plants.tiles[i]) {
      let plantList = plants.tiles[i][j];
      for (let pli in plantList) {
        plantList[pli].update(dt);
      }
    }
  }
}

plants.draw = function() {
  for (let i in plants.tiles) {
    for (let j in plants.tiles[i]) {
      let plantList = plants.tiles[i][j];
      for (let pli in plantList) {
        plantList[pli].draw();
      }
    }
  }
}