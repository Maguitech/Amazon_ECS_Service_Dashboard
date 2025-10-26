import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { AWSCredentials } from '../types/aws';

interface AWSContextType {
  credentials: AWSCredentials | null;
  setCredentials: (credentials: AWSCredentials | null) => void;
  isConfigured: boolean;
}

const AWSContext = createContext<AWSContextType | undefined>(undefined);

export const AWSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [credentials, setCredentials] = useState<AWSCredentials | null>(() => {
    const stored = localStorage.getItem('awsCredentials');
    return stored ? JSON.parse(stored) : null;
  });

  const handleSetCredentials = (creds: AWSCredentials | null) => {
    setCredentials(creds);
    if (creds) {
      localStorage.setItem('awsCredentials', JSON.stringify(creds));
    } else {
      localStorage.removeItem('awsCredentials');
    }
  };

  return (
    <AWSContext.Provider
      value={{
        credentials,
        setCredentials: handleSetCredentials,
        isConfigured: !!credentials,
      }}
    >
      {children}
    </AWSContext.Provider>
  );
};

export const useAWS = () => {
  const context = useContext(AWSContext);
  if (!context) {
    throw new Error('useAWS must be used within AWSProvider');
  }
  return context;
};
