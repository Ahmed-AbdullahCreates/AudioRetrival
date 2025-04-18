import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import SearchFilters from '../components/search/SearchFilters';
import AudioCard from '../components/audio/AudioCard';
import { Leaf, Search, Filter, SlidersHorizontal, Tag } from 'lucide-react';

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { audios, categories, tags, fetchAudios, fetchCategories, fetchTags, isLoading } = useAppStore();
  const [isFiltering, setIsFiltering] = useState(false);
  
  useEffect(() => {
    setIsFiltering(true);
    
    const searchParams = {
      title: queryParams.get('q') || undefined,
      category_id: queryParams.get('category') ? parseInt(queryParams.get('category')!) : undefined,
      tags_ids: queryParams.get('tags') ? queryParams.get('tags')!.split(',').map(Number) : undefined,
    };
    
    // Ensure categories and tags are loaded for filter display
    if (categories.length === 0) fetchCategories();
    if (tags.length === 0) fetchTags();
    
    fetchAudios(searchParams).finally(() => {
      // Add a small delay to show loading transition
      setTimeout(() => setIsFiltering(false), 300);
    });
  }, [location.search, fetchAudios, categories.length, tags.length, fetchCategories, fetchTags]);
  
  const title = queryParams.get('q');
  const hasFilters = queryParams.toString().length > 0;
  const categoryId = queryParams.get('category') ? parseInt(queryParams.get('category')) : null;
  const tagIds = queryParams.get('tags') ? queryParams.get('tags').split(',').map(Number) : [];
  
  // Get category and tag names for display
  const categoryName = categoryId 
    ? categories.find(cat => cat.id === categoryId)?.title 
    : null;
    
  const tagNames = tagIds.length > 0 
    ? tags.filter(tag => tagIds.includes(tag.id)).map(tag => tag.name) 
    : [];
  
  // Construct search summary
  const getSearchSummary = () => {
    const parts = [];
    
    if (title) parts.push(`"${title}"`);
    if (categoryName) parts.push(`in category "${categoryName}"`);
    if (tagNames.length > 0) parts.push(`with tags ${tagNames.map(t => `"${t}"`).join(', ')}`);
    
    return parts.length > 0 ? parts.join(' ') : 'All audio files';
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
          <Search size={14} />
          <span>Search results</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {hasFilters ? getSearchSummary() : 'Browse All Audio Files'}
        </h1>
      </div>
      
      <SearchFilters />
      
      {/* Filter summary */}
      {hasFilters && (
        <div className="flex items-center mb-6 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
          <SlidersHorizontal size={16} className="text-blue-600 mr-2" />
          <div className="text-sm text-blue-800">
            <span className="font-medium">Filtered by:</span> {getSearchSummary()}
            <span className="ml-2 text-blue-600">({audios.length} results)</span>
          </div>
        </div>
      )}
      
      {isLoading || isFiltering ? (
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
        <div className="transition-opacity duration-300">
          {audios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {audios.map(audio => (
                <AudioCard key={audio.id} audio={audio} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                {hasFilters ? <Filter className="h-8 w-8 text-gray-500" /> : <Leaf className="h-8 w-8 text-gray-500" />}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No audios found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {hasFilters
                  ? "We couldn't find any audios matching your search criteria. Try adjusting your filters or search terms."
                  : "There are no audios available yet. Be the first to upload!"}
              </p>
              {hasFilters && (
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-sm text-gray-500">You searched for:</div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-md">
                    {title && (
                      <div className="inline-flex items-center bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm">
                        <Search size={12} className="mr-1.5" />
                        <span>{title}</span>
                      </div>
                    )}
                    
                    {categoryName && (
                      <div className="inline-flex items-center bg-primary-50 text-primary-700 rounded-full px-3 py-1 text-sm">
                        <span className="w-2 h-2 rounded-full bg-primary-500 mr-1.5"></span>
                        <span>{categoryName}</span>
                      </div>
                    )}
                    
                    {tagNames.map((tagName, index) => (
                      <div 
                        key={index}
                        className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm"
                      >
                        <Tag size={12} className="mr-1.5" />
                        <span>{tagName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Result count summary */}
      {!isLoading && !isFiltering && audios.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {audios.length} {audios.length === 1 ? 'result' : 'results'}
        </div>
      )}
    </div>
  );
};

export default SearchPage;