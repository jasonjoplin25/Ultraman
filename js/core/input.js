export class Input {
    constructor() {
        this.keys = {};
        this.previousKeys = {};
        // Buffer justPressed so it survives multiple fixed steps per frame
        this.pressedThisFrame = {};
        this.releasedThisFrame = {};

        this.keyMap = {
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'KeyZ': 'jump',
            'KeyX': 'shoot',
            'Enter': 'start',
            'Escape': 'pause',
            'ShiftLeft': 'weapon_prev',
            'ShiftRight': 'weapon_next',
        };

        window.addEventListener('keydown', (e) => {
            const action = this.keyMap[e.code];
            if (action) {
                e.preventDefault();
                if (!this.keys[action]) {
                    this.pressedThisFrame[action] = true;
                }
                this.keys[action] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            const action = this.keyMap[e.code];
            if (action) {
                e.preventDefault();
                this.releasedThisFrame[action] = true;
                this.keys[action] = false;
            }
        });
    }

    // Call once per frame AFTER all updates
    endFrame() {
        this.pressedThisFrame = {};
        this.releasedThisFrame = {};
    }

    held(action) {
        return !!this.keys[action];
    }

    justPressed(action) {
        return !!this.pressedThisFrame[action];
    }

    justReleased(action) {
        return !!this.releasedThisFrame[action];
    }
}
