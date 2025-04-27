import { useMemo, useRef, useState } from 'react';
import { Copy, CheckCheck } from 'lucide-react';

interface TranscriptionDisplayProps {
  transcription: string;
  currentTime: number;
  duration?: number;
  onSeekTo?: (time: number) => void;
}

interface Word {
  text: string;
  isActive: boolean;
  startTime?: number; // Estimated start time
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ 
  transcription, 
  currentTime,
  duration = 0,
  onSeekTo 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  
  // In a real implementation, transcription would have timing information
  // For this demo, we'll simulate active words based on current time
  const words = useMemo(() => {
    if (!transcription) return [];
    
    const allWords = transcription.split(' ').filter(word => word.trim() !== '');
    const wordsPerSecond = 2; // Approximate
    const currentWordIndex = Math.floor(currentTime * wordsPerSecond) % allWords.length;
    
    // Estimate time for each word based on total duration and word count
    const wordDuration = duration / allWords.length;
    
    return allWords.map((word, index) => ({
      text: word,
      isActive: index === currentWordIndex,
      startTime: index * wordDuration // Estimated start time
    }));
  }, [transcription, currentTime, duration]);
  
  // Copy transcription to clipboard
  const copyToClipboard = () => {
    if (!transcription) return;
    
    navigator.clipboard.writeText(transcription).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Handle seeking to word's time
  const handleWordClick = (startTime?: number) => {
    if (startTime !== undefined && onSeekTo) {
      onSeekTo(startTime);
    }
  };

  if (!transcription) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        No transcription available for this audio.
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Transcription header with controls */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Transcription</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            title="Copy transcription"
          >
            {copied ? <CheckCheck size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
      
      {/* Transcription content - single scrollable container */}
      <div 
        ref={containerRef} 
        className="p-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        role="region"
        aria-label="Audio transcription"
        tabIndex={0}
      >
        <p className="leading-relaxed">
          {words.map((word, index) => (
            <span
              key={index}
              onClick={() => handleWordClick(word.startTime)}
              className={`inline-block mx-0.5 py-0.5 px-1 rounded transition-all duration-200 ${
                word.isActive
                  ? 'text-primary-700 font-medium bg-primary-50'
                  : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
              }`}
              title="Click to jump to this part"
            >
              {word.text}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};