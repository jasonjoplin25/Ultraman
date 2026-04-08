import { Boss } from './boss.js';
import { Sprite } from '../../graphics/sprite.js';
import { Projectile } from '../projectile.js';
import { WEAPON_ICE, WEAPON_STORM, GRAVITY, PLAYER_MAX_FALL } from '../../constants.js';
import { resolveEntityTileCollisions } from '../../core/collision.js';
import { STORM_KING_SPRITE, STORM_KING_PALETTE } from '../../graphics/sprite-data.js';

export class StormKing extends Boss {
    constructor(x, y) {
        super(x, y, 20, 26);
        this.weakness = WEAPON_ICE;
        this.weaponReward = WEAPON_STORM;
        this.sprite = new Sprite(STORM_KING_SPRITE, STORM_KING_PALETTE);
        this.spriteOffsetX = -2;
        this.spriteOffsetY = -2;
        this.spawnX = x;
        this.facing = -1;
    }

    update(dt, game) {
        if (this.updateBase(dt, game)) return;

        this.stateTimer++;
        this.applyGravity();

        switch (this.state) {
            case 'idle':
                this.vx = 0;
                if (this.stateTimer > 35) {
                    this.chooseAction(game);
                }
                break;

            case 'dash':
                if (this.stateTimer === 1) {
                    this.vx = this.facing * 5;
                }
                // Bounce off walls
                if (this.x <= this.spawnX - 128) {
                    this.vx = Math.abs(this.vx);
                    this.facing = 1;
                } else if (this.x >= this.spawnX + 64) {
                    this.vx = -Math.abs(this.vx);
                    this.facing = -1;
                }
                if (this.stateTimer > 35) {
                    this.vx = 0;
                    this.setState('idle');
                }
                break;

            case 'gale':
                this.vx = 0;
                if (this.stateTimer === 12 || this.stateTimer === 40) {
                    this.fireGale(game);
                }
                if (this.stateTimer > 65) {
                    this.setState('idle');
                }
                break;

            case 'tempest':
                this.vx = 0;
                if (this.stateTimer % 15 === 1 && this.stateTimer < 80) {
                    this.fireTempest(game);
                }
                if (this.stateTimer > 80) {
                    this.setState('idle');
                }
                break;

            case 'lightning_crash':
                if (this.stateTimer === 1) {
                    this.vy = -12;
                    this.vx = this.facing * 2;
                }
                if (this.onGround && this.stateTimer > 10) {
                    this.fireShockwave(game);
                    this.setState('idle');
                }
                break;
        }

        this.onGround = false;
        resolveEntityTileCollisions(this, game.tileGrid);

        // Clamp to boss room
        this.x = Math.max(this.spawnX - 128, Math.min(this.spawnX + 64, this.x));

        // Face player
        const playerX = game.player ? game.player.centerX : this.centerX;
        this.facing = playerX > this.centerX ? 1 : -1;
    }

    chooseAction(game) {
        const roll = Math.random();
        if (this.phase === 2) {
            if (roll < 0.20) { this.setState('lightning_crash'); return; }
            if (roll < 0.45) { this.setState('tempest'); return; }
            if (roll < 0.70) { this.setState('gale'); return; }
            this.setState('dash');
        } else {
            if (roll < 0.35) { this.setState('dash'); return; }
            if (roll < 0.75) { this.setState('gale'); return; }
            // idle then gale
            this.setState('idle');
        }
    }

    setState(state) {
        this.state = state;
        this.stateTimer = 0;
    }

    fireGale(game) {
        // 3-way spread: straight + ±20 degrees
        const angles = [-20, 0, 20];
        for (const angleDeg of angles) {
            const rad = (angleDeg * Math.PI) / 180;
            const speed = 5;
            const proj = Projectile.createEnemyShot(
                this.centerX + this.facing * 12,
                this.centerY,
                Math.cos(rad) * speed * this.facing,
                Math.sin(rad) * speed
            );
            proj.damage = 2;
            game.projectiles.push(proj);
        }
    }

    fireTempest(game) {
        // 2 fast shots toward player
        if (!game.player) return;
        const dx = game.player.centerX - this.centerX;
        const dy = game.player.centerY - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 6;
        for (let i = -1; i <= 1; i += 2) {
            const proj = Projectile.createEnemyShot(
                this.centerX + this.facing * 10,
                this.centerY,
                (dx / dist) * speed + i * 0.5,
                (dy / dist) * speed
            );
            proj.damage = 2;
            game.projectiles.push(proj);
        }
    }

    fireShockwave(game) {
        // 3 shockwave shots along the ground
        const dirs = [-1, 0, 1];
        for (const d of dirs) {
            const proj = Projectile.createEnemyShot(
                this.centerX + d * 8,
                this.y + this.h - 4,
                d * 5,
                -1
            );
            proj.damage = 3;
            game.projectiles.push(proj);
        }
    }

    applyGravity() {
        this.vy += GRAVITY;
        this.vy = Math.min(this.vy, PLAYER_MAX_FALL);
    }

    onPhaseChange(game) {
        if (game.camera) game.camera.shake(5, 30);
    }

    draw(ctx, camera) {
        this.drawBase(ctx, camera, this.sprite);
    }
}
