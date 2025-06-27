import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Video, Eye, TrendingUp, Clock, Star, Upload, Calendar, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { dummyVideos } from '../../data/dummyVideos';

interface UnifiedDashboardProps {
  profileMode: string;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ profileMode }) => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalRevenue: 0,
    subscribers: 0,
    watchTime: 0,
    completedCourses: 0
  });
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user, profileMode]);

  const fetchDashboardData = async () => {
    try {
      if (profileMode === 'teacher' || profileMode === 'all-in-one') {
        // Fetch teacher/creator stats
        const { data: videos, error } = await supabase
          .from('videos')
          .select('*')
          .eq('uploader_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        const totalViews = videos?.reduce((sum, video) => sum + video.view_count, 0) || 0;
        const totalRevenue = videos?.filter(v => v.is_premium).reduce((sum, video) => 
          sum + (video.premium_price || 0) * Math.floor(video.view_count / 10), 0) || 0;

        setStats(prev => ({
          ...prev,
          totalVideos: videos?.length || 0,
          totalViews,
          totalRevenue,
          subscribers: Math.floor(totalViews / 50)
        }));

        setRecentVideos(videos || []);
      } else {
        // Student stats - use dummy data for demo
        setStats(prev => ({
          ...prev,
          watchTime: 1250, // minutes
          completedCourses: 8,
          totalViews: 45 // videos watched
        }));

        setRecentVideos(dummyVideos.slice(0, 5));
      }
    } catch (error) {
      console.warn('Failed to fetch dashboard data, using demo data:', error);
      // Use dummy data as fallback
      setRecentVideos(dummyVideos.slice(0, 5));
      setStats({
        totalVideos: 3,
        totalViews: 15420,
        totalRevenue: 299.97,
        subscribers: 308,
        watchTime: 1250,
        completedCourses: 8
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatsForMode = () => {
    if (profileMode === 'student') {
      return [
        {
          title: 'Videos Watched',
          value: stats.totalViews,
          icon: Eye,
          color: 'from-blue-500 to-cyan-500',
          change: '+12 this week'
        },
        {
          title: 'Watch Time',
          value: `${Math.floor(stats.watchTime / 60)}h ${stats.watchTime % 60}m`,
          icon: Clock,
          color: 'from-green-500 to-emerald-500',
          change: '+2.5h this week'
        },
        {
          title: 'Courses Completed',
          value: stats.completedCourses,
          icon: Award,
          color: 'from-purple-500 to-indigo-500',
          change: '+2 this month'
        },
        {
          title: 'Learning Streak',
          value: '15 days',
          icon: TrendingUp,
          color: 'from-yellow-500 to-orange-500',
          change: 'Keep it up!'
        }
      ];
    }

    if (profileMode === 'teacher') {
      return [
        {
          title: 'Total Videos',
          value: stats.totalVideos,
          icon: Video,
          color: 'from-blue-500 to-cyan-500',
          change: '+2 this month'
        },
        {
          title: 'Total Views',
          value: formatNumber(stats.totalViews),
          icon: Eye,
          color: 'from-green-500 to-emerald-500',
          change: '+15% this month'
        },
        {
          title: 'Subscribers',
          value: formatNumber(stats.subscribers),
          icon: Users,
          color: 'from-purple-500 to-indigo-500',
          change: '+8% this month'
        },
        {
          title: 'Revenue',
          value: formatCurrency(stats.totalRevenue),
          icon: TrendingUp,
          color: 'from-yellow-500 to-orange-500',
          change: '+22% this month'
        }
      ];
    }

    // All-in-one mode
    return [
      {
        title: 'Videos Created',
        value: stats.totalVideos,
        icon: Video,
        color: 'from-blue-500 to-cyan-500',
        change: '+2 this month'
      },
      {
        title: 'Total Views',
        value: formatNumber(stats.totalViews),
        icon: Eye,
        color: 'from-green-500 to-emerald-500',
        change: '+15% this month'
      },
      {
        title: 'Watch Time',
        value: `${Math.floor(stats.watchTime / 60)}h`,
        icon: Clock,
        color: 'from-purple-500 to-indigo-500',
        change: '+2.5h this week'
      },
      {
        title: 'Revenue',
        value: formatCurrency(stats.totalRevenue),
        icon: TrendingUp,
        color: 'from-yellow-500 to-orange-500',
        change: '+22% this month'
      }
    ];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="animate-pulse space-y-3">
                <div className="w-12 h-12 bg-neutral-200 rounded-xl"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statsData = getStatsForMode();

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div>
        <h2 className="text-xl font-bold text-neutral-800 mb-6">
          {profileMode === 'student' ? 'Learning Progress' : 
           profileMode === 'teacher' ? 'Teaching Analytics' : 
           'Complete Overview'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="glass-card p-6 hover:shadow-glass-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-glass`}>
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neutral-800">{stat.value}</div>
                    <div className="text-xs text-green-600 font-medium">{stat.change}</div>
                  </div>
                </div>
                <h3 className="font-medium text-neutral-600">{stat.title}</h3>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-neutral-800">
            {profileMode === 'student' ? 'Recently Watched' : 'Recent Videos'}
          </h3>
          <button className="glass-button btn-glass-primary text-sm">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {recentVideos.map((video, index) => (
            <div key={video.id || index} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
              <div className="w-16 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video size={16} className="text-primary-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-neutral-800 truncate">{video.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                  <span>{video.subject}</span>
                  <span>•</span>
                  <span>{formatNumber(video.view_count)} views</span>
                  {video.is_premium && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-600">Premium</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                <Calendar size={14} />
                <span>{new Date(video.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profileMode === 'student' ? (
            <>
              <button className="glass-button p-4 flex flex-col items-center space-y-2">
                <Video size={20} className="text-blue-500" />
                <span className="text-sm font-medium">Browse Videos</span>
              </button>
              <button className="glass-button p-4 flex flex-col items-center space-y-2">
                <Star size={20} className="text-yellow-500" />
                <span className="text-sm font-medium">Favorites</span>
              </button>
              <button className="glass-button p-4 flex flex-col items-center space-y-2">
                <Clock size={20} className="text-green-500" />
                <span className="text-sm font-medium">Watch Later</span>
              </button>
              <button className="glass-button p-4 flex flex-col items-center space-y-2">
                <Award size={20} className="text-purple-500" />
                <span className="text-sm font-medium">Certificates</span>
              </button>
            </>
          ) : (
            <>
              <button className="glass-button p-4 flex flex-col items-center space-y-2">
                <Upload size={20} className="text-blue-500" />
                <span className="text-sm font-medium">Upload Video</span>
              </button>
              <button className="glass-button p-4 flex flex-col items-center space-y-2">
                <BarChart3 size={20} className="text-green-500" />
                <span className="text-sm font-medium">Analytics</span>
              </button>
              <button className="glass-button p-4 flex flex-col items-center space-y-2">
                <Users size={20} className="text-purple-500" />
                <span className="text-sm font-medium">Classrooms</span>
              </button>
              <button className="glass-button p-4 flex flex-col items-center space-y-2">
                <TrendingUp size={20} className="text-yellow-500" />
                <span className="text-sm font-medium">Revenue</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;