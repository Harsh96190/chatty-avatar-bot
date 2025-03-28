
import React, { useState } from 'react';
import { type Message } from '../lib/hooks';
import { User, Bot, Database, Sparkles, VolumeX, Volume2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const handleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(message.content);
    
    // Set voice (optional)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Female'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Set other properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Handle events
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  };
  
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
          className={`flex items-center justify-between text-[10px] mt-1 ${
            isUser ? 'text-right text-white/80' : 'text-muted-foreground'
          }`}
        >
          <span className="opacity-70">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          <div className="flex items-center gap-2">
            {!isUser && (
              <button
                onClick={handleTextToSpeech}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={isSpeaking ? "Stop speaking" : "Speak message"}
              >
                {isSpeaking ? (
                  <VolumeX size={12} />
                ) : (
                  <Volume2 size={12} />
                )}
              </button>
            )}
            
            {!isUser && message.source && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 ml-1">
                      {message.source === 'knowledge_base' ? (
                        <Database size={10} className="text-blue-500" />
                      ) : (
                        <Sparkles size={10} className="text-amber-500" />
                      )}
                      <span className={`text-[9px] font-medium ${
                        message.source === 'knowledge_base' ? 'text-blue-500' : 'text-amber-500'
                      }`}>
                        {message.source === 'knowledge_base' ? 'KB' : 'AI'}
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {message.source === 'knowledge_base' 
                      ? 'Response from Knowledge Base' 
                      : 'Generated by Gemini AI'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
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
