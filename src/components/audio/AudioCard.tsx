import { Play, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Audio } from '../../types';

interface AudioCardProps {
  audio: Audio;
  compact?: boolean;
}

const AudioCard: React.FC<AudioCardProps> = ({ audio, compact = false }) => {
  const { id, title, description, category_title, tags, uploaded_at } = audio;
  
  const formattedDate = new Date(uploaded_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Truncate description if needed
  const truncatedDescription = description && description.length > 100
    ? `${description.substring(0, 100)}...`
    : description;

  if (compact) {
    return (
      <Link 
        to={`/audio/${id}`}
        className="block bg-white rounded-lg shadow-sm hover:shadow-md transition p-3 border border-gray-100"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <Play size={16} className="text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
            <p className="text-xs text-gray-500">{category_title}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/audio/${id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition duration-200 hover:translate-y-[-2px]"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium px-2 py-1 bg-primary-50 text-primary-700 rounded-full">
            {category_title}
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <Clock size={12} className="mr-1" />
            {formattedDate}
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        
        {truncatedDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{truncatedDescription}</p>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
              <Play size={14} className="text-primary-600" />
            </div>
            <span className="text-sm font-medium text-primary-600">Play audio</span>
          </div>
          
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
    </Link>
  );
};

export default AudioCard;