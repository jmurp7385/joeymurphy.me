import { RefObject, useEffect } from 'react';
import { ANIMATION_CONFIG, Ball, Hand, Throw } from './animation-types';
import { ParsedSiteswap, parseSiteswap } from './siteswap-parser';

interface JugglingAnimationProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  siteswap: string;
  bpm: number;
  isRunning: boolean;
  animParams: { handSeparation: number; throwHeight: number };
  colorParams: {
    activeBeatColor: string;
    inactiveBeatColor: string;
    activeBeatBorderColor: string;
    showBeatIndicator: boolean;
    useSingleColor: boolean;
    baseHue: number;
    singleBallColor: string;
  };
  dimensions: { width: number; height: number };
  animationState: RefObject<{
    balls: Ball[];
    hands: Hand[];
    pattern: ParsedSiteswap['pattern'];
    numBalls: number;
    isSync: boolean;
    isFountain: boolean;
    beatDuration: number;
    maxHeight: number;
    elapsedTime: number;
    lastTime: number;
  }>;
  setError: (message: string) => void;
}

const isThrow = (t: unknown): t is Throw =>
  typeof t === 'object' && t !== null && 'value' in t && 'isCrossing' in t;

/**
 * Checks if a given throw or multiplex throw consists entirely of zero-value throws.
 * @param throwValue A Throw object or an array of Throw objects.
 * @returns True if all throws have a value of 0.
 */
const isZeroThrow = (throwValue: Throw | Throw[]): boolean => {
  if (Array.isArray(throwValue)) {
    return throwValue.every((t) => t.value === 0);
  }
  return isThrow(throwValue) && throwValue.value === 0;
};
export const useJugglingAnimation = ({
  canvasRef,
  siteswap,
  bpm,
  isRunning,
  animParams,
  colorParams,
  dimensions,
  animationState,
  setError,
}: JugglingAnimationProps) => {
  const { width, height } = dimensions;

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    let animationFrameId: number;

    /**
     * Resets the animation state. Called when the siteswap, BPM, or other core parameters change.
     * @param newSiteswap The siteswap string to initialize the animation with.
     * @param newBpm The beats per minute, which determines the animation speed.
     */
    const resetAnimation = (newSiteswap: string, newBpm: number) => {
      try {
        const { pattern, numBalls, isSync } = parseSiteswap(newSiteswap);
        const state = animationState.current!;

        state.pattern = pattern;
        state.numBalls = numBalls;
        state.isSync = isSync;
        state.beatDuration = 60_000 / newBpm;
        // A "fountain" pattern consists entirely of even-numbered throws.
        state.isFountain = pattern.every((throwValue) => {
          if (Array.isArray(throwValue)) {
            return throwValue.every((t) => t.value > 0 && t.value % 2 === 0);
          }
          if (isThrow(throwValue)) {
            return throwValue.value > 0 && throwValue.value % 2 === 0;
          }
          return false;
        });

        state.elapsedTime = 0;
        state.lastTime = 0;

        const handY = dimensions.height - ANIMATION_CONFIG.HAND_Y_OFFSET;
        // Calculate hand positions based on canvas width and separation parameter.
        const centerX = dimensions.width / 2;
        const handDistribution =
          (dimensions.width * animParams.handSeparation) / 2;
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
            nextThrowValue: { value: 0, isCrossing: false },
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
            nextThrowValue: { value: 0, isCrossing: false },
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
        if (isSync) {
          for (const hand of state.hands) {
            hand.nextThrowValue =
              state.pattern[hand.patternIndex % state.pattern.length];
            hand.nextThrowTime = 0; // Both hands throw at the start
            hand.patternIndex += 2;
          }
        } else {
          let startBeat = 0;
          while (
            // Only skip beats with a throw value of 0
            // This check needs to handle both single Throw objects and arrays of Throws (multiplex)
            isZeroThrow(pattern[startBeat % pattern.length]) &&
            startBeat < pattern.length
          ) {
            startBeat++;
          }

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

    const update = (time: number) => {
      const state = animationState.current!;
      for (const hand of state.hands) {
        const xRadius = state.isFountain
          ? ANIMATION_CONFIG.HAND_OSCILLATION_Y_RADIUS
          : ANIMATION_CONFIG.HAND_OSCILLATION_X_RADIUS;
        const yRadius = state.isFountain
          ? ANIMATION_CONFIG.HAND_OSCILLATION_X_RADIUS
          : ANIMATION_CONFIG.HAND_OSCILLATION_Y_RADIUS;
        const period = state.isSync
          ? state.beatDuration
          : 2 * state.beatDuration;
        const phase =
          ((time % period) / period - (state.isSync ? 0 : hand.beat / 2)) *
            Math.PI *
            2 +
          Math.PI;
        hand.x = hand.baseX + Math.sin(phase) * xRadius * hand.direction;
        hand.y = hand.baseY + Math.cos(phase) * yRadius;
      }

      for (const hand of state.hands) {
        if (hand.heldBalls.length > 0 && time >= hand.nextThrowTime) {
          const throwValue = hand.nextThrowValue;
          const throwsToExecute = Array.isArray(throwValue)
            ? throwValue
            : [throwValue];

          for (const currentThrow of throwsToExecute) {
            if (hand.heldBalls.length === 0) break;
            const ball = hand.heldBalls.shift();
            if (!ball) continue;
            const useOuterPlane = hand.throwInOuterPlane;
            let landingHand: Hand;
            let isCross: boolean;

            if (state.isSync) {
              isCross = isThrow(currentThrow) ? currentThrow.isCrossing : false;
              landingHand = isCross
                ? state.hands.find((h) => h.id !== hand.id)!
                : hand;
            } else {
              isCross = isThrow(currentThrow) ? currentThrow.isCrossing : false;
              const landingBeat = (hand.beat + currentThrow.value) % 2;
              landingHand = state.hands.find((h) => h.beat === landingBeat)!;
            }

            ball.inAir = true;
            ball.throwTime = time;
            ball.startX = hand.x;
            ball.isCrossingThrow = isCross;
            ball.startY = hand.y;
            ball.endX = landingHand.baseX;
            ball.flightDuration = isThrow(currentThrow)
              ? (currentThrow.value -
                  (state.isSync ? ANIMATION_CONFIG.DWELL_FACTOR : 0)) *
                state.beatDuration
              : 0;
            ball.currentThrow = isThrow(currentThrow) ? currentThrow.value : 0;

            const calculatedHeight =
              state.maxHeight *
              Math.pow(
                (isThrow(currentThrow) ? currentThrow.value : 0) / 5,
                2,
              ) *
              (animParams.throwHeight / 5);
            ball.throwHeight = Math.min(
              calculatedHeight,
              ball.startY - ANIMATION_CONFIG.BALL_RADIUS * 3,
            );
            const planeOffset = 0;
            ball.controlX = ball.isCrossingThrow
              ? (ball.startX + ball.endX) / 2 + planeOffset
              : planeOffset * hand.direction;
            if (
              throwsToExecute.indexOf(currentThrow) ===
              throwsToExecute.length - 1
            ) {
              hand.throwInOuterPlane = !useOuterPlane;
            }
          }

          hand.nextThrowTime =
            (state.isSync ? hand.nextThrowTime : time) + 2 * state.beatDuration;
          hand.nextThrowValue =
            state.pattern[hand.patternIndex % state.pattern.length];
          hand.patternIndex += 2;
        }
      }

      for (const ball of state.balls) {
        if (ball.inAir) {
          const timeInAir = time - ball.throwTime;
          if (timeInAir >= ball.flightDuration) {
            const dwellDuration = state.isSync
              ? ANIMATION_CONFIG.DWELL_FACTOR * state.beatDuration
              : 0;
            if (timeInAir >= ball.flightDuration + dwellDuration) {
              ball.inAir = false;
              const landingHand = state.hands.find(
                (h) => h.baseX === ball.endX,
              );
              if (landingHand) {
                landingHand.heldBalls.push(ball);
                landingHand.heldBalls.sort((a, b) => a.id - b.id);
              }
            }
          } else {
            const progress = timeInAir / ball.flightDuration;
            if (ball.isCrossingThrow) {
              const horizontalProgress = Math.sin(progress * (Math.PI / 2));
              const p0x = ball.startX;
              const p1x = ball.controlX;
              const p2x = ball.endX;
              ball.x =
                (1 - horizontalProgress) * (1 - horizontalProgress) * p0x +
                2 * (1 - horizontalProgress) * horizontalProgress * p1x +
                horizontalProgress * horizontalProgress * p2x;
            } else {
              ball.x =
                ball.startX + Math.sin(progress * Math.PI) * ball.controlX;
            }
            ball.y =
              ball.startY - ball.throwHeight * 4 * progress * (1 - progress);
          }
        } else {
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

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const { balls, hands, elapsedTime, beatDuration, isSync } =
        animationState.current!;
      const currentBeat = Math.floor(elapsedTime / beatDuration);
      for (const hand of hands) {
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
        context.arc(
          ball.x,
          ball.y,
          ANIMATION_CONFIG.BALL_RADIUS,
          0,
          Math.PI * 2,
        );
        context.fillStyle = ball.color;
        context.fill();
        context.closePath();
      }
    };

    const animationLoop = (currentTime: number) => {
      const state = animationState.current!;
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
  }, [
    siteswap,
    bpm,
    isRunning,
    animParams,
    colorParams,
    dimensions.height,
    dimensions.width,
    width,
    height,
    animationState,
    canvasRef,
    setError,
  ]);
};
