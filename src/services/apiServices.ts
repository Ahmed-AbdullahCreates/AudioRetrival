/**
 * API Services
 * 
 * This file provides implementations of backend services that connect to the real API.
 * These functions communicate with the AudioRetrieval API endpoints.
 */

// API base URL
const API_BASE_URL = 'http://audioretrievalapi.runasp.net/api';

/**
 * Generic fetch with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fetch all audio files
 */
export async function getAllAudio() {
  return apiFetch<any[]>('/audio');
}

/**
 * Fetch audio by ID
 */
export async function getAudioById(id: number) {
  return apiFetch<any>(`/audio/${id}`);
}

/**
 * Search for audio with filters
 * @param params Search parameters (title, category_id, tags_ids)
 * @returns Promise with search results
 */
export async function searchAudio(params: Record<string, any> = {}) {
  // Create HTTP params similar to Angular's HttpParams
  const searchParams = new URLSearchParams();
  
  // Add title as QueryString parameter if provided - exactly as in Angular
  if (params.title) {
    searchParams.set('QueryString', params.title);
  } else {
    // Angular uses 'null' as string when no query is provided
    searchParams.set('QueryString', 'null');
  }
  
  // Add category if provided - making sure it matches the exact API requirements
  if (params.category_id !== undefined && params.category_id !== null) {
    // Get the category name from the ID if available
    if (typeof params.category_id === 'number' || typeof params.category_id === 'string') {
      try {
        // Need to convert the category_id to the actual category name/string
        // This might involve looking it up from the categories store or using a mapping
        const categoryName = getCategoryName(params.category_id);
        searchParams.set('Category', categoryName);
        console.log('Setting Category parameter:', categoryName);
      } catch (error) {
        console.error('Error setting category parameter:', error);
      }
    }
  }
  
  // Add tags if provided - exactly matching Angular implementation
  if (params.tags_ids && Array.isArray(params.tags_ids) && params.tags_ids.length > 0) {
    params.tags_ids.forEach((tagId: number) => {
      searchParams.append('TagsIds', tagId.toString());
    });
  }
  
  console.log('Search params:', Object.fromEntries(searchParams.entries()));
  
  // Make the search request
  return apiFetch<any[]>(`/audio/search?${searchParams.toString()}`);
}

/**
 * Helper function to get category name from ID
 */
function getCategoryName(categoryId: number | string): string {
  // This is a simple mapping of category IDs to names
  // In a real application, this would be fetched from the backend or store
  const categoryMap: Record<string, string> = {
    '1': 'music',
    '2': 'podcasts',
    '3': 'audiobooks',
    '4': 'quran',
    '5': 'technology',
    '6': 'sound effects',
    '7': 'entertainment',
    '8': 'other'
  };
  
  const id = categoryId.toString();
  
  // Return the mapped category name or a default if not found
  return categoryMap[id] || 'other';
}

/**
 * Get all categories
 */
export async function getCategories() {
  return apiFetch<any[]>('/categories');
}

/**
 * Get all tags
 */
export async function getTags() {
  return apiFetch<any[]>('/tags');
}

/**
 * Upload a new audio file
 */
export async function uploadAudio(formData: FormData) {
  return apiFetch<{id: number; success: boolean}>('/audio', {
    method: 'POST',
    body: formData
  });
}

/**
 * Uploads a file to the server's storage service
 */
export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    
    const data = await response.json();
    
    return {
      url: data.url,
      publicId: data.publicId || `file_${Date.now()}`
    };
  } catch (error) {
    console.error('Upload error:', error);
    
    // Fallback to local URL if API fails
    const url = URL.createObjectURL(file);
    return {
      url,
      publicId: `local_${Date.now()}`,
    };
  }
}

/**
 * Generates a transcription from an audio file using the API
 */
export async function generateTranscription(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/transcription`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate transcription');
    }
    
    const data = await response.json();
    return data.transcription;
  } catch (error) {
    console.error('Transcription error:', error);
    
    // Fallback to mock transcription if API fails
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    return `This is a transcription for "${fileName}". The automatic transcription service is currently unavailable.`;
  }
}

/**
 * Returns an error message for transcription failures
 */
export function getTranscriptionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred during transcription';
}