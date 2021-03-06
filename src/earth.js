
var earth = {};

earth.camTile = {x: 0, y: 0};
earth.tileSize = 50;
earth.tiles = {};
earth.modified = {};

earth.load = function() {
  let ts = earth.tileSize;
  earth.camTile = {x: floor(cam.x/ts), y: floor(cam.y/ts)};
  earth.updateWindow();
}

earth.sampleRect = function(i, j) {
  if (earth.modified[i] && earth.modified[i][j]) {
    return earth.modified[i][j];
  } else {
    let x = i*earth.tileSize, y = j*earth.tileSize;
    /*
    let d = sin(y/100 - 200)*0.5 + 0.5;
    d *= sin(x/200)*0.5 + 0.5;
    d = pow(d, 0.5);
    */
    let d1 = (sin(y/100 - 200)*0.5 + 0.5)*0.8
    let d2 = (sin(x/200)*0.5 + 0.5)*3;
    let d = min(d1, d2) + noise(x/400, y/400)*0.6 - 0.3;

    if (y < 0) {
      d = 0;
    }
    let type;
    if (y < 600) {
      type = 'grass';
    } else if (y < 2000) {
      type = 'dirt';
    } else {
      type = 'rock';
      if (hash(i, j) < 0.001) {
        type = 'gold';
      }
    }
    return {density: d, type: type};
  }
}

earth.sampleCross = function(i, j) {
  if (earth.modified[i] && earth.modified[i][j]) {
    return earth.modified[i][j];
  } else {
    let x = i*earth.tileSize, y = j*earth.tileSize;

    let h = noise(x/800)*400;
    let d = lerp(y/200 + 0.6, (y - h)/400 + 1, constrain(dist(x, y, 100*PI, 0)/400 - 1, 0, 1));

    let x2 = x/4800, y2 = y/4800;
    let _x2 = x2, _y2 = y2;
    x2 += noise(_x2, _y2)*0.6 - 0.3;
    y2 += noise(_x2 + 1000, _y2 + 1000)*0.6 - 0.3;
    x2 = x2 % 1;
    y2 = (y2*2) % 1;
    let d2 = abs(x2 - y2)/sqrt(2)*0.75;
    d2 = smin(d2, abs(x2 - y2 + 1)/sqrt(2)*0.75, 0.1);
    d2 = smin(d2, abs(x2 - y2 - 1)/sqrt(2)*0.75, 0.1);
    d2 = smin(d2, abs(x2 + y2)/sqrt(2)*0.75, 0.1);
    d2 = smin(d2, abs(x2 + y2 - 1)/sqrt(2)*0.75, 0.1);
    d2 = smin(d2, abs(x2 + y2 - 2)/sqrt(2)*0.75, 0.1);
    d2 *= 10;
    d = smin(d, d2, 0.1);
    d = constrain(d, 0, 1);

    let type;
    if (y < 600) {
      type = 'grass';
    } else if (y < 2000) {
      type = 'dirt';
    } else {
      type = 'rock';
      if (hash(i + 1/3, j + 1/3) < 0.001) {
        type = 'gold';
      }
    }
    return {density: d, type: type};
  }
}

earth.sampleVoronoi = function(i, j) {
  if (earth.modified[i] && earth.modified[i][j]) {
    return earth.modified[i][j];
  } else {
    let x = i*earth.tileSize, y = j*earth.tileSize;

    let h = noise(x/800 + 1000)*400;
    let d = (y - h)/400 + 1
    let x2 = x/1200, y2 = y/1200;
    let res = voronoi(x2, y2, 0.8);
    let d2 = dist(x2, y2, res[1].x, res[1].y) - dist(x2, y2, res[0].x, res[0].y);
    d2 *= 1.8;
    d = smin(d, d2, 0.1);
    d = lerp(y/200 + 0.6, d, constrain(dist(x, y, 100*PI, 0)/400 - 1, 0, 1));
    d = constrain(d, 0, 1);

    let type;
    if (y < 600) {
      type = 'grass';
    } else if (y < 2000) {
      type = 'dirt';
    } else {
      type = 'rock';
      if (hash(i + 2/3, j + 2/3) < 0.001) {
        type = 'gold';
      }
    }
    return {density: d, type: type};
  }
}

earth.sample = earth.sampleRect;

earth.bomb = function(x, y) {
  let ts = earth.tileSize;
  let bi = floor(x/ts), bj = floor(y/ts);
  let goldHit = false;
  for (let i = bi - 1; i <= bi + 2; i++) {
    earth.modified[i] = earth.modified[i] || {};
    for (let j = bj - 1; j <= bj + 2; j++) {
      if (!(i === 4 && j === 0 || i === 5 && j === 0
      || i === 11 && j === 0 || i === 12 && j === 0)) {
        let s = earth.sample(i, j);
        let d = dist(x, y, i*ts, j*ts);
        let density = min(s.density, d/(ts*2));
        if (s.density >= 0.5 && density < 0.5) {
          switch (s.type) {
            case 'grass':
            case 'dirt':
              player.dirt++;
              break;
            case 'rock':
              player.stone++;
              break;
            case 'gold':
              player.gold++;
              goldHit = true;
              break;
          }
        }
        earth.modified[i][j] = {density: density, type: s.type};
      }
    }
  }
  if (goldHit) {
    sfx.gold.play();
    if (!infoBot.sawGold) {
      infoBot.speak();
      infoBot.sawGold = true;
    }
  }
  for (let i = bi - 2; i <= bi + 2; i++) {
    for (let j = bj - 2; j <= bj + 2; j++) {
      if (earth.tiles[i] && earth.tiles[i][j] && player.ropeJoint
      && earth.tiles[i][j].body === player.ropeJoint.getBodyB()) {
        player.resetGrapple();
      }
      earth.updateTile(i, j);
    }
  }
  for (let i = bi - 2; i <= bi + 2; i++) {
    for (let j = bj - 2; j <= bj + 2; j++) {
      if (trees.tiles[i] && trees.tiles[i][j]) {
        let isFalling = false;
        let treeList = trees.tiles[i][j];
        for (let tli in treeList) {
          let v = treeList[tli];
          if (!v.alive) {
            isFalling = true;
          }
        }
        if (!isFalling) {
          if (trees.tiles[i]) {
            trees.removeTile(i, j);
            trees.tiles[i][j] = [];
          }
        }
      }
      if (plants.tiles[i]) {
        plants.removeTile(i, j);
        plants.tiles[i][j] = [];
      }
      if (rocks.tiles[i]) {
        rocks.removeTile(i, j);
        rocks.tiles[i][j] = [];
      }
    }
  }
}

earth.removeTile = function(i, j) {
  if (earth.tiles[i] && earth.tiles[i][j]) {
    if (earth.tiles[i][j].body) {
      world.destroyBody(earth.tiles[i][j].body)
    }
    delete earth.tiles[i][j];
  }
}

earth.marchingSquares = function(q1, q2, q3, q4, allowSmall) {
  let q1b = q1 < 0.5 ? 0 : 1;
  let q2b = q2 < 0.5 ? 0 : 1;
  let q3b = q3 < 0.5 ? 0 : 1;
  let q4b = q4 < 0.5 ? 0 : 1;
  let pid = q1b + q2b*2 + q3b*4 + q4b*8;
  let f1 = (0.5 - q2)/(q1 - q2);
  let f2 = (0.5 - q2)/(q3 - q2);
  let f3 = (0.5 - q3)/(q4 - q3);
  let f4 = (0.5 - q1)/(q4 - q1);
  //f1=f2=f3=f4=0.5;
  if (!allowSmall) {
    f1 = constrain(f1, 0.1, 0.9);
    f2 = constrain(f2, 0.1, 0.9);
    f3 = constrain(f3, 0.1, 0.9);
    f4 = constrain(f4, 0.1, 0.9);
  }
  let poly;
  let edges = [];
  switch (pid) {
    case 1:
      poly = [Vec2(1, 0), Vec2(1, f4), Vec2(f1, 0)];
      edges.push([Vec2(1, f4), Vec2(f1, 0)]);
      break;
    case 2:
      poly = [Vec2(0, 0), Vec2(f1, 0), Vec2(0, f2)];
      edges.push([Vec2(f1, 0), Vec2(0, f2)]);
      break;
    case 3:
      poly = [Vec2(0, 0), Vec2(1, 0), Vec2(1, f4), Vec2(0, f2)];
      edges.push([Vec2(1, f4), Vec2(0, f2)]);
      break;
    case 4:
      poly = [Vec2(0, 1), Vec2(0, f2), Vec2(f3, 1)];
      edges.push([Vec2(0, f2), Vec2(f3, 1)]);
      break;
    case 5:
      poly = [Vec2(1, 0), Vec2(1, f4), Vec2(f3, 1), Vec2(0, 1), Vec2(0, f2), Vec2(f1, 0)];
      edges.push([Vec2(1, f4), Vec2(f3, 1)]);
      edges.push([Vec2(0, f2), Vec2(f1, 0)]);
      break;
    case 6:
      poly = [Vec2(0, 0), Vec2(f1, 0), Vec2(f3, 1), Vec2(0, 1)];
      edges.push([Vec2(f1, 0), Vec2(f3, 1)]);
      break;
    case 7:
      poly = [Vec2(0, 0), Vec2(1, 0), Vec2(1, f4), Vec2(f3, 1), Vec2(0, 1)];
      edges.push([Vec2(1, f4), Vec2(f3, 1)]);
      break;
    case 8:
      poly = [Vec2(1, 1), Vec2(f3, 1), Vec2(1, f4)];
      edges.push([Vec2(f3, 1), Vec2(1, f4)]);
      break;
    case 9:
      poly = [Vec2(1, 0), Vec2(1, 1), Vec2(f3, 1), Vec2(f1, 0)];
      edges.push([Vec2(f3, 1), Vec2(f1, 0)]);
      break;
    case 10:
      poly = [Vec2(0, 0), Vec2(f1, 0), Vec2(1, f4), Vec2(1, 1), Vec2(f3, 1), Vec2(0, f2)];
      edges.push([Vec2(f1, 0), Vec2(1, f4)]);
      edges.push([Vec2(f3, 1), Vec2(0, f2)]);
      break;
    case 11:
      poly = [Vec2(0, 0), Vec2(1, 0), Vec2(1, 1), Vec2(f3, 1), Vec2(0, f2)];
      edges.push([Vec2(f3, 1), Vec2(0, f2)]);
      break;
    case 12:
      poly = [Vec2(0, 1), Vec2(0, f2), Vec2(1, f4), Vec2(1, 1)];
      edges.push([Vec2(0, f2), Vec2(1, f4)]);
      break;
    case 13:
      poly = [Vec2(1, 0), Vec2(1, 1), Vec2(0, 1), Vec2(0, f2), Vec2(f1, 0)];
      edges.push([Vec2(0, f2), Vec2(f1, 0)]);
      break;
    case 14:
      poly = [Vec2(0, 0), Vec2(f1, 0), Vec2(1, f4), Vec2(1, 1), Vec2(0, 1)];
      edges.push([Vec2(f1, 0), Vec2(1, f4)]);
      break;
    case 15:
      poly = [Vec2(0, 0), Vec2(1, 0), Vec2(1, 1), Vec2(0, 1)];
      break;
  }
  return {pid: pid, poly: poly, edges: edges};
}

earth.updateTile = function(i, j) {
  i = Number(i), j = Number(j);
  let ts = earth.tileSize;
  earth.removeTile(i, j);
  earth.tiles[i] = earth.tiles[i] || {};
  earth.tiles[i][j] = {color: 0, edges: []};
  let tile = earth.tiles[i][j];
  let s1 = earth.sample(i+1, j);
  let s2 = earth.sample(i, j);
  let s3 = earth.sample(i, j+1);
  let s4 = earth.sample(i+1, j+1);
  let q1 = s1.density;
  let q2 = s2.density;
  let q3 = s3.density;
  let q4 = s4.density;
  let qa = (q1 + q2 + q3 + q4)/4;
  tile.type = s2.type;
  let c = 1 + (0.5 - qa)*0.5;
  switch (s2.type) {
    case 'grass':
      tile.color = color(62*c, 98*c, 89*c);
      break;
    case 'dirt':
      tile.color = color(82*c, 70*c, 50*c);
      break;
    case 'gold':
      if (q2 < 0.5) {
        tile.type = 'rock';
      }
      // inherit color from rock
    default:
    case 'rock':
      tile.color = color(106*c, 107*c, 131*c);
      break;
  }
  if (tile.type === 'gold') {
    tile.goldPoly = [];
    let numPts = 20;
    let a = hash(i + 1/2, j);
    let b = hash(i, j + 1/2);
    let s = 6 + hash(i + 1/2, j + 1/2)*4;
    for (let vert_i=0; vert_i < numPts; vert_i++) {
      let t = vert_i/numPts;
      let r1 = sin(2*2*PI*ease.inOutQuad(saw(t + a)))/2 + 2;
      let r2 = sin(3*2*PI*ease.inOutQuad(saw(t + b)))/2 + 2;
      let r = min(r1, r2)*s;
      tile.goldPoly.push(Vec2(cos(t*2*PI)*r, -sin(t*2*PI)*r));
    }
  }
  let res = earth.marchingSquares(q1, q2, q3, q4);
  tile.pid = res.pid;
  if (res.poly) {
    res.poly = res.poly.map(Vec2.scaleFn(ts, ts));
    tile.poly = res.poly;
    if (tile.pid !== 15) {
      let b = world.createBody({
        position: Vec2(i*ts/meterScale, j*ts/meterScale),
        type: 'static'
      });
      let pts = res.poly.map(Vec2.scaleFn(1/meterScale, 1/meterScale));
      b.createFixture(planck.Polygon(pts), 1);
      tile.body = b;
    }
  }
  for (let e_i in res.edges) {
    res.edges[e_i] = res.edges[e_i].map(Vec2.scaleFn(ts, ts));
    tile.edges.push(res.edges[e_i])
  }
}

earth.updateWindow = function() {
  let ts = earth.tileSize;
  let newTiles = {}
  // pad for grapple, trees
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
  for (let i in earth.tiles) {
    for (let j in earth.tiles[i]) {
      if (newTiles[i] && newTiles[i][j]) {
        delete newTiles[i][j];
      } else {
        let isGrappled = false;
        if (player.ropeJoint) {
          if (earth.tiles[i][j].body === player.ropeJoint.getBodyB()) {
            isGrappled = true;
          }
        }
        if (!isGrappled) {
          earth.removeTile(i, j);
        }
      }
    }
  }
  for (let i in newTiles) {
    for (let j in newTiles[i]) {
      earth.updateTile(i, j);
    }
  }
}

earth.update = function(dt) {
  let ts = earth.tileSize;
  let newCamTile = {x: floor(cam.x/ts), y: floor(cam.y/ts)};
  if (newCamTile.x !== earth.camTile.x || newCamTile.y !== earth.camTile.y) {
    earth.camTile = newCamTile;
    earth.updateWindow();
  }
}

earth.draw = function() {
  let ts = earth.tileSize;
  let i1 = floor((cam.x - ssx/2)/ts) - 1;
  let i2 = floor((cam.x + ssx/2)/ts) + 1;
  let j1 = floor((cam.y - ssy/2)/ts) - 1;
  let j2 = floor((cam.y + ssy/2)/ts) + 1;
  let edges = [];
  let gold = [];
  noStroke();
  for (let i=i1; i <= i2; i++) {
    if (earth.tiles[i]) {
      for (let j=j1; j <= j2; j++) {
        let v = earth.tiles[i][j];
        if (v) {
          fill(v.color);
          if (v.poly) {
            beginShape();
            for (let vert_i in v.poly) {
              let vert = v.poly[vert_i];
              vertex(i*ts + vert.x, j*ts + vert.y);
            }
            endShape(CLOSE);
          }
          for (let e_i in v.edges) {
            edges.push({offset: Vec2(i*ts, j*ts), pts: v.edges[e_i]});
          }
          if (v.type === 'gold') {
            gold.push({x: i*ts, y: j*ts, poly: v.goldPoly});
          }
        }
      }
    }
  }
  stroke(0);
  for (let e_i in edges) {
    let edge = edges[e_i];
    line(edge.offset.x + edge.pts[0].x, edge.offset.y + edge.pts[0].y,
      edge.offset.x + edge.pts[1].x, edge.offset.y + edge.pts[1].y);
  }
  fill(255, 215, 0);
  for (let g_i in gold) {
    let v = gold[g_i];
    beginShape();
    for (let vert_i in v.poly) {
      let vert = v.poly[vert_i];
      vertex(v.x + vert.x, v.y + vert.y);
    }
    endShape(CLOSE);
  }
}