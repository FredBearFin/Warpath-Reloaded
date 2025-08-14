# Warpath: Reloaded (Production Refactor)

A modern, modular refactor of the original single-file canvas game. This version focuses on **clean architecture**, **top-tier performance (Chromebook-friendly)**, and **great DX**. It’s ready to push to GitHub and deploy to Netlify.

## Quick Start

```bash
# 1) Install
npm i

# 2) Run dev server (hot reload)
npm run dev

# 3) Build for production
npm run build

# 4) Preview production build
npm run preview
```

## Deploy to Netlify

- Connect the repo on Netlify
- Build command: `npm run build`
- Publish directory: `dist/`
- (Already included) `netlify.toml` contains sane defaults

## Controls

- **Mouse Left/Right Click**: Drop selected bomb (inside the center lane)
- **Mouse Wheel**: Cycle bomb type (Micro / Standard / Heavy)
- **Space**: Deploy drones (`Assault` wave)
- **Shift + Space**: Deploy drones (`Scout` wave)

## What’s New Architecturally

### Goals Met
- **Separation of concerns**: rendering, input, UI, and game state live in clear modules.
- **Stable simulation**: fixed-timestep engine (60 Hz) decoupled from rendering for consistent physics.
- **Fast neighbor search**: spatial grid slashes flocking cost from O(N²) toward O(N).
- **Low-GC**: math uses in-place ops; minimal transient allocations in hot paths.
- **UI throttling**: DOM updates capped at 10 FPS to avoid layout trashing.
- **DPR-safe rendering**: resize logic resets transforms correctly; game looks crisp on any display.

### File Layout

```
warpath-reloaded/
├─ index.html                # entry
├─ styles/
│  └─ styles.css             # all CSS
├─ src/
│  ├─ main.js                # bootstrap + wiring
│  ├─ constants.js           # game constants (one source of truth)
│  ├─ core/
│  │  ├─ Engine.js           # requestAnimationFrame loop + fixed timestep + resize
│  │  ├─ Math.js             # Vec2
│  │  └─ SpatialGrid.js      # O(N) neighbor queries (flocking/explosions)
│  ├─ render/
│  │  └─ Renderer.js         # all canvas drawing
│  ├─ ui/
│  │  └─ ui.js               # HUD + end modal + throttled updates
│  ├─ input/
│  │  └─ Input.js            # mouse/keyboard abstraction
│  └─ game/
│     ├─ Game.js             # game state & rules
│     ├─ Player.js           # player & simple AI
│     ├─ Drone.js            # boids with grid-based neighbors
│     └─ Bomb.js             # timed AoE using grid circle-query
├─ package.json              # Vite for DX
├─ vite.config.js
├─ netlify.toml
└─ .gitignore
```

## Why This Structure

- **Engine-first**: Central timing + resize control makes it trivial to add pause, time scaling, replays, etc.
- **Core vs Game vs Render**: Keeps domain logic testable and UI-agnostic. Rendering is a pure consumer of game state.
- **Data locality**: Spatial grid + per-drone accumulators reduce cache misses and JS engine churn.
- **One constants file**: Prevents drift and makes tuning easy for designers.
- **Pure ESM**: No framework or heavy runtime; Vite only improves DX and bundles for prod.

## Performance Notes

- **Fixed Timestep**: Simulation runs at consistent 60Hz steps (`FIXED_DT`), smoothing out browser frame jitter.
- **Spatial Grid**: Flocking and bomb queries only touch nearby units, handling hundreds of drones on low-end devices.
- **Batching**: Renderer minimizes style switches (draw P1 drones then P2) and avoids per-frame dash churn.
- **DOM Throttle**: HUD updates at 10 FPS—visually identical, much cheaper.
- **No unnecessary allocations** in inner loops—reused vectors and scalars cut GC spikes.

## Extensibility

- **Units & Systems**: Add new entity types (e.g., turrets, power-ups) without touching core engine or renderer patterns.
- **Difficulty & Modes**: Tweak `constants.js`, or add a `GameMode` wrapper that injects different rules.
- **Online Play (Roadmap)**:
  - Phase 1: **Spectator or async score challenges** (no sync issues).
  - Phase 2: **Authoritative server** (Node + websockets). Send **inputs only**, not world state. Server runs the same fixed-timestep sim and broadcasts snapshots.
  - Phase 3: **Client-side prediction + reconciliation** or **lockstep** with lag compensation. Keep all randomness seeded per match; avoid floating deltas that desync.

## Architectural Differences vs Prototype

| Area | Prototype | Refactor |
|---|---|---|
| Game Loop | `requestAnimationFrame` with variable dt | Fixed-step sim + rAF render |
| Flocking | O(N²) naive | SpatialGrid neighbors ~O(N) |
| Rendering | Logic + draw interleaved | Renderer consumes immutable snapshot each frame |
| UI | Updated every frame | Throttled, centralized in `ui/ui.js` |
| Constants | Scattered | `src/constants.js` |
| Input | Inline listeners | `src/input/Input.js` |
| Separation | All-in-one file | Clear, testable modules |

## Testing / Linting (Optional Add-ons)

- Integrate **ESLint + Prettier** for code-quality gates
- Add **Vitest** for unit tests (Vec2, SpatialGrid, simple game rules)
- GitHub Actions for CI to run lint/test/build on PRs

---

© 2025 Warpath Team. MIT Licensed.
