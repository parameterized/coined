
var cam = {x: 0, y: 0};

cam.load = function() {
  cam.x = player.spawnX
  cam.y = player.spawnY;
}

cam.set = function() {
  push();
  translate(round(-(cam.x - ssx/2)), round(-(cam.y - ssy/2)));
}

cam.reset = function() {
  pop();
}

cam.update = function(dt) {
  let dmx = constrain(mouseX, 0, ssx) - ssx/2;
  let dmy = constrain(mouseY, 0, ssy) - ssy/2;
  let pos = player.body.getPosition();
  let targetX = pos.x*meterScale + dmx*0.1
  let targetY = pos.y*meterScale + dmy*0.1;
  //cam.x = lerp(cam.x, targetX, min(8*dt, 1));
  //cam.y = lerp(cam.y, targetY, min(8*dt, 1));
  let d = dist(cam.x, cam.y, targetX, targetY);
  let newD = min(lerp(d, 0, min(8*dt, 1)), 200);
  if (d > 0.1) {
    cam.x = targetX + (cam.x - targetX)/d*newD;
    cam.y = targetY + (cam.y - targetY)/d*newD;
  }
}