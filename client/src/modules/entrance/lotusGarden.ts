import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  FrontSide,
  Euler,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  LinearSRGBColorSpace,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NoColorSpace,
  PointsMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three"
import { ringWindow, type PetalDirection } from "./petalDirection"
import { easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, lerp, span, type LotusQuality } from "./lotusMotion"

type Palette = { base: string; mid: string; tip: string; vein: string }

type RingSpec = {
  id: string
  count: number
  length: number
  width: number
  cup: number
  twist: number
  closed: number
  open: number
  y: number
  z: number
  yaw: number
  start: number
  end: number
  ease: (t: number) => number
  palette: Palette
}

const PINK_INNER: Palette = { base: "#fffdfb", mid: "#fde8ee", tip: "#f4c6d4", vein: "#fff6f2" }
const PINK_MID: Palette = { base: "#fff8f5", mid: "#f8d5e0", tip: "#eea9be", vein: "#fff4ef" }
const PINK_OUTER: Palette = { base: "#fff5f3", mid: "#f6cad8", tip: "#e79aaf", vein: "#fff1ec" }
const GREEN: Palette = { base: "#e4f0e2", mid: "#b7d4b4", tip: "#6f9b80", vein: "#f3faf2" }

const WATER_VERT = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
void main() {
  vec3 displaced = position;
  displaced.z += sin(position.x * 0.38 + uTime * 0.55) * 0.018
    + sin(position.y * 0.3 - uTime * 0.4) * 0.014;
  vec4 world = modelMatrix * vec4(displaced, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

const WATER_FRAG_LIGHT = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
void main() {
  vec2 p = vWorld.xz;
  float dist = length(p);
  vec3 col = mix(vec3(0.90, 0.95, 0.97), vec3(0.74, 0.86, 0.91), smoothstep(0.2, 4.0, dist));
  col = mix(col, vec3(0.957, 0.925, 0.882), smoothstep(6.0, 15.0, dist));
  float glow = exp(-dot(p, p) * 0.85);
  col = mix(col, vec3(0.99, 0.88, 0.80), glow * 0.5);
  float ripple = sin(dist * 5.5 - uTime * 1.3);
  float sheen = pow(max(sin(p.x * 1.6 + uTime * 0.8) * sin(p.y * 1.2 - uTime * 0.6), 0.0), 6.0);
  col += vec3(1.0, 0.98, 0.94) * sheen * 0.28;
  float alpha = mix(0.62, 0.94, smoothstep(0.2, 3.4, dist));
  gl_FragColor = vec4(col, alpha);
}
`

const WATER_FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
void main() {
  vec2 p = vWorld.xz;
  float dist = length(p);
  vec3 shallow = vec3(0.90, 0.95, 0.97);
  vec3 deep = vec3(0.73, 0.85, 0.91);
  vec3 haze = vec3(0.957, 0.925, 0.882);
  vec3 col = mix(shallow, deep, smoothstep(0.15, 4.2, dist));
  col = mix(col, haze, smoothstep(6.5, 16.0, dist));

  float glow = exp(-dot(p, p) * 0.85);
  vec3 blush = vec3(0.97, 0.82, 0.86);
  vec3 gold = vec3(0.99, 0.91, 0.74);
  float petals = 0.0;
  for (int i = 0; i < 6; i++) {
    float ang = atan(p.y, p.x) + float(i) * 1.0472 + uTime * 0.04;
    float c = cos(ang);
    float s = sin(ang);
    vec2 q = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
    float reach = 0.62 + 0.06 * sin(uTime * 0.7 + float(i));
    float e = length(q / vec2(0.16, reach));
    petals += exp(-e * e * 3.4);
  }
  col = mix(col, mix(blush, gold, glow), clamp(glow * 0.5 + petals * 0.18, 0.0, 0.62));

  float rings = 0.0;
  for (int i = 0; i < 3; i++) {
    float ph = fract(uTime * 0.16 + float(i) * 0.333);
    float rad = 0.4 + ph * 2.6;
    float band = smoothstep(0.14, 0.0, abs(dist - rad));
    rings += band * (1.0 - ph) * (1.0 - ph);
  }
  col += vec3(1.0, 0.985, 0.96) * rings * 0.14;
  float sheen = pow(max(sin(p.x * 1.7 + uTime * 0.7) * sin(p.y * 1.25 - uTime * 0.55), 0.0), 6.0);
  col += vec3(1.0, 0.98, 0.94) * sheen * 0.38;
  float alpha = mix(0.5, 0.92, smoothstep(0.15, 3.2, dist));
  gl_FragColor = vec4(col, alpha);
}
`

const FLY_VERT = /* glsl */ `
attribute float aPhase;
attribute float aSize;
uniform float uTime;
varying float vTw;
void main() {
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  float tw = 0.28 + 0.72 * pow(max(sin(uTime * 2.05 + aPhase), 0.0), 2.0);
  vTw = tw;
  gl_PointSize = aSize * (300.0 / max(0.2, -view.z));
  gl_Position = projectionMatrix * view;
}
`

const FLY_FRAG = /* glsl */ `
uniform sampler2D uMap;
varying float vTw;
void main() {
  float alpha = texture2D(uMap, gl_PointCoord).a * vTw;
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(vec3(1.0, 0.93, 0.75) * alpha, alpha);
}
`

const PADS = [
  { x: -1.9, z: 0.7, s: 0.78, rot: 0.4 },
  { x: 1.7, z: -0.95, s: 0.6, rot: 2.15 },
  { x: 2.45, z: 1.3, s: 0.46, rot: 4.05 },
  { x: -1.35, z: -1.8, s: 0.54, rot: 1.15 },
  { x: -2.9, z: -0.5, s: 0.4, rot: 2.7 },
  { x: 1.05, z: 1.9, s: 0.36, rot: 0.65 },
]

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function createPetalGeometry(spec: RingSpec, segsU: number, segsV: number): BufferGeometry {
  const geometry = new PlaneGeometry(1, 1, segsU, segsV)
  const position = geometry.attributes.position
  const colors = new Float32Array(position.count * 3)
  const base = new Color(spec.palette.base)
  const mid = new Color(spec.palette.mid)
  const tip = new Color(spec.palette.tip)
  const vein = new Color(spec.palette.vein)
  const color = new Color()

  for (let index = 0; index < position.count; index += 1) {
    const u = position.getX(index)
    const v = position.getY(index) + 0.5
    const belly = Math.sin(Math.PI * Math.pow(Math.min(1, v), 0.76))
    const neck = smoothstep(0, 0.09, v)
    const envelope = belly * (0.38 + 0.62 * neck)
    const x = u * spec.width * envelope
    const y = v * spec.length
    const cup = -(1 - Math.cos(u * Math.PI)) * spec.cup * envelope
    const arch = Math.sin(v * Math.PI) * 0.05 * spec.length
    const tipCurl = -Math.pow(v, 2.15) * 0.15 * spec.length
    const localZ = cup + arch + tipCurl
    const twist = spec.twist * (v - 0.18)
    const ct = Math.cos(twist)
    const st = Math.sin(twist)
    position.setXYZ(index, x * ct - localZ * st, y, x * st + localZ * ct)

    const along = v < 0.46 ? v / 0.46 : (v - 0.46) / 0.54
    color.copy(v < 0.46 ? base : mid).lerp(v < 0.46 ? mid : tip, along)
    color.lerp(vein, Math.exp(-u * u * 34) * (1 - v * 0.7) * 0.4)
    colors[index * 3] = color.r
    colors[index * 3 + 1] = color.g
    colors[index * 3 + 2] = color.b
  }

  geometry.setAttribute("color", new BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

function createPadGeometry(): BufferGeometry {
  const geometry = new CircleGeometry(1, 36, 0.22, Math.PI * 2 - 0.48)
  const position = geometry.attributes.position
  const colors = new Float32Array(position.count * 3)
  const center = new Color("#e7f3e4")
  const edge = new Color("#7eaa88")
  const color = new Color()
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const radius = Math.min(1, Math.hypot(x, y))
    position.setZ(index, (1 - radius) * 0.045)
    color.copy(center).lerp(edge, radius)
    colors[index * 3] = color.r
    colors[index * 3 + 1] = color.g
    colors[index * 3 + 2] = color.b
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

function glowTexture(): CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext("2d")
  if (!context) throw new Error("No hay canvas 2D para las luciérnagas")
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, "rgba(255,250,236,1)")
  gradient.addColorStop(0.38, "rgba(255,224,164,0.55)")
  gradient.addColorStop(1, "rgba(255,224,164,0)")
  context.fillStyle = gradient
  context.fillRect(0, 0, 64, 64)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = NoColorSpace
  return texture
}

function makeRings(light: boolean): RingSpec[] {
  return [
    {
      id: "inner",
      count: light ? 6 : 8,
      length: 0.8,
      width: 0.56,
      cup: 0.3,
      twist: 0.14,
      closed: 0.04,
      open: 0.64,
      y: 0.1,
      z: 0.03,
      yaw: 0.04,
      start: 0.46,
      end: 1.58,
      ease: easeInOutCubic,
      palette: PINK_INNER,
    },
    {
      id: "mid",
      count: light ? 8 : 12,
      length: 1.04,
      width: 0.66,
      cup: 0.33,
      twist: -0.16,
      closed: 0.07,
      open: 1.04,
      y: 0.07,
      z: 0.055,
      yaw: 0.22,
      start: 0.82,
      end: 2.12,
      ease: easeInOutCubic,
      palette: PINK_MID,
    },
    {
      id: "outer",
      count: light ? 12 : 16,
      length: 1.26,
      width: light ? 0.9 : 0.76,
      cup: 0.36,
      twist: 0.2,
      closed: 0.11,
      open: 1.38,
      y: 0.045,
      z: 0.08,
      yaw: 0.0,
      start: 1.16,
      end: 2.68,
      ease: easeInOutCubic,
      palette: PINK_OUTER,
    },
  ]
}

function sepalSpec(light: boolean): RingSpec {
  return {
    id: "sepal",
    count: light ? 7 : 10,
    length: 1.12,
    width: 0.86,
    cup: 0.22,
    twist: 0.08,
    closed: 0.32,
    open: 1.52,
    y: 0.02,
    z: 0.1,
    yaw: Math.PI / (light ? 12 : 16),
    start: 1.38,
    end: 3.02,
    ease: easeOutCubic,
    palette: GREEN,
  }
}

const dummy = new Object3D()
const petalEuler = new Euler(0, 0, 0, "YXZ")

function poseRing(mesh: InstancedMesh, spec: RingSpec, time: number, mirror?: InstancedMesh, timing?: { start: number; end: number }): number {
  let lead = 0
  const start = timing?.start ?? spec.start
  const end = timing?.end ?? spec.end
  for (let index = 0; index < spec.count; index += 1) {
    const jitter = ((index * 17) % spec.count) / spec.count * 0.14
    const opened = span(time, start + jitter, end + jitter * 0.35, spec.ease)
    lead = Math.max(lead, opened)
    const wobble = Math.sin(time * 1.65 + index * 0.85) * 0.015 * (0.3 + opened)
    const roll = Math.sin(time * 1.15 + index * 1.4) * 0.012 * opened
    const tilt = spec.closed + (spec.open - spec.closed) * opened + wobble
    const yaw = (index / spec.count) * Math.PI * 2 + spec.yaw
    petalEuler.set(tilt, yaw, roll)
    dummy.position.set(Math.sin(yaw) * spec.z, spec.y, Math.cos(yaw) * spec.z)
    dummy.rotation.copy(petalEuler)
    dummy.scale.set(1, 1, 1)
    dummy.updateMatrix()
    mesh.setMatrixAt(index, dummy.matrix)
    if (mirror) {
      dummy.position.y = -spec.y
      petalEuler.set(-tilt, yaw, -roll)
      dummy.rotation.copy(petalEuler)
      dummy.updateMatrix()
      mirror.setMatrixAt(index, dummy.matrix)
    }
  }
  mesh.instanceMatrix.needsUpdate = true
  if (mirror) mirror.instanceMatrix.needsUpdate = true
  return lead
}

export type LotusGarden = {
  root: Group
  flower: Group
  stamen: Group
  rings: { mesh: InstancedMesh; spec: RingSpec }[]
  sepals: { mesh: InstancedMesh; spec: RingSpec }
  petalMat: MeshPhysicalMaterial | MeshStandardMaterial
  sepalMat: MeshStandardMaterial
  goldMat: MeshStandardMaterial
  mirrors: InstancedMesh[]
  sepalMirror: InstancedMesh
  waterUniforms: { uTime: { value: number } }
  pads: Mesh[]
  pollen: Points
  pollenMat: PointsMaterial
  pollenBase: Float32Array
  flyMat: ShaderMaterial
  firePos: BufferAttribute
  fireSeeds: Float32Array
  dispose: () => void
}

export function createLotusGarden(quality: LotusQuality): LotusGarden {
  const light = quality === "light"
  const segsU = light ? 6 : 12
  const segsV = light ? 10 : 22
  const geometries: BufferGeometry[] = []
  const materials: (MeshStandardMaterial | MeshPhysicalMaterial | ShaderMaterial | PointsMaterial)[] = []
  const textures: CanvasTexture[] = []

  const petalMat = light
    ? new MeshStandardMaterial({
        color: "#ffffff",
        vertexColors: true,
        side: FrontSide,
        roughness: 0.4,
        metalness: 0,
        emissive: new Color("#f3b7c8"),
        emissiveIntensity: 0.06,
      })
    : new MeshPhysicalMaterial({
        color: "#ffffff",
        vertexColors: true,
        side: DoubleSide,
        roughness: 0.42,
        metalness: 0,
        sheen: 1,
        sheenRoughness: 0.48,
        sheenColor: new Color("#ffe1eb"),
        emissive: new Color("#f3b7c8"),
        emissiveIntensity: 0.05,
      })
  const sepalMat = new MeshStandardMaterial({
    color: "#ffffff",
    vertexColors: true,
    side: DoubleSide,
    roughness: 0.62,
    metalness: 0,
  })
  const goldMat = new MeshStandardMaterial({
    color: "#e7c56a",
    emissive: new Color("#f8dc8e"),
    emissiveIntensity: 0.42,
    roughness: 0.36,
    metalness: 0.04,
  })
  materials.push(petalMat, sepalMat, goldMat)

  const root = new Group()
  const flower = new Group()
  flower.position.y = 0.03
  root.add(flower)

  const rings = makeRings(light).map((spec) => {
    const geometry = createPetalGeometry(spec, segsU, segsV)
    geometries.push(geometry)
    const mesh = new InstancedMesh(geometry, petalMat, spec.count)
    mesh.frustumCulled = false
    flower.add(mesh)
    return { mesh, spec }
  })

  const sepalsSpec = sepalSpec(light)
  const sepalGeometry = createPetalGeometry(sepalsSpec, segsU, segsV)
  geometries.push(sepalGeometry)
  const sepalMesh = new InstancedMesh(sepalGeometry, sepalMat, sepalsSpec.count)
  sepalMesh.frustumCulled = false
  flower.add(sepalMesh)

  const mirrorMat = petalMat.clone()
  mirrorMat.transparent = true
  mirrorMat.opacity = 0.4
  mirrorMat.depthWrite = false
  materials.push(mirrorMat)
  const mirrors = rings.map((ring) => {
    const mesh = new InstancedMesh(ring.mesh.geometry, mirrorMat, ring.spec.count)
    mesh.frustumCulled = false
    flower.add(mesh)
    return mesh
  })
  const sepalMirror = new InstancedMesh(sepalGeometry, mirrorMat, sepalsSpec.count)
  sepalMirror.frustumCulled = false
  flower.add(sepalMirror)

  const pod = new Mesh(new SphereGeometry(0.2, light ? 16 : 28, light ? 12 : 18), goldMat)
  geometries.push(pod.geometry as BufferGeometry)
  pod.scale.y = 0.62
  pod.position.y = 0.34
  flower.add(pod)
  const lip = new Mesh(new TorusGeometry(0.15, 0.026, 8, light ? 16 : 28), goldMat)
  geometries.push(lip.geometry as BufferGeometry)
  lip.rotation.x = Math.PI / 2
  lip.position.y = 0.4
  flower.add(lip)

  const stamenCount = light ? 12 : 40
  const antherGeo = new SphereGeometry(0.028, light ? 6 : 8, light ? 5 : 6)
  const filamentGeo = new CylinderGeometry(0.007, 0.011, 1, 5)
  geometries.push(antherGeo, filamentGeo)
  const anthers = new InstancedMesh(antherGeo, goldMat, stamenCount)
  const filaments = new InstancedMesh(filamentGeo, goldMat, stamenCount)
  anthers.frustumCulled = false
  filaments.frustumCulled = false
  const stamen = new Group()
  stamen.add(anthers, filaments)
  flower.add(stamen)

  const golden = Math.PI * (3 - Math.sqrt(5))
  const up = new Vector3(0, 1, 0)
  const direction = new Vector3()
  const base = new Vector3()
  const tip = new Vector3()
  for (let index = 0; index < stamenCount; index += 1) {
    const radius = Math.sqrt((index + 0.5) / stamenCount) * 0.24
    const angle = index * golden
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = 0.46 + Math.sqrt(Math.max(0, 0.08 - radius * radius)) * 0.85
    dummy.position.set(x, y, z)
    dummy.rotation.set(0, 0, 0)
    dummy.quaternion.identity()
    dummy.scale.setScalar(0.85 + (index % 3) * 0.12)
    dummy.updateMatrix()
    anthers.setMatrixAt(index, dummy.matrix)

    base.set(x * 0.25, 0.32, z * 0.25)
    tip.set(x, y - 0.02, z)
    direction.copy(tip).sub(base)
    const length = Math.max(0.04, direction.length())
    dummy.position.copy(base).lerp(tip, 0.5)
    dummy.quaternion.setFromUnitVectors(up, direction.normalize())
    dummy.scale.set(1, length, 1)
    dummy.updateMatrix()
    filaments.setMatrixAt(index, dummy.matrix)
  }

  const waterUniforms = { uTime: { value: 0 } }
  const waterMat = new ShaderMaterial({
    uniforms: waterUniforms,
    vertexShader: WATER_VERT,
    fragmentShader: light ? WATER_FRAG_LIGHT : WATER_FRAG,
    transparent: true,
    depthWrite: false,
  })
  materials.push(waterMat)
  const water = new Mesh(new CircleGeometry(36, light ? 28 : 72), waterMat)
  geometries.push(water.geometry as BufferGeometry)
  water.rotation.x = -Math.PI / 2
  root.add(water)

  const shadowTex = glowTexture()
  shadowTex.colorSpace = LinearSRGBColorSpace
  textures.push(shadowTex)
  const shadow = new Mesh(
    new CircleGeometry(1.15, 32),
    new MeshStandardMaterial({
      color: "#8ea4b0",
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      roughness: 1,
    }),
  )
  geometries.push(shadow.geometry as BufferGeometry)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.02
  shadow.scale.setScalar(1.35)
  root.add(shadow)
  materials.push(shadow.material as MeshStandardMaterial)

  const padGeo = createPadGeometry()
  geometries.push(padGeo)
  const padMat = new MeshStandardMaterial({
    color: "#ffffff",
    vertexColors: true,
    side: DoubleSide,
    roughness: 0.72,
  })
  materials.push(padMat)
  const padCount = light ? 4 : PADS.length
  const pads = PADS.slice(0, padCount).map((pad) => {
    const mesh = new Mesh(padGeo, padMat)
    mesh.position.set(pad.x, 0.05, pad.z)
    mesh.rotation.set(-Math.PI / 2, 0, pad.rot)
    mesh.scale.setScalar(pad.s)
    root.add(mesh)
    return mesh
  })

  const sprite = glowTexture()
  textures.push(sprite)
  const pollenCount = light ? 18 : 72
  const pollenPositions = new Float32Array(pollenCount * 3)
  const pollenBase = new Float32Array(pollenCount * 3)
  for (let index = 0; index < pollenCount; index += 1) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 0.18
    pollenBase[index * 3] = Math.cos(angle) * radius
    pollenBase[index * 3 + 1] = Math.random()
    pollenBase[index * 3 + 2] = Math.sin(angle) * radius
  }
  const pollenGeo = new BufferGeometry()
  pollenGeo.setAttribute("position", new Float32BufferAttribute(pollenPositions, 3))
  geometries.push(pollenGeo)
  const pollenMat = new PointsMaterial({
    color: "#f8e0a0",
    map: sprite,
    size: 0.055,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  })
  materials.push(pollenMat)
  const pollen = new Points(pollenGeo, pollenMat)
  pollen.frustumCulled = false
  root.add(pollen)

  const flyCount = light ? 22 : 130
  const flyPositions = new Float32Array(flyCount * 3)
  const phases = new Float32Array(flyCount)
  const sizes = new Float32Array(flyCount)
  const fireSeeds = new Float32Array(flyCount * 4)
  for (let index = 0; index < flyCount; index += 1) {
    const angle = Math.random() * Math.PI * 2
    const radius = 0.55 + Math.random() ** 0.65 * 4.4
    const height = 0.12 + Math.random() ** 1.3 * 2.5
    const speed = 0.04 + Math.random() * 0.1
    fireSeeds.set([angle, radius, height, speed], index * 4)
    phases[index] = Math.random() * Math.PI * 2
    sizes[index] = 10 + Math.random() * 18
    flyPositions[index * 3] = Math.cos(angle) * radius
    flyPositions[index * 3 + 1] = height
    flyPositions[index * 3 + 2] = Math.sin(angle) * radius
  }
  const flyGeo = new BufferGeometry()
  flyGeo.setAttribute("position", new Float32BufferAttribute(flyPositions, 3))
  flyGeo.setAttribute("aPhase", new Float32BufferAttribute(phases, 1))
  flyGeo.setAttribute("aSize", new Float32BufferAttribute(sizes, 1))
  geometries.push(flyGeo)
  const fireMat = new ShaderMaterial({
    uniforms: { uMap: { value: sprite }, uTime: { value: 0 } },
    vertexShader: FLY_VERT,
    fragmentShader: FLY_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  materials.push(fireMat)
  const fireflies = new Points(flyGeo, fireMat)
  fireflies.frustumCulled = false
  root.add(fireflies)
  const firePos = flyGeo.getAttribute("position") as BufferAttribute

  return {
    root,
    flower,
    stamen,
    rings,
    sepals: { mesh: sepalMesh, spec: sepalsSpec },
    petalMat,
    sepalMat,
    goldMat,
    mirrors,
    sepalMirror,
    waterUniforms,
    pads,
    pollen,
    pollenMat,
    pollenBase,
    flyMat: fireMat,
    firePos,
    fireSeeds,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
    },
  }
}

export function poseLotus(garden: LotusGarden, time: number, camera: PerspectiveCamera, core: PointLight | null, direction: PetalDirection = "outward"): { flash: number; mark: number; glow: number; inner: number } {
  const appear = span(time, 0.05, 0.7, easeOutBack)
  const sway = 1 + Math.sin(time * 1.75) * 0.007 * Math.min(1, appear)
  garden.flower.scale.setScalar(Math.max(0.04, appear) * sway)
  garden.flower.rotation.y = time * 0.16
  garden.flower.rotation.z = Math.sin(time * 0.8) * 0.012
  garden.flower.rotation.x = Math.sin(time * 0.62) * 0.008

  let inner = 0
  const bounds = [
    ...garden.rings.map((ring) => ({ start: ring.spec.start, end: ring.spec.end })),
    { start: garden.sepals.spec.start, end: garden.sepals.spec.end },
  ]
  garden.rings.forEach((ring, index) => {
    const opened = poseRing(ring.mesh, ring.spec, time, garden.mirrors[index], ringWindow(ring.spec.start, ring.spec.end, bounds, direction))
    if (index === 0) inner = opened
  })
  poseRing(garden.sepals.mesh, garden.sepals.spec, time, garden.sepalMirror, ringWindow(garden.sepals.spec.start, garden.sepals.spec.end, bounds, direction))
  garden.stamen.scale.setScalar(0.25 + 0.75 * inner)

  const glow = span(time, 2.88, 4.32, easeInCubic)
  garden.petalMat.emissiveIntensity = 0.05 + glow * 0.75
  garden.goldMat.emissiveIntensity = 0.42 + glow * 3.1
  if (core) {
    core.intensity = 0.4 + glow * glow * 42
    core.distance = 3 + glow * 9
  }

  garden.waterUniforms.uTime.value = time
  garden.pads.forEach((pad, index) => {
    pad.position.y = 0.05 + Math.sin(time * 0.75 + index * 1.3) * 0.008
  })

  const pollenPos = garden.pollen.geometry.getAttribute("position") as BufferAttribute
  const rise = span(time, 1.15, 4.2, easeOutCubic)
  for (let index = 0; index < garden.pollenBase.length / 3; index += 1) {
    const angle = garden.pollenBase[index * 3 + 1] * Math.PI * 2 + time * 0.25
    const spread = 0.08 + rise * (0.25 + garden.pollenBase[index * 3 + 1] * 0.45)
    pollenPos.setXYZ(
      index,
      Math.cos(angle) * spread,
      0.48 + rise * (0.35 + garden.pollenBase[index * 3 + 1] * 0.9) + Math.sin(time * 1.4 + index) * 0.03,
      Math.sin(angle) * spread,
    )
  }
  pollenPos.needsUpdate = true
  garden.pollenMat.opacity = rise

  garden.flyMat.uniforms.uTime.value = time
  for (let index = 0; index < garden.fireSeeds.length / 4; index += 1) {
    const angle = garden.fireSeeds[index * 4] + time * garden.fireSeeds[index * 4 + 3]
    const radius = garden.fireSeeds[index * 4 + 1]
    const height = garden.fireSeeds[index * 4 + 2]
    garden.firePos.setXYZ(
      index,
      Math.cos(angle) * radius,
      height + Math.sin(time * 0.9 + index) * 0.12,
      Math.sin(angle) * radius,
    )
  }
  garden.firePos.needsUpdate = true

  const approach = span(time, 0.12, 2.4, easeInOutCubic)
  const dive = span(time, 2.82, 4.28, easeInCubic)
  const radius = lerp(lerp(5.55, 3.2, approach), 0.58, dive)
  const height = lerp(lerp(2.72, 1.92, approach), 0.8, dive)
  const lookY = lerp(0.36, 0.34, dive)
  const orbit = 0.78 + time * 0.05
  const breathe = Math.sin(time * 1.12) * 0.02 * (1 - dive)
  camera.position.set(Math.sin(orbit) * radius, height + breathe, Math.cos(orbit) * radius)
  camera.lookAt(0, lookY + Math.sin(time * 0.85) * 0.008 * (1 - dive), 0)

  const markIn = span(time, 0.22, 0.85, easeOutCubic)
  const markOut = span(time, 2.05, 2.8, easeInCubic)
  return {
    flash: span(time, 4.0, 4.5, easeInCubic),
    mark: markIn * (1 - markOut),
    glow,
    inner,
  }
}
