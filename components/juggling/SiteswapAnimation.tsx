// Import React hooks for managing component lifecycle and state, and D3.js for SVG manipulation
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Define default values for animation parameters to ensure consistent initialization
const defaults = {
  dwellMin: 50, // Minimum dwell time in milliseconds (ms) a ball stays in hand
  dwellMax: 5000, // Maximum dwell time in ms a ball stays in hand
  speedLimit: 1000, // Default maximum throw duration in ms
  speedMultiplier: 1, // Default multiplier for throw speed (1 = normal speed)
  throwLimit: 10, // Default throw limit
};

/**
 * SiteswapAnimation Component
 * Renders an animated juggling pattern based on a siteswap sequence using D3.js.
 * Supports dynamic control of dwell time, pace, speed, throw limits, and displays throw count/time.
 */
export default function SiteswapAnimation() {
  // Reference to the SVG element for D3 manipulation
  const svgRef = useRef(null);

  // State for the siteswap pattern (array of numbers), e.g., [3] for a 3-ball cascade
  const [siteswap, setSiteswap] = useState([4]);

  // State to toggle animation pause/play
  const [paused, setPaused] = useState(false);

  // State for minimum dwell time (ms) a ball stays in hand before throwing
  const [dwellMin, setDwellMin] = useState(1000);

  // State for maximum dwell time (ms) a ball stays in hand before throwing
  const [dwellMax, setDwellMax] = useState(5000);

  // State for pace multiplier, scaling overall animation speed (1 = normal, <1 slower, >1 faster)
  const [paceMultiplier, setPaceMultiplier] = useState(1);

  // State for speed limit (ms), capping maximum throw duration
  const [speedLimit, setSpeedLimit] = useState(defaults.speedLimit);

  // State for speed multiplier, scaling throw speed independently (1 = normal, <1 slower, >1 faster)
  const [speedMultiplier, setSpeedMultiplier] = useState(
    defaults.speedMultiplier,
  );

  // State for throw limit (0 = infinite, >0 = stop after X throws)
  const [throwLimit, setThrowLimit] = useState(defaults.throwLimit);

  // State to track the total number of throws performed
  const [throwCount, setThrowCount] = useState(0);

  // State to track total elapsed time (ms) adjusted by paceMultiplier
  const [throwTime, setThrowTime] = useState(0);

  // Reference to the D3 timer for animation updates
  const timerRef = useRef(null);

  // Reference to the animation start time for calculating throwTime
  const startTimeRef = useRef(null);

  // SVG Dimensions
  const width = 600; // Width of the SVG canvas in pixels
  const height = 600; // Height of the SVG canvas in pixels
  // Siteswap pattern properties
  const patternLength = siteswap.length; // Number of digits in the siteswap pattern
  const numBalls = Math.round(
    siteswap.reduce((a, b) => a + b, 0) / patternLength,
  ); // Average determines number of balls
  const beat = 3; // Reference beat value for normalizing throw durations (based on "3")
  const baseThrowDuration = speedLimit * speedMultiplier; // Base throw duration scaled by speed controls
  const beatDuration = baseThrowDuration / beat; // Duration of one beat in ms
  const maxHeight = height; // Maximum height balls can reach within SVG

  // Ball and hand properties
  const ballRadius = 15; // Radius of each ball in pixels
  const handY = height - 50; // Fixed Y-position of hands near the bottom of SVG
  const leftHandX = width / 4; // X-position of the left hand (center = 150px)
  const rightHandX = (3 * width) / 4; // X-position of the right hand (center = 450px)

  // Initialize balls array with staggered timing for animation start
  const balls = Array.from({ length: numBalls }, (_, i) => {
    const isLeft = i % 2 === 0; // Alternate hands: even indices to left, odd to right
    const stagger = i * beatDuration; // Base stagger for sequential throwing
    return {
      id: i, // Unique identifier for the ball
      x: isLeft ? leftHandX : rightHandX, // Initial X-position (hand-dependent)
      y: handY, // Initial Y-position (at hand)
      inAir: false, // Ball starts on the ground (not in air)
      throwTime: stagger, // Staggered start time
      fromLeft: isLeft, // Indicates which hand the ball starts in
      currentThrow: siteswap[i % patternLength], // Current siteswap value for this ball
      throwIndex: i % patternLength, // Current index in the siteswap pattern
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
        .attr('fill', (d) => `hsl(${d.id * (360 / numBalls)}, 70%, 50%)`) // Color based on ID
        .attr('cx', (d) => d.x) // Initial X-position
        .attr('cy', (d) => d.y); // Initial Y-position

      // Record the start time for throwTime calculation
      startTimeRef.current = Date.now();

      // Animation tick function, updates ball positions each frame
      const tick = () => {
        const now = Date.now(); // Current timestamp
        const elapsedTime = now - startTimeRef.current; // Time since animation start
        if (!paused) {
          setThrowTime(Math.round(elapsedTime / paceMultiplier)); // Update throw time adjusted by pace
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
            const timeElapsed = now - ball.throwTime; // Time since last throw
            const cycleProgress = Math.min(
              Math.max(timeElapsed / adjustedDuration, 0),
              1,
            ); // Progress of throw (0 to 1)
            const isEven = ball.currentThrow % 2 === 0; // Check if throw switches hands (odd) or stays (even)

            // Check if the ball has landed
            if (timeElapsed >= adjustedDuration && ball.inAir) {
              ball.inAir = false; // Mark ball as landed
              ball.fromLeft = isEven ? ball.fromLeft : !ball.fromLeft; // Switch hands for odd throws
              console.log(ball.throwIndex, (ball.throwIndex + 1) % numBalls);
              ball.throwIndex = (ball.throwIndex + 1) % patternLength; // Move to next siteswap value
              ball.currentThrow = siteswap[ball.throwIndex]; // Update current throw value
              const dwellTime = Math.min(
                Math.max(dwellMin, beatDuration),
                dwellMax,
              ); // Clamp dwell time
              ball.throwTime = now + dwellTime; // Schedule next throw with dwell
              ball.x = ball.fromLeft ? leftHandX : rightHandX; // Move to landing hand
              ball.y = handY; // Reset to hand height
              setThrowCount((prev) => prev + 1); // Increment throw count
            }

            // Check if the ball should be thrown
            if (!ball.inAir && timeElapsed >= 0) {
              ball.inAir = true; // Mark ball as in air
              ball.throwTime = now; // Throw now
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
          console.log(balls);
        }

        // Update SVG ball positions regardless of pause state to reflect current positions
        ballSelection.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      };

      // Start or restart the animation timer
      if (timerRef.current) {
        timerRef.current.stop(); // Stop any existing timer
      }
      timerRef.current = d3.timer(tick); // Start new timer
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

  // JSX for rendering the SVG and control UI
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
                .filter((n) => !isNaN(n) && n > 0);
              if (newSiteswap.length > 0) {
                setSiteswap(newSiteswap); // Update siteswap pattern
                setThrowCount(0); // Reset throw count
                setThrowTime(0); // Reset throw time
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
            {paused ? 'Play' : 'Pause'}
            {/* Button text changes based on state */}
          </button>
        </div>
        {/* Preset pattern buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[[3], [4], [5], [6], [7], [3, 1], [5, 1], [7, 1], [4]].map(
            (siteswap) => (
              <button
                style={{ width: 75 }}
                onClick={() => {
                  setSiteswap(siteswap); // Set siteswap to preset pattern
                  setThrowCount(0); // Reset throw count
                  setThrowTime(0); // Reset throw time
                }}
                key={siteswap.join('')}
              >
                {siteswap.join('')} {/* Display pattern as button text */}
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
        </div>
      </div>
    </div>
  );
}
