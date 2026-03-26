// ================================================================
//  DANGEROUS HARVEST — Audio System
//  Procedural chiptune music + sound effects (Web Audio API)
// ================================================================

const AudioSystem = (() => {
    let audioCtx = null;
    let masterGain = null;
    let musicGain = null;
    let sfxGain = null;
    let isMuted = false;
    let musicPlaying = false;
    let musicIntervalId = null;
    let currentStep = 0;

    const BPM = 140;
    const STEP_TIME = 60 / BPM / 2;

    // Notes in Hz (octave 3-5)
    const NOTE = {
        C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
        C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
        C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
        REST: 0,
    };

    // Melody: eerie farm theme that gets tense
    const melody = [
        NOTE.E4, NOTE.G4, NOTE.A4, NOTE.G4,
        NOTE.E4, NOTE.D4, NOTE.C4, NOTE.REST,
        NOTE.E4, NOTE.G4, NOTE.A4, NOTE.B4,
        NOTE.C5, NOTE.REST, NOTE.B4, NOTE.G4,

        NOTE.A4, NOTE.G4, NOTE.E4, NOTE.D4,
        NOTE.C4, NOTE.D4, NOTE.E4, NOTE.REST,
        NOTE.G4, NOTE.A4, NOTE.G4, NOTE.E4,
        NOTE.D4, NOTE.C4, NOTE.D4, NOTE.REST,
    ];

    // Bass line
    const bass = [
        NOTE.C3, NOTE.REST, NOTE.C3, NOTE.REST,
        NOTE.G3, NOTE.REST, NOTE.G3, NOTE.REST,
        NOTE.A3, NOTE.REST, NOTE.A3, NOTE.REST,
        NOTE.E3, NOTE.REST, NOTE.E3, NOTE.REST,

        NOTE.F3, NOTE.REST, NOTE.F3, NOTE.REST,
        NOTE.C3, NOTE.REST, NOTE.C3, NOTE.REST,
        NOTE.G3, NOTE.REST, NOTE.G3, NOTE.REST,
        NOTE.C3, NOTE.REST, NOTE.G3, NOTE.REST,
    ];

    function init() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(audioCtx.destination);

        musicGain = audioCtx.createGain();
        musicGain.gain.value = 0.35;
        musicGain.connect(masterGain);

        sfxGain = audioCtx.createGain();
        sfxGain.gain.value = 0.6;
        sfxGain.connect(masterGain);
    }

    function playNote(freq, duration, gainNode, type, volume) {
        if (!audioCtx || freq === 0) return;

        const osc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();

        osc.type = type || "square";
        osc.frequency.value = freq;

        noteGain.gain.setValueAtTime((volume || 0.3), audioCtx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    }

    function playMusicStep() {
        const idx = currentStep % melody.length;

        playNote(melody[idx], STEP_TIME * 0.9, musicGain, "square", 0.2);
        playNote(bass[idx], STEP_TIME * 0.8, musicGain, "triangle", 0.35);

        // Hi-hat on even steps
        if (currentStep % 2 === 0) {
            playNoise(0.05, musicGain, 0.08);
        }
        // Kick on every 4 steps
        if (currentStep % 4 === 0) {
            playKick();
        }

        currentStep++;
    }

    function playNoise(duration, gainNode, volume) {
        if (!audioCtx) return;
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(volume || 0.1, audioCtx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        const filter = audioCtx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 8000;

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(gainNode);

        noise.start();
    }

    function playKick() {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const kickGain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.12);

        kickGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

        osc.connect(kickGain);
        kickGain.connect(musicGain);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
    }

    // ============ PUBLIC API ============

    function startMusic() {
        init();
        if (musicPlaying) return;
        musicPlaying = true;
        currentStep = 0;
        musicIntervalId = setInterval(playMusicStep, STEP_TIME * 1000);
    }

    function stopMusic() {
        musicPlaying = false;
        if (musicIntervalId) {
            clearInterval(musicIntervalId);
            musicIntervalId = null;
        }
    }

    function sfxCollect() {
        init();
        playNote(NOTE.E5, 0.08, sfxGain, "square", 0.25);
        setTimeout(() => playNote(NOTE.G5, 0.12, sfxGain, "square", 0.2), 60);
    }

    function sfxHit() {
        init();
        playNote(NOTE.C3, 0.25, sfxGain, "sawtooth", 0.4);
        playNoise(0.15, sfxGain, 0.3);
    }

    function sfxGameOver() {
        init();
        stopMusic();
        const notes = [NOTE.E4, NOTE.D4, NOTE.C4, NOTE.B3, NOTE.A3];
        notes.forEach((note, i) => {
            setTimeout(() => playNote(note, 0.3, sfxGain, "square", 0.3), i * 200);
        });
    }

    function sfxWave() {
        init();
        const notes = [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5];
        notes.forEach((note, i) => {
            setTimeout(() => playNote(note, 0.15, sfxGain, "square", 0.2), i * 80);
        });
    }

    function sfxNothingSafe() {
        init();
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                playNote(NOTE.C3 + Math.random() * 100, 0.1, sfxGain, "sawtooth", 0.3);
                playNoise(0.08, sfxGain, 0.2);
            }, i * 100);
        }
    }

    function toggleMute() {
        init();
        isMuted = !isMuted;
        masterGain.gain.value = isMuted ? 0 : 0.5;
        return isMuted;
    }

    function getMuted() {
        return isMuted;
    }

    return {
        startMusic,
        stopMusic,
        sfxCollect,
        sfxHit,
        sfxGameOver,
        sfxWave,
        sfxNothingSafe,
        toggleMute,
        getMuted,
    };
})();
