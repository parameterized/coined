
var ease = {
  inQuad: function (t) { return t*t },
  outQuad: function (t) { return t*(2-t) },
  inOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  inCubic: function (t) { return t*t*t },
  outCubic: function (t) { return (--t)*t*t+1 },
  inOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  inQuart: function (t) { return t*t*t*t },
  outQuart: function (t) { return 1-(--t)*t*t*t },
  inOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  inQuint: function (t) { return t*t*t*t*t },
  outQuint: function (t) { return 1+(--t)*t*t*t*t },
  inOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
};

function orDefault(x, d) {
  if (typeof(x) === 'undefined' || x === null) {
    return d;
  } else {
    return x;
  }
}

function drawBody(b, drawSensors) {
  for (let f = b.getFixtureList(); f; f = f.getNext()) {
    if (!f.isSensor() || drawSensors) {
      let s = f.getShape();
      if (s.m_type === 'polygon') {
        beginShape();
        for (let i=0; i < s.m_vertices.length; i++) {
          let v = s.m_vertices[i];
          let wp = b.getWorldPoint(v);
          vertex(wp.x*meterScale, wp.y*meterScale);
        }
        endShape(CLOSE);
      } else if (s.m_type === 'circle') {
        let wp = b.getWorldPoint(s.m_p)
        let r = s.getRadius()*meterScale;
        ellipse(wp.x*meterScale, wp.y*meterScale, r*2, r*2);
      }
    }
  }
}

function hash(x, y) {
  return abs(sin(x*12.9898 + y*4.1414)*43758.5453) % 1;
}

//(n1x, n1y, n2x, n2y) n=closest points
function voronoi(x, y, jitter) {
  jitter = orDefault(jitter, 1);
  let posix = floor(x);
  let posiy = floor(y);
  let pos2x = 0, pos2y = 0;
  let d = 0;
  let n1x = 0, n1y = 0, n2x = 0, n2y = 0;
  let n1d = 9, n2d = 9;
  for (let i=-2; i < 2; i++) {
    for (let j=-2; j < 2; j++) {
      pos2x = posix + i + 0.5 + (hash(posix + i, posiy + j)*2-1)*jitter*0.5;
      pos2y = posiy + j + 0.5 + (hash(posix + i + 0.5, posiy + j + 0.5)*2-1)*jitter*0.5;
      d = dist(x, y, pos2x, pos2y);
      if (d < n2d) {
        if (d < n1d) {
          n2d = n1d;
          n1d = d;
          n2x = n1x, n2y = n1y;
          n1x = pos2x, n1y = pos2y;
        } else {
          n2d = d;
          n2x = pos2x, n2y = pos2y;
        }
      }
    }
  }
  return [{x: n1x, y: n1y}, {x: n2x, y: n2y}];
}

function smin(a, b, k) {
	let h = constrain(0.5 + 0.5*(b - a)/k, 0, 1);
	return lerp(b, a, h) - k*h*(1 - h);
}

function saw(x) {
  return x - floor(x);
}