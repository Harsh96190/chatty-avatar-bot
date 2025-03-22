
import { useState, useEffect, useRef, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add a new message
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Process a user message and generate a response
  const processMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    addMessage('user', content);
    
    // Simulate assistant thinking
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Example response - in a real app, this would call an API
      const responseContent = `I understand you're asking about "${content}". This is a simulated response as we haven't connected to a real API yet.`;
      addMessage('assistant', responseContent);
      setIsLoading(false);
    }, 2000);
  }, [addMessage]);

  return {
    messages,
    setMessages,
    addMessage,
    processMessage,
    isLoading,
  };
}

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };
    
    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcript = result[0].transcript;
      setTranscript(transcript);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      stopListening();
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
  };
}

export function useVoiceToggle() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => !prev);
  }, []);

  return { voiceEnabled, toggleVoice };
}
