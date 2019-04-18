
var ui = {};

ui.draw = function() {
  noStroke();
  fill(128, 100);
  rect(10, 10, 210, 144);
  rect(10, 160, 210, 36);
  rect(650, 20, 140, 160);
  fill(0);
  textAlign(LEFT, TOP);
  textSize(32);
  text('Active Item:', 20, 20);
  textSize(24);
  switch (player.activeItem) {
    case 'dash':
      text('[1] Dash\n 2  Hatchet\n 3  Pickaxe', 20, 60);  
      break;
    case 'hatchet':
      text(' 1  Dash\n[2] Hatchet\n 3  Pickaxe', 20, 60);  
      break;
    case 'pickaxe':
      text(' 1  Dash\n 2  Hatchet\n[3] Pickaxe', 20, 60);  
      break;
  }
  textSize(16);
  text('Press R to return to spawn', 20, 170);
  textAlign(RIGHT, TOP);
  textSize(24);
  let s = player.wood + ' wood\n';
  s += player.dirt + ' dirt\n';
  s += player.stone + ' stone\n';
  s += player.gold + ' gold\n';
  s += player.coins + ' coins';
  //text(s, 780, 30);
  text(s, 752, 30);

  // wood icon
  push();
  translate(770, 42);
  rotate(time*PI/4);
  fill(96, 88, 86);
  rect(-10, -10, 20, 20);
  fill(195, 196, 158);
  rect(-7, -7, 14, 14);
  fill(160, 161, 130);
  rect(-4, -4, 8, 8);
  stroke(0);
  noFill();
  rect(-10.5, -10.5, 20, 20);
  pop();

  // dirt icon
  push();
  translate(770, 42 + 30);
  let dirtAngle = -time*PI/4;
  rotate(dirtAngle);
  let angles = [PI/4, 3*PI/4, 5*PI/4, 7*PI/4];
  let q = angles.map(function(v) {
    return -sin(v - dirtAngle)*sqrt(2) + 1.2;
  });
  let res = earth.marchingSquares(q[0], q[1], q[2], q[3], true);
  let grassPoly = res.poly.map(function(v) {
    return {x: v.x*20 - 10, y: v.y*20 - 10};
  });
  fill(62, 98, 89);
  beginShape();
  for (let i in grassPoly) {
    vertex(grassPoly[i].x, grassPoly[i].y);
  }
  endShape(CLOSE);

  q = angles.map(function(v) {
    return -sin(v - dirtAngle)*sqrt(2) + 0.5;
  })
  res = earth.marchingSquares(q[0], q[1], q[2], q[3], true);
  let dirtPoly = res.poly.map(function(v) {
    return {x: v.x*20 - 10, y: v.y*20 - 10};
  });
  fill(82, 70, 50);
  beginShape();
  for (let i in dirtPoly) {
    vertex(dirtPoly[i].x, dirtPoly[i].y);
  }
  endShape(CLOSE);

  stroke(0);
  noFill();
  beginShape();
  for (let i in grassPoly) {
    vertex(grassPoly[i].x, grassPoly[i].y);
  }
  endShape(CLOSE);
  pop();

  // stone icon
  push();
  translate(770, 42 + 30*2);
  let stoneAngle = time*PI/4
  rotate(stoneAngle);
  q = angles.map(function(v) {
    return -sin(v - stoneAngle)*sqrt(2) + 1.2;
  });
  res = earth.marchingSquares(q[0], q[1], q[2], q[3], true);
  stonePoly = res.poly.map(function(v) {
    return {x: v.x*20 - 10, y: v.y*20 - 10};
  });
  fill(106, 107, 131);
  stroke(0);
  beginShape();
  for (let i in stonePoly) {
    vertex(stonePoly[i].x, stonePoly[i].y);
  }
  endShape(CLOSE);
  pop();

  // gold icon
  push();
  translate(770, 42 + 30*3);
  rotate(-time*PI/4);
  stroke(0);
  fill(255, 215, 0);
  let numPts = 20;
  let a = saw(time*0.05);
  let b = saw(-time*0.07 + 0.25);
  beginShape();
  for (let vert_i=0; vert_i < numPts; vert_i++) {
    let t = vert_i/numPts;
    let r1 = sin(2*2*PI*ease.inOutQuad(saw(t + a)))/2 + 2;
    let r2 = sin(3*2*PI*ease.inOutQuad(saw(t + b)))/2 + 2;
    let r = min(r1, r2)*6;
    vertex(cos(t*2*PI)*r, -sin(t*2*PI)*r);
  }
  endShape(CLOSE);
  pop();

  // coin icon
  push();
  translate(770, 42 + 30*4);
  rotate(time*PI/4);
  let frame = floor(time*8) % 8;
  image(gfx.coinSheet, -8, -8, 16, 16, frame*16, 0, 16, 16);
  pop();
}