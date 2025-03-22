import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'knowledge_base' | 'gemini';
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
  const addMessage = useCallback((role: 'user' | 'assistant', content: string, source?: 'knowledge_base' | 'gemini') => {
    const sanitizedContent = role === 'user' ? sanitizeInput(content) : content;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content: sanitizedContent,
      timestamp: new Date().toISOString(),
      source
    };
    
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Process a user message and generate a response
  const processMessage = useCallback(async (content: string, language: string = 'en-US') => {
    if (!content.trim()) return;
    
    // Add user message
    addMessage('user', content);
    
    // Set assistant thinking
    setIsLoading(true);
    
    try {
      // Call our API function
      const { data, error } = await supabase.functions.invoke('query-assistant', {
        body: {
          query: content,
          language
        }
      });
      
      if (error) {
        console.error('Error querying assistant:', error);
        toast({
          title: "An error occurred",
          description: error.message || "Failed to process your message",
          variant: "destructive",
        });
        addMessage('assistant', "I'm sorry, I encountered an error while processing your request. Please try again later.");
        return;
      }
      
      if (!data || !data.answer) {
        throw new Error("Invalid response from assistant");
      }
      
      // Add assistant response with source information
      addMessage('assistant', data.answer, data.source);
      
    } catch (err) {
      console.error('Unexpected error:', err);
      addMessage('assistant', "I'm sorry, something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
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
  const [networkError, setNetworkError] = useState(false);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition functionality.",
        variant: "destructive",
      });
      return;
    }

    // Reset any existing network error state
    setNetworkError(false);

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition not supported');
      return;
    }
    
    // Clean up any existing instance
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    
    recognitionRef.current = new SpeechRecognitionAPI();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };
    
    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcript = result[0].transcript;
      setTranscript(transcript);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      
      if (event.error === 'network') {
        setNetworkError(true);
        toast({
          title: "Network Error",
          description: "There was a problem connecting to the speech recognition service. Check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
      }
      
      stopListening();
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognitionRef.current.start();
      
      toast({
        title: "Listening...",
        description: "Speak now. Click the mic button again to stop.",
      });
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      toast({
        title: "Error Starting Speech Recognition",
        description: "There was a problem starting the speech recognition service. Please try again.",
        variant: "destructive",
      });
      setIsListening(false);
    }
    
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
        // Try to abort instead
        try {
          recognitionRef.current.abort();
        } catch (abortErr) {
          console.error('Error aborting speech recognition:', abortErr);
        }
      }
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
    
    toast({
      title: "Language Changed",
      description: `Now using ${supportedLanguages.find(l => l.code === langCode)?.name || langCode}`,
    });
    
  }, [isListening, startListening, supportedLanguages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error cleaning up speech recognition:', err);
        }
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
    supportedLanguages,
    networkError,
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
