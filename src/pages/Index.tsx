
import React, { useEffect } from 'react';
import Avatar from '../components/Avatar';
import ChatInput from '../components/ChatInput';
import MessageHistory from '../components/MessageHistory';
import ThinkingIndicator from '../components/ThinkingIndicator';
import ToggleSwitch from '../components/ToggleSwitch';
import { useMessages, useVoiceInput, useVoiceToggle } from '../lib/hooks';
import { DEFAULT_MESSAGES } from '../lib/constants';

const Index = () => {
  const { messages, setMessages, processMessage, isLoading } = useMessages();
  const { isListening, transcript, startListening, stopListening } = useVoiceInput();
  const { voiceEnabled, toggleVoice } = useVoiceToggle();

  // Load default messages on mount
  useEffect(() => {
    setMessages(DEFAULT_MESSAGES);
  }, [setMessages]);

  const handleSendMessage = (content: string) => {
    processMessage(content);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium">Conversational AI Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">Ask questions using text or voice</p>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Avatar and Controls Section */}
        <div className="md:w-1/3 flex flex-col">
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center">
            <div className="relative w-full aspect-square mb-4">
              <Avatar isThinking={isLoading} isSpeaking={false} />
            </div>
            
            <ThinkingIndicator isThinking={isLoading} />
            
            <div className="mt-6 w-full">
              <ToggleSwitch 
                enabled={voiceEnabled} 
                onToggle={toggleVoice} 
                label="Voice Responses" 
              />
            </div>
          </div>
        </div>
        
        {/* Chat Section */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Conversation</h2>
          </div>
          
          <MessageHistory messages={messages} />
          
          <ChatInput 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isListening={isListening}
            transcript={transcript}
            onStartListening={startListening}
            onStopListening={stopListening}
            voiceEnabled={voiceEnabled}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
