import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import AudioCard from '../components/audio/AudioCard';
import { ArrowLeft, Leaf } from 'lucide-react';

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { categories, audios, fetchAudios, isLoading } = useAppStore();
  
  useEffect(() => {
    if (audios.length === 0) {
      fetchAudios();
    }
  }, [fetchAudios, audios.length]);
  
  const category = id ? categories.find(c => 
    c.id === parseInt(id) || c.slug === id
  ) : null;
  
  // Filter audios by the current category
  const filteredAudios = useMemo(() => {
    if (!category) return [];
    
    return audios.filter(audio => {
      // Match either by category_id or by category_title
      return (
        audio.category_id === category.id ||
        (audio.category_title && audio.category_title.toLowerCase() === category.title.toLowerCase())
      );
    });
  }, [audios, category]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Home
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {category ? category.title : 'Category'}
        </h1>
        <p className="text-gray-600">
          Browse all audio files in this category
        </p>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-lg overflow-hidden shadow">
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {filteredAudios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAudios.map(audio => (
                <AudioCard key={audio.id} audio={audio} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Leaf className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No audios in this category</h3>
              <p className="text-gray-500 mb-6">
                There are no audios available in this category yet.
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Upload Audio
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;