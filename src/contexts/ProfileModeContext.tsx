import React, { createContext, useContext, useState } from 'react';

interface ProfileModeContextType {
  isProfileMode: boolean;
  setIsProfileMode: (mode: boolean) => void;
  toggleProfileMode: () => void;
}

const ProfileModeContext = createContext<ProfileModeContextType | undefined>(undefined);

export const useProfileMode = () => {
  const context = useContext(ProfileModeContext);
  if (context === undefined) {
    throw new Error('useProfileMode must be used within a ProfileModeProvider');
  }
  return context;
};

export const ProfileModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProfileMode, setIsProfileMode] = useState(false);

  const toggleProfileMode = () => {
    setIsProfileMode(prev => !prev);
  };

  const value = {
    isProfileMode,
    setIsProfileMode,
    toggleProfileMode,
  };

  return (
    <ProfileModeContext.Provider value={value}>
      {children}
    </ProfileModeContext.Provider>
  );
};