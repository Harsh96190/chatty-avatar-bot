
import React, { useState, useEffect } from 'react';

interface AvatarProps {
  isThinking: boolean;
  isSpeaking?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ isThinking, isSpeaking = false }) => {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isThinking) {
      setAnimationClass('animate-thinking');
    } else if (isSpeaking) {
      setAnimationClass('animate-pulse-slow');
    } else {
      setAnimationClass('');
    }
  }, [isThinking, isSpeaking]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className={`avatar-container rounded-full w-36 h-36 md:w-48 md:h-48 border-4 border-avatar-border shadow-lg ${animationClass}`}>
        {/* Placeholder avatar - should be replaced with an actual animated avatar */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-primary text-7xl font-light">AI</div>
        </div>
        
        {isThinking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-1">
              <div className="h-3 w-1 bg-primary rounded-full animate-wave-1"></div>
              <div className="h-3 w-1 bg-primary rounded-full animate-wave-2"></div>
              <div className="h-3 w-1 bg-primary rounded-full animate-wave-3"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Avatar;
