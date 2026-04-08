// Animation definitions
// Each animation is an array of { sprite key, duration in frames }

export const PLAYER_ANIMS = {
    idle: {
        frames: ['stand'],
        frameDuration: 1,
        loop: true,
    },
    run: {
        frames: ['run1', 'run2', 'run1', 'run3'],
        frameDuration: 8,
        loop: true,
    },
    jump: {
        frames: ['jump'],
        frameDuration: 1,
        loop: false,
    },
    shoot: {
        frames: ['shoot'],
        frameDuration: 12,
        loop: false,
    },
    climb: {
        frames: ['climb1', 'climb2'],
        frameDuration: 10,
        loop: true,
    },
    damage: {
        frames: ['damage'],
        frameDuration: 1,
        loop: false,
    },
};

export class AnimationController {
    constructor(animations, spriteMap) {
        this.animations = animations;
        this.spriteMap = spriteMap;
        this.currentAnim = null;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.finished = false;
    }

    play(animName) {
        if (this.currentAnim === animName) return;
        this.currentAnim = animName;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.finished = false;
    }

    setSprites(spriteMap) {
        this.spriteMap = spriteMap;
    }

    update() {
        if (!this.currentAnim) return;
        const anim = this.animations[this.currentAnim];
        if (!anim) return;

        this.frameTimer++;
        if (this.frameTimer >= anim.frameDuration) {
            this.frameTimer = 0;
            this.currentFrame++;
            if (this.currentFrame >= anim.frames.length) {
                if (anim.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = anim.frames.length - 1;
                    this.finished = true;
                }
            }
        }
    }

    getCurrentSprite() {
        if (!this.currentAnim) return null;
        const anim = this.animations[this.currentAnim];
        if (!anim) return null;
        const frameKey = anim.frames[this.currentFrame];
        return this.spriteMap[frameKey] || null;
    }
}
