'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import s from './LivingOwl.module.css'

// An owl brought to life by bending its one picture rather than moving cut-out pieces, so its neck and
// wing flex without seams. Its rig says how much each part moves (built by scripts/owl/rig.js): the
// head tilts and the neck follows it down into the still chest; the face slides as the owl looks aside;
// the wing lifts from the shoulder; and the lids, drawn from the feathers around each eye, close in
// blinks. Without WebGL, or for visitors who prefer less motion, the owl stays a still picture.
// The className places and sizes it; its height follows the picture's proportions.

// Positions are in the picture's own pixels
export type OwlRig = {
  src: string
  rig: string
  size: [number, number]
  headPivot: [number, number]
  wingPivot: [number, number]
  faceCentre: [number, number]
  feetY: number
  // centre x, centre y, half width, half height of each eye
  eyes: [number, number, number, number][]
  // how far the face slides as the owl looks aside
  look: number
  // which way the wing lifts (1 for a wing on the owl's right, as seen, -1 for one on its left), and how far
  wingTurn: number
  wingAmp: number
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x + 1.0, 1.0 - aPos.y) * 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uOwl;
uniform sampler2D uRig;
uniform vec2 uSize;
uniform float uTilt;
uniform vec2 uHeadPivot;
uniform float uLook;
uniform float uNarrow;
uniform vec2 uFace;
uniform float uWing;
uniform vec2 uWingPivot;
uniform float uBreath;
uniform float uFeet;
uniform vec4 uEye0;
uniform vec4 uEye1;
uniform float uLid;
varying vec2 vUv;

vec2 turn(vec2 v, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

// A lid over the eye. The upper lid comes down and the lower lid rises to meet it at a crease a little
// below the middle. The lids take the feathers' colour from a ring around the eye, with the fine
// texture of the cheek below it, and are shaded a warm brown into the crease and darker at the socket.
vec4 lid(vec4 col, vec2 q, vec4 e) {
  if (uLid <= 0.0) return col;
  vec2 d = (q - e.xy) / e.zw;
  float r = length(d);
  if (r >= 1.4) return col;
  float crease = 0.28 + 0.12 * (1.0 - d.x * d.x);
  float upper = mix(-1.45, crease, uLid) + 0.18 * (1.0 - d.x * d.x) * uLid;
  float lower = mix(1.45, crease, uLid);
  float cover = min(smoothstep(-0.03, 0.03, upper - d.y) + smoothstep(-0.03, 0.03, d.y - lower), 1.0);
  if (cover <= 0.0) return col;
  vec3 ring = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785398;
    ring += texture2D(uOwl, (e.xy + vec2(cos(a), sin(a)) * e.zw * 1.35) / uSize).rgb;
  }
  ring /= 8.0;
  // Feather texture from the plain cheek below the eye, clear of the crown's dark spots
  vec3 below = texture2D(uOwl, (q + vec2(0.0, e.w * 2.0)) / uSize).rgb;
  vec3 skin = mix(ring, below, 0.55);
  float toCrease = abs(d.y - crease);
  skin *= mix(vec3(0.74, 0.63, 0.55), vec3(1.0), smoothstep(0.0, 0.13, toCrease));
  skin *= mix(0.88, 1.0, smoothstep(1.2, 0.5, r));
  float a = texture2D(uOwl, q / uSize).a;
  // Full cover past the eye's dark rim, then a soft fade into the face
  return mix(col, vec4(skin * a, a), cover * (1.0 - smoothstep(1.12, 1.4, r)));
}

void main() {
  vec2 p = vUv * uSize;
  vec3 w = texture2D(uRig, vUv).rgb;
  vec2 q = p;
  q.y = uFeet + (q.y - uFeet) / (1.0 + uBreath);
  q = uWingPivot + turn(q - uWingPivot, uWing * w.r);
  q = uHeadPivot + turn(q - uHeadPivot, -uTilt * w.g);
  q.x -= uLook * (w.b + 0.3 * w.g * (1.0 - w.b));
  q.x = uFace.x + (q.x - uFace.x) * (1.0 + uNarrow * w.b);
  vec4 col = texture2D(uOwl, q / uSize);
  col = lid(col, q, uEye0);
  col = lid(col, q, uEye1);
  gl_FragColor = col;
}`

type Keys = [number, number][]
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const track = (keys: Keys, period: number, t: number) => {
  const x = t % period
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i]
    const [t0, v0] = keys[i - 1]
    if (x <= t1) return v0 + (v1 - v0) * ease((x - t0) / (t1 - t0 || 1))
  }
  return keys[keys.length - 1][1]
}

// Seconds and degrees (clockwise); the look from right (1) to left (-1), the lid from open (0) to shut (1)
const TILT: Keys = [[0, 0], [1.9, 0], [3, -7], [4.8, -7], [5.8, 0], [6.9, 2.5], [9, 2.5], [9.9, 0], [11.2, -2], [12.8, -2], [13.8, 0], [16, 0]]
const LOOK: Keys = [[0, 0], [5.8, 0], [6.9, 1], [9, 1], [9.9, 0], [11.2, -1], [12.8, -1], [13.8, 0], [16, 0]]
const WING: Keys = [[0, 0], [6.3, 0], [6.55, 1.8], [6.8, 0.5], [7.1, 1.4], [7.35, 0.3], [7.65, 0.9], [8.1, 0], [9, 0]]
const BLINK: Keys = [
  [0, 0], [2.6, 0], [2.72, 1], [2.77, 1], [2.9, 0],
  [5.5, 0], [5.6, 1], [5.64, 1], [5.76, 0], [5.82, 0], [5.92, 1], [5.96, 1], [6.08, 0], [6.4, 0],
]
const rad = Math.PI / 180

const load = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

type Props = { owl: OwlRig; className?: string; style?: CSSProperties }

export default function LivingOwl({ owl, className, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false })
    if (!gl) return

    let raf = 0
    let visible = false
    let stopped = false
    const cleanups: (() => void)[] = []

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const u = (name: string) => gl.getUniformLocation(prog, name)
    const { size, headPivot, wingPivot, faceCentre, feetY, eyes } = owl
    gl.uniform2f(u('uSize'), size[0], size[1])
    gl.uniform2f(u('uHeadPivot'), headPivot[0], headPivot[1])
    gl.uniform2f(u('uWingPivot'), wingPivot[0], wingPivot[1])
    gl.uniform2f(u('uFace'), faceCentre[0], faceCentre[1])
    gl.uniform1f(u('uFeet'), feetY)
    gl.uniform4f(u('uEye0'), ...(eyes[0] as [number, number, number, number]))
    gl.uniform4f(u('uEye1'), ...(eyes[1] as [number, number, number, number]))
    const uTilt = u('uTilt'), uLook = u('uLook'), uNarrow = u('uNarrow'), uWing = u('uWing'), uBreath = u('uBreath'), uLid = u('uLid')

    const texture = (img: HTMLImageElement, unit: number, premultiply: boolean) => {
      const tex = gl.createTexture()
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiply)
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, premultiply ? gl.BROWSER_DEFAULT_WEBGL : gl.NONE)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const start = performance.now()
    const draw = (now: number) => {
      const t = (now - start) / 1000
      gl.uniform1f(uTilt, track(TILT, 16, t) * rad)
      const look = track(LOOK, 16, t)
      gl.uniform1f(uLook, look * owl.look)
      // The face narrows a little as it turns aside
      gl.uniform1f(uNarrow, 0.075 * Math.abs(look))
      gl.uniform1f(uWing, track(WING, 9, t + 3) * rad * owl.wingAmp * owl.wingTurn)
      gl.uniform1f(uLid, track(BLINK, 6.4, t))
      gl.uniform1f(uBreath, 0.004 * (0.5 - 0.5 * Math.cos((t / 4.2) * Math.PI * 2)))
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    const loop = () => {
      draw(performance.now())
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0
    }
    const wake = () => {
      if (!raf && visible && !document.hidden && !stopped) raf = requestAnimationFrame(loop)
    }

    Promise.all([load(owl.src), load(owl.rig)])
      .then(([owlImg, rigImg]) => {
        if (stopped) return
        gl.uniform1i(u('uOwl'), 0)
        gl.uniform1i(u('uRig'), 1)
        texture(owlImg, 0, true)
        texture(rigImg, 1, false)
        resize()
        draw(performance.now())
        setLive(true)

        const ro = new ResizeObserver(() => {
          resize()
          draw(performance.now())
        })
        ro.observe(canvas)
        // Only animate while the owl is on screen and the tab is open
        const io = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting
          wake()
        })
        io.observe(canvas)
        document.addEventListener('visibilitychange', wake)
        cleanups.push(() => ro.disconnect(), () => io.disconnect(), () => document.removeEventListener('visibilitychange', wake))
      })
      .catch(() => {})

    return () => {
      stopped = true
      if (raf) cancelAnimationFrame(raf)
      cleanups.forEach((c) => c())
    }
  }, [owl])

  return (
    <div className={className} style={{ aspectRatio: `${owl.size[0]} / ${owl.size[1]}`, ...style }} aria-hidden="true">
      <img className={s.layer} src={owl.src} alt="" style={live ? { visibility: 'hidden' } : undefined} />
      <canvas ref={canvasRef} className={s.layer} />
    </div>
  )
}
