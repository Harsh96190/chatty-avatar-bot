
import { useState, useEffect, useRef, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Simple sanitization for user input
export function sanitizeInput(text: string): string {
  // Remove excessive spaces
  let sanitized = text.replace(/\s+/g, ' ').trim();
  
  // Remove common filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'sort of', 'kind of'];
  fillerWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Clean up multiple spaces that might have resulted from removing words
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Ensure the first letter is capitalized and ends with proper punctuation
  if (sanitized.length > 0) {
    sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
    if (!/[.!?]$/.test(sanitized)) {
      sanitized += '.';
    }
  }
  
  return sanitized;
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add a new message
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const sanitizedContent = role === 'user' ? sanitizeInput(content) : content;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content: sanitizedContent,
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
  const [language, setLanguage] = useState('en-US');
  const [supportedLanguages, setSupportedLanguages] = useState<{code: string, name: string}[]>([
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
  ]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition not supported');
      return;
    }
    
    recognitionRef.current = new SpeechRecognitionAPI();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;
    
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
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);
  
  const changeLanguage = useCallback((langCode: string) => {
    setLanguage(langCode);
    // If currently listening, restart with new language
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setTimeout(() => startListening(), 100);
    }
  }, [isListening, startListening]);

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
    language,
    changeLanguage,
    supportedLanguages
  };
}

export function useVoiceToggle() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => !prev);
  }, []);

  return { voiceEnabled, toggleVoice };
}

// Text suggestions functionality
export function useTextSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkText = useCallback((text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }
    
    setIsChecking(true);
    
    // For a real implementation, this would call a spell check API
    // For now, we'll simulate some suggestions based on the last word
    const words = text.split(' ');
    const lastWord = words[words.length - 1].toLowerCase();
    
    // Simulate some suggestions based on common words
    const possibleSuggestions: Record<string, string[]> = {
      'h': ['hello', 'how', 'help'],
      'wh': ['what', 'where', 'when', 'why'],
      'c': ['can', 'could', 'computer'],
      't': ['the', 'that', 'there', 'they'],
    };
    
    const firstChar = lastWord.charAt(0);
    const secondChar = lastWord.length > 1 ? lastWord.charAt(1) : '';
    const key = firstChar + (secondChar || '');
    
    setTimeout(() => {
      if (key in possibleSuggestions) {
        setSuggestions(possibleSuggestions[key].filter(s => 
          s.startsWith(lastWord) && s !== lastWord
        ));
      } else if (firstChar in possibleSuggestions) {
        setSuggestions(possibleSuggestions[firstChar].filter(s => 
          s.startsWith(lastWord) && s !== lastWord
        ));
      } else {
        setSuggestions([]);
      }
      setIsChecking(false);
    }, 300);
  }, []);

  return {
    suggestions,
    isChecking,
    checkText,
    clearSuggestions: () => setSuggestions([])
  };
}
