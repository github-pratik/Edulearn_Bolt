import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Upload, Settings, Crown, Video, Eye, Calendar, Edit3, Save, X, Camera, Mail, GraduationCap, Award, TrendingUp, Users, Clock, Star, Shield, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { dummyVideos } from '../data/dummyVideos';
import ProfileSwitcher from '../components/Profile/ProfileSwitcher';
import UnifiedDashboard from '../components/Profile/UnifiedDashboard';

const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [currentProfileMode, setCurrentProfileMode] = useState<'student' | 'teacher' | 'all-in-one'>('student');
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalRevenue: 0,
    subscribers: 0
  });
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    reddit_username: profile?.reddit_username || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        reddit_username: profile.reddit_username || '',
      });
      
      // Initialize profile mode based on user role
      if (profile.role === 'teacher') {
        setCurrentProfileMode('teacher');
      } else if (profile.role === 'student') {
        setCurrentProfileMode('student');
      } else {
        setCurrentProfileMode('all-in-one');
      }
      
      fetchUserVideos();
    }
  }, [profile]);

  const handleModeChange = (mode: 'student' | 'teacher' | 'all-in-one') => {
    setCurrentProfileMode(mode);
  };

  const fetchUserVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('uploader_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database query failed, using demo data:', error);
        throw error;
      }

      setUserVideos(data || []);
      calculateStats(data || []);
    } catch (error) {
      // Use dummy data for demonstration
      const userDummyVideos = dummyVideos.slice(0, 3); // Show first 3 as user's videos
      setUserVideos(userDummyVideos);
      calculateStats(userDummyVideos);
    }
  };

  const calculateStats = (videos: any[]) => {
    const totalViews = videos.reduce((sum, video) => sum + video.view_count, 0);
    const totalRevenue = videos
      .filter(video => video.is_premium)
      .reduce((sum, video) => sum + (video.premium_price || 0) * Math.floor(video.view_count / 10), 0);
    
    setStats({
      totalVideos: videos.length,
      totalViews,
      totalRevenue,
      subscribers: Math.floor(totalViews / 50) // Estimate subscribers
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      reddit_username: profile?.reddit_username || '',
    });
    setEditing(false);
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubscriptionBadge = () => {
    switch (profile?.subscription_status) {
      case 'creator':
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium rounded-full">
            <Crown size={14} />
            <span>Creator</span>
          </div>
        );
      case 'premium':
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-sm font-medium rounded-full">
            <Star size={14} />
            <span>Premium</span>
          </div>
        );
      default:
        return (
          <div className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-medium rounded-full">
            Free
          </div>
        );
    }
  };

  const getUploadCapabilities = () => {
    if (profile?.subscription_status === 'creator' || profile?.role === 'teacher') {
      return {
        canUpload: true,
        monthlyLimit: null,
        maxFileSize: '500MB',
        tier: 'Creator/Teacher',
        features: ['Unlimited uploads', 'Large files', 'Monetization', 'Advanced analytics']
      };
    }
    
    if (profile?.subscription_status === 'premium') {
      return {
        canUpload: true,
        monthlyLimit: 15,
        maxFileSize: '250MB',
        tier: 'Premium',
        features: ['15 uploads/month', 'HD quality', 'Analytics', 'Priority support']
      };
    }
    
    return {
      canUpload: true,
      monthlyLimit: 5,
      maxFileSize: '100MB',
      tier: 'Free',
      features: ['5 uploads/month', 'Standard quality', 'Community support', 'Voice AI summaries']
    };
  };

  const uploadCapabilities = getUploadCapabilities();

  if (!user) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-200 to-red-300 flex items-center justify-center">
          <User size={32} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Please Sign In</h2>
        <p className="text-neutral-600 mb-6">You need to be logged in to view your profile.</p>
        <button
          onClick={() => navigate('/login')}
          className="glass-button btn-glass-primary"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="glass-card p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center shadow-glass-lg">
                <User size={40} className="text-white" />
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-glass border border-neutral-200 hover:bg-neutral-50 transition-colors">
                <Camera size={16} className="text-neutral-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="space-y-3">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Full Name"
                    className="glass-input px-4 py-2 text-lg font-bold"
                  />
                  <input
                    type="text"
                    value={formData.reddit_username}
                    onChange={(e) => setFormData(prev => ({ ...prev, reddit_username: e.target.value }))}
                    placeholder="Reddit Username (optional)"
                    className="glass-input px-4 py-2 text-sm"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-neutral-800">
                    {profile?.full_name || 'Anonymous User'}
                  </h1>
                  <div className="flex items-center space-x-3 text-neutral-600">
                    <div className="flex items-center space-x-1">
                      <Mail size={16} />
                      <span>{user.email}</span>
                    </div>
                    {profile?.reddit_username && (
                      <div className="flex items-center space-x-1">
                        <span>•</span>
                        <span>u/{profile.reddit_username}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-full capitalize">
                  <GraduationCap size={14} />
                  <span>{profile?.role || 'User'}</span>
                </div>
                {getSubscriptionBadge()}
                <div className="flex items-center space-x-1 text-sm text-neutral-500">
                  <Calendar size={14} />
                  <span>Joined {formatDate(profile?.created_at || user.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="glass-button border-neutral-200 text-neutral-600"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="glass-button btn-glass-primary"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="glass-button border-neutral-200 text-neutral-600"
                >
                  <Edit3 size={16} className="mr-2" />
                  Edit Profile
                </button>
                <Link
                  to="/upload"
                  className="glass-button btn-glass-primary flex items-center space-x-2"
                >
                  <Upload size={16} />
                  <span>Upload Video</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Mode Switcher */}
      <ProfileSwitcher
        currentMode={currentProfileMode}
        onModeChange={handleModeChange}
      />

      {/* Unified Dashboard */}
      <UnifiedDashboard profileMode={currentProfileMode} />

      {/* Upload Capabilities Banner */}
      <div className={`glass-card p-6 ${
        uploadCapabilities.tier === 'Creator/Teacher' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' :
        uploadCapabilities.tier === 'Premium' ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' :
        'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              uploadCapabilities.tier === 'Creator/Teacher' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
              uploadCapabilities.tier === 'Premium' ? 'bg-gradient-to-br from-blue-400 to-purple-500' :
              'bg-gradient-to-br from-green-400 to-emerald-500'
            } shadow-glass`}>
              {uploadCapabilities.tier === 'Creator/Teacher' ? (
                <Crown size={24} className="text-white" />
              ) : uploadCapabilities.tier === 'Premium' ? (
                <Star size={24} className="text-white" />
              ) : (
                <Shield size={24} className="text-white" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-neutral-800">
                {uploadCapabilities.tier} Upload Access
              </h3>
              <p className="text-neutral-600">
                {uploadCapabilities.monthlyLimit 
                  ? `${uploadCapabilities.monthlyLimit} uploads/month • ${uploadCapabilities.maxFileSize} files`
                  : `Unlimited uploads • ${uploadCapabilities.maxFileSize} files`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {uploadCapabilities.tier === 'Free' && (
              <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                100% Free Forever
              </div>
            )}
            <Link
              to="/upload"
              className="glass-button btn-glass-primary"
            >
              <Upload size={16} className="mr-2" />
              Upload Now
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {uploadCapabilities.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <Zap size={12} className={
                uploadCapabilities.tier === 'Creator/Teacher' ? 'text-yellow-600' :
                uploadCapabilities.tier === 'Premium' ? 'text-blue-600' :
                'text-green-600'
              } />
              <span className="text-neutral-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Account Settings */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <h3 className="font-medium text-neutral-800">Profile Mode</h3>
              <p className="text-sm text-neutral-600">
                Currently using {currentProfileMode === 'all-in-one' ? 'ALL-IN-ONE' : currentProfileMode} mode
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentProfileMode === 'all-in-one' ? 'bg-purple-100 text-purple-700' :
                currentProfileMode === 'teacher' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {currentProfileMode === 'all-in-one' ? 'ALL-IN-ONE' : currentProfileMode.charAt(0).toUpperCase() + currentProfileMode.slice(1)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <h3 className="font-medium text-neutral-800">Subscription Status</h3>
              <p className="text-sm text-neutral-600">
                {profile?.subscription_status === 'free' 
                  ? 'You are on the free plan with full upload access'
                  : `You have ${profile?.subscription_status} access with enhanced features`
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {getSubscriptionBadge()}
              {profile?.subscription_status === 'free' && (
                <Link
                  to="/premium"
                  className="glass-button btn-glass-primary text-sm"
                >
                  Explore Premium
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <h3 className="font-medium text-neutral-800">Upload Capabilities</h3>
              <p className="text-sm text-neutral-600">
                {uploadCapabilities.monthlyLimit 
                  ? `${uploadCapabilities.monthlyLimit} uploads per month • ${uploadCapabilities.maxFileSize} max file size`
                  : `Unlimited uploads • ${uploadCapabilities.maxFileSize} max file size`
                }
              </p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              <Upload size={14} />
              <span>Upload Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;