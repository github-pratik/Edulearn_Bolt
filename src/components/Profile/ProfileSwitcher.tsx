import React from 'react';
import { Users, GraduationCap, Layers, CheckCircle } from 'lucide-react';

interface ProfileSwitcherProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
}

const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ currentMode, onModeChange }) => {
  const modes = [
    {
      id: 'student',
      name: 'Student',
      icon: Users,
      description: 'View as a student with learning-focused features',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'teacher',
      name: 'Teacher',
      icon: GraduationCap,
      description: 'Access teaching tools and classroom management',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'all-in-one',
      name: 'All-in-One',
      icon: Layers,
      description: 'Complete dashboard with all features',
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glass">
          <Layers size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gradient">Profile Mode</h2>
          <p className="text-neutral-600">Choose your preferred interface</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((mode) => {
          const IconComponent = mode.icon;
          const isActive = currentMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isActive
                  ? 'border-primary-300 bg-primary-50 shadow-glass'
                  : 'border-neutral-200 bg-white hover:border-primary-200 hover:bg-primary-25'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mode.color} flex items-center justify-center shadow-glass`}>
                  <IconComponent size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-800">{mode.name}</h3>
                  {isActive && (
                    <div className="flex items-center space-x-1 text-primary-600">
                      <CheckCircle size={14} />
                      <span className="text-xs font-medium">Active</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-neutral-600">{mode.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileSwitcher;