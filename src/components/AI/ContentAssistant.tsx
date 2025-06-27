import React, { useState } from 'react';
import { Bot, X, Send } from 'lucide-react';

interface ContentAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onSuggestion?: (suggestion: string) => void;
}

const ContentAssistant: React.FC<ContentAssistantProps> = ({
  isOpen,
  onClose,
  onSuggestion
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      // Mock AI response for now
      const suggestion = `Here's a suggestion based on "${input}": This could be an engaging educational video that covers the fundamentals and provides practical examples.`;
      
      if (onSuggestion) {
        onSuggestion(suggestion);
      }
      
      setInput('');
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bot className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Content Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What kind of content do you want to create?
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your video idea..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span>{loading ? 'Generating...' : 'Get Suggestion'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentAssistant;