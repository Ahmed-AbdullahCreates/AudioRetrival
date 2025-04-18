import { useMemo } from 'react';

interface TranscriptionDisplayProps {
  transcription: string;
  currentTime: number;
}

interface Word {
  text: string;
  isActive: boolean;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ 
  transcription, 
  currentTime 
}) => {
  // In a real implementation, transcription would have timing information
  // For this demo, we'll simulate active words based on current time
  const words = useMemo(() => {
    const allWords = transcription.split(' ');
    const wordsPerSecond = 2; // Approximate
    const currentWordIndex = Math.floor(currentTime * wordsPerSecond) % allWords.length;
    
    return allWords.map((word, index) => ({
      text: word,
      isActive: index === currentWordIndex,
    }));
  }, [transcription, currentTime]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
      <p className="leading-relaxed">
        {words.map((word, index) => (
          <span 
            key={index}
            className={`inline-block mx-0.5 transition-opacity duration-200 ${
              word.isActive 
                ? 'text-primary-700 font-medium'
                : 'text-gray-600 opacity-70'
            }`}
          >
            {word.text}
          </span>
        ))}
      </p>
    </div>
  );
};