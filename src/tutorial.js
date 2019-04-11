
var tutorial = {}

tutorial.load = function() {
  tutorial.ground = world.createBody({
    position: Vec2(0, -10000/meterScale),
    type: 'static'
  });
  tutorial.ground.createFixture(planck.Box(400/meterScale, 40/meterScale), 1);

  player.resetPosition(0, -10000 - 200);
}

tutorial.draw = function() {
  fill(160, 80, 80);
  drawBody(tutorial.ground);
  fill(128, 128, 128, 100);
  let y = -10000;
  rect(-90, y - 250, 180, 32);
  rect(120, y - 320, 320, 250);
  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(16);
  text('Press R to skip tutorial', 0, y - 250 + 16);
  let s = 'Controls:\n\n';

  s += 'Movement: A/D\n';
  s += 'Jump: Space\n';
  s += 'Use active item: Left click\n';
  s += 'Change active item: Scroll or number keys\n';
  s += 'Grapple: Right click\n';
  s += 'Change grapple rope length: W/S\n';
  s += 'Return to spawn: R\n';
  s += 'Return to tutorial: T\n';
  s += 'Use object: E';
  textAlign(CENTER, TOP);
  text(s, 280, y - 300);
  stroke(0);
}