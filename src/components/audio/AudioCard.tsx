import { Play, Clock, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Audio } from '../../types';
import { getCategoryIcon, getCategoryColorClass } from '../../components/category/CategoryUtils';

interface AudioCardProps {
  audio: Audio;
  compact?: boolean;
}

const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const AudioCard: React.FC<AudioCardProps> = ({ audio, compact = false }) => {
  const { id, title, description, category_title, category_id, audioUrl, uploaded_at } = audio;
  const [audioDuration, setAudioDuration] = useState<string>(audio.duration || '0:00');
  
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        setAudioDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      });
    }
  }, [audioUrl]);

  const formattedDate = new Date(uploaded_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const truncatedDescription = description && description.length > 100
    ? `${description.substring(0, 100)}...`
    : description;

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = title || 'audio-file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const categoryColors = getCategoryColorClass({ id: category_id, title: category_title });
  const formattedCategoryTitle = category_title ? capitalizeFirstLetter(category_title) : '';

  if (compact) {
    return (
      <Link 
        to={`/audio/${id}`}
        className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 border border-gray-100 hover:border-primary-200 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center relative">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
            <Play size={16} className="text-primary-600 group-hover:text-primary-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-700 transition-colors">{title}</h3>
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
        <button
          onClick={handleDownload}
          className="absolute bottom-2 right-3 p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-all duration-300"
          title="Download audio"
        >
          <Download size={14} />
        </button>
      </Link>
    );
  }

  return (
    <Link 
      to={`/audio/${id}`}
      className="group block bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] relative"
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
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">{title}</h3>
        
        {truncatedDescription && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{truncatedDescription}</p>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center group/play">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center mr-3 group-hover/play:scale-110 group-hover/play:bg-primary-200 transition-all duration-300">
              <Play size={16} className="text-primary-600 group-hover/play:text-primary-700" />
            </div>
            <span className="text-sm font-medium text-primary-600 group-hover/play:text-primary-700">
              {audioDuration}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-all duration-300"
              title="Download audio"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AudioCard;