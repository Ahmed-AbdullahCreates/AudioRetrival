import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, Filter, X, Tag as TagIcon, ChevronDown, CheckCircle2, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useNavigate, useLocation } from 'react-router-dom';
import type { SearchParams } from '../../types';

const SearchFilters = () => {
  const { categories, tags, fetchCategories, fetchTags } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse existing search params
  const queryParams = new URLSearchParams(location.search);
  
  const [searchParams, setSearchParams] = useState<SearchParams>({
    title: queryParams.get('q') || '',
    category_id: queryParams.get('category') ? parseInt(queryParams.get('category')!) : undefined,
    tags_ids: queryParams.get('tags') ? queryParams.get('tags')!.split(',').map(Number) : [],
  });
  
  // Enhanced UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [activeTagIndex, setActiveTagIndex] = useState(-1);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);
  const [suggestedCategories, setSuggestedCategories] = useState<typeof categories>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Refs for dropdowns and keyboard navigation
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const categorySearchInputRef = useRef<HTMLInputElement>(null);
  const tagSearchInputRef = useRef<HTMLInputElement>(null);
  const tagListRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Ensure categories and tags are loaded
    if (categories.length === 0) {
      fetchCategories();
    }
    if (tags.length === 0) {
      fetchTags();
    }
    
    // Initialize suggested categories with all categories
    setSuggestedCategories(categories);
    
    // Load recent searches from local storage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches).slice(0, 5));
    }
    
    // Add click outside listener to close dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagsDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categories.length, tags.length, fetchCategories, fetchTags]);
  
  useEffect(() => {
    // Filter categories based on search query
    if (categorySearchQuery) {
      const filtered = categories.filter(category => 
        category.title.toLowerCase().includes(categorySearchQuery.toLowerCase())
      );
      setSuggestedCategories(filtered);
      setActiveCategoryIndex(-1); // Reset active index when search changes
    } else {
      setSuggestedCategories(categories);
    }
  }, [categorySearchQuery, categories]);
  
  useEffect(() => {
    // Update search params when URL changes
    setSearchParams({
      title: queryParams.get('q') || '',
      category_id: queryParams.get('category') ? parseInt(queryParams.get('category')!) : undefined,
      tags_ids: queryParams.get('tags') ? queryParams.get('tags')!.split(',').map(Number) : [],
    });
  }, [location.search]);
  
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (searchParams.title) {
      params.set('q', searchParams.title);
      
      // Save to recent searches
      const updatedSearches = [searchParams.title, ...recentSearches.filter(s => s !== searchParams.title)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    }
    
    if (searchParams.category_id) {
      params.set('category', searchParams.category_id.toString());
    }
    
    if (searchParams.tags_ids && searchParams.tags_ids.length > 0) {
      params.set('tags', searchParams.tags_ids.join(','));
    }
    
    navigate({ pathname: '/search', search: params.toString() });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category_id') {
      setSearchParams(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined,
      }));
    } else {
      setSearchParams(prev => ({
        ...prev,
        [name]: value,
      }));
      
      if (name === 'title') {
        setShowSuggestions(value.length > 0);
      }
    }
  };
  
  const handleCategorySelect = (categoryId: number) => {
    setSearchParams(prev => ({
      ...prev,
      category_id: prev.category_id === categoryId ? undefined : categoryId,
    }));
    setShowCategoryDropdown(false);
    setCategorySearchQuery('');
  };
  
  const handleTagSelect = (tagId: number) => {
    setSearchParams(prev => {
      const currentTagIds = prev.tags_ids || [];
      const newTagIds = currentTagIds.includes(tagId)
        ? currentTagIds.filter(id => id !== tagId)
        : [...currentTagIds, tagId];
        
      return {
        ...prev,
        tags_ids: newTagIds,
      };
    });
  };
  
  const handleRecentSearchClick = (searchText: string) => {
    setSearchParams(prev => ({
      ...prev,
      title: searchText
    }));
    setShowSuggestions(false);
    
    // Perform search immediately
    const params = new URLSearchParams(location.search);
    params.set('q', searchText);
    navigate({ pathname: '/search', search: params.toString() });
  };
  
  const handleClearAllTags = () => {
    setSearchParams(prev => ({
      ...prev,
      tags_ids: [],
    }));
    
    const params = new URLSearchParams(location.search);
    params.delete('tags');
    navigate({ pathname: '/search', search: params.toString() });
  };
  
  const clearFilters = () => {
    setSearchParams({
      title: '',
      category_id: undefined,
      tags_ids: [],
    });
    setCategorySearchQuery('');
    setTagSearchQuery('');
    setShowSuggestions(false);
    
    navigate('/search');
  };
  
  const removeCategory = () => {
    setSearchParams(prev => ({
      ...prev,
      category_id: undefined,
    }));
    setCategorySearchQuery('');
    
    const params = new URLSearchParams(location.search);
    params.delete('category');
    navigate({ pathname: '/search', search: params.toString() });
  };
  
  const removeTag = (tagId: number) => {
    setSearchParams(prev => ({
      ...prev,
      tags_ids: prev.tags_ids ? prev.tags_ids.filter(id => id !== tagId) : [],
    }));
    
    const newTagIds = searchParams.tags_ids ? 
      searchParams.tags_ids.filter(id => id !== tagId) : [];
    
    const params = new URLSearchParams(location.search);
    if (newTagIds.length > 0) {
      params.set('tags', newTagIds.join(','));
    } else {
      params.delete('tags');
    }
    
    navigate({ pathname: '/search', search: params.toString() });
  };
  
  // Get the selected category name
  const getSelectedCategoryName = () => {
    if (!searchParams.category_id) return null;
    const category = categories.find(cat => cat.id === searchParams.category_id);
    return category ? category.title : null;
  };
  
  // Get selected tags data
  const getSelectedTags = () => {
    if (!searchParams.tags_ids || searchParams.tags_ids.length === 0) return [];
    return searchParams.tags_ids
      .map(id => tags.find(tag => tag.id === id))
      .filter(tag => tag !== undefined) as typeof tags;
  };
  
  // Filter tags based on search query
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );
  
  // Handle keyboard navigation for tags
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveTagIndex(prev => (prev < filteredTags.length - 1 ? prev + 1 : prev));
      if (tagListRef.current && activeTagIndex >= 0) {
        const activeElement = tagListRef.current.children[activeTagIndex + 1] as HTMLElement;
        if (activeElement) activeElement.scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveTagIndex(prev => (prev > 0 ? prev - 1 : 0));
      if (tagListRef.current && activeTagIndex > 0) {
        const activeElement = tagListRef.current.children[activeTagIndex - 1] as HTMLElement;
        if (activeElement) activeElement.scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter' && activeTagIndex >= 0) {
      e.preventDefault();
      handleTagSelect(filteredTags[activeTagIndex].id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowTagsDropdown(false);
    }
  };
  
  // Handle keyboard navigation for categories
  const handleCategoryKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveCategoryIndex(prev => (prev < suggestedCategories.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveCategoryIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && activeCategoryIndex >= 0) {
      e.preventDefault();
      handleCategorySelect(suggestedCategories[activeCategoryIndex].id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowCategoryDropdown(false);
    }
  };
  
  const hasActiveFilters = searchParams.category_id || (searchParams.tags_ids && searchParams.tags_ids.length > 0);
  
  // Get color for a category
  const getCategoryColor = (category?: typeof categories[0]) => {
    if (!category) return 'primary-500';
    
    // Use a safe approach with predefined color classes
    const id = category.id || 1;
    switch (id % 6) {
      case 1: return 'primary-500';
      case 2: return 'green-500';
      case 3: return 'purple-500';
      case 4: return 'pink-500';
      case 5: return 'amber-500';
      case 0: return 'indigo-500';
      default: return 'gray-500';
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
      <form onSubmit={handleSearch}>
        <div className="flex flex-col md:flex-row gap-3">
          {/* Enhanced Search input with suggestions */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              name="title"
              placeholder="Search audios..."
              value={searchParams.title || ''}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(Boolean(searchParams.title && searchParams.title.length > 0))}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md 
                shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            
            {/* Search suggestions dropdown */}
            {showSuggestions && recentSearches.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <Search size={14} className="mr-2 text-gray-400" />
                      <span>{search}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Filter button (mobile) */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 
                shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white 
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-primary-500 relative"
            >
              <Filter size={16} className="mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(searchParams.category_id ? 1 : 0) + (searchParams.tags_ids?.length || 0)}
                </span>
              )}
            </button>
          </div>
          
          {/* Desktop filters (always visible) */}
          <div className="hidden md:flex md:space-x-3">
            {/* Enhanced Category Dropdown with search */}
            <div className="relative w-56" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  if (!showCategoryDropdown) {
                    setTimeout(() => categorySearchInputRef.current?.focus(), 100);
                  }
                }}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 
                  shadow-sm rounded-md bg-white text-sm font-medium text-gray-700
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <div className="flex items-center">
                  {searchParams.category_id && getSelectedCategoryName() ? (
                    <>
                      <div className={`w-2 h-2 rounded-full mr-2 bg-${getCategoryColor(categories.find(cat => cat.id === searchParams.category_id))}`}></div>
                      <span>{getSelectedCategoryName()}</span>
                    </>
                  ) : (
                    <span>Select Category</span>
                  )}
                </div>
                {showCategoryDropdown ? (
                  <ChevronUp size={16} className="text-gray-400 ml-2" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400 ml-2" />
                )}
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {/* Category search input */}
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        ref={categorySearchInputRef}
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        onKeyDown={handleCategoryKeyDown}
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md 
                          shadow-sm text-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={14} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1 max-h-60 overflow-auto">
                    <div 
                      className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                        !searchParams.category_id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                      onClick={() => {
                        setSearchParams(prev => ({ ...prev, category_id: undefined }));
                        setShowCategoryDropdown(false);
                        setCategorySearchQuery('');
                      }}
                    >
                      <span>All Categories</span>
                      {!searchParams.category_id && (
                        <CheckCircle2 size={14} className="ml-auto text-primary-600" />
                      )}
                    </div>
                    
                    {suggestedCategories.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                        <AlertCircle size={14} className="mr-2 text-gray-400" />
                        No categories found
                      </div>
                    ) : (
                      suggestedCategories.map((category, index) => (
                        <div
                          key={category.id}
                          className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                            searchParams.category_id === category.id ? 'bg-blue-50 text-blue-700' : 
                            activeCategoryIndex === index ? 'bg-gray-50' : 'text-gray-700'
                          }`}
                          onClick={() => handleCategorySelect(category.id)}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 bg-${category.color || 'gray'}-500`}></div>
                          <span>{category.title}</span>
                          {searchParams.category_id === category.id && (
                            <CheckCircle2 size={14} className="ml-auto text-primary-600" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Enhanced Tags Dropdown with improved search and selection */}
            <div className="relative w-56" ref={tagDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setShowTagsDropdown(!showTagsDropdown);
                  if (!showTagsDropdown) {
                    setTimeout(() => tagSearchInputRef.current?.focus(), 100);
                  }
                }}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 
                  shadow-sm rounded-md bg-white text-sm font-medium text-gray-700
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 relative"
              >
                <div className="flex items-center truncate">
                  <TagIcon size={14} className="mr-2 text-gray-400" />
                  <span className="truncate">
                    {searchParams.tags_ids && searchParams.tags_ids.length > 0 
                      ? `${searchParams.tags_ids.length} tag${searchParams.tags_ids.length > 1 ? 's' : ''} selected` 
                      : 'Select Tags'}
                  </span>
                </div>
                {searchParams.tags_ids && searchParams.tags_ids.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {searchParams.tags_ids.length}
                  </span>
                )}
                {showTagsDropdown ? (
                  <ChevronUp size={16} className="text-gray-400 ml-2" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400 ml-2" />
                )}
              </button>
              
              {showTagsDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {/* Tag search and header */}
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        ref={tagSearchInputRef}
                        type="text"
                        placeholder="Search tags..."
                        value={tagSearchQuery}
                        onChange={(e) => setTagSearchQuery(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md 
                          shadow-sm text-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={14} className="text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Selected tags count and clear button */}
                    {searchParams.tags_ids && searchParams.tags_ids.length > 0 && (
                      <div className="flex justify-between items-center mt-2 px-1 text-xs text-gray-500">
                        <span>{searchParams.tags_ids.length} selected</span>
                        <button
                          type="button"
                          onClick={handleClearAllTags}
                          className="text-blue-600 hover:text-blue-800 focus:outline-none text-xs font-medium"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Tag list with virtual scrolling */}
                  <div ref={tagListRef} className="py-1 max-h-60 overflow-auto">
                    {filteredTags.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                        <AlertCircle size={14} className="mr-2 text-gray-400" />
                        No tags found
                      </div>
                    ) : (
                      filteredTags.map((tag, index) => (
                        <div
                          key={tag.id}
                          className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                            searchParams.tags_ids?.includes(tag.id) ? 'bg-blue-50 text-blue-700' : 
                            activeTagIndex === index ? 'bg-gray-50' : 'text-gray-700'
                          }`}
                          onClick={() => handleTagSelect(tag.id)}
                        >
                          <TagIcon size={12} className="mr-2" />
                          <span>{tag.name}</span>
                          {searchParams.tags_ids?.includes(tag.id) ? (
                            <CheckCircle2 size={14} className="ml-auto text-primary-600" />
                          ) : (
                            <div className="ml-auto w-4 h-4 rounded-sm border border-gray-300"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Apply button at bottom */}
                  <div className="p-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowTagsDropdown(false)}
                      className="w-full flex justify-center items-center px-3 py-2 border border-transparent
                        text-sm font-medium rounded-md shadow-sm text-white
                        bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2
                        focus:ring-offset-1 focus:ring-primary-500"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent 
                text-sm font-medium rounded-md shadow-sm text-white 
                bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-primary-500"
            >
              <Search size={16} className="mr-2" />
              Search
            </button>
            
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 
                  shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white 
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-primary-500"
              >
                <X size={16} className="mr-2" />
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile filters (expandable) - Enhanced with better UI */}
        {showFilters && (
          <div className="mt-4 space-y-3 md:hidden animate-slide-up">
            {/* Mobile Category selection with enhanced styling */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <label htmlFor="mobile-category" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <div className="w-2 h-2 rounded-full mr-2 bg-primary-500"></div>
                Category
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md 
                    shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                    sm:text-sm"
                />
                
                <div className="max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-md">
                  <div 
                    className={`flex items-center px-4 py-2 text-sm cursor-pointer ${
                      !searchParams.category_id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      setSearchParams(prev => ({ ...prev, category_id: undefined }));
                      setCategorySearchQuery('');
                    }}
                  >
                    <span>All Categories</span>
                    {!searchParams.category_id && (
                      <CheckCircle2 size={14} className="ml-auto text-primary-600" />
                    )}
                  </div>
                  
                  {suggestedCategories.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                      <AlertCircle size={14} className="mr-2 text-gray-400" />
                      No categories found
                    </div>
                  ) : (
                    suggestedCategories.map(category => (
                      <div
                        key={category.id}
                        className={`flex items-center px-4 py-2 text-sm cursor-pointer ${
                          searchParams.category_id === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <div className={`w-2 h-2 rounded-full mr-2 bg-${category.color || 'gray'}-500`}></div>
                        <span>{category.title}</span>
                        {searchParams.category_id === category.id && (
                          <CheckCircle2 size={14} className="ml-auto text-primary-600" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {searchParams.category_id && getSelectedCategoryName() && (
                <div className="mt-2 inline-flex items-center bg-primary-50 text-primary-700 rounded-full px-3 py-1 text-sm">
                  <span className="mr-1">Selected:</span>
                  <span className="font-medium">{getSelectedCategoryName()}</span>
                  <button 
                    type="button"
                    onClick={removeCategory}
                    className="ml-1.5 text-primary-400 hover:text-primary-600 focus:outline-none"
                    aria-label={`Remove category ${getSelectedCategoryName()}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Mobile Tags selection with enhanced search and multichoice */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="mobile-tags" className="block text-sm font-medium text-gray-700 flex items-center">
                  <TagIcon size={14} className="mr-2 text-gray-500" />
                  Tags
                </label>
                
                {searchParams.tags_ids && searchParams.tags_ids.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllTags}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none text-xs font-medium flex items-center"
                  >
                    <X size={12} className="mr-1" />
                    Clear all
                  </button>
                )}
              </div>
              
              <input
                type="text"
                placeholder="Search tags..."
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md 
                  shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                  sm:text-sm"
              />
              
              <div className="max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-md">
                {filteredTags.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                    <AlertCircle size={14} className="mr-2 text-gray-400" />
                    No tags found
                  </div>
                ) : (
                  filteredTags.map(tag => (
                    <div
                      key={tag.id}
                      className={`flex items-center px-4 py-2 text-sm cursor-pointer ${
                        searchParams.tags_ids?.includes(tag.id) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => handleTagSelect(tag.id)}
                    >
                      <TagIcon size={12} className="mr-2" />
                      <span>{tag.name}</span>
                      {searchParams.tags_ids?.includes(tag.id) ? (
                        <CheckCircle2 size={14} className="ml-auto text-primary-600" />
                      ) : (
                        <div className="ml-auto w-4 h-4 rounded-sm border border-gray-300"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {/* Selected tags display */}
              {getSelectedTags().length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {getSelectedTags().map(tag => (
                    <div 
                      key={tag.id} 
                      className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-xs"
                    >
                      <TagIcon size={10} className="mr-1" />
                      <span>{tag.name}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag.id)}
                        className="ml-1 text-blue-400 hover:text-blue-600 focus:outline-none"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent 
                  text-sm font-medium rounded-md shadow-sm text-white 
                  bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-primary-500"
              >
                <Search size={16} className="mr-2" />
                Search
              </button>
              
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 
                    shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white 
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-primary-500"
                >
                  <X size={16} className="mr-2" />
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Active Filter Chips - Enhanced visualization */}
      {hasActiveFilters && (
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-2 flex items-center">
            <Filter size={14} className="mr-2" />
            <span>Active filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Category chip with enhanced styling */}
            {searchParams.category_id && getSelectedCategoryName() && (
              <div className="inline-flex items-center bg-primary-50 text-primary-700 rounded-full px-3 py-1.5 text-sm shadow-sm">
                <div className={`w-2 h-2 rounded-full mr-2 bg-${categories.find(cat => cat.id === searchParams.category_id)?.color || 'primary'}-500`}></div>
                <span className="mr-1 text-gray-500">Category:</span>
                <span className="font-medium">{getSelectedCategoryName()}</span>
                <button 
                  type="button"
                  onClick={removeCategory}
                  className="ml-1.5 text-primary-400 hover:text-primary-600 focus:outline-none"
                  aria-label={`Remove category ${getSelectedCategoryName()}`}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {/* Tag chips with enhanced styling */}
            {getSelectedTags().map(tag => (
              <div 
                key={tag.id} 
                className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1.5 text-sm shadow-sm"
              >
                <TagIcon size={12} className="mr-1.5" />
                <span>{tag.name}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag.id)}
                  className="ml-1.5 text-blue-400 hover:text-blue-600 focus:outline-none"
                  aria-label={`Remove tag ${tag.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Enhanced Search Experience Hint */}
      {!searchParams.title && !hasActiveFilters && (
        <div className="mt-4 text-sm text-gray-500 flex items-center p-3 bg-blue-50 rounded-md">
          <Sparkles size={16} className="mr-2 text-blue-500" />
          <span>Tip: Try searching by category or tags to discover relevant audio content</span>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;