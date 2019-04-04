
var coinMachine = {}

coinMachine.load = function() {
  coinMachine.x = 100*PI - 90;
  coinMachine.y = -44;
}

coinMachine.inRange = function() {
  let x = coinMachine.x, y = coinMachine.y;
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  let range = 80;
  return (abs(px - x) < range && abs(py - y) < range);
}

coinMachine.keyPressed = function() {
  if (keyCode === 69 && coinMachine.inRange()) { // e
    player.coins += player.gold;
    player.gold = 0;
    sfx.anvil.play();
  }
}

coinMachine.draw = function() {
  let x = coinMachine.x, y = coinMachine.y;
  fill(106, 107, 131);
  if (coinMachine.inRange()) {
    stroke(255);
  }
  beginShape();
  vertex(x - 20, y - 20);
  vertex(x + 20, y - 20);
  vertex(x + 10, y + 0);
  vertex(x + 20, y + 20);
  vertex(x - 20, y + 20);
  vertex(x - 10, y + 0);
  endShape(CLOSE);
  stroke(0);
}