import { useState, useCallback } from "react";

export interface ReferenceData {
  title: string;
  content: string | string[];
  source: string;
  fieldType: 'text' | 'array' | 'date';
}

export function useReferenceData() {
  const [isReferencePanelOpen, setIsReferencePanelOpen] = useState(false);
  const [currentReferenceData, setCurrentReferenceData] = useState<ReferenceData | null>(null);

  const showReference = useCallback((referenceData: ReferenceData) => {
    setCurrentReferenceData(referenceData);
    setIsReferencePanelOpen(true);
  }, []);

  const closeReference = useCallback(() => {
    setIsReferencePanelOpen(false);
    // Small delay before clearing data to allow for smooth animation
    setTimeout(() => setCurrentReferenceData(null), 300);
  }, []);

  const clearReference = useCallback(() => {
    setCurrentReferenceData(null);
    setIsReferencePanelOpen(false);
  }, []);

  return {
    isReferencePanelOpen,
    currentReferenceData,
    showReference,
    closeReference,
    clearReference,
  };
} 
