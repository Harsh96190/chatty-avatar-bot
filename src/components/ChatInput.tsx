
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  transcript: string;
  onStartListening: () => void;
  onStopListening: () => void;
  voiceEnabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  isListening,
  transcript,
  onStartListening,
  onStopListening,
  voiceEnabled,
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update the message state with the transcript when it changes
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  // Auto-resize the textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      
      // If voice was enabled, stop listening
      if (isListening) {
        onStopListening();
      }
      
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border">
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 rounded-full resize-none text-sm bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} className="text-primary-foreground" />
          </button>
        </div>
        
        {voiceEnabled && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            className={`ml-2 p-3 rounded-full transition-all ${
              isListening 
                ? 'bg-destructive text-white mic-pulse' 
                : 'bg-secondary/80 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
        )}
      </div>
    </form>
  );
};

export default ChatInput;
