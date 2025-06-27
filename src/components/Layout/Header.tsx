import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, LogOut, Upload, BookOpen, Crown, Sparkles, Brain } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isOpenRouterAvailable } from '../../lib/integrations/openrouter';
import DemoFeatures from '../Demo/DemoFeatures';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDemoFeatures, setShowDemoFeatures] = useState(false);
  const { user, profile, signOut, canUploadVideos } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getSubscriptionBadge = () => {
    switch (profile?.subscription_status) {
      case 'creator':
        return <Crown size={16} className="text-yellow-500 premium-glow" />;
      case 'premium':
        return <Crown size={16} className="text-blue-500 premium-glow" />;
      default:
        return null;
    }
  };

  return (
    <>
      <header className="glass-nav sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 lg:hidden micro-bounce">
                <Menu size={20} />
              </button>
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="p-2 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glass group-hover:shadow-glow transition-all duration-300">
                  <BookOpen className="text-white" size={28} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gradient">EduLearn</span>
                  <span className="text-xs text-neutral-500">AI-Powered Learning</span>
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for educational videos..."
                  className="glass-input w-full px-4 py-3 pl-12 text-sm font-medium placeholder-neutral-400"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-hover:text-primary-500 transition-colors duration-200" size={20} />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </form>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 md:hidden micro-bounce">
                <Search size={20} />
              </button>

              {/* AI Features Indicator */}
              {isOpenRouterAvailable() && (
                <div className="hidden sm:flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-xs font-medium">
                  <Brain size={12} />
                  <span>AI Enhanced</span>
                </div>
              )}

              {/* Demo Features Button */}
              <button
                onClick={() => setShowDemoFeatures(true)}
                className="glass-button btn-glass-primary flex items-center space-x-2 text-sm font-medium micro-bounce"
              >
                <Sparkles size={16} />
                <span className="hidden sm:inline">Demo</span>
              </button>
              
              {user ? (
                <>
                  {canUploadVideos() && (
                    <Link
                      to="/upload"
                      className="glass-button btn-glass-secondary flex items-center space-x-2 text-sm font-medium micro-bounce"
                    >
                      <Upload size={16} />
                      <span className="hidden sm:inline">Upload</span>
                    </Link>
                  )}
                  
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="glass-button p-3 micro-bounce">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center relative shadow-glass">
                        <User size={18} className="text-white" />
                        {getSubscriptionBadge() && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                            {getSubscriptionBadge()}
                          </div>
                        )}
                      </div>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-3 glass-modal w-56">
                      <li className="px-3 py-2 text-sm font-medium text-neutral-700">
                        {profile?.full_name || user.email}
                      </li>
                      <li className="px-3 py-1 text-xs text-neutral-500 capitalize flex items-center space-x-2">
                        <span>{profile?.role || 'User'}</span>
                        {profile?.subscription_status !== 'free' && (
                          <span className="px-2 py-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs rounded-full">
                            {profile?.subscription_status}
                          </span>
                        )}
                        {profile?.is_trial && (
                          <span className="px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs rounded-full">
                            Trial
                          </span>
                        )}
                      </li>
                      <div className="divider my-2"></div>
                      <li><Link to="/profile" className="rounded-lg hover:bg-white/50 transition-colors">Profile</Link></li>
                      <li><Link to="/dashboard" className="rounded-lg hover:bg-white/50 transition-colors">Dashboard</Link></li>
                      {profile?.subscription_status === 'free' && !profile?.is_trial && (
                        <li><Link to="/premium" className="rounded-lg hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 hover:text-white transition-all">Upgrade to Premium</Link></li>
                      )}
                      {canUploadVideos() && (
                        <li><Link to="/classrooms" className="rounded-lg hover:bg-white/50 transition-colors">My Classrooms</Link></li>
                      )}
                      <div className="divider my-2"></div>
                      <li>
                        <button onClick={handleSignOut} className="rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="glass-button text-primary-600 border-primary-200 hover:bg-primary-50 transition-all duration-200 text-sm font-medium micro-bounce"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="glass-button btn-glass-primary text-sm font-medium micro-bounce"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Demo Features Modal */}
      <DemoFeatures
        showModal={showDemoFeatures}
        onClose={() => setShowDemoFeatures(false)}
      />
    </>
  );
};

export default Header;