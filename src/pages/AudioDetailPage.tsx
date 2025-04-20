import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, User, Tag, ArrowLeft, Download, Share2, 
  Bookmark, PlusCircle, Volume2, Calendar, FileText,
  HardDrive, Waveform, Info, Music
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import AudioPlayer from '../components/audio/AudioPlayer';
import AudioCard from '../components/audio/AudioCard';
import { Audio } from '../types';

const AudioDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentAudio, fetchAudioById, isLoading, error, audios } = useAppStore();
  const [relatedAudios, setRelatedAudios] = useState<Audio[]>([]);
  
  useEffect(() => {
    if (id) {
      fetchAudioById(parseInt(id));
    }
  }, [id, fetchAudioById]);
  
  // Generate related audios based on category
  useEffect(() => {
    if (currentAudio && audios.length > 0) {
      const related = audios
        .filter(audio => 
          audio.id !== currentAudio.id && 
          audio.category_id === currentAudio.category_id
        )
        .slice(0, 3);
      setRelatedAudios(related);
    }
  }, [currentAudio, audios]);
  
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !currentAudio) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-red-50 border border-red-100 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Audio Not Found</h2>
          <p className="text-gray-600 mb-6">The audio you're looking for couldn't be found or doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Format the date nicely
  const formattedDate = currentAudio.uploaded_at 
    ? new Date(currentAudio.uploaded_at).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })
    : 'Unknown date';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center text-sm font-medium text-gray-500 mb-5">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${currentAudio.category_id}`} className="hover:text-primary-600">
          {currentAudio.category_title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 truncate">
          {currentAudio.title}
        </span>
      </nav>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Audio Title and Badge */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 mr-3">
                <Music size={14} className="mr-1.5" />
                {currentAudio.category_title}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <Clock size={14} className="mr-1.5" />
                {currentAudio.duration || 'Unknown duration'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{currentAudio.title}</h1>
          </div>
          
          {/* Audio Player with gradient background */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 shadow-sm mb-8">
            <AudioPlayer 
              audioUrl={currentAudio.audioUrl || currentAudio.url} 
              transcription={currentAudio.transcription} 
            />
          </div>
          
          {/* Description Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Info size={18} className="mr-2 text-primary-500" />
              About This Audio
            </h2>
            
            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {currentAudio.description || 'No description available for this audio file.'}
            </p>
            
            {/* Tags */}
            {currentAudio.tags && currentAudio.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {currentAudio.tags.map(tag => (
                    <Link 
                      key={tag.id} 
                      to={`/search?tags=${tag.id}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      <Tag size={12} className="mr-1" />
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Transcription */}
          {currentAudio.transcription && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText size={18} className="mr-2 text-primary-500" />
                Transcription
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{currentAudio.transcription}</p>
              </div>
            </div>
          )}
          
          {/* Related Audio */}
          {relatedAudios.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Waveform size={18} className="mr-2 text-primary-500" />
                Related Audio
              </h2>
              <div className="space-y-4">
                {relatedAudios.map(audio => (
                  <AudioCard key={audio.id} audio={audio} compact />
                ))}
                
                <Link 
                  to={`/category/${currentAudio.category_id}`}
                  className="inline-flex items-center text-primary-600 hover:text-primary-800 mt-4"
                >
                  <PlusCircle size={16} className="mr-1.5" />
                  View more in {currentAudio.category_title}
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 mb-8">
            <a 
              href={currentAudio.audioUrl || currentAudio.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              download={currentAudio.title}
              className="inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Download size={18} className="mr-2" />
              Download Audio
            </a>
            
            <button 
              className="inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: currentAudio.title,
                    text: currentAudio.description || 'Check out this audio',
                    url: window.location.href
                  })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                    .then(() => alert('Link copied to clipboard!'))
                }
              }}
            >
              <Share2 size={18} className="mr-2" />
              Share
            </button>
            
            <button 
              className="inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Bookmark size={18} className="mr-2" />
              Save to Collection
            </button>
          </div>
          
          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">Audio Details</h3>
            
            <dl className="space-y-4">
              {/* Created By */}
              <div className="flex items-start">
                <dt className="flex-shrink-0">
                  <User size={16} className="text-gray-400 mr-3 mt-0.5" />
                </dt>
                <dd>
                  <span className="text-sm text-gray-500 block">Created By</span>
                  <span className="text-gray-900">{currentAudio.author || 'Unknown'}</span>
                </dd>
              </div>
              
              {/* Upload Date */}
              <div className="flex items-start">
                <dt className="flex-shrink-0">
                  <Calendar size={16} className="text-gray-400 mr-3 mt-0.5" />
                </dt>
                <dd>
                  <span className="text-sm text-gray-500 block">Upload Date</span>
                  <span className="text-gray-900">{formattedDate}</span>
                </dd>
              </div>
              
              {/* Category */}
              <div className="flex items-start">
                <dt className="flex-shrink-0">
                  <Tag size={16} className="text-gray-400 mr-3 mt-0.5" />
                </dt>
                <dd>
                  <span className="text-sm text-gray-500 block">Category</span>
                  <Link 
                    to={`/category/${currentAudio.category_id}`}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    {currentAudio.category_title}
                  </Link>
                </dd>
              </div>
              
              {/* Duration */}
              <div className="flex items-start">
                <dt className="flex-shrink-0">
                  <Clock size={16} className="text-gray-400 mr-3 mt-0.5" />
                </dt>
                <dd>
                  <span className="text-sm text-gray-500 block">Duration</span>
                  <span className="text-gray-900">{currentAudio.duration || 'Unknown'}</span>
                </dd>
              </div>
              
              {/* File Format & Size */}
              {(currentAudio.fileFormat || currentAudio.fileSize) && (
                <div className="flex items-start">
                  <dt className="flex-shrink-0">
                    <HardDrive size={16} className="text-gray-400 mr-3 mt-0.5" />
                  </dt>
                  <dd>
                    <span className="text-sm text-gray-500 block">File Info</span>
                    <span className="text-gray-900">
                      {currentAudio.fileFormat || 'MP3'}
                      {currentAudio.fileSize && (
                        <> • {(currentAudio.fileSize / 1024 / 1024).toFixed(2)} MB</>
                      )}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioDetailPage;