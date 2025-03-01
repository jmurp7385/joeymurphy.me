import { ThrowHistory } from './ThrowHistory';
import { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';

// Define default values for animation parameters
const defaults = {
  siteswap: [3],
  dwellMin: 200,
  dwellMax: 500,
  speedLimit: 1000,
  speedMultiplier: 1,
  throwLimit: 0,
};

// Interface for a ball object
export interface Ball {
  id: number;
  x: number;
  y: number;
  inAir: boolean;
  throwTime: number;
  landingTime: number; // Added to track when the ball lands
  fromLeft: boolean;
  currentThrow: number;
  throwIndex: number;
  stagger: number;
}

export default function SiteswapAnimation() {
  const svgReference = useRef<SVGSVGElement | null>(null);
  const lastProcessedBeatRef = useRef(-1); // Persist across renders
  const [siteswap, setSiteswap] = useState<number[]>(defaults.siteswap);
  const [paused, setPaused] = useState<boolean>(false);
  const [dwellMin] = useState<number>(defaults.dwellMin);
  const [dwellMax] = useState<number>(defaults.dwellMax);
  const [paceMultiplier, setPaceMultiplier] = useState<number>(1);
  const [speedLimit, setSpeedLimit] = useState<number>(defaults.speedLimit);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(
    defaults.speedMultiplier,
  );
  const [throwLimit, setThrowLimit] = useState<number>(defaults.throwLimit);
  const [throwCount, setThrowCount] = useState<number>(0);
  const [simulatedTime, setSimulatedTime] = useState<number>(0);
  const [throwHistory, setThrowHistory] = useState<Ball[]>([]);
  const timerReference = useRef<d3.Timer | null>(null);
  const startTimeReference = useRef<number>(0);

  const width = 600;
  const height = 600;
  const patternLength = siteswap.length;
  const numberBalls = Math.round(
    siteswap.reduce((a, b) => a + b, 0) / patternLength,
  );
  const baseThrowDuration = speedLimit * speedMultiplier;
  const beatDuration = baseThrowDuration / numberBalls;
  const maxHeight = height;

  const ballRadius = 15;
  const handY = height - 50;
  const leftHandX = width / 4;
  const rightHandX = (3 * width) / 4;
  const timeStep = 16;
  const offsetFactor = 20;

  const [balls, setBallArray] = useState<Ball[]>(
    Array.from({ length: numberBalls }, (_, index) => {
      const isLeft = index < Math.ceil(numberBalls / 2);
      return {
        id: index,
        x: isLeft ? leftHandX : rightHandX,
        y: handY,
        inAir: false,
        throwTime: 0,
        landingTime: 0,
        stagger: 0, // Stagger is no longer used
        fromLeft: isLeft,
        currentThrow: siteswap[0],
        throwIndex: 0,
      };
    }),
  );

  useEffect(() => {
    setBallArray(
      Array.from({ length: numberBalls }, (_, index) => {
        const isLeft = index < Math.ceil(numberBalls / 2);
        return {
          id: index,
          x: isLeft ? leftHandX : rightHandX,
          y: handY,
          inAir: false,
          throwTime: 0,
          landingTime: 0,
          stagger: 0,
          fromLeft: isLeft,
          currentThrow: siteswap[0],
          throwIndex: 0,
        };
      }),
    );
  }, [numberBalls, handY, leftHandX, rightHandX, siteswap]);

  useEffect(() => {
    const svg = d3
      .select(svgReference.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f0f0f0');

    function animate() {
      svg.selectAll('.ball').remove();

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
        )
        .attr('cx', (d: Ball) => d.x)
        .attr('cy', (d: Ball) => d.y);

      const tick = () => {
        const time = simulatedTime;
        const elapseTime = timeStep / paceMultiplier;
        if (!paused) {
          startTimeReference.current =
            (startTimeReference.current ?? 0) + elapseTime;
          setSimulatedTime((previous) => previous + elapseTime);
        }

        if (!paused && (throwLimit === 0 || throwCount < throwLimit)) {
          setBallArray((previous) => {
            const currentBeat = Math.floor(simulatedTime / beatDuration);
            if (currentBeat > lastProcessedBeatRef.current) {
              for (
                let beat = lastProcessedBeatRef.current + 1;
                beat <= currentBeat;
                beat++
              ) {
                // Determine throwing hand based on pattern length and beat
                const throwingHand =
                  beat % 2 === 0
                    ? patternLength % 2 === 0
                      ? 'left'
                      : 'right'
                    : patternLength % 2 === 0
                    ? 'right'
                    : 'left';
                const throwValue = siteswap[beat % patternLength];
                const handBalls = previous.filter(
                  (b) =>
                    b.fromLeft === (throwingHand === 'left') && !b.inAir,
                );
                if (handBalls.length > 0) {
                  const ball = handBalls[0];
                  ball.inAir = true;
                  ball.currentThrow = throwValue;
                  ball.throwTime = beat * beatDuration;
                  ball.landingTime = ball.throwTime + throwValue * beatDuration;
                  ball.throwIndex = beat % patternLength;
                  setThrowHistory((prev) => [
                    { ...ball, throwTime: Math.floor(ball.throwTime) },
                    ...prev,
                  ]);
                  setThrowCount((prev) => prev + 1);
                }
              }
              lastProcessedBeatRef.current = currentBeat;
            }

            return previous.map((ball) => {
              const timeElapsed = simulatedTime - ball.throwTime;
              const flightDuration = ball.landingTime - ball.throwTime;
              const cycleProgress = Math.min(
                Math.max(timeElapsed / flightDuration, 0),
                1,
              );
              if (ball.inAir) {
                const startX = ball.fromLeft ? leftHandX : rightHandX;
                const endX =
                  ball.currentThrow % 2 === 0
                    ? startX
                    : ball.fromLeft
                    ? rightHandX
                    : leftHandX;
                const linearX = startX + (endX - startX) * cycleProgress;
                const peakY = handY - (maxHeight * ball.currentThrow) / 9;

                if (ball.currentThrow === 1) {
                  ball.x = linearX;
                  ball.y = handY - 50 * Math.sin(Math.PI * cycleProgress);
                } else if (ball.currentThrow % 2 !== 0) {
                  const offsetAmplitude = offsetFactor * ball.currentThrow;
                  const direction = ball.fromLeft ? 1 : -1;
                  ball.x =
                    linearX +
                    offsetAmplitude * Math.sin(Math.PI * cycleProgress) * direction;
                  ball.y =
                    handY -
                    (handY - peakY) * 2 * cycleProgress * (1 - cycleProgress);
                } else {
                  ball.x = linearX;
                  ball.y =
                    handY -
                    (handY - peakY) * 2 * cycleProgress * (1 - cycleProgress);
                }

                if (simulatedTime >= ball.landingTime) {
                  ball.inAir = false;
                  ball.fromLeft =
                    ball.currentThrow % 2 === 0 ? ball.fromLeft : !ball.fromLeft;
                  ball.x = ball.fromLeft ? leftHandX : rightHandX;
                  ball.y = handY;
                }
              }
              if(cycleProgress >1)timerReference.current?.stop()
              return ball;
            });
          });
        }

        ballSelection.attr('cx', (d: Ball) => d.x).attr('cy', (d: Ball) => d.y);
      };

      if (timerReference.current) {
        timerReference.current.stop();
      }
      timerReference.current = d3.timer(tick);
    }

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

    animate();
    const currentTimerReference = timerReference.current;
    const currentSvgReference = svgReference.current;
    return () => {
      if (currentTimerReference) {
        currentTimerReference?.stop();
      }
      d3.select(currentSvgReference).selectAll('*').remove();
    };
  }, [
    balls,
    baseThrowDuration,
    beatDuration,
    handY,
    leftHandX,
    maxHeight,
    numberBalls,
    paceMultiplier,
    patternLength,
    paused,
    rightHandX,
    simulatedTime,
    siteswap,
    speedLimit,
    speedMultiplier,
    throwCount,
    throwLimit,
  ]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
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
                setSiteswap(newSiteswap);
                setThrowCount(0);
                setSimulatedTime(0);
                setThrowHistory([]);
                lastProcessedBeatRef.current = -1; // Reset beat counter
              }
            }}
          />
          <button
            onClick={() => {
              if (timerReference.current) {
                timerReference.current.stop();
              }
              setPaused((previous) => !previous);
            }}
          >
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
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
                setSiteswap(pattern);
                setThrowCount(0);
                setSimulatedTime(0);
                setThrowHistory([]);
                lastProcessedBeatRef.current = -1; // Reset beat counter
              }}
              key={pattern.join('')}
            >
              {pattern.join('')}
            </button>
          ))}
        </div>
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
            Pace Multiplier:
            <input
              type='number'
              step='0.1'
              value={paceMultiplier}
              min='0.1'
              max='5'
              onChange={(event) =>
                setPaceMultiplier(Number.parseFloat(event.target.value))
              }
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
              }
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
              }
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
              }
              style={{ width: '60px', marginLeft: '5px' }}
            />
          </label>
          <div>Throw Count: {throwCount}</div>
          <div>Throw Time: {simulatedTime} ms</div>
          <div>Throw Speed: {baseThrowDuration}</div>
        </div>
        <ThrowHistory history={throwHistory} limit={numberBalls * 3} />
      </div>
    </div>
  );
}
