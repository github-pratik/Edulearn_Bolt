import React from 'react';
import { Crown, Star, Upload, Users, BarChart3, BookOpen, PenTool, MessageCircle, Clock, CheckCircle, X } from 'lucide-react';

interface TrialFeaturesProps {
  userType: 'teacher' | 'student';
  isActive: boolean;
  onStartTrial?: () => void;
  onUpgrade?: () => void;
}

const TrialFeatures: React.FC<TrialFeaturesProps> = ({ 
  userType, 
  isActive, 
  onStartTrial, 
  onUpgrade 
}) => {
  const teacherFeatures = [
    {
      icon: Upload,
      title: 'Unlimited Video Uploads',
      description: 'Upload videos up to 500MB each with no monthly limits',
      included: true
    },
    {
      icon: Users,
      title: 'Virtual Classroom Management',
      description: 'Create and manage multiple classrooms with student enrollment',
      included: true
    },
    {
      icon: BarChart3,
      title: 'Student Progress Tracking',
      description: 'Detailed analytics on student engagement and performance',
      included: true
    },
    {
      icon: PenTool,
      title: 'Custom Course Creation',
      description: 'Build structured learning paths with assignments and quizzes',
      included: true
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics Dashboard',
      description: 'Revenue tracking, view analytics, and performance insights',
      included: true
    },
    {
      icon: Crown,
      title: 'Premium Content Monetization',
      description: 'Set pricing for premium videos and earn revenue',
      included: true
    }
  ];

  const studentFeatures = [
    {
      icon: BookOpen,
      title: 'Full Course Library Access',
      description: 'Access to all premium courses and educational content',
      included: true
    },
    {
      icon: PenTool,
      title: 'Interactive Learning Tools',
      description: 'Quizzes, assignments, and hands-on learning activities',
      included: true
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking Dashboard',
      description: 'Monitor your learning progress and achievements',
      included: true
    },
    {
      icon: Upload,
      title: 'Assignment Submission System',
      description: 'Submit homework and projects directly through the platform',
      included: true
    },
    {
      icon: Users,
      title: 'Study Group Features',
      description: 'Collaborate with classmates in virtual study groups',
      included: true
    },
    {
      icon: MessageCircle,
      title: 'Advanced Note-Taking Tools',
      description: 'Rich text notes with video timestamps and sharing',
      included: true
    }
  ];

  const features = userType === 'teacher' ? teacherFeatures : studentFeatures;
  const trialDuration = userType === 'teacher' ? 30 : 14;

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-8">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${
          userType === 'teacher' 
            ? 'from-blue-500 to-purple-500' 
            : 'from-green-500 to-emerald-500'
        } flex items-center justify-center shadow-glass`}>
          {userType === 'teacher' ? (
            <Crown size={32} className="text-white" />
          ) : (
            <Star size={32} className="text-white" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gradient mb-2">
          {userType === 'teacher' ? 'Teacher Trial' : 'Student Trial'}
        </h2>
        
        <p className="text-neutral-600 mb-4">
          Get {trialDuration} days of premium access to all {userType} features
        </p>

        <div className="flex items-center justify-center space-x-2 mb-6">
          <Clock size={16} className="text-blue-500" />
          <span className="text-lg font-semibold text-blue-600">
            {trialDuration} Days Free
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                userType === 'teacher' 
                  ? 'from-blue-100 to-purple-100' 
                  : 'from-green-100 to-emerald-100'
              } flex items-center justify-center flex-shrink-0`}>
                <IconComponent size={16} className={
                  userType === 'teacher' ? 'text-blue-600' : 'text-green-600'
                } />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-neutral-800">{feature.title}</h3>
                  {feature.included ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <X size={16} className="text-red-500" />
                  )}
                </div>
                <p className="text-sm text-neutral-600">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-neutral-800 mb-2">Trial Benefits</h4>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• No credit card required to start</li>
            <li>• Full access to all premium features</li>
            <li>• Data preserved for 7 days after trial ends</li>
            <li>• Cancel anytime during trial period</li>
            <li>• Automatic notifications before expiration</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {!isActive ? (
            <button
              onClick={onStartTrial}
              className={`flex-1 glass-button font-medium ${
                userType === 'teacher' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0'
              }`}
            >
              Start {trialDuration}-Day Free Trial
            </button>
          ) : (
            <button
              onClick={onUpgrade}
              className="flex-1 glass-button btn-glass-primary font-medium"
            >
              Upgrade to Premium
            </button>
          )}
          
          <button className="glass-button border-neutral-200 text-neutral-600">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialFeatures;