import { Boss } from './boss.js';
import { Sprite } from '../../graphics/sprite.js';
import { Projectile } from '../projectile.js';
import { GRAVITY, PLAYER_MAX_FALL, BOSS_MAX_HP } from '../../constants.js';
import { resolveEntityTileCollisions } from '../../core/collision.js';

// Heavy Gunner — 24x28 sprite
const CK_SPRITE = [
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0,0],
    [0,0,1,2,3,3,1,1,1,3,3,3,3,3,1,1,1,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,1,4,1,3,3,3,3,3,1,4,1,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,1,1,1,3,1,1,1,3,1,1,1,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,1,5,1,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,0,1,2,2,3,3,3,3,1,1,1,3,3,3,2,2,2,2,1,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,0],
    [1,2,2,2,3,3,3,3,2,2,2,2,2,2,2,2,3,3,3,3,2,2,2,1],
    [1,2,3,3,3,3,3,3,2,2,2,2,2,2,2,2,3,3,3,3,3,3,2,1],
    [1,2,4,4,3,3,3,3,2,2,2,2,2,2,2,2,3,3,3,3,4,4,2,1],
    [1,2,2,2,3,3,3,3,2,2,2,2,2,2,2,2,3,3,3,3,2,2,2,1],
    [0,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0,0,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,3,3,2,1,0,0,0,0,0,0,1,2,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,2,1,0,0,0,0,0,0,1,2,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,2,1,0,0,0,0,0,0,1,2,3,3,2,1,0,0,0],
    [0,0,1,2,2,3,3,2,2,1,0,0,0,0,1,2,2,3,3,2,2,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];
const CK_PALETTE = ['', '#000000', '#444444', '#888888', '#3cbcfc', '#fcfcfc'];

export class CastleBoss extends Boss {
    constructor(x, y) {
        super(x, y, 22, 26);
        this.weakness = null; // takes equal damage from all weapons
        this.weaponReward = null;
        this.maxHp = Math.floor(BOSS_MAX_HP * 1.5); // 42 HP
        this.hp = this.maxHp;
        this.sprite = new Sprite(CK_SPRITE, CK_PALETTE);
        this.spriteOffsetX = -1;
        this.contactDamage = 5;
        this.spawnX = x;
        this.facing = -1; // starts facing left (toward player)
    }

    update(dt, game) {
        if (this.updateBase(dt, game)) return;

        this.stateTimer++;
        this.vy += GRAVITY;
        this.vy = Math.min(this.vy, PLAYER_MAX_FALL);

        const playerX = game.player ? game.player.centerX : (game.camera.x + game.camera.width / 2);

        switch (this.state) {
            case 'idle':
                this.vx = 0;
                if (this.stateTimer > 40) this.chooseAction(game, playerX);
                break;

            case 'walk':
                this.vx = this.facing * (this.phase === 2 ? 2 : 1.5);
                if (this.stateTimer > 80) this.setState('idle');
                break;

            case 'shoot':
                this.vx = 0;
                if (this.stateTimer === 20) this.fireSpread(game, playerX);
                if (this.phase === 2 && this.stateTimer === 45) this.fireSpread(game, playerX);
                if (this.stateTimer > 70) this.setState('idle');
                break;

            case 'jump':
                if (this.stateTimer === 1) {
                    this.vy = -9;
                    this.vx = this.facing * 2;
                }
                if (this.onGround && this.stateTimer > 10) {
                    this.fireSpread(game, playerX);
                    this.setState('idle');
                }
                break;

            case 'charge':
                if (this.stateTimer === 1) {
                    this.vx = this.facing * (this.phase === 2 ? 5 : 4);
                }
                if (this.stateTimer > 50) {
                    this.vx = 0;
                    this.setState('idle');
                }
                break;
        }

        this.onGround = false;
        resolveEntityTileCollisions(this, game.tileGrid);

        // Clamp to boss room
        this.x = Math.max(this.spawnX - 140, Math.min(this.spawnX + 60, this.x));

        this.facing = playerX > this.centerX ? 1 : -1;
    }

    chooseAction(game, playerX) {
        const roll = Math.random();
        if (this.phase === 2) {
            if (roll < 0.25) this.setState('charge');
            else if (roll < 0.55) this.setState('shoot');
            else if (roll < 0.75) this.setState('jump');
            else this.setState('walk');
        } else {
            if (roll < 0.4) this.setState('shoot');
            else if (roll < 0.6) this.setState('jump');
            else if (roll < 0.8) this.setState('walk');
            else this.setState('charge');
        }
    }

    setState(s) { this.state = s; this.stateTimer = 0; }

    fireSpread(game, playerX) {
        // 3-way spread aimed at player
        const dy = game.player ? (game.player.centerY - this.centerY) : 0;
        const dx = playerX - this.centerX;
        const baseDist = Math.sqrt(dx * dx + dy * dy) || 1;
        const baseAngle = Math.atan2(dy, dx);

        for (let i = -1; i <= 1; i++) {
            const angle = baseAngle + i * (Math.PI / 10);
            const proj = Projectile.createEnemyShot(
                this.centerX + Math.cos(baseAngle) * 14,
                this.centerY,
                Math.cos(angle) * 3.5,
                Math.sin(angle) * 3.5
            );
            proj.damage = 3;
            game.projectiles.push(proj);
        }
        if (game.audio) game.audio.play('boss_hit');
    }

    onPhaseChange(game) {
        if (game.camera) game.camera.shake(5, 30);
        this.contactDamage = 6;
    }

    draw(ctx, camera) {
        this.drawBase(ctx, camera, this.sprite);
    }
}
