// src/constants.js
export const DPR = window.devicePixelRatio || 1;

// Game timing
export const FIXED_DT = 1000 / 60; // 60 Hz simulation
export const MAX_STEPS = 5;        // avoid spiral of death

// Core game constants (ported from prototype)
export const INITIAL_GAME_TIME_MS = 120 * 1000;
export const INITIAL_DRONES = 250;
export const INITIAL_BOMBS = { micro: 20, standard: 10, heavy: 5 };
export const MAX_TOTAL_DRONES = 400;

// New mechanics
export const BOMB_CLIP_SIZE = 3;
export const BOMB_OVERHEAT_COOLDOWN = { micro: 2000, standard: 3000, heavy: 5000 };
export const DRONE_WAVE_SIZES = { scout: 10, assault: 25 };

// Drone physics
export const DRONE_MAX_SPEED = 0.45 * DPR;
export const DRONE_MAX_FORCE = 0.009 * DPR;

// Bombs
export const BOMB_TYPES = ['micro', 'standard', 'heavy'];
export const BOMB_DATA = {
  micro:    { radius: 25 * DPR, color: 'rgba(180, 220, 255, 0.8)' },
  standard: { radius: 40 * DPR, color: 'rgba(255, 180, 40, 0.8)' },
  heavy:    { radius: 60 * DPR, color: 'rgba(255, 80, 40, 0.9)' }
};

// Colors
export const COLORS = {
  P1_DRONE: '#4a90e2',
  P2_DRONE: '#e24a4a',
  ZONE_LINE: 'rgba(255,255,255,0.1)',
  WARPATH_BG: 'rgba(255,255,255,0.03)'
};
