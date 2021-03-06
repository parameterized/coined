
var menu = {};

menu.state = 'main';
menu.labels = {'main': [], 'options': [], 'end': []};
menu.buttons = {'main': [], 'options': [], 'end': []};
menu.sliders = {'main': [], 'options': [], 'end': []};

menu.heldSlider = null;
menu.showedEnd = false;

menu.addLabel = function(t) {
  t.state = orDefault(t.state, 'main');
  t.text = orDefault(t.text, 'Label');
  t.textSize = orDefault(t.textSize, 32);
  t.x = orDefault(t.x, ssx/2);
  t.y = orDefault(t.y, ssy/2);
  menu.labels[t.state].push(t);
  return t;
}

menu.addButton = function(t) {
  t.state = orDefault(t.state, 'main');
  t.text = orDefault(t.text, 'Button');
  t.x = orDefault(t.x, ssx/2);
  t.y = orDefault(t.y, ssy/2);
  let _ts = textSize();
  textSize(24);
  t.w = orDefault(t.w, textWidth(t.text) + 60);
  t.h = orDefault(t.h, textSize() + 36);
  textSize(_ts);
  t.action = orDefault(t.action, function() {});
  menu.buttons[t.state].push(t);
  return t;
}

menu.addSlider = function(t) {
  t.state = orDefault(t.state, 'main');
  t.x = orDefault(t.x, ssx/2);
  t.y = orDefault(t.y, ssy/2);
  t.w = orDefault(t.w, 200);
  t.val = orDefault(t.val, 0.5);
  menu.sliders[t.state].push(t);
  return t;
}

menu.load = function() {
  menu.addLabel({state: 'main', text: 'Coined', textSize: 48, y: 150});
  menu.addButton({state: 'main', text: 'Play', y: 300, action: function() {
    gameState = 'playing';
    ambience.play();
  }});
  menu.addButton({state: 'main', text: 'Options', y: 400, action: function() {
    menu.state = 'options';
  }});

  menu.addLabel({state: 'options', text: 'Options', textSize: 40, y: 100});
  menu.addLabel({state: 'options', text: 'Volume', y: 200});
  // vol 0-150%
  menu.volumeSlider = menu.addSlider({state: 'options', y: 250, val: 2/3});
  menu.addButton({state: 'options', text: 'Back', x: 600, y: 500, action: function() {
    menu.state = 'main';
  }});

  menu.addLabel({state: 'end', text: 'Thanks for playing!', textSize: 40, y: 100});
  //menu.addLabel({state: 'end', text: 'Completed in: 0m00s', y: 200});
  menu.addButton({state: 'end', text: 'Continue', y: 300, action: function() {
    gameState = 'playing';
    menu.state = 'main';
    ambience.play();
  }});
}

menu.update = function(dt) {
  let v = menu.heldSlider;
  if (v) {
    v.val = constrain((mouseX - (v.x - v.w/2))/v.w, 0, 1);
    if (v === menu.volumeSlider) {
      masterVolume(v.val*1.5);
    }
  }
}

menu.mousePressed = function() {
  if (mouseButton === LEFT) {
    for (let i=0; i < menu.buttons[menu.state].length; i++) {
      let v = menu.buttons[menu.state][i];
      if (abs(mouseX - v.x) < v.w/2 && abs(mouseY - v.y) < v.h/2) {
        v.action();
        sfx.select.play();
      }
    }
    for (let i=0; i < menu.sliders[menu.state].length; i++) {
      let v = menu.sliders[menu.state][i];
      if (abs(mouseX - v.x) < v.w/2 + 10 && abs(mouseY - v.y) < 10) {
        menu.heldSlider = v;
      }
    }
  }
}

menu.mouseReleased = function() {
  if (mouseButton === LEFT) {
    menu.heldSlider = null;
  }
}

menu.keyPressed = function() {
  if (keyCode === 27) { // escape 
    if (menu.state === 'options') {
      menu.state = 'main';
    }
  }
}

menu.draw = function() {
  fill(0, 0, 0);
  for (let i=0; i < menu.labels[menu.state].length; i++) {
    let v = menu.labels[menu.state][i];
    textSize(v.textSize);
    text(v.text, v.x, v.y);
  }
  textSize(24);
  for (let i=0; i < menu.buttons[menu.state].length; i++) {
    let v = menu.buttons[menu.state][i];
    if (abs(mouseX - v.x) < v.w/2 && abs(mouseY - v.y) < v.h/2) {
      fill(118, 104, 65);
      document.body.style.cursor = 'pointer';
    } else {
      fill(143, 126, 79);
    }
    rect(v.x - v.w/2, v.y - v.h/2, v.w, v.h);
    fill(0, 0, 0);
    text(v.text, v.x, v.y);
  }
  for (let i=0; i < menu.sliders[menu.state].length; i++) {
    let v = menu.sliders[menu.state][i];
    if (abs(mouseX - v.x) < v.w/2 + 10 && abs(mouseY - v.y) < 10) {
      fill(118, 104, 65);
    } else {
      fill(143, 126, 79);
    }
    rect(v.x - v.w/2, v.y - 5, v.w, 10);
    fill(0, 0, 0);
    ellipse(v.x - v.w/2 + v.w*v.val, v.y, 20, 20);
  }
}