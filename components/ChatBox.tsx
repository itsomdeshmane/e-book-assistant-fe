'use client';

import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { format } from 'date-fns';
import type { Message } from '@/lib/types';

interface ChatBoxProps {
  messages: Message[];
}

export function ChatBox({ messages }: ChatBoxProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <Bot className="h-20 w-20 text-gray-300 mx-auto" />
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xs font-semibold">?</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-700">Ready to help!</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Ask me anything about this document. I'll analyze the content and provide you with accurate answers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Summarize key points</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Explain concepts</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Find specific information</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 pr-2">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`flex space-x-3 max-w-3xl ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {message.role === 'user' ? (
                <User className="h-5 w-5" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>
            <div
              className={`rounded-2xl px-4 py-3 shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p
                className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                {format(message.timestamp, 'HH:mm')}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}