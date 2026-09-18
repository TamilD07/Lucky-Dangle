// Web Audio API Synthesizer for Lucky Dangle Sound Effects & Rituals
// Zero external audio files required - authentic oscillator & noise synthesis

class DangleAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Ghanta Bell Chime - Multi-harmonic bell sound with exponential decay
  public playBellSound() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const baseFreq = 880; // A5 pitch for a bright temple bell
    const harmonics = [
      { mult: 1.0, gain: 0.6, decay: 2.5 },
      { mult: 2.0, gain: 0.3, decay: 1.8 },
      { mult: 2.76, gain: 0.25, decay: 1.2 },
      { mult: 4.07, gain: 0.15, decay: 0.8 },
      { mult: 5.4, gain: 0.1, decay: 0.5 },
    ];

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, now);
    masterGain.connect(this.ctx.destination);

    harmonics.forEach(({ mult, gain, decay }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * mult, now);
      // Slight pitch wobble for metallic authenticity
      osc.frequency.exponentialRampToValueAtTime(baseFreq * mult * 0.998, now + decay);
      g.gain.setValueAtTime(gain, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + decay);
    });
  }

  // Soft swish/whoosh when flicking or swinging the charm fast
  public playFlickSound(intensity: number = 1.0) {
    this.init();
    if (!this.ctx || !this.enabled) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400 + Math.min(10, intensity) * 60, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      const volume = Math.min(0.35, 0.08 * Math.min(5, intensity));
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
    } catch {
      // Ignore audio failure
    }
  }

  // Sparkle chime sequence for rituals (painting Daruma eye, repainting Drishti, etc.)
  public playRitualSound(type: 'sparkle' | 'garland' | 'knot' | 'scarab' = 'sparkle') {
    this.init();
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const notes =
      type === 'garland'
        ? [523.25, 659.25, 783.99, 1046.5] // C major arpeggio
        : type === 'scarab'
        ? [440.0, 554.37, 659.25, 880.0, 1108.73] // Ancient Egyptian golden scale
        : [587.33, 739.99, 880.0, 1174.66]; // D major joyful sparkle

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const startTime = now + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }

  // Click/Snap sound for selecting charms or string materials
  public playSnapSound() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const audioSynth = new DangleAudio();
