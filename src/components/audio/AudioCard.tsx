import { Play, Pause, Clock, Tag, MoreHorizontal, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import type { Audio, Tag as TagType } from '../../types';
import { getCategoryIcon, getCategoryColorClass } from '../../components/category/CategoryUtils';

interface AudioCardProps {
  audio: Audio;
  compact?: boolean;
}

const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const AudioCard: React.FC<AudioCardProps> = ({ audio, compact = false }) => {
  const { id, title, description, category_title, category_id, audioUrl, uploaded_at, tags } = audio;
  const [audioDuration, setAudioDuration] = useState<string>(audio.duration || '0:00');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playProgress, setPlayProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (audioUrl) {
      const audioElement = new Audio(audioUrl);
      audioRef.current = audioElement;
      
      audioElement.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(audioElement.duration / 60);
        const seconds = Math.floor(audioElement.duration % 60);
        setAudioDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      });
      
      audioElement.addEventListener('ended', () => {
        setIsPlaying(false);
        setPlayProgress(0);
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      });
    }
    
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [audioUrl]);

  // Handle play/pause toggle
  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      audioRef.current.play();
      progressIntervalRef.current = window.setInterval(() => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setPlayProgress(progress);
        }
      }, 100);
    }
    setIsPlaying(!isPlaying);
  };

  const formattedDate = new Date(uploaded_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const truncatedDescription = description && description.length > 100
    ? `${description.substring(0, 100)}...`
    : description;

  const categoryColors = getCategoryColorClass({ id: category_id, title: category_title });
  const formattedCategoryTitle = category_title ? capitalizeFirstLetter(category_title) : '';
  
  // Display max 3 tags and show an indicator if there are more
  const visibleTags = tags && tags.length > 0 ? tags.slice(0, 3) : [];
  const hasMoreTags = tags && tags.length > 3;

  // Function to get tag name from tag object (handles both 'name' and 'title' properties)
  const getTagName = (tag: any): string => {
    return tag.name || tag.title || 'Unknown';
  };
  
  // Generate a simple "waveform" for visual representation
  const generateWaveform = () => {
    // Increased number of segments for a wider waveform
    const waveSegments = 36;
    return Array.from({ length: waveSegments }, (_, i) => {
      // Create varying heights with a pattern
      const height = 10 + Math.sin(i / 2) * 10 + Math.random() * 15;
      const isActive = (playProgress / 100) * waveSegments > i;
      
      return (
        <div 
          key={i} 
          className={`w-1 rounded-full transition-all duration-300 ${
            isActive ? 'bg-primary-500' : 'bg-gray-200 group-hover:bg-gray-300'
          }`}
          style={{ height: `${height}px` }}
        ></div>
      );
    });
  };

  if (compact) {
    return (
      <div className="group relative">
        <Link 
          to={`/audio/${id}`}
          className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 border border-gray-100 hover:border-primary-200 relative overflow-hidden"
          aria-labelledby={`audio-title-${id}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center relative">
            <button 
              onClick={togglePlay}
              className="w-10 h-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
            >
              {isPlaying ? (
                <Pause size={16} className="text-primary-600 group-hover:text-primary-700" />
              ) : (
                <Play size={16} className="text-primary-600 group-hover:text-primary-700" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h3 
                id={`audio-title-${id}`} 
                className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-700 transition-colors"
              >
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors}`}>
                  {getCategoryIcon({ id: category_id, title: category_title }, 12)}
                  <span className="ml-1">{formattedCategoryTitle}</span>
                </span>
                <span className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {audioDuration}
                </span>
              </div>
            </div>
          </div>
          
          {/* Mini waveform visualization */}
          {isPlaying && (
            <div className="mt-2 px-2 h-6 flex items-center gap-[2px]">
              {generateWaveform()}
            </div>
          )}
          
          {/* Tags */}
          {visibleTags.length > 0 && !isPlaying && (
            <div className="mt-2 flex flex-wrap gap-1">
              {visibleTags.map((tag: any, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {getTagName(tag)}
                </span>
              ))}
              {hasMoreTags && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  <MoreHorizontal size={10} className="mr-1" />
                  {tags!.length - 3}
                </span>
              )}
            </div>
          )}
        </Link>
        
        {/* Progress indicator */}
        {playProgress > 0 && (
          <div className="absolute bottom-0 left-0 h-1 bg-primary-600 rounded-b-lg" style={{ width: `${playProgress}%` }} />
        )}
      </div>
    );
  }

  return (
    <div className="group relative">
      <Link 
        to={`/audio/${id}`}
        className="block bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] relative"
        aria-labelledby={`audio-title-large-${id}`}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${categoryColors} transition-all duration-300 group-hover:scale-105`}>
              {getCategoryIcon({ id: category_id, title: category_title }, 14)}
              <span className="ml-1.5 text-sm font-medium">{formattedCategoryTitle}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock size={12} className="mr-1" />
              {formattedDate}
            </div>
          </div>
          
          <h3 
            id={`audio-title-large-${id}`}
            className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors"
          >
            {title}
          </h3>
          
          {truncatedDescription && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{truncatedDescription}</p>
          )}
          
          {/* Audio waveform visualization - always visible on larger card */}
          <div className="h-14 flex items-center gap-[2px] mb-4 px-2 py-2 bg-gray-50 rounded-md">
            <button
              onClick={togglePlay}
              className={`p-2 mr-2 rounded-full ${
                isPlaying 
                  ? 'bg-primary-600 text-white hover:bg-primary-700' 
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              } transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
            >
              {isPlaying ? (
                <Pause size={18} />
              ) : (
                <Play size={18} />
              )}
            </button>
            <div className="flex-1 h-full flex items-center gap-[3px]">
              {generateWaveform()}
            </div>
            <Volume2 size={16} className="text-gray-400 ml-2" />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-600">
              {audioDuration}
            </span>
            
            {/* Tags */}
            <div className="flex items-center flex-wrap gap-1 justify-end">
              {visibleTags.map((tag: any, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Tag size={10} className="mr-1" />
                  {getTagName(tag)}
                </span>
              ))}
              {hasMoreTags && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  <MoreHorizontal size={10} className="mr-1" />
                  {tags!.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Progress indicator */}
      {playProgress > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-primary-600 rounded-b-lg" style={{ width: `${playProgress}%` }} />
      )}
    </div>
  );
};

export default AudioCard;