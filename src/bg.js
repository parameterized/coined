
var bg = {}

bg.draw = function() {
  // sky gradient top
  background(83, 188, 198);
  // sky gradient bottom
  //background(194, 192, 188);
  image(gfx.sky, round(cam.x - 1920/2), round(cam.y*0.9 - 1080/2));
  let x = round(cam.x*0.9 - 1920/2);
  x += floor((cam.x - x)/1920)*1920;
  // todo: only need 2
  for (let i=-1; i <= 1; i++) {
    image(gfx.mountains3, x + i*1920, round((cam.y - (1080/2 - ssy/2))*0.9 - 1080/2));
  }
  x = round(cam.x*0.8 - 1920/2);
  x += floor((cam.x - x)/1920)*1920;
  for (let i=-1; i <= 1; i++) {
    image(gfx.mountains2, x + i*1920, round((cam.y - (1080/2 - ssy/2))*0.8 - 1080/2));
  }
  x = round(cam.x*0.7 - 1920/2);
  x += floor((cam.x - x)/1920)*1920;
  for (let i=-1; i <= 1; i++) {
    image(gfx.mountains1, x + i*1920, round((cam.y - (1080/2 - ssy/2))*0.7 - 1080/2));
  }
  cam.reset();
  let y = round((cam.y - (1080/2 - ssy/2))*0.7 + 840 - cam.y) - 1; // 840?
  if (y < ssy) {
    fill(66, 56, 77);
    noStroke();
    rect(0, y, ssx, ssy - y);
    stroke(0);
  }
  cam.set();
}