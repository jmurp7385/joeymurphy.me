import { useEffect, useRef, useState } from 'react';
import { Widget } from '../Widget/Widget';
import {
  ANIMATION_CONFIG,
  Ball,
  Hand,
} from './animation-types';
import { parseSiteswap } from './siteswap-parser';
import { getStyles } from './styles';
import { useJugglingAnimation } from './useJugglingAnimation';
type WidgetType = 'ball' | 'siteswap' | 'animation' | 'hand';

/**
 * SiteswapAnimation Component
 * Renders a canvas-based juggling animation with support for async, sync, and multiplex patterns.
 */
export default function SiteswapAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [siteswap, setSiteswap] = useState(ANIMATION_CONFIG.DEFAULT_SITESWAP);
  const [dimensions, setDimensions] = useState({
    width: ANIMATION_CONFIG.WIDTH,
    height: ANIMATION_CONFIG.HEIGHT,
  });
  const [bpm, setBpm] = useState(ANIMATION_CONFIG.DEFAULT_BPM);
  const [isRunning, setIsRunning] = useState(true);
  const [error, setError] = useState('');
  const [animParams, setAnimParams] = useState({
    handSeparation: ANIMATION_CONFIG.HAND_SEPARATION_FACTOR,
    throwHeight: ANIMATION_CONFIG.THROW_HEIGHT_SCALE_FACTOR,
  });
  const [colorParams, setColorParams] = useState({
    activeBeatColor: ANIMATION_CONFIG.DEFAULT_ACTIVE_BEAT_COLOR,
    inactiveBeatColor: ANIMATION_CONFIG.DEFAULT_INACTIVE_BEAT_COLOR,
    activeBeatBorderColor: ANIMATION_CONFIG.DEFAULT_ACTIVE_BEAT_BORDER_COLOR,
    showBeatIndicator: true,
    useSingleColor: false,
    baseHue: ANIMATION_CONFIG.DEFAULT_BASE_HUE,
    singleBallColor: ANIMATION_CONFIG.DEFAULT_BALL_COLOR,
  });

  const animationState = useRef({
    balls: [] as Ball[],
    hands: [] as Hand[],
    pattern: [3] as (number | number[])[],
    numBalls: 3,
    isSync: false,
    isFountain: false,
    beatDuration: 60_000 / ANIMATION_CONFIG.DEFAULT_BPM,
    maxHeight: dimensions.height * 0.7,
    elapsedTime: 0,
    lastTime: 0,
  });

  // Effect to automatically adjust hand separation when the siteswap changes
  useEffect(() => {
    // This parser is just for calculating numBalls to update the UI.
    // The main animation's useEffect has its own parser instance.
    let result;
    try {
      result = parseSiteswap(siteswap);
    } catch {
      result = undefined;
    }
    if (result) {
      // Automatically adjust hand separation based on the number of balls for a better visual.
      const newSeparation = Math.max(
        0.1,
        Math.min(result.numBalls / (result.numBalls > 5 ? 20 : 10), 0.8),
      );
      setAnimParams((previous) => ({ ...previous, handSeparation: newSeparation }));
    }
  }, [siteswap]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.min(800, window.innerWidth * 0.8),
        height: window.innerHeight * 0.5,
      });
      animationState.current.maxHeight = window.innerHeight * 0.5;
    };
    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Update maxHeight in animation state when dimensions change
    animationState.current.maxHeight = dimensions.height * 0.8;
  }, [dimensions]);

  const { width, height } = dimensions;
  const styles = getStyles(width);

  useJugglingAnimation({
    canvasRef,
    siteswap,
    bpm,
    isRunning,
    animParams,
    colorParams,
    dimensions,
    animationState,
    setError,
  });

  return (
    <div style={styles.container}>
      <h1>Siteswap Animator (Alpha)</h1>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={styles.canvas}
      ></canvas>
      <div style={styles.error}>{error}</div>
      <Widget widget='siteswap' style={styles.siteswapWidget}>
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{ ...styles.button, maxWidth: '80px' }}
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
        <div style={styles.flexCenter}>
          <label htmlFor='siteswap-input'>Siteswap:</label>
          <input
            id='siteswap-input'
            type='text'
            value={siteswap}
            onChange={(event) => setSiteswap(event.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.flexCenter}>
          <label htmlFor='bpm-input'>BPM:</label>
          <input
            id='bpm-input'
            type='number'
            value={bpm}
            onChange={(event) => setBpm(Number.parseInt(event.target.value, 10))}
            min='30'
            max='300'
            style={styles.input}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '10px',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            padding: '10px',
            width: '100%',
            maxWidth: width,
          }}
        >
          {[
            '3',
            '4',
            '5',
            '7',
            '9',
            '441',
            '531',
            '51',
            '71',
            '91',
            '(4,4)',
            '(6,6)',
            '(8,8)',
            '(6x,4)',
            '[34]1',
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
      </Widget>
      <div
        style={styles.widgetContainer}
      >
        <Widget<WidgetType>
          widget='ball'
          style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            maxWidth: width,
          }}
        >
          <h3 style={{ margin: 0, textAlign: 'center' }}>Ball Parameters</h3>
          <div
            style={{
              display: 'flex',
              gap: '10px',
            }}
          >
            <label htmlFor='single-color-toggle' style={{ flexBasis: '120px' }}>
              Single Ball Color:
            </label>
            <input
              id='single-color-toggle'
              type='checkbox'
              checked={colorParams.useSingleColor}
              onChange={(event) =>
                setColorParams((previous) => ({
                  ...previous,
                  useSingleColor: event.target.checked,
                }))
              }
            />
          </div>
          <div
            style={{
              display: 'flex',
              gap: '10px',
            }}
          >
            {colorParams.useSingleColor ? (
              <>
                <label
                  htmlFor='ball-color-picker'
                  style={{ flexBasis: '120px' }}
                >
                  Ball Color:
                </label>
                <input
                  id='ball-color-picker'
                  type='color'
                  value={colorParams.singleBallColor}
                  onChange={(event) =>
                    setColorParams((previous) => ({
                      ...previous,
                      singleBallColor: event.target.value,
                    }))
                  }
                />
              </>
            ) : (
              <>
                <label htmlFor='base-hue-slider' style={{ flexBasis: '120px' }}>
                  Base Hue:
                </label>
                <input
                  id='base-hue-slider'
                  type='range'
                  min='0'
                  max='360'
                  value={colorParams.baseHue}
                  onChange={(event) =>
                    setColorParams((previous) => ({
                      ...previous,
                      baseHue: Number.parseInt(event.target.value, 10),
                    }))
                  }
                  style={{ flexGrow: 1 }}
                />
                <span>{colorParams.baseHue}</span>
              </>
            )}
          </div>
        </Widget>
        <Widget<WidgetType>
          widget='animation'
          backgroundColor='#2a2a2a'
          style={{
            flexGrow: '1',
            gap: '15px',
            marginTop: '10px',
            padding: '15px',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            maxWidth: width,
          }}
        >
          <h3 style={{ margin: 0, textAlign: 'center' }}>
            Animation Parameters
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: 'center',
            }}
          >
            <label
              htmlFor='hand-separation-slider'
              style={{ flexBasis: '120px' }}
            >
              Hand Separation:
            </label>
            <input
              id='hand-separation-slider'
              type='range'
              min='0.1'
              max='0.8'
              step='0.01'
              value={animParams.handSeparation}
              onChange={(event) =>
                setAnimParams((previous) => ({
                  ...previous,
                  handSeparation: Number.parseFloat(event.target.value),
                }))
              }
              style={{ flexGrow: 1 }}
            />
            <span>{animParams.handSeparation.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: 'center',
            }}
          >
            <label htmlFor='throw-height-slider' style={{ flexBasis: '120px' }}>
              Throw Height:
            </label>
            <input
              id='throw-height-slider'
              type='range'
              min='1'
              max='5'
              step='0.1'
              value={animParams.throwHeight}
              onChange={(event) =>
                setAnimParams((previous) => ({
                  ...previous,
                  throwHeight: Number.parseFloat(event.target.value),
                }))
              }
              style={{ flexGrow: 1 }}
            />
            <span>{animParams.throwHeight.toFixed(1)}</span>
          </div>
        </Widget>
        <Widget<WidgetType>
          widget='hand'
          backgroundColor='#2a2a2a'
          style={{
            flexGrow: '1',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            maxWidth: width,
          }}
        >
          <h3 style={{ margin: 0, textAlign: 'center' }}>Hand Parameters</h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              padding: '15px',
              justifyContent: 'space-around',
            }}
          >
            <div
              style={{
                flexDirection: 'column',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <label htmlFor='active-color-picker'>Active Color:</label>
              <input
                id='active-color-picker'
                type='color'
                style={{ width: '100%' }}
                value={colorParams.activeBeatColor}
                onChange={(event) =>
                  setColorParams((previous) => ({
                    ...previous,
                    activeBeatColor: event.target.value,
                  }))
                }
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              <label htmlFor='inactive-color-picker'>Inactive Color:</label>
              <input
                id='inactive-color-picker'
                type='color'
                style={{ width: '100%' }}
                value={colorParams.inactiveBeatColor}
                onChange={(event) =>
                  setColorParams((previous) => ({
                    ...previous,
                    inactiveBeatColor: event.target.value,
                  }))
                }
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              <label htmlFor='border-color-picker'>Border Color:</label>
              <input
                id='border-color-picker'
                type='color'
                style={{ width: '100%' }}
                value={colorParams.activeBeatBorderColor}
                onChange={(event) =>
                  setColorParams((previous) => ({
                    ...previous,
                    activeBeatBorderColor: event.target.value,
                  }))
                }
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              <label htmlFor='beat-indicator-toggle'>
                Show Beat Indicator:
              </label>
              <input
                id='beat-indicator-toggle'
                type='checkbox'
                checked={colorParams.showBeatIndicator}
                onChange={(event) =>
                  setColorParams((previous) => ({
                    ...previous,
                    showBeatIndicator: event.target.checked,
                  }))
                }
              />
            </div>
          </div>
        </Widget>
      </div>
    </div>
  );
}
