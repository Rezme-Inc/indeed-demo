import React, { useState } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

export interface FinalRevocationForm {
  date: string;
  applicant: string;
  dateOfNotice: string;
  noResponse: boolean;
  infoSubmitted: boolean;
  infoSubmittedList: string;
  errorOnReport: string;
  convictions: string[];
  seriousReason: string;
  timeSinceConduct: string;
  timeSinceSentence: string;
  position: string;
  jobDuties: string[];
  fitnessReason: string;
  reconsideration: string;
  reconsiderationProcedure: string;
  contactName: string;
  companyName: string;
  address: string;
  phone: string;
}

export function useStep5Storage(candidateId: string) {
  const [finalRevocationForm, setFinalRevocationForm] =
    useLocalStorageState<FinalRevocationForm>(`finalRevocationForm_${candidateId}`, {
      date: "",
      applicant: "",
      dateOfNotice: "",
      noResponse: false,
      infoSubmitted: false,
      infoSubmittedList: "",
      errorOnReport: "",
      convictions: ["", "", ""],
      seriousReason: "",
      timeSinceConduct: "",
      timeSinceSentence: "",
      position: "",
      jobDuties: ["", "", "", ""],
      fitnessReason: "",
      reconsideration: "",
      reconsiderationProcedure: "",
      contactName: "",
      companyName: "",
      address: "",
      phone: "",
    });

  const [showFinalRevocationModal, setShowFinalRevocationModal] = useState(false);
  const [finalRevocationPreview, setFinalRevocationPreview] = useState(false);

  const handleFinalRevocationFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === "checkbox") {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setFinalRevocationForm((prev: any) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleFinalRevocationArrayChange = (
    field: "convictions" | "jobDuties",
    idx: number,
    value: string
  ) => {
    setFinalRevocationForm((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) =>
        i === idx ? value : item
      ),
    }));
  };

  return {
    finalRevocationForm,
    setFinalRevocationForm,
    showFinalRevocationModal,
    setShowFinalRevocationModal,
    finalRevocationPreview,
    setFinalRevocationPreview,
    handleFinalRevocationFormChange,
    handleFinalRevocationArrayChange,
  };
}
