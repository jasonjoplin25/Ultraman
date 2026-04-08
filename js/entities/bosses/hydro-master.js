import { Boss } from './boss.js';
import { Sprite } from '../../graphics/sprite.js';
import { Projectile } from '../projectile.js';
import { WEAPON_THUNDER, WEAPON_HYDRO, GRAVITY, PLAYER_MAX_FALL } from '../../constants.js';
import { resolveEntityTileCollisions } from '../../core/collision.js';
import { HYDRO_MASTER_SPRITE, HYDRO_MASTER_PALETTE } from '../../graphics/sprite-data.js';

export class HydroMaster extends Boss {
    constructor(x, y) {
        super(x, y, 20, 26);
        this.weakness = WEAPON_THUNDER;
        this.weaponReward = WEAPON_HYDRO;
        this.sprite = new Sprite(HYDRO_MASTER_SPRITE, HYDRO_MASTER_PALETTE);
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
                if (this.stateTimer > 40) {
                    this.chooseAction(game);
                }
                break;

            case 'glide':
                this.vx = this.facing * 2.5;
                if (this.stateTimer > 50) {
                    this.setState('idle');
                }
                break;

            case 'torpedo':
                this.vx = 0;
                if (this.stateTimer === 10 || this.stateTimer === 35) {
                    this.fireTorpedo(game);
                }
                if (this.stateTimer > 60) {
                    this.setState('idle');
                }
                break;

            case 'dive':
                if (this.stateTimer === 1) {
                    this.vy = -11;
                    this.vx = this.facing * 1.5;
                }
                if (this.onGround && this.stateTimer > 10) {
                    // 3-way spread on landing
                    this.fireSpread(game, 3);
                    this.setState('idle');
                }
                break;

            case 'bubble_burst':
                this.vx = 0;
                if ([8, 20, 32, 44, 56].includes(this.stateTimer)) {
                    this.fireBubbleFan(game);
                }
                if (this.stateTimer > 60) {
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
            if (roll < 0.25) {
                this.setState('bubble_burst');
                return;
            }
            const r2 = roll - 0.25;
            if (r2 < 0.30) { this.setState('glide'); return; }
            if (r2 < 0.60) { this.setState('torpedo'); return; }
            this.setState('dive');
        } else {
            if (roll < 0.40) { this.setState('glide'); return; }
            if (roll < 0.75) { this.setState('torpedo'); return; }
            this.setState('dive');
        }
    }

    setState(state) {
        this.state = state;
        this.stateTimer = 0;
    }

    fireTorpedo(game) {
        const proj = Projectile.createEnemyShot(
            this.centerX + this.facing * 12,
            this.centerY,
            this.facing * 4,
            0
        );
        proj.damage = 3;
        proj.hydroAge = 0;
        const origUpdate = proj.update.bind(proj);
        proj.update = (dt, g) => {
            proj.hydroAge = (proj.hydroAge || 0) + 1;
            proj.vy = Math.sin(proj.hydroAge * 0.3) * 2;
            origUpdate(dt, g);
        };
        game.projectiles.push(proj);
    }

    fireSpread(game, count) {
        const angles = [-30, 0, 30];
        for (const angleDeg of angles) {
            const rad = (angleDeg * Math.PI) / 180;
            const speed = 4;
            const proj = Projectile.createEnemyShot(
                this.centerX,
                this.y + this.h,
                Math.sin(rad) * speed * this.facing,
                -Math.abs(Math.cos(rad)) * speed
            );
            proj.damage = 3;
            game.projectiles.push(proj);
        }
    }

    fireBubbleFan(game) {
        const spreadAngles = [-40, -20, 0, 20, 40];
        for (const angleDeg of spreadAngles) {
            const rad = (angleDeg * Math.PI) / 180;
            const speed = 3.5;
            const proj = Projectile.createEnemyShot(
                this.centerX + this.facing * 10,
                this.centerY,
                (Math.cos(rad) * speed * this.facing),
                Math.sin(rad) * speed
            );
            proj.damage = 2;
            game.projectiles.push(proj);
        }
    }

    applyGravity() {
        this.vy += GRAVITY;
        this.vy = Math.min(this.vy, PLAYER_MAX_FALL);
    }

    onPhaseChange(game) {
        if (game.camera) game.camera.shake(4, 30);
    }

    draw(ctx, camera) {
        this.drawBase(ctx, camera, this.sprite);
    }
}
