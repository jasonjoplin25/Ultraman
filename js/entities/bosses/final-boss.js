import { Boss } from './boss.js';
import { Sprite } from '../../graphics/sprite.js';
import { Projectile } from '../projectile.js';
import { GRAVITY, PLAYER_MAX_FALL, BOSS_MAX_HP } from '../../constants.js';
import { resolveEntityTileCollisions } from '../../core/collision.js';

// Final boss sprite (32x32)
const FB_SPRITE = [
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0],
    [0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0],
    [0,0,0,1,2,3,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,3,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,1,5,1,3,3,3,3,3,3,3,3,3,3,3,3,1,5,1,3,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,3,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0],
    [0,0,0,0,1,2,3,3,3,3,3,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,2,1,0,0,0,0],
    [0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,3,3,3,3,3,2,2,2,2,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,3,3,3,3,3,3,3,2,2,2,2,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0],
    [0,0,0,1,2,3,3,3,3,3,3,3,3,2,2,2,2,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,1,4,4,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,4,4,1,1,0],
    [0,1,4,4,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,4,4,1,0,0],
    [0,0,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,0,0,0],
    [0,0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,0,1,3,3,3,3,3,3,1,1,1,3,3,3,1,1,1,3,3,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,0,1,3,3,3,3,3,1,0,0,0,1,0,1,0,0,0,1,3,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,0,1,3,3,3,3,3,1,0,0,0,1,0,1,0,0,0,1,3,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,1,3,3,3,3,3,3,1,0,0,0,1,0,1,0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const FB_PALETTE = ['', '#000000', '#880088', '#dd44dd', '#f8b878', '#ff0000'];

export class FinalBoss extends Boss {
    constructor(x, y) {
        super(x, y, 28, 30);
        this.weakness = null; // no specific weakness
        this.weaponReward = null;
        this.maxHp = BOSS_MAX_HP * 2; // double HP
        this.hp = this.maxHp;
        this.sprite = new Sprite(FB_SPRITE, FB_PALETTE);
        this.contactDamage = 6;

        this.phase = 1;
        this.teleportTimer = 0;
    }

    update(dt, game) {
        if (this.updateBase(dt, game)) return;

        this.stateTimer++;
        this.vy += GRAVITY;
        this.vy = Math.min(this.vy, PLAYER_MAX_FALL);

        switch (this.state) {
            case 'idle':
                this.vx = 0;
                if (this.stateTimer > 45) this.chooseAction(game);
                break;

            case 'teleport':
                this.vx = 0;
                this.vy = 0;
                if (this.stateTimer === 15) {
                    // Teleport to random position
                    const camX = game.camera.x;
                    this.x = camX + 40 + Math.random() * (game.camera.width - 80);
                    this.y = game.camera.y + 20;
                }
                if (this.stateTimer > 30) this.setState('attack');
                break;

            case 'attack':
                if (this.stateTimer === 1) {
                    this.fireSpread(game);
                }
                if (this.stateTimer > 40) this.setState('idle');
                break;

            case 'barrage':
                if (this.stateTimer % 8 === 1 && this.stateTimer < 80) {
                    this.fireAtPlayer(game);
                }
                if (this.stateTimer > 100) this.setState('teleport');
                break;

            case 'slam':
                if (this.stateTimer === 1) {
                    this.vy = -10;
                    const px = game.camera.x + game.camera.width / 2;
                    this.vx = px > this.centerX ? 3 : -3;
                }
                if (this.onGround && this.stateTimer > 10) {
                    if (game.camera) game.camera.shake(5, 15);
                    this.fireSpread(game);
                    this.setState('idle');
                }
                break;
        }

        this.onGround = false;
        resolveEntityTileCollisions(this, game.tileGrid);

        const playerX = game.camera.x + game.camera.width / 2;
        this.facing = playerX > this.centerX ? 1 : -1;
    }

    chooseAction(game) {
        const roll = Math.random();
        if (this.phase >= 2 && roll < 0.25) {
            this.setState('slam');
        } else if (roll < 0.45) {
            this.setState('teleport');
        } else if (roll < 0.7) {
            this.setState('barrage');
        } else {
            this.setState('attack');
        }
    }

    setState(s) { this.state = s; this.stateTimer = 0; }

    onPhaseChange(game) {
        if (game.camera) game.camera.shake(6, 40);
        this.contactDamage = 8;
    }

    fireSpread(game) {
        for (let i = -2; i <= 2; i++) {
            const angle = (Math.PI / 2) + (i * Math.PI / 8);
            const proj = Projectile.createEnemyShot(
                this.centerX, this.centerY,
                Math.cos(angle) * 3,
                Math.sin(angle) * 3
            );
            proj.damage = 4;
            game.projectiles.push(proj);
        }
    }

    fireAtPlayer(game) {
        const px = game.camera.x + game.camera.width / 2;
        const py = game.camera.y + game.camera.height / 2;
        const dx = px - this.centerX;
        const dy = py - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const proj = Projectile.createEnemyShot(
            this.centerX, this.centerY,
            (dx / dist) * 4, (dy / dist) * 4
        );
        proj.damage = 4;
        game.projectiles.push(proj);
    }

    draw(ctx, camera) { this.drawBase(ctx, camera, this.sprite); }
}
