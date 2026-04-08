import { Entity } from './entity.js';
import { PROJECTILE_SPEED, PLAYER_SHOT_DAMAGE, WEAPON_BUSTER, WEAPON_FLAME, WEAPON_ICE, WEAPON_THUNDER, WEAPON_BLADE, WEAPON_HYDRO, WEAPON_STORM } from '../constants.js';
import { Sprite } from '../graphics/sprite.js';
import { PROJECTILE_BUSTER, PLAYER_PALETTE, ENEMY_BULLET, ENEMY_BULLET_PALETTE } from '../graphics/sprite-data.js';

export class Projectile extends Entity {
    constructor(x, y, vx, vy, w, h) {
        super(x, y, w, h);
        this.vx = vx;
        this.vy = vy;
        this.damage = PLAYER_SHOT_DAMAGE;
        this.isPlayerProjectile = true;
        this.weaponType = WEAPON_BUSTER;
        this.lifetime = 180; // frames before auto-despawn
        this.sprite = null;
    }

    static createPlayerShot(x, y, direction, weaponType, shootUp = false) {
        // Upward shots: compact square projectile flying straight up
        if (shootUp) {
            const proj = new Projectile(x, y, 0, -PROJECTILE_SPEED, 6, 6);
            proj.isPlayerProjectile = true;
            proj.weaponType = weaponType;
            proj.damage = PLAYER_SHOT_DAMAGE;
            proj.lifetime = 90;
            const palettes = {
                [WEAPON_FLAME]:   ['', '#000000', '#a81000', '#f83800', '#fca044', '#fcfcfc'],
                [WEAPON_ICE]:     ['', '#000000', '#0058f8', '#3cbcfc', '#b8d8f8', '#fcfcfc'],
                [WEAPON_THUNDER]: ['', '#000000', '#e45c10', '#f8d800', '#fcfcfc', '#fcfcfc'],
                [WEAPON_BLADE]:   ['', '#000000', '#888888', '#bcbcbc', '#fcfcfc', '#fcfcfc'],
                [WEAPON_HYDRO]:   ['', '#000000', '#0044a8', '#10a8f8', '#00e8f8', '#fcfcfc'],
                [WEAPON_STORM]:   ['', '#000000', '#5010a0', '#b050f8', '#f8e800', '#fcfcfc'],
            };
            proj.sprite = new Sprite(PROJECTILE_BUSTER, palettes[weaponType] || PLAYER_PALETTE);
            return proj;
        }

        // Normal horizontal shots
        const proj = new Projectile(x, y, direction * PROJECTILE_SPEED, 0, 8, 6);
        proj.isPlayerProjectile = true;
        proj.weaponType = weaponType;

        switch (weaponType) {
            case WEAPON_FLAME:
                proj.damage = PLAYER_SHOT_DAMAGE;
                proj.w = 16;
                proj.h = 12;
                proj.vx = direction * 4;
                proj.lifetime = 60;
                proj.sprite = new Sprite(PROJECTILE_BUSTER, ['', '#000000', '#a81000', '#f83800', '#fca044', '#fcfcfc']);
                break;
            case WEAPON_ICE:
                proj.damage = PLAYER_SHOT_DAMAGE;
                proj.sprite = new Sprite(PROJECTILE_BUSTER, ['', '#000000', '#0058f8', '#3cbcfc', '#b8d8f8', '#fcfcfc']);
                break;
            case WEAPON_THUNDER:
                // Shoots horizontally like buster but with electric palette
                proj.damage = PLAYER_SHOT_DAMAGE;
                proj.sprite = new Sprite(PROJECTILE_BUSTER, ['', '#000000', '#e45c10', '#f8d800', '#fcfcfc', '#fcfcfc']);
                break;
            case WEAPON_BLADE:
                proj.damage = PLAYER_SHOT_DAMAGE;
                proj.lifetime = 90;
                proj.bladePhase = 0;
                proj.bladeStartX = x;
                proj.bladeDir = direction;
                proj.sprite = new Sprite(PROJECTILE_BUSTER, ['', '#000000', '#888888', '#bcbcbc', '#fcfcfc', '#fcfcfc']);
                break;
            case WEAPON_HYDRO:
                proj.damage = PLAYER_SHOT_DAMAGE;
                proj.w = 10;
                proj.h = 5;
                proj.vx = direction * 5;
                proj.lifetime = 90;
                proj.hydroAge = 0;
                proj.sprite = new Sprite(PROJECTILE_BUSTER, ['', '#000000', '#0044a8', '#10a8f8', '#00e8f8', '#fcfcfc']);
                break;
            case WEAPON_STORM:
                proj.damage = PLAYER_SHOT_DAMAGE;
                proj.w = 8;
                proj.h = 8;
                proj.vx = direction * 7;
                proj.vy = 0;
                proj.lifetime = 90;
                proj.sprite = new Sprite(PROJECTILE_BUSTER, ['', '#000000', '#5010a0', '#b050f8', '#f8e800', '#fcfcfc']);
                break;
            default: // BUSTER
                proj.sprite = new Sprite(PROJECTILE_BUSTER, PLAYER_PALETTE);
                break;
        }

        return proj;
    }

    static createEnemyShot(x, y, vx, vy) {
        const proj = new Projectile(x, y, vx, vy, 4, 4);
        proj.isPlayerProjectile = false;
        proj.damage = 2;
        proj.sprite = new Sprite(ENEMY_BULLET, ENEMY_BULLET_PALETTE);
        return proj;
    }

    update(dt, game) {
        this.lifetime--;
        if (this.lifetime <= 0) {
            this.active = false;
            return;
        }

        // Blade boomerang arc
        if (this.weaponType === WEAPON_BLADE && this.isPlayerProjectile) {
            this.bladePhase++;
            const t = this.bladePhase / 30;
            if (t < 1) {
                this.vx = this.bladeDir * PROJECTILE_SPEED;
                this.vy = -3 * (1 - t);
            } else {
                this.vx = -this.bladeDir * PROJECTILE_SPEED * 0.8;
                this.vy = 2;
            }
        }

        // Hydro: sine-wave oscillation
        if (this.weaponType === WEAPON_HYDRO && this.isPlayerProjectile) {
            this.hydroAge++;
            this.vy = Math.sin(this.hydroAge * 0.2) * 1.5;
        }

        // Storm: gravity drift
        if (this.weaponType === WEAPON_STORM && this.isPlayerProjectile) {
            this.vy += 0.1;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Off-screen check
        if (game) {
            const cam = game.camera;
            if (cam) {
                if (this.x < cam.x - 32 || this.x > cam.x + cam.width + 32 ||
                    this.y < cam.y - 32 || this.y > cam.y + cam.height + 32) {
                    this.active = false;
                }
            }
        }
    }

    draw(ctx, camera) {
        if (!this.sprite) return;
        const drawX = Math.round((this.x - camera.x) * 2);
        const drawY = Math.round((this.y - camera.y) * 2);
        this.sprite.draw(ctx, drawX, drawY);
    }
}
