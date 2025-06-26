import { useState } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

export interface OfferForm {
  date: string;
  applicant: string;
  position: string;
  employer: string;
}

export function useStep1Storage(candidateId: string) {
  const [offerForm, setOfferForm] = useLocalStorageState<OfferForm>(
    `offerForm_${candidateId}`,
    { date: "", applicant: "", position: "", employer: "" }
  );
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const allFieldsFilled = Boolean(
    offerForm?.date &&
      offerForm?.applicant &&
      offerForm?.position &&
      offerForm?.employer
  );

  return {
    offerForm,
    setOfferForm,
    showOfferModal,
    setShowOfferModal,
    editingField,
    setEditingField,
    allFieldsFilled,
  };
}
