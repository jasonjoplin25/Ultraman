import { CANVAS_WIDTH, CANVAS_HEIGHT, STARTING_LIVES, PLAYER_MAX_HP, WEAPON_BUSTER, WEAPON_MAX_ENERGY } from './constants.js';
import { Input } from './core/input.js';
import { Audio } from './core/audio.js';
import { Player } from './entities/player.js';
import { GameplayScene } from './scenes/gameplay.js';
import { TitleScreen } from './scenes/title-screen.js';
import { StageSelectScene } from './scenes/stage-select.js';
import { WeaponGetScene } from './scenes/weapon-get.js';
import { GameOverScene } from './scenes/game-over.js';
import { PauseMenuScene } from './scenes/pause-menu.js';
import { STAGE_FLAME } from './levels/stage-data/stage-flame.js';
import { STAGE_FROST } from './levels/stage-data/stage-frost.js';
import { STAGE_THUNDER } from './levels/stage-data/stage-thunder.js';
import { STAGE_BLADE } from './levels/stage-data/stage-blade.js';
import { STAGE_HYDRO } from './levels/stage-data/stage-hydro.js';
import { STAGE_STORM } from './levels/stage-data/stage-storm.js';
import { STAGE_CASTLE1 } from './levels/stage-data/stage-castle1.js';
import { STAGE_CASTLE2 } from './levels/stage-data/stage-castle2.js';
import { CreditsScene } from './scenes/credits.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.ctx.imageSmoothingEnabled = false;

        this.input = new Input();
        this.audio = new Audio();

        // Persistent game state
        this.player = null;
        this.defeatedBosses = [];
        this.currentStage = null;
        this._saveCache = null;
        this.hasSave = false;

        // Scenes
        this.scenes = {};
        this.currentScene = null;
        this.previousSceneName = null;
        this.currentSceneName = null;

        // Game loop
        this.running = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedStep = 1000 / 60;

        this.initScenes();
    }

    initScenes() {
        this.scenes.title = new TitleScreen(this);
        this.scenes.stageSelect = new StageSelectScene(this);
        this.scenes.gameplay = new GameplayScene(this);
        this.scenes.weaponGet = new WeaponGetScene(this);
        this.scenes.gameOver = new GameOverScene(this);
        this.scenes.pause = new PauseMenuScene(this);
        this.scenes.credits = new CreditsScene(this);

        // Register stages
        this.scenes.stageSelect.registerStage('flame', STAGE_FLAME);
        this.scenes.stageSelect.registerStage('frost', STAGE_FROST);
        this.scenes.stageSelect.registerStage('thunder', STAGE_THUNDER);
        this.scenes.stageSelect.registerStage('blade', STAGE_BLADE);
        this.scenes.stageSelect.registerStage('hydro', STAGE_HYDRO);
        this.scenes.stageSelect.registerStage('storm', STAGE_STORM);
        this.scenes.stageSelect.registerStage('castle1', STAGE_CASTLE1);
        this.scenes.stageSelect.registerStage('castle2', STAGE_CASTLE2);
    }

    switchScene(sceneName, data) {
        if (this.currentScene && this.currentScene.exit) {
            this.currentScene.exit();
        }

        this.previousSceneName = this.currentSceneName;
        this.currentSceneName = sceneName;
        this.currentScene = this.scenes[sceneName];

        if (data && sceneName === 'gameplay') {
            this.currentScene.loadStage(data);
        }

        if (this.currentScene && this.currentScene.enter) {
            this.currentScene.enter();
        }
    }

    startStage(stageData) {
        this.currentStage = stageData;
        // Create fresh player if none or reset HP
        if (!this.player) {
            this.player = new Player(0, 0);
        }
        this.player.hp = PLAYER_MAX_HP;
        this.player.isDead = false;
        this.switchScene('gameplay', stageData);
    }

    newGame() {
        this.player = null;
        this.defeatedBosses = [];
        this.currentStage = null;
    }

    // ===== SAVE / LOAD =====

    // Called once at startup — fetches the save from the server into memory.
    async initSave() {
        try {
            const res = await fetch('/api/save');
            if (res.ok) {
                const data = await res.json();
                this._saveCache = data || null;
                this.hasSave = !!data;
            }
        } catch (e) {
            console.warn('Save server unreachable:', e);
            this._saveCache = null;
            this.hasSave = false;
        }
    }

    // Fire-and-forget POST to server; keeps in-memory cache in sync.
    saveProgress() {
        const data = {
            defeatedBosses: this.defeatedBosses,
            weapons: this.player ? this.player.weapons : [],
            weaponEnergy: this.player ? this.player.weaponEnergy : {},
            lives: this.player ? this.player.lives : STARTING_LIVES,
        };
        this._saveCache = data;
        this.hasSave = true;
        fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).catch(e => console.warn('Could not save progress:', e));
    }

    // Synchronous — reads from in-memory cache populated by initSave().
    loadProgress() {
        const data = this._saveCache;
        if (!data) return false;
        try {
            this.defeatedBosses = data.defeatedBosses || [];
            if (!this.player) {
                this.player = new Player(0, 0);
            }
            this.player.lives = data.lives !== undefined ? data.lives : STARTING_LIVES;
            this.player.weapons = data.weapons || [WEAPON_BUSTER];
            this.player.weaponEnergy = data.weaponEnergy || {};
            return true;
        } catch (e) {
            console.warn('Could not load progress:', e);
            return false;
        }
    }

    // Fire-and-forget DELETE; clears in-memory cache.
    clearSave() {
        this._saveCache = null;
        this.hasSave = false;
        fetch('/api/save', { method: 'DELETE' })
            .catch(e => console.warn('Could not clear save:', e));
    }

    start() {
        this.running = true;
        this.switchScene('title');
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(timestamp) {
        if (!this.running) return;

        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.accumulator += Math.min(dt, 200);

        // Initialize audio on first input
        if (!this.audio.initialized && (this.input.held('jump') || this.input.held('shoot') || this.input.held('start'))) {
            this.audio.init();
        }

        while (this.accumulator >= this.fixedStep) {
            if (this.currentScene) {
                this.currentScene.update(this.fixedStep);
            }
            this.accumulator -= this.fixedStep;
        }

        // Clear per-frame input buffers after all updates are done
        this.input.endFrame();

        // Render
        this.ctx.imageSmoothingEnabled = false;
        if (this.currentScene) {
            this.currentScene.draw(this.ctx);
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}
