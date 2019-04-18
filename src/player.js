
var player = {};

player.load = function() {
  player.acceleration = 16;
  player.maxSpeed = 8;
  player.friction = 4;
  player.spawnX = 100*PI;
  player.spawnY = -200;
  player.dir = 1;
  player.running = false;
  player.jumping = false;
  player.jumpTime = 0;
  player.fallTime = 0;
  player.anim = 'idle';
  player.frame = 0;
  player.frameTimer = 1;

  player.body = world.createBody({
    position: Vec2(player.spawnX/meterScale, player.spawnY/meterScale),
    type: 'dynamic',
    fixedRotation: true,
    allowSleep: false,
    bullet: true
  });
  let fixDef = {density: 1/3, friction: 0, restitution: 0};
  player.body.createFixture(planck.Box(19/meterScale, 19/meterScale), fixDef);
  player.body.createFixture(planck.Circle(Vec2(0, 20/meterScale), 20/meterScale), fixDef);
  player.body.createFixture(planck.Circle(Vec2(0, -20/meterScale), 20/meterScale), fixDef);

  player.jumpSensor = {};
  let js = player.jumpSensor;
  // prev 0,26
  js.shape = planck.Circle(Vec2(0, 34/meterScale), 18/meterScale);
  js.fixture = player.body.createFixture(js.shape, 1);
  js.fixture.setSensor(true);

  player.jumpContacts = 0;
  player.doubleJumped = true;
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

  player.teleporting = false;
  player.teleportTimer = 0;
  player.teleportAction = function() {};
}

player.resetGrapple = function() {
  if (player.ropeJoint) {
    world.destroyJoint(player.ropeJoint);
    player.ropeJoint = null;
  }
}

player.resetPosition = function(x, y) {
  x = orDefault(x, player.spawnX);
  y = orDefault(y, player.spawnY);
  player.body.setPosition(Vec2(x/meterScale, y/meterScale));
  player.body.setLinearVelocity(Vec2(0, 0));
  player.dashed = true;
  player.resetGrapple();
  cam.x = x, cam.y = y;
  infoBot.x = x - 60;
  infoBot.y = y + 40;
}

player.teleport = function(x, y, action) {
  x = orDefault(x, player.spawnX);
  y = orDefault(y, player.spawnY);
  player.teleportAction = orDefault(action, function() {
    player.resetPosition(x, y);
    if (!infoBot.sawTeleport) {
      infoBot.speak();
      infoBot.sawTeleport = true;
    }
  });
  player.teleporting = true;
  player.teleportTimer = 1;
  player.resetGrapple();
  player.body.setActive(false);
  sfx.teleport.play();
}

player.update = function(dt) {
  let lv = player.body.getLinearVelocity();
  let p = player.body.getWorldPoint(Vec2(0, 0));

  let p2 = Vec2(p.x, p.y + 100/meterScale);
  let normal = Vec2(0, -1);
  let tangent = Vec2(1, 0);

  if (player.jumpContacts === 0) {
    player.body.applyForce(Vec2(0, gravity), p, true);
    if (time - player.fallTime > 1/4) {
      player.jumping = true;
    }
  } else {
    player.rayCast.reset();
    world.rayCast(p, p2, player.rayCast.callback);
    if (player.rayCast.hit) {
      normal = player.rayCast.normal;
      tangent = Vec2(-normal.y, normal.x);
    }

    let s = -gravity;
    player.body.applyForce(Vec2.scaleFn(s, s)(normal), p, true);

    player.doubleJumped = false;
    if (!player.dashedThisFrame) {
      player.dashed = false;
    }

    // no friction if accelerating to max (same speed in air)
    if (abs(lv.x) > player.maxSpeed || !(keyIsDown(68) || keyIsDown(65))) {
      //player.body.applyForce(Vec2(-player.friction*lv.x, 0), p, true);
      let s = -player.friction*lv.x;
      player.body.applyForce(Vec2.scaleFn(s, s)(tangent), p, true);
    }

    if (player.jumping && time - player.jumpTime > 1/4) {
      player.jumping = false;
      player.frameTimer = 0;
    }
  }
  player.dashedThisFrame = false;
  
  if (keyIsDown(68)) { // d
    if (lv.x < player.maxSpeed) {
      //player.body.applyForce(Vec2(player.acceleration, 0), p, true);
      let s = player.acceleration;
      player.body.applyForce(Vec2.scaleFn(s, s)(tangent), p, true);
    }
  }
  if (keyIsDown(65)) { //a
    if (lv.x > -player.maxSpeed) {
      //player.body.applyForce(Vec2(-player.acceleration, 0), p, true);
      let s = -player.acceleration;
      player.body.applyForce(Vec2.scaleFn(s, s)(tangent), p, true);
    }
  }

  player.running = false;
  if (abs(lv.x) > 1) {
    player.dir = lv.x < 0 ? -1 : 1;
    player.running = true;
  }

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

  let wmx = constrain(mouseX, 0, ssx) - ssx/2 + cam.x;
  let wmy = constrain(mouseY, 0, ssy) - ssy/2 + cam.y;
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
                  if (!infoBot.sawTreeFall) {
                    infoBot.speak();
                    infoBot.sawTreeFall = true;
                  }
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

  player.anim = 'idle';
  if (player.jumping) {
    player.anim = 'jump'
  } else if (player.running) {
    player.anim = 'run';
  }
  let fps;
  switch (player.anim) {
    default:
    case 'idle':
      fps = 6;
      break;
    case 'run':
      fps = 2 + (abs(lv.x) - 1)/7*10;
      break;
    case 'jump':
      fps = 8;
      break;
  }
  player.frameTimer -= fps*dt;
  if (player.frameTimer < 0 && !player.teleporting) {
    player.frameTimer = max(player.frameTimer + 1, 0);
    switch (player.anim) {
      default:
      case 'idle':
        if (player.frame >= 0 && player.frame <= 2) {
          player.frame++;
        } else {
          player.frame = 0;
        }
        break;
      case 'run':
        if (player.frame >= 4 && player.frame <= 8) {
          player.frame++;
        } else {
          player.frame = 4;
        }
        break;
      case 'jump':
        switch (player.frame) {
          default:
            player.frame = 10;
            break;
          case 10:
            player.frame = 11;
            break;
          case 11:
            if (lv.y > 0) {
              player.frame = 12;
            }
            break;
          case 12:
            player.frame = 13;
            break;
          case 13:
            player.frame = 12;
            break;
        }
        break;
    }
  }

  if (player.teleporting) {
    player.teleportTimer -= dt*2;
    if (player.teleportTimer < 0) {
      player.teleporting = false;
      player.body.setActive(true);
      player.teleportAction();
    }
  }
}

player.mousePressed = function() {
  let wmx = constrain(mouseX, 0, ssx) - ssx/2 + cam.x;
  let wmy = constrain(mouseY, 0, ssy) - ssy/2 + cam.y;
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
      if (!infoBot.sawDash) {
        infoBot.speak();
        infoBot.sawDash = true;
      }
      player.frame = 10;
      player.frameTimer = 1;
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
        player.doubleJumped = false;
        player.dashed = false;
      }
      sfx.grapple.play();
      if (!infoBot.sawGrapple) {
        infoBot.speak();
        infoBot.sawGrapple = true;
      }
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

player.jump = function() {
  let lv = player.body.getLinearVelocity();
  lv.y = -10;
  sfx.jump.play();
  player.jumping = true;
  player.jumpTime = time;
  player.frame = 10;
  player.frameTimer = 1;
}

player.keyPressed = function() {
  let rj = player.ropeJoint;
  switch (keyCode) {
    case 32: // space
      if (player.jumpContacts !== 0) {
        player.jump();
      } else if (rj) {
        let rja = rj.getAnchorA(), rjb = rj.getAnchorB();
        if (rja.y > rjb.y - abs(rja.x - rjb.x)) {
          player.jump();
        }
        player.resetGrapple();
      } else if (!player.doubleJumped) {
        player.jump();
        player.doubleJumped = true;
        if (!infoBot.sawDoubleJump) {
          infoBot.speak();
          infoBot.sawDoubleJump = true;
        }
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
    case 82: // r
      player.teleport();
      break;
    case 84: // t
      player.teleport(0, -10000 - 200);
      break;
  }
}

player.frame2xy = function(i) {
  let spriteW = 92;
  return {x: i*spriteW, y: 0};
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
    push();
    translate(apx, apy);
    rotate(a);
    rect(0, -2, d, 4);
    pop();
    ellipse(apx, apy, 10, 10);
  }
  fill(142, 65, 98);
  //drawBody(player.body, true);
  push();
  translate(round(px), round(py));
  scale(player.dir, 1);
  let framePos = player.frame2xy(player.frame);
  let spriteW = 92, spriteH = 107;
  let x = -spriteW/2, y = -spriteH + 40 + 4;
  if (player.teleporting) {
  spriteH *= ease.inOutQuad(player.teleportTimer);
  }
  image(gfx.playerSheet, x, y, spriteW, spriteH,
    framePos.x, framePos.y, spriteW, spriteH);
  if (player.teleporting) {
    fill(155, 243, 240);
    rect(-30, y + spriteH - 2, 60, 4);
  }
  pop();
}