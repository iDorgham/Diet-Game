// AIChat component for AI coach interface and chat functionality
// Part of HIGH Priority Feature Components implementation

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'image' | 'file' | 'suggestion';
  metadata?: {
    suggestions?: string[];
    actions?: Array<{
      label: string;
      action: string;
      data?: any;
    }>;
    confidence?: number;
    sources?: Array<{
      title: string;
      url: string;
    }>;
  };
}

export interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSendFile?: (file: File) => void;
  isLoading?: boolean;
  isTyping?: boolean;
  placeholder?: string;
  maxLength?: number;
  showSuggestions?: boolean;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  onClearHistory?: () => void;
  onMessageAction?: (messageId: string, action: string, data?: any) => void;
  className?: string;
  height?: string;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
}

export const AIChat = forwardRef<HTMLDivElement, AIChatProps>(
  (
    {
      messages,
      onSendMessage,
      onSendFile,
      isLoading = false,
      isTyping = false,
      placeholder = "Ask me anything about your diet and nutrition...",
      maxLength = 1000,
      showSuggestions = true,
      suggestions = [],
      onSuggestionClick,
      onClearHistory,
      onMessageAction,
      className,
      height = "500px",
      showHeader = true,
      title = "AI Nutrition Coach",
      subtitle = "Your personal diet and nutrition assistant"
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
      if (inputValue.trim() && !isLoading) {
        onSendMessage(inputValue.trim());
        setInputValue('');
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onSendFile) {
        onSendFile(file);
      }
    };

    const handleSuggestionClick = (suggestion: string) => {
      setInputValue(suggestion);
      onSuggestionClick?.(suggestion);
    };

    const handleCopyMessage = (content: string) => {
      navigator.clipboard.writeText(content);
    };

    const formatTimestamp = (timestamp: Date) => {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const emojis = ['😊', '👍', '❤️', '🎉', '🤔', '😢', '🔥', '💪', '🥗', '🍎'];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm',
          className
        )}
        style={{ height }}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onClearHistory && (
                <button
                  onClick={onClearHistory}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Clear chat history"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'flex max-w-[80%] space-x-2',
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2',
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Message Metadata */}
                    {message.metadata && (
                      <div className="mt-2 space-y-2">
                        {/* Suggestions */}
                        {message.metadata.suggestions && message.metadata.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {message.metadata.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm hover:bg-opacity-30 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        {message.metadata.actions && message.metadata.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {message.metadata.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => onMessageAction?.(message.id, action.action, action.data)}
                                className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm hover:bg-opacity-30 transition-colors"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Sources */}
                        {message.metadata.sources && message.metadata.sources.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs opacity-75">Sources:</div>
                            {message.metadata.sources.map((source, index) => (
                              <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs underline hover:no-underline"
                              >
                                {source.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-75">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleCopyMessage(message.content)}
                          className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                          title="Copy message"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {message.role === 'assistant' && (
                          <>
                            <button
                              onClick={() => onMessageAction?.(message.id, 'thumbs_up')}
                              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                              title="Helpful"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onMessageAction?.(message.id, 'thumbs_down')}
                              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                              title="Not helpful"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && messages.length === 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Suggested questions:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end space-x-2">
            {/* File Upload */}
            {onSendFile && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Attach file"
                aria-label="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            )}

            {/* Emoji Picker */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg"
                >
                  <div className="grid grid-cols-5 gap-1">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputValue(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Voice Recording */}
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isRecording
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              )}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[40px] max-h-[120px]"
              />
              {maxLength && (
                <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                  {inputValue.length}/{maxLength}
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={cn(
                'p-2 rounded-lg transition-colors',
                inputValue.trim() && !isLoading
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        {onSendFile && (
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              aria-label="File upload input"
            />
        )}
      </div>
    );
  }
);

AIChat.displayName = 'AIChat';

export default AIChat;
