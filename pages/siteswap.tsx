import { NextSeo } from 'next-seo';
import Head from 'next/head';
import { useEffect, useRef } from 'react';

const SEO = {
  title: 'Vanilla JS Siteswap Animator',
  description: 'A high-performance juggling animator for standard, synchronous, and multiplex siteswaps.',
  url: 'https://joeymurphy.me/siteswap',
};

/**
 * A React component that hosts the vanilla JavaScript Siteswap Animator.
 */
export default function SiteswapPage() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hostRef.current && hostRef.current.children.length === 0) {
      const animator = new SiteswapAnimator(hostRef.current);
      animator.init();
    }
  }, []);

  return (
    <>
      <Head>
        <link rel='icon' href='/favicon-16x16.png' />
      </Head>
      <NextSeo
        title={SEO.title}
        description={SEO.description}
        openGraph={{
          url: SEO.url,
          title: SEO.title,
          description: SEO.description,
        }}
      />
      <div ref={hostRef}></div>
    </>
  );
}

/**
 * @class SiteswapAnimator
 * Manages the entire juggling animation, including the canvas, UI, and animation loop.
 */
class SiteswapAnimator {
  /** The DOM element that will host the animator UI and canvas. */
  private hostElement: HTMLElement;
  /** The canvas rendering context. */
  private ctx: CanvasRenderingContext2D | null = null;
  /** The array of Ball objects being animated. */
  private balls: Ball[] = [];
  /** The two Hand objects. */
  private hands: Hand[] = [];
  /** The current siteswap pattern string. */
  private siteswap = '3';
  /** Number of balls in the pattern. */
  private numBalls = 3;
  /** Parsed siteswap throw sequence. */
  private pattern: (number | number[])[] = [3];
  /** Animation loop request ID. */
  private animationFrameId = 0;
  /** Current time in the animation loop (ms). */
  private lastTime = 0;
  /** Total elapsed time for the simulation (ms). */
  private elapsedTime = 0;
  /** Is the animation currently running. */
  private isRunning = true;
  /** Is the pattern synchronous. */
  private isSync = false;

  // --- Configurable Parameters ---
  /** Beats per minute, controlling the rhythm. */
  private bpm = 180;
  /** Duration of a single beat in milliseconds. */
  private beatDuration = 500;
  /** Percentage of a beat a ball is held in a hand. */
  private dwellRatio = 0.5;
  /** Maximum height of a throw, used for scaling. */
  private maxHeight = 500;

  /**
   * @param hostElement The DOM element to attach the animator to.
   */
  constructor(hostElement: HTMLElement) {
    this.hostElement = hostElement;
  }

  /**
   * Initializes the UI, canvas, and starts the animation.
   */
  public init() {
    this.createUI();
    this.setupCanvas();
    this.loadPattern(this.siteswap);
    this.animationFrameId = requestAnimationFrame(this.animationLoop.bind(this));
  }

  /**
   * Creates the HTML structure for the animator controls and canvas.
   */
  private createUI() {
    this.hostElement.innerHTML = `
      <style>
        :root {
          --background-color: #1a1a1a;
          --text-color: #e0e0e0;
          --primary-color: #007acc;
          --input-bg-color: #2a2a2a;
          --border-color: #444;
        }
        .animator-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: var(--background-color);
          color: var(--text-color);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          padding: 20px;
          min-height: 100vh;
        }
        .animator-canvas {
          background-color: #222;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
        .controls {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
          margin-top: 20px;
          padding: 15px;
          background-color: var(--input-bg-color);
          border-radius: 8px;
          width: 100%;
          max-width: 600px;
        }
        .control-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .control-group label {
          font-size: 14px;
        }
        .control-group input[type="text"], .control-group input[type="number"] {
          background-color: #333;
          border: 1px solid var(--border-color);
          color: var(--text-color);
          border-radius: 4px;
          padding: 8px;
          width: 80px;
          text-align: center;
        }
        .control-group button {
          background-color: var(--primary-color);
          border: none;
          color: white;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .error-message {
          color: #ff4d4d;
          margin-top: 10px;
          height: 20px;
          font-weight: bold;
        }
        .presets {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
          padding: 10px;
          width: 100%;
          max-width: 600px;
        }
        .preset-btn {
          background-color: #3a3a3a;
          border: 1px solid var(--border-color);
          color: var(--text-color);
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>
      <div class="animator-container">
        <h1>Siteswap Animator</h1>
        <canvas class="animator-canvas" width="600" height="600"></canvas>
        <div class="error-message" id="error-message"></div>
        <div class="controls">
          <div class="control-group">
            <label for="siteswap-input">Siteswap:</label>
            <input type="text" id="siteswap-input" value="${this.siteswap}">
            <button id="play-pause-btn">${this.isRunning ? 'Pause' : 'Play'}</button>
          </div>
          <div class="control-group">
            <label for="bpm-input">BPM:</label>
            <input type="number" id="bpm-input" value="${this.bpm}" min="30" max="300">
          </div>
        </div>
        <div class="presets" id="presets-container"></div>
      </div>
    `;

    // --- Event Listeners ---
    const siteswapInput = this.hostElement.querySelector('#siteswap-input') as HTMLInputElement;
    siteswapInput.addEventListener('change', () => this.loadPattern(siteswapInput.value));

    const bpmInput = this.hostElement.querySelector('#bpm-input') as HTMLInputElement;
    bpmInput.addEventListener('input', () => {
      this.bpm = parseInt(bpmInput.value, 10);
      this.beatDuration = 60000 / this.bpm;
    });

    const playPauseBtn = this.hostElement.querySelector('#play-pause-btn') as HTMLButtonElement;
    playPauseBtn.addEventListener('click', () => {
      this.isRunning = !this.isRunning;
      playPauseBtn.textContent = this.isRunning ? 'Pause' : 'Play';
    });

    // --- Presets ---
    const presets = [
      '3', '4', '5', '441', '531', '51', '71',
      '(4,4)', '(6x,4)', '[34]2'
    ];
    const presetsContainer = this.hostElement.querySelector('#presets-container');
    if (presetsContainer) {
      presets.forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.textContent = preset;
        btn.addEventListener('click', () => {
          siteswapInput.value = preset;
          this.loadPattern(preset);
        });
        presetsContainer.appendChild(btn);
      });
    }


  }

  /**
   * Sets up the canvas and its rendering context.
   */
  private setupCanvas() {
    const canvas = this.hostElement.querySelector('.animator-canvas') as HTMLCanvasElement;
    this.ctx = canvas.getContext('2d');
    this.maxHeight = canvas.height * 0.8;
  }

  /**
   * Parses and validates a siteswap string, then resets the animation.
   * @param siteswapStr The siteswap string to load.
   */
  private loadPattern(siteswapStr: string) {
    try {
      const { pattern, numBalls, isSync } = this.parseSiteswap(siteswapStr);
      this.siteswap = siteswapStr;
      this.pattern = pattern;
      this.numBalls = numBalls;
      this.isSync = isSync;
      this.resetAnimation();
      (this.hostElement.querySelector('#error-message') as HTMLElement).textContent = '';
    } catch (error) {
      (this.hostElement.querySelector('#error-message') as HTMLElement).textContent = (error as Error).message;
    }
  }

  /**
   * Resets the animation state, hands, and balls for the new pattern.
   */
  private resetAnimation() {
    this.elapsedTime = 0;
    this.lastTime = 0;

    const canvasWidth = this.ctx?.canvas.width ?? 600;
    const handY = this.ctx?.canvas.height ? this.ctx.canvas.height - 50 : 550;

    // Create hands
    this.hands = [
      new Hand(canvasWidth * 0.25, handY, 0, this.isSync, 0), // Left hand (id 0)
      new Hand(canvasWidth * 0.75, handY, 1, this.isSync, 1), // Right hand (id 1)
    ];

    // Create and distribute balls
    this.balls = [];
    for (let i = 0; i < this.numBalls; i++) {
      const handIndex = i % 2;
      const ball = new Ball(i, this.hands[handIndex].x, this.hands[handIndex].y);
      this.balls.push(ball);
      this.hands[handIndex].catchBall(ball);
    }

    // Schedule initial throws
    let beat = 0;
    if (this.isSync) {
      this.hands.forEach(hand => {
        if (hand.hasBall()) {
          const throwValue = this.pattern[hand.patternIndex % this.pattern.length];
          hand.scheduleThrow(0, throwValue);
          hand.patternIndex += 1;
        }
      });
    } else {
      for (let i = 0; i < this.numBalls; i++) {
        const hand = this.hands.find(h => h.beat === beat % 2);
        if (hand && hand.hasBall()) {
          const throwValue = this.pattern[hand.patternIndex % this.pattern.length];
          hand.scheduleThrow(beat * this.beatDuration, throwValue);
          hand.patternIndex += 2;
        }
        beat++;
      }
    }
  }

  /**
   * The main animation loop, called every frame.
   * @param currentTime The current time from requestAnimationFrame.
   */
  private animationLoop(currentTime: number) {
    if (!this.ctx) return;

    const deltaTime = this.lastTime > 0 ? currentTime - this.lastTime : 16.67;
    this.lastTime = currentTime;

    if (this.isRunning) {
      this.elapsedTime += deltaTime;
      this.update(this.elapsedTime);
    }

    this.draw();
    this.animationFrameId = requestAnimationFrame(this.animationLoop.bind(this));
  }

  /**
   * Updates the state of all balls and hands.
   * @param time The current simulation time.
   */
  private update(time: number) {
    // Update hand positions for oscillation
    this.hands.forEach(hand => {
      hand.update(time, this.beatDuration, this.isSync);
    });

    // Check for throws
    this.hands.forEach(hand => {
      if (hand.isReadyToThrow(time)) {
        const throwData = hand.throwBall(time, this.beatDuration * this.dwellRatio);
        if (throwData) {
          const { ball, throwValue } = throwData;
          const mainThrow = Array.isArray(throwValue) ? throwValue[0] : throwValue;

          let landingHand: Hand;
          if (this.isSync) {
            const isCross = mainThrow % 2 !== 0;
            landingHand = isCross ? this.hands.find(h => h !== hand)! : hand;
          } else {
            const landingBeat = (hand.beat + mainThrow) % 2;
            landingHand = this.hands.find(h => h.beat === landingBeat)!;
          }

          if (landingHand) {
            ball.throw(
              landingHand.baseX, // Target the base position of the other hand
              this.beatDuration,
              this.maxHeight,
              throwValue
            );
            // Schedule next throw for the throwing hand
            const nextPatternIndex = hand.patternIndex % this.pattern.length;
            const nextThrowValue = this.pattern[nextPatternIndex];
            hand.patternIndex += this.isSync ? 1 : 2;
            hand.scheduleThrow(time + (this.isSync ? this.beatDuration : 2 * this.beatDuration), nextThrowValue);
          }
        }
      }
    });

    // Update balls and check for catches
    this.balls.forEach(ball => {
      ball.update(time);
      if (ball.isLanding(time)) {
        const landingHand = this.hands.find(h => h.baseX === ball.endX);
        if (landingHand) {
          landingHand.catchBall(ball);
        }
      }
    });
  }

  /**
   * Draws the entire scene on the canvas.
   */
  private draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.hands.forEach(hand => hand.draw(this.ctx!));
    this.balls.forEach(ball => ball.draw(this.ctx!));
  }

  /**
   * Parses a siteswap string into a usable pattern and validates it.
   * Supports async, sync, and multiplex notations.
   * @param siteswap The string to parse.
   * @returns An object with the parsed pattern, number of balls, and sync flag.
   */
  private parseSiteswap(siteswap: string): { pattern: (number | number[])[], numBalls: number, isSync: boolean } {
    siteswap = siteswap.toLowerCase().replace(/\s/g, '');
    if (!siteswap) throw new Error("Siteswap cannot be empty.");

    const isSync = siteswap.includes('(');
    let throws: (number | number[])[] = [];

    if (isSync) {
      const syncPattern = /\((\w+),(\w+)\)/g;
      let match;
      while ((match = syncPattern.exec(siteswap)) !== null) {
        const leftThrow = match[1].replace('x', '');
        const rightThrow = match[2].replace('x', '');
        throws.push(parseInt(leftThrow, 36));
        throws.push(parseInt(rightThrow, 36));
      }
      if (throws.length === 0) throw new Error("Invalid sync siteswap format.");
    } else {
      const asyncPattern = /(\[[\da-z]+\]|[\da-z])/g;
      let match;
      while ((match = asyncPattern.exec(siteswap)) !== null) {
        const part = match[1];
        if (part.startsWith('[')) {
          throws.push(part.substring(1, part.length - 1).split('').map(t => parseInt(t, 36)));
        } else {
          throws.push(parseInt(part, 36));
        }
      }
    }

    // Validate pattern
    const sum = throws.flat().reduce((a, b) => a + b, 0);
    if (sum % throws.length !== 0) {
      throw new Error("Invalid siteswap: does not resolve to an integer number of balls.");
    }
    const numBalls = sum / throws.length;

    // Check for collisions
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
  }
}

/**
 * @class Ball
 * Represents a single juggling ball.
 */
class Ball {
  public id: number;
  public x: number;
  public y: number;
  public startX = 0;
  public startY = 0;
  public endX = 0;
  public throwTime = 0;
  public flightDuration = 0;
  public inAir = false;
  private throwHeight = 0;
  private color: string;

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.color = `hsl(${(id * 40) % 360}, 90%, 60%)`;
  }

  /**
   * Initiates a throw.
   * @param endX The destination x-coordinate.
   * @param beatDuration The duration of one beat.
   * @param maxHeight The maximum height for scaling.
   * @param throwValue The siteswap value of the throw.
   */
  public throw(endX: number, beatDuration: number, maxHeight: number, throwValue: number | number[]) {
    const mainThrow = Array.isArray(throwValue) ? throwValue[0] : throwValue;
    this.startX = this.x;
    this.startY = this.y;
    this.endX = endX;
    this.flightDuration = mainThrow * beatDuration;
    // Scale height quadratically but ensure it doesn't exceed the available canvas height.
    this.throwHeight = Math.min(this.startY, maxHeight * Math.pow(mainThrow / 5, 2));
    this.inAir = true;
  }

  /**
   * Updates the ball's position.
   * @param time The current simulation time.
   */
  public update(time: number) {
    if (!this.inAir) return;

    const timeInAir = time - this.throwTime;
    let progress = Math.min(timeInAir / this.flightDuration, 1);

    // Parabolic arc
    this.x = this.startX + (this.endX - this.startX) * progress;
    this.y = this.startY - this.throwHeight * 4 * progress * (1 - progress);
  }

  /**
   * Checks if the ball's flight is complete.
   * @param time The current simulation time.
   */
  public isLanding(time: number): boolean {
    return this.inAir && time >= this.throwTime + this.flightDuration;
  }

  /**
   * Draws the ball on the canvas.
   */
  public draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

/**
 * @class Hand
 * Represents a juggler's hand.
 */
class Hand {
  public x: number;
  public y: number;
  public baseX: number;
  public baseY: number;
  /** The direction of rotation for oscillation (-1 for clockwise, 1 for counter-clockwise). */
  private direction: number;
  /** The beat on which this hand throws (0 for left, 1 for right in async). */
  public beat: number;
  /** The balls currently held by this hand. */
  private heldBalls: Ball[] = [];
  /** The time of the next scheduled throw. */
  private nextThrowTime: number = Infinity;
  /** The value of the next scheduled throw. */
  private nextThrowValue: number | number[] = 0;
  /** The hand's current position in the siteswap pattern. */
  public patternIndex: number;

  constructor(x: number, y: number, beat: number, isSync: boolean, handId: number) {
    this.x = x;
    this.baseX = x;
    this.y = y;
    this.baseY = y;
    this.beat = isSync ? 0 : beat; // Both hands on beat 0 for sync
    // Left hand (id 0) is counter-clockwise, right (id 1) is clockwise
    this.direction = handId === 0 ? 1 : -1;
    // Left hand starts at pattern index 0, right at 1
    this.patternIndex = handId;
  }

  public hasBall(): boolean {
    return this.heldBalls.length > 0;
  }

  public catchBall(ball: Ball) {
    ball.inAir = false;
    ball.x = this.x;
    ball.y = this.y; // Land at the current hand position
    this.heldBalls.push(ball);
    // Sort balls by ID to maintain a consistent throwing order
    this.heldBalls.sort((a, b) => a.id - b.id);
  }

  public scheduleThrow(time: number, value: number | number[]) {
    this.nextThrowTime = time;
    this.nextThrowValue = value;
  }

  public isReadyToThrow(time: number): boolean {
    return this.hasBall() && time >= this.nextThrowTime;
  }

  /**
   * Throws a ball from the hand.
   * @param time The current simulation time.
   * @param dwellDuration The time the ball will be held before release.
   * @returns The thrown ball and its throw value.
   */
  public throwBall(time: number, dwellDuration: number): { ball: Ball, throwValue: number | number[] } | null {
    const ballToThrow = this.heldBalls.shift();
    if (ballToThrow) {
      ballToThrow.throwTime = time;
      const throwValue = this.nextThrowValue;
      this.nextThrowTime = Infinity; // Unschedule
      return { ball: ballToThrow, throwValue };
    }
    return null;
  }

  /**
   * Updates the hand's position for oscillation.
   * @param time The current simulation time.
   * @param beatDuration The duration of one beat.
   * @param isSync Whether the pattern is synchronous.
   */
  public update(time: number, beatDuration: number, isSync: boolean) {
    const oscillationRadiusX = 30;
    const oscillationRadiusY = 10;

    // One full rotation per throw cycle for this hand.
    // Async: 2 beats per throw. Sync: 1 beat per throw.
    const period = isSync ? beatDuration : 2 * beatDuration;

    // Phase ensures hand is at the top of its arc (throw point) on its beat.
    const phase = (time / period - this.beat / 2) * Math.PI * 2;

    this.x = this.baseX + Math.sin(phase) * oscillationRadiusX * this.direction;
    this.y = this.baseY + Math.cos(phase) * oscillationRadiusY;
  }

  /**
   * Draws the hand on the canvas.
   */
  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#888';
    ctx.fillRect(this.x - 25, this.y - 10, 50, 20);
  }
}
