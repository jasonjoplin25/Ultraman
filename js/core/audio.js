export class Audio {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            this.enabled = false;
        }
    }

    play(sound) {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        switch (sound) {
            case 'jump': this.playTone(440, 0.08, 'square', 0.15); break;
            case 'shoot': this.playNoise(0.05, 800, 0.2); break;
            case 'hit': this.playTone(200, 0.15, 'sawtooth', 0.2); break;
            case 'enemy_hit': this.playTone(300, 0.08, 'square', 0.15); break;
            case 'death': this.playDescendingTone(400, 100, 0.5, 0.25); break;
            case 'pickup': this.playAscendingTone(500, 800, 0.1, 0.15); break;
            case 'boss_hit': this.playTone(150, 0.2, 'sawtooth', 0.25); break;
            case 'weapon_get': this.playAscendingTone(400, 1200, 0.5, 0.2); break;
            case 'select': this.playTone(600, 0.05, 'square', 0.1); break;
            case 'pause': this.playTone(500, 0.1, 'square', 0.15); break;
            case 'gate': this.playTone(100, 0.3, 'square', 0.2); break;
            case 'explosion': this.playNoise(0.3, 200, 0.3); break;
            case 'life': this.playAscendingTone(600, 1400, 0.3, 0.2); break;
        }
    }

    playTone(freq, duration, type, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration, filterFreq, volume) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;
        const gain = this.ctx.createGain();
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        source.start();
    }

    playDescendingTone(startFreq, endFreq, duration, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = startFreq;
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playAscendingTone(startFreq, endFreq, duration, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = startFreq;
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
}
