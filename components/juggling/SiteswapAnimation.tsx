import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const defaults = {
  dwellMin: 50,
  dwellMax: 5000,
  speedlimit: 1000,
  speedMultiplier: 0.1,
};

export default function SiteswapAnimation() {
  const svgRef = useRef(null);
  const [siteswap, setSiteswap] = useState([5, 1]);
  const [paused, setPaused] = useState(false);
  const [dwellMin, setDwellMin] = useState(1000); // Min dwell time (ms)
  const [dwellMax, setDwellMax] = useState(5000); // Max dwell time (ms)
  const [paceMultiplier, setPaceMultiplier] = useState(1); // Overall pace scaler
  const [speedLimit, setSpeedLimit] = useState(defaults.speedlimit); // Max throw duration (ms)
  const [speedMultiplier, setSpeedMultiplier] = useState(
    defaults.speedMultiplier,
  ); // Throw speed scaler
  const [throwLimit, setThrowLimit] = useState(0); // 0 = infinite, >0 = limit
  const [throwCount, setThrowCount] = useState(0); // Track total throws
  const [throwTime, setThrowTime] = useState(0); // Total elapsed time (ms)
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // SVG dimensions
    const width = 600;
    const height = 600;

    // Create SVG canvas
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f0f0f0');

    const patternLength = siteswap.length;
    const numBalls = Math.round(
      siteswap.reduce((a, b) => a + b, 0) / patternLength,
    );
    const beat = 3;
    const baseThrowDuration = 1500; // Base time for a "3" throw
    const beatDuration = baseThrowDuration / (beat + 1); // Time per beat
    const maxHeight = height; // Maximum height

    // Ball properties
    const ballRadius = 15;
    const handY = height - 50; // Y-position of hands
    const leftHandX = width / 4;
    const rightHandX = (3 * width) / 4;

    // Initialize balls with staggered timing
    const balls = Array.from({ length: numBalls }, (_, i) => {
      const isLeft = i % 2 === 0;
      const stagger = i * beatDuration;
      return {
        id: i,
        x: isLeft ? leftHandX : rightHandX,
        y: handY,
        inAir: false,
        throwTime: stagger,
        fromLeft: isLeft,
        currentThrow: siteswap[i % patternLength],
        throwIndex: i % patternLength,
      };
    });

    // Animation loop
    function animate() {
      svg.selectAll('.ball').remove();

      const ballSelection = svg
        .selectAll('.ball')
        .data(balls)
        .enter()
        .append('circle')
        .attr('class', 'ball')
        .attr('r', ballRadius)
        .attr('fill', (d) => `hsl(${d.id * (360 / numBalls)}, 70%, 50%)`)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);

      // Start time for throwTime tracking
      startTimeRef.current = Date.now();

      // Update ball positions
      const tick = () => {
        const now = Date.now();
        const elapsedTime = now - startTimeRef.current;
        setThrowTime(Math.round(elapsedTime / paceMultiplier)); // Update throw time

        if (!paused && (throwLimit === 0 || throwCount < throwLimit)) {
          balls.forEach((ball) => {
            console.log('ball', ball);
            const baseDuration = (ball.currentThrow / beat) * baseThrowDuration;
            const adjustedDuration =
              Math.min(speedLimit, baseDuration / speedMultiplier) /
              paceMultiplier; // Apply speed limit and multipliers
            const peakY = handY - maxHeight * (ball.currentThrow / 9);
            const timeElapsed = now - ball.throwTime;
            const cycleProgress = Math.min(
              Math.max(timeElapsed / adjustedDuration, 0),
              1,
            );
            const isEven = ball.currentThrow % 2 === 0;

            if (timeElapsed >= adjustedDuration && ball.inAir) {
              // Ball lands
              ball.inAir = false;
              ball.fromLeft = isEven ? ball.fromLeft : !ball.fromLeft;
              ball.throwIndex = (ball.throwIndex + 1) % patternLength;
              ball.currentThrow = siteswap[ball.throwIndex];
              const dwellTime = Math.min(
                Math.max(dwellMin, beatDuration),
                dwellMax,
              ); // Apply dwell limits
              ball.throwTime = now + dwellTime;
              ball.x = ball.fromLeft ? leftHandX : rightHandX;
              ball.y = handY;
              setThrowCount((prev) => prev + 1); // Increment throw count
            }

            if (!ball.inAir && timeElapsed >= 0) {
              // Throw the ball
              const dwellTime = Math.min(
                Math.max(dwellMin, beatDuration),
                dwellMax,
              );
              setTimeout(() => {}, dwellTime);
              ball.inAir = true;
              ball.throwTime = now;
            }

            if (ball.inAir && cycleProgress < 1) {
              // Ball in air
              const startX = ball.fromLeft ? leftHandX : rightHandX;
              const endX = isEven
                ? startX
                : ball.fromLeft
                ? rightHandX
                : leftHandX;
              ball.x = startX + (endX - startX) * cycleProgress;
              ball.y =
                handY -
                (handY - peakY) * 4 * cycleProgress * (1 - cycleProgress);
            }
          });
        }

        // Update SVG to reflect current positions
        ballSelection.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      };

      // Manage timer
      if (timerRef.current) {
        timerRef.current.stop();
      }
      timerRef.current = d3.timer(tick);
    }

    // Draw hands (static rectangles)
    svg
      .append('rect')
      .attr('x', leftHandX - 20)
      .attr('y', handY)
      .attr('width', 40)
      .attr('height', 20)
      .attr('fill', '#666');

    svg
      .append('rect')
      .attr('x', rightHandX - 20)
      .attr('y', handY)
      .attr('width', 40)
      .attr('height', 20)
      .attr('fill', '#666');

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
      }
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [
    siteswap,
    paused,
    dwellMin,
    dwellMax,
    paceMultiplier,
    speedLimit,
    speedMultiplier,
    throwLimit,
  ]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
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
                setSiteswap(newSiteswap);
                setThrowCount(0); // Reset throw count on pattern change
                setThrowTime(0); // Reset throw time
              }
            }}
          />
          <button
            onClick={() => {
              if (timerRef.current) {
                timerRef.current.stop();
              }
              setPaused((prev) => !prev);
            }}
          >
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[[3], [5], [7], [3, 1], [5, 1], [7, 1], [4]].map((siteswap) => (
            <button
              style={{ width: 75 }}
              onClick={() => {
                setSiteswap(siteswap);
                setThrowCount(0); // Reset throw count
                setThrowTime(0); // Reset throw time
              }}
              key={siteswap.join('')}
            >
              {siteswap.join('')}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label>
            Dwell Min (ms):
            <input
              type='number'
              value={dwellMin}
              min='50'
              max={dwellMax}
              onChange={(e) => setDwellMin(parseInt(e.target.value))}
              onBlur={(e) =>
                setDwellMin(
                  Math.max(defaults.dwellMin, parseInt(e.target.value)),
                )
              }
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
              }
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
              onChange={(e) => setPaceMultiplier(parseFloat(e.target.value))}
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
              onChange={(e) => setSpeedLimit(parseInt(e.target.value))}
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
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </label>
          <label>
            Throw Limit (0 = infinite):
            <input
              type='number'
              value={throwLimit}
              min='0'
              onChange={(e) => setThrowLimit(parseInt(e.target.value))}
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </label>
          <div>Throw Count: {throwCount}</div>
          <div>Throw Time: {throwTime} ms</div>
        </div>
      </div>
    </div>
  );
}
