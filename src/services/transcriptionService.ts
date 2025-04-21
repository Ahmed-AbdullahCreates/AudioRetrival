/**
 * API-integrated transcription service
 * 
 * This service handles generating transcriptions for audio files by integrating with the backend API.
 */

// API base URL
const API_BASE_URL = 'https://audioretrievalapi.runasp.net/api';

/**
 * Generates a transcription from an audio file using the API
 * @param file The audio file to transcribe
 * @returns A promise resolving to the transcription text
 */
export async function generateTranscription(file: File): Promise<string> {
  try {
    console.log('Generating transcription for file:', file.name);
    
    // Create form data for transcription request
    const formData = new FormData();
    formData.append('file', file);
    
    // Send the file to the API for transcription
    const response = await fetch(`${API_BASE_URL}/transcription`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Transcription failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Transcription successful');
    
    return data.transcription || '';
  } catch (error) {
    console.error('Error generating transcription:', error);
    
    // Fallback: Generate a basic transcription if API fails
    console.warn('Falling back to generic transcription due to API error');
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    return `This is an automatically generated placeholder transcription for "${fileName}". The transcription service is currently unavailable. Please try again later or enter the transcription manually.`;
  }
}

/**
 * Gets a readable error message for transcription errors
 */
export function getTranscriptionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred during transcription';
}