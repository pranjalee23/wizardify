// Builds an owl's rig for components/LivingOwl: an image the size of the owl picture (scaled by `scale`)
// whose channels say how much each part of the owl moves. Red is the wing, green the head and neck,
// blue the face; each fades smoothly to nothing, so the owl bends without seams. Runs in a browser
// page; returns a PNG data URL. All coordinates are in the owl picture's pixels.
//   origin, size  the part of the picture the rig covers
//   neck          [y0, y1]: the head moves fully above y0 and the chest stays still below y1
//   wing          the wing's outline, traced a little inside its edge
//   face          [cx, cy, rx, ry]: the face that slides across the head as the owl looks aside
//   holds         areas the head must not pull, e.g. a wing's edge beside the neck:
//                 { x: [x0, x1], y: [y0, y1] } fades the head's pull out past x0 and past y0
window.buildOwlRig = function ({ origin, size, scale = 0.25, neck, wing, face, holds = [] }) {
  const [ox, oy] = origin
  const GW = Math.round(size[0] * scale), GH = Math.round(size[1] * scale)
  const smooth = (a, b, t) => {
    const x = Math.min(1, Math.max(0, (t - a) / (b - a)))
    return x * x * (3 - 2 * x)
  }
  const canvas = (w, h) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    return c
  }
  const mask = (draw, blur) => {
    const c = canvas(GW, GH)
    const g = c.getContext('2d')
    g.filter = `blur(${blur * scale}px)`
    g.fillStyle = '#fff'
    g.strokeStyle = '#fff'
    g.scale(scale, scale)
    g.translate(-ox, -oy)
    draw(g)
    const d = g.getImageData(0, 0, GW, GH).data
    return Float32Array.from({ length: GW * GH }, (_, i) => d[i * 4 + 3] / 255)
  }
  const wingShape = (g) => {
    g.beginPath()
    wing.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
    g.closePath()
  }
  // The wing as traced, and grown outward so that as it lifts, it has room to draw past its old edge
  const wingTight = mask((g) => { wingShape(g); g.fill() }, 6)
  const wingWide = mask((g) => { wingShape(g); g.fill(); g.lineWidth = 36; g.stroke() }, 14)

  const rig = new ImageData(GW, GH)
  for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
    const i = gy * GW + gx
    const x = ox + (gx + 0.5) / scale, y = oy + (gy + 0.5) / scale
    let head = (1 - smooth(neck[0], neck[1], y)) * (1 - 0.95 * wingTight[i])
    for (const h of holds) head *= 1 - smooth(h.x[0], h.x[1], x) * smooth(h.y[0], h.y[1], y)
    const [fx, fy, frx, fry] = face
    const f = 1 - smooth(0.45, 1, Math.hypot((x - fx) / frx, (y - fy) / fry))
    rig.data[i * 4] = Math.round(255 * wingWide[i])
    rig.data[i * 4 + 1] = Math.round(255 * head)
    rig.data[i * 4 + 2] = Math.round(255 * f)
    rig.data[i * 4 + 3] = 255
  }
  // Soften the head weight once more where the wing's hold meets it
  const rc = canvas(GW, GH)
  rc.getContext('2d').putImageData(rig, 0, 0)
  const rs = canvas(GW, GH)
  const rsg = rs.getContext('2d')
  rsg.filter = `blur(${10 * scale}px)`
  rsg.drawImage(rc, 0, 0)
  const soft = rsg.getImageData(0, 0, GW, GH)
  for (let i = 0; i < GW * GH; i++) rig.data[i * 4 + 1] = soft.data[i * 4 + 1]
  rc.getContext('2d').putImageData(rig, 0, 0)
  return rc.toDataURL('image/png')
}
