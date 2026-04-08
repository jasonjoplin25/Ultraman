import { Entity } from './entity.js';
import { Sprite } from '../graphics/sprite.js';
import {
    PICKUP_SMALL_HP, PICKUP_LARGE_HP,
    HP_PICKUP_PALETTE, ENERGY_PICKUP_PALETTE, LIFE_PICKUP_PALETTE, FULL_HP_PICKUP_PALETTE
} from '../graphics/sprite-data.js';
import { SMALL_HP, LARGE_HP, SMALL_ENERGY, LARGE_ENERGY, PLAYER_MAX_HP, WEAPON_MAX_ENERGY } from '../constants.js';

export class Pickup extends Entity {
    constructor(x, y, type, permanent = true) {
        super(x, y, 8, 8);
        this.type = type;
        this.bobPhase = Math.random() * Math.PI * 2;
        this.startY = y;
        // Map-placed pickups are permanent; enemy drops can pass permanent=false
        this.lifetime = permanent ? Infinity : 300;

        // Set sprite based on type
        switch (type) {
            case 'small_hp':
                this.sprite = new Sprite(PICKUP_SMALL_HP, HP_PICKUP_PALETTE);
                break;
            case 'large_hp':
                this.sprite = new Sprite(PICKUP_LARGE_HP, HP_PICKUP_PALETTE);
                this.w = 10;
                this.h = 10;
                break;
            case 'full_hp':
                this.sprite = new Sprite(PICKUP_LARGE_HP, FULL_HP_PICKUP_PALETTE);
                this.w = 10;
                this.h = 10;
                break;
            case 'small_energy':
                this.sprite = new Sprite(PICKUP_SMALL_HP, ENERGY_PICKUP_PALETTE);
                break;
            case 'large_energy':
                this.sprite = new Sprite(PICKUP_LARGE_HP, ENERGY_PICKUP_PALETTE);
                this.w = 10;
                this.h = 10;
                break;
            case 'life':
                this.sprite = new Sprite(PICKUP_SMALL_HP, LIFE_PICKUP_PALETTE);
                break;
        }
    }

    update(dt) {
        this.bobPhase += 0.05;
        this.y = this.startY + Math.sin(this.bobPhase) * 2;

        if (this.lifetime !== Infinity) {
            this.lifetime--;
            if (this.lifetime <= 0) this.active = false;
        }
    }

    collect(player, game) {
        this.active = false;
        if (game.audio) game.audio.play('pickup');

        switch (this.type) {
            case 'small_hp':
                player.hp = Math.min(player.hp + SMALL_HP, PLAYER_MAX_HP);
                break;
            case 'large_hp':
                player.hp = Math.min(player.hp + LARGE_HP, PLAYER_MAX_HP);
                break;
            case 'full_hp':
                player.hp = PLAYER_MAX_HP;
                break;
            case 'small_energy':
                if (player.currentWeapon !== 'buster') {
                    player.weaponEnergy[player.currentWeapon] = Math.min(
                        (player.weaponEnergy[player.currentWeapon] || 0) + SMALL_ENERGY,
                        WEAPON_MAX_ENERGY
                    );
                }
                break;
            case 'large_energy':
                if (player.currentWeapon !== 'buster') {
                    player.weaponEnergy[player.currentWeapon] = Math.min(
                        (player.weaponEnergy[player.currentWeapon] || 0) + LARGE_ENERGY,
                        WEAPON_MAX_ENERGY
                    );
                }
                break;
            case 'life':
                player.lives++;
                if (game.audio) game.audio.play('life');
                break;
        }
    }

    draw(ctx, camera) {
        if (!this.sprite) return;
        const screenX = Math.round((this.x - camera.x) * 2);
        const screenY = Math.round((this.y - camera.y) * 2);
        this.sprite.draw(ctx, screenX, screenY);
    }
}
