import React, { createContext, useContext } from "react";
import { useStep1Storage } from "@/hooks/useStep1Storage";
import { useStep2Storage } from "@/hooks/useStep2Storage";
import { useStep3Storage } from "@/hooks/useStep3Storage";
import { useStep4Storage } from "@/hooks/useStep4Storage";
import { useStep5Storage } from "@/hooks/useStep5Storage";

interface ProviderProps {
  children: React.ReactNode;
  candidateId: string;
}

const AssessmentStorageContext = createContext<
  | {
      step1Storage: ReturnType<typeof useStep1Storage>;
      step2Storage: ReturnType<typeof useStep2Storage>;
      step3Storage: ReturnType<typeof useStep3Storage>;
      step4Storage: ReturnType<typeof useStep4Storage>;
      step5Storage: ReturnType<typeof useStep5Storage>;
    }
  | undefined
>(undefined);

export function AssessmentStorageProvider({ children, candidateId }: ProviderProps) {
  const step1Storage = useStep1Storage(candidateId);
  const step2Storage = useStep2Storage(candidateId);
  const step3Storage = useStep3Storage(candidateId);
  const step4Storage = useStep4Storage(candidateId);
  const step5Storage = useStep5Storage(candidateId);

  return (
    <AssessmentStorageContext.Provider
      value={{ step1Storage, step2Storage, step3Storage, step4Storage, step5Storage }}
    >
      {children}
    </AssessmentStorageContext.Provider>
  );
}

export function useAssessmentStorageContext() {
  const ctx = useContext(AssessmentStorageContext);
  if (!ctx) throw new Error("useAssessmentStorageContext must be used within provider");
  return ctx;
}
