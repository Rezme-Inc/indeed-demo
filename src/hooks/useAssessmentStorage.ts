import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import { useLocalStorageState } from "./useLocalStorageState";

export function useAssessmentStorage(candidateId: string) {
  const {
    currentStep,
    setCurrentStep,
    answers,
    setAnswers,
    notes,
    setNotes,
    handleNext,
    handleBack,
  } = useAssessmentSteps();

  const [savedOfferLetter, setSavedOfferLetter] = useLocalStorageState<any>(
    `offerLetter_${candidateId}`,
    null
  );
  const [savedAssessment, setSavedAssessment] = useLocalStorageState<any>(
    `assessment_${candidateId}`,
    null
  );
  const [savedRevocationNotice, setSavedRevocationNotice] =
    useLocalStorageState<any>(`revocationNotice_${candidateId}`, null);
  const [savedReassessment, setSavedReassessment] = useLocalStorageState<any>(
    `reassessment_${candidateId}`,
    null
  );
  const [savedFinalRevocationNotice, setSavedFinalRevocationNotice] =
    useLocalStorageState<any>(`finalRevocationNotice_${candidateId}`, null);
  const [savedHireDecision, setSavedHireDecision] = useLocalStorageState<any>(
    `hireDecision_${candidateId}`,
    null
  );
  const [savedPreliminaryDecision, setSavedPreliminaryDecision] =
    useLocalStorageState<any>(`preliminaryDecision_${candidateId}`, null);

  const clearAssessmentProgress = () => {
    localStorage.removeItem(`assessmentAnswers_${candidateId}`);
    localStorage.removeItem(`assessmentCurrentStep_${candidateId}`);
    localStorage.removeItem(`assessmentNotes_${candidateId}`);
  };

  const clearAllSavedForms = () => {
    localStorage.removeItem(`offerLetter_${candidateId}`);
    localStorage.removeItem(`assessment_${candidateId}`);
    localStorage.removeItem(`revocationNotice_${candidateId}`);
    localStorage.removeItem(`reassessment_${candidateId}`);
    localStorage.removeItem(`finalRevocationNotice_${candidateId}`);
    localStorage.removeItem(`hireDecision_${candidateId}`);
    localStorage.removeItem(`preliminaryDecision_${candidateId}`);
    clearAssessmentProgress();

    setSavedOfferLetter(null);
    setSavedAssessment(null);
    setSavedRevocationNotice(null);
    setSavedReassessment(null);
    setSavedFinalRevocationNotice(null);
    setSavedHireDecision(null);
    setSavedPreliminaryDecision(null);
  };

  return {
    currentStep,
    setCurrentStep,
    answers,
    setAnswers,
    notes,
    setNotes,
    handleNext,
    handleBack,
    savedOfferLetter,
    setSavedOfferLetter,
    savedAssessment,
    setSavedAssessment,
    savedRevocationNotice,
    setSavedRevocationNotice,
    savedReassessment,
    setSavedReassessment,
    savedFinalRevocationNotice,
    setSavedFinalRevocationNotice,
    savedHireDecision,
    setSavedHireDecision,
    savedPreliminaryDecision,
    setSavedPreliminaryDecision,
    clearAssessmentProgress,
    clearAllSavedForms,
  };
}
