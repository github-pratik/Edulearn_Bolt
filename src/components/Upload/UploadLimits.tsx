import React from 'react';
import { Upload, Clock, Crown, AlertCircle, CheckCircle, Star, Zap, Users, Shield, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UploadLimitsProps {
  currentUploads?: number;
  onUpgrade?: () => void;
}

const UploadLimits: React.FC<UploadLimitsProps> = ({ 
  currentUploads = 0, 
  onUpgrade 
}) => {
  const { profile } = useAuth();

  const getLimits = () => {
    if (profile?.subscription_status === 'creator' || profile?.role === 'teacher') {
      return {
        monthlyLimit: null,
        maxFileSize: 500,
        formats: ['MP4', 'AVI', 'MOV', 'MKV', 'WebM', 'FLV'],
        features: [
          'Unlimited uploads',
          'Large file support (500MB)',
          'All video formats',
          'Priority processing',
          'Advanced analytics',
          'Custom thumbnails',
          'HD quality (1080p+)',
          'Monetization tools',
          'Bulk upload',
          'Video scheduling'
        ],
        tier: 'Creator',
        color: 'from-yellow-400 to-orange-500'
      };
    }
    
    if (profile?.subscription_status === 'premium') {
      return {
        monthlyLimit: 15,
        maxFileSize: 250,
        formats: ['MP4', 'AVI', 'MOV', 'MKV', 'WebM'],
        features: [
          '15 uploads/month',
          'Medium file support (250MB)',
          'Most video formats',
          'Fast processing',
          'Basic analytics',
          'Auto thumbnails',
          'HD quality (720p)',
          'Priority support'
        ],
        tier: 'Premium',
        color: 'from-blue-400 to-purple-500'
      };
    }
    
    return {
      monthlyLimit: 5,
      maxFileSize: 100,
      formats: ['MP4', 'AVI', 'MOV'],
      features: [
        '5 uploads/month',
        'Basic file support (100MB)',
        'Standard formats',
        'Standard processing',
        'Basic thumbnails',
        'SD quality (480p)',
        'Community support'
      ],
      tier: 'Free',
      color: 'from-green-400 to-emerald-500'
    };
  };

  const limits = getLimits();
  const isUnlimited = limits.monthlyLimit === null;
  const uploadsRemaining = isUnlimited ? null : Math.max(0, limits.monthlyLimit - currentUploads);
  const isNearLimit = !isUnlimited && uploadsRemaining !== null && uploadsRemaining <= 1;
  const hasReachedLimit = !isUnlimited && uploadsRemaining === 0;

  const getProgressColor = () => {
    if (hasReachedLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-gradient-to-r from-green-400 to-emerald-500';
  };

  const getUpgradeOptions = () => {
    if (limits.tier === 'Creator') return null;
    
    const options = [
      {
        name: 'Premium',
        price: '$9.99/month',
        highlights: ['15 uploads/month', '250MB files', 'HD quality', 'Fast processing'],
        color: 'from-blue-400 to-purple-500',
        recommended: limits.tier === 'Free'
      },
      {
        name: 'Creator',
        price: '$19.99/month',
        highlights: ['Unlimited uploads', '500MB files', 'Monetization', 'Advanced tools'],
        color: 'from-yellow-400 to-orange-500',
        recommended: limits.tier === 'Premium'
      }
    ];

    return options.filter(option => 
      (limits.tier === 'Free') || 
      (limits.tier === 'Premium' && option.name === 'Creator')
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${limits.color} shadow-glass`}>
            {limits.tier === 'Creator' ? (
              <Crown size={24} className="text-white" />
            ) : limits.tier === 'Premium' ? (
              <Star size={24} className="text-white" />
            ) : (
              <Upload size={24} className="text-white" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-neutral-800">{limits.tier} Plan</h3>
            <p className="text-sm text-neutral-600">
              {isUnlimited 
                ? 'Unlimited uploads available' 
                : `${uploadsRemaining} uploads remaining this month`
              }
            </p>
          </div>

          {limits.tier === 'Free' && (
            <div className="ml-auto">
              <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                100% Free Forever
              </div>
            </div>
          )}
        </div>

        {/* Usage Progress */}
        {!isUnlimited && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Monthly Usage</span>
              <span className="text-sm text-neutral-600">
                {currentUploads} / {limits.monthlyLimit}
              </span>
            </div>
            
            <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ 
                  width: `${Math.min(100, (currentUploads / limits.monthlyLimit) * 100)}%` 
                }}
              ></div>
            </div>
            
            {isNearLimit && !hasReachedLimit && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>You're running low on uploads this month. Consider upgrading for more capacity.</span>
                </p>
              </div>
            )}
            
            {hasReachedLimit && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>You've reached your monthly upload limit. Upgrade to continue uploading.</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Current Plan Features */}
        <div className="space-y-3">
          <h4 className="font-semibold text-neutral-800 flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span>Your {limits.tier} Features</span>
          </h4>
          
          <div className="grid grid-cols-1 gap-2">
            {limits.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                <span className="text-neutral-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-neutral-700">Max File Size:</span>
                <span className="ml-2 text-neutral-600">{limits.maxFileSize}MB</span>
              </div>
              <div>
                <span className="font-medium text-neutral-700">Formats:</span>
                <span className="ml-2 text-neutral-600">{limits.formats.slice(0, 2).join(', ')}
                  {limits.formats.length > 2 && ` +${limits.formats.length - 2} more`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Options */}
      {getUpgradeOptions() && (
        <div className="space-y-4">
          <h4 className="font-semibold text-neutral-800 flex items-center space-x-2">
            <Zap size={16} className="text-blue-500" />
            <span>Upgrade for More Features</span>
          </h4>
          
          {getUpgradeOptions()?.map((option, index) => (
            <div key={index} className={`glass-card p-5 border-2 ${option.recommended ? 'border-blue-300 bg-blue-50/50' : 'border-neutral-200'} relative overflow-hidden`}>
              {option.recommended && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  RECOMMENDED
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-glass`}>
                    {option.name === 'Creator' ? (
                      <Crown size={20} className="text-white" />
                    ) : (
                      <Star size={20} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-800">{option.name}</h5>
                    <p className="text-lg font-bold text-neutral-900">{option.price}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {option.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-neutral-700">{highlight}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onUpgrade}
                className={`w-full glass-button bg-gradient-to-r ${option.color} text-white border-0 font-medium py-3 hover:shadow-glass-lg transition-all duration-300`}
              >
                Upgrade to {option.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Free Platform Benefits */}
      {limits.tier === 'Free' && (
        <div className="glass-card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-glass">
              <Shield size={32} className="text-white" />
            </div>
            <h4 className="text-lg font-bold text-green-800 mb-2">Free Education for Everyone</h4>
            <p className="text-green-700 text-sm mb-4">
              Our core mission is to keep education accessible. You can always upload and share knowledge for free!
            </p>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center space-x-1 text-green-700">
                <CheckCircle size={12} />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center space-x-1 text-green-700">
                <CheckCircle size={12} />
                <span>Always free core features</span>
              </div>
              <div className="flex items-center space-x-1 text-green-700">
                <CheckCircle size={12} />
                <span>Community support</span>
              </div>
              <div className="flex items-center space-x-1 text-green-700">
                <CheckCircle size={12} />
                <span>Open source platform</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Comparison */}
      <div className="glass-card p-6">
        <h4 className="font-semibold text-neutral-800 mb-4">Feature Comparison</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 text-neutral-600">Feature</th>
                <th className="text-center py-2 text-green-600">Free</th>
                <th className="text-center py-2 text-blue-600">Premium</th>
                <th className="text-center py-2 text-yellow-600">Creator</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              <tr className="border-b border-neutral-100">
                <td className="py-2 text-neutral-700">Monthly Uploads</td>
                <td className="text-center py-2">5</td>
                <td className="text-center py-2">15</td>
                <td className="text-center py-2">∞</td>
              </tr>
              <tr className="border-b border-neutral-100">
                <td className="py-2 text-neutral-700">Max File Size</td>
                <td className="text-center py-2">100MB</td>
                <td className="text-center py-2">250MB</td>
                <td className="text-center py-2">500MB</td>
              </tr>
              <tr className="border-b border-neutral-100">
                <td className="py-2 text-neutral-700">Video Quality</td>
                <td className="text-center py-2">SD</td>
                <td className="text-center py-2">HD</td>
                <td className="text-center py-2">Full HD+</td>
              </tr>
              <tr className="border-b border-neutral-100">
                <td className="py-2 text-neutral-700">Analytics</td>
                <td className="text-center py-2">Basic</td>
                <td className="text-center py-2">Advanced</td>
                <td className="text-center py-2">Pro</td>
              </tr>
              <tr>
                <td className="py-2 text-neutral-700">Monetization</td>
                <td className="text-center py-2">-</td>
                <td className="text-center py-2">-</td>
                <td className="text-center py-2">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UploadLimits;