// Rimfrost 2 – stage 1: a low-poly 3D world you can walk around in, seen from an angled top-down camera.
import * as THREE from "three";

// ---------------------------------------------------------------- helpers
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// value noise
const PERM = (() => { const r = rng(7), p = [...Array(256).keys()]; for(let i = 255; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p.concat(p); })();
const hash2 = (x, y) => PERM[(PERM[x & 255] + y) & 255] / 255;
function vnoise(x, y){ const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf*xf*(3-2*xf), v = yf*yf*(3-2*yf);
  return lerp(lerp(hash2(xi, yi), hash2(xi+1, yi), u), lerp(hash2(xi, yi+1), hash2(xi+1, yi+1), u), v); }
const fbm = (x, y) => vnoise(x, y)*0.55 + vnoise(x*2.1, y*2.1)*0.28 + vnoise(x*4.3, y*4.3)*0.17;

// ---------------------------------------------------------------- the world layout
const SIZE = 220, HALF = SIZE / 2;                 // world units (1 unit ≈ 1 metre)
const VILLAGE = {x: 0, z: 0, r: 13, name: "Frostwick"};
const LAKE = {x: 38, z: 30, r: 17, name: "Mirror Lake"};
const PATH = [[0, 0], [14, 8], [26, 18]];          // a dirt road from the village towards the lake
function pathDist(x, z){ let best = 1e9; for(let i = 0; i < PATH.length - 1; i++){ const [ax, az] = PATH[i], [bx, bz] = PATH[i+1], dx = bx-ax, dz = bz-az;
  const t = clamp(((x-ax)*dx + (z-az)*dz) / (dx*dx + dz*dz), 0, 1); best = Math.min(best, Math.hypot(x - (ax + dx*t), z - (az + dz*t))); } return best; }
function height(x, z){
  let h = 2 + (fbm(x * 0.035 + 10, z * 0.035 + 10) - 0.5) * 5;             // rolling meadows, always above the water
  const edge = Math.max(Math.abs(x), Math.abs(z));                          // mountains all around the edge
  h += smooth(HALF - 34, HALF - 6, edge) * (18 + fbm(x * 0.08, z * 0.08) * 16);
  const ridge = smooth(0.62, 0.8, fbm(x * 0.02 + 40, z * 0.02 - 30));       // a few inland hills
  h += ridge * 9;
  const dl = Math.hypot(x - LAKE.x, z - LAKE.z);                           // the lake basin
  h = lerp(-3.2, h, smooth(LAKE.r * 0.55, LAKE.r + 6, dl));
  const dv = Math.hypot(x - VILLAGE.x, z - VILLAGE.z);                     // flat village square
  h = lerp(2, h, smooth(VILLAGE.r - 2, VILLAGE.r + 6, dv));
  const dp = pathDist(x, z); if(dp < 4 && h > 0.5) h = lerp(h * 0.8 + 0.3, h, smooth(1.5, 4, dp));
  return h;
}
const WATER = 0;
function ground(x, z){                               // what the ground is made of, for colour and walking
  const h = height(x, z), dp = pathDist(x, z), dv = Math.hypot(x - VILLAGE.x, z - VILLAGE.z);
  if(h < WATER + 1.1 && Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 8) return "sand";
  if(dv < VILLAGE.r - 1) return "cobble";
  if(dp < 1.8) return "dirt";
  if(h > 20) return "snow";
  if(h > 9) return "rock";
  return "grass";
}
const COLORS = {grass: [0x5e9a46, 0x6fae52], dirt: [0x9a7a4e, 0xa88a5a], cobble: [0x8d8a84, 0x9c9891], rock: [0x7a7d82, 0x8a8c90], snow: [0xe8f0f4, 0xf6fbfd], sand: [0xcdbb86, 0xd8c896]};

// ---------------------------------------------------------------- renderer, scene, lights
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa9d3ea);
scene.fog = new THREE.Fog(0xa9d3ea, 70, 150);
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.5, 400);
scene.add(new THREE.HemisphereLight(0xdff2ff, 0x4a5a3a, 1.1));
const sun = new THREE.DirectionalLight(0xfff1d6, 2.0);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 140}); sun.shadow.bias = -0.0005;
scene.add(sun, sun.target);
addEventListener("resize", () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

// ---------------------------------------------------------------- terrain (flat-shaded low-poly)
const SEG = 150;
function buildTerrain(){
  const pos = [], col = [], c = new THREE.Color(), step = SIZE / SEG, r = rng(3);
  const vert = (i, j) => { const x = -HALF + i * step, z = -HALF + j * step; return [x, height(x, z), z]; };
  for(let j = 0; j < SEG; j++) for(let i = 0; i < SEG; i++){
    const a = vert(i, j), b = vert(i+1, j), d = vert(i, j+1), e = vert(i+1, j+1);
    for(const tri of [[a, d, b], [b, d, e]]){
      const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cz = (tri[0][2] + tri[1][2] + tri[2][2]) / 3;
      const pal = COLORS[ground(cx, cz)]; c.setHex(pal[r() < 0.5 ? 0 : 1]); c.offsetHSL(0, 0, (r() - 0.5) * 0.04);
      for(const v of tri){ pos.push(...v); col.push(c.r, c.g, c.b); } } }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({vertexColors: true, flatShading: true}));
  m.receiveShadow = true; return m;
}
const terrain = buildTerrain(); scene.add(terrain);
// the lake: a single water surface in the basin (water only where it belongs)
const water = new THREE.Mesh(new THREE.CircleGeometry(LAKE.r + 4, 48), new THREE.MeshLambertMaterial({color: 0x3f8fbf, transparent: true, opacity: 0.82}));
water.rotation.x = -Math.PI / 2; water.position.set(LAKE.x, WATER, LAKE.z); scene.add(water);

// ---------------------------------------------------------------- props: trees, rocks, houses, fountain
const colliders = [];                              // circles you cannot walk through: {x, z, r}
const flat = (color) => new THREE.MeshLambertMaterial({color, flatShading: true});
function scatter(n, ok, seed){ const r = rng(seed), out = []; let tries = 0;
  while(out.length < n && tries++ < n * 40){ const x = (r() - 0.5) * (SIZE - 12), z = (r() - 0.5) * (SIZE - 12); if(ok(x, z, r)) out.push([x, z, r()]); } return out; }
const clearOfVillage = (x, z, pad) => Math.hypot(x - VILLAGE.x, z - VILLAGE.z) > VILLAGE.r + pad && pathDist(x, z) > 3 && Math.hypot(x - LAKE.x, z - LAKE.z) > LAKE.r + 2;
function instanced(geo, mat, list, place){ const im = new THREE.InstancedMesh(geo, mat, list.length), o = new THREE.Object3D();
  list.forEach((p, i) => { place(o, p); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.castShadow = true; im.receiveShadow = true; scene.add(im); return im; }
// trees: pines on hills, round trees in the meadows
const trees = scatter(420, (x, z) => clearOfVillage(x, z, 3) && height(x, z) > 0.4 && height(x, z) < 16 && fbm(x * 0.05 + 3, z * 0.05) > 0.47, 11);
const pines = trees.filter(t => fbm(t[0] * 0.03, t[1] * 0.03) > 0.5), oaks = trees.filter(t => !pines.includes(t));
const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.6, 6); trunkGeo.translate(0, 0.8, 0);
instanced(trunkGeo, flat(0x6b4a2e), trees, (o, [x, z, s]) => { o.position.set(x, height(x, z), z); o.scale.setScalar(0.8 + s * 0.6); o.rotation.set(0, s * 6, 0); });
const pineGeo = new THREE.ConeGeometry(1.3, 3.6, 7); pineGeo.translate(0, 3.1, 0);
instanced(pineGeo, flat(0x2f6b3a), pines, (o, [x, z, s]) => { o.position.set(x, height(x, z), z); o.scale.setScalar(0.8 + s * 0.6); o.rotation.set(0, s * 6, 0); });
const oakGeo = new THREE.IcosahedronGeometry(1.6, 0); oakGeo.translate(0, 2.6, 0);
instanced(oakGeo, flat(0x4f8f3a), oaks, (o, [x, z, s]) => { o.position.set(x, height(x, z), z); o.scale.set(1 + s * 0.4, 0.9 + s * 0.5, 1 + s * 0.4); o.rotation.set(0, s * 6, 0); });
for(const [x, z, s] of trees) colliders.push({x, z, r: 0.45 * (0.8 + s * 0.6)});
// rocks
const rocks = scatter(160, (x, z) => clearOfVillage(x, z, 2) && height(x, z) > 0.4, 21);
const rockGeo = new THREE.DodecahedronGeometry(0.9, 0);
instanced(rockGeo, flat(0x8a8d91), rocks, (o, [x, z, s]) => { o.position.set(x, height(x, z) + 0.2, z); o.scale.set(0.6 + s, 0.45 + s * 0.6, 0.6 + s * 0.8); o.rotation.set(s * 3, s * 7, s * 2); });
for(const [x, z, s] of rocks) colliders.push({x, z, r: 0.75 * (0.6 + s)});
// village: houses around the square, a fountain in the middle
const houses = [];
function house(x, z, rot, w, d, wallC, roofC){
  const g = new THREE.Group(), hh = 2.6;
  const walls = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), flat(wallC)); walls.position.y = hh / 2;
  const roofGeo = new THREE.ConeGeometry(Math.hypot(w, d) / 2 * 1.05, 2.2, 4); roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, flat(roofC)); roof.position.y = hh + 1.1; roof.scale.set(w / Math.hypot(w, d) * 1.45, 1, d / Math.hypot(w, d) * 1.45);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.1), flat(0x4a3220)); door.position.set(0, 0.8, d / 2 + 0.03);
  for(const m of [walls, roof, door]){ m.castShadow = true; m.receiveShadow = true; g.add(m); }
  g.position.set(x, height(x, z), z); g.rotation.y = rot; scene.add(g); houses.push(g);
  g.traverse(o => { if(o.material){ o.material = o.material.clone(); o.material.transparent = true; } });
  colliders.push({x, z, r: Math.max(w, d) * 0.62});
}
[[-8, -7, 0.6, 5, 4], [7, -8, -0.5, 4.5, 4], [-9, 6, 2.4, 4, 4], [3, 11, 3.1, 5, 4.5], [0, -11, 0, 6, 4]].forEach(([x, z, r, w, d], i) =>
  house(x, z, r, w, d, [0xd9c7a3, 0xcdb894, 0xe0d2b4][i % 3], [0x8f3c2b, 0x7a5a3a, 0x5a6f8f][i % 3]));
{ const f = new THREE.Group(); const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.2, 0.6, 10), flat(0x8b8780)); base.position.y = 0.3;
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.1, 10), new THREE.MeshLambertMaterial({color: 0x3f8fbf})); pool.position.y = 0.6;
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.6, 8), flat(0x9b978f)); col.position.y = 1.2;
  for(const m of [base, pool, col]){ m.castShadow = true; m.receiveShadow = true; f.add(m); }
  f.position.set(VILLAGE.x, height(VILLAGE.x, VILLAGE.z), VILLAGE.z); scene.add(f); colliders.push({x: VILLAGE.x, z: VILLAGE.z, r: 2.2}); }

// ---------------------------------------------------------------- the player: a simple low-poly adventurer
function makeHero(){
  const g = new THREE.Group(), skin = flat(0xe0b48c), tunic = flat(0x3d6fa8), pants = flat(0x4a3a2a), hair = flat(0x6a4426), boots = flat(0x2e2620);
  const part = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };
  const torso = part(new THREE.BoxGeometry(0.62, 0.72, 0.36), tunic, 0, 1.22, 0);
  const head = part(new THREE.BoxGeometry(0.42, 0.42, 0.42), skin, 0, 1.82, 0);
  const hat = part(new THREE.BoxGeometry(0.46, 0.14, 0.46), hair, 0, 2.06, 0);
  const limb = (w, h, mat, x, y) => { const pivot = new THREE.Group(); pivot.position.set(x, y, 0); const m = part(new THREE.BoxGeometry(w, h, w), mat, 0, -h / 2, 0); pivot.add(m); return pivot; };
  const legL = limb(0.24, 0.8, pants, -0.15, 0.86), legR = limb(0.24, 0.8, pants, 0.15, 0.86);
  legL.children[0].add(part(new THREE.BoxGeometry(0.27, 0.16, 0.36), boots, 0, -0.36, 0.05)); legR.children[0].add(part(new THREE.BoxGeometry(0.27, 0.16, 0.36), boots, 0, -0.36, 0.05));
  const armL = limb(0.2, 0.7, tunic, -0.42, 1.54), armR = limb(0.2, 0.7, tunic, 0.42, 1.54);
  const cape = part(new THREE.BoxGeometry(0.58, 0.9, 0.05), flat(0x8f2f2f), 0, 1.15, -0.21);
  g.add(torso, head, hat, legL, legR, armL, armR, cape);
  g.userData = {legL, legR, armL, armR, cape};
  return g;
}
const hero = makeHero(); scene.add(hero);
const P = {x: 4, z: 6, rot: 0, speed: 7, walk: 0, moving: false, target: null};
hero.position.set(P.x, height(P.x, P.z), P.z);

// ---------------------------------------------------------------- movement and collision
function blocked(x, z){
  if(Math.abs(x) > HALF - 4 || Math.abs(z) > HALF - 4) return true;
  if(height(x, z) < WATER + 0.1) return true;                                        // no swimming yet
  const here = height(P.x, P.z), there = height(x, z); if(there - here > 0.9) return true;   // too steep to climb
  for(const c of colliders){ const dx = x - c.x, dz = z - c.z; if(dx*dx + dz*dz < (c.r + 0.35) ** 2) return true; }
  return false;
}
function tryMove(dx, dz){ const nx = P.x + dx, nz = P.z + dz;
  if(!blocked(nx, nz)){ P.x = nx; P.z = nz; return true; }
  if(!blocked(nx, P.z)){ P.x = nx; return true; }                                    // slide along walls
  if(!blocked(P.x, nz)){ P.z = nz; return true; }
  return false; }

// ---------------------------------------------------------------- input
const keys = new Set();
addEventListener("keydown", e => { const k = e.key.toLowerCase(); keys.add(k); if(k === "q") cam.yawT += Math.PI / 4; if(k === "e") cam.yawT -= Math.PI / 4; if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(k)) P.target = null; });
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
addEventListener("blur", () => keys.clear());
const cam = {dist: 26, distT: 26, yaw: Math.PI / 4, yawT: Math.PI / 4, pitch: 0.95};
addEventListener("wheel", e => { cam.distT = clamp(cam.distT + Math.sign(e.deltaY) * 3, 12, 48); }, {passive: true});
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
const marker = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.55, 20), new THREE.MeshBasicMaterial({color: 0xffe08a, transparent: true, opacity: 0.9}));
marker.rotation.x = -Math.PI / 2; marker.visible = false; scene.add(marker);
renderer.domElement.addEventListener("pointerdown", e => {
  if(e.button !== 0) return;
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObject(terrain)[0]; if(!hit) return;
  P.target = {x: hit.point.x, z: hit.point.z}; marker.position.set(hit.point.x, hit.point.y + 0.05, hit.point.z); marker.visible = true; marker.userData.t = 0;
});

// ---------------------------------------------------------------- game loop
const zoneEl = document.getElementById("zone"), fpsEl = document.getElementById("fps");
let last = performance.now(), fpsT = 0, frames = 0;
function zoneName(){ if(Math.hypot(P.x - VILLAGE.x, P.z - VILLAGE.z) < VILLAGE.r + 2) return VILLAGE.name; if(Math.hypot(P.x - LAKE.x, P.z - LAKE.z) < LAKE.r + 8) return LAKE.name;
  if(height(P.x, P.z) > 9) return "Iron Foothills"; return "Frost Meadows"; }
function update(dt){
  // camera-relative movement: W is always "up" on the screen
  let ix = 0, iz = 0;
  if(keys.has("w") || keys.has("arrowup")) iz -= 1; if(keys.has("s") || keys.has("arrowdown")) iz += 1;
  if(keys.has("a") || keys.has("arrowleft")) ix -= 1; if(keys.has("d") || keys.has("arrowright")) ix += 1;
  let mx = 0, mz = 0;
  if(ix || iz){ const l = Math.hypot(ix, iz), s = Math.sin(cam.yaw), c = Math.cos(cam.yaw); mx = (ix * c + iz * s) / l; mz = (-ix * s + iz * c) / l; }
  else if(P.target){ const dx = P.target.x - P.x, dz = P.target.z - P.z, d = Math.hypot(dx, dz); if(d < 0.3){ P.target = null; marker.visible = false; } else { mx = dx / d; mz = dz / d; } }
  P.moving = false;
  if(mx || mz){ if(tryMove(mx * P.speed * dt, mz * P.speed * dt)) P.moving = true; else if(P.target){ P.target = null; marker.visible = false; }
    const want = Math.atan2(mx, mz); let dr = want - P.rot; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); P.rot += dr * Math.min(1, dt * 14); }
  // walk animation
  P.walk = P.moving ? P.walk + dt * 9 : P.walk * 0.85; const sw = Math.sin(P.walk) * (P.moving ? 0.7 : 0);
  const u = hero.userData; u.legL.rotation.x = sw; u.legR.rotation.x = -sw; u.armL.rotation.x = -sw * 0.8; u.armR.rotation.x = sw * 0.8; u.cape.rotation.x = P.moving ? -0.25 - Math.abs(sw) * 0.1 : -0.05;
  hero.position.set(P.x, height(P.x, P.z) + (P.moving ? Math.abs(Math.sin(P.walk)) * 0.06 : 0), P.z); hero.rotation.y = P.rot;
  // camera: angled from above, follows you, smooth zoom and turning
  cam.dist = lerp(cam.dist, cam.distT, Math.min(1, dt * 8)); cam.yaw = lerp(cam.yaw, cam.yawT, Math.min(1, dt * 8));
  const cy = Math.sin(cam.pitch) * cam.dist, ch = Math.cos(cam.pitch) * cam.dist;
  camera.position.set(P.x + Math.sin(cam.yaw) * ch, height(P.x, P.z) + cy, P.z + Math.cos(cam.yaw) * ch); camera.lookAt(P.x, height(P.x, P.z) + 1, P.z);
  sun.position.set(P.x - 30, 60, P.z + 20); sun.target.position.set(P.x, 0, P.z);
  // houses between the camera and you turn see-through, so you never lose your character
  { const cx = camera.position.x - P.x, cz = camera.position.z - P.z, cl = Math.hypot(cx, cz) || 1;
    for(const h of houses){ const hx = h.position.x - P.x, hz = h.position.z - P.z, along = (hx*cx + hz*cz) / cl, side = Math.abs(hx*cz - hz*cx) / cl;
      const hide = along > -1 && along < 14 && side < 4.2; const op = hide ? 0.28 : 1;
      h.traverse(o => { if(o.material){ o.material.opacity = lerp(o.material.opacity, op, Math.min(1, dt * 10)); o.material.depthWrite = o.material.opacity > 0.95; } }); } }
  if(marker.visible){ marker.userData.t += dt; marker.scale.setScalar(1 + Math.sin(marker.userData.t * 6) * 0.15); }
  water.material.opacity = 0.8 + Math.sin(performance.now() / 900) * 0.03;
  zoneEl.textContent = zoneName();
}
function loop(now){
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  update(dt); renderer.render(scene, camera);
  frames++; fpsT += dt; if(fpsT > 1){ fpsEl.textContent = frames + " fps"; frames = 0; fpsT = 0; }
  requestAnimationFrame(loop);
}
document.getElementById("load").hidden = true;
window.R2 = {P, cam, height, blocked};   // handy for testing in the browser console
requestAnimationFrame(loop);
