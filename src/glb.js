// A small glTF / GLB loader for the KayKit models: skinned meshes, one texture, and animation clips.
// load(url) reads a file once; build(asset) makes a new copy (meshes share geometry and materials, each copy has its own skeleton).
import * as THREE from "three";

const cache = new Map();
const COMP = {5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array};
const SIZE = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16};
const san = n => THREE.PropertyBinding.sanitizeNodeName(n || "");

async function fetchAsset(url){
  const base = url.slice(0, url.lastIndexOf("/") + 1), buf = await (await fetch(url)).arrayBuffer();
  let json, bins = [];
  const dv = new DataView(buf);
  if(dv.getUint32(0, true) === 0x46546C67){                                   // "glTF": binary
    let off = 12; while(off < buf.byteLength){ const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true), data = buf.slice(off + 8, off + 8 + len);
      if(type === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(data)); else if(type === 0x004E4942) bins.push(data); off += 8 + len; } }
  else { json = JSON.parse(new TextDecoder().decode(buf)); bins = await Promise.all((json.buffers || []).map(b => fetch(/^data:/.test(b.uri) ? b.uri : base + b.uri).then(r => r.arrayBuffer()))); }
  const acc = i => { const a = json.accessors[i], bv = json.bufferViews[a.bufferView], T = COMP[a.componentType], n = SIZE[a.type], stride = bv.byteStride || 0, bin = bins[bv.buffer || 0];
    const off = (bv.byteOffset || 0) + (a.byteOffset || 0), esz = T.BYTES_PER_ELEMENT;
    let arr; if(!stride || stride === n * esz) arr = new T(bin, off, a.count * n);
    else { arr = new T(a.count * n); const src = new DataView(bin); for(let k = 0; k < a.count; k++) for(let c = 0; c < n; c++){ const p = off + k * stride + c * esz;
      arr[k * n + c] = T === Float32Array ? src.getFloat32(p, true) : T === Uint16Array ? src.getUint16(p, true) : T === Uint8Array ? src.getUint8(p) : T === Uint32Array ? src.getUint32(p, true) : 0; } }
    return {arr, n, norm: !!a.normalized}; };
  // textures
  const images = await Promise.all((json.images || []).map(async im => { let blob;
    if(im.bufferView != null){ const bv = json.bufferViews[im.bufferView]; blob = new Blob([new Uint8Array(bins[bv.buffer || 0], bv.byteOffset || 0, bv.byteLength)], {type: im.mimeType}); }
    else blob = await (await fetch(/^data:/.test(im.uri) ? im.uri : base + im.uri)).blob();
    return createImageBitmap(blob, {imageOrientation: "none"}); }));
  const textures = (json.textures || []).map(t => { const tex = new THREE.Texture(images[t.source]); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true; return tex; });
  const materials = (json.materials || []).map(m => { const pb = m.pbrMetallicRoughness || {}, map = pb.baseColorTexture ? textures[pb.baseColorTexture.index] : null;
    const mat = new THREE.MeshLambertMaterial({map, color: pb.baseColorFactor ? new THREE.Color(...pb.baseColorFactor.slice(0, 3)) : 0xffffff, side: m.doubleSided ? THREE.DoubleSide : THREE.FrontSide}); mat.name = m.name || ""; if(pb.baseColorFactor && pb.baseColorFactor[3] < 1){ mat.transparent = true; mat.opacity = pb.baseColorFactor[3]; mat.depthWrite = false; } return mat; });
  const geoms = (json.meshes || []).map(me => me.primitives.map(pr => { const g = new THREE.BufferGeometry(), at = pr.attributes;
    const set = (name, key) => { if(at[key] == null) return; const a = acc(at[key]); g.setAttribute(name, new THREE.BufferAttribute(a.arr, a.n, a.norm)); };
    set("position", "POSITION"); set("normal", "NORMAL"); set("uv", "TEXCOORD_0"); set("skinIndex", "JOINTS_0"); set("skinWeight", "WEIGHTS_0");
    if(pr.indices != null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices).arr, 1)); g.computeBoundingSphere(); return {g, mat: pr.material}; }));
  const skins = (json.skins || []).map(s => ({joints: s.joints, ibm: s.inverseBindMatrices != null ? acc(s.inverseBindMatrices).arr : null}));
  const clips = (json.animations || []).map(an => { const tracks = [];
    for(const ch of an.channels){ const s = an.samplers[ch.sampler], node = json.nodes[ch.target.node], times = acc(s.input).arr, vals = acc(s.output).arr, name = san(node.name);
      const interp = s.interpolation === "STEP" ? THREE.InterpolateDiscrete : THREE.InterpolateLinear;
      if(ch.target.path === "rotation") tracks.push(new THREE.QuaternionKeyframeTrack(name + ".quaternion", Array.from(times), Array.from(vals), interp));
      else if(ch.target.path === "translation") tracks.push(new THREE.VectorKeyframeTrack(name + ".position", Array.from(times), Array.from(vals), interp));
      else if(ch.target.path === "scale") tracks.push(new THREE.VectorKeyframeTrack(name + ".scale", Array.from(times), Array.from(vals), interp)); }
    return new THREE.AnimationClip(an.name, -1, tracks); });
  return {json, geoms, materials, skins, clips};
}
export function load(url){ if(!cache.has(url)) cache.set(url, fetchAsset(url)); return cache.get(url); }

// a fresh copy of the model: a Group holding the node tree, with skinned meshes bound to their own bones
export function build(asset){
  const {json} = asset, joints = new Set(asset.skins.flatMap(s => s.joints)), objs = json.nodes.map((n, i) => {
    const o = joints.has(i) ? new THREE.Bone() : new THREE.Object3D(); o.name = san(n.name);
    if(n.matrix){ new THREE.Matrix4().fromArray(n.matrix).decompose(o.position, o.quaternion, o.scale); }
    else { if(n.translation) o.position.fromArray(n.translation); if(n.rotation) o.quaternion.fromArray(n.rotation); if(n.scale) o.scale.fromArray(n.scale); }
    return o; });
  json.nodes.forEach((n, i) => { for(const c of n.children || []) objs[i].add(objs[c]); });
  const root = new THREE.Group(); for(const i of json.scenes[json.scene || 0].nodes) root.add(objs[i]);
  root.updateMatrixWorld(true);
  const meshes = [];
  json.nodes.forEach((n, i) => { if(n.mesh == null) return;
    for(const {g, mat} of asset.geoms[n.mesh]){ const material = asset.materials[mat] || new THREE.MeshLambertMaterial();
      let m; if(n.skin != null){ m = new THREE.SkinnedMesh(g, material); const s = asset.skins[n.skin], bones = s.joints.map(j => objs[j]);
        const inv = s.ibm ? s.joints.map((_, k) => new THREE.Matrix4().fromArray(s.ibm, k * 16)) : undefined; m.bind(new THREE.Skeleton(bones, inv), objs[i].matrixWorld); }
      else m = new THREE.Mesh(g, material);
      m.name = san(json.meshes[n.mesh].name); m.castShadow = true; m.receiveShadow = true; objs[i].add(m); meshes.push(m);
      if(m.isSkinnedMesh){ if(!g.boundingSphere) g.computeBoundingSphere(); m.boundingSphere = g.boundingSphere.clone(); m.boundingSphere.radius *= 1.6; } } });   // a fixed, roomy sphere, so animated models are skipped when off screen
  root.userData.nodes = Object.fromEntries(objs.map(o => [o.name, o])); root.userData.meshes = meshes;
  return root;
}
