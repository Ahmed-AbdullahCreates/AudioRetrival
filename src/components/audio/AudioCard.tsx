import { Play, Clock, Tag, User, Music, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Audio } from '../../types';

interface AudioCardProps {
  audio: Audio;
  compact?: boolean;
}

const AudioCard: React.FC<AudioCardProps> = ({ audio, compact = false }) => {
  const { id, title, description, category_title, tags, uploaded_at, author, duration } = audio;
  
  const formattedDate = uploaded_at ? new Date(uploaded_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : 'Unknown date';

  // Truncate description if needed
  const truncatedDescription = description && description.length > 100
    ? `${description.substring(0, 100)}...`
    : description;

  // Generate a simple visualization pattern (mock waveform)
  const generateWavePattern = () => {
    const pattern = [];
    for (let i = 0; i < 20; i++) {
      const height = Math.random() * 100;
      pattern.push(height);
    }
    return pattern;
  };
  
  const wavePattern = generateWavePattern();

  if (compact) {
    return (
      <Link 
        to={`/audio/${id}`}
        className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-3 border border-gray-100 hover:border-primary-300"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <Play size={16} className="text-primary-600 ml-1" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Tag size={10} className="mr-1" />
              <span className="truncate">{category_title}</span>
              {duration && (
                <>
                  <span className="mx-1">•</span>
                  <Clock size={10} className="mr-1" />
                  <span>{duration}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/audio/${id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px] border border-gray-100 hover:border-primary-200 overflow-hidden"
    >
      {/* Audio visualization preview */}
      <div className="h-12 bg-gradient-to-r from-primary-50 to-primary-100 flex items-end px-2 py-1">
        {wavePattern.map((height, index) => (
          <div 
            key={index} 
            className="w-1 mx-0.5 bg-primary-400 rounded-t"
            style={{ height: `${height / 4}px` }}
          ></div>
        ))}
        <div className="ml-auto bg-white bg-opacity-80 rounded-full p-1">
          <Play size={12} className="text-primary-600" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full flex items-center">
            <Music size={12} className="mr-1.5" />
            {category_title}
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <Clock size={12} className="mr-1" />
            {formattedDate}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{title}</h3>
        
        {truncatedDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{truncatedDescription}</p>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 group-hover:bg-primary-200">
              <Play size={14} className="text-primary-600 ml-0.5" />
            </div>
            <span className="text-sm font-medium text-primary-600">Play now</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {author && (
              <div className="flex items-center text-xs text-gray-500">
                <User size={12} className="mr-1" />
                <span className="truncate max-w-[80px]">{author}</span>
              </div>
            )}
            
            {tags && tags.length > 0 && (
              <div className="flex items-center">
                <Tag size={12} className="text-gray-400 mr-1" />
                <div className="flex space-x-1 overflow-hidden">
                  {tags.slice(0, 2).map((tag) => (
                    <span key={tag.id} className="text-xs text-gray-500 truncate">
                      {tag.name}
                    </span>
                  ))}
                  {tags.length > 2 && (
                    <span className="text-xs text-gray-500">+{tags.length - 2}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AudioCard;