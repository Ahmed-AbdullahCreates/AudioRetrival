import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { TranscriptionDisplay } from './TranscriptionDisplay';

interface AudioPlayerProps {
  audioUrl: string;
  transcription?: string | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, transcription }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (waveformRef.current) {
      // Create WaveSurfer instance
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#6366f1',
        progressColor: '#4338ca',
        cursorColor: '#312e81',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 80,
        barGap: 2,
        responsive: true,
      });

      // Load audio
      wavesurfer.load(audioUrl);

      // Event listeners
      wavesurfer.on('ready', () => {
        wavesurferRef.current = wavesurfer;
        setIsLoading(false);
        setDuration(wavesurfer.getDuration());
      });

      wavesurfer.on('play', () => setIsPlaying(true));
      wavesurfer.on('pause', () => setIsPlaying(false));
      wavesurfer.on('audioprocess', () => {
        setCurrentTime(wavesurfer.getCurrentTime());
      });

      // Cleanup
      return () => {
        wavesurfer.destroy();
      };
    }
  }, [audioUrl]);

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Waveform */}
        <div className="relative">
          <div 
            ref={waveformRef} 
            className={`w-full ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={togglePlayPause}
              className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition"
              disabled={isLoading}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button 
              onClick={toggleMute}
              className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              disabled={isLoading}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Transcription */}
      {transcription && (
        <div className="mt-6 pb-2">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Transcription</h3>
          <TranscriptionDisplay 
            transcription={transcription} 
            currentTime={currentTime} 
          />
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;