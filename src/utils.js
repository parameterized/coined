
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