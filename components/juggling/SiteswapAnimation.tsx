import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ThrowHistory } from './ThrowHistory';
import { classifySiteswap } from './helpers';

// Define default values for animation parameters to ensure consistent initialization
const defaults = {
  siteswap: [5, 1], // Default siteswap pattern
  dwellMin: 200, // Minimum dwell time in ms (realistic hand hold time)
  dwellMax: 500, // Maximum dwell time in ms (allows flexibility but keeps rhythm)
  speedLimit: 1000, // Maximum throw duration in ms, allows higher throws within SVG
  speedMultiplier: 1, // Default multiplier for throw speed (1 = normal speed)
  throwLimit: 0, // Limit to 20 throws for finite animation
};

// Interface for a ball object in the juggling simulation
export interface Ball {
  id: number; // Unique identifier for the ball
  x: number; // Current X-position in SVG
  y: number; // Current Y-position in SVG
  inAir: boolean; // Whether the ball is currently in the air
  lastThrowTime: number; // Simulated time (ms) when the ball was last thrown
  throwTime: number; // Simulated time (ms) when the ball is scheduled to throw next
  fromLeft: boolean; // Indicates if the ball is currently in the left hand
  currentThrow: number; // Current siteswap value (e.g., 3, 4, etc.)
  throwIndex: number; // Current index in the siteswap pattern
  stagger: number; // Initial stagger offset (ms) from simulation start
}

/**
 * SiteswapAnimation Component
 * Renders an animated juggling pattern using simulated time, ensuring one throw per cycle,
 * smooth ticking, type safety, logging, and history visualization.
 */
export default function SiteswapAnimation() {
  // Reference to the SVG element for D3 manipulation
  const svgReference = useRef<SVGSVGElement | null>(null);

  // State for the siteswap pattern (array of numbers), e.g., [3] for a 3-ball cascade
  const [siteswap, setSiteswap] = useState<number[]>(defaults.siteswap);

  // State to toggle animation pause/play
  const [paused, setPaused] = useState<boolean>(false);

  // State for minimum dwell time (ms) a ball stays in hand before throwing
  const [dwellMin, setDwellMin] = useState<number>(defaults.dwellMin);

  // State for maximum dwell time (ms) a ball stays in hand before throwing
  const [dwellMax, setDwellMax] = useState<number>(defaults.dwellMax);

  // State for pace multiplier, scaling simulation speed (1 = normal, <1 slower, >1 faster)
  const [paceMultiplier, setPaceMultiplier] = useState<number>(1);

  // State for speed limit (ms), capping maximum throw duration
  const [speedLimit, setSpeedLimit] = useState<number>(defaults.speedLimit);

  // State for speed multiplier, scaling throw speed independently (1 = normal, <1 slower, >1 faster)
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(
    defaults.speedMultiplier,
  );

  // State for throw limit (0 = infinite, >0 = stop after X throws)
  const [throwLimit, setThrowLimit] = useState<number>(defaults.throwLimit);

  // State to track the total number of throws performed
  const [throwCount, setThrowCount] = useState<number>(0);

  // State to track total simulated time (ms)
  const [simulatedTime, setSimulatedTime] = useState<number>(0);

  // State to record throw history
  const [throwHistory, setThrowHistory] = useState<Ball[]>([]);

  // Reference to the D3 timer for animation updates
  const timerReference = useRef<d3.Timer | null>(null);
  // Reference to the animation start time for calculating throwTime
  const startTimeReference = useRef<number>(0);

  // SVG Dimensions (constant)
  const width = 600; // Width of the SVG canvas in pixels
  const height = 600; // Height of the SVG canvas in pixels

  // Siteswap pattern properties (depend on state)
  const patternLength = siteswap.length; // Number of digits in the siteswap pattern
  const { numberBalls, type } = classifySiteswap(siteswap.join('')); // Average determines number of balls
  const isShower = type === 'shower';
  const loopLength = siteswap.reduce((a, b) => a + b, 0); // Total beats in one cycle
  const beat = numberBalls; // Reference beat value for normalizing throw durations (based on "3")
  const baseThrowDuration = speedLimit * speedMultiplier; // Base throw duration scaled by speed controls
  const beatDuration = baseThrowDuration / beat; // Duration of one beat in ms (e.g., 333ms with speedLimit=1000)
  const cycleDuration = loopLength * beatDuration; // Total duration of one loop cycle
  const maxHeight = height; // Maximum height balls can reach within SVG

  // Ball and hand properties (constant)
  const ballRadius = 15; // Radius of each ball in pixels
  const handY = height - 50; // Fixed Y-position of hands near the bottom of SVG
  const leftHandX = width / 4; // X-position of the left hand (center = 150px)
  const rightHandX = (3 * width) / 4; // X-position of the right hand (center = 450px)

  // Simulation time step (ms per frame, ~60fps)
  const timeStep = 16;

  // Initialize balls array with staggered timing based on loop length and hand-specific cycles

  const [balls, setBallArray] = useState<Ball[]>(
    Array.from({ length: numberBalls }, (_, index) => {
      const isLeft = index < Math.ceil(numberBalls / 2); // More balls in left hand if odd numBalls
      const handBallCount = isLeft
        ? Math.ceil(numberBalls / 2)
        : Math.floor(numberBalls / 2);
      // Stagger each ball within its hand's cycle, offset right hand by half beat
      const stagger =
        (index % handBallCount) * (cycleDuration / handBallCount) +
        (isLeft ? 0 : beatDuration / 2);
      return {
        id: index,
        x: isLeft ? leftHandX : rightHandX,
        y: handY,
        inAir: false,
        lastThrowTime: 0,
        throwTime: stagger, // Simulated time from start
        stagger, // Store initial stagger for reference
        fromLeft: isLeft,
        currentThrow: siteswap[index % patternLength],
        throwIndex: index % patternLength,
      };
    }),
  );

  useEffect(() => {
    setBallArray(
      Array.from({ length: numberBalls }, (_, index) => {
        const isLeft = index < Math.ceil(numberBalls / 2); // More balls in left hand if odd numBalls
        const handBallCount = isLeft
          ? Math.ceil(numberBalls / 2)
          : Math.floor(numberBalls / 2);
        // Stagger each ball within its hand's cycle, offset right hand by half beat
        const stagger =
          (index % handBallCount) * (cycleDuration / handBallCount) +
          (isLeft ? 0 : beatDuration / 2);
        return {
          id: index,
          x: isLeft ? leftHandX : rightHandX,
          y: handY,
          inAir: false,
          lastThrowTime: 0,
          throwTime: stagger, // Simulated time from start
          stagger, // Store initial stagger for reference
          fromLeft: isLeft,
          currentThrow: siteswap[index % patternLength],
          throwIndex: isShower ? (isLeft ? 0 : 1) : index % patternLength,
        };
      }),
    );
  }, [numberBalls, beatDuration, cycleDuration, handY, leftHandX, patternLength, rightHandX, siteswap, isShower]);

  // useEffect hook to run animation logic when siteswap or control parameters change
  useEffect(() => {
    // Create and configure the SVG canvas using D3
    const svg = d3
      .select(svgReference.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f0f0f0'); // Light gray background for visibility

    // Animation function to set up and run the juggling simulation
    function animate() {
      svg.selectAll('.ball').remove(); // Clear previous balls from SVG

      // Create ball elements in the SVG with initial positions
      const ballSelection = svg
        .selectAll('.ball')
        .data(balls)
        .enter()
        .append('circle')
        .attr('class', 'ball')
        .attr('r', ballRadius)
        .attr(
          'fill',
          (d: Ball) => `hsl(${d.id * (360 / numberBalls)}, 70%, 50%)`,
        ) // Color based on ID
        .attr('cx', (d: Ball) => d.x) // Initial X-position
        .attr('cy', (d: Ball) => d.y); // Initial Y-position

      // Animation tick function, updates ball positions each frame
      const tick = () => {
        const time = simulatedTime;
        // const time = startTimeRef.current;
        const elapseTime = timeStep / paceMultiplier;
        if (!paused) {
          // Record the start time for throwTime calculation
          startTimeReference.current =
            (startTimeReference.current ?? 0) + elapseTime;
          setSimulatedTime((previous) => previous + elapseTime); // Increment simulated time
        }

        // Only update positions if not paused and within throw limit
        if (!paused && (throwLimit === 0 || throwCount < throwLimit)) {
          setBallArray((previous) =>
            previous.map((ball) => {
              // Calculate throw duration based on siteswap value and speed controls
              const baseDuration =
                (ball.currentThrow / beat) * baseThrowDuration;
              const adjustedDuration =
                Math.min(speedLimit, baseDuration / speedMultiplier) /
                paceMultiplier; // Apply speed limit, speed multiplier, and pace multiplier
              const peakY = handY - maxHeight * (ball.currentThrow / 9); // Peak height scaled to siteswap value
              const isEven = ball.currentThrow % 2 === 0; // Check if throw switches hands (odd) or stays (even)

              // Check if the ball should be thrown
              if (!ball.inAir && time >= ball.throwTime) {
                ball.inAir = true; // Mark ball as in air
                ball.lastThrowTime = time; // Record the time of this throw

                // Record throw history
                setThrowHistory((previous) => [
                  {
                    ...ball,
                    throwTime: Math.floor(time),
                  },
                  ...previous,
                ]);

                // Log throw event
                console.log(
                  `Ball ${ball.id} thrown at ${time.toFixed(
                    0,
                  )}ms, from ${
                    ball.fromLeft ? 'left' : 'right'
                  }, value: ${ball.currentThrow}`,
                );
              }

              const timeSinceThrow = time - ball.lastThrowTime;
              const flightProgress = Math.min(
                Math.max(timeSinceThrow / adjustedDuration, 0),
                1,
              );

              // Check if the ball should land
              if (ball.inAir && timeSinceThrow >= adjustedDuration) {
                ball.inAir = false; // Mark ball as landed
                ball.fromLeft = isEven ? ball.fromLeft : !ball.fromLeft; // Switch hands for odd throws
                ball.throwIndex = isShower
                  ? ball.fromLeft
                    ? 0
                    : 1
                  : (ball.throwIndex + numberBalls) % patternLength; // Move to next siteswap value for this hand
                ball.currentThrow = siteswap[ball.throwIndex]; // Update current throw value
                const dwellTime = Math.min(
                  Math.max(dwellMin, beatDuration),
                  dwellMax,
                ); // Clamp dwell to beat duration
                ball.throwTime = time + dwellTime; // Schedule next throw
                ball.x = ball.fromLeft ? leftHandX : rightHandX; // Move to landing hand
                ball.y = handY; // Reset to hand height
                setThrowCount((previous) => previous + 1); // Increment throw count
              }

              // Update ball position if in air and not yet landed
              if (ball.inAir) {
                const startX = ball.fromLeft ? leftHandX : rightHandX; // Starting X-position
                const oppositeHandX = ball.fromLeft ? rightHandX : leftHandX;
                const endX = isEven ? startX : oppositeHandX; // Ending X-position
                ball.x = startX + (endX - startX) * flightProgress; // Linear interpolation for X
                ball.y =
                  handY -
                  (handY - peakY) * 4 * flightProgress * (1 - flightProgress); // Parabolic Y motion
              }
              return ball;
            }),
          );
        }

        // Update SVG ball positions regardless of pause state to reflect current positions
        ballSelection.attr('cx', (d: Ball) => d.x).attr('cy', (d: Ball) => d.y);
      };
      // Start or restart the animation timer
      if (timerReference.current) {
        timerReference.current.stop(); // Stop any existing timer
      }
      timerReference.current = d3.timer(tick); // Start new timer with elapsed time
    }

    // Draw static hand rectangles
    svg
      .append('rect')
      .attr('x', leftHandX - 20) // Left hand position
      .attr('y', handY)
      .attr('width', 40)
      .attr('height', 20)
      .attr('fill', '#666'); // Gray color

    svg
      .append('rect')
      .attr('x', rightHandX - 20) // Right hand position
      .attr('y', handY)
      .attr('width', 40)
      .attr('height', 20)
      .attr('fill', '#666');

    // Start the animation
    animate();
    const currentTimerReference = timerReference.current;
    const currentSvgReference = svgReference.current;
    // Cleanup function to stop timer and clear SVG on unmount or update
    return () => {
      if (currentTimerReference) {
        currentTimerReference?.stop();
      }
      d3.select(currentSvgReference).selectAll('*').remove();
    };
  }, [balls, baseThrowDuration, beat, beatDuration, cycleDuration, dwellMax, dwellMin, handY, isShower, leftHandX, maxHeight, numberBalls, paceMultiplier, patternLength, paused, rightHandX, simulatedTime, siteswap, speedLimit, speedMultiplier, throwCount, throwLimit]);

  // JSX for rendering the SVG, control UI, and throw history visualization
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* SVG canvas for animation */}
      <svg ref={svgReference}></svg>
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Input and Pause/Play controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            style={{ textAlign: 'center', width: '100px' }}
            type='text'
            value={siteswap.join('')}
            onChange={(event) => {
              const { value } = event.target;
              const newSiteswap = [...value]
                .map(Number)
                .filter((n: number) => !Number.isNaN(n) && n > 0);
              if (newSiteswap.length > 0) {
                setSiteswap(newSiteswap); // Update siteswap pattern
                setThrowCount(0); // Reset throw count
                setSimulatedTime(0); // Reset simulated time
                setThrowHistory([]); // Reset throw history
              }
            }}
          />
          <button
            onClick={() => {
              if (timerReference.current) {
                timerReference.current.stop(); // Stop timer on pause toggle
              }
              setPaused((previous) => !previous); // Toggle pause state
            }}
          >
            {paused ? 'Play' : 'Pause'}{' '}
            {/* Button text changes based on state */}
          </button>
        </div>
        {/* Preset pattern buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            [3],
            [4],
            [5],
            [6],
            [7],
            [3, 1],
            [5, 1],
            [7, 1],
            [5, 3, 1],
            [7, 5, 3, 1],
          ].map((pattern) => (
            <button
              style={{ width: 50 }}
              onClick={() => {
                setSiteswap(pattern); // Set siteswap to preset pattern
                setThrowCount(0); // Reset throw count
                setSimulatedTime(0); // Reset simulated time
                setThrowHistory([]); // Reset throw history
              }}
              key={pattern.join('')}
            >
              {pattern.join('')} {/* Display pattern as button text */}
            </button>
          ))}
        </div>
        {/* Animation control inputs */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'end',
            gap: 8,
            height: 100,
          }}
        >
          <label>
            Dwell Min (ms):
            <input
              type='number'
              value={dwellMin}
              min='50'
              max={dwellMax}
              onChange={(event) =>
                setDwellMin(Number.parseInt(event.target.value))
              } // Update dwellMin
              onBlur={(event) =>
                setDwellMin(
                  Math.max(
                    defaults.dwellMin,
                    Number.parseInt(event.target.value),
                  ),
                )
              } // Enforce minimum
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </label>
          <label>
            Dwell Max (ms):
            <input
              type='number'
              value={dwellMax}
              min={dwellMin}
              max='1000'
              onChange={(event) =>
                setDwellMax(
                  Math.min(
                    defaults.dwellMax,
                    Number.parseInt(event.target.value),
                  ),
                )
              } // Update dwellMax with cap
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </label>
          <label>
            Pace Multiplier:
            <input
              type='number'
              step='0.1'
              value={paceMultiplier}
              min='0.1'
              max='5'
              onChange={(event) =>
                setPaceMultiplier(Number.parseFloat(event.target.value))
              } // Update paceMultiplier
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </label>
          <label>
            Speed Limit (ms):
            <input
              type='number'
              value={speedLimit}
              min='500'
              max='5000'
              onChange={(event) =>
                setSpeedLimit(Number.parseInt(event.target.value))
              } // Update speedLimit
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </label>
          <label>
            Speed Multiplier:
            <input
              type='number'
              step='0.1'
              value={speedMultiplier}
              min='0.1'
              max='5'
              onChange={(event) =>
                setSpeedMultiplier(Number.parseFloat(event.target.value))
              } // Update speedMultiplier
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </label>
          <label>
            Throw Limit (0 = infinite):
            <input
              type='number'
              value={throwLimit}
              min='0'
              onChange={(event) =>
                setThrowLimit(Number.parseInt(event.target.value))
              } // Update throwLimit
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </label>
          {/* Display throw count and time */}
          <div>Throw Count: {throwCount}</div>
          <div>Throw Time: {simulatedTime} ms</div>
          <div>Throw Speed: {baseThrowDuration}</div>
        </div>
        <ThrowHistory history={throwHistory} limit={numberBalls * 3} />
      </div>
    </div>
  );
}
