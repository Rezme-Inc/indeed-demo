import { useAssessmentStorageContext } from "@/context/AssessmentStorageProvider";
import { useAssessmentSteps } from "@/context/useAssessmentSteps";
import { useAssessmentStorage } from "@/hooks/useAssessmentStorage";
import { useHRAdminProfile } from "@/hooks/useHRAdminProfile";
import { useStep1Actions } from "@/hooks/useStep1Actions";
import { initializeCSRFProtection } from "@/lib/csrf";
import { ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CriticalInfoSection from "../../critical/CriticalInfoSection";
import ConditionalJobOfferLetter from "./ConditionalJobOfferLetter";

const Step1: React.FC = () => {
  const { answers, setAnswers, handleNext, currentStep } = useAssessmentSteps();
  const [activeTab, setActiveTab] = useState("Legal");
  const { step1Storage } = useAssessmentStorageContext();
  const {
    offerForm,
    setOfferForm,
    showOfferModal,
    setShowOfferModal,
    editingField,
    setEditingField,
    allFieldsFilled,
  } = step1Storage;

  const { hrAdmin } = useHRAdminProfile();
  const { userId } = useParams<{ userId: string }>();
  const { setSavedOfferLetter } = useAssessmentStorage(userId as string);
  const { sendOffer } = useStep1Actions(userId as string, step1Storage, {
    hrAdminProfile: hrAdmin,
    hrAdminId: hrAdmin?.id || null,
    trackingActive: false,
    assessmentSessionId: null,
    setSavedOfferLetter,
    handleNext,
  });

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextConditionalOffer = () => {
    if (answers.conditional_offer === "No") {
      setShowOfferModal(true);
    } else {
      const externalOfferData = {
        sentAt: new Date().toISOString(),
        candidateId: userId,
        hrAdminName: hrAdmin
          ? `${hrAdmin.first_name} ${hrAdmin.last_name}`
          : "",
        company: hrAdmin?.company || "",
        sentExternally: true,
        timestamp: Date.now(),
      };
      setSavedOfferLetter(externalOfferData);
      handleNext();
    }
  };

  const handleFieldEdit = (field: string) => setEditingField(field);
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfferForm((prev) => ({
      ...(prev as any),
      [e.target.name]: e.target.value,
    }));
  };
  const handleFieldBlur = () => setEditingField(null);
  const handleFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setEditingField(null);
  };

  useEffect(() => {
    initializeCSRFProtection();
  }, []);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2
          className="text-3xl font-bold mb-8 text-black"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Confirm Conditional Offer
        </h2>
        <div className="space-y-6 mb-10">
          <label className="flex items-center space-x-4 cursor-pointer">
            <input
              type="radio"
              name="conditional_offer"
              value="Yes"
              checked={answers.conditional_offer === "Yes"}
              onChange={() => handleAnswer("conditional_offer", "Yes")}
              className="h-6 w-6 border-2 border-gray-300 focus:ring-2 focus:ring-red-500"
              style={{ accentColor: "#E54747" }}
            />
            <span
              className="text-xl text-black"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Yes, a conditional offer has been extended
            </span>
          </label>
          <label className="flex items-center space-x-4 cursor-pointer">
            <input
              type="radio"
              name="conditional_offer"
              value="No"
              checked={answers.conditional_offer === "No"}
              onChange={() => handleAnswer("conditional_offer", "No")}
              className="h-6 w-6 border-2 border-gray-300 focus:ring-2 focus:ring-red-500"
              style={{ accentColor: "#E54747" }}
            />
            <span
              className="text-xl text-black"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              No, a conditional offer has not been extended
            </span>
          </label>
        </div>
        <div className="flex justify-between items-center mt-8">
          <button
            className="px-8 py-3 border border-gray-300 text-gray-400 rounded-xl text-lg font-semibold cursor-not-allowed"
            disabled
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Previous
          </button>
          <button
            className={`px-8 py-3 rounded-xl text-lg font-semibold flex items-center space-x-2 transition-all duration-200 ${
              answers.conditional_offer
                ? "text-white hover:opacity-90"
                : "border border-gray-300 text-gray-400 cursor-not-allowed"
            }`}
            style={{
              fontFamily: "Poppins, sans-serif",
              backgroundColor: answers.conditional_offer
                ? "#E54747"
                : "transparent",
            }}
            onClick={handleNextConditionalOffer}
            disabled={!answers.conditional_offer}
          >
            Next <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
        <ConditionalJobOfferLetter
          showOfferModal={showOfferModal}
          setShowOfferModal={setShowOfferModal}
          offerForm={offerForm}
          editingField={editingField}
          handleFieldEdit={handleFieldEdit}
          handleFieldChange={handleFieldChange}
          handleFieldBlur={handleFieldBlur}
          handleFieldKeyDown={handleFieldKeyDown}
          allFieldsFilled={allFieldsFilled}
          handleSendOffer={sendOffer}
        />
      </div>

      <CriticalInfoSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStep={currentStep}
      />
    </>
  );
};

export default Step1;
