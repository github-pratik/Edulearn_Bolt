import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, Star, Clock, GraduationCap } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: GraduationCap, label: 'Subjects', path: '/subjects' },
    { icon: Users, label: 'Classrooms', path: '/classrooms' },
    { icon: Star, label: 'Favorites', path: '/favorites' },
    { icon: Clock, label: 'Watch Later', path: '/watch-later' },
  ];

  const subjects = [
    'Mathematics',
    'Science',
    'History',
    'English',
    'Art',
    'Technology',
    'Languages',
    'Music',
  ];

  return (
    <aside className="glass-sidebar w-64 h-screen sticky top-16 overflow-y-auto hidden lg:block">
      <div className="p-6">
        {/* Main Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-glass'
                    : 'text-neutral-700 hover:bg-white/50 hover:shadow-glass'
                } micro-bounce`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-neutral-500 group-hover:text-primary-500'} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="my-8 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>

        {/* Subjects */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4 px-2">
            Subjects
          </h3>
          <nav className="space-y-1">
            {subjects.map((subject) => (
              <Link
                key={subject}
                to={`/subject/${subject.toLowerCase()}`}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-neutral-600 hover:bg-white/40 hover:text-primary-600 transition-all duration-200 group micro-bounce"
              >
                <BookOpen size={16} className="text-neutral-400 group-hover:text-primary-500 transition-colors" />
                <span className="text-sm font-medium">{subject}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="my-8 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>

        {/* Grade Levels */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4 px-2">
            Grade Levels
          </h3>
          <nav className="space-y-1">
            {['Elementary (K-5)', 'Middle School (6-8)', 'High School (9-12)', 'College', 'Adult Learning'].map((grade) => (
              <Link
                key={grade}
                to={`/grade/${grade.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                className="flex items-center px-4 py-2 rounded-lg text-neutral-600 hover:bg-white/40 hover:text-primary-600 transition-all duration-200 micro-bounce"
              >
                <span className="text-sm font-medium">{grade}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Floating Action */}
        <div className="mt-8 p-4 glass-card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glass">
              <Star size={20} className="text-white" />
            </div>
            <h4 className="font-semibold text-neutral-800 mb-2">Upgrade to Premium</h4>
            <p className="text-xs text-neutral-600 mb-3">Unlock exclusive content and features</p>
            <Link
              to="/premium"
              className="glass-button btn-glass-primary w-full text-sm font-medium micro-bounce"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;