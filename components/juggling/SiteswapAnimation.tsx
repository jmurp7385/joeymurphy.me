import { useEffect, useRef, useState } from 'react';
import { Widget } from '../Widget';
type WidgetType = 'ball' | 'siteswap' | 'animation' | 'hand';

const ANIMATION_CONFIG = {
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
  nextThrowValue: number | number[]; // The siteswap value of the next throw
}

/**
 * SiteswapAnimation Component
 * Renders a canvas-based juggling animation with support for async, sync, and multiplex patterns.
 */
export default function SiteswapAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [siteswap, setSiteswap] = useState(ANIMATION_CONFIG.DEFAULT_SITESWAP);
  const [dimensions, setDimensions] = useState({
    width: ANIMATION_CONFIG.WIDTH,
    height: ANIMATION_CONFIG.HEIGHT,
  });
  const [bpm, setBpm] = useState(ANIMATION_CONFIG.DEFAULT_BPM);
  const [isRunning, setIsRunning] = useState(true);
  const [error, setError] = useState('');
  const [animParams, setAnimParams] = useState({
    handSeparation: ANIMATION_CONFIG.HAND_SEPARATION_FACTOR,
    throwHeight: ANIMATION_CONFIG.THROW_HEIGHT_SCALE_FACTOR,
  });
  const [colorParams, setColorParams] = useState({
    activeBeatColor: ANIMATION_CONFIG.DEFAULT_ACTIVE_BEAT_COLOR,
    inactiveBeatColor: ANIMATION_CONFIG.DEFAULT_INACTIVE_BEAT_COLOR,
    activeBeatBorderColor: ANIMATION_CONFIG.DEFAULT_ACTIVE_BEAT_BORDER_COLOR,
    showBeatIndicator: true,
    useSingleColor: false,
    baseHue: ANIMATION_CONFIG.DEFAULT_BASE_HUE,
    singleBallColor: ANIMATION_CONFIG.DEFAULT_BALL_COLOR,
  });

  const animationState = useRef({
    balls: [] as Ball[],
    hands: [] as Hand[],
    pattern: [3] as (number | number[])[],
    numBalls: 3,
    isSync: false,
    isFountain: false,
    beatDuration: 60_000 / ANIMATION_CONFIG.DEFAULT_BPM,
    maxHeight: dimensions.height * 0.7,
    elapsedTime: 0,
    lastTime: 0,
  });

  // Effect to automatically adjust hand separation when the siteswap changes
  useEffect(() => {
    // This parser is just for calculating numBalls to update the UI.
    // The main animation's useEffect has its own parser instance.
    const parseForNumberBalls = (
      siteswapString: string,
    ): { numBalls: number } | undefined => {
      try { // A lightweight version of the main parser, just to get the ball count for UI adjustments.
        siteswapString = siteswapString.toLowerCase().replaceAll(/\s/g, '');
        if (!siteswapString) return undefined;

        const isSync = siteswapString.includes('(');
        const pattern = isSync ? /\((\w+),(\w+)\)/g : /(\[[\da-z]+\]|[\da-z])/g;

        const throws: (number | number[])[] = [];
        let match;
        while ((match = pattern.exec(siteswapString)) !== null) {
          if (isSync) {
            // For sync patterns like (4,4), push both throws into the array.
            throws.push(Number.parseInt(match[1].replace('x', ''), 36), Number.parseInt(match[2].replace('x', ''), 36));
          } else {
            const part = match[1];
            if (part.startsWith('[')) {
              // For multiplex patterns like [34]2, parse each throw inside the brackets.
              throws.push(
                [...part]
                  .slice(1, -1) // Remove brackets before parsing
                  .map((t) => Number.parseInt(t, 36)),
              );
            } else {
              throws.push(Number.parseInt(part, 36));
            }
          }
        }
        // The number of balls is the average of all throw values in the pattern.
        const sum = throws.flat().reduce((a, b) => a + b, 0);
        if (sum === 0 || throws.length === 0 || sum % throws.length !== 0)
          return undefined;
        return { numBalls: sum / throws.length };
      } catch {
        return undefined;
      }
    };

    const result = parseForNumberBalls(siteswap);
    if (result) {
      // Automatically adjust hand separation based on the number of balls for a better visual.
      const newSeparation = Math.max(
        0.1,
        Math.min(result.numBalls / (result.numBalls > 5 ? 20 : 10), 0.8),
      );
      setAnimParams((previous) => ({ ...previous, handSeparation: newSeparation }));
    }
  }, [siteswap]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.min(800, window.innerWidth * 0.8),
        height: window.innerHeight * 0.5,
      });
      animationState.current.maxHeight = window.innerHeight * 0.5;
    };
    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Update maxHeight in animation state when dimensions change
    animationState.current.maxHeight = dimensions.height * 0.8;
  }, [dimensions]);

  const { width, height } = dimensions;

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    let animationFrameId: number;

    /**
     * Parses a siteswap string into its core components.
     * @param siteswapString The siteswap pattern to parse (e.g., "531", "(4,4)", "[34]2").
     * @returns An object containing the pattern as an array of numbers, the number of balls,
     * and a boolean indicating if the pattern is synchronous.
     * @throws An error if the siteswap string is invalid.
     *
     * This function handles standard, synchronous, and multiplex patterns. It uses base-36 parsing to allow for throws > 9 (e.g., 'a' for 10).
     */
    const parseSiteswap = (
      siteswapString: string,
    ): {
      pattern: (number | number[])[];
      numBalls: number;
      isSync: boolean;
    } => {
      siteswapString = siteswapString.toLowerCase().replaceAll(/\s/g, '');
      if (!siteswapString) throw new Error('Siteswap cannot be empty.');

      const isSync = siteswapString.includes('(');
      const throws: (number | number[])[] = [];

      if (isSync) {
        const syncPattern = /\((\w+),(\w+)\)/g;
        let match;
        while ((match = syncPattern.exec(siteswapString)) !== null) {
          const leftThrow = match[1].replace('x', '');
          const rightThrow = match[2].replace('x', '');
          throws.push(Number.parseInt(leftThrow, 36), Number.parseInt(rightThrow, 36));
        }
        if (throws.length === 0)
          throw new Error('Invalid sync siteswap format.');
      } else {
        const asyncPattern = /(\[[\da-z]+\]|[\da-z])/g;
        let match;
        while ((match = asyncPattern.exec(siteswapString)) !== null) {
          const part = match[1];
          if (part.startsWith('[')) {
            throws.push(
              [...part]
                .slice(1, -1) // Remove brackets before parsing
                .map((t) => Number.parseInt(t, 36)),
            );
          } else {
            throws.push(Number.parseInt(part, 36));
          }
        }
      }

      // A valid siteswap's average throw value must be an integer, which equals the number of balls.
      const sum = throws.flat().reduce((a, b) => a + b, 0);
      if (sum === 0 || throws.length === 0 || sum % throws.length !== 0)
        throw new Error('Invalid siteswap pattern.');
      const numberBalls = sum / throws.length;
      return { pattern: throws, numBalls: numberBalls, isSync };
    };

    /**
     * Resets the animation state. Called when the siteswap, BPM, or other core parameters change.
     * @param newSiteswap The siteswap string to initialize the animation with.
     * @param newBpm The beats per minute, which determines the animation speed.
     */
    const resetAnimation = (newSiteswap: string, newBpm: number) => {
      try {
        const { pattern, numBalls, isSync } = parseSiteswap(newSiteswap);
        const state = animationState.current;

        state.pattern = pattern;
        state.numBalls = numBalls;
        state.isSync = isSync;
        state.beatDuration = 60_000 / newBpm;
        // A "fountain" pattern consists entirely of even-numbered throws.
        state.isFountain = pattern.every((throwValue) => {
          if (Array.isArray(throwValue)) {
            return throwValue.every((t) => t > 0 && t % 2 === 0);
          }
          return throwValue > 0 && throwValue % 2 === 0;
        });

        state.elapsedTime = 0;
        state.lastTime = 0;

        const handY = dimensions.height - ANIMATION_CONFIG.HAND_Y_OFFSET;
        // Calculate hand positions based on canvas width and separation parameter.
        const centerX = dimensions.width / 2;
        const handDistribution = (dimensions.width * animParams.handSeparation) / 2;
        const leftHandX = centerX - handDistribution;
        const rightHandX = centerX + handDistribution;

        state.hands = [
          {
            id: 0,
            baseX: leftHandX,
            baseY: handY,
            x: leftHandX,
            y: handY,
            beat: 0, // Left hand is always on beat 0 for phase calculation
            direction: 1,
            patternIndex: 0,
            heldBalls: [],
            nextThrowTime: Infinity,
            throwInOuterPlane: true,
            nextThrowValue: 0,
          },
          {
            id: 1,
            baseX: rightHandX,
            baseY: handY,
            x: rightHandX,
            y: handY,
            beat: isSync ? 0 : 1, // Right hand is on beat 1 for async, 0 for sync
            direction: -1,
            patternIndex: 1,
            heldBalls: [],
            nextThrowTime: Infinity,
            throwInOuterPlane: true,
            nextThrowValue: 0,
          },
        ];

        state.balls = Array.from({ length: numBalls }, (v, index) => {
          const hand = state.hands[index % 2];
          const ball: Ball = {
            id: index,
            x: hand.x,
            y: hand.y,
            inAir: false,
            lastThrowTime: 0,
            throwTime: 0,
            fromLeft: hand.id === 0,
            currentThrow: 0,
            throwIndex: 0,
            controlX: 0,
            isCrossingThrow: false,
            startX: 0,
            startY: 0,
            endX: 0,
            flightDuration: 0,
            throwHeight: 0,
            color: colorParams.useSingleColor
              ? colorParams.singleBallColor
              : `hsl(${
                  (colorParams.baseHue +
                    index * ANIMATION_CONFIG.BALL_COLOR_HUE_STEP) %
                  360
                }, ${ANIMATION_CONFIG.BALL_COLOR_SATURATION}%, ${
                  ANIMATION_CONFIG.BALL_COLOR_LIGHTNESS
                }%)`,
          };
          hand.heldBalls.push(ball);
          return ball;
        });

        // --- Initial Throw Scheduling ---
        // This logic determines when each hand makes its first throw.

        if (isSync) {
          for (const hand of state.hands) {
            if (hand.heldBalls.length > 0) {
              hand.nextThrowValue =
                state.pattern[hand.patternIndex % state.pattern.length];
              hand.nextThrowTime = 0;
              hand.patternIndex += 2; // Each hand must advance by 2 to stay on its track.
            }
          }
        } else {
          // For async patterns, find the first non-zero throw to start the animation, skipping initial '0's.
          let startBeat = 0;
          while (
            pattern[startBeat % pattern.length] === 0 &&
            startBeat < pattern.length
          ) {
            startBeat++;
          }

          // Schedule the first throw for each ball in sequence.
          let beat = startBeat;
          for (let index = 0; index < numBalls; index++) {
            const hand = state.hands.find((h) => h.beat === beat % 2);
            if (hand && hand.heldBalls.length > 0) {
              hand.nextThrowValue =
                state.pattern[hand.patternIndex % state.pattern.length];
              hand.nextThrowTime = beat * state.beatDuration;
              hand.patternIndex += 2;
            }
            beat++;
          }
        }
        setError('');
      } catch (error: unknown) {
        setError((error as Error).message);
      }
    };

    /**
     * The main update function, called on every animation frame.
     * It progresses the simulation time, updates hand and ball positions,
     * and handles throw/catch logic.
     * @param time The current elapsed time of the animation in milliseconds.
     */
    const update = (time: number) => {
      const state = animationState.current;

      // --- 1. Update Hand Positions ---
      for (const hand of state.hands) {
        const xRadius = state.isFountain
          ? ANIMATION_CONFIG.HAND_OSCILLATION_Y_RADIUS
          : ANIMATION_CONFIG.HAND_OSCILLATION_X_RADIUS;
        const yRadius = state.isFountain
          ? ANIMATION_CONFIG.HAND_OSCILLATION_X_RADIUS
          : ANIMATION_CONFIG.HAND_OSCILLATION_Y_RADIUS;

        // Hands move in a circular/elliptical path to simulate a natural juggling motion.
        const period = state.isSync
          ? state.beatDuration
          : 2 * state.beatDuration;
        const phase =
          ((time % period) / period - hand.beat / 2) * Math.PI * 2 + Math.PI;
        hand.x = hand.baseX + Math.sin(phase) * xRadius * hand.direction;
        hand.y = hand.baseY + Math.cos(phase) * yRadius;
      }

      // --- 2. Check for and Execute Throws ---
      for (const hand of state.hands) {
        if (hand.heldBalls.length > 0 && time >= hand.nextThrowTime) {
          const ball = hand.heldBalls.shift();
          if (!ball) continue;

          const throwValue = hand.nextThrowValue;
          const useOuterPlane = hand.throwInOuterPlane;
          const mainThrow = Array.isArray(throwValue)
            ? throwValue[0]
            : throwValue;

          let landingHand: Hand;
          // Determine the catching hand. In siteswap, odd throws cross to the other hand,
          // while even throws are caught by the same hand.
          if (state.isSync) {
            const isCross = mainThrow % 2 !== 0;
            landingHand = isCross
              ? state.hands.find((h) => h.id !== hand.id)!
              : hand;
          } else {
            const landingBeat = (hand.beat + mainThrow) % 2;
            landingHand = state.hands.find((h) => h.beat === landingBeat)!;
          }

          ball.inAir = true;
          ball.throwTime = time;
          ball.startX = hand.x; // Throw from the hand's current position
          ball.isCrossingThrow = mainThrow % 2 !== 0;
          ball.startY = hand.y;
          ball.endX = landingHand.baseX;
          ball.flightDuration = mainThrow * state.beatDuration;
          // Throw height is proportional to the square of the throw value, simulating physics.
          const calculatedHeight =
            state.maxHeight *
            Math.pow(mainThrow / 5, 2) *
            (animParams.throwHeight / 5);
          ball.throwHeight = Math.min(
            calculatedHeight,
            // ensure ball height padding of 3 ball radii
            ball.startY - ANIMATION_CONFIG.BALL_RADIUS * 3,
          );

          // The control point for the Bezier curve is used to create the arc of the throw.
          const planeOffset = 0; // Plane offset is removed.
          ball.controlX = ball.isCrossingThrow ? (ball.startX + ball.endX) / 2 + planeOffset : planeOffset * hand.direction;

          // Schedule the next throw for this hand.
          // Sync patterns throw on every beat. Async patterns have each hand throw every 2 beats.
          if (state.isSync) {
            const currentBeat = Math.floor(time / state.beatDuration);
            hand.nextThrowTime = (currentBeat + 1) * state.beatDuration;
          } else {
            hand.nextThrowTime = time + 2 * state.beatDuration;
          }
          hand.nextThrowValue =
            state.pattern[hand.patternIndex % state.pattern.length];
          hand.throwInOuterPlane = !useOuterPlane;
          // Each hand's pattern index must advance by 2 to stay on its "track" (e.g., left: 0, 2, 4...; right: 1, 3, 5...).
          hand.patternIndex += 2; // Always advance by 2 for both sync and async.
        }
      }

      // --- 3. Update Ball Positions ---
      for (const ball of state.balls) {
        if (ball.inAir) {
          const timeInAir = time - ball.throwTime;
          if (timeInAir >= ball.flightDuration) {
            ball.inAir = false;
            const landingHand = state.hands.find((h) => h.baseX === ball.endX);
            if (landingHand) {
              landingHand.heldBalls.push(ball);
              landingHand.heldBalls.sort((a, b) => a.id - b.id);
            }
          } else {
            const progress = timeInAir / ball.flightDuration;

            // --- Ball Trajectory Calculation ---
            if (ball.isCrossingThrow) {
              // For crossing throws, use a quadratic Bezier curve for a natural arc.
              // The horizontal motion has an "ease-out" effect for a more realistic look.
              const horizontalProgress = Math.sin(progress * (Math.PI / 2)); // Ease-out for crossing throws
              const p0x = ball.startX; // Start
              const p1x = ball.controlX; // Bezier control for arc shape
              const p2x = ball.endX; // End
              ball.x =
                (1 - horizontalProgress) * (1 - horizontalProgress) * p0x +
                2 * (1 - horizontalProgress) * horizontalProgress * p1x +
                horizontalProgress * horizontalProgress * p2x;
            } else {
              // For same-hand throws (fountains), create a simple outward arc.
              ball.x = ball.startX + Math.sin(progress * Math.PI) * ball.controlX;
            }

            // The vertical motion follows a standard parabolic arc: y(t) = h * 4t(1-t)
            // A "1" throw is given a lower, flatter arc for visual clarity.
            ball.y = ball.currentThrow === 1 && ball.isCrossingThrow ? ball.startY -
                ball.throwHeight * 0.5 * Math.sin(progress * Math.PI) : ball.startY - ball.throwHeight * 4 * progress * (1 - progress);
          }
        } else {
          // If the ball is not in the air, its position is locked to its holding hand.
          const holdingHand = state.hands.find((h) =>
            h.heldBalls.includes(ball),
          );
          if (holdingHand) {
            ball.x = holdingHand.x;
            ball.y = holdingHand.y;
          }
        }
      }
    };

    /**
     * Draws the current state of the animation onto the canvas.
     * This function is purely for rendering and does not modify the animation state.
     */
    const draw = () => {
      context.clearRect(0, 0, width, height);
      const { balls, hands, elapsedTime, beatDuration, isSync } =
        animationState.current;

      const currentBeat = Math.floor(elapsedTime / beatDuration);

      for (const hand of hands) {
        // Highlight the hand if it's its turn to throw.
        const isActive =
          colorParams.showBeatIndicator &&
          (isSync || currentBeat % 2 === hand.beat);

        context.fillStyle = isActive
          ? colorParams.activeBeatColor
          : colorParams.inactiveBeatColor;
        context.fillRect(
          hand.x - ANIMATION_CONFIG.HAND_WIDTH / 2,
          hand.y - ANIMATION_CONFIG.HAND_HEIGHT / 2,
          ANIMATION_CONFIG.HAND_WIDTH,
          ANIMATION_CONFIG.HAND_HEIGHT,
        );

        if (isActive) {
          context.strokeStyle = colorParams.activeBeatBorderColor;
          context.lineWidth = 2;
          context.strokeRect(
            hand.x - ANIMATION_CONFIG.HAND_WIDTH / 2,
            hand.y - ANIMATION_CONFIG.HAND_HEIGHT / 2,
            ANIMATION_CONFIG.HAND_WIDTH,
            ANIMATION_CONFIG.HAND_HEIGHT,
          );
        }
      }

      for (const ball of balls) {
        context.beginPath();
        context.arc(ball.x, ball.y, ANIMATION_CONFIG.BALL_RADIUS, 0, Math.PI * 2);
        context.fillStyle = ball.color;
        context.fill();
        context.closePath();
      }
    };

    /**
     * The main animation loop, driven by requestAnimationFrame.
     * @param currentTime The high-resolution timestamp provided by requestAnimationFrame.
     */
    const animationLoop = (currentTime: number) => {
      const state = animationState.current;
      const deltaTime =
        state.lastTime > 0 ? currentTime - state.lastTime : 16.67;
      state.lastTime = currentTime;

      if (isRunning) {
        state.elapsedTime += deltaTime;
        update(state.elapsedTime);
      }

      draw();
      animationFrameId = requestAnimationFrame(animationLoop);
    };

    resetAnimation(siteswap, bpm);
    animationLoop(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [siteswap, bpm, isRunning, animParams, colorParams, dimensions.height, dimensions.width, width, height]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        color: '#e0e0e0',
        width: '100%',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <h1>Siteswap Animator (Alpha)</h1>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          backgroundColor: '#222',
          borderRadius: '8px',
          border: '1px solid #444',
        }}
      ></canvas>
      <div
        style={{
          color: '#ff4d4d',
          marginTop: '10px',
          height: '20px',
          fontWeight: 'bold',
        }}
      >
        {error}
      </div>
      <Widget
        widget='siteswap'
        style={{
          display: 'flex',
          gap: '15px',
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#2a2a2a',
          flexWrap: 'wrap',
          flexDirection: 'row',
          borderRadius: '8px',
          width: '100%',
          justifyContent: 'center',
          maxWidth: width,
        }}
      >
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            backgroundColor: '#007acc',
            border: 'none',
            color: 'white',
            padding: '8px 15px',
            borderRadius: '4px',
            maxWidth: '80px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor='siteswap-input'>Siteswap:</label>
          <input
            id='siteswap-input'
            type='text'
            value={siteswap}
            onChange={(event) => setSiteswap(event.target.value)}
            style={{
              backgroundColor: '#333',
              border: '1px solid #444',
              color: '#e0e0e0',
              borderRadius: '4px',
              padding: '8px',
              width: '80px',
              textAlign: 'center',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor='bpm-input'>BPM:</label>
          <input
            id='bpm-input'
            type='number'
            value={bpm}
            onChange={(event) => setBpm(Number.parseInt(event.target.value, 10))}
            min='30'
            max='300'
            style={{
              backgroundColor: '#333',
              border: '1px solid #444',
              color: '#e0e0e0',
              borderRadius: '4px',
              padding: '8px',
              width: '80px',
              textAlign: 'center',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '10px',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            padding: '10px',
            width: '100%',
            maxWidth: width,
          }}
        >
          {[
            '3',
            '4',
            '5',
            '7',
            '9',
            '441',
            '531',
            '51',
            '71',
            '91',
            '(4,4)',
            '(6,6)',
            '(8,8)',
            '(6x,4)',
            '[34]2',
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => setSiteswap(preset)}
              style={{
                backgroundColor: '#3a3a3a',
                border: '1px solid #444',
                color: '#e0e0e0',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </Widget>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          width: '100%',
          maxWidth: width,
          justifyContent: 'center',
        }}
      >
        <Widget<WidgetType>
          widget='ball'
          style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            maxWidth: width,
          }}
        >
          <h3 style={{ margin: 0, textAlign: 'center' }}>Ball Parameters</h3>
          <div
            style={{
              display: 'flex',
              gap: '10px',
            }}
          >
            <label htmlFor='single-color-toggle' style={{ flexBasis: '120px' }}>
              Single Ball Color:
            </label>
            <input
              id='single-color-toggle'
              type='checkbox'
              checked={colorParams.useSingleColor}
              onChange={(event) =>
                setColorParams((previous) => ({
                  ...previous,
                  useSingleColor: event.target.checked,
                }))
              }
            />
          </div>
          <div
            style={{
              display: 'flex',
              gap: '10px',
            }}
          >
            {colorParams.useSingleColor ? (
              <>
                <label
                  htmlFor='ball-color-picker'
                  style={{ flexBasis: '120px' }}
                >
                  Ball Color:
                </label>
                <input
                  id='ball-color-picker'
                  type='color'
                  value={colorParams.singleBallColor}
                  onChange={(event) =>
                    setColorParams((previous) => ({
                      ...previous,
                      singleBallColor: event.target.value,
                    }))
                  }
                />
              </>
            ) : (
              <>
                <label htmlFor='base-hue-slider' style={{ flexBasis: '120px' }}>
                  Base Hue:
                </label>
                <input
                  id='base-hue-slider'
                  type='range'
                  min='0'
                  max='360'
                  value={colorParams.baseHue}
                  onChange={(event) =>
                    setColorParams((previous) => ({
                      ...previous,
                      baseHue: Number.parseInt(event.target.value, 10),
                    }))
                  }
                  style={{ flexGrow: 1 }}
                />
                <span>{colorParams.baseHue}</span>
              </>
            )}
          </div>
        </Widget>
        <Widget<WidgetType>
          widget='animation'
          backgroundColor='#2a2a2a'
          style={{
            flexGrow: '1',
            gap: '15px',
            marginTop: '10px',
            padding: '15px',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            maxWidth: width,
          }}
        >
          <h3 style={{ margin: 0, textAlign: 'center' }}>
            Animation Parameters
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: 'center',
            }}
          >
            <label
              htmlFor='hand-separation-slider'
              style={{ flexBasis: '120px' }}
            >
              Hand Separation:
            </label>
            <input
              id='hand-separation-slider'
              type='range'
              min='0.1'
              max='0.8'
              step='0.01'
              value={animParams.handSeparation}
              onChange={(event) =>
                setAnimParams((previous) => ({
                  ...previous,
                  handSeparation: Number.parseFloat(event.target.value),
                }))
              }
              style={{ flexGrow: 1 }}
            />
            <span>{animParams.handSeparation.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: 'center',
            }}
          >
            <label htmlFor='throw-height-slider' style={{ flexBasis: '120px' }}>
              Throw Height:
            </label>
            <input
              id='throw-height-slider'
              type='range'
              min='1'
              max='5'
              step='0.1'
              value={animParams.throwHeight}
              onChange={(event) =>
                setAnimParams((previous) => ({
                  ...previous,
                  throwHeight: Number.parseFloat(event.target.value),
                }))
              }
              style={{ flexGrow: 1 }}
            />
            <span>{animParams.throwHeight.toFixed(1)}</span>
          </div>
        </Widget>
        <Widget<WidgetType>
          widget='hand'
          backgroundColor='#2a2a2a'
          style={{
            flexGrow: '1',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            maxWidth: width,
          }}
        >
          <h3 style={{ margin: 0, textAlign: 'center' }}>Hand Parameters</h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              padding: '15px',
              justifyContent: 'space-around',
            }}
          >
            <div
              style={{
                flexDirection: 'column',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <label htmlFor='active-color-picker'>Active Color:</label>
              <input
                id='active-color-picker'
                type='color'
                style={{ width: '100%' }}
                value={colorParams.activeBeatColor}
                onChange={(event) =>
                  setColorParams((previous) => ({
                    ...previous,
                    activeBeatColor: event.target.value,
                  }))
                }
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              <label htmlFor='inactive-color-picker'>Inactive Color:</label>
              <input
                id='inactive-color-picker'
                type='color'
                style={{ width: '100%' }}
                value={colorParams.inactiveBeatColor}
                onChange={(event) =>
                  setColorParams((previous) => ({
                    ...previous,
                    inactiveBeatColor: event.target.value,
                  }))
                }
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              <label htmlFor='border-color-picker'>Border Color:</label>
              <input
                id='border-color-picker'
                type='color'
                style={{ width: '100%' }}
                value={colorParams.activeBeatBorderColor}
                onChange={(event) =>
                  setColorParams((previous) => ({
                    ...previous,
                    activeBeatBorderColor: event.target.value,
                  }))
                }
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              <label htmlFor='beat-indicator-toggle'>
                Show Beat Indicator:
              </label>
              <input
                id='beat-indicator-toggle'
                type='checkbox'
                checked={colorParams.showBeatIndicator}
                onChange={(event) =>
                  setColorParams((previous) => ({
                    ...previous,
                    showBeatIndicator: event.target.checked,
                  }))
                }
              />
            </div>
          </div>
        </Widget>
      </div>
    </div>
  );
}
