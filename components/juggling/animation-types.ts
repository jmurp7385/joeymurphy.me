/** Interface for a ball object in the juggling simulation. */
export interface Ball {
  id: number; // Unique identifier for the ball
  x: number; // Current X-position in SVG,
  y: number; // Current Y-position in SVG
  inAir: boolean; // Whether the ball is currently in the air
  lastThrowTime: number; // Simulated time (ms) when the ball was last thrown
  throwTime: number; // Simulated time (ms) when the ball is scheduled to throw next
  fromLeft: boolean; // Indicates if the ball is currently in the left hand
  currentThrow: number; // Current siteswap value (e.g., 3, 4, etc.)
  throwIndex: number; // Index in the siteswap pattern for this throw
  controlX: number; // X-coordinate of the Bezier curve control point for its trajectory
  isCrossingThrow: boolean; // True if the throw crosses the center of the pattern (odd-numbered throws)
  startX: number; // Starting X position of the throw
  startY: number; // Starting Y position of the throw
  endX: number; // Target X position of the throw
  flightDuration: number; // Total time the ball will be in the air (ms)
  throwHeight: number; // Peak height of the throw
  color: string; // Color of the ball
}

export interface Throw {
  value: number;
  isCrossing?: boolean;
}

/** Interface for a hand object in the juggling simulation. */
export interface Hand {
  id: number; // 0 for left, 1 for right
  x: number; // Current X position, including oscillation
  y: number; // Current Y position, including oscillation
  baseX: number; // The center X position around which the hand oscillates
  baseY: number; // The center Y position around which the hand oscillates
  beat: number; // The beat on which this hand throws in an async pattern (0 or 1)
  direction: number; // The direction of hand movement and non-crossing throws (-1 for right, 1 for left)
  patternIndex: number; // The current index this hand is reading from in the siteswap pattern array
  heldBalls: Ball[]; // An array of balls currently held by this hand
  nextThrowTime: number; // The time (in ms) for the next scheduled throw
  throwInOuterPlane: boolean; // Toggles for alternating throw planes (not currently used)
  nextThrowValue: Throw | Throw[]; // The siteswap value of the next throw
}

export const ANIMATION_CONFIG = {
  WIDTH: 800,
  HEIGHT: 400,

  // Hand properties
  HAND_Y_OFFSET: 50,
  HAND_SEPARATION_FACTOR: 0.2, // Proportion of canvas width between hands (0 to 1)
  HAND_OSCILLATION_X_RADIUS: 20,
  HAND_OSCILLATION_Y_RADIUS: 30,
  HAND_WIDTH: 40,
  HAND_HEIGHT: 10,

  // Ball and throw properties
  BALL_RADIUS: 10,
  BALL_COLOR_HUE_STEP: 40,
  BALL_COLOR_SATURATION: 90,
  BALL_COLOR_LIGHTNESS: 60,
  BALL_DEPTH_SCALE_FACTOR: 0.2,
  DEFAULT_BASE_HUE: 0,
  DEFAULT_BALL_COLOR: '#ff0000',
  THROW_HEIGHT_SCALE_FACTOR: 5,

  // Default UI values
  DEFAULT_BPM: 180,
  DEFAULT_SITESWAP: '3',

  // Color Defaults
  DEFAULT_ACTIVE_BEAT_COLOR: '#007acc',
  DEFAULT_INACTIVE_BEAT_COLOR: '#444',
  DEFAULT_ACTIVE_BEAT_BORDER_COLOR: '#ffffff',
};
