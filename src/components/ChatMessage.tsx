
import React from 'react';
import { type Message } from '../lib/hooks';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={`flex items-start gap-3 group animate-fade-in mb-4 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot size={16} className="text-primary" />
        </div>
      )}
      
      <div 
        className={`relative px-4 py-3 rounded-2xl max-w-[80%] ${
          isUser 
            ? 'bg-primary text-white rounded-tr-none' 
            : 'glass-card rounded-tl-none'
        }`}
      >
        <div className="text-sm">
          {message.content}
        </div>
        <div 
          className={`text-[10px] mt-1 opacity-70 ${
            isUser ? 'text-right text-white/80' : 'text-muted-foreground'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={16} className="text-primary" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
