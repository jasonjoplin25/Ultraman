import { Entity } from '../entity.js';
import { BOSS_MAX_HP, WEAKNESS_DAMAGE, PLAYER_SHOT_DAMAGE } from '../../constants.js';

export class Boss extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.hp = BOSS_MAX_HP;
        this.maxHp = BOSS_MAX_HP;
        this.contactDamage = 4;
        this.weakness = null; // weapon type this boss is weak to
        this.weaponReward = null; // weapon given on defeat
        this.invulnerable = false;
        this.invincibleTimer = 0;
        this.phase = 1;
        this.state = 'idle';
        this.stateTimer = 0;
        this.defeated = false;
        this.defeatTimer = 0;
        this.introTimer = 0;
        this.introPhase = true;
        this.flashTimer = 0;
    }

    takeDamage(amount, weaponType, game) {
        if (this.invulnerable || this.invincibleTimer > 0 || this.defeated) return;

        let dmg = amount;
        if (weaponType === this.weakness) {
            dmg = WEAKNESS_DAMAGE;
        }

        this.hp -= dmg;
        this.invincibleTimer = 15;
        this.flashTimer = 10;

        if (game.audio) game.audio.play('boss_hit');

        if (this.hp <= 0) {
            this.hp = 0;
            this.onDefeated(game);
        }

        // Phase change at half health
        if (this.hp <= this.maxHp / 2 && this.phase === 1) {
            this.phase = 2;
            this.onPhaseChange(game);
        }
    }

    onDefeated(game) {
        this.defeated = true;
        this.defeatTimer = 0;
        if (game.audio) game.audio.play('explosion');
        if (game.effects) {
            game.effects.spawnExplosion(this.centerX, this.centerY);
        }
    }

    onPhaseChange(game) {
        // Override in subclass for phase 2 behavior changes
    }

    updateBase(dt, game) {
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.flashTimer > 0) this.flashTimer--;

        if (this.defeated) {
            this.defeatTimer++;
            // Explosion sequence
            if (this.defeatTimer % 8 === 0 && this.defeatTimer < 120) {
                const ox = (Math.random() - 0.5) * this.w;
                const oy = (Math.random() - 0.5) * this.h;
                if (game.effects) {
                    game.effects.spawnExplosion(this.centerX + ox, this.centerY + oy);
                }
                if (game.audio) game.audio.play('explosion');
            }
            if (this.defeatTimer >= 150) {
                this.active = false;
                // Trigger weapon get scene
            }
            return true; // signal that boss is in defeat sequence
        }

        if (this.introPhase) {
            this.introTimer++;
            if (this.introTimer >= 60) {
                this.introPhase = false;
            }
            return true;
        }

        return false;
    }

    drawBase(ctx, camera, sprite) {
        if (this.defeated && this.defeatTimer >= 120) return;

        // Flash when hit
        if (this.flashTimer > 0 && Math.floor(this.flashTimer / 2) % 2 === 0) return;

        const screenX = Math.round((this.x - camera.x) * 2);
        const screenY = Math.round((this.y - camera.y) * 2);
        if (sprite) {
            sprite.draw(ctx, screenX, screenY, this.facing === -1);
        }
    }
}
