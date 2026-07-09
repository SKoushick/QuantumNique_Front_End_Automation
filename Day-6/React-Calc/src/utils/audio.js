// Web Audio API Synthesizer for VibeCalc (Underwater / Sub-Aquatic Edition)
class AudioSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  playClick(type = 'default') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;

    if (type === 'operator') {
      // Deeper watery "plop"
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'equals' || type === 'special') {
      // Double pop sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);

      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        const t2 = this.ctx.currentTime;
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(350, t2);
        osc2.frequency.exponentialRampToValueAtTime(1000, t2 + 0.08);
        gain2.gain.setValueAtTime(0.12, t2);
        gain2.gain.exponentialRampToValueAtTime(0.005, t2 + 0.08);
        osc2.start(t2);
        osc2.stop(t2 + 0.08);
      }, 60);
    } else {
      // Standard watery bubble pop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Water chime notes: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      // Add slight pitch rise to make it sound like rising bubbles
      osc.frequency.setValueAtTime(freq - 100, now + index * 0.07);
      osc.frequency.exponentialRampToValueAtTime(freq, now + index * 0.07 + 0.15);
      
      gain.gain.setValueAtTime(0, now + index * 0.07);
      gain.gain.linearRampToValueAtTime(0.12, now + index * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.005, now + index * 0.07 + 0.4);

      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.45);
    });
  }

  playError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;

    // Muffled low underwater rumble
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playLevelUp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Bubble sweep upward
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export const audioSynth = new AudioSynth();
