import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* =========================================================
   Apt 5A — A polished Three.js mini-app inspired by the
   recurring filmed Seinfeld set. All textures procedural.
   ========================================================= */

const APT = {
  // top-down footprint (X = east-west, Z = north-south)
  W: 11.0,   // east-west width
  D: 8.4,    // north-south depth
  H: 2.85,   // ceiling height
};

// --- Renderer / Scene / Camera ---------------------------------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0a08);
scene.fog = new THREE.FogExp2(0x0b0a09, 0.012); // very subtle

const camera = new THREE.PerspectiveCamera(72, window.innerWidth/window.innerHeight, 0.05, 200);
camera.position.set(3.5, 1.65, 2.5);

// --- Controls -------------------------------------------------
const plControls = new PointerLockControls(camera, document.body);
scene.add(plControls.object);

const inspectCam = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.05, 200);
inspectCam.position.set(9, 7, 9);
const orbit = new OrbitControls(inspectCam, canvas);
orbit.target.set(0, 1.2, 0);
orbit.enableDamping = true;
orbit.enabled = false;

let mode = 'walk'; // 'walk' | 'inspect'

// --- Lighting (warm, layered, balanced) -----------------------
const hemi = new THREE.HemisphereLight(0xfff1d8, 0x251a14, 0.45);
scene.add(hemi);

// soft warm fill ambient
scene.add(new THREE.AmbientLight(0xffe8c8, 0.22));

// "window" key light – warm afternoon, from north window side
const windowLight = new THREE.DirectionalLight(0xffd9a8, 1.15);
windowLight.position.set(-2, 4.2, -6);
windowLight.castShadow = true;
windowLight.shadow.mapSize.set(2048, 2048);
windowLight.shadow.camera.left = -10;
windowLight.shadow.camera.right = 10;
windowLight.shadow.camera.top = 8;
windowLight.shadow.camera.bottom = -8;
windowLight.shadow.camera.near = 0.5;
windowLight.shadow.camera.far = 25;
windowLight.shadow.bias = -0.0004;
scene.add(windowLight);

// practical warm point lights – ceiling/lamp glow
function practical(x,y,z,intensity=18,color=0xffd2a0,dist=7) {
  const p = new THREE.PointLight(color, intensity, dist, 1.6);
  p.position.set(x,y,z); p.castShadow = false;
  scene.add(p); return p;
}
practical(-2.6, APT.H-0.2, -1.0, 14);          // kitchen
practical( 1.0, APT.H-0.2,  1.2, 16);          // living room
practical( 3.0, APT.H-0.2, -1.5, 12);          // dining
practical(-3.4, APT.H-0.4,  2.6, 8, 0xffe0b0, 6); // hallway
practical( 4.2, 1.05,      2.0, 6, 0xffd7a0, 3.5); // desk lamp area

// --- Procedural texture helpers -------------------------------
function makeCanvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
function rand(a,b){ return a + Math.random()*(b-a); }

// --- Materials (PBR) ------------------------------------------
const M = {
  wall:      new THREE.MeshStandardMaterial({ color: 0xeae2d4, roughness: 0.92, metalness: 0.0 }),
  trim:      new THREE.MeshStandardMaterial({ color: 0x8a8d8f, roughness: 0.65 }),
  ceiling:   new THREE.MeshStandardMaterial({ color: 0xf3ecdd, roughness: 0.95 }),
  floor:     new THREE.MeshStandardMaterial({ color: 0x7a4a26, roughness: 0.55 }),
  wood:      new THREE.MeshStandardMaterial({ color: 0x6a3d22, roughness: 0.5 }),
  woodLight: new THREE.MeshStandardMaterial({ color: 0xb38655, roughness: 0.6 }),
  couch:     new THREE.MeshStandardMaterial({ color: 0x2fa6a6, roughness: 0.85 }), // turquoise
  couchDark: new THREE.MeshStandardMaterial({ color: 0x227d7d, roughness: 0.85 }),
  metalDark: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.7 }),
  metalChrome: new THREE.MeshStandardMaterial({ color: 0xcfd2d4, roughness: 0.2, metalness: 0.9 }),
  fridge:    new THREE.MeshStandardMaterial({ color: 0xe8e6e0, roughness: 0.35, metalness: 0.2 }),
  cabinetGreen: new THREE.MeshStandardMaterial({ color: 0x4d6b3c, roughness: 0.55 }),
  cabinetGlass: new THREE.MeshStandardMaterial({ color: 0xbcd6d4, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.35 }),
  counter:   new THREE.MeshStandardMaterial({ color: 0x9a8d6e, roughness: 0.4 }),
  glass:     new THREE.MeshStandardMaterial({ color: 0xa7c4d3, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35 }),
  black:     new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6 }),
  paper:     new THREE.MeshStandardMaterial({ color: 0xf3eedd, roughness: 0.95 }),
};

// Slightly worn floor: planks pattern
M.floor.map = makeCanvasTex(1024, 1024, (ctx,w,h)=>{
  ctx.fillStyle = '#6a3a1d'; ctx.fillRect(0,0,w,h);
  for (let y=0; y<h; y+=110) {
    for (let x=0; x<w; x+=rand(120,220)) {
      const pw = rand(140,220), ph = 108;
      const c = `hsl(${rand(20,30)},${rand(35,55)}%,${rand(18,32)}%)`;
      ctx.fillStyle = c; ctx.fillRect(x,y,pw,ph);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth=2;
      ctx.strokeRect(x,y,pw,ph);
      // grain
      for (let i=0;i<8;i++){
        ctx.strokeStyle = `rgba(0,0,0,${rand(0.04,0.12)})`;
        ctx.beginPath();
        ctx.moveTo(x, y+rand(0,ph));
        ctx.bezierCurveTo(x+pw*0.3, y+rand(0,ph), x+pw*0.7, y+rand(0,ph), x+pw, y+rand(0,ph));
        ctx.stroke();
      }
    }
  }
});
M.floor.map.wrapS = M.floor.map.wrapT = THREE.RepeatWrapping;
M.floor.map.repeat.set(3,3);

// Wall slight imperfections
M.wall.map = makeCanvasTex(512,512,(ctx,w,h)=>{
  ctx.fillStyle = '#eae2d4'; ctx.fillRect(0,0,w,h);
  for (let i=0;i<2200;i++){
    ctx.fillStyle = `rgba(${rand(120,180)|0},${rand(110,160)|0},${rand(95,140)|0},${rand(0.02,0.08)})`;
    ctx.fillRect(rand(0,w),rand(0,h),rand(1,3),rand(1,3));
  }
  // a couple subtle scuffs
  for (let i=0;i<6;i++){
    ctx.strokeStyle = `rgba(60,40,25,${rand(0.05,0.13)})`;
    ctx.lineWidth = rand(1,2);
    ctx.beginPath();
    const x=rand(0,w), y=rand(0,h);
    ctx.moveTo(x,y); ctx.lineTo(x+rand(-30,30), y+rand(-30,30));
    ctx.stroke();
  }
});
M.wall.map.wrapS = M.wall.map.wrapT = THREE.RepeatWrapping;
M.wall.map.repeat.set(3,2);

// --- Build apartment shell -----------------------------------
const root = new THREE.Group(); scene.add(root);
const colliders = []; // AABBs for collision

function addCollider(mesh, shrink=0) {
  mesh.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(mesh);
  if (shrink) box.expandByScalar(-shrink);
  colliders.push(box);
}

function box(w,h,d, mat, x,y,z, parent=root, collide=false) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m);
  if (collide) addCollider(m);
  return m;
}

// Floor
const floor = box(APT.W, 0.05, APT.D, M.floor, 0, 0, 0);
floor.receiveShadow = true; floor.castShadow = false;

// Ceiling
box(APT.W, 0.04, APT.D, M.ceiling, 0, APT.H, 0).castShadow = false;

// Walls — built as boxes so collisions are easy
// South wall (back of kitchen/dining)
box(APT.W, APT.H, 0.15, M.wall, 0, APT.H/2, -APT.D/2, root, true);
// North wall (window wall) — split for window
const winW = 3.4, winH = 1.5, winSillY = 1.1;
const NWz = APT.D/2;
box((APT.W - winW)/2, APT.H, 0.15, M.wall, -(winW/2 + (APT.W - winW)/4), APT.H/2, NWz, root, true);
box((APT.W - winW)/2, APT.H, 0.15, M.wall,  (winW/2 + (APT.W - winW)/4), APT.H/2, NWz, root, true);
box(winW, winSillY, 0.15, M.wall, 0, winSillY/2, NWz, root, true);
box(winW, APT.H - (winSillY+winH), 0.15, M.wall, 0, (winSillY+winH) + (APT.H-(winSillY+winH))/2, NWz, root, true);
// Window glass
box(winW-0.05, winH-0.05, 0.04, M.glass, 0, winSillY + winH/2, NWz);
// Blinds (procedural slats)
const blindsTex = makeCanvasTex(256,512,(ctx,w,h)=>{
  ctx.fillStyle = '#d9c89a'; ctx.fillRect(0,0,w,h);
  for (let y=0; y<h; y+=14) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0,y,w,2);
    ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(0,y+8,w,2);
  }
});
const blinds = new THREE.Mesh(new THREE.PlaneGeometry(winW-0.1, winH-0.1),
  new THREE.MeshStandardMaterial({ map: blindsTex, roughness: 0.85, transparent: true, opacity: 0.85 }));
blinds.position.set(0, winSillY + winH/2, NWz - 0.05); root.add(blinds);

// East wall (front door wall)
const doorW=1.0, doorH=2.05;
const EWx = APT.W/2;
box(0.15, APT.H, APT.D, M.wall,  EWx, APT.H/2, 0, root, true);  // full wall
// Carve door visually by overlaying door panel
// West wall (back where bike + hallway opening)
const hallW = 1.3, hallH = 2.1;
const WWx = -APT.W/2;
// keep west wall solid except hallway opening
box(0.15, APT.H, (APT.D - hallW)/2, M.wall, WWx, APT.H/2, -(hallW/2 + (APT.D-hallW)/4), root, true);
box(0.15, APT.H, (APT.D - hallW)/2, M.wall, WWx, APT.H/2,  (hallW/2 + (APT.D-hallW)/4), root, true);
box(0.15, APT.H - hallH, hallW, M.wall, WWx, hallH + (APT.H-hallH)/2, 0, root, true);

// Baseboards (trim)
const trimY = 0.07, trimT = 0.02, trimH = 0.1;
function baseboard(len, x,z, axis='x'){
  const g = (axis==='x') ? new THREE.BoxGeometry(len, trimH, trimT) : new THREE.BoxGeometry(trimT, trimH, len);
  const m = new THREE.Mesh(g, M.trim); m.position.set(x, trimY, z); root.add(m);
}
baseboard(APT.W, 0, -APT.D/2+0.08);
baseboard(APT.W, 0,  APT.D/2-0.08);
baseboard(APT.D, -APT.W/2+0.08, 0, 'z');
baseboard(APT.D,  APT.W/2-0.08, 0, 'z');

/* ---------- Front Door 5A (east wall) ---------- */
const doorGroup = new THREE.Group(); root.add(doorGroup);
doorGroup.position.set(EWx-0.08, 0, 1.8);
// Door panel with worn texture
const doorTex = makeCanvasTex(512,1024,(ctx,w,h)=>{
  ctx.fillStyle = '#3a2818'; ctx.fillRect(0,0,w,h);
  // panels
  ctx.strokeStyle = '#1d1208'; ctx.lineWidth=6;
  ctx.strokeRect(40,60,w-80,h*0.4-40);
  ctx.strokeRect(40,h*0.45,w-80,h*0.4);
  // wear/scuffs
  for (let i=0;i<160;i++){
    ctx.fillStyle = `rgba(${rand(30,90)|0},${rand(20,50)|0},${rand(10,30)|0},${rand(0.1,0.4)})`;
    ctx.fillRect(rand(0,w),rand(0,h),rand(1,8),rand(1,3));
  }
  // a few bigger scuffs near the bottom
  for (let i=0;i<8;i++){
    ctx.fillStyle = `rgba(140,110,80,${rand(0.15,0.3)})`;
    ctx.beginPath(); ctx.ellipse(rand(40,w-40), rand(h*0.7,h-40), rand(15,40), rand(4,10), rand(0,3.14),0,6.28); ctx.fill();
  }
});
const doorMat = new THREE.MeshStandardMaterial({ map: doorTex, roughness: 0.65 });
const door = new THREE.Mesh(new THREE.BoxGeometry(0.08, doorH, doorW), doorMat);
door.position.set(0, doorH/2, 0); doorGroup.add(door);
// Brass knob
const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xb18a48, metalness: 0.9, roughness: 0.25 }));
knob.position.set(-0.06, 1.0, -0.35); doorGroup.add(knob);
// 5A plaque
const plaqueTex = makeCanvasTex(256,256,(ctx,w,h)=>{
  ctx.fillStyle = '#b8941f'; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle = '#5a4410'; ctx.lineWidth=8; ctx.strokeRect(8,8,w-16,h-16);
  ctx.fillStyle = '#1a1208'; ctx.font = 'bold 160px serif';
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('5A', w/2, h/2+6);
});
const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.18,0.18),
  new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.4, metalness: 0.3 }));
plaque.rotation.y = -Math.PI/2;
plaque.position.set(-0.045, 1.6, 0); doorGroup.add(plaque);

/* ---------- Kitchen (south-west quadrant) ---------- */
const KIT = new THREE.Group(); root.add(KIT);
KIT.position.set(-2.6, 0, -APT.D/2 + 0.35);

// Counter L-shape
const counterH = 0.92, counterD = 0.65;
const counterMain = box(4.4, counterH, counterD, M.counter, 0, counterH/2, 0, KIT, true);
const counterReturn = box(counterD, counterH, 2.6, M.counter, 4.4/2 - counterD/2, counterH/2, counterD/2 + 2.6/2, KIT, true);

// Lower cabinets (under counter)
const lowCabMat = M.woodLight;
box(4.4, counterH-0.05, counterD-0.03, lowCabMat, 0, (counterH-0.05)/2, 0, KIT, false);
// Cabinet handles
for (let i=-1.7; i<=1.7; i+=0.85){
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.12,8), M.metalChrome);
  h.rotation.z = Math.PI/2; h.position.set(i, 0.4, counterD/2+0.01); KIT.add(h);
}

// Sink
const sink = box(0.65, 0.12, 0.45, new THREE.MeshStandardMaterial({color:0x9aa0a4, metalness:0.7, roughness:0.3}),
  -0.7, counterH-0.06, 0, KIT);
const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.32,12), M.metalChrome);
faucet.position.set(-0.7, counterH+0.16, -0.18); KIT.add(faucet);
const faucetArm = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.25,12), M.metalChrome);
faucetArm.rotation.z = Math.PI/2.2; faucetArm.position.set(-0.62, counterH+0.32, -0.18); KIT.add(faucetArm);

// Stove
const stove = box(0.7, 0.04, 0.55, M.black, 1.4, counterH+0.02, 0, KIT);
for (let i=0;i<4;i++){
  const burn = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24),
    new THREE.MeshStandardMaterial({color:0x222, roughness:0.6}));
  burn.rotation.x = -Math.PI/2;
  burn.position.set(1.4 + (i%2?0.18:-0.18), counterH+0.045, (i<2?-0.13:0.13));
  KIT.add(burn);
}
// Red kettle (recurring prop)
const kettle = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12),
  new THREE.MeshStandardMaterial({color:0xb02a1a, roughness:0.4, metalness:0.3}));
kettle.scale.y = 0.85; kettle.position.set(1.22, counterH + 0.13, -0.1); KIT.add(kettle);
const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.025,0.1,8),
  new THREE.MeshStandardMaterial({color:0xb02a1a, roughness:0.4}));
spout.rotation.z = -Math.PI/3; spout.position.set(1.12, counterH+0.17, -0.1); KIT.add(spout);

// Fruit bowl
const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI*2, 0, Math.PI/2),
  new THREE.MeshStandardMaterial({color:0xd8c89a, roughness:0.5}));
bowl.position.set(0.4, counterH+0.05, 0.05); KIT.add(bowl);
function fruit(c,x,y,z,s=0.07){
  const f = new THREE.Mesh(new THREE.SphereGeometry(s,12,10), new THREE.MeshStandardMaterial({color:c, roughness:0.65}));
  f.position.set(x,y,z); KIT.add(f);
}
fruit(0xe5532b, 0.35, counterH+0.13, 0.02);
fruit(0xe5b32b, 0.45, counterH+0.13, 0.07);
fruit(0x6fa83a, 0.42, counterH+0.13, -0.03);
fruit(0x9a2d2d, 0.5,  counterH+0.13, 0.02, 0.05);

// Upper cabinets (above counter) — green like the show
const upperY = counterH + 0.65 + 0.4;
const upper = box(4.4, 0.8, 0.35, M.cabinetGreen, 0, upperY, -counterD/2 + 0.175, KIT);

// Cabinet on right with glass doors
const glassCab = box(counterD, 0.8, 1.5, M.cabinetGreen,
  4.4/2 - counterD/2, upperY, counterD/2 + 0.4, KIT);
const glassPane = box(counterD-0.05, 0.7, 1.4, M.cabinetGlass,
  4.4/2 - counterD/2 - 0.01, upperY, counterD/2 + 0.4, KIT);

// Cereal boxes line — procedural, recognizable but original
const cerealColors = [
  ['CRUNCHIES','#d92c2c'], ['HONEY-O\'S','#e0a514'],
  ['FLAKE POPS','#1e8fcf'], ['RAISIN BITS','#76358a'],
  ['CORN PUFFS','#2c8a35'], ['OAT KING','#c45a1f'],
];
cerealColors.forEach((c,i)=>{
  const tex = makeCanvasTex(256,384,(ctx,w,h)=>{
    ctx.fillStyle = c[1]; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0,h*0.6,w,3);
    ctx.fillStyle = '#fff'; ctx.font='bold 38px sans-serif'; ctx.textAlign='center';
    ctx.fillText(c[0], w/2, h*0.18);
    ctx.font='22px sans-serif'; ctx.fillText('CRISP & TASTY!', w/2, h*0.27);
    // mascot blob
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(w/2, h*0.5, 70, 60, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle=c[1]; ctx.beginPath(); ctx.ellipse(w/2-22, h*0.48, 8, 12, 0, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w/2+22, h*0.48, 8, 12, 0, 0, 6.28); ctx.fill();
    ctx.strokeStyle=c[1]; ctx.lineWidth=6; ctx.beginPath();
    ctx.arc(w/2, h*0.55, 28, 0.2, Math.PI-0.2); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='bold 26px sans-serif';
    ctx.fillText('NET WT 12 OZ', w/2, h*0.92);
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
  const cb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.1), mat);
  cb.position.set(-1.9 + i*0.32, counterH + 0.5, -counterD/2 + 0.08);
  KIT.add(cb);
});

// Cereal row on top of upper cabinets too (Jerry has tons)
['#df3','#3df','#f3d','#fa3','#3fa','#a3f','#f33'].forEach((c,i)=>{
  const cb = new THREE.Mesh(new THREE.BoxGeometry(0.16,0.28,0.09),
    new THREE.MeshStandardMaterial({color:c, roughness:0.7}));
  cb.position.set(-2 + i*0.35, upperY + 0.55, -counterD/2 + 0.1); KIT.add(cb);
});

// Blue stools by counter (peninsula side)
function stool(x,z){
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.04,24),
    new THREE.MeshStandardMaterial({color:0x2b6fb5, roughness:0.6}));
  seat.position.y = 0.72; g.add(seat);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.72,12), M.metalChrome);
  post.position.y = 0.36; g.add(post);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.025,16), M.metalChrome);
  base.position.y = 0.015; g.add(base);
  g.position.set(x,0,z); KIT.add(g);
  addCollider(seat);
}
stool(1.0, counterD/2 + 0.45);
stool(1.55, counterD/2 + 0.45);

// Fridge (corner of kitchen)
const fridgeG = new THREE.Group(); root.add(fridgeG);
fridgeG.position.set(-APT.W/2 + 0.5, 0, -APT.D/2 + 0.4);
const fridgeBody = box(0.8, 1.85, 0.78, M.fridge, 0, 0.925, 0, fridgeG, true);
// freezer door split
box(0.78, 0.02, 0.79, M.metalDark, 0.005, 1.35, 0, fridgeG);
// Handle
const fhandle = box(0.03, 0.5, 0.06, M.metalChrome, 0.42, 0.7, 0, fridgeG);
const fhandle2 = box(0.03, 0.3, 0.06, M.metalChrome, 0.42, 1.55, 0, fridgeG);

// Fridge magnets (Superman decal, Porsche, hamburger, Skip Barber)
function magnet(tex, x,y, w=0.18, h=0.18){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w,h),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, transparent:true }));
  m.position.set(0.405, y, x); m.rotation.y = Math.PI/2;
  fridgeG.add(m);
}
const supermanMag = makeCanvasTex(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
  // diamond S badge
  ctx.fillStyle='#d4263a'; ctx.beginPath();
  ctx.moveTo(w/2,30); ctx.lineTo(w-30,h/2); ctx.lineTo(w/2,h-30); ctx.lineTo(30,h/2); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#f0d020'; ctx.font='bold 140px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('S', w/2, h/2+10);
});
const porscheMag = makeCanvasTex(320,180,(ctx,w,h)=>{
  ctx.fillStyle='#1a1a1a'; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#e8c020'; ctx.font='bold 38px serif'; ctx.textAlign='center';
  ctx.fillText('VINTAGE RACING', w/2, 55);
  // car silhouette
  ctx.fillStyle='#c0c0c0'; ctx.beginPath();
  ctx.moveTo(50,140); ctx.lineTo(80,90); ctx.lineTo(150,80); ctx.lineTo(220,90); ctx.lineTo(270,140);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(95,140,18,0,6.28); ctx.fill();
  ctx.beginPath(); ctx.arc(225,140,18,0,6.28); ctx.fill();
});
const burgerMag = makeCanvasTex(200,200,(ctx,w,h)=>{
  ctx.fillStyle='rgba(0,0,0,0)'; ctx.clearRect(0,0,w,h);
  ctx.fillStyle='#d59944'; ctx.beginPath(); ctx.ellipse(100,70,75,30,0,0,6.28); ctx.fill();
  ctx.fillStyle='#4a7a2a'; ctx.fillRect(30,95,140,10);
  ctx.fillStyle='#a83020'; ctx.fillRect(30,105,140,18);
  ctx.fillStyle='#e8b820'; ctx.fillRect(30,123,140,8);
  ctx.fillStyle='#c98444'; ctx.beginPath(); ctx.ellipse(100,140,75,25,0,0,6.28); ctx.fill();
  // sesame seeds
  ctx.fillStyle='#fff8d8';
  for (let i=0;i<10;i++){ ctx.beginPath(); ctx.ellipse(40+i*12, 60+Math.sin(i)*4, 3,2,0,0,6.28); ctx.fill(); }
});
const skipMag = makeCanvasTex(300,160,(ctx,w,h)=>{
  ctx.fillStyle='#0a3a78'; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#fff'; ctx.lineWidth=4; ctx.strokeRect(8,8,w-16,h-16);
  ctx.fillStyle='#fff'; ctx.font='bold 28px sans-serif'; ctx.textAlign='center';
  ctx.fillText('GRAND PRIX', w/2, 48);
  ctx.font='bold 22px sans-serif';
  ctx.fillText('RACING SCHOOL', w/2, 78);
  ctx.font='14px sans-serif'; ctx.fillText('EST. 1975', w/2, 110);
  ctx.fillStyle='#e8c020'; ctx.fillRect(40,130,w-80,8);
});
magnet(supermanMag, -0.18, 1.6, 0.18, 0.18);
magnet(porscheMag,   0.15, 1.6, 0.26, 0.14);
magnet(burgerMag,   -0.18, 1.2, 0.16, 0.16);
magnet(skipMag,      0.15, 1.2, 0.24, 0.12);

// Pot holders hanging on side (cow & cat shapes — simplified)
const holderMat = (c)=> new THREE.MeshStandardMaterial({color:c, roughness:0.85});
const cow = box(0.16,0.16,0.01, holderMat(0xffffff), -0.41, 0.7, 0.32, fridgeG);
cow.material = new THREE.MeshStandardMaterial({color:0xfff, roughness:0.9});
const cat = box(0.16,0.16,0.01, holderMat(0xff8b3a), -0.41, 0.5, 0.32, fridgeG);

/* ---------- Living Room ---------- */
const LR = new THREE.Group(); root.add(LR);

// Turquoise couch (Jerry's iconic piece — using green/turquoise blend)
function couch(){
  const g = new THREE.Group();
  // base
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.45, 0.95), M.couch);
  base.position.y = 0.225; g.add(base);
  // backrest
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.7, 0.22), M.couchDark);
  back.position.set(0, 0.7, -0.37); g.add(back);
  // arms
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.95), M.couchDark);
  armL.position.set(-1.05, 0.55, 0); g.add(armL);
  const armR = armL.clone(); armR.position.x = 1.05; g.add(armR);
  // cushions
  for (let i=-1; i<=1; i++){
    const cush = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.85), M.couch);
    cush.position.set(i*0.72, 0.55, 0.05); g.add(cush);
  }
  g.traverse(o=>{o.castShadow=true; o.receiveShadow=true;});
  return g;
}
const sofa = couch(); sofa.position.set(1.4, 0, -0.6); sofa.rotation.y = -Math.PI/2;
LR.add(sofa);
addCollider(sofa);

// Matching armchair
const chair = couch();
chair.scale.x = 0.55; chair.position.set(-0.6, 0, 1.7); chair.rotation.y = -Math.PI/3;
LR.add(chair); addCollider(chair);

// Coffee table — wood top + black metal frame
function coffeeTable(){
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.6), M.wood);
  top.position.y = 0.42; g.add(top);
  for (const [x,z] of [[-0.55,-0.25],[0.55,-0.25],[-0.55,0.25],[0.55,0.25]]){
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.42,0.04), M.metalDark);
    leg.position.set(x,0.21,z); g.add(leg);
  }
  // magazine stack
  for (let i=0;i<3;i++){
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.28,0.005,0.4),
      new THREE.MeshStandardMaterial({color:['#d22','#226','#fa2'][i], roughness:0.6}));
    mag.position.set(-0.3+i*0.02, 0.45+i*0.006, 0.05); g.add(mag);
  }
  // coffee mug
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.09,16),
    new THREE.MeshStandardMaterial({color:0xfff8e6, roughness:0.5}));
  mug.position.set(0.3, 0.49, 0); g.add(mug);
  g.traverse(o=>{o.castShadow=true; o.receiveShadow=true;});
  return g;
}
const ct = coffeeTable(); ct.position.set(0.3, 0, -0.6); LR.add(ct); addCollider(ct);

/* ---------- TV area (west wall section) ---------- */
const tv = new THREE.Group(); root.add(tv);
tv.position.set(-APT.W/2 + 0.35, 0, -1.0);
// TV stand
const tvStand = box(0.5, 0.8, 1.3, M.wood, 0, 0.4, 0, tv, true);
// TV
const tvScreen = box(0.08, 0.65, 1.0, M.black, 0.15, 1.25, 0, tv);
// Glowing screen
const screenTex = makeCanvasTex(512,320,(ctx,w,h)=>{
  // static-y test pattern
  const grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0,'#3a3a4a'); grad.addColorStop(1,'#1a1a22'); ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='rgba(255,255,255,0.05)';
  for (let i=0;i<400;i++) ctx.fillRect(rand(0,w),rand(0,h),2,1);
  ctx.fillStyle = '#d8b66a'; ctx.font='bold 32px sans-serif';
  ctx.textAlign='center'; ctx.fillText('CHANNEL 5', w/2, h-30);
});
const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.95,0.55),
  new THREE.MeshStandardMaterial({ map: screenTex, emissive: 0x554422, emissiveIntensity:0.6 }));
screen.rotation.y = Math.PI/2; screen.position.set(0.2, 1.25, 0); tv.add(screen);
// VHS shelf
const vhsShelf = box(0.4, 0.04, 1.0, M.wood, 0.05, 0.85, 0, tv);
// VHS tapes
for (let i=0;i<10;i++){
  const v = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.04),
    new THREE.MeshStandardMaterial({color: `hsl(${i*36},60%,35%)`, roughness:0.7}));
  v.position.set(0.05, 0.97, -0.45 + i*0.09); tv.add(v);
}

/* ---------- Desk alcove (by window, NE corner) ---------- */
const DESK = new THREE.Group(); root.add(DESK);
DESK.position.set(APT.W/2 - 1.0, 0, APT.D/2 - 0.8);
const desk = box(1.6, 0.78, 0.7, M.wood, 0, 0.39, 0, DESK, true);
// Vintage Macintosh-style computer
const monitor = box(0.42, 0.42, 0.45, new THREE.MeshStandardMaterial({color:0xddd4be, roughness:0.7}),
  0.2, 0.99, -0.1, DESK);
const screen2 = box(0.02, 0.3, 0.35, new THREE.MeshStandardMaterial({color:0x1a2a3a, roughness:0.3, emissive:0x223344, emissiveIntensity:0.4}),
  0.21, 1.02, -0.1, DESK);
// Floppy slot
const slot = box(0.02, 0.02, 0.12, M.black, 0.21, 0.85, -0.1, DESK);
// Keyboard
const kbd = box(0.4, 0.03, 0.13, new THREE.MeshStandardMaterial({color:0xeae0c8, roughness:0.7}),
  0.1, 0.795, 0.2, DESK);
// Mouse
const mouse = box(0.06, 0.025, 0.09, new THREE.MeshStandardMaterial({color:0xeae0c8, roughness:0.7}),
  0.4, 0.793, 0.2, DESK);
// Desk lamp
const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.03,16), M.metalDark);
lampBase.position.set(-0.6, 0.795, -0.2); DESK.add(lampBase);
const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.3,8), M.metalDark);
lampArm.position.set(-0.6, 0.95, -0.2); DESK.add(lampArm);
const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.12, 16, 1, true),
  new THREE.MeshStandardMaterial({color:0x222, roughness:0.5, side:THREE.DoubleSide}));
lampHead.position.set(-0.6, 1.12, -0.2); lampHead.rotation.x = 0.4; DESK.add(lampHead);
// Answering machine
const ans = box(0.18, 0.06, 0.12, M.black, -0.3, 0.81, 0.2, DESK);
const blink = new THREE.Mesh(new THREE.SphereGeometry(0.01,8,6),
  new THREE.MeshStandardMaterial({color:0xff2a2a, emissive:0xff2a2a, emissiveIntensity:1}));
blink.position.set(-0.25, 0.85, 0.21); DESK.add(blink);

/* ---------- Bookshelf next to TV (with Superman figure) ---------- */
const shelf = new THREE.Group(); root.add(shelf);
shelf.position.set(-APT.W/2 + 0.4, 0, 0.6);
const shelfCase = box(0.4, 2.3, 1.2, M.wood, 0, 1.15, 0, shelf, true);
// shelves
for (let i=1; i<=4; i++){
  box(0.4, 0.03, 1.15, M.woodLight, 0, i*0.5, 0, shelf);
}
// books
for (let i=0;i<22;i++){
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.04+Math.random()*0.02, 0.22, 0.16),
    new THREE.MeshStandardMaterial({color:`hsl(${rand(0,360)|0},${rand(30,60)|0}%,${rand(20,40)|0}%)`, roughness:0.7}));
  b.position.set(0.05, 0.62, -0.5 + i*0.05); shelf.add(b);
}
for (let i=0;i<18;i++){
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.04+Math.random()*0.02, 0.22, 0.16),
    new THREE.MeshStandardMaterial({color:`hsl(${rand(0,360)|0},${rand(30,60)|0}%,${rand(20,40)|0}%)`, roughness:0.7}));
  b.position.set(0.05, 1.12, -0.4 + i*0.05); shelf.add(b);
}

// Superman figurine on top middle shelf
function supermanFigure(){
  const g = new THREE.Group();
  // base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.08,0.025,16),
    new THREE.MeshStandardMaterial({color:0xc9a64a, metalness:0.6, roughness:0.4}));
  base.position.y = 0.012; g.add(base);
  // body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.05,0.18,12),
    new THREE.MeshStandardMaterial({color:0x174ea6, roughness:0.6}));
  body.position.y = 0.11; g.add(body);
  // cape
  const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.13,0.18),
    new THREE.MeshStandardMaterial({color:0xc7242a, roughness:0.7, side:THREE.DoubleSide}));
  cape.position.set(0, 0.11, -0.04); cape.rotation.x = -0.2; g.add(cape);
  // head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12),
    new THREE.MeshStandardMaterial({color:0xf2d2b0, roughness:0.55}));
  head.position.y = 0.235; g.add(head);
  // chest S
  const s = new THREE.Mesh(new THREE.PlaneGeometry(0.06,0.06),
    new THREE.MeshStandardMaterial({map: supermanMag, roughness:0.5, transparent:true}));
  s.position.set(0, 0.13, 0.05); g.add(s);
  // arms
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.13,8),
    new THREE.MeshStandardMaterial({color:0x174ea6, roughness:0.6}));
  arm.position.set(-0.055,0.13,0.02); arm.rotation.z = 0.3; g.add(arm);
  const arm2 = arm.clone(); arm2.position.x = 0.055; arm2.rotation.z = -0.3; g.add(arm2);
  return g;
}
const supes = supermanFigure();
supes.position.set(0.05, 1.66, 0); shelf.add(supes);

/* ---------- Dining nook (behind couch) ---------- */
const DIN = new THREE.Group(); root.add(DIN);
DIN.position.set(3.0, 0, -1.5);
// Round wood/metal dining table
const dineTop = new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.04,32), M.wood);
dineTop.position.y = 0.73; DIN.add(dineTop); addCollider(dineTop);
const dineCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.7,12), M.metalDark);
dineCenter.position.y = 0.36; DIN.add(dineCenter);
const dineBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.025,16), M.metalDark);
dineBase.position.y = 0.012; DIN.add(dineBase);

function diningChair(angle){
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.38,0.04,0.38),
    new THREE.MeshStandardMaterial({color:0x4a3220, roughness:0.6}));
  seat.position.y = 0.45; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.38,0.5,0.04),
    new THREE.MeshStandardMaterial({color:0x4a3220, roughness:0.6}));
  back.position.set(0, 0.7, -0.17); g.add(back);
  for (const [x,z] of [[-0.16,-0.16],[0.16,-0.16],[-0.16,0.16],[0.16,0.16]]){
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.03,0.45,0.03), M.metalDark);
    leg.position.set(x,0.225,z); g.add(leg);
  }
  g.position.set(Math.cos(angle)*0.95, 0, Math.sin(angle)*0.95);
  g.rotation.y = -angle + Math.PI/2;
  g.traverse(o=>o.castShadow=true);
  return g;
}
for (let i=0;i<3;i++) DIN.add(diningChair(i * (Math.PI*2/3) + 0.5));

/* ---------- Bicycle hanging on west wall (rear) ---------- */
function bicycle(){
  const g = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({color:0x4ea24a, roughness:0.4, metalness:0.3});
  // two wheels
  function wheel(x){
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 12, 32), M.black);
    t.position.x = x; g.add(t);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.012, 8, 32), M.metalChrome);
    rim.position.x = x; g.add(rim);
    for (let i=0;i<10;i++){
      const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,0.55,4), M.metalChrome);
      sp.rotation.z = (i/10)*Math.PI; sp.position.x = x; g.add(sp);
    }
  }
  wheel(-0.5); wheel(0.5);
  // frame triangles
  function bar(p1,p2,r=0.022){
    const dir = new THREE.Vector3().subVectors(p2,p1);
    const len = dir.length();
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,10), frameMat);
    cyl.position.copy(p1).add(dir.clone().multiplyScalar(0.5));
    cyl.lookAt(p2); cyl.rotateX(Math.PI/2);
    g.add(cyl);
  }
  const A=new THREE.Vector3(-0.5,0,0), B=new THREE.Vector3(0.5,0,0);
  const C=new THREE.Vector3(0.15,0.35,0), D=new THREE.Vector3(-0.15,0.35,0);
  bar(A,D); bar(B,C); bar(C,D); bar(A,C); bar(D,B);
  // handlebar/seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.18,0.04,0.08), M.black);
  seat.position.set(-0.18,0.45,0); g.add(seat);
  const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.32,10), M.metalChrome);
  hb.rotation.z = Math.PI/2; hb.position.set(0.18,0.42,0); g.add(hb);
  return g;
}
const bike = bicycle();
bike.position.set(-APT.W/2 + 0.12, 1.6, -2.3);
bike.rotation.y = Math.PI/2;
root.add(bike);
// mount bracket
const bracket = box(0.05, 0.06, 1.1, M.metalDark, -APT.W/2 + 0.08, 1.85, -2.3);

/* ---------- Wall art / posters ---------- */
function poster(tex, x,y,z, w=0.6, h=0.85, ry=0){
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w+0.05, h+0.05, 0.03), M.black);
  frame.position.set(x,y,z); frame.rotation.y = ry; root.add(frame);
  const img = new THREE.Mesh(new THREE.PlaneGeometry(w,h),
    new THREE.MeshStandardMaterial({map: tex, roughness: 0.7}));
  img.position.set(x,y,z); img.rotation.y = ry;
  // shift forward along normal
  const n = new THREE.Vector3(0,0,1).applyEuler(new THREE.Euler(0,ry,0)).multiplyScalar(0.02);
  img.position.add(n); root.add(img);
}

// King Kong style poster (original lookalike)
const kongTex = makeCanvasTex(512,720,(ctx,w,h)=>{
  ctx.fillStyle='#1a0a0a'; ctx.fillRect(0,0,w,h);
  // skyline
  ctx.fillStyle='#0a0a14';
  for (let i=0;i<14;i++){
    const bh = rand(120,260); ctx.fillRect(i*37, h-100-bh, 36, bh);
  }
  ctx.fillStyle='#3a2210'; ctx.fillRect(0,h-100,w,100);
  // giant ape silhouette
  ctx.fillStyle='#0d0d0d';
  ctx.beginPath();
  ctx.ellipse(w/2, h*0.45, 130, 180, 0, 0, 6.28); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w/2-100, h*0.55, 80, 50, 0.3, 0, 6.28); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w/2+100, h*0.55, 80, 50, -0.3, 0, 6.28); ctx.fill();
  // moon
  ctx.fillStyle='#f8e8a8'; ctx.beginPath(); ctx.arc(w*0.78, h*0.18, 50, 0, 6.28); ctx.fill();
  // title
  ctx.fillStyle='#e8c020'; ctx.font='bold 92px serif'; ctx.textAlign='center';
  ctx.fillText('THE GIANT', w/2, 100);
  ctx.font='bold 52px serif'; ctx.fillText('— A MONSTER FILM —', w/2, h-40);
});
poster(kongTex, 0.5, 1.7, -APT.D/2 + 0.09, 0.65, 0.9, 0);

// Generic mid-century art poster #2
const art2 = makeCanvasTex(512,400,(ctx,w,h)=>{
  ctx.fillStyle='#e8d8b8'; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#c54a2a'; ctx.fillRect(40,40,200,320);
  ctx.fillStyle='#2a8aa8'; ctx.fillRect(260,40,200,160);
  ctx.fillStyle='#e8b820'; ctx.fillRect(260,210,200,150);
  ctx.fillStyle='#2a2a2a'; ctx.font='bold 38px sans-serif'; ctx.textAlign='center';
  ctx.fillText('FORMS & COLOR', w/2, h-20);
});
poster(art2, -1.6, 1.85, -APT.D/2+0.09, 0.7, 0.55, 0);

// NYC photo style
const nycTex = makeCanvasTex(512,360,(ctx,w,h)=>{
  ctx.fillStyle='#aab4c0'; ctx.fillRect(0,0,w,h);
  // skyscrapers
  ctx.fillStyle='#4a505a';
  for (let i=0;i<20;i++){
    const bh = rand(80,260); ctx.fillRect(i*26, h-bh, 25, bh);
    ctx.fillStyle = '#5a606a';
    for (let y=h-bh+10; y<h-10; y+=12){
      for (let x=i*26+3; x<i*26+22; x+=6){
        if (Math.random()<0.6) ctx.fillRect(x,y,3,5);
      }
    }
    ctx.fillStyle = '#4a505a';
  }
  ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.font='bold 22px sans-serif';
  ctx.textAlign='center'; ctx.fillText('MANHATTAN', w/2, 30);
});
poster(nycTex, 4.0, 1.75, -APT.D/2+0.09, 0.65, 0.46);

// Above the couch
const art3 = makeCanvasTex(512,300,(ctx,w,h)=>{
  ctx.fillStyle='#f4ead2'; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#3a2a14'; ctx.lineWidth=4;
  ctx.strokeRect(20,20,w-40,h-40);
  ctx.fillStyle='#3a2a14'; ctx.font='italic 36px serif'; ctx.textAlign='center';
  ctx.fillText('"What\'s the deal', w/2, 110);
  ctx.fillText('with airline food?"', w/2, 160);
  ctx.font='20px serif'; ctx.fillText('— a comedian, 1992', w/2, 220);
});
poster(art3, -2.0, 2.05, -APT.D/2+0.09, 0.8, 0.45);

/* ---------- Hallway transition (visible into west opening) ---------- */
const hall = new THREE.Group(); root.add(hall);
hall.position.set(-APT.W/2 - 0.5, 0, 0);
// hallway end wall (faux)
box(0.1, hallH, 1.8, M.wall, 0, hallH/2, 0, hall);
// hall floor extension
box(1.2, 0.04, 1.4, M.floor, -0.5, 0.02, 0, hall);

/* ---------- Subtle plant in corner ---------- */
const plant = new THREE.Group(); root.add(plant);
plant.position.set(APT.W/2 - 0.6, 0, -APT.D/2 + 0.6);
const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.16,0.3,16),
  new THREE.MeshStandardMaterial({color:0x6a3a1a, roughness:0.8}));
pot.position.y = 0.15; plant.add(pot);
for (let i=0;i<14;i++){
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.6, 6),
    new THREE.MeshStandardMaterial({color:`hsl(${rand(95,135)|0},${rand(40,60)|0}%,${rand(25,40)|0}%)`, roughness:0.7}));
  leaf.position.set(rand(-0.1,0.1), 0.55+rand(-0.1,0.1), rand(-0.1,0.1));
  leaf.rotation.set(rand(-0.6,0.6), rand(0,6.28), rand(-0.6,0.6));
  plant.add(leaf);
}

/* ---------- Add general collisions for walls (already added) ---------- */

// --- Movement & collisions ------------------------------------
const keys = {};
addEventListener('keydown', e => keys[e.code]=true);
addEventListener('keyup',   e => keys[e.code]=false);

const velocity = new THREE.Vector3();
const dir = new THREE.Vector3();
const playerSize = 0.35;

function tryMove(delta){
  const speed = (keys['ShiftLeft']||keys['ShiftRight'] ? 4.0 : 2.4) * delta;
  dir.set(0,0,0);
  if (keys['KeyW']) dir.z -= 1;
  if (keys['KeyS']) dir.z += 1;
  if (keys['KeyA']) dir.x -= 1;
  if (keys['KeyD']) dir.x += 1;
  if (dir.lengthSq()===0) return;
  dir.normalize();
  // movement relative to camera yaw
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward); forward.y=0; forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0,1,0)).normalize();
  const move = new THREE.Vector3()
    .addScaledVector(forward, -dir.z * speed)
    .addScaledVector(right,    dir.x * speed);

  // axis-separated collision check
  const pos = camera.position.clone();
  // X
  const tryX = pos.clone(); tryX.x += move.x;
  if (!hits(tryX)) camera.position.x = tryX.x;
  // Z
  const tryZ = camera.position.clone(); tryZ.z += move.z;
  if (!hits(tryZ)) camera.position.z = tryZ.z;
  // keep eye height
  camera.position.y = 1.65;
}
function hits(pos){
  const bb = new THREE.Box3(
    new THREE.Vector3(pos.x-playerSize, 0.1, pos.z-playerSize),
    new THREE.Vector3(pos.x+playerSize, 1.8, pos.z+playerSize)
  );
  // outer hull constraint (inside apartment)
  if (Math.abs(pos.x) > APT.W/2 - 0.4) {
    // allow hallway region (west, |z|<hallW/2)
    if (!(pos.x < -APT.W/2 && Math.abs(pos.z) < 0.6 && pos.x > -APT.W/2 - 1.2)) return true;
  }
  if (Math.abs(pos.z) > APT.D/2 - 0.4) return true;
  for (const c of colliders){ if (c.intersectsBox(bb)) return true; }
  return false;
}

// --- HUD wiring -----------------------------------------------
const overlay   = document.getElementById('overlay');
const crosshair = document.getElementById('crosshair');
const btnWalk   = document.getElementById('btnWalk');
const btnInspect= document.getElementById('btnInspect');

function setMode(m){
  mode = m;
  btnWalk.classList.toggle('active', m==='walk');
  btnInspect.classList.toggle('active', m==='inspect');
  orbit.enabled = (m==='inspect');
  if (m==='walk') {
    crosshair.classList.add('active');
    overlay.classList.remove('hidden'); // require click to lock
  } else {
    crosshair.classList.remove('active');
    overlay.classList.add('hidden');
    plControls.unlock();
  }
}
btnWalk.onclick   = () => setMode('walk');
btnInspect.onclick= () => setMode('inspect');

overlay.addEventListener('click', () => {
  if (mode==='walk') plControls.lock();
});
plControls.addEventListener('lock', ()=> overlay.classList.add('hidden'));
plControls.addEventListener('unlock', ()=> { if (mode==='walk') overlay.classList.remove('hidden'); });

// --- Resize ---------------------------------------------------
addEventListener('resize', ()=>{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
  inspectCam.aspect = camera.aspect; inspectCam.updateProjectionMatrix();
});

// --- Animation loop -------------------------------------------
const clock = new THREE.Clock();
function loop(){
  const dt = Math.min(clock.getDelta(), 0.05);
  if (mode==='walk' && plControls.isLocked) tryMove(dt);
  // soft tv flicker
  screen.material.emissiveIntensity = 0.55 + Math.sin(performance.now()*0.004)*0.07;
  if (mode==='inspect') orbit.update();
  renderer.render(scene, mode==='walk' ? camera : inspectCam);
  requestAnimationFrame(loop);
}
loop();
setMode('walk');
