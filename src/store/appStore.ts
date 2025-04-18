import { create } from 'zustand';
import type { Audio, Category, SearchParams, Tag } from '../types';

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
}

export const useAppStore = create<AppState>((set) => ({
  categories: [],
  tags: [],
  audios: [],
  currentAudio: null,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      // TODO: Implement with new backend
      const mockCategories: Category[] = [
        { id: 1, title: 'Music' },
        { id: 2, title: 'Podcasts' },
        { id: 3, title: 'Audiobooks' }
      ];
      
      set({ categories: mockCategories, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: 'Failed to fetch categories', isLoading: false });
    }
  },

  fetchTags: async () => {
    try {
      set({ isLoading: true, error: null });
      // TODO: Implement with new backend
      const mockTags: Tag[] = [
        { id: 1, name: 'Rock' },
        { id: 2, name: 'Jazz' },
        { id: 3, name: 'Educational' }
      ];
      
      set({ tags: mockTags, isLoading: false });
    } catch (error) {
      console.error('Error fetching tags:', error);
      set({ error: 'Failed to fetch tags', isLoading: false });
    }
  },

  fetchAudios: async (params?: SearchParams) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Implement with new backend
      // This is mock data to be replaced with actual API calls
      const mockAudios: Audio[] = [
        {
          id: 1,
          title: 'Sample Audio 1',
          description: 'This is a sample audio description',
          transcription: 'This is a sample transcription of the audio content.',
          url: 'https://example.com/audio1.mp3',
          uploaded_at: new Date().toISOString(),
          category_id: 1,
          category_title: 'Music',
          tags: [{ id: 1, name: 'Rock' }],
          user_id: null
        }
      ];
      
      // For now, we'll just filter the mock data based on params
      let filteredData = mockAudios;
      if (params?.title) {
        filteredData = filteredData.filter(audio => 
          audio.title.toLowerCase().includes(params.title!.toLowerCase())
        );
      }
      
      if (params?.category_id) {
        filteredData = filteredData.filter(audio => 
          audio.category_id === params.category_id
        );
      }
      
      if (params?.tags_ids && params.tags_ids.length > 0) {
        filteredData = filteredData.filter(audio => {
          if (!audio.tags) return false;
          const audioTagIds = audio.tags.map(tag => tag.id);
          return params.tags_ids!.some(tagId => audioTagIds.includes(tagId));
        });
      }
      
      set({ audios: filteredData, isLoading: false });
    } catch (error) {
      console.error('Error fetching audios:', error);
      set({ error: 'Failed to fetch audios', isLoading: false });
    }
  },

  fetchAudioById: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Implement with new backend
      // For now, just provide mock data
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
        user_id: null
      };
      
      set({ currentAudio: mockAudio, isLoading: false });
    } catch (error) {
      console.error('Error fetching audio:', error);
      set({ error: 'Failed to fetch audio', isLoading: false });
      set({ currentAudio: null, isLoading: false });
    }
  },

  uploadAudio: async (formData: FormData) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Implement with new backend
      // For now, just simulate a successful response
      const mockResponse = {
        success: true,
        audioId: Math.floor(Math.random() * 1000),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      set({ isLoading: false });
      return mockResponse;
    } catch (error) {
      console.error('Error uploading audio:', error);
      set({ error: 'Failed to upload audio', isLoading: false });
      return { success: false, error: 'Failed to upload audio' };
    }
  },

  resetError: () => set({ error: null }),
}));