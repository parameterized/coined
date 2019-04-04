
var physics = {};

var Vec2 = planck.Vec2;
var meterScale = 64;
var world;
var groundBody;

physics.load = function() {
  world = planck.World({
    gravity: Vec2(0, 30)
  });

  world.on('begin-contact', function(contact) {
    let fA = contact.getFixtureA(), bA = fA.getBody();
    let fB = contact.getFixtureB(), bB = fB.getBody();
    if (fA === player.jumpSensor.fixture) {
      if (fB !== player.fixture) {
        player.jumpContacts++;
      }
    } else if (fB === player.jumpSensor.fixture) {
      if (fA !== player.fixture) {
        player.jumpContacts++;
      }
    }
  });
  world.on('end-contact', function(contact) {
    let fA = contact.getFixtureA(), bA = fA.getBody();
    let fB = contact.getFixtureB(), bB = fB.getBody();
    if (fA === player.jumpSensor.fixture) {
      if (fB !== player.fixture) {
        player.jumpContacts--;
        if (player.jumpContacts === 0) {
          player.fallTime = time;
        }
      }
    } else if (fB === player.jumpSensor.fixture) {
      if (fA !== player.fixture) {
        player.jumpContacts--;
        if (player.jumpContacts === 0) {
          player.fallTime = time;
        }
      }
    }
  });
}