
var coins = {};
coins.container = [];

function Coin(t) {
  this.x = orDefault(t.x, 0);
  this.y = orDefault(t.y, 0);
  this._x = this.x, this._y = this.y;
  this.frame = orDefault(t.frame, floor(random(8)));
  this.animTimer = orDefault(t.timer, random());
  this.lifeTimer = 1;
}

Coin.prototype.update = function(dt) {
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  this.animTimer -= dt*8;
  if (this.animTimer < 0) {
    this.animTimer = max(this.animTimer + 1, 0);
    this.frame = (this.frame + 1) % 8;
  }
  this.lifeTimer -= dt;
  let t = ease.inCubic(constrain(1 - this.lifeTimer, 0, 1));
  this.x = lerp(this._x, px, t);
  this.y = lerp(this._y, py, t);
}

Coin.prototype.draw = function() {
  image(gfx.coinSheet, round(this.x - 8), round(this.y - 8), 16, 16,
    this.frame*16, 0, 16, 16);
}


coins.spawn = function(x, y) {
  coins.container.push(new Coin({x: x, y: y}));
}

coins.update = function(dt) {
  for (let i in coins.container) {
    coins.container[i].update(dt);
  }
  coins.container = coins.container.filter(function(v) {
    if (v.lifeTimer > 0) {
      return true;
    } else {
      player.coins++;
      return false;
    }
  });
}

coins.draw = function() {
  for (let i in coins.container) {
    coins.container[i].draw();
  }
}