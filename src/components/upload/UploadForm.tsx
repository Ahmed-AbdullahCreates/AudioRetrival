import { useState, useRef, useEffect } from 'react';
import { Upload, Loader, RefreshCw, CheckCircle, Music, AlertCircle, Headphones, X, Tag as TagIcon, BookOpen, FileText, Type, Search } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useNavigate } from 'react-router-dom';
import { generateTranscription, getTranscriptionErrorMessage } from '../../services/transcriptionService';
import type { AudioUploadFormData, Tag, Category } from '../../types';

const UploadForm: React.FC = () => {
  const { categories, tags, uploadAudio, isLoading } = useAppStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Omit<AudioUploadFormData, 'audioFile'>>({
    title: '',
    description: '',
    transcription: '',
    category_id: 0,
    tags_ids: [],
  });
  const [isGeneratingTranscription, setIsGeneratingTranscription] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [focused, setFocused] = useState<string | null>(null);

  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const tagsRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [formSubmitted, setFormSubmitted] = useState(false);

  const [transcriptionStatus, setTranscriptionStatus] = useState<string>('');
  const [transcriptionProgress, setTranscriptionProgress] = useState<number>(0);

  const [tagSearchQuery, setTagSearchQuery] = useState<string>('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagsRef.current && !tagsRef.current.contains(event.target as Node)) {
        setShowTagsDropdown(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (formSubmitted) {
      validateForm();
    }
  }, [formData, audioFile, formSubmitted]);

  useEffect(() => {
    if (showTagsDropdown && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [showTagsDropdown]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setAudioFile(file);

      const fileName = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({ ...prev, title: fileName }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTagToggle = (tagId: number) => {
    setFormData(prev => {
      const currentTags = [...prev.tags_ids];
      if (currentTags.includes(tagId)) {
        return { ...prev, tags_ids: currentTags.filter(id => id !== tagId) };
      } else {
        return { ...prev, tags_ids: [...currentTags, tagId] };
      }
    });
  };

  const handleCategorySelect = (categoryId: number) => {
    // First clear all previously selected tags to avoid tag accumulation
    setFormData(prev => ({ ...prev, category_id: categoryId, tags_ids: [] }));
    setShowCategoryDropdown(false);

    if (errors.category_id) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.category_id;
        return newErrors;
      });
    }

    // Auto-add relevant tags based on the selected category
    const selectedCategory = categories.find(category => category.id === categoryId);
    if (selectedCategory) {
      let relevantTags: Tag[] = [];

      // Find relevant tags based on the category title
      switch (selectedCategory.title.toLowerCase()) {
        case 'music':
          relevantTags = tags.filter(tag => 
            ['rock', 'jazz', 'classical', 'pop', 'instrumental'].includes(tag.name.toLowerCase())
          );
          break;
        case 'podcasts':
          relevantTags = tags.filter(tag => 
            ['interview', 'talk show', 'news', 'comedy'].includes(tag.name.toLowerCase())
          );
          break;
        case 'audiobooks':
          relevantTags = tags.filter(tag => 
            ['fiction', 'non-fiction', 'fantasy', 'biography'].includes(tag.name.toLowerCase())
          );
          break;
        case 'quran':
          relevantTags = tags.filter(tag => 
            ['recitation', 'tajweed', 'translation'].includes(tag.name.toLowerCase())
          );
          break;
        case 'entertainment':
          relevantTags = tags.filter(tag => 
            ['movie clips', 'tv shows', 'gaming'].includes(tag.name.toLowerCase())
          );
          break;
        case 'technology':
          relevantTags = tags.filter(tag => 
            ['programming', 'web development', 'artificial intelligence', 'cybersecurity'].includes(tag.name.toLowerCase())
          );
          break;
        case 'educational':
          relevantTags = tags.filter(tag => 
            ['lecture', 'tutorial', 'course', 'science', 'mathematics'].includes(tag.name.toLowerCase())
          );
          break;
        case 'sound effects':
          relevantTags = tags.filter(tag => 
            ['nature', 'urban', 'cinematic', 'ambient'].includes(tag.name.toLowerCase())
          );
          break;
      }

      // Add up to 3 suggested tags automatically
      if (relevantTags.length > 0) {
        const suggestedTagIds = relevantTags.slice(0, 3).map(tag => tag.id);
        setFormData(prev => ({
          ...prev,
          tags_ids: suggestedTagIds
        }));
      }
    }
  };

  const getSelectedCategory = (): Category | undefined => {
    return categories.find(category => category.id === formData.category_id);
  };

  const getSelectedTags = (): Tag[] => {
    return tags.filter(tag => formData.tags_ids.includes(tag.id));
  };

  const getFilteredTags = (): Tag[] => {
    if (!tagSearchQuery.trim()) return tags;

    return tags.filter(tag =>
      tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
  };

  const removeTag = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      tags_ids: prev.tags_ids.filter(id => id !== tagId)
    }));
  };

  const handleGenerateTranscription = async () => {
    if (!audioFile) {
      setErrors(prev => ({ ...prev, audioFile: 'Please upload an audio file first' }));
      return;
    }

    setIsGeneratingTranscription(true);
    setTranscriptionStatus('Preparing your audio for transcription...');
    setTranscriptionProgress(10);

    if (errors.transcription) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.transcription;
        return newErrors;
      });
    }

    try {
      setTranscriptionStatus('Uploading audio to transcription service...');
      setTranscriptionProgress(30);

      const transcription = await generateTranscription(audioFile);

      setTranscriptionProgress(90);
      setTranscriptionStatus('Finalizing transcription...');

      if (transcription) {
        setFormData(prev => ({ ...prev, transcription }));
        setTranscriptionProgress(100);
        setTranscriptionStatus('Transcription successful!');

        setTimeout(() => {
          setTranscriptionProgress(0);
          setTranscriptionStatus('');
        }, 2000);
      } else {
        throw new Error('Failed to generate transcription');
      }
    } catch (error) {
      console.error('Error during transcription:', error);
      setErrors(prev => ({
        ...prev,
        transcription: getTranscriptionErrorMessage(error)
      }));
      setTranscriptionProgress(0);
      setTranscriptionStatus('Transcription failed');
    } finally {
      setIsGeneratingTranscription(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!audioFile) {
      newErrors.audioFile = 'Audio file is required';
    }

    if (formData.category_id === 0) {
      newErrors.category_id = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!validateForm()) {
      return;
    }

    // Reset any previous errors
    setErrors({});
    setUploadProgress(0);

    // Set up faster upload progress indicator
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const increment = Math.random() * 20 + 5; // 5-25% increment per update
        const newProgress = prev + increment;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 300); // Update progress every 300ms instead of 800ms

    try {
      console.log('Starting audio upload process...');
      
      if (!audioFile) {
        throw new Error('No audio file selected');
      }

      // Jump to 30% immediately to show progress
      setUploadProgress(30);
      
      // Create a FormData object to directly submit everything in one request
      const submitForm = new FormData();
      
      // Add the audio file
      submitForm.append('File', audioFile);
      
      // Add metadata using the exact field names the API expects
      submitForm.append('Title', formData.title);
      submitForm.append('Description', formData.description || 'No description provided');
      submitForm.append('Transcription', formData.transcription || '');
      
      // For the category, send both ID and name for better compatibility
      const selectedCategory = getSelectedCategory();
      if (selectedCategory) {
        // Try different formats for the category
        submitForm.append('Category', selectedCategory.title); // Send category name instead of ID
        submitForm.append('CategoryId', formData.category_id.toString());
        submitForm.append('CategoryName', selectedCategory.title);
      } else {
        // Default to first category if none selected
        submitForm.append('Category', 'Music');
        submitForm.append('CategoryId', '1');
        submitForm.append('CategoryName', 'Music');
      }
      
      // Add tags as a comma-separated string
      if (formData.tags_ids.length > 0) {
        const tagNames = getSelectedTags().map(tag => tag.name).join(',');
        submitForm.append('Tags', tagNames); // Send tag names instead of IDs
        submitForm.append('TagIds', formData.tags_ids.join(','));
      }
      
      console.log('Submitting audio data to API...');
      
      // Jump to 60% progress to make it feel faster
      setUploadProgress(60);
      
      // Submit everything to the API
      const result = await uploadAudio(submitForm);

      if (result.success && result.audioId) {
        console.log('Audio successfully created with ID:', result.audioId);
        setUploadProgress(100);

        // Reduce redirect time
        setTimeout(() => {
          navigate(`/audio/${result.audioId}`);
        }, 800); // 800ms instead of 1500ms
      } else {
        throw new Error(result.error || 'Failed to create audio record');
      }
    } catch (error: any) {
      console.error('Error during upload process:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: `Upload failed: ${error.message || 'Please try again later.'}` 
      }));
      
      // Reset progress on error
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Music size={16} className="mr-2 text-primary-500" />
          Audio File <span className="text-red-500 ml-1">*</span>
        </label>
        <div
          className={`border-2 border-dashed rounded-xl p-6 md:p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
            ${errors.audioFile 
              ? 'border-red-300 bg-red-50' 
              : audioFile 
                ? 'border-green-300 bg-green-50' 
                : focused === 'file' 
                  ? 'border-primary-300 bg-primary-50' 
                  : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
            }`}
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={() => setFocused('file')}
          onMouseLeave={() => setFocused(null)}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />
          
          {audioFile ? (
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">{audioFile.name}</p>
              <p className="text-xs sm:text-sm text-gray-500 mb-3">
                {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 rounded-full hover:bg-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setAudioFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                  if (errors.audioFile) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.audioFile;
                      return newErrors;
                    });
                  }
                }}
              >
                Change file
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-100 flex items-center justify-center mb-3 sm:mb-4">
                <Headphones className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600" />
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-900 mb-2 text-center">
                Drag and drop or click to upload
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mb-4 text-center max-w-sm">
                MP3, WAV, M4A, OGG, OCC up to 30MB. Your audio file will be processed for sharing.
              </p>
              <button
                type="button"
                className="group relative px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-300 
                shadow-md hover:shadow-lg hover:from-primary-600 hover:to-primary-800 focus:outline-none focus:ring-2 
                focus:ring-primary-500 focus:ring-offset-2 transform hover:-translate-y-1 active:translate-y-0"
              >
                <span className="absolute inset-0 w-full h-full rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-white"></span>
                <span className="relative flex items-center">
                  <Upload size={16} className="mr-2" />
                  Browse Files
                </span>
              </button>
            </>
          )}
        </div>
        {errors.audioFile && (
          <div className="flex items-center mt-2">
            <AlertCircle size={16} className="text-red-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-600">{errors.audioFile}</p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-100 flex items-center">
          <FileText size={18} className="mr-2 text-primary-500" />
          Audio Details
        </h3>
        
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label 
              htmlFor="title" 
              className="flex items-center text-sm font-medium text-gray-700 mb-2"
            >
              <Type size={16} className="mr-2 text-primary-500" />
              Title <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onFocus={() => setFocused('title')}
                onBlur={() => setFocused(null)}
                placeholder="Enter a descriptive title"
                className={`block w-full px-4 py-3 rounded-md text-base transition-all duration-200 outline-none
                  ${errors.title 
                    ? 'border border-red-300 text-red-900 ring-1 ring-red-300 pr-10' 
                    : focused === 'title'
                      ? 'border border-primary-300 ring-2 ring-primary-100'
                      : 'border border-gray-300 hover:border-primary-300'
                  }`}
              />
              {errors.title && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
              )}
            </div>
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1 flex-shrink-0" />
                {errors.title}
              </p>
            )}
          </div>
          
          <div>
            <label 
              htmlFor="description" 
              className="flex items-center text-sm font-medium text-gray-700 mb-2"
            >
              <FileText size={16} className="mr-2 text-primary-500" />
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              onFocus={() => setFocused('description')}
              onBlur={() => setFocused(null)}
              placeholder="Describe your audio file in detail"
              className={`block w-full px-4 py-3 rounded-md text-base transition-all duration-200 outline-none
                ${focused === 'description'
                  ? 'border border-primary-300 ring-2 ring-primary-100'
                  : 'border border-gray-300 hover:border-primary-300'
                }`}
            />
            <p className="mt-2 text-xs text-gray-500 flex items-center">
              <svg className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              A clear description helps others find your audio
            </p>
          </div>
          
          <div>
            <label 
              className="flex items-center text-sm font-medium text-gray-700 mb-2"
            >
              <BookOpen size={16} className="mr-2 text-primary-500" />
              Category <span className="text-red-500 ml-1">*</span>
            </label>
            <div ref={categoryRef} className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`flex items-center justify-between w-full px-4 py-3 text-left rounded-md transition-all duration-200 outline-none
                  ${errors.category_id 
                    ? 'border border-red-300 text-red-900 ring-1 ring-red-300' 
                    : focused === 'category_id' || showCategoryDropdown
                      ? 'border border-primary-300 ring-2 ring-primary-100'
                      : 'border border-gray-300 hover:border-primary-300'
                  }`}
              >
                <div className="flex items-center">
                  {getSelectedCategory() ? (
                    <>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getCategoryColorClass(getSelectedCategory()!)}`}>
                        {getCategoryIcon(getSelectedCategory()!)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{getSelectedCategory()!.title}</span>
                        {getSelectedCategory()!.description && (
                          <span className="text-xs text-gray-500 line-clamp-1">{getSelectedCategory()!.description}</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">Select a category</span>
                  )}
                </div>
                <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showCategoryDropdown ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1 max-h-80 overflow-auto animate-fade-in">
                  <div className="px-3 py-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Categories
                    </h4>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySelect(category.id)}
                        className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors rounded-md ${
                          formData.category_id === category.id ? 'bg-primary-50 text-primary-700' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getCategoryColorClass(category)}`}>
                          {getCategoryIcon(category)}
                        </div>
                        <span className={formData.category_id === category.id ? 'font-medium' : ''}>{category.title}</span>
                        {formData.category_id === category.id && (
                          <CheckCircle size={16} className="ml-auto text-primary-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.category_id && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1 flex-shrink-0" />
                {errors.category_id}
              </p>
            )}
          </div>
          
          <div>
            <label 
              className="flex items-center text-sm font-medium text-gray-700 mb-2"
            >
              <TagIcon size={16} className="mr-2 text-primary-500" />
              Tags
            </label>
            <div ref={tagsRef} className="relative">
              <div
                onClick={() => setShowTagsDropdown(true)}
                className={`min-h-[50px] px-4 py-3 rounded-md cursor-pointer transition-all duration-200 outline-none
                  ${focused === 'tags_ids' || showTagsDropdown
                    ? 'border border-primary-300 ring-2 ring-primary-100'
                    : 'border border-gray-300 hover:border-primary-300'
                  }`}
              >
                <div className="flex flex-wrap gap-2">
                  {getSelectedTags().length > 0 ? (
                    getSelectedTags().map(tag => (
                      <div 
                        key={tag.id} 
                        className="inline-flex items-center bg-primary-50 text-primary-700 rounded-full px-3 py-1"
                      >
                        <span className="text-sm">{tag.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag.id);
                          }}
                          className="ml-1.5 text-primary-400 hover:text-primary-600 focus:outline-none"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500">Type or select tags (optional)</span>
                  )}
                </div>
              </div>
              
              {showTagsDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-hidden animate-fade-in">
                  <div className="sticky top-0 bg-white z-10 px-3 py-2 border-b border-gray-100">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search size={14} className="text-gray-400" />
                      </div>
                      <input
                        ref={tagInputRef}
                        type="text"
                        className="w-full py-1.5 pl-9 pr-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Search tags..."
                        value={tagSearchQuery}
                        onChange={(e) => setTagSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tagSearchQuery.trim() !== '') {
                            e.preventDefault();
                            const filteredTags = getFilteredTags();
                            if (filteredTags.length > 0 && !formData.tags_ids.includes(filteredTags[0].id)) {
                              handleTagToggle(filteredTags[0].id);
                              setTagSearchQuery('');
                            }
                          }
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Select multiple tags or type and press Enter</p>
                  </div>
                  
                  <div className="overflow-y-auto max-h-[220px]">
                    {getFilteredTags().length > 0 ? (
                      getFilteredTags().map(tag => (
                        <div
                          key={tag.id}
                          onClick={() => {
                            handleTagToggle(tag.id);
                            setTagSearchQuery('');
                          }}
                          className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                            formData.tags_ids.includes(tag.id) ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                            formData.tags_ids.includes(tag.id) 
                              ? 'bg-primary-600 border-primary-600' 
                              : 'border-gray-300'
                          }`}>
                            {formData.tags_ids.includes(tag.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          <span className={formData.tags_ids.includes(tag.id) ? 'font-medium' : ''}>{tag.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No matching tags found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 flex items-center">
              <svg className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Tags help users discover your content more easily
            </p>
          </div>
          
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
              <label htmlFor="transcription" className="flex items-center text-sm font-medium text-gray-700">
                <FileText size={16} className="mr-2 text-primary-500" />
                Transcription
              </label>
              <button
                type="button"
                onClick={handleGenerateTranscription}
                disabled={isGeneratingTranscription || !audioFile}
                className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full
                  ${isGeneratingTranscription || !audioFile
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  }`}
              >
                {isGeneratingTranscription ? (
                  <>
                    <Loader size={14} className="mr-2 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="mr-2" />
                    Auto Generate
                  </>
                )}
              </button>
            </div>
            
            {transcriptionProgress > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">{transcriptionStatus}</span>
                  <span className="text-xs font-medium text-primary-600">{transcriptionProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary-600 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${transcriptionProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <textarea
              id="transcription"
              name="transcription"
              rows={5}
              value={formData.transcription}
              onChange={handleInputChange}
              onFocus={() => setFocused('transcription')}
              onBlur={() => setFocused(null)}
              placeholder="Enter audio transcription or use auto-generate"
              className={`block w-full px-4 py-3 rounded-md text-base transition-all duration-200 outline-none
                ${errors.transcription 
                  ? 'border border-red-300 text-red-900 ring-1 ring-red-300' 
                  : focused === 'transcription'
                    ? 'border border-primary-300 ring-2 ring-primary-100'
                    : 'border border-gray-300 hover:border-primary-300'
                }`}
              disabled={isGeneratingTranscription}
            />
            {errors.transcription ? (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1 flex-shrink-0" />
                {errors.transcription}
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <svg className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Adding a transcription makes your audio more accessible and searchable
              </p>
            )}
          </div>
        </div>
      </div>
      
      {errors.submit && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        </div>
      )}
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Uploading Audio</h4>
            <span className="text-sm font-medium text-primary-600">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="bg-primary-600 h-full rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Please wait while your audio is being uploaded</p>
        </div>
      )}
      
      {uploadProgress === 100 && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Upload successful!</h3>
              <div className="mt-1 text-sm text-green-700">
                <p>Your audio has been uploaded. Redirecting you to the audio page...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || isGeneratingTranscription || uploadProgress > 0}
          className={`group relative flex justify-center items-center py-3 px-7 border-0 rounded-full 
            shadow-lg text-base font-medium text-white transition-all duration-300 outline-none
            ${isLoading || isGeneratingTranscription || uploadProgress > 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 transform hover:-translate-y-1 hover:shadow-xl active:translate-y-0'
            }`}
        >
          {isLoading ? (
            <>
              <Loader size={20} className="mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <span className="flex items-center">
              <span className="relative z-10 flex items-center">
                <Upload size={20} className="mr-2" />
                Upload Audio
              </span>
            </span>
          )}
          <span className="absolute inset-0 w-full h-full rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-white"></span>
        </button>
      </div>
    </form>
  );
};

const getCategoryIcon = (category: Category) => {
  const title = category.title.toLowerCase();
  if (title === 'music') {
    return <Music size={16} className="text-blue-600" />;
  } else if (title === 'podcast') {
    return <Headphones size={16} className="text-purple-600" />;
  } else if (title === 'audiobook' || title === 'quran') {
    return <BookOpen size={16} className="text-green-600" />;
  } else if (title === 'sound effects') {
    return <Upload size={16} className="text-amber-600" />;
  } else if (title === 'educational') {
    return <FileText size={16} className="text-indigo-600" />;
  } else {
    return <Music size={16} className="text-gray-600" />;
  }
};

const getCategoryColorClass = (category: Category) => {
  const id = category.id || 1;
  
  // Use explicit class names rather than string concatenation
  // This ensures Tailwind includes these classes in the bundle
  switch (id % 6) {
    case 0: return "bg-blue-100";
    case 1: return "bg-green-100";
    case 2: return "bg-purple-100";
    case 3: return "bg-pink-100";
    case 4: return "bg-amber-100";
    case 5: return "bg-indigo-100";
    default: return "bg-gray-100";
  }
};

export default UploadForm;