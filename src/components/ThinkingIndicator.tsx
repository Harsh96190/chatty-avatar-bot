
import React, { useState, useEffect } from 'react';
import { LOADING_PHRASES } from '../lib/constants';

interface ThinkingIndicatorProps {
  isThinking: boolean;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ isThinking }) => {
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);

  useEffect(() => {
    if (!isThinking) return;

    let intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * LOADING_PHRASES.length);
      setLoadingPhrase(LOADING_PHRASES[randomIndex]);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [isThinking]);

  if (!isThinking) return null;

  return (
    <div className="animate-fade-in flex items-center justify-center px-4 py-3 mt-2 rounded-full glass-card max-w-max mx-auto">
      <div className="mr-2 text-sm font-medium text-primary">{loadingPhrase}</div>
      <div className="flex space-x-1">
        <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300"></div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
