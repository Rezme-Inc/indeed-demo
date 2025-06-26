import React, { useState } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

export interface ReassessmentForm {
  employer: string;
  applicant: string;
  position: string;
  offerDate: string;
  reassessmentDate: string;
  reportDate: string;
  performedBy: string;
  error: string;
  errorYesNo: string;
  workExperience: string;
  jobTraining: string;
  education: string;
  rehabPrograms: string;
  counseling: string;
  communityService: string;
  lettersOfSupport: string;
  religiousAttendance: string;
  rescindReason: string;
  evidenceA: string;
  evidenceB: string;
  evidenceC: string;
  evidenceD: string;
}

export function useStep4Storage(candidateId: string) {
  const [reassessmentForm, setReassessmentForm] =
    useLocalStorageState<ReassessmentForm>(`reassessmentForm_${candidateId}`, {
      employer: "",
      applicant: "",
      position: "",
      offerDate: "",
      reassessmentDate: "",
      reportDate: "",
      performedBy: "",
      error: "",
      errorYesNo: "No",
      workExperience: "",
      jobTraining: "",
      education: "",
      rehabPrograms: "",
      counseling: "",
      communityService: "",
      lettersOfSupport: "",
      religiousAttendance: "",
      rescindReason: "",
      evidenceA: "",
      evidenceB: "",
      evidenceC: "",
      evidenceD: "",
    });

  const [showReassessmentInfoModal, setShowReassessmentInfoModal] = useState(false);
  const [showReassessmentSplit, setShowReassessmentSplit] = useState(false);
  const [reassessmentPreview, setReassessmentPreview] = useState(false);
  const [reassessmentDecision, setReassessmentDecision] = useState<"rescind" | "extend">("rescind");
  const [extendReason, setExtendReason] = useState(
    "BASED ON THE FACTORS ABOVE, WE ARE EXTENDING OUR OFFER OF EMPLOYMENT."
  );

  const handleReassessmentFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setReassessmentForm((prev) => ({
      ...(prev as any),
      [e.target.name]: e.target.value,
    }));
  };

  return {
    reassessmentForm,
    setReassessmentForm,
    showReassessmentInfoModal,
    setShowReassessmentInfoModal,
    showReassessmentSplit,
    setShowReassessmentSplit,
    reassessmentPreview,
    setReassessmentPreview,
    reassessmentDecision,
    setReassessmentDecision,
    extendReason,
    setExtendReason,
    handleReassessmentFormChange,
  };
}
