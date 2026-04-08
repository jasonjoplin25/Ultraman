# Ultraman: Mega Man-Style Platformer - Implementation Plan

## Context

Building a side-scrolling action platformer inspired by Mega Man (NES, 1987) using JavaScript + HTML5 Canvas. The game features 4 Robot Master bosses, pixel art sprites defined in code, tile-based levels, and the classic Mega Man gameplay loop: stage select, play stage, defeat boss, gain weapon, repeat.

**Tech**: Vanilla JavaScript ES modules + HTML5 Canvas (no frameworks, runs in browser)
**Bosses**: 4 Robot Masters with unique weapons and circular weakness chain
**Art**: Pixel art sprites defined as 2D arrays in code (cached to offscreen canvases)
**Audio**: Web Audio API with synthesized retro sound effects

---

## Game Design Summary

### Core Mechanics
- Side-scrolling movement (walk speed ~2.5 px/frame, instant acceleration)
- Variable-height jumping (initial velocity -8, gravity 0.4 px/frame², max fall 12)
- Ladder climbing (1.5 px/frame, no jumping while climbing)
- Mega Buster shooting (horizontal, max 3 projectiles on screen, 6 px/frame)
- No sliding (faithful to MM1)

### 4 Robot Masters & Weakness Chain
| Boss | Weapon Gained | Weak To |
|------|--------------|---------|
| Flame Knight | Flame Wave (ground fire) | Ice Shard |
| Frost Sentinel | Ice Shard (straight shot, freezes) | Thunder Strike |
| Thunder Falcon | Thunder Strike (vertical bolt) | Razor Blade |
| Blade Samurai | Razor Blade (boomerang arc) | Flame Wave |

### Game Flow
```
Title Screen → Stage Select (4 bosses) → Play Stage → Boss Fight →
Get Weapon → Stage Select → [all 4 done] → Castle Stage 1 →
Castle Stage 2 (Boss Rush + Final Boss) → Credits
```

### Combat
- Player HP: 28, Boss HP: 28 (vertical health bars)
- Invincibility frames: 90 frames (1.5 sec) with flicker
- Knockback on hit
- Buster does 1 damage, weakness weapon does 3 damage

### Enemies
- **Met**: Hides under helmet (invulnerable), pops up to shoot 3-way spread
- **Jumper**: Hops in arcs toward player
- **Turret**: Stationary, fires every 2 seconds toward player
- **Flyer**: Sine-wave flight, periodic dives

### Platforming Elements
- Moving platforms, spikes (instant death), bottomless pits
- Ladders, disappearing blocks, checkpoints

### Items/Pickups
- Small HP (+2), Large HP (+10), Small weapon energy (+2), Large weapon energy (+10), 1-Up

### Lives System
- Start with 3 lives, unlimited continues
- Death respawns at checkpoint, weapon energy fully restored
- Game Over offers Continue (restart stage) or Stage Select

---

## File Structure

```
/home/jason/Ultraman/
├── index.html                     # Entry point, canvas, loads main.js
├── css/
│   └── style.css                  # Center canvas, black bg, pixelated rendering
├── js/
│   ├── main.js                    # Bootstrap: create Game, start loop
│   ├── game.js                    # Game class: fixed-timestep loop, scene management
│   ├── constants.js               # All magic numbers: physics, sizes, colors
│   ├── core/
│   │   ├── input.js               # Keyboard input (held, justPressed, justReleased)
│   │   ├── camera.js              # Follow player, clamp to level bounds, screen shake
│   │   ├── collision.js           # AABB overlap + axis-separated tile resolution
│   │   ├── audio.js               # Web Audio API synthesized sound effects
│   │   └── utils.js               # clamp, lerp, rectOverlap helpers
│   ├── graphics/
│   │   ├── renderer.js            # Pixel-art-to-canvas drawing, offscreen caching
│   │   ├── sprite-data.js         # All sprite pixel arrays (player, enemies, tiles)
│   │   ├── sprite.js              # Sprite class: animation frame selection, drawing
│   │   ├── animations.js          # Animation definitions (frames, timing, loops)
│   │   ├── effects.js             # Flicker, screen shake, explosions, particles
│   │   └── hud.js                 # Health bars, lives counter, weapon indicator
│   ├── entities/
│   │   ├── entity.js              # Base Entity (pos, vel, size, active, update, draw)
│   │   ├── player.js              # Player: movement, jumping, shooting, weapons, HP
│   │   ├── projectile.js          # Projectile base + weapon-specific types
│   │   ├── pickup.js              # Health pellets, weapon energy, 1-ups
│   │   ├── enemies/
│   │   │   ├── enemy.js           # Base Enemy (HP, contact damage, drops, activation)
│   │   │   ├── met.js             # Met AI: hide/pop-up/shoot
│   │   │   ├── jumper.js          # Jumper AI: hopping arcs
│   │   │   ├── turret.js          # Turret AI: periodic aimed shots
│   │   │   └── flyer.js           # Flyer AI: sine-wave + dive
│   │   └── bosses/
│   │       ├── boss.js            # Base Boss (HP bar, phases, weakness, defeat seq)
│   │       ├── flame-knight.js    # Jump + flame wave, fire pillar phase 2
│   │       ├── frost-sentinel.js  # Slide + ice shards, falling ice phase 2
│   │       ├── thunder-falcon.js  # Fly + lightning bolts, fast dive phase 2
│   │       ├── blade-samurai.js   # Dash + boomerang blades, counter phase 2
│   │       └── final-boss.js      # Multi-phase final boss
│   ├── levels/
│   │   ├── level-loader.js        # Parse stage data, build tile grid, spawn entities
│   │   ├── tile.js                # Tile types and properties
│   │   ├── platform.js            # Moving platform logic
│   │   ├── disappearing-block.js  # Timed appear/disappear blocks
│   │   └── stage-data/
│   │       ├── stage-flame.js     # Flame Knight stage
│   │       ├── stage-frost.js     # Frost Sentinel stage
│   │       ├── stage-thunder.js   # Thunder Falcon stage
│   │       ├── stage-blade.js     # Blade Samurai stage
│   │       ├── stage-castle1.js   # Final castle stage 1
│   │       └── stage-castle2.js   # Castle stage 2 (boss rush + final boss)
│   └── scenes/
│       ├── scene.js               # Base Scene (enter, exit, update, draw)
│       ├── title-screen.js        # Logo + "PRESS START"
│       ├── stage-select.js        # 4 boss portraits, cursor, selection
│       ├── gameplay.js            # Main gameplay: level, entities, camera, HUD
│       ├── weapon-get.js          # Weapon acquisition screen
│       ├── game-over.js           # Game over + continue option
│       ├── pause-menu.js          # Weapon select overlay
│       └── credits.js             # End credits scroll
```

---

## Architecture Details

### Game Loop (Fixed Timestep)
- 60 FPS fixed update step (16.667ms) for deterministic physics
- Variable render rate via requestAnimationFrame
- Accumulator pattern: physics runs in fixed steps, render interpolates

### Scene-Based State Machine
Each game state (title, stage select, gameplay, pause, game over) is a Scene object with `enter()`, `exit()`, `update()`, `draw()`. Game class only talks to `currentScene`.

### Entity System
All game objects inherit from base Entity (pos, vel, size, active flag). Gameplay scene maintains arrays: player, enemies[], projectiles[], pickups[], platforms[].

### Collision Detection
- **Tile collision**: Axis-separated resolution (move X, resolve X, move Y, resolve Y)
- **Entity-entity**: AABB rectangle overlap tests

### Sprite System
- Sprites defined as 2D arrays of palette indices (index 0 = transparent)
- Cached to offscreen canvases on first use for performance
- Palette swapping for weapon color changes (just swap the palette array)

### Level Data Format
Tile maps use single-character strings for readability:
```javascript
const layout = `
................
....B...........
...BBB..L.......
BBBBBBBBBBBBBBBB
`;
// Parser: '.' → air, 'B' → solid, 'L' → ladder, 'S' → spike, etc.
```

### Enemy Activation Zones
Enemies only update when within ~1.5 screen widths of camera. Respawn when scrolled off-screen and back (faithful to Mega Man behavior).

---

## Phased Implementation

### Phase 1: Foundation (Playable character on screen)
**Goal**: Player moves, jumps, shoots on a test screen with ground tiles.

**Create**: index.html, style.css, main.js, game.js, constants.js, core/input.js, core/collision.js, core/utils.js, graphics/renderer.js, graphics/sprite-data.js, graphics/sprite.js, graphics/animations.js, entities/entity.js, entities/player.js, entities/projectile.js, levels/tile.js, scenes/scene.js, scenes/gameplay.js

**Test**: Arrow keys move, Z jumps (variable height), X shoots (max 3 pellets), player collides with ground/platforms.

### Phase 2: Level System + Camera
**Goal**: Scrolling multi-screen level with ladders, spikes, pits, moving platforms, disappearing blocks.

**Create**: core/camera.js, levels/level-loader.js, levels/stage-data/stage-flame.js, levels/platform.js, levels/disappearing-block.js

**Modify**: gameplay.js (camera, level loading, death/respawn), player.js (ladder climbing, death state), sprite-data.js (tile sprites)

**Test**: Traverse multi-screen level, camera scrolls, ladders work, spikes/pits kill, checkpoints work.

### Phase 3: Enemies + Combat
**Goal**: Enemies with AI, player takes/deals damage, health system, pickups, HUD.

**Create**: enemies/enemy.js, enemies/met.js, enemies/jumper.js, enemies/turret.js, enemies/flyer.js, entities/pickup.js, graphics/hud.js, graphics/effects.js

**Modify**: player.js (HP, damage, i-frames, knockback), gameplay.js (enemy spawning, collisions, HUD), sprite-data.js (enemy/pickup sprites)

**Test**: Verify all 4 enemy types, damage in both directions, pickups restore health, death/respawn with lives.

### Phase 4: Boss Fights
**Goal**: 4 boss fights with unique patterns, weakness system, weapon acquisition.

**Create**: bosses/boss.js, bosses/flame-knight.js, bosses/frost-sentinel.js, bosses/thunder-falcon.js, bosses/blade-samurai.js, scenes/weapon-get.js

**Modify**: gameplay.js (boss room logic, gate, boss HP bar), player.js (weapon switching, weapon energy), projectile.js (weapon-specific projectiles), hud.js (boss HP bar)

**Test**: Boss gate closes, boss appears with filling HP bar, patterns work, weakness deals extra damage, defeating boss grants weapon.

### Phase 5: Menus & Game Flow
**Goal**: Complete flow: title → stage select → gameplay → weapon get → game over → continue.

**Create**: scenes/title-screen.js, scenes/stage-select.js, scenes/game-over.js, scenes/pause-menu.js, core/audio.js

**Modify**: game.js (persistent game state, scene transitions), gameplay.js (pause support)

**Test**: Full game loop works end-to-end, pause/weapon select works, sound effects play.

### Phase 6: Remaining Stages + Polish
**Goal**: All 4 stages complete with unique themes, visual/audio polish.

**Create**: stage-data/stage-frost.js, stage-data/stage-thunder.js, stage-data/stage-blade.js

**Modify**: sprite-data.js (stage-specific tiles), audio.js (background music), effects.js (stage-specific effects)

### Phase 7: Final Castle + Endgame
**Goal**: 2 castle stages, boss rush, final boss, credits.

**Create**: stage-data/stage-castle1.js, stage-data/stage-castle2.js, bosses/final-boss.js, scenes/credits.js

**Modify**: gameplay.js (boss rush logic), stage-select.js (castle transition)

**Test**: Complete game playable from title to credits.

---

## Constants Reference

```javascript
// Display
CANVAS_WIDTH = 512, CANVAS_HEIGHT = 480
TILE_SIZE = 16, SCALE = 2, SCALED_TILE = 32

// Physics (per frame at 60 FPS)
GRAVITY = 0.4, PLAYER_WALK_SPEED = 2.5
PLAYER_JUMP_VELOCITY = -8.0, PLAYER_MAX_FALL = 12.0
PLAYER_CLIMB_SPEED = 1.5, PROJECTILE_SPEED = 6.0
MAX_PLAYER_PROJECTILES = 3

// Combat
PLAYER_MAX_HP = 28, BOSS_MAX_HP = 28
INVINCIBILITY_FRAMES = 90, KNOCKBACK_VX = 3.0
PLAYER_SHOT_DAMAGE = 1, WEAKNESS_DAMAGE = 3
ENEMY_CONTACT_DAMAGE = 3, SPIKE_DAMAGE = Infinity

// Items
SMALL_HP = 2, LARGE_HP = 10
SMALL_ENERGY = 2, LARGE_ENERGY = 10
STARTING_LIVES = 3
```

---

## Verification Plan

1. **Phase 1**: Open index.html in browser, verify player movement/jumping/shooting
2. **Phase 2**: Traverse full flame stage, test ladders/spikes/pits/platforms
3. **Phase 3**: Verify all 4 enemy types, damage in both directions, pickups
4. **Phase 4**: Beat each boss, verify weakness chain, weapon acquisition
5. **Phase 5**: Full game loop title-to-stage-select-to-gameplay, pause menu, game over/continue
6. **Phase 6**: Play all 4 stages, verify unique themes and challenges
7. **Phase 7**: Complete entire game start to credits

Run with: `npx serve /home/jason/Ultraman` or `python3 -m http.server` from project directory
