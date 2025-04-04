import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { machine } from 'os';

export default function SiteswapAnimation() {
  const svgRef = useRef(null);
  const [siteswap, setSiteswap] = useState([3]);

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

    // Siteswap pattern (choose one or make it dynamic)
    // const siteswap = [5, 3, 1, 7]; // "5317" pattern
    // const siteswap = [7]; // "7" pattern (7-ball cascade)
    // const siteswap = [3]; // "3" pattern (cascade)
    const patternLength = siteswap.length;
    const numBalls = Math.round(
      siteswap.reduce((a, b) => a + b, 0) / patternLength,
    ); // Average for number of balls
    const baseThrowDuration = 3000; // Base time for a "3" throw in milliseconds
    const beatDuration = baseThrowDuration / numBalls; // Time per beat, normalized to "3"
    const maxHeight = height * 2; // Maximum height (top of SVG minus padding)

    // Ball properties
    const ballRadius = 15;
    const handY = height - 50; // Y-position of hands
    const leftHandX = width / 4;
    const rightHandX = (3 * width) / 4;

    // Initialize balls with staggered timing
    const balls = Array.from({ length: numBalls }, (_, i) => {
      const isLeft = i % 2 === 0; // Alternate hands for initial position
      const totalBeats = siteswap.reduce((a, b) => a + b, 0); // Total beats in one cycle
      const stagger = (totalBeats / numBalls) * i * beatDuration; // Evenly space balls across cycle
      return {
        id: i,
        x: isLeft ? leftHandX : rightHandX,
        y: handY,
        inAir: false,
        throwTime: stagger, // Staggered start
        fromLeft: isLeft,
        currentThrow: siteswap[i % patternLength], // Initial throw height
        throwIndex: i % patternLength, // Track position in siteswap cycle
      };
    });

    // Animation loop
    function animate() {
      svg.selectAll('.ball').remove(); // Clear previous balls

      svg
        .selectAll('.ball')
        .data(balls)
        .enter()
        .append('circle')
        .attr('class', 'ball')
        .attr('r', ballRadius)
        .attr('fill', (d) => `hsl(${d.id * (360 / numBalls)}, 70%, 50%)`);

      // Update ball positions
      const tick = () => {
        const now = Date.now();
        balls.forEach((ball) => {
          const throwDuration = (ball.currentThrow / 3) * baseThrowDuration; // Scale duration by throw height
          const peakY = handY - maxHeight * (ball.currentThrow / 9); // Scale height up to "7"
          const timeElapsed = now - ball.throwTime;
          const cycleProgress = Math.min(timeElapsed / throwDuration, 1); // Cap at 1 for landing
          const isEven = ball.currentThrow % 2 === 0;
          console.log(ball.id, ball.currentThrow, isEven);
          if (timeElapsed >= throwDuration) {
            // Ball has landed, schedule next throw
            if (ball.inAir) {
              ball.inAir = false;
              ball.throwTime = now - (timeElapsed % throwDuration); // Align to beat for continuity
              ball.fromLeft = isEven ? ball.fromLeft : !ball.fromLeft; // Even = same hand, odd = switch
              ball.throwIndex = (ball.throwIndex + 1) % patternLength; // Move to next in pattern
              ball.currentThrow = siteswap[ball.throwIndex]; // Update throw height
            }
          }

          if (cycleProgress < 0.5 && timeElapsed >= 0 && ball.inAir) {
            // Ball is going up
            ball.x = ball.fromLeft
              ? leftHandX + (rightHandX - leftHandX) * (cycleProgress * 2)
              : rightHandX - (rightHandX - leftHandX) * (cycleProgress * 2);
            ball.y =
              handY -
              (handY - peakY) * 4 * (cycleProgress * (0.5 - cycleProgress)); // Parabolic arc
          } else if (cycleProgress < 1 && ball.inAir) {
            // Ball is coming down
            ball.x = ball.fromLeft
              ? rightHandX -
                (rightHandX - leftHandX) * ((cycleProgress - 0.5) * 2)
              : leftHandX +
                (rightHandX - leftHandX) * ((cycleProgress - 0.5) * 2);
            ball.y =
              handY -
              (handY - peakY) *
                4 *
                ((1 - cycleProgress) * (cycleProgress - 0.5));
          } else {
            // Ball is caught or waiting
            ball.inAir = false;
            if (!isEven) {
              ball.x = ball.fromLeft ? leftHandX : rightHandX;
            }
            ball.y = handY;
            if (timeElapsed >= throwDuration || timeElapsed < 0) {
              ball.inAir = true; // Start next throw
            }
          }
        });

        // Update SVG
        svg
          .selectAll('.ball')
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => d.y);
      };

      // Run animation
      d3.timer(tick);
    }

    // Draw hands (simple rectangles)
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

    // Cleanup on unmount
    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [siteswap]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <svg ref={svgRef}></svg>
      <input
        style={{ textAlign: 'center' }}
        type='text'
        value={siteswap.join('')}
        onChange={(event) => {
          const { value } = event.target;
          setSiteswap(value.split('').map(Number));
        }}
      />
    </div>
  );
}

function siteSwapNumBalls(siteswap: number[]): number {
  return siteswap.reduce((prev, sum) => prev + sum, 0) / siteswap.length;
}
