
var infoBot = {};

infoBot.load = function() {
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  infoBot.x = px - 60;
  infoBot.y = py + 40;
  infoBot.speaking = false;
  infoBot.speakTime = 0;
  infoBot.speakSymbols = [];
  infoBot.sawTeleport = false;
  infoBot.sawUseCoinMachine = false;
  infoBot.sawPortal = false;
  infoBot.sawTreeFall = false
  infoBot.sawGold = false;
  infoBot.sawDash = false;
  infoBot.sawDoubleJump = false;
  infoBot.sawGrapple = false;
}

infoBot.speak = function() {
  infoBot.speaking = true;
  infoBot.speakTime = time;
  infoBot.speakSymbols = [];
}

infoBot.update = function(dt) {
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  let targetX = px - 60*player.dir;
  let targetY = py - 70 + sin(time*3)*8;
  // snaps when direction changes while falling
  /*
  let d = dist(infoBot.x, infoBot.y, targetX, targetY);
  let newD = min(lerp(d, 0, min(4*dt, 1)), 200);
  if (d > 0.1) {
    infoBot.x = targetX + (infoBot.x - targetX)/d*newD;
    infoBot.y = targetY + (infoBot.y - targetY)/d*newD;
  }
  */
  infoBot.x = constrain(lerp(infoBot.x, targetX, min(4*dt, 1)), targetX - 200, targetX + 200);
  infoBot.y = constrain(lerp(infoBot.y, targetY, min(4*dt, 1)), targetY - 200, targetY + 200);
  if (infoBot.speaking) {
    if (infoBot.speakSymbols.length < min(floor((time - infoBot.speakTime)*16), 8)) {
      let sym = [];
      sym.push({x1: random()*2/3, y1: 0, x2: random()*2/3, y2: 1});
      sym.push({x1: random()*2/3, y1: 0, x2: random()*2/3, y2: 1});
      sym.push({x1: 0, y1: random(), x2: 2/3, y2: random()});
      infoBot.speakSymbols.push(sym);
    }
    if (time - infoBot.speakTime > 2) {
      infoBot.speaking = false;
    }
  }
}

infoBot.draw = function() {
  push();
  translate(round(infoBot.x), round(infoBot.y));
  fill(199, 232, 243);
  ellipse(0, 0, 10, 10);
  let space = 5 + sin(time*3 + PI/8)*2;
  beginShape();
  vertex(-5, -18 - space);
  vertex(5, -18 - space);
  vertex(4, -5 - space);
  vertex(-4, -5 - space);
  endShape(CLOSE);
  if (infoBot.speaking) {
    push();
    //scale(player.dir, 1);
    translate(8, -8);
    fill(199, 232, 243, 100);
    beginShape();
    let w = 6 + max(infoBot.speakSymbols.length*10, 1);
    let h = 21;
    vertex(0, 0);
    vertex(6, -9);
    vertex(6, -6 - h);
    vertex(6 + w, -6 - h);
    vertex(6 + w, -6);
    vertex(9, -6);
    endShape(CLOSE);
    for (let i in infoBot.speakSymbols) {
      let v = infoBot.speakSymbols[i];
      push();
      translate(9 + 10*i, -9 - 15);
      for (let li in v) {
        let lv = v[li];
        line(lv.x1*15, lv.y1*15, lv.x2*15, lv.y2*15);
        /*
        noFill();
        ellipse((lv.x1*15 + lv.x2*15)/2, (lv.y1*15 + lv.y2*15)/2,
          abs(lv.x2*15 - lv.x1*15), abs(lv.y2*15 - lv.y1*15));
        */
      }
      pop();
    }
    pop();
  }
  pop();
}