// pages/index.tsx
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

type VisualizationType = 'bars' | 'waves' | 'circles';

export default function MusicVisualizer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [visualizationType, setVisualizationType] =
    useState<VisualizationType>('bars');
  const [fftSize, setFftSize] = useState(512);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );
  const [volume, setVolume] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth * 0.8,
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
      analyser.fftSize = fftSize;
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

  const startVisualization = () => {
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

    const draw = () => {
      if (!analyser || !svgRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      svg.selectAll('*').remove();

      if (dataArray.every((val) => val === 0)) {
        console.warn('No audio data detected');
      } else {
        console.log('Audio data detected, max value:', Math.max(...dataArray));
      }

      switch (visualizationType) {
        case 'bars':
          drawBars(svg, bufferLength, dataArray);
          break;
        case 'waves':
          drawWaves(svg, bufferLength, dataArray);
          break;
        case 'circles':
          drawCircles(svg, bufferLength, dataArray);
          break;
        default:
          console.error('Unknown visualization type:', visualizationType);
      }
    };

    draw();
  };

  const drawBars = (
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    bufferLength: number,
    dataArray: Uint8Array,
  ) => {
    const barWidth = dimensions.width / bufferLength;

    svg
      .selectAll('rect')
      .data(dataArray)
      .enter()
      .append('rect')
      .attr('x', (_, i) => i * barWidth)
      .attr('width', barWidth - 1)
      .attr('y', (d) => dimensions.height - (d / 255) * dimensions.height)
      .attr('height', (d) => (d / 255) * dimensions.height)
      .attr('fill', (_, i) => `hsl(${(i / bufferLength) * 360}, 100%, 50%)`);
  };

  const drawWaves = (
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    bufferLength: number,
    dataArray: Uint8Array,
  ) => {
    const line = d3
      .line<number>()
      .x((_, i) => (i / (bufferLength - 1)) * dimensions.width)
      .y((d) => dimensions.height / 2 - (d / 255) * (dimensions.height / 2))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(dataArray)
      .attr('fill', 'none')
      .attr('stroke', '#00ff00')
      .attr('stroke-width', 2)
      .attr('d', line);
  };

  const drawCircles = (
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    bufferLength: number,
    dataArray: Uint8Array,
  ) => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const maxRadius = Math.min(dimensions.width, dimensions.height) / 4;

    const circleData = dataArray.slice(0, 20); // Limit to 20 circles
    svg
      .selectAll('circle')
      .data(circleData)
      .enter()
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', (d) => (d / 255) * maxRadius)
      .attr('fill', 'none')
      .attr(
        'stroke',
        (_, i) => `hsl(${(i * 360) / circleData.length}, 100%, 50%)`,
      )
      .attr('stroke-width', 2)
      .attr(
        'transform',
        (_, i) =>
          `rotate(${(i / circleData.length) * 360}, ${centerX}, ${centerY})`,
      );
  };

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

  // Restart visualization when fftSize or visualizationType changes
  useEffect(() => {
    if (analyserRef.current && audioContextRef.current && isPlaying) {
      analyserRef.current.fftSize = fftSize;
      startVisualization();
    }
  }, [fftSize, visualizationType, isPlaying]);

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

  return (
    <div className='container'>
      <h1>Music Visualizer</h1>

      <div className='controls'>
        <button onClick={startMicAudio} disabled={isPlaying || !!audioElement}>
          Use Microphone/System Audio
        </button>

        <input
          type='file'
          accept='audio/*'
          ref={fileInputRef}
          onChange={handleFileUpload}
          className='file-input'
        />

        <select
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
          value={fftSize}
          onChange={(e) => setFftSize(Number(e.target.value))}
        >
          <option value={256}>Low Detail (256)</option>
          <option value={512}>Medium Detail (512)</option>
          <option value={1024}>High Detail (1024)</option>
        </select>
      </div>

      {audioElement && (
        <div className='playback-controls'>
          <button onClick={playAudio} disabled={isPlaying}>
            Play
          </button>
          <button onClick={pauseAudio} disabled={!isPlaying}>
            Pause
          </button>
          <button onClick={stopAudio}>Stop</button>

          <div className='volume-control'>
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

          <div className='seek-control'>
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

      {error && <div className='error'>{error}</div>}

      <svg ref={svgRef} className='canvas' />
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}
