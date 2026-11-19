/**
 * Husky Firewall — Synthesized Retro Web Audio Engine
 * Pure Web Audio API chiptune SFX (zero external audio files).
 */
(function (global) {
  "use strict";

  const MUTE_STORAGE_KEY = "husky_firewall_muted";

  let audioCtx = null;
  let muted = loadMuteState();

  function loadMuteState() {
    try {
      return global.localStorage.getItem(MUTE_STORAGE_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function saveMuteState(value) {
    try {
      global.localStorage.setItem(MUTE_STORAGE_KEY, value ? "1" : "0");
    } catch (_) {
      // Ignore storage errors in restricted contexts
    }
  }

  function ensureContext() {
    if (!audioCtx) {
      const AudioContextCtor = global.AudioContext || global.webkitAudioContext;
      if (!AudioContextCtor) {
        return null;
      }
      audioCtx = new AudioContextCtor();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(function () {});
    }
    return audioCtx;
  }

  /**
   * Schedule a crisp retro oscillator note with linear attack and exponential decay.
   */
  function playTone(opts) {
    if (muted) return;
    const ctx = ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + (opts.delay || 0);
    const duration = opts.duration || 0.1;
    const gainPeak = opts.volume != null ? opts.volume : 0.12;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = opts.type || "square";
    osc.frequency.setValueAtTime(opts.freqStart, now);
    if (opts.freqEnd != null && opts.freqEnd !== opts.freqStart) {
      if (opts.expSlide) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.freqEnd), now + duration);
      } else {
        osc.frequency.linearRampToValueAtTime(opts.freqEnd, now + duration);
      }
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.015);
  }

  /**
   * Schedule a short filtered noise burst for retro crunch/impact.
   */
  function playNoiseBurst(opts) {
    if (muted) return;
    const ctx = ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + (opts.delay || 0);
    const duration = opts.duration || 0.08;
    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < sampleCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = opts.filterType || "bandpass";
    filter.frequency.setValueAtTime(opts.filterFreq || 1100, now);
    filter.Q.setValueAtTime(opts.q || 1.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(opts.volume != null ? opts.volume : 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration + 0.01);
  }

  const HuskyAudio = {
    unlock: function () {
      ensureContext();
    },

    isMuted: function () {
      return muted;
    },

    toggleMute: function () {
      muted = !muted;
      saveMuteState(muted);
      if (!muted) {
        ensureContext();
        playTone({ type: "square", freqStart: 660, freqEnd: 880, duration: 0.07, volume: 0.09 });
      }
      return muted;
    },

    playStart: function () {
      const notes = [330, 440, 554.37, 659.25];
      notes.forEach(function (freq, idx) {
        playTone({
          type: "square",
          freqStart: freq,
          duration: 0.08,
          delay: idx * 0.055,
          volume: 0.09
        });
      });
    },

    playPacketCatch: function (combo) {
      // Subtle pitch climb with active combo streak for satisfying arcade flow
      const stepBoost = Math.min(combo || 0, 14) * 24;
      const base = 520 + stepBoost;
      playTone({
        type: "square",
        freqStart: base,
        freqEnd: base * 1.15,
        duration: 0.065,
        volume: 0.09
      });
      playTone({
        type: "triangle",
        freqStart: base * 1.5,
        freqEnd: base * 1.65,
        duration: 0.085,
        delay: 0.045,
        volume: 0.1
      });
    },

    playMalwareBlock: function () {
      // Crisp cyber-shield deflection chirp + filtered zap
      playTone({
        type: "sawtooth",
        freqStart: 420,
        freqEnd: 170,
        expSlide: true,
        duration: 0.085,
        volume: 0.09
      });
      playTone({
        type: "square",
        freqStart: 780,
        freqEnd: 980,
        duration: 0.05,
        delay: 0.025,
        volume: 0.07
      });
      playNoiseBurst({ duration: 0.05, filterFreq: 1800, volume: 0.06 });
    },

    playPowerup: function () {
      // Bright 8-bit gold Overclock arpeggio
      const arp = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      arp.forEach(function (freq, idx) {
        playTone({
          type: "square",
          freqStart: freq,
          duration: 0.09,
          delay: idx * 0.048,
          volume: 0.1
        });
      });
    },

    playWaveUp: function () {
      const notes = [440, 587.33, 880];
      notes.forEach(function (freq, idx) {
        playTone({
          type: "triangle",
          freqStart: freq,
          duration: 0.1,
          delay: idx * 0.06,
          volume: 0.12
        });
      });
    },

    playBreach: function () {
      // Low warning buzzer + crunch
      playTone({
        type: "sawtooth",
        freqStart: 180,
        freqEnd: 72,
        expSlide: true,
        duration: 0.24,
        volume: 0.14
      });
      playTone({
        type: "square",
        freqStart: 135,
        freqEnd: 62,
        expSlide: true,
        duration: 0.22,
        delay: 0.04,
        volume: 0.11
      });
      playNoiseBurst({ duration: 0.16, filterType: "lowpass", filterFreq: 650, volume: 0.12 });
    },

    playPause: function (paused) {
      playTone({
        type: "square",
        freqStart: paused ? 480 : 360,
        freqEnd: paused ? 320 : 540,
        duration: 0.07,
        volume: 0.08
      });
    },

    playGameOver: function () {
      const melody = [
        { freq: 392.0, dur: 0.14, delay: 0.0 },
        { freq: 349.23, dur: 0.14, delay: 0.15 },
        { freq: 311.13, dur: 0.16, delay: 0.30 },
        { freq: 261.63, dur: 0.36, delay: 0.47 }
      ];
      melody.forEach(function (note) {
        playTone({
          type: "sawtooth",
          freqStart: note.freq,
          freqEnd: note.freq * 0.94,
          duration: note.dur,
          delay: note.delay,
          volume: 0.11
        });
      });
      playNoiseBurst({ duration: 0.2, delay: 0.45, filterType: "lowpass", filterFreq: 480, volume: 0.08 });
    }
  };

  global.HuskyAudio = HuskyAudio;
})(window);
