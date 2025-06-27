import React, { useState } from 'react';
import { Shield, MessageCircle, Globe, Sparkles, CheckCircle, ExternalLink, Crown, Volume2, Users } from 'lucide-react';

interface DemoFeaturesProps {
  showModal: boolean;
  onClose: () => void;
}

const DemoFeatures: React.FC<DemoFeaturesProps> = ({ showModal, onClose }) => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demoFeatures = [
    {
      id: 'voice-ai',
      title: 'Voice AI Integration',
      icon: Volume2,
      description: 'AI-powered voice summaries and audio navigation',
      demoText: 'Voice summary generated: "This algebra tutorial covers basic equations and problem-solving techniques..." • Audio navigation enabled • Multi-language support available',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'premium',
      title: 'Premium Content System',
      icon: Crown,
      description: 'Monetization with RevenueCat integration',
      demoText: 'Premium subscription active • Revenue tracking: $2,847 this month • 156 active subscribers • Automated billing management',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'community',
      title: 'Community Features',
      icon: MessageCircle,
      description: 'Integrated discussion forums and social learning',
      demoText: 'Active discussions: 127 comments • 45 questions answered • Community of 2.3k learners • Real-time chat enabled',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      id: 'domain',
      title: 'Custom Domain & Deployment',
      icon: Globe,
      description: 'Professional custom domain with global CDN',
      demoText: 'Live at: edulearn.app • SSL secured • Global CDN enabled • 99.9% uptime • Auto-scaling infrastructure',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'blockchain',
      title: 'Blockchain Verification',
      icon: Shield,
      description: 'Content authenticity with blockchain technology',
      demoText: 'Content verified on blockchain • Transaction ID: 0x1a2b3c4d... • Immutable upload records • Authenticity guaranteed',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      id: 'classrooms',
      title: 'Virtual Classrooms',
      icon: Users,
      description: 'Teacher-student collaboration platform',
      demoText: 'Active classrooms: 23 • Total students: 456 • Assignment tracking • Progress analytics • Live sessions',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-modal max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glass">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gradient">Demo Features</h2>
                <p className="text-neutral-600">Explore the platform's capabilities</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors duration-200 micro-bounce"
            >
              <span className="text-neutral-500 text-xl">×</span>
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {demoFeatures.map((feature) => {
              const IconComponent = feature.icon;
              const isActive = activeDemo === feature.id;

              return (
                <div key={feature.id} className="glass-card overflow-hidden">
                  <button
                    onClick={() => setActiveDemo(isActive ? null : feature.id)}
                    className="w-full p-4 text-left hover:bg-white/30 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-glass`}>
                        <IconComponent className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-800">{feature.title}</h3>
                        <p className="text-sm text-neutral-600">{feature.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isActive 
                          ? 'border-primary-500 bg-primary-500' 
                          : 'border-neutral-300'
                      }`}>
                        {isActive && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                  </button>

                  {isActive && (
                    <div className="px-4 pb-4 border-t border-white/20">
                      <div className={`p-4 rounded-xl ${feature.bgColor} mt-4 border border-white/30`}>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className={`${feature.color} flex-shrink-0 mt-0.5`} size={16} />
                          <div>
                            <p className="text-sm text-neutral-700 font-medium">{feature.demoText}</p>
                            
                            {feature.id === 'voice-ai' && (
                              <div className="mt-3 space-y-1 text-xs text-neutral-600">
                                <p>• Real-time voice synthesis</p>
                                <p>• Audio navigation commands</p>
                                <p>• Accessibility features</p>
                              </div>
                            )}
                            
                            {feature.id === 'premium' && (
                              <div className="mt-3 space-y-1 text-xs text-neutral-600">
                                <p>• Subscription management</p>
                                <p>• Revenue analytics</p>
                                <p>• Automated billing</p>
                              </div>
                            )}
                            
                            {feature.id === 'community' && (
                              <div className="mt-3 space-y-1 text-xs text-neutral-600">
                                <p>• Real-time discussions</p>
                                <p>• Q&A with instructors</p>
                                <p>• Peer-to-peer learning</p>
                              </div>
                            )}
                            
                            {feature.id === 'domain' && (
                              <div className="mt-3 space-y-1 text-xs text-neutral-600">
                                <p>• Professional branding</p>
                                <p>• SEO optimization</p>
                                <p>• Global content delivery</p>
                              </div>
                            )}

                            {feature.id === 'blockchain' && (
                              <div className="mt-3 space-y-1 text-xs text-neutral-600">
                                <p>• Immutable content records</p>
                                <p>• Tamper-proof verification</p>
                                <p>• Transparent authenticity</p>
                              </div>
                            )}

                            {feature.id === 'classrooms' && (
                              <div className="mt-3 space-y-1 text-xs text-neutral-600">
                                <p>• Virtual learning spaces</p>
                                <p>• Progress tracking</p>
                                <p>• Interactive assignments</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="glass-card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100 p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glass float-animation">
              <Sparkles className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">Ready to Get Started?</h3>
            <p className="text-neutral-600 mb-4">
              These features showcase the platform's full potential. Contact us to enable them for your educational platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="glass-button btn-glass-primary font-medium micro-bounce">
                Contact Sales
              </button>
              <button className="glass-button border-primary-200 text-primary-600 hover:bg-primary-50 font-medium micro-bounce">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoFeatures;