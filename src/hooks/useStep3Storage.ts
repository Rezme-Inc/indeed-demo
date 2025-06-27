import React, { useState } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

export interface RevocationForm {
  date: string;
  applicant: string;
  position: string;
  convictions: string[];
  numBusinessDays: string;
  contactName: string;
  companyName: string;
  address: string;
  phone: string;
  seriousReason: string;
  timeSinceConduct: string;
  timeSinceSentence: string;
  jobDuties: string;
  fitnessReason: string;
}

export function useStep3Storage(candidateId: string) {
  const [revocationForm, setRevocationForm] = useLocalStorageState<RevocationForm>(
    `revocationForm_${candidateId}`,
    {
      date: "",
      applicant: "",
      position: "",
      convictions: ["", "", ""],
      numBusinessDays: "",
      contactName: "",
      companyName: "",
      address: "",
      phone: "",
      seriousReason: "",
      timeSinceConduct: "",
      timeSinceSentence: "",
      jobDuties: "",
      fitnessReason: "",
    }
  );

  const [showRevocationModal, setShowRevocationModal] = useState(false);
  const [revocationPreview, setRevocationPreview] = useState(false);

  const handleRevocationFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRevocationForm((prev) => ({
      ...(prev as any),
      [e.target.name]: e.target.value,
    }));
  };

  const handleRevocationArrayChange = (idx: number, value: string) => {
    setRevocationForm((prev) => ({
      ...(prev as any),
      convictions: (prev as any).convictions.map((item: string, i: number) =>
        i === idx ? value : item
      ),
    }));
  };

  return {
    revocationForm,
    setRevocationForm,
    showRevocationModal,
    setShowRevocationModal,
    revocationPreview,
    setRevocationPreview,
    handleRevocationFormChange,
    handleRevocationArrayChange,
  };
}
