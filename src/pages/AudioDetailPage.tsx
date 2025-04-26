import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, Tag, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import AudioPlayer from '../components/audio/AudioPlayer';

const AudioDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentAudio, fetchAudioById, isLoading, error } = useAppStore();
  
  useEffect(() => {
    if (id) {
      fetchAudioById(parseInt(id));
    }
  }, [id, fetchAudioById]);
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !currentAudio) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Audio Not Found</h2>
        <p className="text-gray-600 mb-6">The audio you're looking for couldn't be found or doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Navigation */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Home
        </Link>
      </div>
      
      {/* Audio Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{currentAudio.title}</h1>
      
      {/* Audio Player */}
      <AudioPlayer 
        audioUrl={currentAudio.audioUrl || ''} 
        transcription={currentAudio.transcription} 
      />
      
      {/* Audio Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-700">{currentAudio.description || 'No description available'}</p>
            </div>
            
            {/* Created By */}
            {/* <div className="flex items-center">
              <User size={16} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{currentAudio.author || 'Unknown'}</span>
            </div> */}
            
            {/* Duration */}
            {/* <div className="flex items-center">
              <Clock size={16} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{currentAudio.duration || 'Unknown duration'}</span>
            </div> */}
          </div>
          
          <div className="space-y-4">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {currentAudio.categories && currentAudio.categories.length > 0 ? (
                  currentAudio.categories.map((category, index) => (
                    <Link
                      key={index}
                      to={`/category/${category.toLowerCase()}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
                    >
                      <Tag size={14} className="mr-1" />
                      {category}
                    </Link>
                  ))
                ) : (
                  <span className="text-gray-500">No categories</span>
                )}
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentAudio.tags && currentAudio.tags.length > 0 ? (
                  currentAudio.tags.map((tag, index) => (
                    <Link
                      key={index}
                      to={`/search?tags=${tag.id}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                    >
                      <Tag size={14} className="mr-1" />
                      {/* Handle both 'name' and 'title' properties for flexibility */}
                      {tag.name || tag.title}
                    </Link>
                  ))
                ) : (
                  <span className="text-gray-500">No tags</span>
                )}
              </div>
            </div>

            {/* Additional Metadata */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Date Added:</div>
                <div className="text-gray-700">{new Date(currentAudio.createdAt || Date.now()).toLocaleDateString()}</div>
                
                <div className="text-gray-500">File Format:</div>
                <div className="text-gray-700">{currentAudio.fileFormat || 'Unknown'}</div>
                
                {/* <div className="text-gray-500">File Size:</div> */}
                {/* <div className="text-gray-700">{currentAudio.fileSize ? `${(currentAudio.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</div> */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Download Button */}
        <div className="mt-8">
          <a 
            href={currentAudio.audioUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            download={currentAudio.title}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Download Audio
          </a>
        </div>
      </div>
    </div>
  );
};

export default AudioDetailPage;