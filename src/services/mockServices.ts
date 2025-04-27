/**
 * API Services
 * 
 * This file provides implementations of backend services that connect to the real API.
 * These functions communicate with the AudioRetrieval API endpoints.
 */

// Use environment variable if available, otherwise fall back to default API URL
// Make sure to use HTTPS for production deployments
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://audioretrievalapi.runasp.net/api';

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