
var ambience = {};

ambience.play = function() {
  sfx.forestAmbience.play();
  sfx.caveAmbience.play();
  sfx.wind.play();
}

ambience.pause = function() {
  sfx.forestAmbience.pause();
  sfx.caveAmbience.pause();
  sfx.wind.pause();
}

ambience.update = function(dt) {
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  let t = constrain((py - 600)/(2000 - 600), 0, 1);
  sfx.forestAmbience.setVolume((1-t)*0.3);
  sfx.caveAmbience.setVolume(t*0.6);
  let lv = player.body.getLinearVelocity();
  t = constrain((mag(lv.x, lv.y) - 20)/40, 0, 1);
  sfx.wind.setVolume(t*0.4, 0.2);
}