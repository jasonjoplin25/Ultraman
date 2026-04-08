import { Entity } from './entity.js';
import {
    GRAVITY, PLAYER_WALK_SPEED, PLAYER_JUMP_VELOCITY, PLAYER_MAX_FALL,
    PLAYER_CLIMB_SPEED, MAX_PLAYER_PROJECTILES, PLAYER_MAX_HP,
    INVINCIBILITY_FRAMES, KNOCKBACK_VX, KNOCKBACK_VY,
    WEAPON_BUSTER, WEAPON_MAX_ENERGY, TILE_SIZE, SPIKE_DAMAGE,
    STARTING_LIVES, DIR, WEAPON_PALETTES, CANVAS_HEIGHT, TILE
} from '../constants.js';
import { Sprite } from '../graphics/sprite.js';
import { AnimationController, PLAYER_ANIMS } from '../graphics/animations.js';
import {
    PLAYER_PALETTE, PLAYER_STAND, PLAYER_RUN1, PLAYER_RUN2, PLAYER_RUN3,
    PLAYER_JUMP, PLAYER_SHOOT, PLAYER_CLIMB1, PLAYER_CLIMB2, PLAYER_DAMAGE
} from '../graphics/sprite-data.js';
import { resolveEntityTileCollisions, checkOnGround, checkOnLadder, checkSpikeCollision, getTileAt } from '../core/collision.js';
import { clamp } from '../core/utils.js';
import { Projectile } from './projectile.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 14, 24); // slightly smaller hitbox than sprite
        this.spriteOffsetX = -1; // center 14px hitbox in 16px sprite
        this.spriteOffsetY = 0;

        this.hp = PLAYER_MAX_HP;
        this.lives = STARTING_LIVES;
        this.currentWeapon = WEAPON_BUSTER;
        this.weaponEnergy = {};
        this.weapons = [WEAPON_BUSTER];

        this.invincibleTimer = 0;
        this.shootTimer = 0;
        this.isClimbing = false;
        this.isDead = false;
        this.deathTimer = 0;
        this.deathExploded = false;
        this.knockback = false;
        this.knockbackTimer = 0;

        // Spawn animation
        this.isSpawning = false;
        this.spawnTimer = 0;

        // Jump assist timers
        this.coyoteTimer = 0;       // frames since last on ground (allows late jumps)
        this.jumpBufferTimer = 0;   // frames since jump was pressed (allows early jumps)
        this.wasOnGround = false;

        // Build sprite sets for each weapon palette
        this.weaponSpriteMaps = {};
        for (const [weapon, palette] of Object.entries(WEAPON_PALETTES)) {
            this.weaponSpriteMaps[weapon] = {
                stand:  new Sprite(PLAYER_STAND,  palette),
                run1:   new Sprite(PLAYER_RUN1,   palette),
                run2:   new Sprite(PLAYER_RUN2,   palette),
                run3:   new Sprite(PLAYER_RUN3,   palette),
                jump:   new Sprite(PLAYER_JUMP,   palette),
                shoot:  new Sprite(PLAYER_SHOOT,  palette),
                climb1: new Sprite(PLAYER_CLIMB1, palette),
                climb2: new Sprite(PLAYER_CLIMB2, palette),
                damage: new Sprite(PLAYER_DAMAGE, palette),
            };
        }

        // Active sprite map (buster by default)
        this.spriteMap = this.weaponSpriteMaps[WEAPON_BUSTER];

        this.anim = new AnimationController(PLAYER_ANIMS, this.spriteMap);
        this.anim.play('idle');

        this.spawnX = x;
        this.spawnY = y;
    }

    update(dt, game) {
        if (this.isDead) {
            this.deathTimer++;
            // Trigger the explosion burst after the flicker phase
            if (this.deathTimer === 18 && !this.deathExploded) {
                this.deathExploded = true;
                if (game.effects) {
                    game.effects.spawnPlayerDeath(this.centerX, this.centerY, this.currentWeapon);
                }
                if (game.audio) game.audio.play('explosion');
            }
            if (this.deathTimer > 130) {
                this.respawn(game);
            }
            return;
        }

        // Spawn animation: player can't move until beam finishes
        if (this.isSpawning) {
            this.spawnTimer++;
            if (this.spawnTimer >= 65) {
                this.isSpawning = false;
                this.invincibleTimer = Math.max(this.invincibleTimer, 60);
            }
            return;
        }

        const input = game.input;

        // Invincibility
        if (this.invincibleTimer > 0) {
            this.invincibleTimer--;
        }

        // Knockback
        if (this.knockback) {
            this.knockbackTimer--;
            if (this.knockbackTimer <= 0) {
                this.knockback = false;
            }
            // Apply gravity during knockback
            this.vy += GRAVITY;
            this.vy = Math.min(this.vy, PLAYER_MAX_FALL);
            resolveEntityTileCollisions(this, game.tileGrid);
            this.anim.play('damage');
            this.anim.update();
            return;
        }

        // Shoot timer
        if (this.shootTimer > 0) {
            this.shootTimer--;
        }

        // Climbing
        if (this.isClimbing) {
            this.updateClimbing(input, game);
            return;
        }

        // Check if can grab ladder
        const pressingDown = input.held('down');
        if ((input.held('up') || pressingDown) && checkOnLadder(this, game.tileGrid, pressingDown)) {
            this.startClimbing(game);
            // If pressing down from on top of a ladder, drop below the platform
            if (pressingDown && this.onGround) {
                this.y += 2; // Move past the one-way platform
                this.onGround = false;
            }
            return;
        }

        // Horizontal movement
        this.vx = 0;
        if (input.held('left')) {
            this.vx = -PLAYER_WALK_SPEED;
            this.facing = DIR.LEFT;
        } else if (input.held('right')) {
            this.vx = PLAYER_WALK_SPEED;
            this.facing = DIR.RIGHT;
        }

        // Jump buffer: remember jump presses for a few frames
        if (input.justPressed('jump')) {
            this.jumpBufferTimer = 8; // 8-frame buffer (~133ms)
        }
        if (this.jumpBufferTimer > 0) {
            this.jumpBufferTimer--;
        }

        // Coyote time: allow jumping for a few frames after leaving ground
        if (this.onGround) {
            this.coyoteTimer = 6; // 6-frame coyote time (~100ms)
        }
        if (this.coyoteTimer > 0) {
            this.coyoteTimer--;
        }

        // Jumping: trigger if jump was pressed recently AND was on ground recently
        const canJump = this.coyoteTimer > 0;
        if (this.jumpBufferTimer > 0 && canJump) {
            this.vy = PLAYER_JUMP_VELOCITY;
            this.onGround = false;
            this.coyoteTimer = 0;      // consume coyote time
            this.jumpBufferTimer = 0;  // consume buffer
            if (game.audio) game.audio.play('jump');
        }

        // Variable jump height - cut velocity when releasing
        if (input.justReleased('jump') && this.vy < PLAYER_JUMP_VELOCITY / 2) {
            this.vy = PLAYER_JUMP_VELOCITY / 2;
        }

        // Gravity
        this.vy += GRAVITY;
        this.vy = Math.min(this.vy, PLAYER_MAX_FALL);

        // Water current: push vx and cap vy BEFORE movement so it takes effect this frame
        this.applyWaterCurrents(game.tileGrid);

        // Reset onGround before collision resolution
        this.onGround = false;

        // Move and resolve collisions
        resolveEntityTileCollisions(this, game.tileGrid);

        // Bounce tile: super-jump when landing on bounce tile
        if (this.onGround) {
            const floorRow = Math.floor((this.y + this.h + 1) / TILE_SIZE);
            const leftCol = Math.floor(this.x / TILE_SIZE);
            const rightCol = Math.floor((this.x + this.w - 1) / TILE_SIZE);
            for (let col = leftCol; col <= rightCol; col++) {
                if (getTileAt(game.tileGrid, col, floorRow) === TILE.BOUNCE) {
                    this.vy = -14;
                    this.onGround = false;
                    if (game.audio) game.audio.play('jump');
                    break;
                }
            }
        }

        // Spike check
        if (checkSpikeCollision(this, game.tileGrid)) {
            this.die(game);
            return;
        }

        // Bottomless pit
        if (this.y > game.levelHeight * TILE_SIZE + 32) {
            this.die(game);
            return;
        }

        // Shooting
        if (input.justPressed('shoot') && this.shootTimer <= 0) {
            this.shoot(game);
        }

        // Animation
        this.updateAnimation(input);
    }

    updateClimbing(input, game) {
        this.vx = 0;
        this.vy = 0;

        if (input.held('up')) {
            this.vy = -PLAYER_CLIMB_SPEED;
        } else if (input.held('down')) {
            this.vy = PLAYER_CLIMB_SPEED;
        }

        // Move on ladder
        this.y += this.vy;

        // Check still on ladder
        if (!checkOnLadder(this, game.tileGrid)) {
            this.isClimbing = false;
            this.vy = 0;
            // Snap to ground if we climbed off the top
            this.onGround = checkOnGround(this, game.tileGrid);
        }

        // Jump off ladder
        if (input.justPressed('jump')) {
            this.isClimbing = false;
            this.vy = PLAYER_JUMP_VELOCITY;
        }

        // Shoot on ladder
        if (input.justPressed('shoot') && this.shootTimer <= 0) {
            this.shoot(game);
        }

        // Animation
        if (this.vy !== 0) {
            this.anim.play('climb');
        }
        this.anim.update();
    }

    applyWaterCurrents(tileGrid) {
        const left = Math.floor(this.x / TILE_SIZE);
        const right = Math.floor((this.x + this.w - 1) / TILE_SIZE);
        const top = Math.floor(this.y / TILE_SIZE);
        const bottom = Math.floor((this.y + this.h - 1) / TILE_SIZE);
        let inCurrent = false;
        for (let row = top; row <= bottom; row++) {
            for (let col = left; col <= right; col++) {
                const tile = getTileAt(tileGrid, col, row);
                if (tile === TILE.WATER_CURRENT_R) {
                    this.vx += 0.4;
                    this.vx = Math.min(this.vx, 3.5);
                    inCurrent = true;
                } else if (tile === TILE.WATER_CURRENT_L) {
                    this.vx -= 0.4;
                    this.vx = Math.max(this.vx, -3.5);
                    inCurrent = true;
                }
            }
        }
        // Floaty fall in water currents
        if (inCurrent) {
            this.vy = Math.min(this.vy, 2);
        }
    }

    startClimbing(game) {
        this.isClimbing = true;
        this.vy = 0;
        this.vx = 0;
        // Center on ladder
        const ladderCol = Math.floor((this.x + this.w / 2) / TILE_SIZE);
        this.x = ladderCol * TILE_SIZE + (TILE_SIZE - this.w) / 2;
        this.anim.play('climb');
    }

    shoot(game) {
        // Count active player projectiles
        const activeCount = game.projectiles.filter(p => p.active && p.isPlayerProjectile).length;
        if (activeCount >= MAX_PLAYER_PROJECTILES) return;

        // Check weapon energy
        if (this.currentWeapon !== WEAPON_BUSTER) {
            const energy = this.weaponEnergy[this.currentWeapon] || 0;
            if (energy <= 0) {
                this.currentWeapon = WEAPON_BUSTER;
                return;
            }
            this.weaponEnergy[this.currentWeapon]--;
        }

        const shootUp = game.input && game.input.held('up') && !this.isClimbing;

        let bulletX, bulletY;
        if (shootUp) {
            // Fire from top-center of player
            bulletX = this.x + this.w / 2 - 3;
            bulletY = this.y - 6;
        } else {
            bulletX = this.facing === DIR.RIGHT ? this.x + this.w : this.x - 8;
            bulletY = this.y + 8;
        }

        const proj = Projectile.createPlayerShot(bulletX, bulletY, this.facing, this.currentWeapon, shootUp);
        game.projectiles.push(proj);
        this.shootTimer = 4;

        if (game.audio) game.audio.play('shoot');
    }

    updateAnimation(input) {
        if (this.shootTimer > 2) {
            this.anim.play('shoot');
        } else if (!this.onGround) {
            this.anim.play('jump');
        } else if (this.vx !== 0) {
            this.anim.play('run');
        } else {
            this.anim.play('idle');
        }
        this.anim.update();
    }

    takeDamage(amount, knockbackDir, game) {
        if (this.invincibleTimer > 0 || this.isDead) return;

        this.hp -= amount;
        if (game.audio) game.audio.play('hit');

        if (this.hp <= 0) {
            this.hp = 0;
            this.die(game);
            return;
        }

        this.invincibleTimer = INVINCIBILITY_FRAMES;
        this.knockback = true;
        this.knockbackTimer = 20;
        this.vx = knockbackDir * KNOCKBACK_VX;
        this.vy = KNOCKBACK_VY;
    }

    die(game) {
        this.isDead = true;
        this.deathTimer = 0;
        this.vx = 0;
        this.vy = 0;
        if (game.audio) game.audio.play('death');
    }

    respawn(game) {
        this.lives--;
        if (this.lives < 0) {
            game.onGameOver();
            return;
        }

        this.x = this.spawnX;
        this.y = this.spawnY;
        this.vx = 0;
        this.vy = 0;
        this.hp = PLAYER_MAX_HP;
        this.isDead = false;
        this.deathTimer = 0;
        this.deathExploded = false;
        this.invincibleTimer = 90;
        this.knockback = false;
        this.isClimbing = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;

        // Trigger spawn animation
        this.isSpawning = true;
        this.spawnTimer = 0;

        // Restore weapon energy
        for (const weapon of this.weapons) {
            if (weapon !== WEAPON_BUSTER) {
                this.weaponEnergy[weapon] = WEAPON_MAX_ENERGY;
            }
        }

        game.onPlayerRespawn();
    }

    triggerSpawnAnim() {
        this.isSpawning = true;
        this.spawnTimer = 0;
    }

    setCheckpoint(x, y) {
        this.spawnX = x;
        this.spawnY = y;
    }

    addWeapon(weaponId) {
        if (!this.weapons.includes(weaponId)) {
            this.weapons.push(weaponId);
            this.weaponEnergy[weaponId] = WEAPON_MAX_ENERGY;
        }
    }

    switchWeapon(direction) {
        if (this.weapons.length <= 1) return;
        const idx = this.weapons.indexOf(this.currentWeapon);
        const newIdx = (idx + direction + this.weapons.length) % this.weapons.length;
        this.currentWeapon = this.weapons[newIdx];
        this.updateWeaponSprites();
    }

    updateWeaponSprites() {
        const map = this.weaponSpriteMaps[this.currentWeapon]
                 || this.weaponSpriteMaps[WEAPON_BUSTER];
        this.spriteMap = map;
        this.anim.setSprites(map);
    }

    draw(ctx, camera) {
        if (this.isDead) {
            // Flicker the player sprite for the first 16 frames before the explosion
            if (this.deathTimer < 16 && Math.floor(this.deathTimer / 2) % 2 === 0) {
                const sprite = this.anim.getCurrentSprite();
                if (sprite) {
                    const drawX = Math.round((this.x + this.spriteOffsetX - camera.x) * 2);
                    const drawY = Math.round((this.y + this.spriteOffsetY - camera.y) * 2);
                    sprite.draw(ctx, drawX, drawY, this.facing === DIR.RIGHT);
                }
            }
            return;
        }

        if (this.isSpawning) {
            this.drawSpawnAnim(ctx, camera);
            return;
        }

        // Flicker when invincible after spawn/respawn
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 3) % 2 === 0) {
            return;
        }

        const sprite = this.anim.getCurrentSprite();
        if (!sprite) return;

        const drawX = Math.round((this.x + this.spriteOffsetX - camera.x) * 2);
        const drawY = Math.round((this.y + this.spriteOffsetY - camera.y) * 2);
        sprite.draw(ctx, drawX, drawY, this.facing === DIR.RIGHT);
    }

    drawSpawnAnim(ctx, camera) {
        const t = this.spawnTimer;
        const centerScreenX = Math.round((this.x + this.w / 2 - camera.x) * 2);
        const drawX = Math.round((this.x + this.spriteOffsetX - camera.x) * 2);
        const drawY = Math.round((this.y + this.spriteOffsetY - camera.y) * 2);

        // Get beam color from current weapon palette
        const pal = WEAPON_PALETTES[this.currentWeapon] || WEAPON_PALETTES[WEAPON_BUSTER];
        const beamLight = pal[3];
        const beamDark  = pal[2];

        // Phase 1+2: Draw the teleport beam (frames 0-45, fading out from 30-45)
        if (t < 45) {
            const alpha = t < 30 ? 1 : 1 - (t - 30) / 15;

            // Outer glow
            ctx.globalAlpha = alpha * 0.2;
            ctx.fillStyle = beamLight;
            ctx.fillRect(centerScreenX - 18, 0, 36, CANVAS_HEIGHT);

            // Mid glow
            ctx.globalAlpha = alpha * 0.45;
            ctx.fillStyle = beamLight;
            ctx.fillRect(centerScreenX - 7, 0, 14, CANVAS_HEIGHT);

            // Core beam (flickers every 3 frames)
            if (t % 3 !== 0) {
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(centerScreenX - 2, 0, 4, CANVAS_HEIGHT);
            }

            ctx.globalAlpha = 1;
        }

        // Phase 2: Reveal player sprite top-to-bottom (frames 20-60)
        if (t >= 20) {
            const progress = Math.min((t - 20) / 38, 1);
            const sprite = this.spriteMap.stand;
            if (!sprite) return;

            const sprW = sprite.width;
            const sprH = sprite.height;
            const revealH = Math.ceil(sprH * progress);

            if (revealH > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(drawX - 2, drawY, sprW + 4, revealH);
                ctx.clip();
                sprite.draw(ctx, drawX, drawY, this.facing === DIR.RIGHT);
                ctx.restore();
            }
        }
    }
}
