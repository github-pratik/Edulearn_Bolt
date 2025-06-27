import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import VideoUploadForm from '../components/Upload/VideoUploadForm';

const UploadPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<any>(null);

  const handleUploadSuccess = (video: any) => {
    setUploadedVideo(video);
    setUploadSuccess(true);
    setShowUploadForm(false);
  };

  if (!user) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-200 to-red-300 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Authentication Required</h2>
        <p className="text-neutral-600 mb-6">You need to be logged in to upload videos.</p>
        <button
          onClick={() => navigate('/login')}
          className="glass-button btn-glass-primary"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (uploadSuccess && uploadedVideo) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-glass-lg">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-4">Upload Successful!</h2>
          <p className="text-xl text-neutral-600 mb-8">
            Your video "{uploadedVideo.title}" has been uploaded successfully.
          </p>
          
          {/* Video Preview */}
          <div className="max-w-md mx-auto mb-8">
            <div className="glass-card overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200">
                <img
                  src={uploadedVideo.thumbnail_url}
                  alt={uploadedVideo.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-neutral-800 mb-2">{uploadedVideo.title}</h3>
                <div className="flex items-center justify-between text-sm text-neutral-600">
                  <span>{uploadedVideo.subject}</span>
                  <span>{uploadedVideo.grade_level}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setUploadSuccess(false);
                setUploadedVideo(null);
                setShowUploadForm(false);
              }}
              className="glass-button border-neutral-200 text-neutral-600"
            >
              Upload Another
            </button>
            <button
              onClick={() => navigate(`/watch/${uploadedVideo.id}`)}
              className="glass-button btn-glass-primary"
            >
              Watch Video
            </button>
            <button
              onClick={() => navigate('/')}
              className="glass-button btn-glass-secondary"
            >
              View All Videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showUploadForm) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowUploadForm(false)}
            className="glass-button border-neutral-200 text-neutral-600"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Upload Video</h1>
            <p className="text-neutral-600">Share your knowledge with the world</p>
          </div>
        </div>

        <VideoUploadForm
          onUploadSuccess={handleUploadSuccess}
          onCancel={() => setShowUploadForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glass">
            <Upload size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Upload Video</h1>
            <p className="text-neutral-600">Share educational content with students worldwide</p>
          </div>
        </div>
      </div>

      {/* Simple Upload Interface */}
      <div className="glass-card p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
          <Upload size={40} className="text-primary-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">
          Ready to Upload Your Video?
        </h2>
        
        <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
          Upload your educational videos and share knowledge with students around the world. 
          Our platform supports multiple video formats and provides a simple upload process.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">MP4, MOV</div>
            <div className="text-sm text-neutral-600">AVI, WMV</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">Unlimited</div>
            <div className="text-sm text-neutral-600">File Size</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">HD Quality</div>
            <div className="text-sm text-neutral-600">Video Support</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">Free</div>
            <div className="text-sm text-neutral-600">Always</div>
          </div>
        </div>

        <button
          onClick={() => setShowUploadForm(true)}
          className="glass-button btn-glass-primary px-8 py-4 text-lg font-medium"
        >
          <Upload size={20} className="mr-3" />
          Start Upload
        </button>

        <p className="text-xs text-neutral-500 mt-6">
          By uploading, you agree to our Terms of Service and Community Guidelines
        </p>
      </div>

      {/* Upload Instructions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">How to Upload</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              1
            </div>
            <h4 className="font-medium text-neutral-800 mb-2">Click Upload</h4>
            <p className="text-sm text-neutral-600">Click the "Start Upload" button above</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
              2
            </div>
            <h4 className="font-medium text-neutral-800 mb-2">Select File</h4>
            <p className="text-sm text-neutral-600">Drag & drop or browse for your video file</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
              3
            </div>
            <h4 className="font-medium text-neutral-800 mb-2">Wait for Upload</h4>
            <p className="text-sm text-neutral-600">Monitor progress bar during upload</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
              4
            </div>
            <h4 className="font-medium text-neutral-800 mb-2">Add Details</h4>
            <p className="text-sm text-neutral-600">Add title, description, and tags</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold">
              5
            </div>
            <h4 className="font-medium text-neutral-800 mb-2">Publish</h4>
            <p className="text-sm text-neutral-600">Click publish to make it live</p>
          </div>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Supported Formats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['MP4', 'MOV', 'AVI', 'WMV'].map((format) => (
            <div key={format} className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-lg">
              <CheckCircle size={16} className="text-green-500" />
              <span className="font-medium text-neutral-800">{format}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-neutral-600 mt-4">
          Maximum file size: Unlimited • Recommended resolution: 720p or higher
        </p>
      </div>
    </div>
  );
};

export default UploadPage;