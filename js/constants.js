// Display
export const CANVAS_WIDTH = 512;
export const CANVAS_HEIGHT = 480;
export const TILE_SIZE = 16;
export const SCALE = 2;
export const SCALED_TILE = TILE_SIZE * SCALE;

// Physics (per frame at 60 FPS)
export const GRAVITY = 0.4;
export const PLAYER_WALK_SPEED = 2.5;
export const PLAYER_JUMP_VELOCITY = -8.0;
export const PLAYER_MAX_FALL = 12.0;
export const PLAYER_CLIMB_SPEED = 1.5;
export const PROJECTILE_SPEED = 6.0;
export const MAX_PLAYER_PROJECTILES = 3;

// Combat
export const PLAYER_MAX_HP = 28;
export const BOSS_MAX_HP = 28;
export const INVINCIBILITY_FRAMES = 90;
export const KNOCKBACK_VX = 3.0;
export const KNOCKBACK_VY = -4.0;
export const PLAYER_SHOT_DAMAGE = 1;
export const WEAKNESS_DAMAGE = 3;
export const ENEMY_CONTACT_DAMAGE = 3;
export const SPIKE_DAMAGE = Infinity;

// Items
export const SMALL_HP = 2;
export const LARGE_HP = 10;
export const SMALL_ENERGY = 2;
export const LARGE_ENERGY = 10;
export const STARTING_LIVES = 3;

// Weapon HUD bar colors (index 2=dark, 3=light per weapon palette)
export const WEAPON_COLORS = {
    buster:  { dark: '#0058f8', light: '#3cbcfc' },
    flame:   { dark: '#a81000', light: '#f83800' },
    ice:     { dark: '#0088a8', light: '#40d0f8' },
    thunder: { dark: '#a86800', light: '#f8d800' },
    blade:   { dark: '#606060', light: '#b0b0b0' },
    hydro:   { dark: '#0044a8', light: '#10a8f8' },
    storm:   { dark: '#5010a0', light: '#b050f8' },
};

// Player sprite palettes per weapon
// Format: ['', outline, dark, light, skin, white]
export const WEAPON_PALETTES = {
    buster:  ['', '#000000', '#0058f8', '#3cbcfc', '#f8b878', '#fcfcfc'],
    flame:   ['', '#000000', '#a81000', '#f83800', '#f8b878', '#fcfcfc'],
    ice:     ['', '#000000', '#0088a8', '#40d0f8', '#f8b878', '#fcfcfc'],
    thunder: ['', '#000000', '#a86800', '#f8d800', '#f8b878', '#fcfcfc'],
    blade:   ['', '#000000', '#606060', '#b0b0b0', '#f8b878', '#fcfcfc'],
    hydro:   ['', '#000000', '#0044a8', '#10a8f8', '#f8b878', '#fcfcfc'],
    storm:   ['', '#000000', '#5010a0', '#b050f8', '#f8b878', '#fcfcfc'],
};

// Weapons
export const WEAPON_BUSTER = 'buster';
export const WEAPON_FLAME = 'flame';
export const WEAPON_ICE = 'ice';
export const WEAPON_THUNDER = 'thunder';
export const WEAPON_BLADE = 'blade';
export const WEAPON_HYDRO = 'hydro';
export const WEAPON_STORM = 'storm';
export const WEAPON_MAX_ENERGY = 28;

// Colors
export const COLORS = {
    // Player palette
    PLAYER_OUTLINE: '#000000',
    PLAYER_DARK: '#0058f8',
    PLAYER_LIGHT: '#3cbcfc',
    PLAYER_SKIN: '#f8b878',
    PLAYER_WHITE: '#fcfcfc',

    // Flame palette
    FLAME_DARK: '#a81000',
    FLAME_MID: '#f83800',
    FLAME_LIGHT: '#fca044',

    // Ice palette
    ICE_DARK: '#0058f8',
    ICE_MID: '#3cbcfc',
    ICE_LIGHT: '#b8d8f8',

    // Thunder palette
    THUNDER_DARK: '#e45c10',
    THUNDER_MID: '#f8d800',
    THUNDER_LIGHT: '#fcfcfc',

    // Blade palette
    BLADE_DARK: '#888888',
    BLADE_MID: '#bcbcbc',
    BLADE_LIGHT: '#fcfcfc',

    // Environment
    SKY: '#3cbcfc',
    BLACK: '#000000',
    WHITE: '#fcfcfc',
    DARK_GRAY: '#444444',
    MID_GRAY: '#888888',
    LIGHT_GRAY: '#bcbcbc',
    HP_BAR: '#f83800',
    HP_BAR_BG: '#000000',
    BOSS_HP_BAR: '#f83800',
    WEAPON_ENERGY: '#f8d800',
};

// Tile types
export const TILE = {
    AIR: 0,
    SOLID: 1,
    SPIKE: 2,
    LADDER: 3,
    LADDER_TOP: 4,
    PLATFORM: 5, // one-way platform
    CHECKPOINT: 6,
    BOSS_GATE: 7,
    WATER_CURRENT_R: 8,
    WATER_CURRENT_L: 9,
    BOUNCE: 10,
    CRUMBLE: 11,
};

// Directions
export const DIR = {
    LEFT: -1,
    RIGHT: 1,
};
