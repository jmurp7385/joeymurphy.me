import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function SiteswapAnimation() {
  const svgRef = useRef(null);
  const [siteswap, setSiteswap] = useState([3]);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<d3.Timer | null>(null);

  useEffect(() => {
    // SVG dimensions
    const width = 600;
    const height = 500;

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
    const beatDuration = baseThrowDuration / (beat + 1); // Time per beat, normalized to "3"
    const maxHeight = height; // Maximum height (no doubling)

    // Ball properties
    const ballRadius = 15;
    const handY = height - 50; // Y-position of hands
    const leftHandX = width / 4;
    const rightHandX = (3 * width) / 4;

    // Initialize balls with staggered timing
    const balls = Array.from({ length: numBalls }, (_, i) => {
      const isLeft = i % 2 === 0; // Alternate hands for initial placement
      const stagger = i * beatDuration; // Sequential stagger: 0, 375ms, 750ms, 1125ms for "4"
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
    console.log('balls', balls);

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

      // Update ball positions
      const tick = () => {
        const now = Date.now();

        if (!paused) {
          balls.forEach((ball) => {
            const throwDuration =
              (ball.currentThrow / beat) * baseThrowDuration;
            const peakY = handY - maxHeight * (ball.currentThrow / 9);
            const timeElapsed = now - ball.throwTime;
            const cycleProgress = Math.min(
              Math.max(timeElapsed / throwDuration, 0),
              1,
            );
            const isEven = ball.currentThrow % 2 === 0;

            if (timeElapsed >= throwDuration && ball.inAir) {
              // Ball lands
              ball.inAir = false;
              ball.fromLeft = isEven ? ball.fromLeft : !ball.fromLeft; // Switch hands for odd throws
              ball.throwIndex = (ball.throwIndex + 1) % patternLength;
              ball.currentThrow = siteswap[ball.throwIndex];
              ball.throwTime = now + beatDuration; // Next throw after 1 beat
              ball.x = ball.fromLeft ? leftHandX : rightHandX;
              ball.y = handY;
            }

            if (!ball.inAir && timeElapsed >= 0) {
              // Throw the ball
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
  }, [siteswap, paused]);

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
        <div>
          <input
            style={{ textAlign: 'center', marginRight: '10px' }}
            type='text'
            value={siteswap.join('')}
            onChange={(event) => {
              const { value } = event.target;
              const newSiteswap = value.split('').map(Number);
              setSiteswap(newSiteswap);
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
        <div
          style={{
            display: 'flex',
            gap: '4px',
          }}
        >
          {[
            [3],
            [5],
            [7],
            [3, 1],
            [5, 1],
            [7, 1],
            [5, 3, 1],
            [7, 5, 3, 1],
            [4, 4, 1],
          ].map((siteswap) => {
            return (
              <button
                style={{ width: 75 }}
                onClick={() => setSiteswap(siteswap)}
              >
                {siteswap.join('')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
