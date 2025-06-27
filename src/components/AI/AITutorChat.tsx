import React, { useState, useEffect } from 'react';
import { X, Send, Bot, User as UserIcon, Mic, MicOff } from 'lucide-react';
import { generateNavigationAudio } from '../../lib/integrations/elevenlabs';

interface AITutorChatProps {
  isOpen: boolean;
  onClose: () => void;
  tutorName: string;
  subject: string;
  userId: string;
}

const AITutorChat: React.FC<AITutorChatProps> = ({
  isOpen,
  onClose,
  tutorName,
  subject,
  userId,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initializeSession();
    }
  }, [isOpen]);

  const initializeSession = async () => {
    setMessages([
      {
        id: '1',
        text: `Hi! I'm ${tutorName}, your ${subject} tutor. How can I help you learn today?`,
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Mock AI responses based on subject and input
      const aiResponse = generateMockResponse(inputMessage, subject);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Generate voice response if enabled
      if (voiceEnabled) {
        const audioUrl = await generateNavigationAudio(aiMessage.text);
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.play();
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockResponse = (input: string, subject: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Subject-specific responses
    if (subject === 'Mathematics') {
      if (lowerInput.includes('algebra')) {
        return "Algebra is all about working with variables and equations! Think of variables as mystery numbers we need to solve for. Would you like me to walk you through a basic example?";
      }
      if (lowerInput.includes('calculus')) {
        return "Calculus deals with rates of change and areas under curves. It's like understanding how fast something is moving at any given moment. What specific calculus topic interests you?";
      }
      if (lowerInput.includes('geometry')) {
        return "Geometry is the study of shapes, sizes, and spatial relationships. From triangles to circles, each shape has unique properties. What geometric concept would you like to explore?";
      }
    }
    
    if (subject === 'Science') {
      if (lowerInput.includes('physics')) {
        return "Physics helps us understand how the universe works! From the motion of planets to the behavior of atoms, it's all connected by fundamental laws. What physics concept interests you?";
      }
      if (lowerInput.includes('chemistry')) {
        return "Chemistry is like cooking with atoms and molecules! We study how different elements combine and react. Are you curious about a specific chemical reaction or concept?";
      }
      if (lowerInput.includes('biology')) {
        return "Biology explores the amazing world of living things! From tiny cells to complex ecosystems, life is incredibly diverse. What biological topic would you like to learn about?";
      }
    }
    
    // General helpful responses
    const generalResponses = [
      "That's a great question! Let me help you understand that concept better. Can you tell me what specific part you're finding challenging?",
      "I can see you're working hard on this topic. Here's another way to think about it that might help clarify things.",
      "Excellent! You're making good progress. Would you like to try a practice problem to reinforce what you've learned?",
      "Let me break this down into simpler steps for you. Understanding the fundamentals is key to mastering any subject.",
      "That's correct! You've got the right idea. Want to explore this concept further with some real-world examples?",
      "I understand that can be confusing. Let's approach it from a different angle that might make more sense.",
      "Great observation! That shows you're really thinking about the material. Here's how we can build on that understanding.",
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{tutorName}</h3>
              <p className="text-sm text-gray-600">{subject} Tutor</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-full ${voiceEnabled ? 'bg-primary text-white' : 'bg-gray-100'}`}
            >
              {voiceEnabled ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about the lesson..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutorChat;