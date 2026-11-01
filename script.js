/**
 * FRACTURE – The Endless Mind Trap
 * A pure Vanilla JavaScript 2D arcade survival game.
 * Zero external libraries or frameworks.
 */

// ============================================================================
// 1. PROCEDURAL WEB AUDIO SYNTHESIZER
// ============================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.isMuted = false;
    this.masterVol = 0.8;
    this.sfxVol = 0.85;
    this.bgmVol = 0.65;
    this.bgmStep = 0;
    this.bgmTimer = null;
    this.currentPhase = 1;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.bgmVol, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolumes(master, sfx, bgm) {
    this.masterVol = master;
    this.sfxVol = sfx;
    this.bgmVol = bgm;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, now);
    this.sfxGain.gain.setValueAtTime(this.sfxVol, now);
    this.bgmGain.gain.setValueAtTime(this.bgmVol, now);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // UI Click sound
  playClick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Fragment pickup chime with ascending scale according to combo
  playPickup(comboLevel = 1) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const baseFreqs = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    const index = Math.min(Math.floor(comboLevel - 1), baseFreqs.length - 1);
    const freq = baseFreqs[Math.max(0, index)];

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Dash sound with filtered white noise / whoosh
  playDash() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Power-up collect chime (bright arpeggiated chord)
  playPowerup() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + i * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  // Shield break glass shatter
  playShieldBreak() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Fracture warning siren
  playFractureWarning() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(640, now + 0.15);
    osc.frequency.linearRampToValueAtTime(320, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Fracture explosion drop
  playFractureDrop() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Game over death explosion
  playGameOver() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.85);
  }

  // Dynamic BGM Arpeggiator / Pulse Drone
  startBGM(phase = 1) {
    this.stopBGM();
    this.currentPhase = phase;
    this.ensureContext();
    if (!this.ctx) return;

    const bpm = 120 + (phase - 1) * 12; // Speeds up as fracture phases advance
    const stepInterval = (60 / bpm) / 4 * 1000;

    const scales = {
      1: [130.81, 164.81, 196.00, 246.94], // C minor / Cyber Void
      2: [146.83, 174.61, 220.00, 261.63], // D minor / Neon Nexus
      3: [164.81, 196.00, 246.94, 293.66], // E minor / Quantum Flux
      4: [174.61, 207.65, 261.63, 311.13], // F minor / Glitch Abyss
      5: [196.00, 246.94, 293.66, 369.99]  // G minor / Singularity
    };

    const notes = scales[Math.min(phase, 5)] || scales[1];

    this.bgmTimer = setInterval(() => {
      if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;
      this.bgmStep = (this.bgmStep + 1) % 16;

      // Bass pulse on quarter notes
      if (this.bgmStep % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(notes[0] / 2, now);

        bassGain.gain.setValueAtTime(0.18, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + 0.15);
      }

      // Arp note on 16th beats
      if (this.bgmStep % 2 === 0) {
        const noteIdx = (this.bgmStep / 2) % notes.length;
        const arpOsc = this.ctx.createOscillator();
        const arpGain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        arpOsc.type = 'triangle';
        arpOsc.frequency.setValueAtTime(notes[noteIdx], now);

        arpGain.gain.setValueAtTime(0.08, now);
        arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        arpOsc.connect(arpGain);
        arpGain.connect(this.bgmGain);

        arpOsc.start(now);
        arpOsc.stop(now + 0.08);
      }
    }, stepInterval);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// ============================================================================
// 2. DATA CONSTANTS & PHASES DEFINITION
// ============================================================================

const PHASES = [
  {
    id: 1,
    name: 'CYBER VOID',
    subname: 'Hexagonal Grid Stabilized',
    primaryColor: '#00f0ff',
    secondaryColor: '#0066aa',
    accentColor: '#9d00ff',
    gridType: 'hex',
    hazardSpeedMult: 1.0,
    spawnRateMult: 1.0,
    gravityPull: 0
  },
  {
    id: 2,
    name: 'NEON NEXUS',
    subname: 'Oscillating Laser Grid Active',
    primaryColor: '#ff0077',
    secondaryColor: '#aa0044',
    accentColor: '#00f0ff',
    gridType: 'iso',
    hazardSpeedMult: 1.18,
    spawnRateMult: 1.25,
    gravityPull: 0
  },
  {
    id: 3,
    name: 'QUANTUM FLUX',
    subname: 'Micro-Drift Fields & Pulsar Spikes',
    primaryColor: '#ffea00',
    secondaryColor: '#ff7700',
    accentColor: '#ff0077',
    gridType: 'warp',
    hazardSpeedMult: 1.35,
    spawnRateMult: 1.45,
    gravityPull: 15
  },
  {
    id: 4,
    name: 'GLITCH ABYSS',
    subname: 'High-Voltage Matrix Inversion',
    primaryColor: '#9d00ff',
    secondaryColor: '#5500aa',
    accentColor: '#00ff88',
    gridType: 'matrix',
    hazardSpeedMult: 1.55,
    spawnRateMult: 1.7,
    gravityPull: 0
  },
  {
    id: 5,
    name: 'SINGULARITY',
    subname: 'Hyper-Dimensional Event Horizon',
    primaryColor: '#00ff88',
    secondaryColor: '#009955',
    accentColor: '#ff0077',
    gridType: 'vortex',
    hazardSpeedMult: 1.8,
    spawnRateMult: 2.0,
    gravityPull: 35
  }
];

const SKINS = [
  {
    id: 'cyan_spark',
    name: 'Cyan Spark',
    req: 'Default Core',
    color: '#00f0ff',
    coreGlow: 'rgba(0, 240, 255, 0.8)',
    unlockedByDefault: true,
    condition: () => true
  },
  {
    id: 'solar_flare',
    name: 'Solar Flare',
    req: 'Score 5,000+ points in any run',
    color: '#ffea00',
    coreGlow: 'rgba(255, 234, 0, 0.8)',
    unlockedByDefault: false,
    condition: (stats) => stats.highScore >= 5000
  },
  {
    id: 'void_phantom',
    name: 'Void Phantom',
    req: 'Survive 60s in Classic Mode',
    color: '#9d00ff',
    coreGlow: 'rgba(157, 0, 255, 0.8)',
    unlockedByDefault: false,
    condition: (stats) => stats.maxSurvival >= 60
  },
  {
    id: 'emerald_matrix',
    name: 'Emerald Matrix',
    req: 'Reach an 8.0x Combo Multiplier',
    color: '#00ff88',
    coreGlow: 'rgba(0, 255, 136, 0.8)',
    unlockedByDefault: false,
    condition: (stats) => stats.maxCombo >= 8.0
  },
  {
    id: 'prismatic_hyperion',
    name: 'Prismatic Hyperion',
    req: 'Witness 3+ Fractures in a single run',
    color: '#ff0077',
    coreGlow: 'rgba(255, 0, 119, 0.8)',
    unlockedByDefault: false,
    condition: (stats) => stats.peakFracturesInRun >= 3
  },
  {
    id: 'chronos_core',
    name: 'Chronos Core',
    req: 'Complete 5 total runs',
    color: '#00e5ff',
    coreGlow: 'rgba(0, 229, 255, 0.8)',
    unlockedByDefault: false,
    condition: (stats) => stats.totalGames >= 5
  }
];

const ACHIEVEMENTS = [
  {
    id: 'first_fracture',
    title: 'Reality Cracked',
    desc: 'Survive your first arena Fracture event',
    icon: '⚡',
    check: (run, stats) => run.fractures >= 1
  },
  {
    id: 'combo_master',
    title: 'Synapse Flow',
    desc: 'Reach an 8.0x or higher combo multiplier',
    icon: '🔥',
    check: (run, stats) => run.peakCombo >= 8.0
  },
  {
    id: 'speed_demon',
    title: 'Phase Shifter',
    desc: 'Perform 15 dashes in a single survival run',
    icon: '💨',
    check: (run, stats) => run.dashesPerformed >= 15
  },
  {
    id: 'energy_hoarder',
    title: 'Shard Harvester',
    desc: 'Collect 40 energy fragments in a single run',
    icon: '◆',
    check: (run, stats) => run.fragmentsCollected >= 40
  },
  {
    id: 'chaos_walker',
    title: 'Chaos Navigator',
    desc: 'Survive 40 seconds in Chaos mode',
    icon: '🌀',
    check: (run, stats) => run.mode === 'chaos' && run.time >= 40
  },
  {
    id: 'time_master',
    title: 'Speedrun Sentinel',
    desc: 'Score over 8,000 points in Time Attack mode',
    icon: '⏱',
    check: (run, stats) => run.mode === 'timeattack' && run.score >= 8000
  },
  {
    id: 'centurion',
    title: 'Mind Breaker',
    desc: 'Score over 15,000 points in any mode',
    icon: '👑',
    check: (run, stats) => run.score >= 15000
  },
  {
    id: 'power_overwhelming',
    title: 'Overclocked',
    desc: 'Collect all 5 power-up types throughout your career',
    icon: '⬢',
    check: (run, stats) => (stats.collectedPowerups || []).length >= 5
  }
];

// ============================================================================
// 3. PERSISTENCE & STORAGE MANAGER
// ============================================================================

class StorageManager {
  static KEY = 'fracture_game_data_v1';

  static getDefaults() {
    return {
      highScore: 0,
      totalGames: 0,
      maxSurvival: 0,
      totalEnergy: 0,
      maxCombo: 1.0,
      totalFractures: 0,
      peakFracturesInRun: 0,
      records: {
        classic: 0,
        timeattack: 0,
        chaos: 0
      },
      unlockedSkins: ['cyan_spark'],
      selectedSkin: 'cyan_spark',
      unlockedAchievements: [],
      collectedPowerups: [],
      dailyRecord: { date: '', score: 0 },
      settings: {
        masterVol: 80,
        sfxVol: 85,
        bgmVol: 65,
        controlScheme: 'wasd',
        shake: 'full',
        particles: 'high'
      }
    };
  }

  static load() {
    try {
      const data = localStorage.getItem(this.KEY);
      if (!data) return this.getDefaults();
      const parsed = JSON.parse(data);
      return { ...this.getDefaults(), ...parsed };
    } catch (e) {
      return this.getDefaults();
    }
  }

  static save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }
}

// ============================================================================
// 4. MAIN GAME ENGINE CLASS
// ============================================================================

class FractureGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();
    this.data = StorageManager.load();

    // Game state: 'title', 'playing', 'paused', 'gameover'
    this.state = 'title';
    this.mode = 'classic'; // 'classic', 'timeattack', 'chaos'

    // Simulation Clock & Delta
    this.lastTime = 0;
    this.survivalTime = 0;
    this.timeAttackLimit = 90.0;
    this.score = 0;
    this.fragmentsCollected = 0;
    this.dashesPerformed = 0;
    this.hitstopTimer = 0;
    this.shakeIntensity = 0;

    // Fracture Progression
    this.currentPhaseIndex = 0;
    this.fractureCycleTime = 30; // 30s in classic, 15s in chaos
    this.fractureTimer = 0;
    this.fracturesWitnessed = 0;
    this.fractureWarningTriggered = false;

    // Combo system
    this.combo = 1.0;
    this.comboTimer = 0;
    this.maxComboTimer = 2.8;
    this.peakComboInRun = 1.0;

    // Entities
    this.player = null;
    this.hazards = [];
    this.fragments = [];
    this.powerups = [];
    this.particles = [];
    this.popups = [];

    // Active power-ups map: { type: remainingSeconds }
    this.activePowerups = {
      shield: 0,
      freeze: 0,
      magnet: 0,
      multiplier: 0,
      overdrive: 0
    };

    // Daily Challenge
    this.todayStr = new Date().toISOString().slice(0, 10);
    this.dailyModifier = this.generateDailyModifier(this.todayStr);

    // Inputs
    this.keys = {};
    this.mouse = { x: 0, y: 0, active: false };
    this.touchStick = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, vx: 0, vy: 0 };

    // Canvas Dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = window.devicePixelRatio || 1;

    // DOM Elements cache
    this.cacheDOMElements();
    this.bindEvents();
    this.handleResize();
    this.updateTitleUI();
    this.checkSkinUnlocks();

    // Check for autostart parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      setTimeout(() => this.startGame(), 100);
    }

    // Start rendering loop
    requestAnimationFrame((t) => this.loop(t));
  }

  cacheDOMElements() {
    this.hud = document.getElementById('game-hud');
    this.hudScore = document.getElementById('hud-score-val');
    this.hudTimer = document.getElementById('hud-timer-val');
    this.hudEnergy = document.getElementById('hud-energy-val');
    this.hudComboBadge = document.getElementById('hud-combo-badge');
    this.hudComboFill = document.getElementById('hud-combo-fill');
    this.hudPhaseName = document.getElementById('hud-phase-name');
    this.hudFractureProgress = document.getElementById('hud-fracture-progress');
    this.hudShieldStatus = document.getElementById('hud-shield-status');
    this.hudDashFill = document.getElementById('hud-dash-fill');
    this.hudPowerupsDock = document.getElementById('hud-powerups');
    this.hudModeKicker = document.getElementById('hud-mode-kicker');
    this.fxOverlay = document.getElementById('fx-overlay');
    this.fractureToast = document.getElementById('fracture-alert-toast');
    this.screenTitle = document.getElementById('screen-title');

    // Modals
    this.modalPause = document.getElementById('modal-pause');
    this.modalGameover = document.getElementById('modal-gameover');
    this.modalSkins = document.getElementById('modal-skins');
    this.modalAchievements = document.getElementById('modal-achievements');
    this.modalStats = document.getElementById('modal-stats');
    this.modalSettings = document.getElementById('modal-settings');

    // Sound toggle button icon
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.soundIconPath = document.getElementById('sound-icon-path');
  }

  // Generate deterministic daily challenge modifier from date string
  generateDailyModifier(dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const modifiers = [
      { name: 'Magnetic Overload', desc: 'Magnet range +200%, hazard speed +15%', magnetBoost: true, speedMult: 1.15 },
      { name: 'Hyper Velocity', desc: 'Dash recharge 50% faster, seeker drones spawn +30%', dashBoost: true, spawnMult: 1.3 },
      { name: 'Frozen Core', desc: 'Time Freeze duration doubled, fragments spawn in clusters', freezeBoost: true, clusterShards: true },
      { name: 'Overclock Rush', desc: 'Overdrive duration +4s, laser obstacles rotate faster', overdriveBoost: true, laserBoost: true }
    ];
    return modifiers[absHash % modifiers.length];
  }

  // ==========================================================================
  // EVENT BINDINGS
  // ==========================================================================

  bindEvents() {
    window.addEventListener('resize', () => this.handleResize());

    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Handle Title Start
      if (this.state === 'title' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        this.startGame();
        return;
      }

      // Handle Pause
      if (this.state === 'playing' && (e.code === 'Escape' || e.code === 'KeyP')) {
        e.preventDefault();
        this.pauseGame();
        return;
      }

      // Resume on Esc in Pause Modal
      if (this.state === 'paused' && (e.code === 'Escape' || e.code === 'KeyP')) {
        e.preventDefault();
        this.resumeGame();
        return;
      }

      // Restart hotkey [R]
      if ((this.state === 'playing' || this.state === 'paused') && e.code === 'KeyR') {
        e.preventDefault();
        this.startGame();
        return;
      }

      // Retry on Game Over [Space/Enter]
      if (this.state === 'gameover' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        this.startGame();
        return;
      }

      // Toggle Sound [M]
      if (e.code === 'KeyM') {
        this.toggleSound();
      }

      // Dash action
      if (this.state === 'playing' && (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight')) {
        this.triggerPlayerDash();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keys = {};
      this.touchStick.active = false;
    });

    // Pointer events for canvas
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 2 || e.button === 0) { // Right click or left click dash if desired
        if (this.state === 'playing' && e.button === 2) {
          e.preventDefault();
          this.triggerPlayerDash();
        }
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Title buttons
    document.getElementById('btn-play-game').addEventListener('click', () => this.startGame());
    
    // Mode tabs
    document.querySelectorAll('.mode-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        this.sound.playClick();
        document.querySelectorAll('.mode-tab').forEach((t) => t.classList.remove('active'));
        const btn = e.currentTarget;
        btn.classList.add('active');
        this.mode = btn.dataset.mode;
      });
    });

    // Modals open/close triggers
    document.getElementById('btn-open-skins').addEventListener('click', () => this.openSkinsModal());
    document.getElementById('btn-open-achievements').addEventListener('click', () => this.openAchievementsModal());
    document.getElementById('btn-open-stats').addEventListener('click', () => this.openStatsModal());
    document.getElementById('btn-open-settings').addEventListener('click', () => this.openSettingsModal());

    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.sound.playClick();
        const modalId = e.currentTarget.getAttribute('data-close');
        const modal = document.getElementById(modalId);
        if (modal) modal.close();
      });
    });

    // HUD controls
    this.btnSoundToggle.addEventListener('click', () => this.toggleSound());
    document.getElementById('btn-pause-toggle').addEventListener('click', () => this.pauseGame());

    // Pause Modal actions
    document.getElementById('btn-pause-resume').addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-pause-restart').addEventListener('click', () => this.startGame());
    document.getElementById('btn-pause-settings').addEventListener('click', () => {
      this.modalPause.close();
      this.openSettingsModal();
    });
    document.getElementById('btn-pause-quit').addEventListener('click', () => this.returnToTitle());

    // Game Over actions
    document.getElementById('btn-go-retry').addEventListener('click', () => this.startGame());
    document.getElementById('btn-go-menu').addEventListener('click', () => this.returnToTitle());

    // Settings form listeners
    this.bindSettingsForm();

    // Mobile / Touch controls setup
    this.setupTouchControls();
  }

  setupTouchControls() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mobileUI = document.getElementById('mobile-controls');
    if (isTouch) {
      mobileUI.style.display = 'block';
    }

    const zone = document.getElementById('touch-joystick-zone');
    const knob = document.getElementById('touch-joystick-knob');
    const dashBtn = document.getElementById('touch-btn-dash');

    if (zone && knob) {
      zone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = zone.getBoundingClientRect();
        this.touchStick.active = true;
        this.touchStick.startX = rect.left + rect.width / 2;
        this.touchStick.startY = rect.top + rect.height / 2;
        this.updateTouchStick(touch.clientX, touch.clientY, knob);
      }, { passive: false });

      zone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!this.touchStick.active) return;
        const touch = e.touches[0];
        this.updateTouchStick(touch.clientX, touch.clientY, knob);
      }, { passive: false });

      const endStick = () => {
        this.touchStick.active = false;
        this.touchStick.vx = 0;
        this.touchStick.vy = 0;
        knob.style.transform = 'translate(-50%, -50%)';
      };

      zone.addEventListener('touchend', endStick);
      zone.addEventListener('touchcancel', endStick);
    }

    if (dashBtn) {
      dashBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.triggerPlayerDash();
      }, { passive: false });
    }
  }

  updateTouchStick(clientX, clientY, knob) {
    const dx = clientX - this.touchStick.startX;
    const dy = clientY - this.touchStick.startY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 45;
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

    this.touchStick.vx = (knobX / maxRadius);
    this.touchStick.vy = (knobY / maxRadius);
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = window.devicePixelRatio || 1;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Keep player in bounds if already initialized
    if (this.player) {
      this.player.x = Math.max(30, Math.min(this.width - 30, this.player.x));
      this.player.y = Math.max(30, Math.min(this.height - 30, this.player.y));
    }
  }

  // ==========================================================================
  // GAMEPLAY LIFECYCLE & STATE MACHINE
  // ==========================================================================

  startGame() {
    this.sound.playClick();
    this.sound.ensureContext();

    // Close any open modals
    [this.modalPause, this.modalGameover, this.modalSkins, this.modalAchievements, this.modalStats, this.modalSettings]
      .forEach(m => m && m.close());

    // Switch state
    this.state = 'playing';
    document.body.dataset.state = 'playing';
    this.screenTitle.classList.remove('active');
    this.hud.style.display = 'flex';

    // Reset run stats
    this.survivalTime = 0;
    this.score = 0;
    this.fragmentsCollected = 0;
    this.dashesPerformed = 0;
    this.currentPhaseIndex = 0;
    this.fracturesWitnessed = 0;
    this.fractureTimer = 0;
    this.fractureWarningTriggered = false;
    this.fractureCycleTime = (this.mode === 'chaos') ? 15 : 30;

    this.combo = 1.0;
    this.comboTimer = 0;
    this.peakComboInRun = 1.0;
    this.hitstopTimer = 0;
    this.shakeIntensity = 0;

    // Reset power-ups
    this.activePowerups = { shield: 1, freeze: 0, magnet: 0, multiplier: 0, overdrive: 0 }; // Start with 1 shield
    this.lastHazardSpawn = 4.0; // 4s opening grace period

    // Spawn player at center
    const skinConfig = SKINS.find(s => s.id === this.data.selectedSkin) || SKINS[0];
    this.player = {
      x: this.width / 2,
      y: this.height / 2,
      vx: 0,
      vy: 0,
      radius: 14,
      speed: 460,
      friction: 0.88,
      dashCooldown: 0,
      maxDashCooldown: 1.6,
      invulnerableTimer: 0.8, // Brief spawn grace
      skin: skinConfig,
      trail: [],
      facingAngle: 0
    };

    // Clear collections
    this.hazards = [];
    this.fragments = [];
    this.powerups = [];
    this.particles = [];
    this.popups = [];

    // Mode HUD Kicker
    const modeNames = { classic: 'CLASSIC SURVIVAL', timeattack: 'TIME ATTACK // 90s', chaos: 'CHAOS MODE // HYPER' };
    this.hudModeKicker.textContent = modeNames[this.mode] || 'CLASSIC SURVIVAL';

    // Initial Spawns
    for (let i = 0; i < 5; i++) {
      this.spawnFragment();
    }

    // Start Phase 1 BGM
    this.sound.startBGM(1);
    this.updateHUD();
  }

  pauseGame() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    document.body.dataset.state = 'paused';
    this.sound.playClick();

    // Populate Pause Stats
    document.getElementById('pause-score-val').textContent = Math.floor(this.score).toLocaleString();
    document.getElementById('pause-time-val').textContent = this.formatTime(this.survivalTime);
    document.getElementById('pause-phase-val').textContent = (this.currentPhaseIndex + 1);

    this.modalPause.showModal();
  }

  resumeGame() {
    if (this.state !== 'paused') return;
    this.sound.playClick();
    this.modalPause.close();
    this.state = 'playing';
    document.body.dataset.state = 'playing';
    this.lastTime = performance.now();
  }

  returnToTitle() {
    this.sound.playClick();
    this.sound.stopBGM();
    [this.modalPause, this.modalGameover].forEach(m => m && m.close());

    this.state = 'title';
    document.body.dataset.state = 'title';
    this.hud.style.display = 'none';
    this.screenTitle.classList.add('active');
    this.updateTitleUI();
  }

  triggerPlayerDash() {
    if (!this.player || this.player.dashCooldown > 0 || this.state !== 'playing') return;

    // Boost impulse
    const overdriveActive = this.activePowerups.overdrive > 0;
    const dashPower = overdriveActive ? 950 : 800;
    let dirX = this.player.vx;
    let dirY = this.player.vy;

    // If standing still, dash in facing direction or mouse/touch direction
    if (Math.hypot(dirX, dirY) < 10) {
      dirX = Math.cos(this.player.facingAngle);
      dirY = Math.sin(this.player.facingAngle);
    }
    const len = Math.hypot(dirX, dirY) || 1;
    this.player.vx = (dirX / len) * dashPower;
    this.player.vy = (dirY / len) * dashPower;

    this.player.dashCooldown = overdriveActive ? 0.7 : this.player.maxDashCooldown;
    this.player.invulnerableTimer = 0.35; // Dash grants brief invulnerability
    this.dashesPerformed++;

    this.sound.playDash();
    this.triggerShake(5);

    // Burst dash particles
    this.spawnParticleBurst(this.player.x, this.player.y, 16, this.player.skin.color, 240);
    this.spawnPopup(this.player.x, this.player.y - 20, 'DASH!', '#00f0ff');
  }

  // ==========================================================================
  // SPAWNING SYSTEMS
  // ==========================================================================

  spawnFragment() {
    const margin = 50;
    this.fragments.push({
      x: margin + Math.random() * (this.width - margin * 2),
      y: margin + Math.random() * (this.height - margin * 2),
      radius: 8,
      rotation: Math.random() * Math.PI * 2,
      pulse: Math.random() * Math.PI * 2,
      value: 100,
      life: 0
    });
  }

  spawnPowerup() {
    const types = ['shield', 'freeze', 'magnet', 'multiplier', 'overdrive'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const margin = 60;
    this.powerups.push({
      type: chosenType,
      x: margin + Math.random() * (this.width - margin * 2),
      y: margin + Math.random() * (this.height - margin * 2),
      radius: 14,
      rotation: 0,
      lifeTimer: 18.0 // Despawns after 18s if untouched
    });
  }

  spawnHazard() {
    const phase = PHASES[this.currentPhaseIndex];
    const hazardTypes = ['laser', 'blade', 'seeker', 'dangerZone'];
    
    // Choose hazard type based on phase availability and randomness
    let type = 'seeker';
    const rand = Math.random();
    if (this.currentPhaseIndex >= 1 && rand < 0.3) {
      type = 'laser';
    } else if (rand < 0.6) {
      type = 'blade';
    } else if (rand < 0.85) {
      type = 'dangerZone';
    }

    if (type === 'laser') {
      // Oscillating or rotating laser line across the screen
      const isHorizontal = Math.random() > 0.5;
      this.hazards.push({
        type: 'laser',
        isHorizontal,
        pos: isHorizontal ? Math.random() * this.height : Math.random() * this.width,
        speed: (60 + Math.random() * 50) * phase.hazardSpeedMult,
        dir: Math.random() > 0.5 ? 1 : -1,
        active: false,
        warmupTimer: 1.4, // Telegraph phase
        color: phase.primaryColor
      });
    } else if (type === 'blade') {
      // Rotating multi-blade hazard that drifts
      const spawnSide = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      if (spawnSide === 0) { x = Math.random() * this.width; y = -40; }
      else if (spawnSide === 1) { x = this.width + 40; y = Math.random() * this.height; }
      else if (spawnSide === 2) { x = Math.random() * this.width; y = this.height + 40; }
      else { x = -40; y = Math.random() * this.height; }

      const targetX = this.width / 2 + (Math.random() - 0.5) * 300;
      const targetY = this.height / 2 + (Math.random() - 0.5) * 300;
      const angle = Math.atan2(targetY - y, targetX - x);
      const speed = (90 + Math.random() * 60) * phase.hazardSpeedMult;

      this.hazards.push({
        type: 'blade',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        arms: Math.random() > 0.5 ? 4 : 3,
        bladeLength: 42,
        rotation: 0,
        rotSpeed: (2.5 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1),
        color: phase.primaryColor
      });
    } else if (type === 'dangerZone') {
      // Expanding danger circle with detonating shockwave (spawned away from player)
      let dzX = 0, dzY = 0, attempts = 0;
      do {
        dzX = 70 + Math.random() * (this.width - 140);
        dzY = 70 + Math.random() * (this.height - 140);
        attempts++;
      } while (attempts < 8 && this.player && Math.hypot(dzX - this.player.x, dzY - this.player.y) < 180);

      this.hazards.push({
        type: 'dangerZone',
        x: dzX,
        y: dzY,
        maxRadius: 85,
        currentRadius: 10,
        state: 'telegraph', // 'telegraph' -> 'active' -> 'done'
        timer: 1.6,
        color: '#ff2a4b'
      });
    } else {
      // Seeker Drone: homing digital spark
      const spawnSide = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      if (spawnSide === 0) { x = Math.random() * this.width; y = -20; }
      else if (spawnSide === 1) { x = this.width + 20; y = Math.random() * this.height; }
      else if (spawnSide === 2) { x = Math.random() * this.width; y = this.height + 20; }
      else { x = -20; y = Math.random() * this.height; }

      this.hazards.push({
        type: 'seeker',
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 11,
        maxSpeed: (130 + Math.random() * 50) * phase.hazardSpeedMult,
        accel: 220,
        lifeTimer: 14.0, // Expires after 14s
        color: phase.accentColor,
        sparkTimer: 0
      });
    }
  }

  // ==========================================================================
  // SIMULATION & UPDATE LOOP
  // ==========================================================================

  loop(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp delta time to avoid tunneling during frame drops
    const dt = Math.min(rawDt, 0.05);

    if (this.state === 'playing') {
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        this.updateSimulation(dt);
      }
    }

    // Always render visuals
    this.render(dt);

    requestAnimationFrame((t) => this.loop(t));
  }

  updateSimulation(dt) {
    const phase = PHASES[this.currentPhaseIndex];
    const timeScale = (this.activePowerups.freeze > 0) ? 0.35 : 1.0;
    const effectiveDt = dt * timeScale;

    this.survivalTime += dt;
    this.fractureTimer += dt;

    // Time Attack Mode Check
    if (this.mode === 'timeattack' && this.survivalTime >= this.timeAttackLimit) {
      this.handleGameOver('TIME LIMIT EXPIRED');
      return;
    }

    // Check Fracture Event Timing
    const timeUntilFracture = this.fractureCycleTime - this.fractureTimer;
    if (timeUntilFracture <= 4.0 && !this.fractureWarningTriggered) {
      this.fractureWarningTriggered = true;
      this.sound.playFractureWarning();
      this.triggerScreenGlitch(300);
      this.spawnPopup(this.width / 2, this.height * 0.35, 'WARNING: FRACTURE IMMINENT', '#ff0077', 1.8);
    }

    if (this.fractureTimer >= this.fractureCycleTime) {
      this.triggerFractureEvent();
    }

    // Update Combo Decay
    if (this.combo > 1.0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1.0;
        this.comboTimer = 0;
      }
    }

    // Update Active Powerups (timed ones: freeze, magnet, multiplier, overdrive)
    ['freeze', 'magnet', 'multiplier', 'overdrive'].forEach((key) => {
      if (this.activePowerups[key] > 0) {
        this.activePowerups[key] = Math.max(0, this.activePowerups[key] - dt);
      }
    });

    // Update Player Movement
    this.updatePlayer(dt, phase);

    // Hazard Spawning intervals with gentle introductory ramp for first 20s
    const introPacing = (this.survivalTime < 20) ? 1.5 : 1.0;
    const spawnBaseInterval = ((this.mode === 'chaos') ? 1.4 : 2.4) * introPacing;
    const spawnRate = Math.max(0.65, (spawnBaseInterval / phase.spawnRateMult) - (this.survivalTime * 0.006));
    if (!this.lastHazardSpawn || this.survivalTime - this.lastHazardSpawn > spawnRate) {
      this.spawnHazard();
      this.lastHazardSpawn = this.survivalTime;
    }

    // Power-up Spawning (approx every 18-24s)
    if (!this.lastPowerupSpawn || this.survivalTime - this.lastPowerupSpawn > 20.0) {
      if (this.powerups.length < 2) {
        this.spawnPowerup();
      }
      this.lastPowerupSpawn = this.survivalTime;
    }

    // Keep fragments count refreshed
    if (this.fragments.length < 5) {
      this.spawnFragment();
    }

    // Update Hazards
    this.updateHazards(effectiveDt);

    // Update Fragments & Magnet
    this.updateFragments(dt);

    // Update Powerups
    this.updatePowerups(dt);

    // Update Particles & Popups
    this.updateVisualFX(dt);

    // Check Collisions
    this.checkCollisions();

    // Update HUD display elements
    this.updateHUD();
  }

  updatePlayer(dt, phase) {
    if (!this.player) return;

    // Movement Intent
    let moveX = 0;
    let moveY = 0;

    // Keyboard (WASD / Arrows)
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    // Touch Virtual Stick Override
    if (this.touchStick.active) {
      moveX = this.touchStick.vx;
      moveY = this.touchStick.vy;
    }

    // Mouse Follow Mode (if enabled in settings)
    if (this.data.settings.controlScheme === 'mouse' && this.mouse.active) {
      const dx = this.mouse.x - this.player.x;
      const dy = this.mouse.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 20) {
        moveX = dx / dist;
        moveY = dy / dist;
      }
    }

    // Normalize diagonal movement
    const moveLen = Math.hypot(moveX, moveY);
    if (moveLen > 1) {
      moveX /= moveLen;
      moveY /= moveLen;
    }

    // Speed bonus if Overdrive is active
    let currentSpeed = this.player.speed;
    if (this.activePowerups.overdrive > 0) currentSpeed *= 1.45;

    // Accelerate
    this.player.vx += moveX * currentSpeed * 6.5 * dt;
    this.player.vy += moveY * currentSpeed * 6.5 * dt;

    // Phase Gravity Pull (e.g. Singularity center vortex or Quantum flux)
    if (phase.gravityPull > 0) {
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const gDx = centerX - this.player.x;
      const gDy = centerY - this.player.y;
      const gDist = Math.hypot(gDx, gDy) || 1;
      this.player.vx += (gDx / gDist) * phase.gravityPull * dt;
      this.player.vy += (gDy / gDist) * phase.gravityPull * dt;
    }

    // Friction decay
    const frictionFactor = Math.pow(this.player.friction, dt * 60);
    this.player.vx *= frictionFactor;
    this.player.vy *= frictionFactor;

    // Integrate position
    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;

    // Arena boundary clamp with bounce impulse
    const padding = this.player.radius + 10;
    if (this.player.x < padding) {
      this.player.x = padding;
      this.player.vx = Math.abs(this.player.vx) * 0.4;
    } else if (this.player.x > this.width - padding) {
      this.player.x = this.width - padding;
      this.player.vx = -Math.abs(this.player.vx) * 0.4;
    }

    if (this.player.y < padding) {
      this.player.y = padding;
      this.player.vy = Math.abs(this.player.vy) * 0.4;
    } else if (this.player.y > this.height - padding) {
      this.player.y = this.height - padding;
      this.player.vy = -Math.abs(this.player.vy) * 0.4;
    }

    // Calculate facing angle
    if (Math.hypot(this.player.vx, this.player.vy) > 10) {
      this.player.facingAngle = Math.atan2(this.player.vy, this.player.vx);
    }

    // Cooldown timers
    if (this.player.dashCooldown > 0) {
      this.player.dashCooldown = Math.max(0, this.player.dashCooldown - dt);
    }
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer = Math.max(0, this.player.invulnerableTimer - dt);
    }

    // Trail particles
    this.player.trail.unshift({ x: this.player.x, y: this.player.y, alpha: 1.0 });
    if (this.player.trail.length > 10) this.player.trail.pop();
    this.player.trail.forEach(t => t.alpha -= dt * 3.5);

    // Overdrive fire trail
    if (this.activePowerups.overdrive > 0 && Math.random() < 0.4) {
      this.particles.push({
        x: this.player.x + (Math.random() - 0.5) * 10,
        y: this.player.y + (Math.random() - 0.5) * 10,
        vx: -this.player.vx * 0.2 + (Math.random() - 0.5) * 20,
        vy: -this.player.vy * 0.2 + (Math.random() - 0.5) * 20,
        radius: 4,
        color: '#ff5500',
        alpha: 0.9,
        decay: 3.5
      });
    }
  }

  updateHazards(dt) {
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];

      if (h.type === 'laser') {
        if (!h.active) {
          h.warmupTimer -= dt;
          if (h.warmupTimer <= 0) h.active = true;
        } else {
          // Oscillate along axis
          h.pos += h.speed * h.dir * dt;
          const maxBound = h.isHorizontal ? this.height : this.width;
          if (h.pos < 30) {
            h.pos = 30;
            h.dir *= -1;
          } else if (h.pos > maxBound - 30) {
            h.pos = maxBound - 30;
            h.dir *= -1;
          }
        }
      } else if (h.type === 'blade') {
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        h.rotation += h.rotSpeed * dt;

        // Despawn when far out of arena
        if (h.x < -100 || h.x > this.width + 100 || h.y < -100 || h.y > this.height + 100) {
          this.hazards.splice(i, 1);
        }
      } else if (h.type === 'seeker') {
        h.lifeTimer -= dt;
        if (h.lifeTimer <= 0) {
          this.hazards.splice(i, 1);
          continue;
        }

        // Steer towards player
        const dx = this.player.x - h.x;
        const dy = this.player.y - h.y;
        const dist = Math.hypot(dx, dy) || 1;

        h.vx += (dx / dist) * h.accel * dt;
        h.vy += (dy / dist) * h.accel * dt;

        // Cap speed
        const currentSpeed = Math.hypot(h.vx, h.vy);
        if (currentSpeed > h.maxSpeed) {
          h.vx = (h.vx / currentSpeed) * h.maxSpeed;
          h.vy = (h.vy / currentSpeed) * h.maxSpeed;
        }

        h.x += h.vx * dt;
        h.y += h.vy * dt;

        // Emit spark trails
        h.sparkTimer += dt;
        if (h.sparkTimer > 0.08) {
          h.sparkTimer = 0;
          this.particles.push({
            x: h.x,
            y: h.y,
            vx: -h.vx * 0.15 + (Math.random() - 0.5) * 20,
            vy: -h.vy * 0.15 + (Math.random() - 0.5) * 20,
            radius: 2.5,
            color: h.color,
            alpha: 0.8,
            decay: 2.5
          });
        }
      } else if (h.type === 'dangerZone') {
        h.timer -= dt;
        if (h.state === 'telegraph') {
          h.currentRadius = h.maxRadius * (1 - h.timer / 1.6);
          if (h.timer <= 0) {
            h.state = 'active';
            h.timer = 0.35; // Lethal shockwave burst
            this.spawnParticleBurst(h.x, h.y, 24, '#ff2a4b', 180);
            this.triggerShake(4);
          }
        } else if (h.state === 'active') {
          if (h.timer <= 0) {
            this.hazards.splice(i, 1);
          }
        }
      }
    }
  }

  updateFragments(dt) {
    const magnetActive = this.activePowerups.magnet > 0;
    const magnetRange = magnetActive ? 320 : 70;

    for (let i = 0; i < this.fragments.length; i++) {
      const f = this.fragments[i];
      f.pulse += dt * 4;
      f.rotation += dt * 1.5;
      f.life += dt;

      // Magnetic attraction to player
      const dx = this.player.x - f.x;
      const dy = this.player.y - f.y;
      const dist = Math.hypot(dx, dy);

      if (dist < magnetRange) {
        const pullStrength = magnetActive ? 520 : 180;
        f.x += (dx / dist) * pullStrength * dt;
        f.y += (dy / dist) * pullStrength * dt;
      }
    }
  }

  updatePowerups(dt) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.rotation += dt * 2;
      p.lifeTimer -= dt;
      if (p.lifeTimer <= 0) {
        this.powerups.splice(i, 1);
      }
    }
  }

  updateVisualFX(dt) {
    // Decay shake
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 12);
    }

    // Particles update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Floating text popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y -= pop.vy * dt;
      pop.alpha -= pop.decay * dt;
      if (pop.alpha <= 0) {
        this.popups.splice(i, 1);
      }
    }
  }

  // ==========================================================================
  // COLLISION DETECTION & RESOLUTION
  // ==========================================================================

  checkCollisions() {
    if (!this.player) return;

    // 1. Energy Fragments Collection
    for (let i = this.fragments.length - 1; i >= 0; i--) {
      const f = this.fragments[i];
      const dist = Math.hypot(this.player.x - f.x, this.player.y - f.y);
      if (dist < this.player.radius + f.radius) {
        this.collectFragment(f, i);
      }
    }

    // 2. Power-up Capsules Collection
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);
      if (dist < this.player.radius + p.radius) {
        this.collectPowerup(p, i);
      }
    }

    // 3. Hazard Collisions
    if (this.player.invulnerableTimer > 0) return; // Player immune

    for (let i = 0; i < this.hazards.length; i++) {
      const h = this.hazards[i];

      if (h.type === 'laser' && h.active) {
        // Line-circle distance
        let dist = 0;
        if (h.isHorizontal) {
          dist = Math.abs(this.player.y - h.pos);
        } else {
          dist = Math.abs(this.player.x - h.pos);
        }
        if (dist < this.player.radius + 3) {
          this.handlePlayerHit('VAPORIZED BY LASER GRID');
          return;
        }
      } else if (h.type === 'blade') {
        const dist = Math.hypot(this.player.x - h.x, this.player.y - h.y);
        if (dist < this.player.radius + h.bladeLength) {
          // Check blade arms intersection
          for (let a = 0; a < h.arms; a++) {
            const armAngle = h.rotation + (a * (Math.PI * 2 / h.arms));
            const tipX = h.x + Math.cos(armAngle) * h.bladeLength;
            const tipY = h.y + Math.sin(armAngle) * h.bladeLength;
            if (this.distToSegment(this.player.x, this.player.y, h.x, h.y, tipX, tipY) < this.player.radius + 6) {
              this.handlePlayerHit('SHREDDED BY ROTATING BLADE');
              return;
            }
          }
        }
      } else if (h.type === 'seeker') {
        const dist = Math.hypot(this.player.x - h.x, this.player.y - h.y);
        if (dist < this.player.radius + h.radius) {
          this.handlePlayerHit('STRUCK BY HOMING ENERGY DRONE');
          return;
        }
      } else if (h.type === 'dangerZone' && h.state === 'active') {
        const dist = Math.hypot(this.player.x - h.x, this.player.y - h.y);
        if (dist < this.player.radius + h.maxRadius) {
          this.handlePlayerHit('ENGULFED IN DETONATION ZONE');
          return;
        }
      }
    }
  }

  distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  collectFragment(f, index) {
    this.fragments.splice(index, 1);
    this.fragmentsCollected++;

    // Increment combo
    this.combo = Math.min(12.0, this.combo + 0.25);
    this.comboTimer = this.maxComboTimer;
    if (this.combo > this.peakComboInRun) this.peakComboInRun = this.combo;

    // Score computation
    const doubleScoreMult = (this.activePowerups.multiplier > 0) ? 2.0 : 1.0;
    const earnedPoints = Math.round(f.value * this.combo * doubleScoreMult);
    this.score += earnedPoints;

    // Procedural chime
    this.sound.playPickup(this.combo);

    // Particle burst & Popup
    this.spawnParticleBurst(f.x, f.y, 10, '#00f0ff', 140);
    this.spawnPopup(f.x, f.y - 12, `+${earnedPoints}`, this.combo >= 4.0 ? '#ffea00' : '#00f0ff');
  }

  collectPowerup(p, index) {
    this.powerups.splice(index, 1);
    this.sound.playPowerup();

    const durations = {
      shield: 1, // 1 charge
      freeze: 6.5,
      magnet: 9.0,
      multiplier: 12.0,
      overdrive: 7.5
    };

    if (p.type === 'shield') {
      this.activePowerups.shield = 1;
      this.spawnPopup(this.player.x, this.player.y - 25, 'SHIELD RESTORED', '#00f0ff', 1.2);
    } else {
      this.activePowerups[p.type] = durations[p.type];
      const names = { freeze: 'TIME FREEZE', magnet: 'MAGNETIC FIELD', multiplier: 'DOUBLE SCORE', overdrive: 'OVERDRIVE' };
      this.spawnPopup(this.player.x, this.player.y - 25, names[p.type], '#ffea00', 1.2);
    }

    // Register collected powerup for achievement
    if (!this.data.collectedPowerups.includes(p.type)) {
      this.data.collectedPowerups.push(p.type);
    }

    this.spawnParticleBurst(p.x, p.y, 20, '#ffea00', 200);
    this.triggerShake(4);
    this.updateHUD();
  }

  handlePlayerHit(causeText) {
    // If shield is active, absorb damage
    if (this.activePowerups.shield > 0) {
      this.activePowerups.shield = 0;
      this.player.invulnerableTimer = 1.0; // 1s grace period after shield break
      this.sound.playShieldBreak();
      this.hitstopTimer = 0.06;
      this.triggerShake(9);
      this.triggerScreenGlitch(200);
      this.spawnParticleBurst(this.player.x, this.player.y, 28, '#00f0ff', 280);
      this.spawnPopup(this.player.x, this.player.y - 25, 'SHIELD BROKEN!', '#ff2a4b', 1.5);
      return;
    }

    // Fatal hit
    this.handleGameOver(causeText);
  }

  // ==========================================================================
  // FRACTURE EVENT TRANSITION
  // ==========================================================================

  triggerFractureEvent() {
    this.fractureTimer = 0;
    this.fractureWarningTriggered = false;
    this.fracturesWitnessed++;

    // Advance Phase
    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % PHASES.length;
    const newPhase = PHASES[this.currentPhaseIndex];
    this.updateHUD();

    // Audio & Screen Juice
    this.sound.playFractureDrop();
    this.sound.startBGM(newPhase.id);
    this.triggerShake(14);
    this.triggerScreenGlitch(600);

    // Fracture bonus score
    const bonus = 1000 * (this.currentPhaseIndex + 1);
    this.score += bonus;
    this.spawnPopup(this.width / 2, this.height * 0.45, `+${bonus} FRACTURE SURVIVED`, '#ffea00', 2.0);

    // Show Cinematic Fracture Toast
    document.getElementById('alert-headline-text').textContent = `PHASE ${newPhase.id}: ${newPhase.name}`;
    document.getElementById('alert-desc-text').textContent = newPhase.subname;
    this.fractureToast.style.display = 'flex';
    setTimeout(() => {
      this.fractureToast.style.display = 'none';
    }, 3200);

    // Clear immediate danger in vicinity of player
    this.hazards = this.hazards.filter(h => {
      const dist = Math.hypot((h.x || 0) - this.player.x, (h.y || 0) - this.player.y);
      return dist > 200;
    });

    // Check unlocks
    this.checkSkinUnlocks();
  }

  // ==========================================================================
  // GAME OVER & RUN SUMMARY
  // ==========================================================================

  handleGameOver(causeText) {
    this.state = 'gameover';
    document.body.dataset.state = 'gameover';
    this.sound.stopBGM();
    this.sound.playGameOver();

    // Death explosion
    this.spawnParticleBurst(this.player.x, this.player.y, 45, this.player.skin.color, 360);
    this.triggerShake(18);
    this.triggerScreenGlitch(500);

    // Update Persistent Lifetime Data
    const prevBest = this.data.records[this.mode] || 0;
    const isNewBest = this.score > prevBest;
    if (isNewBest) {
      this.data.records[this.mode] = Math.floor(this.score);
    }

    if (this.score > this.data.highScore) {
      this.data.highScore = Math.floor(this.score);
    }

    this.data.totalGames++;
    this.data.totalEnergy += this.fragmentsCollected;
    this.data.totalFractures += this.fracturesWitnessed;
    if (this.survivalTime > this.data.maxSurvival) {
      this.data.maxSurvival = this.survivalTime;
    }
    if (this.peakComboInRun > this.data.maxCombo) {
      this.data.maxCombo = this.peakComboInRun;
    }
    if (this.fracturesWitnessed > this.data.peakFracturesInRun) {
      this.data.peakFracturesInRun = this.fracturesWitnessed;
    }

    // Daily Record
    if (this.data.dailyRecord.date !== this.todayStr) {
      this.data.dailyRecord = { date: this.todayStr, score: Math.floor(this.score) };
    } else if (this.score > this.data.dailyRecord.score) {
      this.data.dailyRecord.score = Math.floor(this.score);
    }

    // Check Achievements & Unlocks
    const runSummary = {
      score: this.score,
      time: this.survivalTime,
      mode: this.mode,
      fragmentsCollected: this.fragmentsCollected,
      dashesPerformed: this.dashesPerformed,
      peakCombo: this.peakComboInRun,
      fractures: this.fracturesWitnessed
    };
    const newAchievements = this.checkAchievements(runSummary);
    const newSkinUnlocked = this.checkSkinUnlocks();

    // Save Data
    StorageManager.save(this.data);

    // Populate Game Over Modal
    document.getElementById('gameover-headline').textContent = isNewBest ? 'NEW HIGH SCORE ACHIEVED' : 'FRACTURE COLLAPSE';
    document.getElementById('gameover-cause').textContent = causeText;
    document.getElementById('go-score-val').textContent = Math.floor(this.score).toLocaleString();
    document.getElementById('go-new-best').style.display = isNewBest ? 'inline-block' : 'none';
    document.getElementById('go-time-val').textContent = this.formatTime(this.survivalTime);
    document.getElementById('go-fractures-val').textContent = this.fracturesWitnessed;
    document.getElementById('go-fragments-val').textContent = this.fragmentsCollected;
    document.getElementById('go-combo-val').textContent = `${this.peakComboInRun.toFixed(1)}X`;
    document.getElementById('go-best-val').textContent = Math.max(this.score, prevBest).toLocaleString();

    // Unlock alert banner
    const unlockBanner = document.getElementById('go-unlock-banner');
    if (newSkinUnlocked) {
      unlockBanner.style.display = 'flex';
      document.getElementById('go-unlock-title').textContent = 'NEW CORE UNLOCKED!';
      document.getElementById('go-unlock-desc').textContent = `${newSkinUnlocked.name} is now available in your Hangar.`;
    } else if (newAchievements.length > 0) {
      unlockBanner.style.display = 'flex';
      document.getElementById('go-unlock-title').textContent = 'ACHIEVEMENT UNLOCKED!';
      document.getElementById('go-unlock-desc').textContent = `${newAchievements[0].title}: ${newAchievements[0].desc}`;
    } else {
      unlockBanner.style.display = 'none';
    }

    setTimeout(() => {
      if (this.state === 'gameover') {
        this.modalGameover.showModal();
      }
    }, 600);
  }

  // ==========================================================================
  // PROGRESSION & UNLOCKS
  // ==========================================================================

  checkSkinUnlocks() {
    let newlyUnlocked = null;
    SKINS.forEach((skin) => {
      if (!this.data.unlockedSkins.includes(skin.id)) {
        if (skin.condition(this.data)) {
          this.data.unlockedSkins.push(skin.id);
          newlyUnlocked = skin;
        }
      }
    });
    if (newlyUnlocked) {
      StorageManager.save(this.data);
    }
    return newlyUnlocked;
  }

  checkAchievements(runSummary) {
    const newlyUnlocked = [];
    ACHIEVEMENTS.forEach((ach) => {
      if (!this.data.unlockedAchievements.includes(ach.id)) {
        if (ach.check(runSummary, this.data)) {
          this.data.unlockedAchievements.push(ach.id);
          newlyUnlocked.push(ach);
        }
      }
    });
    if (newlyUnlocked.length > 0) {
      StorageManager.save(this.data);
    }
    return newlyUnlocked;
  }

  // ==========================================================================
  // RENDERING & VISUAL EFFECTS
  // ==========================================================================

  render(dt) {
    const ctx = this.ctx;
    ctx.save();

    // Apply Screen Shake
    if (this.shakeIntensity > 0 && this.data.settings.shake !== 'off') {
      const shakeMult = (this.data.settings.shake === 'medium') ? 0.5 : 1.0;
      const trauma = this.shakeIntensity * shakeMult;
      const offsetX = (Math.random() - 0.5) * trauma * trauma * 0.4;
      const offsetY = (Math.random() - 0.5) * trauma * trauma * 0.4;
      ctx.translate(offsetX, offsetY);
    }

    // 1. Clear Screen
    ctx.fillStyle = '#050713';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Render Dynamic Futuristic Arena Background Grid
    this.renderDynamicGrid(ctx);

    // 3. Render Arena Glowing Boundaries
    this.renderArenaBorders(ctx);

    // 4. Render Collectibles (Energy Fragments & Powerups)
    this.renderCollectibles(ctx);

    // 5. Render Hazards
    this.renderHazards(ctx);

    // 6. Render Particles & Floating Text
    this.renderParticlesAndText(ctx);

    // 7. Render Player
    if (this.player && this.state !== 'title') {
      this.renderPlayer(ctx);
    }

    ctx.restore();
  }

  renderDynamicGrid(ctx) {
    const phase = PHASES[this.currentPhaseIndex] || PHASES[0];
    const time = performance.now() * 0.001;
    ctx.save();

    ctx.strokeStyle = phase.secondaryColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.22;

    const cellSize = 60;
    const offsetX = (time * 15) % cellSize;
    const offsetY = (time * 15) % cellSize;

    if (phase.gridType === 'hex') {
      // Hexagonal honeycomb floor
      const hexRadius = 38;
      const rowHeight = hexRadius * 1.5;
      const colWidth = hexRadius * Math.sqrt(3);

      for (let y = -hexRadius; y < this.height + hexRadius; y += rowHeight) {
        const row = Math.floor(y / rowHeight);
        const shift = (row % 2) * (colWidth / 2);
        for (let x = -hexRadius + shift; x < this.width + hexRadius; x += colWidth) {
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (Math.PI / 3) * a;
            const hx = x + hexRadius * Math.cos(angle);
            const hy = y + hexRadius * Math.sin(angle);
            if (a === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    } else {
      // Vector neon grid with perspective or diagonal flux
      for (let x = -cellSize + offsetX; x < this.width + cellSize; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
        ctx.stroke();
      }
      for (let y = -cellSize + offsetY; y < this.height + cellSize; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  renderArenaBorders(ctx) {
    const phase = PHASES[this.currentPhaseIndex] || PHASES[0];
    ctx.save();
    ctx.strokeStyle = phase.primaryColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = phase.primaryColor;
    ctx.shadowBlur = 20;

    const pad = 12;
    ctx.strokeRect(pad, pad, this.width - pad * 2, this.height - pad * 2);

    // Tech corner caps
    const cornerSize = 35;
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(pad, pad + cornerSize);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + cornerSize, pad);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(this.width - pad - cornerSize, pad);
    ctx.lineTo(this.width - pad, pad);
    ctx.lineTo(this.width - pad, pad + cornerSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(pad, this.height - pad - cornerSize);
    ctx.lineTo(pad, this.height - pad);
    ctx.lineTo(pad + cornerSize, this.height - pad);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(this.width - pad - cornerSize, this.height - pad);
    ctx.lineTo(this.width - pad, this.height - pad);
    ctx.lineTo(this.width - pad, this.height - pad - cornerSize);
    ctx.stroke();

    ctx.restore();
  }

  renderCollectibles(ctx) {
    // 1. Fragments (Glowing geometric crystals)
    for (let i = 0; i < this.fragments.length; i++) {
      const f = this.fragments[i];
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);

      const pulseScale = 1 + Math.sin(f.pulse) * 0.15;
      ctx.scale(pulseScale, pulseScale);

      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;

      // Diamond shape
      ctx.beginPath();
      ctx.moveTo(0, -f.radius * 1.3);
      ctx.lineTo(f.radius, 0);
      ctx.lineTo(0, f.radius * 1.3);
      ctx.lineTo(-f.radius, 0);
      ctx.closePath();
      ctx.fill();

      // Bright inner core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, f.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 2. Power-up Orbs
    for (let i = 0; i < this.powerups.length; i++) {
      const p = this.powerups[i];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      const colorMap = {
        shield: '#00f0ff',
        freeze: '#55b2ff',
        magnet: '#ff0077',
        multiplier: '#ffea00',
        overdrive: '#ff5500'
      };
      const pColor = colorMap[p.type] || '#ffea00';

      ctx.strokeStyle = pColor;
      ctx.fillStyle = 'rgba(10, 15, 30, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = pColor;
      ctx.shadowBlur = 20;

      // Hexagon capsule
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const angle = (Math.PI / 3) * a;
        const hx = p.radius * Math.cos(angle);
        const hy = p.radius * Math.sin(angle);
        if (a === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Icon label inside capsule
      ctx.rotate(-p.rotation); // un-rotate text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbolMap = { shield: '🛡', freeze: '❄', magnet: '🧲', multiplier: '2X', overdrive: '⚡' };
      ctx.fillText(symbolMap[p.type] || '★', 0, 1);

      ctx.restore();
    }
  }

  renderHazards(ctx) {
    for (let i = 0; i < this.hazards.length; i++) {
      const h = this.hazards[i];

      if (h.type === 'laser') {
        ctx.save();
        if (!h.active) {
          // Warmup telegraph dotted/dim line
          ctx.strokeStyle = 'rgba(255, 42, 75, 0.35)';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 8]);
        } else {
          // Lethal active laser beam
          ctx.strokeStyle = h.color;
          ctx.lineWidth = 6;
          ctx.shadowColor = h.color;
          ctx.shadowBlur = 22;
        }

        ctx.beginPath();
        if (h.isHorizontal) {
          ctx.moveTo(0, h.pos);
          ctx.lineTo(this.width, h.pos);
        } else {
          ctx.moveTo(h.pos, 0);
          ctx.lineTo(h.pos, this.height);
        }
        ctx.stroke();

        // High intensity core line
        if (h.active) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();
          if (h.isHorizontal) {
            ctx.moveTo(0, h.pos);
            ctx.lineTo(this.width, h.pos);
          } else {
            ctx.moveTo(h.pos, 0);
            ctx.lineTo(h.pos, this.height);
          }
          ctx.stroke();
        }
        ctx.restore();
      } else if (h.type === 'blade') {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rotation);

        ctx.strokeStyle = h.color;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = h.color;
        ctx.shadowBlur = 18;

        for (let a = 0; a < h.arms; a++) {
          const armAngle = (a * (Math.PI * 2 / h.arms));
          const tipX = Math.cos(armAngle) * h.bladeLength;
          const tipY = Math.sin(armAngle) * h.bladeLength;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();

          // Lethal tip orb
          ctx.fillStyle = '#ff2a4b';
          ctx.beginPath();
          ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Center hub
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (h.type === 'seeker') {
        ctx.save();
        ctx.translate(h.x, h.y);
        const heading = Math.atan2(h.vy, h.vx);
        ctx.rotate(heading);

        ctx.fillStyle = h.color;
        ctx.shadowColor = h.color;
        ctx.shadowBlur = 16;

        // Sleek triangular drone
        ctx.beginPath();
        ctx.moveTo(h.radius * 1.4, 0);
        ctx.lineTo(-h.radius, -h.radius * 0.9);
        ctx.lineTo(-h.radius * 0.4, 0);
        ctx.lineTo(-h.radius, h.radius * 0.9);
        ctx.closePath();
        ctx.fill();

        // Core eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (h.type === 'dangerZone') {
        ctx.save();
        if (h.state === 'telegraph') {
          // Warning expanding ring
          ctx.strokeStyle = 'rgba(255, 42, 75, 0.6)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.maxRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Expanding fill
          ctx.fillStyle = 'rgba(255, 42, 75, 0.18)';
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.currentRadius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Lethal detonated shockwave
          ctx.fillStyle = 'rgba(255, 42, 75, 0.45)';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#ff2a4b';
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.maxRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  renderParticlesAndText(ctx) {
    // 1. Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Floating Popups
    for (let i = 0; i < this.popups.length; i++) {
      const pop = this.popups[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, pop.alpha);
      ctx.font = `bold ${pop.size || 14}px Orbitron, monospace`;
      ctx.fillStyle = pop.color;
      ctx.shadowColor = pop.color;
      ctx.shadowBlur = 12;
      ctx.textAlign = 'center';
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }
  }

  renderPlayer(ctx) {
    const p = this.player;
    ctx.save();

    // Invulnerability flashing
    if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // 1. Ghost Trail
    for (let i = 0; i < p.trail.length; i++) {
      const t = p.trail[i];
      if (t.alpha <= 0) continue;
      ctx.save();
      ctx.globalAlpha = t.alpha * 0.35;
      ctx.fillStyle = p.skin.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, p.radius * (1 - i * 0.06), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.translate(p.x, p.y);

    // 2. Outer Glow Aura
    ctx.shadowColor = p.skin.color;
    ctx.shadowBlur = 24;

    // 3. Player Skin specific rendering
    if (p.skin.id === 'solar_flare') {
      // Golden solar corona rays
      ctx.strokeStyle = '#ffea00';
      ctx.lineWidth = 2;
      for (let r = 0; r < 8; r++) {
        const rayAngle = (r * Math.PI / 4) + performance.now() * 0.003;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rayAngle) * (p.radius + 2), Math.sin(rayAngle) * (p.radius + 2));
        ctx.lineTo(Math.cos(rayAngle) * (p.radius + 8), Math.sin(rayAngle) * (p.radius + 8));
        ctx.stroke();
      }
    } else if (p.skin.id === 'chronos_core') {
      // Gyroscopic orbital ring
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.radius + 6, (p.radius + 6) * 0.4, performance.now() * 0.002, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Main Core Ring
    ctx.strokeStyle = p.skin.color;
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(10, 15, 30, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // High energy nucleus
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Heading Reticle Pip
    ctx.fillStyle = p.skin.color;
    const pipX = Math.cos(p.facingAngle) * (p.radius + 6);
    const pipY = Math.sin(p.facingAngle) * (p.radius + 6);
    ctx.beginPath();
    ctx.arc(pipX, pipY, 3, 0, Math.PI * 2);
    ctx.fill();

    // 4. Energy Shield Bubble
    if (this.activePowerups.shield > 0) {
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 12, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating hex shield facets
      const shieldRot = performance.now() * 0.002;
      ctx.rotate(shieldRot);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const ang = (Math.PI / 3) * a;
        const sx = (p.radius + 12) * Math.cos(ang);
        const sy = (p.radius + 12) * Math.sin(ang);
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================================
  // JUICE & FX HELPERS
  // ==========================================================================

  triggerShake(amount) {
    this.shakeIntensity = Math.min(25, this.shakeIntensity + amount);
  }

  triggerScreenGlitch(durationMs = 300) {
    if (!this.fxOverlay) return;
    this.fxOverlay.classList.add('glitch-flash');
    setTimeout(() => {
      this.fxOverlay.classList.remove('glitch-flash');
    }, durationMs);
  }

  spawnParticleBurst(x, y, count, color, speed) {
    if (this.data.settings.particles === 'low') count = Math.max(4, Math.floor(count * 0.4));
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const mag = (speed * 0.3) + Math.random() * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * mag,
        vy: Math.sin(angle) * mag,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1.0,
        decay: 1.8 + Math.random() * 2.2
      });
    }
  }

  spawnPopup(x, y, text, color = '#00f0ff', scale = 1.0) {
    this.popups.push({
      x,
      y,
      text,
      color,
      size: Math.round(14 * scale),
      vy: 45,
      alpha: 1.0,
      decay: 1.2
    });
  }

  toggleSound() {
    const isMuted = this.sound.toggleMute();
    if (this.soundIconPath) {
      if (isMuted) {
        this.soundIconPath.setAttribute('d', 'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6');
        this.btnSoundToggle.title = 'Unmute Sound [M]';
      } else {
        this.soundIconPath.setAttribute('d', 'M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14');
        this.btnSoundToggle.title = 'Mute Sound [M]';
      }
    }
  }

  // ==========================================================================
  // HUD UPDATES
  // ==========================================================================

  updateHUD() {
    if (this.state !== 'playing') return;

    // Score
    this.hudScore.textContent = Math.floor(this.score).toLocaleString();

    // Timer
    if (this.mode === 'timeattack') {
      const remaining = Math.max(0, this.timeAttackLimit - this.survivalTime);
      this.hudTimer.textContent = this.formatTime(remaining);
    } else {
      this.hudTimer.textContent = this.formatTime(this.survivalTime);
    }

    // Fragments
    this.hudEnergy.textContent = this.fragmentsCollected;

    // Combo
    this.hudComboBadge.textContent = `${this.combo.toFixed(1)}X`;
    const comboPercent = (this.comboTimer / this.maxComboTimer) * 100;
    this.hudComboFill.style.width = `${Math.min(100, Math.max(0, comboPercent))}%`;

    // Fracture Progress & Phase Name
    const phase = PHASES[this.currentPhaseIndex] || PHASES[0];
    this.hudPhaseName.textContent = `PHASE ${phase.id}: ${phase.name}`;
    const fracturePercent = (this.fractureTimer / this.fractureCycleTime) * 100;
    this.hudFractureProgress.style.width = `${Math.min(100, Math.max(0, fracturePercent))}%`;

    // Vitality & Cooldowns
    if (this.activePowerups.shield > 0) {
      this.hudShieldStatus.textContent = 'ACTIVE';
      this.hudShieldStatus.className = 'shield-indicator ready';
    } else {
      this.hudShieldStatus.textContent = 'OFFLINE';
      this.hudShieldStatus.className = 'shield-indicator offline';
    }

    if (this.player) {
      const dashProgress = 1 - (this.player.dashCooldown / this.player.maxDashCooldown);
      this.hudDashFill.style.width = `${Math.min(100, Math.max(0, dashProgress * 100))}%`;
    }

    // Power-ups Dock
    this.renderPowerupsDock();
  }

  renderPowerupsDock() {
    this.hudPowerupsDock.innerHTML = '';
    const activeKeys = Object.keys(this.activePowerups).filter(k => k !== 'shield' && this.activePowerups[k] > 0);

    activeKeys.forEach((key) => {
      const remaining = this.activePowerups[key];
      const pill = document.createElement('div');
      pill.className = `powerup-pill ${key}`;
      const names = { freeze: 'FREEZE', magnet: 'MAGNET', multiplier: '2X SCORE', overdrive: 'OVERDRIVE' };
      pill.innerHTML = `<span>${names[key] || key}</span> <span class="powerup-timer-ring">${remaining.toFixed(1)}s</span>`;
      this.hudPowerupsDock.appendChild(pill);
    });
  }

  formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 10);
    const mm = mins.toString().padStart(2, '0');
    const ss = secs.toString().padStart(2, '0');
    return `${mm}:${ss}.${ms}`;
  }

  // ==========================================================================
  // TITLE SCREEN & MODALS MANAGEMENT
  // ==========================================================================

  updateTitleUI() {
    // Daily Banner
    document.getElementById('daily-date-label').textContent = this.todayStr;
    document.getElementById('daily-modifier-title').textContent = this.dailyModifier.name + ' – ' + this.dailyModifier.desc;
    const dailyBest = (this.data.dailyRecord.date === this.todayStr) ? this.data.dailyRecord.score : 0;
    document.getElementById('daily-best-val').textContent = dailyBest.toLocaleString();

    // Mode records in Statistics modal
    document.getElementById('rec-classic').textContent = `${(this.data.records.classic || 0).toLocaleString()} pts`;
    document.getElementById('rec-timeattack').textContent = `${(this.data.records.timeattack || 0).toLocaleString()} pts`;
    document.getElementById('rec-chaos').textContent = `${(this.data.records.chaos || 0).toLocaleString()} pts`;
  }

  openSkinsModal() {
    this.sound.playClick();
    const container = document.getElementById('skins-grid-container');
    container.innerHTML = '';

    SKINS.forEach((skin) => {
      const isUnlocked = this.data.unlockedSkins.includes(skin.id);
      const isSelected = this.data.selectedSkin === skin.id;

      const card = document.createElement('div');
      card.className = `skin-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;

      card.innerHTML = `
        <canvas class="skin-preview-canvas" width="70" height="70"></canvas>
        <span class="skin-name">${skin.name}</span>
        <span class="skin-status">${isSelected ? 'EQUIPPED' : (isUnlocked ? 'SELECT' : 'LOCKED')}</span>
        <span class="skin-req">${skin.req}</span>
      `;

      // Render miniature skin preview on canvas
      const cvs = card.querySelector('.skin-preview-canvas');
      const pctx = cvs.getContext('2d');
      pctx.translate(35, 35);
      pctx.strokeStyle = skin.color;
      pctx.lineWidth = 3;
      pctx.fillStyle = 'rgba(10, 15, 30, 0.9)';
      pctx.shadowColor = skin.color;
      pctx.shadowBlur = 10;
      pctx.beginPath();
      pctx.arc(0, 0, 16, 0, Math.PI * 2);
      pctx.fill();
      pctx.stroke();

      pctx.fillStyle = '#ffffff';
      pctx.beginPath();
      pctx.arc(0, 0, 7, 0, Math.PI * 2);
      pctx.fill();

      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.sound.playClick();
          this.data.selectedSkin = skin.id;
          StorageManager.save(this.data);
          this.openSkinsModal(); // Re-render grid
        });
      }

      container.appendChild(card);
    });

    this.modalSkins.showModal();
  }

  openAchievementsModal() {
    this.sound.playClick();
    const countEl = document.getElementById('achieve-count');
    const listEl = document.getElementById('achievements-list-container');
    listEl.innerHTML = '';

    const unlockedCount = this.data.unlockedAchievements.length;
    countEl.textContent = `${unlockedCount} / ${ACHIEVEMENTS.length}`;

    ACHIEVEMENTS.forEach((ach) => {
      const isUnlocked = this.data.unlockedAchievements.includes(ach.id);
      const item = document.createElement('div');
      item.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
      item.innerHTML = `
        <div class="achieve-icon">${ach.icon}</div>
        <div class="achieve-details">
          <div class="achieve-title">${ach.title}</div>
          <div class="achieve-desc">${ach.desc}</div>
        </div>
        <div class="achieve-badge">${isUnlocked ? 'UNLOCKED' : 'LOCKED'}</div>
      `;
      listEl.appendChild(item);
    });

    this.modalAchievements.showModal();
  }

  openStatsModal() {
    this.sound.playClick();
    document.getElementById('stat-total-games').textContent = this.data.totalGames.toLocaleString();
    document.getElementById('stat-high-score').textContent = this.data.highScore.toLocaleString();
    document.getElementById('stat-max-survival').textContent = this.formatTime(this.data.maxSurvival);
    document.getElementById('stat-total-energy').textContent = this.data.totalEnergy.toLocaleString();
    document.getElementById('stat-max-combo').textContent = `${(this.data.maxCombo || 1.0).toFixed(1)}X`;
    document.getElementById('stat-total-fractures').textContent = this.data.totalFractures.toLocaleString();

    document.getElementById('rec-classic').textContent = `${(this.data.records.classic || 0).toLocaleString()} pts`;
    document.getElementById('rec-timeattack').textContent = `${(this.data.records.timeattack || 0).toLocaleString()} pts`;
    document.getElementById('rec-chaos').textContent = `${(this.data.records.chaos || 0).toLocaleString()} pts`;

    this.modalStats.showModal();
  }

  openSettingsModal() {
    this.sound.playClick();
    const s = this.data.settings;
    document.getElementById('setting-master-vol').value = s.masterVol;
    document.getElementById('val-master-vol').textContent = `${s.masterVol}%`;
    document.getElementById('setting-sfx-vol').value = s.sfxVol;
    document.getElementById('val-sfx-vol').textContent = `${s.sfxVol}%`;
    document.getElementById('setting-bgm-vol').value = s.bgmVol;
    document.getElementById('val-bgm-vol').textContent = `${s.bgmVol}%`;
    document.getElementById('setting-control-scheme').value = s.controlScheme;
    document.getElementById('setting-shake').value = s.shake;
    document.getElementById('setting-particles').value = s.particles;

    this.modalSettings.showModal();
  }

  bindSettingsForm() {
    const masterSlider = document.getElementById('setting-master-vol');
    const sfxSlider = document.getElementById('setting-sfx-vol');
    const bgmSlider = document.getElementById('setting-bgm-vol');

    const updateAudio = () => {
      const m = parseInt(masterSlider.value, 10);
      const sf = parseInt(sfxSlider.value, 10);
      const bg = parseInt(bgmSlider.value, 10);

      document.getElementById('val-master-vol').textContent = `${m}%`;
      document.getElementById('val-sfx-vol').textContent = `${sf}%`;
      document.getElementById('val-bgm-vol').textContent = `${bg}%`;

      this.data.settings.masterVol = m;
      this.data.settings.sfxVol = sf;
      this.data.settings.bgmVol = bg;

      this.sound.setVolumes(m / 100, sf / 100, bg / 100);
      StorageManager.save(this.data);
    };

    masterSlider.addEventListener('input', updateAudio);
    sfxSlider.addEventListener('input', updateAudio);
    bgmSlider.addEventListener('input', updateAudio);

    document.getElementById('setting-control-scheme').addEventListener('change', (e) => {
      this.data.settings.controlScheme = e.target.value;
      StorageManager.save(this.data);
    });

    document.getElementById('setting-shake').addEventListener('change', (e) => {
      this.data.settings.shake = e.target.value;
      StorageManager.save(this.data);
    });

    document.getElementById('setting-particles').addEventListener('change', (e) => {
      this.data.settings.particles = e.target.value;
      StorageManager.save(this.data);
    });
  }
}

// ============================================================================
// BOOTSTRAP INSTANTIATION
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  window.game = new FractureGame();
});
