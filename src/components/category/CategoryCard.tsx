import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import type { Category } from '../../types';
import { 
  Music, BookOpen, Radio, Mic, Headphones, FileAudio, 
  Film, Cpu, Volume2, Play, ArrowRight
} from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  size?: 'small' | 'medium' | 'large';
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, size = 'medium' }) => {
  const { id, title, description, color, icon } = category;
  const { audios } = useAppStore();
  
  // Calculate dynamic count based on actual audios in this category
  const dynamicCount = audios.filter(audio => {
    // Match either by category_id or by category_title
    return (
      audio.category_id === id ||
      (audio.category_title && audio.category_title.toLowerCase() === title.toLowerCase())
    );
  }).length;
  
  // Map category icons based on the icon property or title
  const getCategoryIcon = (iconSize: number = 24) => {
    // If icon is provided directly in the category data, use that
    if (icon) {
      switch (icon.toLowerCase()) {
        case 'music': return <Music size={iconSize} />;
        case 'book': return <BookOpen size={iconSize} />;
        case 'book-open': return <BookOpen size={iconSize} />;
        case 'mic': return <Mic size={iconSize} />;
        case 'headphones': return <Headphones size={iconSize} />;
        case 'file-audio': return <FileAudio size={iconSize} />;
        case 'radio': return <Radio size={iconSize} />;
        case 'film': return <Film size={iconSize} />;
        case 'cpu': return <Cpu size={iconSize} />;
        case 'wave': return <Volume2 size={iconSize} />;
        case 'volume2': return <Volume2 size={iconSize} />;
        default: return <FileAudio size={iconSize} />;
      }
    }
    
    // Fallback to determining icon by title
    switch (title.toLowerCase()) {
      case 'music': return <Music size={iconSize} />;
      case 'audiobook':
      case 'audiobooks':
      case 'books': return <BookOpen size={iconSize} />;
      case 'podcast':
      case 'podcasts': return <Mic size={iconSize} />;
      case 'quran':
      case 'religious': return <BookOpen size={iconSize} />;
      case 'radio': return <Radio size={iconSize} />;
      case 'entertainment': return <Film size={iconSize} />;
      case 'technology': return <Cpu size={iconSize} />;
      case 'sound effects': return <Volume2 size={iconSize} />;
      default: return <FileAudio size={iconSize} />;
    }
  };
  
  // Get background color class based on the color property or ID
  const getColorClasses = () => {
    if (color) {
      // Use explicit class names rather than string concatenation
      switch (color.toLowerCase()) {
        case 'blue': return 'bg-blue-100 text-blue-600';
        case 'green': return 'bg-green-100 text-green-600';
        case 'purple': return 'bg-purple-100 text-purple-600';
        case 'pink': return 'bg-pink-100 text-pink-600';
        case 'amber': return 'bg-amber-100 text-amber-600';
        case 'indigo': return 'bg-indigo-100 text-indigo-600';
        case 'teal': return 'bg-teal-100 text-teal-600';
        case 'orange': return 'bg-orange-100 text-orange-600';
        default: return 'bg-primary-100 text-primary-600';
      }
    }
    
    // Fallback to color by ID
    const colorId = id % 8;
    if (colorId === 0) return 'bg-blue-100 text-blue-600';
    if (colorId === 1) return 'bg-purple-100 text-purple-600';
    if (colorId === 2) return 'bg-amber-100 text-amber-600';
    if (colorId === 3) return 'bg-green-100 text-green-600';
    if (colorId === 4) return 'bg-pink-100 text-pink-600';
    if (colorId === 5) return 'bg-indigo-100 text-indigo-600';
    if (colorId === 6) return 'bg-teal-100 text-teal-600';
    return 'bg-orange-100 text-orange-600';
  };

  // Determine card size class
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'h-24';
      case 'large': return 'h-40';
      case 'medium':
      default: return 'h-32';
    }
  };

  // Simple card with icon
  return (
    <Link
      to={`/category/${category.slug || id}`}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 ${getSizeClasses()}`}
    >
      <div className={`flex items-center justify-center pt-4 ${getColorClasses()}`}>
        <div className="transform group-hover:scale-110 transition-all duration-300">
          {getCategoryIcon(size === 'small' ? 24 : 32)}
        </div>
      </div>
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-center bg-white">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 text-center group-hover:text-primary-600 transition">
          {title}
        </h3>
        
        {description && size !== 'small' && (
          <p className="text-xs text-gray-500 mt-1 text-center line-clamp-1">{description}</p>
        )}
        
        {size !== 'small' && (
          <p className="text-xs text-gray-400 mt-1 text-center">{dynamicCount} {dynamicCount === 1 ? 'file' : 'files'}</p>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard;