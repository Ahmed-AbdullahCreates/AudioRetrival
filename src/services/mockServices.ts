/**
 * Mock Services
 * 
 * This file provides mock implementations of backend services that were removed
 * to prepare for a new backend integration. These functions simulate the expected
 * behaviors without actually connecting to any backend services.
 */

/**
 * Simulates uploading a file to a cloud storage service like Cloudinary
 */
export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string } | null> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a temporary object URL for the file (will only work during the session)
    const url = URL.createObjectURL(file);
    
    return {
      url,
      publicId: `mock_${Date.now()}`,
    };
  } catch (error) {
    console.error('Mock upload error:', error);
    return null;
  }
}

/**
 * Simulates generating a transcription from an audio file
 */
export async function generateTranscription(file: File): Promise<string> {
  try {
    // Simulate network delay and processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a mock transcription based on the filename
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    return `This is a simulated transcription for "${fileName}". In a real implementation, 
    this text would be generated by a speech-to-text service. The actual content would match 
    the audio in the file. This is placeholder text to be replaced when you integrate your 
    new backend transcription service.`;
  } catch (error) {
    throw new Error('Failed to generate transcription');
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