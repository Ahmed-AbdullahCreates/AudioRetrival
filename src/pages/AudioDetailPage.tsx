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
  
  const { title, description, transcription, url, uploaded_at, category_title, tags } = currentAudio;
  
  const formattedDate = new Date(uploaded_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // return (
  //   // <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  //   //   <div className="mb-4">
  //   //     <Link
  //   //       to="/"
  //   //       className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
  //   //     >
  //   //       <ArrowLeft size={16} className="mr-1" />
  //   //       Back to Home
  //   //     </Link>
  //   //   </div>
      
  //   //   <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      
  //   //   <div className="flex flex-wrap gap-3 mb-6">
  //   //     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
  //   //       {category_title}
  //   //     </span>
        
  //   //     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
  //   //       <Clock size={12} className="mr-1" />
  //   //       {formattedDate}
  //   //     </span>
        
  //   //     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
  //   //       <User size={12} className="mr-1" />
  //   //       Anonymous
  //   //     </span>
  //   //   </div>
      
  //   //   <AudioPlayer audioUrl={url} transcription={transcription} />
      
  //   //   {description && (
  //   //     <div className="mb-8">
  //   //       <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
  //   //       <p className="text-gray-700 whitespace-pre-line">{description}</p>
  //   //     </div>
  //   //   )}
      
  //   //   {tags && tags.length > 0 && (
  //   //     <div className="mb-8">
  //   //       <h2 className="text-xl font-bold text-gray-900 mb-3">Tags</h2>
  //   //       <div className="flex flex-wrap gap-2">
  //   //         {tags.map(tag => (
  //   //           <Link
  //   //             key={tag.id}
  //   //             to={`/search?tags=${tag.id}`}
  //   //             className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
  //   //           >
  //   //             <Tag size={12} className="mr-1" />
  //   //             {tag.name}
  //   //           </Link>
  //   //         ))}
  //   //       </div>
  //   //     </div>
  //   //   )}
  //   // </div>
  // );
};

export default AudioDetailPage;