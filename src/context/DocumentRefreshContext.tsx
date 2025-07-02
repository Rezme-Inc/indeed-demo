import React, { createContext, useContext, ReactNode } from 'react';

interface DocumentRefreshContextType {
  refreshDocuments: () => Promise<void>;
}

const DocumentRefreshContext = createContext<DocumentRefreshContextType | undefined>(undefined);

interface DocumentRefreshProviderProps {
  children: ReactNode;
  refreshDocuments: () => Promise<void>;
}

export const DocumentRefreshProvider: React.FC<DocumentRefreshProviderProps> = ({
  children,
  refreshDocuments,
}) => {
  return (
    <DocumentRefreshContext.Provider value={{ refreshDocuments }}>
      {children}
    </DocumentRefreshContext.Provider>
  );
};

export const useDocumentRefresh = () => {
  const context = useContext(DocumentRefreshContext);
  if (context === undefined) {
    throw new Error('useDocumentRefresh must be used within a DocumentRefreshProvider');
  }
  return context;
}; 
