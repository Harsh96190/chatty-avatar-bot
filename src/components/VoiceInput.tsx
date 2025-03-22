
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VoiceInputProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  language: string;
  onChangeLanguage: (lang: string) => void;
  supportedLanguages: { code: string; name: string }[];
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  isListening,
  onStartListening,
  onStopListening,
  language,
  onChangeLanguage,
  supportedLanguages,
}) => {
  const [isSupported, setIsSupported] = useState(true);
  const [hasNetworkError, setHasNetworkError] = useState(false);

  useEffect(() => {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition functionality.",
        variant: "destructive",
      });
    }
  }, []);

  // Reset network error state when user attempts to start listening again
  useEffect(() => {
    if (isListening) {
      setHasNetworkError(false);
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!isSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition functionality.",
        variant: "destructive",
      });
      return;
    }

    if (hasNetworkError) {
      // Try to recover from network error
      setHasNetworkError(false);
    }

    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const handleNetworkError = () => {
    setHasNetworkError(true);
    toast({
      title: "Network Error",
      description: "There was a problem connecting to the speech recognition service. Check your internet connection and try again.",
      variant: "destructive",
    });
    onStopListening();
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            title="Select language"
          >
            <Languages size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {supportedLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => onChangeLanguage(lang.code)}
              className={language === lang.code ? "bg-accent" : ""}
            >
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : hasNetworkError ? "destructive" : "outline"}
        size="icon"
        className={`relative ${
          isListening ? "animate-pulse" : ""
        } ${!isSupported || hasNetworkError ? "opacity-80 hover:opacity-100" : ""}`}
        disabled={!isSupported}
        title={isListening ? "Stop listening" : hasNetworkError ? "Network error, try again" : "Start listening"}
      >
        {isListening ? (
          <MicOff size={16} />
        ) : (
          <Mic size={16} />
        )}
        {isListening && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
        {hasNetworkError && !isListening && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></span>
        )}
      </Button>
    </div>
  );
};

export default VoiceInput;
