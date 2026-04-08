<div align="center">

<svg width="640" height="120" viewBox="0 0 640 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ug" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="640" height="120" rx="12" fill="#050a1a"/>
  <text x="320" y="78" text-anchor="middle"
    font-family="'Segoe UI', Arial, sans-serif"
    font-size="62" font-weight="800" letter-spacing="5"
    fill="url(#ug)" filter="url(#glow)">ULTRAMAN</text>
</svg>

**Mega Man-Style Browser Platformer**

![JavaScript](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?style=flat-square&logo=html5&logoColor=white)
![Web Audio](https://img.shields.io/badge/Web-Audio%20API-blueviolet?style=flat-square)
![No Framework](https://img.shields.io/badge/No%20Framework-zero%20deps-green?style=flat-square)

</div>

---

Ultraman is a Mega Man-inspired side-scrolling action platformer that runs entirely in the browser. No framework, no game engine — just vanilla JavaScript ES modules, HTML5 Canvas, and the Web Audio API. Pixel art sprites are defined as 2D arrays in code and cached to offscreen canvases at runtime.

## Gameplay

- Side-scrolling platformer with classic Mega Man mechanics
- Variable-height jumping, ladder climbing, and Mega Buster shooting
- **Stage select screen** — choose your boss order
- **Defeat bosses, gain their weapon** — circular weakness chain between bosses
- Lives system, health bars, and game over / continue flow

## Bosses

| Boss | Weakness | Weapon gained |
|---|---|---|
| Blade Samurai | Storm King's weapon | Blade weapon |
| Flame Knight | Blade Samurai's weapon | Flame weapon |
| Frost Sentinel | Flame Knight's weapon | Frost weapon |
| Hydro Master | Frost Sentinel's weapon | Hydro weapon |
| Storm King | Hydro Master's weapon | Storm weapon |
| Castle Boss | — | — |
| Final Boss | — | — |

## Tech

- **Rendering** — HTML5 Canvas 2D, pixel art sprites as code-defined 2D arrays
- **Audio** — Web Audio API with synthesised retro sound effects
- **Physics** — custom gravity, collision detection, and movement
- **Architecture** — scene graph (TitleScreen → StageSelect → Gameplay → GameOver)

## Structure

```
Ultraman/
├── index.html
├── editor.html         # Sprite / level editor
├── js/
│   ├── main.js         # Entry point
│   ├── game.js         # Game loop
│   ├── constants.js    # Game constants
│   ├── core/           # Camera, collision, input, audio, utils
│   ├── entities/       # Player, enemies, bosses, projectiles, pickups
│   ├── graphics/       # Sprite rendering, pixel art definitions
│   ├── levels/         # Tile maps, stage data
│   └── scenes/         # Title, StageSelect, Gameplay, GameOver, etc.
└── css/
    └── style.css
```

## Running

No build step needed — open `index.html` in any modern browser, or serve locally:

```bash
npx serve .
# or
python3 -m http.server 8080
```
