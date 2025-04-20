import { useEffect, useRef, useState } from 'react';
import AudioPlayer from '../components/audio/AudioPlayer';
import TranscriptionDisplay from '../components/audio/TranscriptionDisplay';

// Mock transcription script (split into words for demo)
const MOCK_TRANSCRIPTION = `This is a demo of real-time transcription. As the audio plays, words will appear here in sync with the playback.`.split(' ');

const AUDIO_URL = '/demo-audio.mp3'; // Place your audio file in the public/ folder

const DemoAudioPlayer = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate real-time transcription (1 word every 400ms while playing)
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex((prev) => {
          if (prev < MOCK_TRANSCRIPTION.length) {
            return prev + 1;
          } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }
        });
      }, 400);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  // Reset transcription when audio is restarted
  const handleAudioPlay = () => {
    setIsPlaying(true);
  };
  const handleAudioPause = () => {
    setIsPlaying(false);
  };
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentWordIndex(MOCK_TRANSCRIPTION.length);
  };
  const handleAudioSeeked = () => {
    setCurrentWordIndex(0);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Demo Audio Player with Waveform & Real-Time Transcription</h1>
      <div className="mb-6">
        {/* Use your existing AudioPlayer component, or fallback to native audio */}
        <AudioPlayer
          audioUrl={AUDIO_URL}
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
          onEnded={handleAudioEnded}
          audioRef={audioRef}
        />
        {/* Native audio element for demo if needed */}
        {/* <audio ref={audioRef} src={AUDIO_URL} controls onPlay={handleAudioPlay} onPause={handleAudioPause} onEnded={handleAudioEnded} onSeeked={handleAudioSeeked} /> */}
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Real-Time Transcription</h2>
        {/* Use your existing TranscriptionDisplay component if it accepts text as prop */}
        <TranscriptionDisplay transcription={MOCK_TRANSCRIPTION.slice(0, currentWordIndex).join(' ')} />
      </div>
      <div className="mt-8 text-gray-500 text-sm">
        <p>To test, place an audio file named <b>demo-audio.mp3</b> in your <b>public/</b> folder.</p>
      </div>
    </div>
  );
};

export default DemoAudioPlayer;
