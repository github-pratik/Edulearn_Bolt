import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Eye, User, Crown, Volume2, Shield, MessageCircle, Globe, Calendar } from 'lucide-react';
import { generateVideoSummary } from '../../lib/integrations/elevenlabs';
import DemoFeatures from '../Demo/DemoFeatures';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    duration?: number;
    view_count: number;
    subject: string;
    grade_level: string;
    is_premium: boolean;
    premium_price?: number | null;
    voice_summary_url?: string | null;
    created_at: string;
    uploader: {
      full_name: string;
    };
  };
  viewMode?: 'grid' | 'list';
}

const VideoCard: React.FC<VideoCardProps> = ({ video, viewMode = 'grid' }) => {
  const [playingAudio, setPlayingAudio] = useState(false);
  const [showDemoFeatures, setShowDemoFeatures] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const playVoiceSummary = async () => {
    if (playingAudio) return;

    setPlayingAudio(true);
    try {
      let audioUrl = video.voice_summary_url;
      
      if (!audioUrl) {
        audioUrl = await generateVideoSummary(video.title, video.description || '');
      }
      
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setPlayingAudio(false);
        audio.onerror = () => setPlayingAudio(false);
        await audio.play();
      }
    } catch (error) {
      console.error('Failed to play voice summary:', error);
    } finally {
      if (!video.voice_summary_url) {
        setPlayingAudio(false);
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="glass-card p-4 hover:shadow-glass-lg transition-all duration-300">
          <div className="flex space-x-4">
            {/* Thumbnail */}
            <Link to={`/watch/${video.id}`} className="flex-shrink-0">
              <div className="relative w-48 aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden">
                {video.thumbnail_url ? (
                  <>
                    {!imageLoaded && (
                      <div className="absolute inset-0 shimmer"></div>
                    )}
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      } hover:scale-105`}
                      onLoad={() => setImageLoaded(true)}
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 via-secondary-100 to-accent-100 flex items-center justify-center">
                    <Play size={24} className="text-primary-400" />
                  </div>
                )}
                
                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}
                
                {/* Premium Badge */}
                {video.is_premium && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                    <Crown size={10} />
                    <span>Premium</span>
                  </div>
                )}
              </div>
            </Link>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <Link to={`/watch/${video.id}`}>
                <h3 className="font-semibold text-neutral-800 line-clamp-2 hover:text-primary-600 transition-colors duration-200">
                  {video.title}
                </h3>
              </Link>
              
              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                  <User size={10} className="text-white" />
                </div>
                <span>{video.uploader.full_name}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-neutral-500">
                <div className="flex items-center space-x-1">
                  <Eye size={12} />
                  <span>{formatViewCount(video.view_count)} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{formatTimeAgo(video.created_at)}</span>
                </div>
              </div>
              
              {video.description && (
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {video.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full">
                    {video.subject}
                  </span>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full">
                    {video.grade_level}
                  </span>
                  {video.is_premium && video.premium_price && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 text-xs font-medium rounded-full">
                      ${video.premium_price}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      playVoiceSummary();
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      playingAudio 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-neutral-100 text-neutral-400 hover:bg-primary-50 hover:text-primary-500'
                    }`}
                    title="Play voice summary"
                  >
                    <Volume2 size={14} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDemoFeatures(true);
                    }}
                    className="p-2 rounded-lg bg-neutral-100 text-neutral-400 hover:bg-blue-50 hover:text-blue-500 transition-all duration-200"
                    title="Demo features"
                  >
                    <Shield size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Features Modal */}
        <DemoFeatures
          showModal={showDemoFeatures}
          onClose={() => setShowDemoFeatures(false)}
        />
      </>
    );
  }

  // Grid view (default)
  return (
    <>
      <div className="glass-card video-card-hover group cursor-pointer overflow-hidden">
        <Link to={`/watch/${video.id}`}>
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden">
            {video.thumbnail_url ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 shimmer"></div>
                )}
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  } group-hover:scale-110`}
                  onLoad={() => setImageLoaded(true)}
                />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 via-secondary-100 to-accent-100 flex items-center justify-center">
                <Play size={48} className="text-primary-400 group-hover:text-primary-600 transition-colors duration-300" />
              </div>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Duration Badge */}
            {video.duration && (
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
                {formatDuration(video.duration)}
              </div>
            )}
            
            {/* Premium Badge */}
            {video.is_premium && (
              <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium rounded-full flex items-center space-x-1 shadow-glass premium-glow">
                <Crown size={12} />
                <span>Premium</span>
              </div>
            )}
            
            {/* Subject Badge */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-medium rounded-full shadow-glass">
              {video.subject}
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-glass-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <Play size={24} className="text-primary-600 ml-1" />
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-neutral-800 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200 leading-tight">
              {video.title}
            </h3>
            
            <div className="flex items-center space-x-2 text-sm text-neutral-500">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
              <span className="font-medium">{video.uploader.full_name}</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-neutral-500">
              <div className="flex items-center space-x-1">
                <Eye size={14} />
                <span>{formatViewCount(video.view_count)} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{formatTimeAgo(video.created_at)}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full">
                {video.grade_level}
              </span>
              
              {video.is_premium && video.premium_price && (
                <span className="px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 text-xs font-medium rounded-full">
                  ${video.premium_price}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Voice Summary */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  playVoiceSummary();
                }}
                className={`p-2 rounded-lg transition-all duration-200 micro-bounce ${
                  playingAudio 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'bg-neutral-100 text-neutral-400 hover:bg-primary-50 hover:text-primary-500'
                }`}
                title="Play voice summary"
              >
                <Volume2 size={16} />
              </button>

              {/* Demo Features */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowDemoFeatures(true);
                }}
                className="p-2 rounded-lg bg-neutral-100 text-neutral-400 hover:bg-blue-50 hover:text-blue-500 transition-all duration-200 micro-bounce"
                title="View demo features"
              >
                <Shield size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowDemoFeatures(true);
                }}
                className="p-2 rounded-lg bg-neutral-100 text-neutral-400 hover:bg-orange-50 hover:text-orange-500 transition-all duration-200 micro-bounce"
                title="Community features"
              >
                <MessageCircle size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowDemoFeatures(true);
                }}
                className="p-2 rounded-lg bg-neutral-100 text-neutral-400 hover:bg-green-50 hover:text-green-500 transition-all duration-200 micro-bounce"
                title="Domain features"
              >
                <Globe size={16} />
              </button>
            </div>

            {/* Status Badge */}
            <div className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 text-xs font-medium rounded-full">
              Demo Ready
            </div>
          </div>
        </div>
      </div>

      {/* Demo Features Modal */}
      <DemoFeatures
        showModal={showDemoFeatures}
        onClose={() => setShowDemoFeatures(false)}
      />
    </>
  );
};

export default VideoCard;