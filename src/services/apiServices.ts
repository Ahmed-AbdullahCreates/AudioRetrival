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
 */
export async function searchAudio(params: Record<string, string | number | boolean | undefined>) {
  // Convert params to query string, filtering out undefined values
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });
  
  return apiFetch<any[]>(`/audio/search?${queryParams.toString()}`);
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