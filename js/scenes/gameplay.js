import { Scene } from './scene.js';
import { Player } from '../entities/player.js';
import { Camera } from '../core/camera.js';
import { loadLevel } from '../levels/level-loader.js';
import { drawTileGrid } from '../levels/tile.js';
import { entitiesOverlap } from '../core/collision.js';
import { HUD } from '../graphics/hud.js';
import { EffectsManager } from '../graphics/effects.js';
import { MovingPlatform } from '../levels/platform.js';
import { DisappearingBlock } from '../levels/disappearing-block.js';
import { CrumblingBlock } from '../levels/crumbling-block.js';
import { Pickup } from '../entities/pickup.js';
import { Met } from '../entities/enemies/met.js';
import { Jumper } from '../entities/enemies/jumper.js';
import { Turret } from '../entities/enemies/turret.js';
import { Flyer } from '../entities/enemies/flyer.js';
import { AquaShooter } from '../entities/enemies/aqua-shooter.js';
import { CurrentDrifter } from '../entities/enemies/current-drifter.js';
import { WindGust } from '../entities/enemies/wind-gust.js';
import { StormDrone } from '../entities/enemies/storm-drone.js';
import { FlameKnight } from '../entities/bosses/flame-knight.js';
import { FrostSentinel } from '../entities/bosses/frost-sentinel.js';
import { ThunderFalcon } from '../entities/bosses/thunder-falcon.js';
import { BladeSamurai } from '../entities/bosses/blade-samurai.js';
import { HydroMaster } from '../entities/bosses/hydro-master.js';
import { StormKing } from '../entities/bosses/storm-king.js';
import { FinalBoss } from '../entities/bosses/final-boss.js';
import { CastleBoss } from '../entities/bosses/castle-boss.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, TILE, DIR } from '../constants.js';

export class GameplayScene extends Scene {
    constructor(game) {
        super(game);
        this.player = null;
        this.camera = new Camera();
        this.tileGrid = [];
        this.projectiles = [];
        this.enemies = [];
        this.pickups = [];
        this.platforms = [];
        this.disappearingBlocks = [];
        this.crumblingBlocks = [];
        this.hud = new HUD();
        this.effects = new EffectsManager();
        this.levelWidth = 0;
        this.levelHeight = 0;
        this.bgColor = '#000000';
        this.tilePalette = null;
        this.boss = null;
        this.bossActive = false;
        this.paused = false;
        this.entityDefs = [];
        this.stageData = null;

        // Boss gate animation state
        this.gateInfo = null;       // { col, rows[] } found in tileGrid
        this.gateState = 'closed';  // 'closed' | 'opening' | 'open' | 'closing'
        this.gateOpenRowIdx = 0;    // how many rows have been animated so far
        this.gateTimer = 0;         // frames since last row step
    }

    loadStage(stageData) {
        this.stageData = stageData;
        const level = loadLevel(stageData);

        this.tileGrid = level.tileGrid;
        this.levelWidth = level.width;
        this.levelHeight = level.height;
        this.bgColor = level.bgColor;
        this.tilePalette = level.palette;
        this.entityDefs = level.entities;

        // Create player
        this.player = this.game.player || new Player(level.playerSpawn.x, level.playerSpawn.y);
        this.player.x = level.playerSpawn.x;
        this.player.y = level.playerSpawn.y;
        this.player.spawnX = level.playerSpawn.x;
        this.player.spawnY = level.playerSpawn.y;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.isDead = false;
        this.player.hp = this.player.hp > 0 ? this.player.hp : 28;
        this.game.player = this.player;

        // Trigger spawn animation when entering a stage
        this.player.triggerSpawnAnim();

        // Camera setup
        this.camera.setLevelBounds(level.width, level.height);
        this.camera.follow(this.player);

        // Clear entities
        this.projectiles = [];
        this.enemies = [];
        this.pickups = [];
        this.platforms = [];
        this.disappearingBlocks = [];
        this.crumblingBlocks = [];
        this.boss = null;
        this.bossActive = false;
        this.hud.showBossBar = false;

        // Spawn entities from level data
        this.spawnEntities(level.entities);

        // Find gate column in tile grid
        this.gateInfo = this.findGate(this.tileGrid);
        this.gateState = 'closed';
        this.gateOpenRowIdx = 0;
        this.gateTimer = 0;
    }

    spawnEntities(entityDefs) {
        for (const def of entityDefs) {
            switch (def.type) {
                case 'moving_platform_h':
                    this.platforms.push(new MovingPlatform(def.x, def.y, 'horizontal', 48, 1));
                    break;
                case 'moving_platform_v':
                    this.platforms.push(new MovingPlatform(def.x, def.y, 'vertical', 48, 1));
                    break;
                case 'disappearing_block':
                    this.disappearingBlocks.push(new DisappearingBlock(def.x, def.y, this.disappearingBlocks.length));
                    break;
                case 'met':
                    this.enemies.push(new Met(def.x, def.y));
                    break;
                case 'jumper':
                    this.enemies.push(new Jumper(def.x, def.y));
                    break;
                case 'turret':
                    this.enemies.push(new Turret(def.x, def.y));
                    break;
                case 'flyer':
                    this.enemies.push(new Flyer(def.x, def.y));
                    break;
                case 'aqua_shooter':
                    this.enemies.push(new AquaShooter(def.x, def.y));
                    break;
                case 'current_drifter':
                    this.enemies.push(new CurrentDrifter(def.x, def.y));
                    break;
                case 'wind_gust':
                    this.enemies.push(new WindGust(def.x, def.y));
                    break;
                case 'storm_drone':
                    this.enemies.push(new StormDrone(def.x, def.y));
                    break;
                case 'crumble_block': {
                    const block = new CrumblingBlock(def.x, def.y, this.tileGrid);
                    this.crumblingBlocks.push(block);
                    break;
                }
                case 'pickup_small_hp':
                    this.pickups.push(new Pickup(def.x, def.y, 'small_hp'));
                    break;
                case 'pickup_large_hp':
                    this.pickups.push(new Pickup(def.x, def.y, 'large_hp'));
                    break;
                case 'pickup_small_energy':
                    this.pickups.push(new Pickup(def.x, def.y, 'small_energy'));
                    break;
                case 'pickup_large_energy':
                    this.pickups.push(new Pickup(def.x, def.y, 'large_energy'));
                    break;
                case 'pickup_life':
                    this.pickups.push(new Pickup(def.x, def.y, 'life'));
                    break;
                case 'pickup_full_hp':
                    this.pickups.push(new Pickup(def.x, def.y, 'full_hp'));
                    break;
                case 'boss': {
                    const bossType = this.stageData ? this.stageData.bossType : null;
                    this.spawnBoss(bossType, def.x, def.y);
                    break;
                }
            }
        }
    }

    spawnBoss(bossType, x, y) {
        switch (bossType) {
            case 'flame_knight':
                this.boss = new FlameKnight(x, y);
                break;
            case 'frost_sentinel':
                this.boss = new FrostSentinel(x, y);
                break;
            case 'thunder_falcon':
                this.boss = new ThunderFalcon(x, y);
                break;
            case 'blade_samurai':
                this.boss = new BladeSamurai(x, y);
                break;
            case 'hydro_master':
                this.boss = new HydroMaster(x, y);
                break;
            case 'storm_king':
                this.boss = new StormKing(x, y);
                break;
            case 'castle_boss':
                this.boss = new CastleBoss(x, y);
                break;
            case 'final_boss':
                this.boss = new FinalBoss(x, y);
                break;
            default:
                return;
        }
        this.bossActive = false; // Activated when player enters boss room
        this.bossSpawnX = x;
        this.bossSpawnY = y;
    }

    activateBoss() {
        if (!this.boss || this.bossActive) return;
        this.bossActive = true;
        this.hud.startBossFill(this.boss.hp);
        if (this.game.audio) this.game.audio.play('gate');
    }

    enter() {
        // Stage data should be set before entering
    }

    exit() {}

    update(dt) {
        if (this.paused) return;

        const gameCtx = {
            input: this.game.input,
            tileGrid: this.tileGrid,
            projectiles: this.projectiles,
            enemies: this.enemies,
            player: this.player,
            levelWidth: this.levelWidth,
            levelHeight: this.levelHeight,
            camera: this.camera,
            audio: this.game.audio,
            effects: this.effects,
            onGameOver: () => this.game.switchScene('gameOver'),
            onPlayerRespawn: () => this.onPlayerRespawn(),
        };

        // Update player
        this.player.update(dt, gameCtx);

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update(dt, gameCtx);
            if (!this.projectiles[i].active) {
                this.projectiles.splice(i, 1);
            }
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            // Activation zone: only update enemies near camera
            const dist = Math.abs(enemy.x - this.camera.x - this.camera.width / 2);
            if (dist < this.camera.width * 1.5) {
                enemy.update(dt, gameCtx);
            }
            if (!enemy.active) {
                this.enemies.splice(i, 1);
            }
        }

        // Gate animation + boss activation
        this.updateGate();

        // Boss activation fallback
        if (this.boss && !this.bossActive) {
            if (!this.gateInfo) {
                // No gate: activate by proximity
                if (Math.abs(this.player.x - this.boss.x) < this.camera.width * 0.7) {
                    this.activateBoss();
                }
            } else {
                // Has gate: activate if player has passed the gate column (covers missed gate triggers)
                const gateX = this.gateInfo.col * TILE_SIZE;
                if (this.player.x > gateX && Math.abs(this.player.x - this.boss.x) < this.camera.width * 1.2) {
                    this.activateBoss();
                }
            }
        }

        // Update boss
        if (this.boss && this.bossActive) {
            this.boss.update(dt, gameCtx);
            this.hud.updateBossHp(this.boss.hp);

            // Boss defeated
            if (!this.boss.active) {
                this.onBossDefeated();
            }
        }

        // Update platforms and resolve player collision
        for (const platform of this.platforms) {
            platform.update(dt, this.player, this.tileGrid);
        }
        this.resolvePlatformCollisions();

        // Update disappearing blocks
        for (const block of this.disappearingBlocks) {
            block.update(dt, this.tileGrid);
        }

        // Update crumbling blocks
        for (const block of this.crumblingBlocks) {
            block.update(dt, this.tileGrid, this.player);
        }

        // Update pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            this.pickups[i].update(dt);
            if (!this.pickups[i].active) {
                this.pickups.splice(i, 1);
            }
        }

        // Collision: player projectiles vs enemies
        this.checkPlayerProjectileCollisions(gameCtx);

        // Collision: enemy projectiles vs player
        this.checkEnemyProjectileCollisions(gameCtx);

        // Collision: enemies vs player (contact damage)
        this.checkEnemyContactCollisions(gameCtx);

        // Collision: pickups vs player
        this.checkPickupCollisions(gameCtx);

        // Check checkpoints
        this.checkCheckpoints();

        // Check stage completion (reached right end of level without boss)
        if (!this.boss && this.player.x >= (this.levelWidth - 4) * TILE_SIZE) {
            this.onStageComplete();
        }

        // Camera
        this.camera.follow(this.player);
        this.camera.update();

        // HUD
        this.hud.update();

        // Effects
        this.effects.update();

        // Pause
        if (this.game.input.justPressed('pause')) {
            this.game.switchScene('pause');
        }

        // Weapon switch
        if (this.game.input.justPressed('weapon_prev')) {
            this.player.switchWeapon(-1);
        }
        if (this.game.input.justPressed('weapon_next')) {
            this.player.switchWeapon(1);
        }
    }

    resolvePlatformCollisions() {
        const player = this.player;
        if (player.isDead) return;

        for (const platform of this.platforms) {
            // Check if player is overlapping the platform
            const overlapX = player.x + player.w > platform.x && player.x < platform.x + platform.w;
            if (!overlapX) continue;

            const playerBottom = player.y + player.h;
            const platTop = platform.y;
            const platBottom = platform.y + platform.h;

            // Only resolve if player is falling or standing, and approaching from above
            // Player's previous bottom position (before this frame's movement)
            const prevBottom = playerBottom - player.vy;

            if (player.vy >= 0 && prevBottom <= platTop + 4 && playerBottom > platTop && playerBottom < platBottom + 8) {
                player.y = platTop - player.h;
                player.vy = 0;
                player.onGround = true;
            }
        }
    }

    checkPlayerProjectileCollisions(gameCtx) {
        for (const proj of this.projectiles) {
            if (!proj.isPlayerProjectile || !proj.active) continue;

            // vs enemies
            for (const enemy of this.enemies) {
                if (!enemy.active) continue;
                if (entitiesOverlap(proj, enemy)) {
                    enemy.takeDamage(proj.damage, proj.weaponType, gameCtx);
                    proj.active = false;
                    this.effects.spawnHitSpark(proj.x, proj.y);
                    break;
                }
            }

            // vs boss
            if (this.boss && this.bossActive && proj.active) {
                if (entitiesOverlap(proj, this.boss)) {
                    this.boss.takeDamage(proj.damage, proj.weaponType, gameCtx);
                    proj.active = false;
                    this.effects.spawnHitSpark(proj.x, proj.y);
                }
            }
        }
    }

    checkEnemyProjectileCollisions(gameCtx) {
        if (this.player.isDead || this.player.invincibleTimer > 0) return;

        for (const proj of this.projectiles) {
            if (proj.isPlayerProjectile || !proj.active) continue;
            if (entitiesOverlap(proj, this.player)) {
                const dir = proj.x < this.player.centerX ? 1 : -1;
                this.player.takeDamage(proj.damage, dir, gameCtx);
                proj.active = false;
            }
        }
    }

    checkEnemyContactCollisions(gameCtx) {
        if (this.player.isDead || this.player.invincibleTimer > 0) return;

        for (const enemy of this.enemies) {
            if (!enemy.active) continue;
            if (entitiesOverlap(enemy, this.player)) {
                const dir = enemy.centerX < this.player.centerX ? 1 : -1;
                this.player.takeDamage(enemy.contactDamage || 3, dir, gameCtx);
            }
        }

        // Boss contact damage
        if (this.boss && this.bossActive && entitiesOverlap(this.boss, this.player)) {
            const dir = this.boss.centerX < this.player.centerX ? 1 : -1;
            this.player.takeDamage(this.boss.contactDamage || 4, dir, gameCtx);
        }
    }

    checkPickupCollisions(gameCtx) {
        for (const pickup of this.pickups) {
            if (!pickup.active) continue;
            if (entitiesOverlap(pickup, this.player)) {
                pickup.collect(this.player, gameCtx);
            }
        }
    }

    checkCheckpoints() {
        const col = Math.floor(this.player.centerX / TILE_SIZE);
        const row = Math.floor(this.player.centerY / TILE_SIZE);
        if (row >= 0 && row < this.tileGrid.length && col >= 0 && col < this.tileGrid[0].length) {
            if (this.tileGrid[row][col] === TILE.CHECKPOINT) {
                this.player.setCheckpoint(
                    col * TILE_SIZE,
                    row * TILE_SIZE - 8
                );
            }
        }
    }

    onStageComplete() {
        if (this.stageData && this.stageData.stageName === 'Wily Castle 1') {
            const castle2 = this.game.scenes.stageSelect.stageDataMap['castle2'];
            if (castle2) {
                this.game.startStage(castle2);
                return;
            }
        }
        this.game.switchScene('stageSelect');
    }

    onBossDefeated() {
        if (this.boss && this.boss.weaponReward) {
            // Robot Master defeated -> weapon get scene handles save
            const weaponGet = this.game.scenes.weaponGet;
            if (weaponGet) {
                weaponGet.setWeapon(this.boss.weaponReward);
                this.game.switchScene('weaponGet');
            }
        } else if (this.stageData && this.stageData.bossType === 'final_boss') {
            // Final boss defeated -> credits
            this.game.defeatedBosses.push('castle2');
            this.game.saveProgress();
            this.game.switchScene('credits');
        } else if (this.stageData && this.stageData.bossType === 'castle_boss') {
            // Castle 1 boss defeated -> unlock castle 2
            if (!this.game.defeatedBosses.includes('castle1')) {
                this.game.defeatedBosses.push('castle1');
                this.game.saveProgress();
            }
            this.game.switchScene('stageSelect');
        } else {
            this.game.switchScene('stageSelect');
        }
        this.boss = null;
        this.bossActive = false;
        this.hud.showBossBar = false;
    }

    findGate(tileGrid) {
        // Scan tileGrid for BOSS_GATE tiles, group by column
        const colCounts = {};
        const colRows = {};
        for (let row = 0; row < tileGrid.length; row++) {
            for (let col = 0; col < tileGrid[row].length; col++) {
                if (tileGrid[row][col] === TILE.BOSS_GATE) {
                    colCounts[col] = (colCounts[col] || 0) + 1;
                    if (!colRows[col]) colRows[col] = [];
                    colRows[col].push(row);
                }
            }
        }
        // Pick column with the most gate tiles
        let bestCol = -1, bestCount = 0;
        for (const col of Object.keys(colCounts)) {
            if (colCounts[col] > bestCount) {
                bestCount = colCounts[col];
                bestCol = parseInt(col);
            }
        }
        if (bestCol === -1) return null;
        return { col: bestCol, rows: colRows[bestCol].sort((a, b) => a - b) };
    }

    updateGate() {
        if (!this.gateInfo || this.player.isDead || this.player.isSpawning) return;
        const { col, rows } = this.gateInfo;
        const FRAMES_PER_ROW = 4;
        const gateX = col * TILE_SIZE;

        if (this.gateState === 'closed') {
            // Trigger when player's right edge presses against gate column
            const playerRight = this.player.x + this.player.w;
            const vertOverlap = this.player.y + this.player.h > rows[0] * TILE_SIZE &&
                                this.player.y < (rows[rows.length - 1] + 1) * TILE_SIZE;
            const facingGate = this.player.facing === DIR.RIGHT;
            if (facingGate && vertOverlap && playerRight >= gateX - 2 && playerRight <= gateX + TILE_SIZE) {
                this.gateState = 'opening';
                this.gateOpenRowIdx = 0;
                this.gateTimer = 0;
                if (this.game.audio) this.game.audio.play('gate');
            }
        }

        if (this.gateState === 'opening') {
            this.gateTimer++;
            if (this.gateTimer >= FRAMES_PER_ROW) {
                this.gateTimer = 0;
                // Remove gate tiles from bottom to top
                const rowToOpen = rows[rows.length - 1 - this.gateOpenRowIdx];
                this.tileGrid[rowToOpen][col] = TILE.AIR;
                this.gateOpenRowIdx++;
                if (this.gateOpenRowIdx >= rows.length) {
                    this.gateState = 'open';
                    this.activateBoss();
                }
            }
        }

        if (this.gateState === 'open') {
            // Start closing once player has fully passed through
            if (this.player.x > gateX + TILE_SIZE) {
                this.gateState = 'closing';
                this.gateOpenRowIdx = 0;
                this.gateTimer = 0;
            }
        }

        if (this.gateState === 'closing') {
            this.gateTimer++;
            if (this.gateTimer >= FRAMES_PER_ROW) {
                this.gateTimer = 0;
                // Restore gate tiles from top to bottom
                const rowToClose = rows[this.gateOpenRowIdx];
                this.tileGrid[rowToClose][col] = TILE.BOSS_GATE;
                this.gateOpenRowIdx++;
                if (this.gateOpenRowIdx >= rows.length) {
                    this.gateState = 'closed';
                }
            }
        }
    }

    onPlayerRespawn() {
        // Clear all spawned entities
        this.projectiles = [];
        this.enemies = [];
        this.platforms = [];
        this.disappearingBlocks = [];
        this.crumblingBlocks = [];
        this.pickups = [];
        this.boss = null;
        this.bossActive = false;
        this.hud.showBossBar = false;

        // Restore tile grid (resets gate tiles and disappearing blocks)
        this.reloadTileGrid();

        // Reset gate state
        this.gateInfo = this.findGate(this.tileGrid);
        this.gateState = 'closed';
        this.gateOpenRowIdx = 0;
        this.gateTimer = 0;

        // Re-spawn all entities from definitions
        this.spawnEntities(this.entityDefs);
    }

    reloadTileGrid() {
        if (!this.stageData) return;
        const level = loadLevel(this.stageData);
        this.tileGrid = level.tileGrid;
    }

    draw(ctx) {
        const cam = this.camera.getDrawOffset();
        const drawCamera = { x: cam.x, y: cam.y, width: this.camera.width, height: this.camera.height };

        // Background
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Scale for pixel art (draw at 2x)
        ctx.save();

        // Draw tiles
        drawTileGrid(ctx, this.tileGrid, drawCamera, this.tilePalette);

        // Draw platforms
        for (const platform of this.platforms) {
            platform.draw(ctx, drawCamera);
        }

        // Draw disappearing blocks
        for (const block of this.disappearingBlocks) {
            block.draw(ctx, drawCamera);
        }

        // Draw crumbling blocks
        for (const block of this.crumblingBlocks) {
            block.draw(ctx, drawCamera);
        }

        // Draw pickups
        for (const pickup of this.pickups) {
            pickup.draw(ctx, drawCamera);
        }

        // Draw enemies
        for (const enemy of this.enemies) {
            enemy.draw(ctx, drawCamera);
        }

        // Draw boss
        if (this.boss && this.bossActive) {
            this.boss.draw(ctx, drawCamera);
        }

        // Draw player
        this.player.draw(ctx, drawCamera);

        // Draw projectiles
        for (const proj of this.projectiles) {
            proj.draw(ctx, drawCamera);
        }

        // Draw effects
        this.effects.draw(ctx, drawCamera);

        ctx.restore();

        // Draw HUD (screen-space, not affected by camera)
        this.hud.draw(ctx, this.player);
    }
}
