import React, { useState, useEffect } from 'react';
import { Clock, Crown, Star, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TrialBannerProps {
  onUpgrade?: () => void;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ onUpgrade }) => {
  const { profile } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });

  useEffect(() => {
    if (profile?.trial_end_date) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const trialEnd = new Date(profile.trial_end_date).getTime();
        const difference = trialEnd - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

          setTimeLeft({ days, hours, minutes });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [profile?.trial_end_date]);

  // Don't show banner if user is not on trial or has dismissed it
  if (!profile?.is_trial || dismissed || !profile?.trial_end_date) {
    return null;
  }

  const isExpiringSoon = timeLeft.days <= 3;
  const hasExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0;

  const getTrialInfo = () => {
    if (profile.role === 'teacher') {
      return {
        title: 'Teacher Trial Active',
        features: ['Unlimited uploads', 'Virtual classrooms', 'Student analytics', 'Assessment tools'],
        icon: Crown,
        gradient: 'from-blue-500 to-purple-500'
      };
    } else {
      return {
        title: 'Student Trial Active',
        features: ['Full course library', 'Interactive tools', 'Progress tracking', 'Study groups'],
        icon: Star,
        gradient: 'from-green-500 to-emerald-500'
      };
    }
  };

  const trialInfo = getTrialInfo();
  const IconComponent = trialInfo.icon;

  if (hasExpired) {
    return (
      <div className="glass-card p-4 bg-red-50 border-red-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Trial Expired</h3>
              <p className="text-sm text-red-600">
                Your trial has ended. Upgrade to continue accessing premium features.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onUpgrade}
              className="glass-button bg-red-600 text-white border-red-600 hover:bg-red-700"
            >
              Upgrade Now
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 text-red-400 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card p-4 mb-6 ${
      isExpiringSoon 
        ? 'bg-yellow-50 border-yellow-200' 
        : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${trialInfo.gradient} flex items-center justify-center shadow-glass`}>
            <IconComponent size={24} className="text-white" />
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-neutral-800">{trialInfo.title}</h3>
              <div className="px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-medium rounded-full">
                FREE
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Clock size={14} className={isExpiringSoon ? 'text-yellow-600' : 'text-blue-600'} />
                <span className={`font-medium ${isExpiringSoon ? 'text-yellow-800' : 'text-blue-800'}`}>
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m left
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {trialInfo.features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-neutral-600">{feature}</span>
                  </div>
                ))}
                <span className="text-neutral-500">+{trialInfo.features.length - 2} more</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isExpiringSoon && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Expires Soon!
            </div>
          )}
          
          <button
            onClick={onUpgrade}
            className={`glass-button font-medium ${
              isExpiringSoon 
                ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600' 
                : 'btn-glass-primary'
            }`}
          >
            Upgrade Now
          </button>
          
          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-neutral-400 hover:text-neutral-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialBanner;