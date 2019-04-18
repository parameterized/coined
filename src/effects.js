
var effects = {};
effects.container = [];

function Effect(t) {
  this.x = t.x;
  this.y = t.y;
  this.a = t.a;
  this.spawnTime = time;
  this.life = 0.5;
  this.alive = true;
}

Effect.prototype.update = function(dt) {
  if (time - this.spawnTime > this.life) {
    this.alive = false;
  }
}

Effect.prototype.draw = function() {
  push();
  translate(this.x, this.y);
  rotate(this.a);
  fill(0);
  let t = constrain((time - this.spawnTime)/this.life, 0, 1);
  let t2 = pow(1-t, 3);
  rect(30 - t2*30 + t*10 + 4, -8, t2*30, 2);
  rect(30 - t2*30 + t*10, -1, t2*30, 2);
  rect(30 - t2*30 + t*10 + 4, 6, t2*30, 2);
  pop();
}


effects.new = function(t) {
  let v = new Effect(t);
  effects.container.push(v);
  return v;
}

effects.update = function(dt) {
  for (let i=0; i < effects.container.length; i++) {
    let v = effects.container[i];
    v.update(dt);
  }
  effects.container = effects.container.filter(function(v) {
    return v.alive;
  });
}

effects.draw = function() {
  for (let i=0; i < effects.container.length; i++) {
    let v = effects.container[i];
    v.draw();
  }
}