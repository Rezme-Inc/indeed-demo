import React, { useState } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

export interface AssessmentForm {
  employer: string;
  applicant: string;
  position: string;
  offerDate: string;
  assessmentDate: string;
  reportDate: string;
  performedBy: string;
  duties: string[];
  conduct: string;
  howLongAgo: string;
  activities: string[];
  rescindReason: string;
}

export function useStep2Storage(candidateId: string) {
  const [assessmentForm, setAssessmentForm] = useLocalStorageState<AssessmentForm>(
    `assessmentForm_${candidateId}`,
    {
      employer: "",
      applicant: "",
      position: "",
      offerDate: "",
      assessmentDate: "",
      reportDate: "",
      performedBy: "",
      duties: ["", "", "", ""],
      conduct: "",
      howLongAgo: "",
      activities: ["", "", ""],
      rescindReason: "",
    }
  );

  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentPreview, setAssessmentPreview] = useState(false);

  const handleAssessmentFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAssessmentForm((prev) => ({
      ...(prev as any),
      [e.target.name]: e.target.value,
    }));
  };

  const handleAssessmentArrayChange = (
    field: "duties" | "activities",
    idx: number,
    value: string
  ) => {
    setAssessmentForm((prev) => ({
      ...(prev as any),
      [field]: (prev as any)[field].map((item: string, i: number) =>
        i === idx ? value : item
      ),
    }));
  };

  return {
    assessmentForm,
    setAssessmentForm,
    showAssessmentModal,
    setShowAssessmentModal,
    assessmentPreview,
    setAssessmentPreview,
    handleAssessmentFormChange,
    handleAssessmentArrayChange,
  };
}
