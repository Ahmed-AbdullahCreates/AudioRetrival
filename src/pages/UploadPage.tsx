import { FileAudio, HelpCircle, Info } from 'lucide-react';
import UploadForm from '../components/upload/UploadForm';

const UploadPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FileAudio size={28} className="text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Upload Audio</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Share your audio with the world. Complete the form below with details about your content.
        </p>
      </div>
      
      {/* Tips Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Tips for a great upload</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc space-y-1 pl-5">
                <li>Use a clear, descriptive title that helps others find your audio</li>
                <li>Choose the most appropriate category for your content</li>
                <li>Add relevant tags to increase discoverability</li>
                <li>Include a transcription to make your content accessible to more people</li>
                <li>Supported formats: MP3, WAV, M4A, OGG, OCC (maximum size: 30MB)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Container */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 sm:p-8">
        <UploadForm />
      </div>
      
      {/* Help Section */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center text-sm text-gray-500">
          <HelpCircle size={14} className="mr-1" />
          Need help? Check our <a href="#" className="text-primary-600 hover:text-primary-800 mx-1">upload guidelines</a><a href="#" className="text-primary-600 hover:text-primary-800 mx-1"></a>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;