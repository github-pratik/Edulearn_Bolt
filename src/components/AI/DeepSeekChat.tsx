import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User as UserIcon, Sparkles, Brain, Zap, Settings } from 'lucide-react';
import { generateEducationalResponse, availableModels, isOpenRouterAvailable } from '../../lib/integrations/openrouter';

interface DeepSeekChatProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  videoContext?: {
    title: string;
    description: string;
  };
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

const DeepSeekChat: React.FC<DeepSeekChatProps> = ({
  isOpen,
  onClose,
  subject,
  videoContext,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek/deepseek-chat-v3-0324:free');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, subject, videoContext]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: '1',
      content: getWelcomeMessage(),
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const getWelcomeMessage = () => {
    if (videoContext) {
      return `Hi! I'm your AI tutor powered by DeepSeek Chat V3. I can help you understand "${videoContext.title}" and answer any questions about ${subject}. What would you like to explore?`;
    }
    return `Hello! I'm your AI tutor specializing in ${subject}. I'm powered by DeepSeek Chat V3, which gives me advanced reasoning capabilities. How can I help you learn today?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    if (!isOpenRouterAvailable()) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, but the AI chat feature is currently unavailable. Please check that the OpenRouter API key is configured.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const context = videoContext 
        ? `Current video: "${videoContext.title}" - ${videoContext.description}`
        : undefined;

      const response = await generateEducationalResponse(
        inputMessage,
        subject,
        context
      );

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.isLoading) {
          lastMessage.content = response || "I'm sorry, I couldn't generate a response right now. Please try again.";
          lastMessage.isLoading = false;
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.isLoading) {
          lastMessage.content = "I encountered an error while processing your question. Please try again.";
          lastMessage.isLoading = false;
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    initializeChat();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-modal w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-glass">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-800 flex items-center space-x-2">
                <span>DeepSeek AI Tutor</span>
                <Sparkles size={16} className="text-purple-500" />
              </h3>
              <p className="text-sm text-neutral-600">{subject} • Advanced AI Reasoning</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors"
              title="Settings"
            >
              <Settings size={16} className="text-neutral-600" />
            </button>
            <button
              onClick={clearChat}
              className="px-3 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              Clear Chat
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <X size={20} className="text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-neutral-50 border-b border-neutral-200">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-neutral-700">AI Model:</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="glass-input px-3 py-1 text-sm"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.free && '(Free)'}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <Zap size={12} />
                <span>Powered by OpenRouter</span>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                }`}>
                  {message.role === 'user' ? (
                    <UserIcon size={16} className="text-white" />
                  ) : (
                    <Brain size={16} className="text-white" />
                  )}
                </div>
                
                <div className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                    : 'glass-card'
                }`}>
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-neutral-600">DeepSeek is thinking...</span>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/20">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about the lesson or subject..."
              className="flex-1 glass-input px-4 py-3 resize-none"
              rows={2}
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className="px-6 py-3 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-glass"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center space-x-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {!isOpenRouterAvailable() && (
                <span className="text-red-500">⚠️ OpenRouter API not configured</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Brain size={12} className="text-purple-500" />
              <span>Powered by DeepSeek Chat V3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepSeekChat;