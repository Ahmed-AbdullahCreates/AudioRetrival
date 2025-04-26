import { create } from 'zustand';
import type { Audio, Category, SearchParams, Tag } from '../types';
import * as apiService from '../services/apiServices';

interface AppState {
  // Data
  categories: Category[];
  tags: Tag[];
  audios: Audio[];
  currentAudio: Audio | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchAudios: (params?: SearchParams) => Promise<void>;
  fetchAudioById: (id: number) => Promise<void>;
  uploadAudio: (formData: FormData) => Promise<{ success: boolean; audioId?: number; error?: string }>;
  resetError: () => void;
  getLatestUploads: (limit?: number) => Audio[];
}

export const useAppStore = create<AppState>((set, get) => ({
  categories: [],
  tags: [],
  audios: [],
  currentAudio: null,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const data = await apiService.getCategories();
      set({ categories: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: 'Failed to fetch categories', isLoading: false });
      
      // Fallback to mock data if API fails - with removed categories
      const mockCategories: Category[] = [
        { 
          id: 1, 
          title: 'Music', 
          description: 'Explore songs, albums, and playlists across all genres',
          color: 'blue',
          icon: 'music',
          coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
          count: 42,
          slug: 'music',
          featured: true
        },
        { 
          id: 2, 
          title: 'Podcasts', 
          description: 'Discover interesting discussions, interviews, and stories',
          color: 'purple',
          icon: 'mic',
          coverImage: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
          count: 28,
          slug: 'podcasts'
        },
        { 
          id: 3, 
          title: 'Audiobooks', 
          description: 'Listen to books narrated by professional voice actors',
          color: 'amber',
          icon: 'book',
          coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
          count: 19,
          slug: 'audiobooks'
        },
        { 
          id: 4, 
          title: 'Quran', 
          description: 'Listen to recitations from different reciters',
          color: 'green',
          icon: 'book-open',
          coverImage: 'https://images.unsplash.com/photo-1609599006353-e629a7d4d9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
          count: 14,
          slug: 'quran',
          featured: true
        }
      ];
      set({ categories: mockCategories });
    }
  },

  fetchTags: async () => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('Fetching tags from API...');
      // Use the new direct API call to ensure we get the latest data
      const data = await apiService.fetchTagsDirectly(true);
      console.log('Tags API response:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        // Ensure each tag has the expected format
        const formattedTags = data.map(tag => ({
          id: typeof tag.id === 'number' ? tag.id : parseInt(tag.id),
          name: tag.name || tag.title || `Tag ${tag.id}` // Handle different field names
        }));
        console.log('Formatted tags:', formattedTags);
        set({ tags: formattedTags, isLoading: false });
      } else {
        console.warn('API returned empty or invalid tags array, using fallback data');
        throw new Error('Invalid tags data');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      set({ error: 'Failed to fetch tags', isLoading: false });
      
      // Fallback to mock data if API fails
      const mockTags: Tag[] = [
        // Music tags
        { id: 1, name: 'Rock' },
        { id: 2, name: 'Jazz' },
        { id: 3, name: 'Classical' },
        { id: 4, name: 'Hip-Hop' },
        { id: 5, name: 'Pop' },
        { id: 6, name: 'Electronic' },
        { id: 7, name: 'Folk' },
        { id: 8, name: 'Instrumental' },
        
        // Podcast tags
        { id: 9, name: 'Interview' },
        { id: 10, name: 'Talk Show' },
        { id: 11, name: 'True Crime' },
        { id: 12, name: 'News' },
        { id: 13, name: 'Comedy' },
        
        // Audiobook tags
        { id: 14, name: 'Fiction' },
        { id: 15, name: 'Non-Fiction' },
        { id: 16, name: 'Fantasy' },
        { id: 17, name: 'Self-Help' },
        { id: 18, name: 'Biography' },
        
        // Quran tags
        { id: 19, name: 'Recitation' },
        { id: 20, name: 'Tajweed' },
        { id: 21, name: 'Translation' },
        { id: 22, name: 'Tafsir' },
        
        // Technology tags
        { id: 23, name: 'Programming' },
        { id: 24, name: 'Web Development' },
        { id: 25, name: 'Data Science' },
        { id: 26, name: 'Artificial Intelligence' },
        { id: 27, name: 'Machine Learning' },
        { id: 28, name: 'Cybersecurity' },
        { id: 29, name: 'Cloud Computing' },
        { id: 30, name: 'Mobile Development' },
        { id: 31, name: 'DevOps' },
        { id: 32, name: 'Blockchain' },
        
        // Sound Effects tags
        { id: 40, name: 'Nature' },
        { id: 41, name: 'Urban' },
        { id: 42, name: 'Foley' },
        { id: 43, name: 'Cinematic' },
        { id: 44, name: 'Ambient' },
        
        // Entertainment tags
        { id: 45, name: 'Movie Clips' },
        { id: 46, name: 'TV Shows' },
        { id: 47, name: 'Gaming' },
        { id: 48, name: 'Animation' }
      ];
      set({ tags: mockTags });
    }
  },

  fetchAudios: async (params?: SearchParams) => {
    try {
      set({ isLoading: true, error: null });
      
      let data;
      if (params) {
        data = await apiService.searchAudio(params);
      } else {
        data = await apiService.getAllAudio();
      }
      
      const formattedAudios: Audio[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        transcription: item.transcription,
        url: item.url,
        uploaded_at: new Date(item.uploadedAt || Date.now()).toISOString(),
        category_id: typeof item.category === 'number' ? item.category : 1,
        category_title: typeof item.category === 'string' ? item.category : 'Music',
        tags: item.tags || [],
        user_id: item.userId || null,
        categories: [typeof item.category === 'string' ? item.category : 'Music'],
        createdAt: new Date(item.createdAt || item.uploadedAt || Date.now()).getTime(),
        audioUrl: item.url,
        author: item.author || 'Unknown',
        duration: item.duration || '0:00',
        fileFormat: item.fileFormat || 'mp3',
        fileSize: item.fileSize || 0
      }));
      
      set({ audios: formattedAudios, isLoading: false });
    } catch (error) {
      console.error('Error fetching audios:', error);
      set({ error: 'Failed to fetch audios', isLoading: false });
      
      // Fallback to mock data if API fails
      const mockAudios: Audio[] = [
        {
          id: 1,
          title: 'Sample Music Track',
          description: 'A beautiful musical piece',
          transcription: null,
          url: 'https://example.com/audio1.mp3',
          uploaded_at: new Date().toISOString(),
          category_id: 1,
          category_title: 'Music',
          tags: [{ id: 1, name: 'Rock' }],
          user_id: null,
          categories: ['Music'],
          createdAt: Date.now(),
          audioUrl: 'https://example.com/audio1.mp3'
        },
        {
          id: 2,
          title: 'Interview Podcast',
          description: 'Interesting podcast episode',
          transcription: null,
          url: 'https://example.com/audio2.mp3',
          uploaded_at: new Date().toISOString(),
          category_id: 2,
          category_title: 'Podcasts',
          tags: [{ id: 9, name: 'Interview' }],
          user_id: null,
          categories: ['Podcasts'],
          createdAt: Date.now(),
          audioUrl: 'https://example.com/audio2.mp3'
        },
        {
          id: 3,
          title: 'Audiobook Sample',
          description: 'Fantasy audiobook chapter',
          transcription: null,
          url: 'https://example.com/audio3.mp3',
          uploaded_at: new Date().toISOString(),
          category_id: 3,
          category_title: 'Audiobooks',
          tags: [{ id: 16, name: 'Fantasy' }],
          user_id: null,
          categories: ['Audiobooks'],
          createdAt: Date.now(),
          audioUrl: 'https://example.com/audio3.mp3'
        },
        {
          id: 4,
          title: 'Quran Recitation',
          description: 'Beautiful Quran recitation',
          transcription: null,
          url: 'https://example.com/audio4.mp3',
          uploaded_at: new Date().toISOString(),
          category_id: 4,
          category_title: 'Quran',
          tags: [{ id: 19, name: 'Recitation' }],
          user_id: null,
          categories: ['Quran'],
          createdAt: Date.now(),
          audioUrl: 'https://example.com/audio4.mp3'
        }
      ];
      set({ audios: mockAudios });
    }
  },

  fetchAudioById: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      
      const data = await apiService.getAudioById(id);
      
      // Transform response to match our interface
      const formattedAudio: Audio = {
        id: data.id,
        title: data.title,
        description: data.description,
        transcription: data.transcription,
        url: data.url,
        uploaded_at: data.uploadedAt || new Date().toISOString(),
        category_id: typeof data.category === 'number' ? data.category : 1,
        category_title: typeof data.category === 'string' ? data.category : 'Unknown',
        tags: data.tags || [],
        user_id: data.userId || null,
        // Additional properties for the UI
        audioUrl: data.url,
        author: data.author || 'Unknown',
        duration: data.duration || '0:00',
        fileFormat: data.fileFormat || 'mp3',
        fileSize: data.fileSize || 0,
        categories: data.category ? [typeof data.category === 'string' ? data.category : 'Unknown'] : [],
        createdAt: data.uploadedAt || Date.now()
      };
      
      set({ currentAudio: formattedAudio, isLoading: false });
    } catch (error) {
      console.error('Error fetching audio:', error);
      set({ error: 'Failed to fetch audio', isLoading: false });
      
      // Fallback to mock data if API fails
      const mockAudio: Audio = {
        id: id,
        title: `Sample Audio ${id}`,
        description: 'This is a sample audio description',
        transcription: 'This is a sample transcription of the audio content.',
        url: 'https://example.com/audio.mp3',
        uploaded_at: new Date().toISOString(),
        category_id: 1,
        category_title: 'Music',
        tags: [{ id: 1, name: 'Rock' }],
        user_id: null,
        audioUrl: 'https://example.com/audio.mp3',
        author: 'Unknown',
        duration: '3:45',
        fileFormat: 'mp3',
        fileSize: 3500000,
        categories: ['Music'],
        createdAt: Date.now()
      };
      
      set({ currentAudio: mockAudio });
    }
  },

  uploadAudio: async (formData: FormData) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('Upload API call - Sending data to API endpoint');
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File (${value.name}, ${value.size} bytes)` : value}`);
      }
      
      // Make a single API call with all the data at once
      const response = await fetch('http://audioretrievalapi.runasp.net/api/audio', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header when sending FormData - browser will set it with boundary
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        
        // Try to parse error as JSON, fall back to text if not valid JSON
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch (e) {
          // Not JSON, use the text as is
        }
        
        throw new Error(`API Error (${response.status}): ${errorMessage}`);
      }
      
      const result = await response.json();
      console.log('Upload successful, API response:', result);
      
      set({ isLoading: false });
      return { 
        success: true, 
        audioId: result.id || result.audioId || 1 // Handle different possible ID field names
      };
    } catch (error) {
      console.error('Error uploading audio:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to upload audio', isLoading: false });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload audio' 
      };
    }
  },

  resetError: () => set({ error: null }),

  getLatestUploads: (limit = 6) => {
    const { audios } = get();
    return [...audios]
      .sort((a, b) => {
        const dateA = new Date(a.uploaded_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.uploaded_at || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  },
}));