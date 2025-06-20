import React from "react";
import { ChevronRight } from "lucide-react";
import ConditionalJobOfferLetter from "../ConditionalJobOfferLetter";
import CriticalInfoSection from "../CriticalInfoSection";

interface Step1Props {
  answers: Record<string, string>;
  handleAnswer: (id: string, value: string) => void;
  handleNextConditionalOffer: () => void;
  showOfferModal: boolean;
  setShowOfferModal: (v: boolean) => void;
  offerForm: any;
  editingField: string | null;
  handleFieldEdit: (field: string) => void;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFieldBlur: () => void;
  handleFieldKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  allFieldsFilled: boolean;
  handleSendOffer: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentStep: number;
}

const Step1: React.FC<Step1Props> = ({
  answers,
  handleAnswer,
  handleNextConditionalOffer,
  showOfferModal,
  setShowOfferModal,
  offerForm,
  editingField,
  handleFieldEdit,
  handleFieldChange,
  handleFieldBlur,
  handleFieldKeyDown,
  allFieldsFilled,
  handleSendOffer,
  activeTab,
  setActiveTab,
  currentStep,
}) => {
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
              backgroundColor: answers.conditional_offer ? "#E54747" : "transparent",
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
          handleSendOffer={handleSendOffer}
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
