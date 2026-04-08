import { Entity } from '../entity.js';
import { ENEMY_CONTACT_DAMAGE, GRAVITY, PLAYER_MAX_FALL, TILE_SIZE } from '../../constants.js';
import { resolveEntityTileCollisions } from '../../core/collision.js';

export class Enemy extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.hp = 3;
        this.contactDamage = ENEMY_CONTACT_DAMAGE;
        this.invulnerable = false;
        this.spawnX = x;
        this.spawnY = y;
        this.activated = false;
        this.dropChance = 0.3;
    }

    takeDamage(amount, weaponType, game) {
        if (this.invulnerable) return;

        this.hp -= amount;
        if (game.audio) game.audio.play('enemy_hit');

        if (this.hp <= 0) {
            this.die(game);
        }
    }

    die(game) {
        this.active = false;
        if (game.effects) {
            game.effects.spawnExplosion(this.centerX, this.centerY);
        }
        if (game.audio) game.audio.play('explosion');

        // Drop items
        if (Math.random() < this.dropChance && game.enemies) {
            this.spawnDrop(game);
        }
    }

    spawnDrop(game) {
        // Drops are handled by gameplay scene - we'd need a callback
        // For now, this is a placeholder - pickups will be spawned by gameplay
    }

    applyGravity() {
        this.vy += GRAVITY;
        this.vy = Math.min(this.vy, PLAYER_MAX_FALL);
    }

    resolveCollisions(tileGrid) {
        this.onGround = false;
        resolveEntityTileCollisions(this, tileGrid);
    }

    isOnScreen(camera) {
        return (
            this.x + this.w > camera.x - TILE_SIZE &&
            this.x < camera.x + camera.width + TILE_SIZE &&
            this.y + this.h > camera.y - TILE_SIZE &&
            this.y < camera.y + camera.height + TILE_SIZE
        );
    }
}
