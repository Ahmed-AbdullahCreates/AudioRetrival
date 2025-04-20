import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Download, Share2 } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { TranscriptionDisplay } from './TranscriptionDisplay';

interface AudioPlayerProps {
  audioUrl: string;
  transcription?: string | null;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  audioRef?: React.RefObject<HTMLAudioElement>;
  title?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  transcription, 
  onPlay,
  onPause,
  onEnded,
  audioRef,
  title 
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (waveformRef.current) {
      // Create WaveSurfer instance
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(99, 102, 241, 0.4)',
        progressColor: '#4338ca',
        cursorColor: '#312e81',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 80,
        barGap: 2,
        responsive: true,
        normalize: true,
      });

      // Handle responsiveness
      const handleResize = () => {
        wavesurfer.empty();
        wavesurfer.load(audioUrl);
      };
      window.addEventListener('resize', handleResize);

      // Load audio
      wavesurfer.load(audioUrl);
      
      // Set initial volume
      wavesurfer.setVolume(volume);

      // Event listeners
      wavesurfer.on('ready', () => {
        wavesurferRef.current = wavesurfer;
        setIsLoading(false);
        setDuration(wavesurfer.getDuration());
      });

      wavesurfer.on('play', () => {
        setIsPlaying(true);
        if (onPlay) onPlay();
      });

      wavesurfer.on('pause', () => {
        setIsPlaying(false);
        if (onPause) onPause();
      });

      wavesurfer.on('finish', () => {
        setIsPlaying(false);
        if (onEnded) onEnded();
      });

      wavesurfer.on('audioprocess', () => {
        setCurrentTime(wavesurfer.getCurrentTime());
      });

      wavesurfer.on('seek', () => {
        setCurrentTime(wavesurfer.getCurrentTime());
      });

      // Cleanup - removed duplicate cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        wavesurfer.destroy();
      };
    }
  }, [audioUrl, onPlay, onPause, onEnded]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const toggleMute = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
  };

  const handleSkipBackward = () => {
    if (wavesurferRef.current) {
      const newTime = Math.max(0, wavesurferRef.current.getCurrentTime() - 10);
      wavesurferRef.current.seekTo(newTime / duration);
      setCurrentTime(newTime);
    }
  };

  const handleSkipForward = () => {
    if (wavesurferRef.current) {
      const newTime = Math.min(duration, wavesurferRef.current.getCurrentTime() + 10);
      wavesurferRef.current.seekTo(newTime / duration);
      setCurrentTime(newTime);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(rate);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = title || 'audio-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col space-y-4">
        {title && (
          <div className="text-center">
            <h2 className="text-xl font-medium text-gray-800">{title}</h2>
          </div>
        )}
        
        {/* Waveform */}
        <div className="relative">
          <div 
            ref={waveformRef} 
            className={`w-full h-20 ${isLoading ? 'opacity-50' : 'opacity-100'} rounded-lg overflow-hidden bg-gray-50`}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>

        {/* Time display */}
        <div className="flex justify-between items-center text-xs text-gray-500 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleSkipBackward}
              className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              disabled={isLoading}
              aria-label="Skip backward 10 seconds"
            >
              <SkipBack size={16} />
            </button>
            
            <button 
              onClick={togglePlayPause}
              className="p-3 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition transform hover:scale-105"
              disabled={isLoading}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button 
              onClick={handleSkipForward}
              className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              disabled={isLoading}
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward size={16} />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Volume Controls */}
            <div className="flex items-center space-x-1">
              <button 
                onClick={toggleMute}
                className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                disabled={isLoading}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 accent-primary-600"
                aria-label="Volume"
              />
            </div>
            
            {/* Speed Control */}
            {/* <div className="flex items-center">
              <select 
                value={playbackRate} 
                onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                className="text-xs bg-gray-100 border-0 rounded p-1 text-gray-700 focus:ring-primary-500"
                aria-label="Playback speed"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div> */}
            
            {/* Download Button */}
            {/* <button 
              onClick={handleDownload}
              className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              aria-label="Download audio"
            >
              <Download size={16} />
            </button> */}
            
            {/* Share Button */}
            {/* <button 
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              aria-label="Share"
            >
              <Share2 size={16} />
            </button> */}
          </div>
        </div>
      </div>

      {/* Transcription */}
      {transcription && (
        <div className="mt-6 pb-2 border-t pt-4 border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            Transcription
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
            <TranscriptionDisplay 
              transcription={transcription} 
              currentTime={currentTime} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;