/**
 * Deepgram API-integrated transcription service using a proxy to avoid CORS issues
 * 
 * This service handles generating transcriptions for audio files using the Deepgram API.
 */

// Proxy URL instead of direct Deepgram API URL
const DEEPGRAM_API_PROXY_URL = '/api/deepgram/listen';

/**
 * Generates a transcription from an audio file using the Deepgram API via proxy
 * @param file The audio file to transcribe
 * @returns A promise resolving to the transcription text
 */
export async function generateTranscription(file: File): Promise<string> {
  try {
    console.log('Generating transcription for file:', file.name);
    
    // Get content type from the file or default to audio/wav
    const contentType = file.type || 'audio/wav';
    
    // Send the file to Deepgram API via our proxy
    const response = await fetch(DEEPGRAM_API_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        // No need to include Authorization header as it's set in the proxy
      },
      body: file
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Transcription API error:', response.status, response.statusText, errorText);
      throw new Error(`Transcription failed with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Transcription successful', data);
    
    // Extract transcript from the Deepgram response format
    const transcript = data.results?.channels[0]?.alternatives[0]?.transcript;
    
    if (!transcript) {
      throw new Error('No transcription found in the API response');
    }
    
    return transcript;
  } catch (error) {
    console.error('Error generating transcription:', error);
    
    // Fallback: Generate a basic transcription if API fails
    console.warn('Falling back to generic transcription due to API error');
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    return `Transcription failed for "${fileName}". The transcription service may be experiencing issues. Please try again later or enter the transcription manually.`;
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