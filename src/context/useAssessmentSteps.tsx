import { createContext, useContext, useEffect, useState } from "react";
import { AssessmentDatabaseService } from "@/lib/services/assessmentDatabase";

interface AssessmentStepsState {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  handleNext: () => void;
  handleBack: () => void;
  syncCurrentStepFromDatabase: () => Promise<void>;
}

const AssessmentStepsContext = createContext<AssessmentStepsState | undefined>(
  undefined
);

interface ProviderProps {
  children: React.ReactNode;
  candidateId: string;
}

export function AssessmentStepsProvider({ children, candidateId }: ProviderProps) {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    const saved = localStorage.getItem(`assessmentCurrentStep_${candidateId}`);
    return saved ? parseInt(saved, 10) : 1;
  });
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(`assessmentAnswers_${candidateId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [notes, setNotes] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`assessmentNotes_${candidateId}`) || "";
  });

  // Sync current step from database on component mount
  const syncCurrentStepFromDatabase = async () => {
    try {
      console.log('[AssessmentSteps] Syncing current step from database...');
      const dbCurrentStep = await AssessmentDatabaseService.getCurrentStep(candidateId);
      console.log('[AssessmentSteps] Database current step:', dbCurrentStep);

      if (dbCurrentStep !== currentStep) {
        console.log('[AssessmentSteps] Updating current step from database:', dbCurrentStep);
        setCurrentStep(dbCurrentStep);
        // Also update localStorage to keep it in sync
        localStorage.setItem(`assessmentCurrentStep_${candidateId}`, dbCurrentStep.toString());
      }
    } catch (error) {
      console.error('[AssessmentSteps] Error syncing current step from database:', error);
      // Keep the localStorage value as fallback
    }
  };

  // Load current step from database on mount
  useEffect(() => {
    syncCurrentStepFromDatabase();
  }, [candidateId]);

  useEffect(() => {
    localStorage.setItem(
      `assessmentCurrentStep_${candidateId}`,
      currentStep.toString()
    );
  }, [currentStep, candidateId]);

  useEffect(() => {
    localStorage.setItem(
      `assessmentAnswers_${candidateId}`,
      JSON.stringify(answers)
    );
  }, [answers, candidateId]);

  useEffect(() => {
    localStorage.setItem(`assessmentNotes_${candidateId}`, notes);
  }, [notes, candidateId]);

  const handleNext = () => {
    // Step 1 -> Step 2 only
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };
  const handleBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  return (
    <AssessmentStepsContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        answers,
        setAnswers,
        notes,
        setNotes,
        handleNext,
        handleBack,
        syncCurrentStepFromDatabase,
      }}
    >
      {children}
    </AssessmentStepsContext.Provider>
  );
}

export function useAssessmentSteps() {
  const ctx = useContext(AssessmentStepsContext);
  if (!ctx) throw new Error("useAssessmentSteps must be used within provider");
  return ctx;
}
