import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, ThumbsUp, Share, Download, Clock, User, Calendar, Crown, Bot, Volume2, Sparkles, Brain } from 'lucide-react';
import VideoPlayer from '../components/Video/VideoPlayer';
import VideoCard from '../components/Video/VideoCard';
import PaywallModal from '../components/Premium/PaywallModal';
import AITutorChat from '../components/AI/AITutorChat';
import DeepSeekChat from '../components/AI/DeepSeekChat';
import VideoAnalysisPanel from '../components/AI/VideoAnalysisPanel';
import DemoFeatures from '../components/Demo/DemoFeatures';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { checkSubscriptionStatus, isRevenueCatAvailable } from '../lib/integrations/revenuecat';
import { isOpenRouterAvailable } from '../lib/integrations/openrouter';
import { dummyVideos, dummyTimestamps, dummyComments } from '../data/dummyVideos';

const WatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<any>(null);
  const [timestamps, setTimestamps] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showAITutor, setShowAITutor] = useState(false);
  const [showDeepSeekChat, setShowDeepSeekChat] = useState(false);
  const [showDemoFeatures, setShowDemoFeatures] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const { user, profile } = useAuth();

  useEffect(() => {
    if (videoId) {
      fetchVideoData();
    }
  }, [videoId]);

  useEffect(() => {
    if (video && user) {
      checkVideoAccess();
    }
  }, [video, user, profile]);

  const checkVideoAccess = async () => {
    if (!video.is_premium) {
      setHasAccess(true);
      return;
    }

    if (!user) {
      setHasAccess(false);
      return;
    }

    try {
      if (isRevenueCatAvailable()) {
        const subscriptionStatus = await checkSubscriptionStatus();
        setHasAccess(subscriptionStatus === 'premium' || subscriptionStatus === 'creator');
      } else {
        // Fallback: check profile subscription status from database
        setHasAccess(
          profile?.subscription_status === 'premium' || 
          profile?.subscription_status === 'creator' ||
          profile?.is_trial === true
        );
      }
    } catch (error) {
      console.error('Failed to check access:', error);
      // Fallback to profile-based check
      setHasAccess(
        profile?.subscription_status === 'premium' || 
        profile?.subscription_status === 'creator' ||
        profile?.is_trial === true
      );
    }
  };

  const fetchVideoData = async () => {
    try {
      // Fetch video details
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select(`
          *,
          uploader:profiles(full_name, role)
        `)
        .eq('id', videoId)
        .single();

      if (videoError) {
        console.warn('Database query failed, using demo data:', videoError);
        throw videoError;
      }

      // Fetch timestamps
      const { data: timestampData, error: timestampError } = await supabase
        .from('video_timestamps')
        .select('*')
        .eq('video_id', videoId)
        .order('time_seconds', { ascending: true });

      if (timestampError) {
        console.warn('Failed to fetch timestamps:', timestampError);
      }

      // Fetch comments
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(full_name)
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (commentError) {
        console.warn('Failed to fetch comments:', commentError);
      }

      // Fetch related videos
      const { data: relatedData, error: relatedError } = await supabase
        .from('videos')
        .select(`
          *,
          uploader:profiles(full_name)
        `)
        .eq('subject', videoData.subject)
        .neq('id', videoId)
        .limit(6);

      if (relatedError) {
        console.warn('Failed to fetch related videos:', relatedError);
      }

      setVideo(videoData);
      setTimestamps(timestampData || []);
      setComments(commentData || []);
      setRelatedVideos(relatedData || []);

      // Increment view count
      await supabase
        .from('videos')
        .update({ view_count: videoData.view_count + 1 })
        .eq('id', videoId);

    } catch (error) {
      console.warn('Error fetching video data, loading demo content:', error);
      // Use dummy data for demonstration
      const foundVideo = dummyVideos.find(v => v.id === videoId);
      if (foundVideo) {
        setVideo(foundVideo);
        setTimestamps(dummyTimestamps[videoId as keyof typeof dummyTimestamps] || []);
        setComments(dummyComments[videoId as keyof typeof dummyComments] || []);
        
        // Get related videos from same subject
        const related = dummyVideos
          .filter(v => v.subject === foundVideo.subject && v.id !== videoId)
          .slice(0, 6);
        setRelatedVideos(related);
      } else {
        // Fallback to first video if specific ID not found
        setVideo(dummyVideos[0]);
        setTimestamps(dummyTimestamps['1'] || []);
        setComments(dummyComments['1'] || []);
        setRelatedVideos(dummyVideos.slice(1, 7));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWatchClick = () => {
    if (video.is_premium && !hasAccess) {
      setShowPaywall(true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-200 aspect-video rounded-lg animate-pulse mb-4"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="bg-gray-200 w-32 h-20 rounded animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Video not found</h2>
        <p className="text-gray-600">The video you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Video Player */}
        {video.is_premium && !hasAccess ? (
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            <div className="text-center text-white p-8">
              <Crown className="mx-auto mb-4 text-yellow-400" size={64} />
              <h3 className="text-xl font-bold mb-2">Premium Content</h3>
              <p className="mb-4">This video requires a premium subscription to watch.</p>
              <button
                onClick={handleWatchClick}
                className="btn btn-primary"
              >
                Subscribe to Watch
              </button>
            </div>
          </div>
        ) : (
          <VideoPlayer
            videoUrl={video.video_url}
            title={video.title}
            timestamps={timestamps}
          />
        )}

        {/* Video Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {video.title}
                {video.is_premium && (
                  <Crown className="inline ml-2 text-yellow-500" size={24} />
                )}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Eye size={16} />
                  <span>{formatViewCount(video.view_count)} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>{formatDate(video.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Volume2 size={16} className="text-blue-500" />
                  <span>Voice Enhanced</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge badge-primary">{video.subject}</span>
                <span className="badge badge-secondary">{video.grade_level}</span>
                {video.is_premium && (
                  <span className="badge badge-warning">
                    <Crown size={12} className="mr-1" />
                    Premium ${video.premium_price}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAITutor(true)}
                className="btn btn-outline btn-sm flex items-center space-x-2"
              >
                <Bot size={16} />
                <span>AI Tutor</span>
              </button>
              
              {isOpenRouterAvailable() && (
                <button
                  onClick={() => setShowDeepSeekChat(true)}
                  className="btn btn-primary btn-sm flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 border-0"
                >
                  <Brain size={16} />
                  <span>DeepSeek AI</span>
                </button>
              )}
              
              <button
                onClick={() => setShowDemoFeatures(true)}
                className="btn btn-secondary btn-sm flex items-center space-x-2"
              >
                <Sparkles size={16} />
                <span>Demo</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{video.uploader.full_name}</h3>
                <p className="text-sm text-gray-600 capitalize">{video.uploader.role}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="btn btn-outline btn-sm">
                <ThumbsUp size={16} />
                Like
              </button>
              <button className="btn btn-outline btn-sm">
                <Share size={16} />
                Share
              </button>
              {(!video.is_premium || hasAccess) && (
                <button className="btn btn-outline btn-sm">
                  <Download size={16} />
                  Download
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
          </div>

          {/* AI Analysis Toggle */}
          {isOpenRouterAvailable() && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-indigo-200 transition-all duration-200"
              >
                <Brain size={16} />
                <span>{showAnalysis ? 'Hide' : 'Show'} AI Analysis</span>
              </button>
            </div>
          )}

          {/* AI Video Analysis */}
          <VideoAnalysisPanel
            videoTitle={video.title}
            videoDescription={video.description}
            subject={video.subject}
            isVisible={showAnalysis}
          />
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({comments.length})
          </h3>
          
          {/* Add Comment */}
          {user && (
            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
              <button
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{comment.user.full_name}</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Related Videos</h3>
        <div className="space-y-4">
          {relatedVideos.map((relatedVideo) => (
            <div key={relatedVideo.id} className="flex space-x-3">
              <div className="relative w-32 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                {relatedVideo.thumbnail_url ? (
                  <img
                    src={relatedVideo.thumbnail_url}
                    alt={relatedVideo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <User size={20} className="text-primary/60" />
                  </div>
                )}
                {relatedVideo.is_premium && (
                  <Crown size={12} className="absolute top-1 right-1 text-yellow-400" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                  {relatedVideo.title}
                </h4>
                <p className="text-xs text-gray-600">{relatedVideo.uploader.full_name}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{formatViewCount(relatedVideo.view_count)} views</span>
                  {relatedVideo.is_premium && (
                    <span className="text-yellow-600">${relatedVideo.premium_price}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        videoTitle={video.title}
        creatorName={video.uploader.full_name}
        onPurchaseSuccess={() => {
          setHasAccess(true);
          setShowPaywall(false);
        }}
      />

      {/* AI Tutor Chat */}
      <AITutorChat
        isOpen={showAITutor}
        onClose={() => setShowAITutor(false)}
        tutorName={`${video.subject} Tutor`}
        subject={video.subject}
        userId={user?.id || 'anonymous'}
      />

      {/* DeepSeek Chat */}
      <DeepSeekChat
        isOpen={showDeepSeekChat}
        onClose={() => setShowDeepSeekChat(false)}
        subject={video.subject}
        videoContext={{
          title: video.title,
          description: video.description
        }}
      />

      {/* Demo Features Modal */}
      <DemoFeatures
        showModal={showDemoFeatures}
        onClose={() => setShowDemoFeatures(false)}
      />
    </div>
  );
};

export default WatchPage;