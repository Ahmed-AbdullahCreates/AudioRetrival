import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronRight, Clock } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import CategoryCard from '../components/category/CategoryCard';
import AudioCard from '../components/audio/AudioCard';

const HomePage = () => {
  const { categories, audios, fetchCategories, fetchAudios, isLoading } = useAppStore();
  
  useEffect(() => {
    // Fetch categories and latest audios for the homepage
    fetchCategories();
    fetchAudios();
  }, [fetchCategories, fetchAudios]);

  // Filter out the technology, entertainment, and sound effects categories
  const filteredCategories = categories.filter(category => 
    !['Technology', 'Entertainment', 'Sound Effects'].includes(category.title)
  );
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8 sm:p-12 mb-12">
        <div className="max-w-lg">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Discover, Upload, and Share Audio Content
          </h1>
          <p className="text-primary-100 mb-6">
            Explore a world of sounds, from music to podcasts, audiobooks and more. Upload your own audio or browse our collection.
          </p>
          <div className="space-x-4">
            <Link
              to="/search"
              className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-primary-600"
            >
              <Play size={16} className="mr-1" />
              Browse Audios
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center px-5 py-2 border border-white text-sm font-medium rounded-full shadow-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-primary-600"
            >
              Upload Now
            </Link>
          </div>
        </div>
        
        <div className="absolute right-0 lg:right-12 bottom-0 opacity-10 sm:opacity-20">
          <svg viewBox="0 0 24 24" fill="white" className="w-48 h-48 sm:w-64 sm:h-64" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        </div>
      </div>
      
      {/* Unified categories section */}
      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {filteredCategories.map(category => (
            <CategoryCard key={category.id} category={category} size="large" />
          ))}
          
          {filteredCategories.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center">
              <p className="text-gray-500">No categories found. Check back later!</p>
            </div>
          )}
          
          {isLoading && filteredCategories.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Loading categories...</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Featured audios section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Clock className="mr-2 text-primary-600" size={24} />
            Latest Uploads
          </h2>
          <Link
            to="/search"
            className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center"
          >
            View all
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audios.slice(0, 6).map(audio => (
            <AudioCard key={audio.id} audio={audio} />
          ))}
          
          {audios.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center">
              <p className="text-gray-500">No audios found. Be the first to upload!</p>
              <Link
                to="/upload"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Upload Audio
              </Link>
            </div>
          )}
          
          {isLoading && audios.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Loading audios...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;