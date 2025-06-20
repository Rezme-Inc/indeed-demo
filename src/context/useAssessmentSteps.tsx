import { createContext, useContext, useEffect, useState } from "react";

interface AssessmentStepsState {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  handleNext: () => void;
  handleBack: () => void;
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

  const handleNext = () => setCurrentStep((s) => s + 1);
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
