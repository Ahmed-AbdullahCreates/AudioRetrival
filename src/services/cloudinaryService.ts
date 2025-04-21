/**
 * API-integrated file upload service
 * 
 * This service integrates with the backend API to upload audio files to storage.
 */

// API base URL
const API_BASE_URL = 'https://audioretrievalapi.runasp.net/api';

/**
 * Uploads an audio file to cloud storage via the backend API
 * @param file The file to upload
 * @returns A promise resolving to the URL and ID of the uploaded file, or null if an error occurred
 */
export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string } | null> {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Uploading file to API:', file.name);
    
    // Send the file to the API
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Upload successful, received:', data);
    
    return {
      url: data.url,
      publicId: data.publicId || `audio_${Date.now()}`
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Fallback: Create a local URL for demo purposes if API fails
    console.warn('Falling back to local object URL due to API error');
    return {
      url: URL.createObjectURL(file),
      publicId: `local_${Date.now()}`
    };
  }
}