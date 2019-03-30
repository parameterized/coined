
var player = {};

player.load = function() {
  player.acceleration = 16;
  player.maxSpeed = 8;
  player.friction = 2;
  player.spawnX = 100*PI;
  player.spawnY = -200;

  player.body = world.createBody({
    position: Vec2(player.spawnX/meterScale, player.spawnY/meterScale),
    type: 'dynamic',
    fixedRotation: true,
    allowSleep: false,
    bullet: true
  });
  player.body.createFixture(planck.Box(19/meterScale, 19/meterScale), 1/3);
  player.body.createFixture(planck.Circle(Vec2(0, 20/meterScale), 20/meterScale), 1/3);
  player.body.createFixture(planck.Circle(Vec2(0, -20/meterScale), 20/meterScale), 1/3);

  player.jumpSensor = {};
  let js = player.jumpSensor;
  js.shape = planck.Circle(Vec2(0, 26/meterScale), 18/meterScale);
  js.fixture = player.body.createFixture(js.shape, 1);
  js.fixture.setSensor(true);

  player.jumpContacts = 0;
  player.dashed = true;
  player.dashedThisFrame = true;

  player.rayCast = (function() {
    let def = {};
    def.reset = function() {
      def.hit = false;
      def.body = null;
      def.point = null;
      def.normal = null;
    };
    def.callback = function(fixture, point, normal, fraction) {
      let body = fixture.getBody();
      if (body === player.body) {
        return -1;
      }
      def.hit = true;
      def.body = body;
      def.point = point;
      def.normal = normal;
      return fraction; // clip until closest found
    }
    return def;
  })();
  player.ropeJoint = null;

  player.pickaxePoint = null;

  player.activeItem = 'dash';
  player.hatchetTimer = 0;
  player.pickaxeTimer = 0;
  player.wood = 0;
  player.dirt = 0;
  player.stone = 0;
  player.gold = 0;
  player.coins = 0;
}

player.resetGrapple = function() {
  if (player.ropeJoint) {
    world.destroyJoint(player.ropeJoint);
    player.ropeJoint = null;
  }
}

player.update = function(dt) {
  let lv = player.body.getLinearVelocity();
  let p = player.body.getWorldPoint(Vec2(0, 0));
  if (keyIsDown(68) && lv.x < player.maxSpeed) { // d
    player.body.applyForce(Vec2(player.acceleration, 0), p, true);
  }
  if (keyIsDown(65) && lv.x > -player.maxSpeed) { //a
    player.body.applyForce(Vec2(-player.acceleration, 0), p, true);
  }
  if (player.jumpContacts !== 0) {
    if (!player.dashedThisFrame) {
      player.dashed = false;
    }
    // no friction if accelerating to max (same speed in air)
    if (abs(lv.x) > player.maxSpeed || !(keyIsDown(68) || keyIsDown(65))) {
      player.body.applyForce(Vec2(-player.friction*lv.x, 0), p, true);
    }
  }
  player.dashedThisFrame = false;

  let rj = player.ropeJoint;
  if (rj) {
    if (keyIsDown(87)) { // w
      let rlen = rj.getMaxLength() - 200/meterScale*dt;
      // don't continue tightening if stuck
      rlen = max(rlen, rj.m_length - 400/meterScale*dt);
      rlen = max(rlen, 50/meterScale);
      rj.setMaxLength(rlen);
    }
    if (keyIsDown(83)) { // s
      rj.setMaxLength(min(rj.getMaxLength() + 200/meterScale*dt, 600/meterScale));
    }
  }

  player.hatchetTimer -= dt;
  player.pickaxeTimer -= dt;

  let wmx = constrain(mouseX, 0, 800) - 400 + cam.x;
  let wmy = constrain(mouseY, 0, 600) - 300 + cam.y;
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  let dx = wmx - px; dy = wmy - py;
  player.pickaxePoint = null;
  switch (player.activeItem) {
    case 'hatchet':
      if (mouseIsPressed && mouseButton === LEFT
      && !uiMouseDown && player.hatchetTimer < 0) {
        for (let i in trees.tiles) {
          for (let j in trees.tiles[i]) {
            let treeList = trees.tiles[i][j];
            for (let tli in treeList) {
              let v = treeList[tli];
              if (v.hoveredInPlayerRange() && v.life > 0) {
                v.life--;
                player.hatchetTimer = 1/3;
                if (px < v.x) {
                  v.fallDir = -1;
                } else {
                  v.fallDir = 1;
                }
                if (v.life <= 0) {
                  sfx.treeFall.play();
                }
                sfx.treeChop.play();
              }
            }
          }
        }
      }
      break;
    case 'pickaxe':
      let d = mag(dx, dy);
      let p2 = Vec2(pos.x + dx/d*150/meterScale, pos.y + dy/d*150/meterScale);
      player.rayCast.reset();
      world.rayCast(pos, p2, player.rayCast.callback);
      if (player.rayCast.hit) {
        let hitPoint = player.rayCast.point;
        player.pickaxePoint = {x: hitPoint.x*meterScale, y: hitPoint.y*meterScale};
        if (mouseIsPressed && mouseButton === LEFT
        && !uiMouseDown && player.pickaxeTimer < 0) {
          let hx = hitPoint.x*meterScale, hy = hitPoint.y*meterScale
          earth.bomb(hx, hy);
          player.pickaxeTimer = 1/3;
          let ts = earth.tileSize;
          let type = earth.sample(floor(hx/ts), floor(hy/ts)).type;
          switch (type) {
            case 'grass':
            case 'dirt':
              sfx.dirt.play();
              break;
            default:
            case 'rock':
              sfx.rock.play();
          }
        }
      }
      break;
  }
}

player.mousePressed = function() {
  let wmx = constrain(mouseX, 0, 800) - 400 + cam.x;
  let wmy = constrain(mouseY, 0, 600) - 300 + cam.y;
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  let dx = wmx - px; dy = wmy - py;
  let d = mag(dx, dy);
  if (mouseButton === LEFT) {
    if (player.activeItem === 'dash' && !player.dashed) {
      let v = Vec2(dx/d*16, dy/d*16);
      player.body.setLinearVelocity(v);
      player.dashed = true;
      player.dashedThisFrame = true;
      effects.new({x: px, y: py, a: atan2(dx, -dy) + PI/2});
      sfx.dash.play();
    }
  } else if (mouseButton === RIGHT) {
    player.resetGrapple();
    let p2 = Vec2(pos.x + dx/d*600/meterScale, pos.y + dy/d*600/meterScale);
    player.rayCast.reset();
    world.rayCast(pos, p2, player.rayCast.callback);
    if (player.rayCast.hit) {
      let hitPoint = player.rayCast.point;
      player.ropeJoint = world.createJoint(planck.RopeJoint({
        maxLength: max(mag(hitPoint.x - pos.x, hitPoint.y - pos.y), 60/meterScale),
        localAnchorA: Vec2(0, 0),
        localAnchorB: player.rayCast.body.getLocalPoint(hitPoint),
        collideConnected: true
      }, player.body, player.rayCast.body));
      let rj = player.ropeJoint;
      let rja = rj.getAnchorA(), rjb = rj.getAnchorB();
      if (rja.y > rjb.y - abs(rja.x - rjb.x)) {
        player.dashed = false;
      }
      sfx.grapple.play();
    }
  }
}

player.mouseWheel = function(event) {
  if (event.delta !== 0) {
    switch (player.activeItem) {
      case 'dash':
        player.activeItem = event.delta > 0 ? 'hatchet' : 'pickaxe';
        break;
      case 'hatchet':
        player.activeItem = event.delta > 0 ? 'pickaxe' : 'dash';
        break;
      case 'pickaxe':
        player.activeItem = event.delta > 0 ? 'dash' : 'hatchet';
        break;
    }
  }
}

player.keyPressed = function() {
  let lv = player.body.getLinearVelocity();
  let rj = player.ropeJoint;
  switch (keyCode) {
    case 32: // space
      if (player.jumpContacts !== 0) {
        lv.y = -10;
        sfx.jump.play();
      } else if (rj) {
        let rja = rj.getAnchorA(), rjb = rj.getAnchorB();
        if (rja.y > rjb.y - abs(rja.x - rjb.x)) {
          lv.y = -10;
          sfx.jump.play();
        }
        player.resetGrapple();
      }
      break;
    case 17: // ctrl
      player.resetGrapple();
      break;
    case 49: // 1
      player.activeItem = 'dash';
      break;
    case 50: // 2
      player.activeItem = 'hatchet';
      break;
    case 51: // 3
      player.activeItem = 'pickaxe';
      break;
  }
}

player.draw = function() {
  let pos = player.body.getPosition();
  let px = pos.x*meterScale, py = pos.y*meterScale;
  if (player.ropeJoint) {
    fill(191, 154, 202);
    let ap = player.ropeJoint.getAnchorB();
    let apx = ap.x*meterScale, apy = ap.y*meterScale;
    let dx = px - apx, dy = py - apy;
    let d = mag(dx, dy)
    let a = atan2(dx, -dy) - PI/2;
    translate(apx, apy);
    rotate(a);
    rect(0, -2, d, 4);
    rotate(-a);
    translate(-apx, -apy);
    ellipse(apx, apy, 10, 10);
  }
  fill(142, 65, 98);
  drawBody(player.body);
}