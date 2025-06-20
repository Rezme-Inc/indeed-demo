import React from "react";
import { CheckCircle2, Info } from "lucide-react";
import CriticalInfoSection from "../CriticalInfoSection";
import PreliminaryRevocationModal from "../PreliminaryRevocationModal";

interface Step3Props {
  savedHireDecision: any;
  setShowRevocationModal: (v: boolean) => void;
  showRevocationModal: boolean;
  revocationForm: any;
  handleRevocationFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleRevocationArrayChange: (idx: number, value: string) => void;
  revocationPreview: boolean;
  setRevocationPreview: (v: boolean) => void;
  handleSendRevocation: () => void;
  onBusinessDaysSet: (days: number) => void;
  onAddConviction: () => void;
  handleProceedWithHire: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentStep: number;
}

const Step3: React.FC<Step3Props> = ({
  savedHireDecision,
  setShowRevocationModal,
  showRevocationModal,
  revocationForm,
  handleRevocationFormChange,
  handleRevocationArrayChange,
  revocationPreview,
  setRevocationPreview,
  handleSendRevocation,
  onBusinessDaysSet,
  onAddConviction,
  handleProceedWithHire,
  activeTab,
  setActiveTab,
  currentStep,
}) => {
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2
          className="text-3xl font-bold mb-6 text-black"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Preliminary Job Offer Revocation
        </h2>

        {/* Hire Decision Success Message */}
        {savedHireDecision && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold text-green-900 mb-1"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Decision Made: Proceed with Hire
                </p>
                <p
                  className="text-sm text-green-800"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Decision made on {new Date(savedHireDecision.sentAt).toLocaleDateString()} to proceed with hiring this candidate. The assessment process is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <p
              className="text-sm text-blue-900 leading-relaxed"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              The following may be used to inform a job applicant in writing of the intent to revoke a conditional job offer due to relevant criminal history
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-200 ${savedHireDecision ? "opacity-50 cursor-not-allowed" : "text-white hover:opacity-90"}`}
            onClick={() => (savedHireDecision ? undefined : setShowRevocationModal(true))}
            disabled={!!savedHireDecision}
            style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
          >
            Issue Preliminary Job Offer Revocation
          </button>
          <button
            className={`px-8 py-3 rounded-xl text-lg font-semibold border transition-all duration-200 ${savedHireDecision ? "border-green-500 text-green-700 bg-green-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            onClick={() => (savedHireDecision ? undefined : handleProceedWithHire())}
            disabled={!!savedHireDecision}
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {savedHireDecision ? "✓ Proceed with hire (Selected)" : "Proceed with hire"}
          </button>
        </div>
      </div>

      {/* Critical Information Section */}
      <CriticalInfoSection activeTab={activeTab} setActiveTab={setActiveTab} currentStep={currentStep} />

      {/* Preliminary Revocation Modal */}
      <PreliminaryRevocationModal
        showRevocationModal={showRevocationModal}
        setShowRevocationModal={setShowRevocationModal}
        revocationForm={revocationForm}
        handleRevocationFormChange={handleRevocationFormChange}
        handleRevocationArrayChange={handleRevocationArrayChange}
        revocationPreview={revocationPreview}
        setRevocationPreview={setRevocationPreview}
        handleSendRevocation={handleSendRevocation}
        onBusinessDaysSet={onBusinessDaysSet}
        onAddConviction={onAddConviction}
      />
    </>
  );
};

export default Step3;
