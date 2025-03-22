
import React, { useRef, useEffect } from 'react';
import { type Message } from '../lib/hooks';
import ChatMessage from './ChatMessage';

interface MessageHistoryProps {
  messages: Message[];
}

const MessageHistory: React.FC<MessageHistoryProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            No messages yet. Start a conversation!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageHistory;
