
var coinMachine = {}

coinMachine.load = function() {
  coinMachine.x = 100*PI - 90;
  coinMachine.y = -32;
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
    // 1 gold + 2 wood = 6 coins
    let numCoins = floor(min(player.gold*6, player.wood*3)/6)*6;
    if (numCoins !== 0) {
      //player.coins += coins;
      for (let i=0; i < numCoins; i++) {
        setTimeout(function() {
          coins.spawn(coinMachine.x, coinMachine.y);
        }, i*100);
      }
      sfx.anvil.play();
      player.gold -= numCoins/6;
      player.wood -= numCoins/3;
    }
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
  if (coinMachine.inRange()) {
    fill(128, 128, 128, 100);
    rect(x - 50, y - 150, 100, 100);
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(18);
    let maxCoins = player.gold*6;
    let coins = floor(min(player.gold*6, player.wood*3)/6)*6;
    let s = '(' + player.wood + '/' + maxCoins/3 + ') wood\n';
    s += player.gold + ' gold\n';
    s += '(' + coins + '/' + maxCoins + ') coins\n';
    text(s, x, y - 100);
    stroke(0);
  }
}