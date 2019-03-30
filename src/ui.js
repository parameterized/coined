
var ui = {};

ui.draw = function() {
  noStroke();
  fill(128, 128, 128, 100);
  rect(10, 10, 200, 144);
  rect(650, 20, 140, 160);
  fill(0, 0, 0);
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
  textAlign(RIGHT, TOP);
  let s = player.wood + ' wood\n';
  s += player.dirt + ' dirt\n';
  s += player.stone + ' stone\n';
  s += player.gold + ' gold\n';
  s += player.coins + ' coins';
  text(s, 780, 30);
}