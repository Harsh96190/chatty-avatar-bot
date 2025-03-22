
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

  const toggleListening = () => {
    if (!isSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition functionality.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
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
        variant={isListening ? "destructive" : "outline"}
        size="icon"
        className={`relative ${
          isListening ? "animate-pulse" : ""
        } ${!isSupported ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={!isSupported}
        title={isListening ? "Stop listening" : "Start listening"}
      >
        {isListening ? (
          <MicOff size={16} />
        ) : (
          <Mic size={16} />
        )}
        {isListening && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </Button>
    </div>
  );
};

export default VoiceInput;
