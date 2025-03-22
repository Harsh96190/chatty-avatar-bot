
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Globe } from 'lucide-react';
import { useTextSuggestions } from '../lib/hooks';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  transcript: string;
  onStartListening: () => void;
  onStopListening: () => void;
  voiceEnabled: boolean;
  language?: string;
  onChangeLanguage?: (lang: string) => void;
  supportedLanguages?: {code: string, name: string}[];
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  isListening,
  transcript,
  onStartListening,
  onStopListening,
  voiceEnabled,
  language = 'en-US',
  onChangeLanguage,
  supportedLanguages = [],
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { suggestions, checkText, clearSuggestions } = useTextSuggestions();

  // Update the message state with the transcript when it changes
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
      // Check for suggestions on transcript change
      checkText(transcript);
    }
  }, [transcript, checkText]);

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
      clearSuggestions();
      
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    checkText(e.target.value);
  };

  const applySuggestion = (suggestion: string) => {
    const words = message.split(' ');
    words[words.length - 1] = suggestion;
    const newMessage = words.join(' ');
    setMessage(newMessage);
    clearSuggestions();
    
    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="p-4 border-t border-border">
      {suggestions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => applySuggestion(suggestion)}
              className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
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
          <>
            {supportedLanguages.length > 0 && onChangeLanguage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ml-2 p-3 rounded-full bg-secondary/80 text-muted-foreground hover:bg-secondary transition-all"
                  >
                    <Globe size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {supportedLanguages.map((lang) => (
                    <DropdownMenuItem 
                      key={lang.code}
                      onClick={() => onChangeLanguage(lang.code)}
                      className={lang.code === language ? "bg-muted" : ""}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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
          </>
        )}
      </form>
    </div>
  );
};

export default ChatInput;
