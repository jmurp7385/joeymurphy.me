import { useEffect, useRef, useState } from 'react';

// Interface for a ball object in the juggling simulation
export interface Ball {
  id: number; // Unique identifier for the ball
  x: number; // Current X-position in SVG,
  y: number; // Current Y-position in SVG
  inAir: boolean; // Whether the ball is currently in the air
  lastThrowTime: number; // Simulated time (ms) when the ball was last thrown
  throwTime: number; // Simulated time (ms) when the ball is scheduled to throw next
  fromLeft: boolean; // Indicates if the ball is currently in the left hand
  currentThrow: number; // Current siteswap value (e.g., 3, 4, etc.)
  throwIndex: number; // Current index in the siteswap pattern
  startX: number;
  startY: number;
  endX: number;
  flightDuration: number;
  throwHeight: number;
  color: string;
}

export interface Hand {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  beat: number;
  direction: number;
  patternIndex: number;
  heldBalls: Ball[];
  nextThrowTime: number;
  nextThrowValue: number | number[];
}

/**
 * SiteswapAnimation Component
 * Renders a canvas-based juggling animation with support for async, sync, and multiplex patterns.
 */
export default function SiteswapAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [siteswap, setSiteswap] = useState('3');
  const [bpm, setBpm] = useState(180);
  const [isRunning, setIsRunning] = useState(true);
  const [error, setError] = useState('');

  const animationState = useRef({
    balls: [] as Ball[],
    hands: [] as Hand[],
    pattern: [3] as (number | number[])[],
    numBalls: 3,
    isSync: false,
    beatDuration: 60000 / 180,
    maxHeight: 480,
    elapsedTime: 0,
    lastTime: 0,
  });

  const width = 600; // Width of the SVG canvas in pixels
  const height = 600; // Height of the SVG canvas in pixels

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const parseSiteswap = (siteswapStr: string) => {
      siteswapStr = siteswapStr.toLowerCase().replace(/\s/g, '');
      if (!siteswapStr) throw new Error('Siteswap cannot be empty.');

      const isSync = siteswapStr.includes('(');
      let throws: (number | number[])[] = [];

      if (isSync) {
        const syncPattern = /\((\w+),(\w+)\)/g;
        let match;
        while ((match = syncPattern.exec(siteswapStr)) !== null) {
          const leftThrow = match[1].replace('x', '');
          const rightThrow = match[2].replace('x', '');
          throws.push(parseInt(leftThrow, 36));
          throws.push(parseInt(rightThrow, 36));
        }
        if (throws.length === 0)
          throw new Error('Invalid sync siteswap format.');
      } else {
        const asyncPattern = /(\[[\da-z]+\]|[\da-z])/g;
        let match;
        while ((match = asyncPattern.exec(siteswapStr)) !== null) {
          const part = match[1];
          if (part.startsWith('[')) {
            throws.push(
              part
                .substring(1, part.length - 1)
                .split('')
                .map((t) => parseInt(t, 36)),
            );
          } else {
            throws.push(parseInt(part, 36));
          }
        }
      }

      const sum = throws.flat().reduce((a, b) => a + b, 0);
      if (sum % throws.length !== 0) {
        throw new Error(
          'Invalid siteswap: does not resolve to an integer number of balls.',
        );
      }
      const numBalls = sum / throws.length;

      const landingBeats: number[] = [];
      for (let i = 0; i < throws.length; i++) {
        const throwVal = throws[i];
        const landingBeat = i + (Array.isArray(throwVal) ? throwVal[0] : throwVal);
        if (landingBeats.includes(landingBeat % throws.length)) {
          throw new Error(`Invalid siteswap: collision detected at beat ${i}.`);
        }
        landingBeats.push(landingBeat % throws.length);
      }

      return { pattern: throws, numBalls, isSync };
    };

    const resetAnimation = (newSiteswap: string, newBpm: number) => {
      try {
        const { pattern, numBalls, isSync } = parseSiteswap(newSiteswap);
        const state = animationState.current;

        state.pattern = pattern;
        state.numBalls = numBalls;
        state.isSync = isSync;
        state.beatDuration = 60000 / newBpm;
        state.elapsedTime = 0;
        state.lastTime = 0;

        const handY = height - 50;
        state.hands = [
          {
            id: 0,
            baseX: width * 0.25,
            baseY: handY,
            x: width * 0.25,
            y: handY,
            beat: isSync ? 0 : 0,
            direction: 1,
            patternIndex: 0,
            heldBalls: [],
            nextThrowTime: Infinity,
            nextThrowValue: 0,
          },
          {
            id: 1,
            baseX: width * 0.75,
            baseY: handY,
            x: width * 0.75,
            y: handY,
            beat: isSync ? 0 : 1,
            direction: -1,
            patternIndex: 1,
            heldBalls: [],
            nextThrowTime: Infinity,
            nextThrowValue: 0,
          },
        ];

        state.balls = Array.from({ length: numBalls }, (v, i) => {
          const hand = state.hands[i % 2];
          const ball: Ball = {
            id: i,
            x: hand.x,
            y: hand.y,
            inAir: false,
            lastThrowTime: 0,
            throwTime: 0,
            fromLeft: hand.id === 0,
            currentThrow: 0,
            throwIndex: 0,
            startX: 0,
            startY: 0,
            endX: 0,
            flightDuration: 0,
            throwHeight: 0,
            color: `hsl(${(i * 40) % 360}, 90%, 60%)`,
          };
          hand.heldBalls.push(ball);
          return ball;
        });

        if (isSync) {
          state.hands.forEach((hand) => {
            if (hand.heldBalls.length > 0) {
              hand.nextThrowValue = state.pattern[hand.patternIndex % state.pattern.length];
              hand.nextThrowTime = 0;
              hand.patternIndex += 1;
            }
          });
        } else {
          let beat = 0;
          for (let i = 0; i < numBalls; i++) {
            const hand = state.hands.find((h) => h.beat === beat % 2);
            if (hand && hand.heldBalls.length > 0) {
              hand.nextThrowValue = state.pattern[hand.patternIndex % state.pattern.length];
              hand.nextThrowTime = beat * state.beatDuration;
              hand.patternIndex += 2;
            }
            beat++;
          }
        }
        setError('');
      } catch (e: any) {
        setError(e.message);
      }
    };

    const update = (time: number) => {
      const state = animationState.current;

      // Update hands
      state.hands.forEach((hand) => {
        const period = state.isSync ? state.beatDuration : 2 * state.beatDuration;
        const phase = (time / period - hand.beat / 2) * Math.PI * 2;
        hand.x = hand.baseX + Math.sin(phase) * 30 * hand.direction;
        hand.y = hand.baseY + Math.cos(phase) * 10;
      });

      // Check for throws
      state.hands.forEach((hand) => {
        if (hand.heldBalls.length > 0 && time >= hand.nextThrowTime) {
          const ball = hand.heldBalls.shift();
          if (!ball) return;

          const throwValue = hand.nextThrowValue;
          const mainThrow = Array.isArray(throwValue) ? throwValue[0] : throwValue;

          let landingHand: Hand;
          if (state.isSync) {
            const isCross = mainThrow % 2 !== 0;
            landingHand = isCross ? state.hands.find((h) => h.id !== hand.id)! : hand;
          } else {
            const landingBeat = (hand.beat + mainThrow) % 2;
            landingHand = state.hands.find((h) => h.beat === landingBeat)!;
          }

          ball.inAir = true;
          ball.throwTime = time;
          ball.startX = hand.x;
          ball.startY = hand.y;
          ball.endX = landingHand.baseX;
          ball.flightDuration = mainThrow * state.beatDuration;
          ball.throwHeight = Math.min(ball.startY, state.maxHeight * Math.pow(mainThrow / 5, 2));

          hand.nextThrowTime = time + (state.isSync ? state.beatDuration : 2 * state.beatDuration);
          hand.nextThrowValue = state.pattern[hand.patternIndex % state.pattern.length];
          hand.patternIndex += state.isSync ? 1 : 2;
        }
      });

      // Update balls
      state.balls.forEach((ball) => {
        if (ball.inAir) {
          const timeInAir = time - ball.throwTime;
          if (timeInAir >= ball.flightDuration) {
            ball.inAir = false;
            const landingHand = state.hands.find((h) => h.baseX === ball.endX);
            if (landingHand) {
              ball.x = landingHand.x;
              ball.y = landingHand.y;
              landingHand.heldBalls.push(ball);
              landingHand.heldBalls.sort((a, b) => a.id - b.id);
            }
          } else {
            const progress = timeInAir / ball.flightDuration;
            ball.x = ball.startX + (ball.endX - ball.startX) * progress;
            ball.y = ball.startY - ball.throwHeight * 4 * progress * (1 - progress);
          }
        } else {
          const holdingHand = state.hands.find((h) => h.heldBalls.includes(ball));
          if (holdingHand) {
            ball.x = holdingHand.x;
            ball.y = holdingHand.y;
          }
        }
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const { balls, hands } = animationState.current;

      hands.forEach((hand) => {
        ctx.fillStyle = '#888';
        ctx.fillRect(hand.x - 25, hand.y - 10, 50, 20);
      });

      balls.forEach((ball) => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
      });
    };

    const animationLoop = (currentTime: number) => {
      const state = animationState.current;
      const deltaTime = state.lastTime > 0 ? currentTime - state.lastTime : 16.67;
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
  }, [siteswap, bpm, isRunning]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        color: '#e0e0e0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: '20px',
        minHeight: '100vh',
      }}
    >
      <h1>Siteswap Animator</h1>
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
      <div style={{ color: '#ff4d4d', marginTop: '10px', height: '20px', fontWeight: 'bold' }}>
        {error}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '15px',
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '600px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="siteswap-input">Siteswap:</label>
          <input
            id="siteswap-input"
            type="text"
            value={siteswap}
            onChange={(e) => setSiteswap(e.target.value)}
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
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              backgroundColor: '#007acc',
              border: 'none',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {isRunning ? 'Pause' : 'Play'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="bpm-input">BPM:</label>
          <input
            id="bpm-input"
            type="number"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            min="30"
            max="300"
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
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '10px',
          padding: '10px',
          width: '100%',
          maxWidth: '600px',
        }}
      >
        {[
          '3', '4', '5', '441', '531', '51', '71',
          '(4,4)', '(6x,4)', '[34]2'
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
    </div>
  );
}
