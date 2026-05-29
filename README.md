# Apt 5A — A Three.js Recreation of Jerry's Apartment

An interactive 3D web app recreating the most consistently documented elements of
Jerry Seinfeld's filmed apartment set from *Seinfeld* (Apt 5A, 129 W 81st St).
Built with vanilla **Three.js** modules — no build step required.

> ⚠️ **About the layout:** This is a recreation of a **filmed TV set**, not a real
> apartment. The Seinfeld set was famously *architecturally impossible* — the
> hallway leads back into the kitchen wall, and proportions were tweaked for camera
> coverage. We prioritize **visual faithfulness to the set** over real-world logic.

## ✨ Features

- **Two camera modes** — switch via the HUD top-left:
  - **Walk Mode**: pointer-lock FPS controls (WASD + mouse look, Shift to run, Esc to release)
  - **Inspect Mode**: orbit camera (drag to rotate, scroll to zoom, right-drag to pan)
- **Walk-mode crosshair**, hidden during inspect
- **AABB collisions** so you can't walk through couches, the fridge, counters, or walls
- **Layered warm lighting**: hemisphere fill + ambient + warm directional "window" key
  + several practical point lights (kitchen, living room, dining, desk lamp)
- **ACES Filmic tone mapping** with sRGB output for a natural sitcom-interior feel
- **Procedural canvas textures** for cereal boxes, fridge magnets, posters, the
  5A door plaque, blinds, and the floor — no copyrighted assets used
- **Subtle wear**: door scuffs, floor grain, wall imperfections, mug rings on the
  coffee table

## 🏠 Recreated set details

Based on widely documented recurring set elements:

- **Front door labeled 5A** with worn brass knob and scuffed panel
- **Turquoise couch** (the iconic Season 3+ piece) with matching armchair
- **Wooden coffee table** with magazine stack and coffee mug
- **TV stand** with glowing CRT screen and VHS shelf
- **Desk alcove** with vintage Mac-style computer + answering machine
- **Kitchen** with green upper cabinets, cereal boxes prominently lining the
  shelves above the sink, glass-door cabinet, peninsula counter
- **Blue counter stools**, fruit bowl, red kettle on stove
- **Fridge** with original lookalike magnets (Superman diamond, vintage racing,
  burger, racing-school tag) and cow/cat pot holders on the side
- **Round dining table** with 3 chairs behind the couch
- **Hanging green bicycle** on the rear (west) wall
- **Bookshelf** holding a **Superman figurine** in classic blue/red
- **Window with blinds** above the desk
- **Wall art** including a "Giant Monster Film" King-Kong-style poster (original
  lookalike), a New York skyline print, a mid-century color-block piece, and a
  framed quote

## 🚀 Running locally

This is an **ES module** project. You need to serve the files over HTTP — opening
`index.html` directly via `file://` will fail because of module + CORS rules.

Any of these works:

```bash
# Python 3
python -m http.server 8080

# Node
npx serve .
# or
npx http-server -p 8080
```

Then open <http://localhost:8080> in a modern browser (Chrome, Edge, Firefox,
Safari 16+).

That's it — no `npm install`, no bundler. The Three.js library loads from a CDN
via the `<script type="importmap">` declared in `index.html`.

## 🎮 Controls

| Mode | Action | Keys |
|---|---|---|
| Walk | Look around | Move mouse (after clicking to lock) |
| Walk | Move | `W` `A` `S` `D` |
| Walk | Run | `Shift` |
| Walk | Release pointer | `Esc` |
| Inspect | Orbit | Left-drag |
| Inspect | Pan | Right-drag |
| Inspect | Zoom | Scroll wheel |

Switch modes any time with the **Walk Mode** / **Inspect Mode** buttons in the
top-left HUD.

## 🛠️ Tech

- Three.js 0.165 (modules via CDN)
- `PointerLockControls` and `OrbitControls` from Three.js examples
- `ACESFilmicToneMapping`, `PCFSoftShadowMap`, `sRGBColorSpace`
- All textures generated procedurally at runtime via `CanvasTexture`

## 📁 File layout

```
.
├── index.html   # entry point + HUD overlay + importmap
├── style.css    # HUD, crosshair, overlay styling
├── main.js      # scene, lights, models, controls, loop
└── README.md    # this file
```

## ⚖️ Notes on intellectual property

All textures (cereal-box labels, posters, fridge magnets, the Superman figure's
chest emblem, the door plaque) are **original procedural recreations** drawn at
runtime in 2D canvas. No copyrighted imagery from the show or its merchandising
is shipped or fetched.

## 🐛 Known cosmetic quirks

- The hallway intentionally dead-ends into a faux wall — true to the show's
  impossible architecture.
- The bedroom and bathroom are referenced but not modeled inside; the hallway
  hints at them.
- The TV "channel" is a procedural static pattern, not playable footage.

Enjoy the apartment. *What's the deal with virtual reality?* 🥨
