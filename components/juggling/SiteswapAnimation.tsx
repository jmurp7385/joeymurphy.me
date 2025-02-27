import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Define default values for animation parameters to ensure consistent initialization
const defaults = {
  dwellMin: 200, // Minimum dwell time in ms (realistic hand hold time)
  dwellMax: 500, // Maximum dwell time in ms (allows flexibility but keeps rhythm)
  speedLimit: 1500, // Maximum throw duration in ms, allows higher throws within SVG
  speedMultiplier: 1, // Default multiplier for throw speed (1 = normal speed)
  throwLimit: 0, // Default to infinite throws for continuous animation
};

// Interface for a ball object in the juggling simulation
interface Ball {
  id: number; // Unique identifier for the ball
  x: number; // Current X-position in SVG
  y: number; // Current Y-position in SVG
  inAir: boolean; // Whether the ball is currently in the air
  throwTime: number; // Relative time (ms) from animation start when the ball is scheduled to throw next
  fromLeft: boolean; // Indicates if the ball is currently in the left hand
  currentThrow: number; // Current siteswap value (e.g., 3, 4, etc.)
  throwIndex: number; // Current index in the siteswap pattern
  stagger: number; // Initial stagger offset (ms) from animation start
}

// Interface for an entry in the throw history
interface ThrowHistoryEntry {
  id: number; // Ball ID that threw
  throwTime: number; // Relative time (ms) from animation start when the throw occurred
  fromLeft: boolean; // Whether thrown from the left hand
  value: number; // Siteswap value of the throw (e.g., 3, 4, etc.)
}

/**
 * SiteswapAnimation Component
 * Renders an animated juggling pattern based on a siteswap sequence using D3.js.
 * Normalizes time calculations to avoid using absolute 'now' timestamps, includes type safety, logging, and history visualization.
 */
export default function SiteswapAnimation() {
  // Reference to the SVG element for D3 manipulation
  const svgRef = useRef<SVGSVGElement | null>(null);

  // State for the siteswap pattern (array of numbers), e.g., [4] for a 4-ball fountain
  const [siteswap, setSiteswap] = useState<number[]>([4]);

  // State to toggle animation pause/play
  const [paused, setPaused] = useState<boolean>(false);

  // State for minimum dwell time (ms) a ball stays in hand before throwing
  const [dwellMin, setDwellMin] = useState<number>(defaults.dwellMin);

  // State for maximum dwell time (ms) a ball stays in hand before throwing
  const [dwellMax, setDwellMax] = useState<number>(defaults.dwellMax);

  // State for pace multiplier, scaling overall animation speed (1 = normal, <1 slower, >1 faster)
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

  // State to track total elapsed time (ms) adjusted by paceMultiplier
  const [throwTime, setThrowTime] = useState<number>(0);

  // State to record throw history
  const [throwHistory, setThrowHistory] = useState<ThrowHistoryEntry[]>([]);

  // Reference to the D3 timer for animation updates
  const timerRef = useRef<d3.Timer | null>(null);

  // Reference to the animation start time for calculating throwTime
  const startTimeRef = useRef<number | null>(null);

  // SVG Dimensions (constant)
  const width = 600; // Width of the SVG canvas in pixels
  const height = 600; // Height of the SVG canvas in pixels

  // Siteswap pattern properties (depend on state)
  const patternLength = siteswap.length; // Number of digits in the siteswap pattern
  const numBalls = Math.round(
    siteswap.reduce((a, b) => a + b, 0) / patternLength,
  ); // Average determines number of balls
  const loopLength = siteswap.reduce((a, b) => a + b, 0); // Total beats in one cycle
  const beat = 3; // Reference beat value for normalizing throw durations (based on "3")
  const baseThrowDuration = speedLimit * speedMultiplier; // Base throw duration scaled by speed controls
  const beatDuration = baseThrowDuration / beat; // Duration of one beat in ms (e.g., 500ms with speedLimit=1500)
  const cycleDuration = loopLength * beatDuration; // Total duration of one loop cycle
  const maxHeight = height; // Maximum height balls can reach within SVG

  // Ball and hand properties (constant)
  const ballRadius = 15; // Radius of each ball in pixels
  const handY = height - 50; // Fixed Y-position of hands near the bottom of SVG
  const leftHandX = width / 4; // X-position of the left hand (center = 150px)
  const rightHandX = (3 * width) / 4; // X-position of the right hand (center = 450px)

  // Initialize balls array with staggered timing based on loop length and hand-specific cycles
  const balls: Ball[] = Array.from({ length: numBalls }, (_, i) => {
    const isLeft = i < Math.ceil(numBalls / 2); // More balls in left hand if odd numBalls
    const handBallCount = isLeft
      ? Math.ceil(numBalls / 2)
      : Math.floor(numBalls / 2);
    // Stagger each ball within its hand's cycle, offset right hand by half beat
    const stagger =
      (i % handBallCount) * (cycleDuration / handBallCount) +
      (isLeft ? 0 : beatDuration / 2);
    return {
      id: i,
      x: isLeft ? leftHandX : rightHandX,
      y: handY,
      inAir: false,
      throwTime: stagger, // Normalized as relative time from animation start
      stagger, // Store initial stagger for reference
      fromLeft: isLeft,
      currentThrow: siteswap[i % patternLength],
      throwIndex: i % patternLength,
    };
  });

  // useEffect hook to run animation logic when siteswap or control parameters change
  useEffect(() => {
    // Create and configure the SVG canvas using D3
    const svg = d3
      .select(svgRef.current)
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
        .attr('fill', (d: Ball) => `hsl(${d.id * (360 / numBalls)}, 70%, 50%)`) // Color based on ID
        .attr('cx', (d: Ball) => d.x) // Initial X-position
        .attr('cy', (d: Ball) => d.y); // Initial Y-position

      // Record the start time for throwTime calculation
      startTimeRef.current = Date.now();

      // Animation tick function, updates ball positions each frame
      const tick = (elapsed: number) => {
        const elapsedTime = elapsed / paceMultiplier; // Normalized elapsed time adjusted by pace
        if (!paused) {
          setThrowTime(Math.round(elapsedTime)); // Update throw time
        }

        // Only update positions if not paused and within throw limit
        if (!paused && (throwLimit === 0 || throwCount < throwLimit)) {
          balls.forEach((ball) => {
            // Calculate throw duration based on siteswap value and speed controls
            const baseDuration = (ball.currentThrow / beat) * baseThrowDuration;
            const adjustedDuration =
              Math.min(speedLimit, baseDuration / speedMultiplier) /
              paceMultiplier; // Apply speed limit, speed multiplier, and pace multiplier
            const peakY = handY - maxHeight * (ball.currentThrow / 9); // Peak height scaled to siteswap value
            const timeElapsed = elapsedTime - ball.throwTime; // Time since last throw (relative to start)
            const cycleProgress = Math.min(
              Math.max(timeElapsed / adjustedDuration, 0),
              1,
            ); // Progress of throw (0 to 1)
            const isEven = ball.currentThrow % 2 === 0; // Check if throw switches hands (odd) or stays (even)

            // Check if the ball has landed
            if (timeElapsed >= adjustedDuration && ball.inAir) {
              ball.inAir = false; // Mark ball as landed
              ball.fromLeft = isEven ? ball.fromLeft : !ball.fromLeft; // Switch hands for odd throws
              ball.throwIndex = (ball.throwIndex + 1) % patternLength; // Move to next siteswap value
              ball.currentThrow = siteswap[ball.throwIndex]; // Update current throw value
              const dwellTime = Math.min(
                Math.max(dwellMin, beatDuration / 2),
                dwellMax,
              ); // Clamp dwell to half beat
              ball.throwTime = elapsedTime + dwellTime; // Schedule next throw relative to elapsedTime
              ball.x = ball.fromLeft ? leftHandX : rightHandX; // Move to landing hand
              ball.y = handY; // Reset to hand height
              setThrowCount((prev) => prev + 1); // Increment throw count
              // Log landing event
              console.log(
                `Ball ${ball.id} landed at ${elapsedTime}ms, next throw at ${
                  ball.throwTime
                }ms, from ${ball.fromLeft ? 'left' : 'right'}`,
              );
              // Record throw history (on landing, recording the throw time)
              setThrowHistory((prev) => [
                ...prev,
                {
                  id: ball.id,
                  throwTime: ball.throwTime - dwellTime,
                  fromLeft: !ball.fromLeft,
                  value: ball.currentThrow,
                },
              ]);
            }

            // Check if the ball should be thrown (when its scheduled time is reached)
            if (
              !ball.inAir &&
              timeElapsed >= 0 &&
              timeElapsed <= adjustedDuration / 2
            ) {
              ball.inAir = true; // Mark ball as in air
              ball.throwTime = elapsedTime; // Update throw time to current elapsed time
              // Log throw event
              console.log(
                `Ball ${ball.id} thrown at ${elapsedTime}ms, from ${
                  ball.fromLeft ? 'left' : 'right'
                }, value: ${ball.currentThrow}`,
              );
            }

            // Update ball position if in air and not yet landed
            if (ball.inAir && cycleProgress < 1) {
              const startX = ball.fromLeft ? leftHandX : rightHandX; // Starting X-position
              const endX = isEven
                ? startX
                : ball.fromLeft
                ? rightHandX
                : leftHandX; // Ending X-position
              ball.x = startX + (endX - startX) * cycleProgress; // Linear interpolation for X
              ball.y =
                handY -
                (handY - peakY) * 4 * cycleProgress * (1 - cycleProgress); // Parabolic Y motion
            }
          });
        }

        // Update SVG ball positions regardless of pause state to reflect current positions
        ballSelection.attr('cx', (d: Ball) => d.x).attr('cy', (d: Ball) => d.y);
      };

      // Start or restart the animation timer
      if (timerRef.current) {
        timerRef.current.stop(); // Stop any existing timer
      }
      timerRef.current = d3.timer(tick); // Start new timer with elapsed time
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

    // Cleanup function to stop timer and clear SVG on unmount or update
    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
      }
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [
    siteswap, // Re-run effect when siteswap changes
    paused, // Re-run when pause state changes
    dwellMin, // Re-run when minimum dwell time changes
    dwellMax, // Re-run when maximum dwell time changes
    paceMultiplier, // Re-run when pace multiplier changes
    speedLimit, // Re-run when speed limit changes
    speedMultiplier, // Re-run when speed multiplier changes
    throwLimit, // Re-run when throw limit changes
  ]);

  // JSX for rendering the SVG, control UI, and throw history visualization
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      {/* SVG canvas for animation */}
      <svg ref={svgRef}></svg>
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
              const newSiteswap = value
                .split('')
                .map(Number)
                .filter((n: number) => !isNaN(n) && n > 0);
              if (newSiteswap.length > 0) {
                setSiteswap(newSiteswap); // Update siteswap pattern
                setThrowCount(0); // Reset throw count
                setThrowTime(0); // Reset throw time
                setThrowHistory([]); // Reset throw history
              }
            }}
          />
          <button
            onClick={() => {
              if (timerRef.current) {
                timerRef.current.stop(); // Stop timer on pause toggle
              }
              setPaused((prev) => !prev); // Toggle pause state
            }}
          >
            {paused ? 'Play' : 'Pause'}{' '}
            {/* Button text changes based on state */}
          </button>
        </div>
        {/* Preset pattern buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[[3], [4], [5], [6], [7], [3, 1], [5, 1], [7, 1], [4]].map(
            (pattern) => (
              <button
                style={{ width: 75 }}
                onClick={() => {
                  setSiteswap(pattern); // Set siteswap to preset pattern
                  setThrowCount(0); // Reset throw count
                  setThrowTime(0); // Reset throw time
                  setThrowHistory([]); // Reset throw history
                }}
                key={pattern.join('')}
              >
                {pattern.join('')} {/* Display pattern as button text */}
              </button>
            ),
          )}
        </div>
        {/* Animation control inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label>
            Dwell Min (ms):
            <input
              type='number'
              value={dwellMin}
              min='50'
              max={dwellMax}
              onChange={(e) => setDwellMin(parseInt(e.target.value))} // Update dwellMin
              onBlur={(e) =>
                setDwellMin(
                  Math.max(defaults.dwellMin, parseInt(e.target.value)),
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
              onChange={(e) =>
                setDwellMax(
                  Math.min(defaults.dwellMax, parseInt(e.target.value)),
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
              onChange={(e) => setPaceMultiplier(parseFloat(e.target.value))} // Update paceMultiplier
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
              onChange={(e) => setSpeedLimit(parseInt(e.target.value))} // Update speedLimit
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
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))} // Update speedMultiplier
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </label>
          <label>
            Throw Limit (0 = infinite):
            <input
              type='number'
              value={throwLimit}
              min='0'
              onChange={(e) => setThrowLimit(parseInt(e.target.value))} // Update throwLimit
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </label>
          {/* Display throw count and time */}
          <div>Throw Count: {throwCount}</div>
          <div>Throw Time: {throwTime} ms</div>
          {/* Throw History Visualization */}
          <div
            style={{ marginTop: '20px', maxHeight: '200px', overflowY: 'auto' }}
          >
            <h3>Throw History</h3>
            <table style={{ borderCollapse: 'collapse', width: '300px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '5px' }}>
                    Ball ID
                  </th>
                  <th style={{ border: '1px solid #ccc', padding: '5px' }}>
                    Time (ms)
                  </th>
                  <th style={{ border: '1px solid #ccc', padding: '5px' }}>
                    Hand
                  </th>
                  <th style={{ border: '1px solid #ccc', padding: '5px' }}>
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {throwHistory.slice(-10).map(
                  (
                    entry,
                    index, // Show last 10 throws
                  ) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                        {entry.id}
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                        {entry.throwTime}
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                        {entry.fromLeft ? 'Left' : 'Right'}
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                        {entry.value}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
