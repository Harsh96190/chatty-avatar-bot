
import React, { useState, useEffect, useRef } from 'react';

interface AvatarProps {
  isThinking: boolean;
  isSpeaking?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ isThinking, isSpeaking = false }) => {
  const [animationClass, setAnimationClass] = useState('');
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const avatarRef = useRef<HTMLImageElement>(null);
  
  const apiKey = 'aGFyc2h1OTYxOTBAZ21haWwuY29t:xw-R_gwRHbigpQTtmAepu'; // Using the provided API key
  const avatarUrl = `https://api.d-id.com/talks/avatars?key=${apiKey}`;

  useEffect(() => {
    if (isThinking) {
      setAnimationClass('animate-thinking');
    } else if (isSpeaking) {
      setAnimationClass('animate-pulse-slow');
    } else {
      setAnimationClass('');
    }
  }, [isThinking, isSpeaking]);

  useEffect(() => {
    // Attempt to load avatar from the API
    const fetchAvatar = async () => {
      try {
        // In a real implementation, we would use the API to generate an avatar
        // For now, we're just setting a state to indicate it loaded
        setAvatarLoaded(true);
      } catch (error) {
        console.error('Error loading avatar:', error);
        setAvatarError(true);
      }
    };

    fetchAvatar();
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className={`avatar-container rounded-full w-36 h-36 md:w-48 md:h-48 border-4 border-avatar-border shadow-lg ${animationClass}`}>
        {/* Default fallback avatar */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-primary text-7xl font-light">AI</div>
        </div>
        
        {/* Avatar from API when loaded */}
        {avatarLoaded && !avatarError && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <img 
              ref={avatarRef}
              src={`https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`} // Placeholder for actual API
              alt="AI Avatar"
              className="w-full h-full object-cover"
              onError={() => setAvatarError(true)}
            />
          </div>
        )}
        
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
