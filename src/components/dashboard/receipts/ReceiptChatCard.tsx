import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, ArrowRight, X } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ReceiptChatCard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! 👋 I can help you analyze your receipts. Ask me about your spending, categories, trends, or anything else about your data.',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API call - will be replaced with actual Claude integration
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'This feature is coming soon! I\'ll be able to analyze your receipt data and answer questions about your spending patterns.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  const suggestedQuestions = [
    'What\'s my total spending?',
    'Show me my top categories',
    'Analyze my spending trends',
  ];

  return (
    <>
      {/* Floating Chat Icon Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 flex items-center gap-3 px-5 py-4 rounded-full bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 z-40 group"
        title="Open Receipt Assistant"
      >
        <MessageCircle className="h-6 w-6 stroke-[#00E5FF]" />
        <span className="text-sm font-medium hidden group-hover:inline-block transition-all">Snapceit Assistant</span>
      </motion.button>

      {/* Modal Chat Box */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            {/* Chat Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col max-h-[600px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Snapceit Assistant</h3>
                    <p className="text-xs text-gray-500">Ask about your spending</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Chat Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions - Show only if no messages or just initial message */}
              {messages.length <= 1 && (
                <div className="px-4 py-2 space-y-2 border-t border-gray-200 bg-gray-50">
                  <p className="text-xs font-medium text-gray-600">Try asking:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputValue(question);
                        }}
                        className="text-left text-xs px-3 py-2 rounded-lg bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-colors flex items-center justify-between group border border-gray-200"
                      >
                        <span>{question}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about your receipts..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
