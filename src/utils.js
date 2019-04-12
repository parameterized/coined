
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

function orDefault(x, d) {
  if (typeof(x) === 'undefined' || x === null) {
    return d;
  } else {
    return x;
  }
}

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
}