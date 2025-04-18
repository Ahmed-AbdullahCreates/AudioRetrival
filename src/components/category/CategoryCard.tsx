import { Link } from 'react-router-dom';
import type { Category } from '../../types';
import { Music, BookOpen, Radio, Mic, Headphones, FileAudio } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { id, title } = category;
  
  // Map category titles to icons
  const getCategoryIcon = () => {
    switch (title.toLowerCase()) {
      case 'music':
        return <Music size={24} />;
      case 'audiobook':
      case 'books':
        return <BookOpen size={24} />;
      case 'podcast':
      case 'podcasts':
        return <Mic size={24} />;
      case 'quran':
      case 'religious':
        return <BookOpen size={24} />;
      case 'radio':
        return <Radio size={24} />;
      default:
        return <FileAudio size={24} />;
    }
  };
  
  // Get a background color based on the category
  const getBackgroundClass = () => {
    const colors = [
      'bg-primary-100 text-primary-600',
      'bg-secondary-100 text-secondary-600',
      'bg-accent-100 text-accent-600',
      'bg-purple-100 text-purple-600',
      'bg-green-100 text-green-600',
      'bg-rose-100 text-rose-600',
    ];
    
    return colors[id % colors.length];
  };

  return (
    <Link
      to={`/category/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition duration-200"
    >
      <div className={`flex aspect-square items-center justify-center ${getBackgroundClass()}`}>
        <div className="transform group-hover:scale-110 transition duration-300">
          {getCategoryIcon()}
        </div>
      </div>
      <div className="p-4 flex-1 flex items-center justify-center">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 text-center group-hover:text-primary-600 transition">
          {title}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryCard;