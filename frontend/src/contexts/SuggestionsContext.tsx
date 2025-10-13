import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SuggestionsContextType {
  suggestionsEnabled: boolean;
  setSuggestionsEnabled: (enabled: boolean) => void;
}

const SuggestionsContext = createContext<SuggestionsContextType | undefined>(undefined);

interface SuggestionsProviderProps {
  children: ReactNode;
}

export function SuggestionsProvider({ children }: SuggestionsProviderProps) {
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(() => {
    // Por padrão, sugestões estão habilitadas
    const saved = localStorage.getItem('suggestions_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('suggestions_enabled', JSON.stringify(suggestionsEnabled));
  }, [suggestionsEnabled]);

  return (
    <SuggestionsContext.Provider value={{ suggestionsEnabled, setSuggestionsEnabled }}>
      {children}
    </SuggestionsContext.Provider>
  );
}

export function useSuggestions() {
  const context = useContext(SuggestionsContext);
  if (context === undefined) {
    throw new Error('useSuggestions must be used within a SuggestionsProvider');
  }
  return context;
}