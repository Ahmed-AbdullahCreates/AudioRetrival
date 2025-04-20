/**
 * Audio file upload service
 * 
 * This service handles direct audio file uploads to the backend API
 */

// API base URL
const API_BASE_URL = 'http://audioretrievalapi.runasp.net/api';

/**
 * Uploads an audio file directly to the backend API
 * @param file The audio file to upload
 * @returns A promise resolving to the URL of the uploaded file
 */
export async function uploadAudioFile(file: File): Promise<string> {
  try {
    console.log('Uploading audio file to API:', file.name);
    
    // Create a FormData object for the file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Send the file directly to the API endpoint
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Upload successful, received:', data);
    
    // Return the URL of the uploaded file
    if (data && data.url) {
      return data.url;
    } else {
      throw new Error('API response missing URL');
    }
  } catch (error) {
    console.error('Error uploading audio file:', error);
    throw error;
  }
}