import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Heart, ExternalLink, Crown, Volume2 } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* About */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="text-primary" size={28} />
              <span className="text-lg font-bold text-gray-900">EduLearn</span>
            </div>
            <p className="text-gray-600 text-sm">
              Free education for everyone: A community-driven platform empowering educators and students with accessible learning resources, optional premium content, and AI-powered voice features.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Built with</span>
              <Heart size={16} className="text-red-500" />
              <span>and</span>
              <Link 
                to="https://bolt.new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium flex items-center space-x-1"
              >
                <span>Bolt.new</span>
                <ExternalLink size={14} />
              </Link>
            </div>
            
            {/* Integration Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="badge badge-primary badge-outline">
                <Crown size={12} className="mr-1" />
                RevenueCat
              </div>
              <div className="badge badge-secondary badge-outline">
                <Volume2 size={12} className="mr-1" />
                ElevenLabs AI
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-primary">About</Link></li>
              <li><Link to="/help" className="text-gray-600 hover:text-primary">Help Center</Link></li>
              <li><Link to="/community" className="text-gray-600 hover:text-primary">Community</Link></li>
              <li><Link to="/teachers" className="text-gray-600 hover:text-primary">For Teachers</Link></li>
              <li><Link to="/premium" className="text-gray-600 hover:text-primary">Premium Plans</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/voice-summaries" className="text-gray-600 hover:text-primary">Voice Summaries</Link></li>
              <li><Link to="/ai-tutor" className="text-gray-600 hover:text-primary">AI Tutors</Link></li>
              <li><Link to="/premium-content" className="text-gray-600 hover:text-primary">Premium Content</Link></li>
              <li><Link to="/mobile-app" className="text-gray-600 hover:text-primary">Mobile App</Link></li>
              <li><Link to="/api" className="text-gray-600 hover:text-primary">API Documentation</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-gray-600 hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-primary">Terms of Service</Link></li>
              <li><Link to="/license" className="text-gray-600 hover:text-primary">Open Source License</Link></li>
              <li><Link to="/self-host" className="text-gray-600 hover:text-primary">Self-Hosting Guide</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500">
            © 2025 EduLearn. Open source and free forever.
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link
              to="https://github.com/edulearn/platform"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
            >
              <Github size={20} />
            </Link>
            <Link
              to="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
              className="badge badge-primary"
            >
              Built with Bolt.new
            </Link>
          </div>
        </div>

        {/* Domain Info */}
        <div className="border-t border-gray-200 mt-6 pt-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Powered by AI • Voice-Enhanced Learning</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="badge badge-outline badge-xs">Voice AI</span>
              <span className="badge badge-outline badge-xs">Premium Content</span>
              <span className="badge badge-outline badge-xs">Mobile Ready</span>
              <span className="badge badge-outline badge-xs">Open Source</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;