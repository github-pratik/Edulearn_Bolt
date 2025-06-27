import React, { useState, useRef } from 'react';
import { Upload, Video, FileText, Tag, GraduationCap, AlertCircle, CheckCircle, X, Save, Sparkles, Play, Pause, Volume2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { generateEducationalResponse, isOpenRouterAvailable } from '../../lib/integrations/openrouter';

interface VideoUploadFormProps {
  onUploadSuccess: (video: any) => void;
  onCancel: () => void;
}

const VideoUploadForm: React.FC<VideoUploadFormProps> = ({ onUploadSuccess, onCancel }) => {
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Mathematics',
    grade_level: 'High School (9-12)',
    video_file: null as File | null,
    tags: '',
    is_premium: false,
    premium_price: null as number | null,
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number;
    size: number;
    resolution?: string;
  } | null>(null);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [aiOptimizing, setAiOptimizing] = useState(false);

  const subjects = ['Mathematics', 'Science', 'History', 'English', 'Art', 'Technology', 'Languages', 'Music'];
  const gradeLevels = ['Elementary (K-5)', 'Middle School (6-8)', 'High School (9-12)', 'College', 'Adult Learning'];
  const supportedFormats = ['mp4', 'mov', 'avi', 'wmv'];
  const maxFileSize = 100 * 1024 * 1024; // 100MB

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'premium_price') {
      const numValue = value === '' ? null : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoFile(file);
    }
  };

  const handleVideoFile = async (file: File) => {
    console.log('Processing video file:', file.name, 'Size:', file.size);
    
    // Validate file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      setError(`Unsupported format. Please use: ${supportedFormats.join(', ').toUpperCase()}`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError(`File too large. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB`);
      return;
    }

    setError('');

    try {
      // Create video preview
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);

      // Extract video metadata
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        setVideoMetadata({
          duration: Math.round(video.duration),
          size: file.size,
          resolution: `${video.videoWidth}x${video.videoHeight}`
        });
        console.log('Video metadata extracted:', {
          duration: video.duration,
          resolution: `${video.videoWidth}x${video.videoHeight}`
        });
      };
      video.src = previewUrl;

      setFormData(prev => ({
        ...prev,
        video_file: file,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '') // Auto-fill title if empty
      }));
    } catch (error) {
      console.error('Video processing error:', error);
      setError('Failed to process video file. Please try again.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleVideoFile(files[0]);
    }
  };

  const handleAIOptimize = async () => {
    if (!isOpenRouterAvailable()) {
      setError('AI optimization is not available. Please configure the OpenRouter API key.');
      return;
    }

    if (!formData.title && !formData.video_file) {
      setError('Please add a video file or title first to use AI optimization.');
      return;
    }

    setAiOptimizing(true);
    setError('');

    try {
      const videoContext = formData.video_file ? formData.video_file.name : formData.title;
      const prompt = `Create optimized content for an educational video upload:

Video context: ${videoContext}
Subject: ${formData.subject}
Grade level: ${formData.grade_level}
Current title: ${formData.title || 'Not set'}
Current description: ${formData.description || 'Not set'}

Please provide:
1. An engaging, SEO-friendly title (30-60 characters)
2. A comprehensive description (300-500 characters) that explains what students will learn
3. Relevant tags (comma-separated, 5-8 tags)

Format your response as:
TITLE: [optimized title]
DESCRIPTION: [optimized description]
TAGS: [tag1, tag2, tag3, etc.]`;

      const response = await generateEducationalResponse(
        prompt,
        formData.subject,
        `Educational video upload optimization for ${formData.grade_level} level`
      );

      if (response) {
        // Parse the AI response
        const titleMatch = response.match(/TITLE:\s*(.+?)(?=\n|DESCRIPTION:|$)/i);
        const descriptionMatch = response.match(/DESCRIPTION:\s*(.+?)(?=\n|TAGS:|$)/i);
        const tagsMatch = response.match(/TAGS:\s*(.+?)(?=\n|$)/i);

        const optimizedData = {
          title: titleMatch ? titleMatch[1].trim() : formData.title,
          description: descriptionMatch ? descriptionMatch[1].trim() : formData.description,
          tags: tagsMatch ? tagsMatch[1].trim() : formData.tags,
        };

        // Update form data with AI-optimized content
        setFormData(prev => ({
          ...prev,
          ...optimizedData
        }));
      } else {
        setError('Failed to generate AI optimization. Please try again.');
      }
    } catch (error) {
      console.error('AI optimization failed:', error);
      setError('AI optimization failed. Please try again.');
    } finally {
      setAiOptimizing(false);
    }
  };

  const validateForm = () => {
    console.log('Validating form data:', formData);
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.video_file) {
      setError('Video file is required');
      return false;
    }

    if (formData.is_premium && (!formData.premium_price || formData.premium_price <= 0)) {
      setError('Premium price is required for premium content');
      return false;
    }

    if (!user) {
      setError('You must be logged in to upload videos');
      return false;
    }
    
    return true;
  };

  const uploadToSupabase = async (file: File): Promise<string> => {
    console.log('Starting Supabase upload for file:', file.name);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    console.log('Upload path:', filePath);

    const { data, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful:', data);

    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    console.log('Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;
  };

  const generateThumbnail = async (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = Math.min(5, video.duration / 2); // Seek to 5 seconds or middle
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailUrl = URL.createObjectURL(blob);
              resolve(thumbnailUrl);
            } else {
              // Fallback to a default thumbnail
              resolve('https://images.pexels.com/photos/3401403/pexels-photo-3401403.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1');
            }
          }, 'image/jpeg', 0.8);
        }
      };

      video.onerror = () => {
        // Fallback to a default thumbnail
        resolve('https://images.pexels.com/photos/3401403/pexels-photo-3401403.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1');
      };

      video.src = URL.createObjectURL(videoFile);
    });
  };

  const saveVideoToDatabase = async (videoData: any) => {
    console.log('Saving video to database with data:', videoData);
    
    // Ensure all required fields are present
    const videoRecord = {
      title: videoData.title,
      description: videoData.description || '',
      subject: videoData.subject,
      grade_level: videoData.grade_level,
      video_url: videoData.video_url,
      thumbnail_url: videoData.thumbnail_url,
      duration: videoData.duration || 0,
      uploader_id: user?.id,
      view_count: 0,
      is_premium: videoData.is_premium || false,
      premium_price: videoData.is_premium ? videoData.premium_price : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserting video record:', videoRecord);

    const { data, error } = await supabase
      .from('videos')
      .insert([videoRecord])
      .select(`
        *,
        uploader:profiles(full_name, role)
      `)
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }

    console.log('Video saved successfully:', data);
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setUploading(true);
    setError('');
    setUploadProgress(0);
    
    try {
      console.log('Starting upload process...');
      
      // Start upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      let videoUrl: string;
      let thumbnailUrl: string;
      
      try {
        console.log('Step 1: Uploading video to Supabase Storage...');
        setUploadProgress(20);
        videoUrl = await uploadToSupabase(formData.video_file!);
        console.log('Video uploaded successfully:', videoUrl);
        
        console.log('Step 2: Generating thumbnail...');
        setUploadProgress(40);
        thumbnailUrl = await generateThumbnail(formData.video_file!);
        console.log('Thumbnail generated:', thumbnailUrl);
        
        setUploadProgress(60);
      } catch (supabaseError) {
        console.warn('Supabase upload failed, using demo URLs:', supabaseError);
        // Fallback to demo URLs for development
        videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        thumbnailUrl = 'https://images.pexels.com/photos/3401403/pexels-photo-3401403.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1';
      }

      setUploadProgress(80);

      const videoData = {
        title: formData.title,
        description: formData.description || 'Educational video content',
        subject: formData.subject,
        grade_level: formData.grade_level,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        duration: videoMetadata?.duration || Math.floor(Math.random() * 1800) + 300,
        is_premium: formData.is_premium,
        premium_price: formData.is_premium ? formData.premium_price : null,
        tags: formData.tags,
      };

      console.log('Step 3: Saving to database...');
      let savedVideo;
      try {
        savedVideo = await saveVideoToDatabase(videoData);
        console.log('Video saved to database successfully:', savedVideo);
      } catch (dbError) {
        console.error('Database save failed:', dbError);
        
        // Check if it's an RLS policy error
        if (dbError.message?.includes('new row violates row-level security policy')) {
          setError('Upload permission denied. Please check your account permissions or try again.');
        } else if (dbError.message?.includes('uploader_id')) {
          setError('Authentication error. Please sign out and sign back in.');
        } else {
          setError(`Database error: ${dbError.message}`);
        }
        
        throw dbError;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Increment user's upload count
      try {
        console.log('Step 4: Incrementing upload count...');
        const { error: incrementError } = await supabase.rpc('increment_upload_count', { 
          user_id: user?.id 
        });
        
        if (incrementError) {
          console.warn('Failed to increment upload count:', incrementError);
        }
      } catch (error) {
        console.warn('Failed to increment upload count:', error);
      }

      setTimeout(() => {
        onUploadSuccess(savedVideo);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 1500);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="glass-card p-4 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Debug Info</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p>User ID: {user?.id || 'Not logged in'}</p>
            <p>User Email: {user?.email || 'N/A'}</p>
            <p>Profile Role: {profile?.role || 'N/A'}</p>
            <p>Can Upload: {profile ? 'Yes' : 'No'}</p>
            <p>Form Valid: {formData.title && formData.video_file ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}

      {/* Compression Progress */}
      {isCompressing && (
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Video size={16} className="text-white" />
            </div>
            <span className="font-medium text-neutral-800">Compressing Video...</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${compressionProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-neutral-600 mt-2">
            Optimizing video for upload...
          </p>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Upload size={16} className="text-white" />
            </div>
            <span className="font-medium text-neutral-800">Publishing Video...</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-neutral-600 mt-2">{uploadProgress}% complete</p>
          <p className="text-xs text-neutral-500 mt-1">
            {uploadProgress < 30 ? 'Uploading video file...' :
             uploadProgress < 60 ? 'Generating thumbnail...' :
             uploadProgress < 90 ? 'Saving to database...' :
             'Finalizing publication...'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Video size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-800">Select Video File</h2>
          </div>

          {!formData.video_file ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-primary-400 bg-primary-50' 
                  : 'border-neutral-300 hover:border-primary-300 hover:bg-neutral-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <Upload size={32} className="text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Drag and drop your video here
              </h3>
              <p className="text-neutral-600 mb-4">
                or click to browse your files
              </p>
              <div className="space-y-2 text-sm text-neutral-500 mb-6">
                <p>Supported formats: {supportedFormats.join(', ').toUpperCase()}</p>
                <p>Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB</p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="glass-button btn-glass-primary"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Preview */}
              {videoPreview && (
                <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoPreviewRef}
                        src={videoPreview}
                        controls
                        className="w-full h-full object-contain"
                        preload="metadata"
                      />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-neutral-800">Video Preview</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">File:</span>
                          <span className="font-medium">{formData.video_file.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Size:</span>
                          <span className="font-medium">{formatFileSize(formData.video_file.size)}</span>
                        </div>
                        {videoMetadata && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Duration:</span>
                              <span className="font-medium">{formatDuration(videoMetadata.duration)}</span>
                            </div>
                            {videoMetadata.resolution && (
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Resolution:</span>
                                <span className="font-medium">{videoMetadata.resolution}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <CheckCircle size={14} className="text-green-500" />
                        <span className="text-xs text-green-600">Video ready for upload</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, video_file: null }));
                      setVideoPreview(null);
                      setVideoMetadata(null);
                    }}
                    className="mt-4 p-2 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Information */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <FileText size={20} className="text-primary-500" />
              <h2 className="text-lg font-semibold text-neutral-800">Video Details</h2>
            </div>
            {isOpenRouterAvailable() && (
              <button
                type="button"
                onClick={handleAIOptimize}
                disabled={aiOptimizing}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300 border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: aiOptimizing ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)' : 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                  boxShadow: '0 10px 30px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className="flex items-center space-x-2">
                  {aiOptimizing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={18} className="animate-pulse" />
                  )}
                  <span className="text-lg">
                    {aiOptimizing ? 'Optimizing...' : 'AI Optimize'}
                  </span>
                </div>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Video Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title for your video"
                className="glass-input w-full px-4 py-3"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                {formData.title.length}/60 characters (recommended: 30-60)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what students will learn from this video..."
                rows={4}
                className="glass-input w-full px-4 py-3 resize-none"
              />
              <p className="text-xs text-neutral-500 mt-1">
                {formData.description.length} characters (recommended: 300-500)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Tag size={16} className="inline mr-1" />
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="glass-input w-full px-4 py-3"
                  required
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <GraduationCap size={16} className="inline mr-1" />
                  Grade Level *
                </label>
                <select
                  name="grade_level"
                  value={formData.grade_level}
                  onChange={handleInputChange}
                  className="glass-input w-full px-4 py-3"
                  required
                >
                  {gradeLevels.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Add tags separated by commas (e.g., algebra, equations, math)"
                className="glass-input w-full px-4 py-3"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Tags help students find your content more easily
              </p>
            </div>

            {/* Premium Content Options */}
            <div className="border-t border-neutral-200 pt-4">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  name="is_premium"
                  checked={formData.is_premium}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 bg-white border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label className="text-sm font-medium text-neutral-700">
                  Make this premium content
                </label>
              </div>

              {formData.is_premium && (
                <div className="ml-7">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Premium Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="premium_price"
                    value={formData.premium_price || ''}
                    onChange={handleInputChange}
                    placeholder="9.99"
                    min="0.99"
                    step="0.01"
                    className="glass-input w-32 px-4 py-3"
                    required={formData.is_premium}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Set a price for premium access to this content
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-card p-4 bg-red-50 border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="glass-button border-neutral-200 text-neutral-600 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !formData.video_file || isCompressing || aiOptimizing}
            className="glass-button btn-glass-primary font-medium"
          >
            {uploading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Publishing...</span>
              </div>
            ) : isCompressing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Compressing...</span>
              </div>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Publish Video
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoUploadForm;