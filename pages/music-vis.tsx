// pages/index.tsx
import * as d3 from 'd3';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Widget } from '../components/MusicVisualizer/Widget';
import styles from '../styles/Visualizer.module.css';
import { WidgetType } from '../utilities';

const ALL_WIDGET_TYPES: WidgetType[] = ['playback', 'presets', 'customization'];

type VisualizationType = 'bars' | 'waves' | 'circles' | 'image';
enum Detail {
  Low = Math.pow(2, 7),
  Medium = Math.pow(2, 8),
  High = Math.pow(2, 9),
  Extra = Math.pow(2, 10),
  Super = Math.pow(2, 11),
}

interface VisualOptions {
  barWidthMultiplier: number;
  waveThickness: number;
  circleCount: number;
  colorScheme: 'rainbow' | 'monochrome' | 'custom';
  customColors: string[];
  rotationSpeed: number;
  saturation: number;
  lightness: number;
}

export default function MusicVisualizer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [visualizationType, setVisualizationType] =
    useState<VisualizationType>('bars');
  const [detail, setDetail] = useState(Detail.Low);
  const [activeWidgets, setActiveWidgets] =
    useState<WidgetType[]>(ALL_WIDGET_TYPES);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );
  const [volume, setVolume] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [visualOptions, setVisualOptions] = useState<VisualOptions>({
    barWidthMultiplier: 1.0,
    waveThickness: 2,
    circleCount: 20,
    colorScheme: 'rainbow',
    customColors: ['#ff0000'],
    rotationSpeed: 0,
    saturation: 100,
    lightness: 50,
  });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight * 0.5,
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const setupVisualizer = async (source: AudioNode) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
        console.log('AudioContext created');
      }
      const audioContext = audioContextRef.current;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = detail;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      source.connect(analyser);
      analyser.connect(audioContext.destination);
      console.log('Audio nodes connected');

      startVisualization();
    } catch (err) {
      setError('Error initializing visualizer: ' + (err as Error).message);
      console.error('Setup error:', err);
    }
  };

  const startMicAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const source = audioContextRef.current.createMediaStreamSource(stream);
      await setupVisualizer(source);
      setIsPlaying(true);
      console.log('Microphone audio started');
    } catch (err) {
      setError('Microphone access denied: ' + (err as Error).message);
      console.error('Mic error:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      const audio = new Audio(URL.createObjectURL(file));
      setAudioElement(audio);
      setActiveWidgets((prev) => [...prev, 'playback']);

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        console.log('Audio duration:', audio.duration);
      };
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        console.log('Audio ended');
      };
      audio.onerror = (ev) => {
        setError(
          'Error loading audio file: ' +
            (ev instanceof Event ? ev.type : ev ?? 'Unknown error'),
        );
        console.error('Audio load error:', ev);
      };
      audio.oncanplay = () => console.log('Audio can play');

      setIsPlaying(false);
    }
  };

  const getColor = useCallback(
    (index: number, total: number, amplitude: number = 0) => {
      switch (visualOptions.colorScheme) {
        case 'rainbow':
          const hue = ((index / total) * 360) % 360;
          // Adjust lightness based on amplitude (0-255 mapped to 60-80%)
          const lightness = 40 + ((index % total) % 40);
          return `hsl(${hue}, ${visualOptions.saturation}%, ${lightness}%)`;
        case 'monochrome':
          // Green hue, vary lightness with amplitude
          return `hsl(120, ${visualOptions.saturation}%, ${
            20 + (amplitude / 255) * index
          }%)`;
        case 'custom':
          const colors =
            visualOptions.customColors.length > 0
              ? visualOptions.customColors
              : ['#ffffff'];
          // Cycle through custom colors, adjust
          // make a gradient of the list of colors
          const colorIndex = Math.floor((index / total) * colors.length);
          return colors[colorIndex];
        default:
          return '#ffffff';
      }
    },
    [
      visualOptions.colorScheme,
      visualOptions.customColors,
      visualOptions.saturation,
    ],
  );

  const drawBars = useCallback(
    (
      svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
      bufferLength: number,
      dataArray: Uint8Array,
    ) => {
      const barWidth =
        (dimensions.width / bufferLength) * visualOptions.barWidthMultiplier;

      svg
        .selectAll('rect')
        .data(dataArray)
        .enter()
        .append('rect')
        .attr('x', (_, i) => i * barWidth)
        .attr('width', barWidth - 1)
        .attr('y', (d) => dimensions.height - (d / 255) * dimensions.height)
        .attr('height', (d) => (d / 255) * dimensions.height)
        .attr('fill', (d, i) =>
          getColor(i, bufferLength, (d / 255) * dimensions.height),
        );
    },
    [
      dimensions.height,
      dimensions.width,
      getColor,
      visualOptions.barWidthMultiplier,
    ],
  );

  const drawWaves = useCallback(
    (
      svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
      bufferLength: number,
      dataArray: Uint8Array,
    ) => {
      const xScale = (i: number) => (i / (bufferLength - 1)) * dimensions.width;
      const yScale = (d: number) =>
        dimensions.height / 2 - (d / 255) * (dimensions.height / 2);

      // Draw wave as individual line segments
      svg
        .selectAll('line')
        .data(dataArray.slice(0, -1)) // Exclude last point to pair with next
        .enter()
        .append('line')
        .attr('x1', (_, i) => xScale(i))
        .attr('y1', (d) => yScale(d))
        .attr('x2', (_, i) => xScale(i + 1))
        .attr('y2', (_, i) => yScale(dataArray[i + 1]))
        .attr('stroke', (d, i) => getColor(i, bufferLength, d)) // Color based on amplitude
        .attr('stroke-width', visualOptions.waveThickness);
    },
    [
      dimensions.height,
      dimensions.width,
      getColor,
      visualOptions.waveThickness,
    ],
  );

  const drawCircles = useCallback(
    (
      svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
      bufferLength: number,
      dataArray: Uint8Array,
      rotationAngle: number,
    ) => {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const maxRadius = Math.min(dimensions.width, dimensions.height) / 4;

      const circleData = dataArray.slice(0, visualOptions.circleCount);
      svg
        .selectAll('circle')
        .data(circleData)
        .enter()
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', (d) => (d / 255) * maxRadius)
        .attr('fill', 'none')
        .attr('stroke', (_, i) => getColor(i, circleData.length))
        .attr('stroke-width', 2)
        .attr(
          'transform',
          (_, i) =>
            `rotate(${
              (i / circleData.length) * 360 + rotationAngle
            }, ${centerX}, ${centerY})`,
        );
    },
    [dimensions.height, dimensions.width, getColor, visualOptions.circleCount],
  );

  const startVisualization = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const analyser = analyserRef.current;
    if (!analyser || !svgRef.current) {
      console.error('Missing analyser or SVG element');
      setError('Visualization setup failed: missing components');
      return;
    }

    svg.attr('width', dimensions.width).attr('height', dimensions.height);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    console.log('Visualization started, buffer length:', bufferLength);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    let rotationAngle = 0;

    const draw = () => {
      if (!analyser || !svgRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      svg.selectAll('*').remove();

      if (dataArray.every((val) => val === 0)) {
        console.warn('No audio data detected');
      } else {
        // console.log('Audio data detected, max value:', Math.max(...dataArray));
      }

      rotationAngle += visualOptions.rotationSpeed;
      console.log(bufferLength);
      switch (visualizationType) {
        case 'bars':
          drawBars(svg, bufferLength, dataArray);
          break;
        case 'waves':
          drawWaves(svg, bufferLength, dataArray);
          break;
        case 'circles':
          drawCircles(svg, bufferLength, dataArray, rotationAngle);
          break;
        default:
          console.error('Unknown visualization type:', visualizationType);
      }
    };

    draw();
  }, [
    dimensions.height,
    dimensions.width,
    drawBars,
    drawCircles,
    drawWaves,
    visualOptions.rotationSpeed,
    visualizationType,
  ]);

  const playAudio = async () => {
    if (audioElement && !isPlaying) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
          console.log('AudioContext created in playAudio');
          const source =
            audioContextRef.current.createMediaElementSource(audioElement);
          audioSourceRef.current = source;
          await setupVisualizer(source);
        } else if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
          console.log('AudioContext resumed');
        }
        console.log(
          'Attempting to play audio, current state:',
          audioContextRef.current.state,
        );
        await audioElement.play();
        setIsPlaying(true);
        console.log('Audio playing successfully');
      } catch (err) {
        setError('Error playing audio: ' + (err as Error).message);
        console.error('Play error:', err);
      }
    } else {
      console.log(
        'Cannot play: audioElement exists?',
        !!audioElement,
        'isPlaying?',
        isPlaying,
      );
    }
  };

  const pauseAudio = () => {
    if (audioElement && isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      console.log('Audio paused');
    }
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      console.log('Audio stopped');
    }
  };

  const resetVisualizer = () => {
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current)
      audioContextRef.current.close().catch(() => {});
    if (audioElement) audioElement.pause();
    setAudioElement(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setDetail(Detail.Low);
    setVisualizationType('bars');
    setVisualOptions({
      barWidthMultiplier: 1.0,
      waveThickness: 2,
      circleCount: 20,
      colorScheme: 'rainbow',
      customColors: ['#ff0000'],
      rotationSpeed: 0,
      saturation: 100,
      lightness: 50,
    });
    audioContextRef.current = null;
    analyserRef.current = null;
    audioSourceRef.current = null;
    console.log('Visualizer reset');
  };

  const setWideVibrantBars = () => {
    setVisualizationType('bars');
    setVisualOptions({
      ...visualOptions,
      barWidthMultiplier: 2.0,
      colorScheme: 'custom',
      customColors: ['#ec1254', '#f27c14', '#f5e31d', '#1ee8b6', '#26a1d5'],
      saturation: 100,
      lightness: 50,
    });
  };

  const setBoldGreenWave = () => {
    setVisualizationType('waves');
    setVisualOptions({
      ...visualOptions,
      waveThickness: 10,
      colorScheme: 'monochrome',
      saturation: 100,
      lightness: 50,
    });
  };

  const setSpinningKaleidoscope = () => {
    setVisualizationType('circles');
    setVisualOptions({
      ...visualOptions,
      circleCount: 50,
      rotationSpeed: 2,
      colorScheme: 'rainbow',
      saturation: 100,
      lightness: 50,
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioElement) audioElement.volume = newVolume;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioElement) {
      audioElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const addCustomColor = () => {
    setVisualOptions({
      ...visualOptions,
      customColors: [...visualOptions.customColors, '#ffffff'],
    });
  };

  const updateCustomColor = (index: number, color: string) => {
    const newColors = [...visualOptions.customColors];
    newColors[index] = color;
    setVisualOptions({ ...visualOptions, customColors: newColors });
  };

  const removeCustomColor = (index: number) => {
    if (visualOptions.customColors.length > 1) {
      const newColors = visualOptions.customColors.filter(
        (_, i) => i !== index,
      );
      setVisualOptions({ ...visualOptions, customColors: newColors });
    }
  };

  useEffect(() => {
    if (analyserRef.current && audioContextRef.current && isPlaying) {
      analyserRef.current.fftSize = detail;
      startVisualization();
    }
  }, [detail, visualizationType, visualOptions, isPlaying, startVisualization]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current)
        audioContextRef.current.close().catch(() => {});
      if (audioElement) audioElement.pause();
      console.log('Cleanup executed');
    };
  }, [audioElement]);

  function handleSectionClick(section: WidgetType | WidgetType[]) {
    return () => {
      setActiveWidgets((prev) =>
        Array.isArray(section)
          ? prev === ALL_WIDGET_TYPES && section === ALL_WIDGET_TYPES
            ? []
            : section
          : prev.includes(section)
          ? prev.filter((s) => s !== section)
          : [...prev, section],
      );
    };
  }

  return (
    <div className={styles.container}>
      <h1>Music Visualizer (alpha)</h1>

      <div className={styles.widgetContainer}>
        <Widget widget={'widgetPicker'}>
          {ALL_WIDGET_TYPES.map((widget) => (
            <button
              className={styles.input}
              key={widget}
              onClick={handleSectionClick(widget)}
            >
              {widget}
            </button>
          ))}
          <button
            className={styles.input}
            onClick={handleSectionClick(ALL_WIDGET_TYPES)}
          >
            all
          </button>
        </Widget>
        <Widget widget={'playback'} activeWidget={activeWidgets}>
          <button
            className={styles.input}
            onClick={startMicAudio}
            disabled={isPlaying || !!audioElement}
          >
            Use Microphone
          </button>
          <button className={styles.input} onClick={resetVisualizer}>
            Reset
          </button>
          <input
            type='file'
            accept='audio/*'
            ref={fileInputRef}
            onChange={handleFileUpload}
            className={styles.fileInput}
          />
          {audioElement && (
            <div className={styles.playbackControls}>
              <button
                className={styles.input}
                onClick={playAudio}
                disabled={isPlaying}
              >
                Play
              </button>
              <button
                className={styles.input}
                onClick={pauseAudio}
                disabled={!isPlaying}
              >
                Pause
              </button>
              <button className={styles.input} onClick={stopAudio}>
                Stop
              </button>
              <div className={styles.volumeControl}>
                <label>Volume: </label>
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.1'
                  value={volume}
                  onChange={handleVolumeChange}
                />
              </div>
              <div className={styles.seekControl}>
                <input
                  type='range'
                  min='0'
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                />
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          )}
        </Widget>
        <Widget widget={'presets'} activeWidget={activeWidgets}>
          <button className={styles.input} onClick={setWideVibrantBars}>
            Wide Vibrant Bars
          </button>
          <button className={styles.input} onClick={setBoldGreenWave}>
            Bold Green Wave
          </button>
          <button className={styles.input} onClick={setSpinningKaleidoscope}>
            Spinning Kaleidoscope
          </button>
        </Widget>
        <Widget widget={'customization'} activeWidget={activeWidgets}>
          <select
            className={styles.input}
            value={visualizationType}
            onChange={(e) =>
              setVisualizationType(e.target.value as VisualizationType)
            }
          >
            <option value='bars'>Bars</option>
            <option value='waves'>Waves</option>
            <option value='circles'>Circles</option>
          </select>
          <select
            className={styles.input}
            value={detail}
            onChange={(e) => setDetail(Number(e.target.value))}
          >
            {[
              { detail: Detail.Low, label: 'Low' },
              { detail: Detail.Medium, label: 'Medium' },
              { detail: Detail.High, label: 'High' },
              { detail: Detail.Extra, label: 'Extra' },
              { detail: Detail.Super, label: 'Super' },
            ].map(({ detail, label }) => {
              return (
                <option
                  key={detail}
                  value={detail}
                >{`${label} Detail (${detail})`}</option>
              );
            })}
          </select>
          {visualizationType === 'bars' && (
            <div className={styles.customizationItem}>
              <label>Bar Width Multiplier: </label>
              <input
                type='range'
                min='0.5'
                max='2'
                step='0.1'
                value={visualOptions.barWidthMultiplier}
                onChange={(e) =>
                  setVisualOptions({
                    ...visualOptions,
                    barWidthMultiplier: Number(e.target.value),
                  })
                }
              />
            </div>
          )}
          {visualizationType === 'waves' && (
            <div className={styles.customizationItem}>
              <label>Wave Thickness: </label>
              <input
                type='range'
                min='1'
                max='10'
                step='1'
                value={visualOptions.waveThickness}
                onChange={(e) =>
                  setVisualOptions({
                    ...visualOptions,
                    waveThickness: Number(e.target.value),
                  })
                }
              />
            </div>
          )}
          {visualizationType === 'circles' && (
            <>
              <div className={styles.customizationItem}>
                <label>Circle Count: </label>
                <input
                  type='range'
                  min='5'
                  max='50'
                  step='1'
                  value={visualOptions.circleCount}
                  onChange={(e) =>
                    setVisualOptions({
                      ...visualOptions,
                      circleCount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className={styles.customizationItem}>
                <label>Rotation Speed: </label>
                <input
                  type='range'
                  min='-5'
                  max='5'
                  step='0.1'
                  value={visualOptions.rotationSpeed}
                  onChange={(e) =>
                    setVisualOptions({
                      ...visualOptions,
                      rotationSpeed: Number(e.target.value),
                    })
                  }
                />
              </div>
            </>
          )}
          <div className={styles.customizationItem}>
            <label>Color Scheme: </label>
            <select
              className={styles.input}
              value={visualOptions.colorScheme}
              onChange={(e) =>
                setVisualOptions({
                  ...visualOptions,
                  colorScheme: e.target.value as VisualOptions['colorScheme'],
                })
              }
            >
              <option value='rainbow'>Rainbow</option>
              <option value='monochrome'>Monochrome (Green)</option>
              <option value='custom'>Custom</option>
            </select>
          </div>
          {visualOptions.colorScheme === 'custom' && (
            <div className={styles.customColors}>
              {visualOptions.customColors.map((color, index) => (
                <div key={index} className={styles.colorPicker}>
                  <input
                    type='color'
                    value={color}
                    onChange={(e) => updateCustomColor(index, e.target.value)}
                  />
                  <button
                    onClick={() => removeCustomColor(index)}
                    disabled={visualOptions.customColors.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button onClick={addCustomColor}>Add Color</button>
            </div>
          )}
          <div className={styles.customizationItem}>
            <label>Saturation: </label>
            <input
              type='range'
              min='0'
              max='100'
              step='1'
              value={visualOptions.saturation}
              onChange={(e) =>
                setVisualOptions({
                  ...visualOptions,
                  saturation: Number(e.target.value),
                })
              }
            />
          </div>
          <div className={styles.customizationItem}>
            <label>Lightness: </label>
            <input
              type='range'
              min='0'
              max='100'
              step='1'
              value={visualOptions.lightness}
              onChange={(e) =>
                setVisualOptions({
                  ...visualOptions,
                  lightness: Number(e.target.value),
                })
              }
            />
          </div>
        </Widget>
      </div>
      {error && <div className={styles.error}>{error}</div>}

      <svg ref={svgRef} className={styles.canvas} />
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}
