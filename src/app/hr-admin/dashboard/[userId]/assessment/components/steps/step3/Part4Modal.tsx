import React, { useState } from "react";
import AssessmentPartWrapper from "@/components/assessment/AssessmentPartWrapper";

interface Part4ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  formData: any;
  updateFormData: (updates: any) => void;
  candidateProfile: any;
  hrAdmin: any;
  step1Storage: any;
  step2Storage: any;
  onNext: () => void;
  onBack: () => void;
  candidateId: string;
}

const Part4Modal: React.FC<Part4ModalProps> = ({
  showModal,
  setShowModal,
  formData,
  updateFormData,
  candidateProfile,
  hrAdmin,
  step1Storage,
  step2Storage,
  onNext,
  onBack,
  candidateId,
}) => {
  const [validationError, setValidationError] = useState<string>("");

  const handleBusinessDaysChange = (value: string) => {
    // Clear previous validation error
    setValidationError("");

    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '');

    // Validate minimum value
    if (numericValue && parseInt(numericValue) < 5) {
      setValidationError("Number of business days must be at least 5 (required by law)");
    }

    updateFormData({ businessDays: numericValue });
  };

  const isComplete = () => {
    const businessDays = formData.businessDays;
    return businessDays &&
      businessDays.trim() !== "" &&
      parseInt(businessDays) >= 5 &&
      !validationError;
  };

  return (
    <>
      <AssessmentPartWrapper
        title="Part 4: Response Period"
        stepNumber="Step 4 of 4"
        showModal={showModal}
        onClose={() => setShowModal(false)}
      >
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-900 rounded">
          <p className="text-sm font-medium mb-2">Legal Requirement:</p>
          <p className="text-sm">
            Employers must inform applicants of their right to respond with mitigating evidence within 5 business days (minimum required by law).
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Number of Business Days for Response <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.businessDays || ''}
              onChange={(e) => handleBusinessDaysChange(e.target.value)}
              placeholder="Enter number of business days (minimum 5)"
              min="5"
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />

            {validationError && (
              <p className="text-red-600 text-sm mt-1">{validationError}</p>
            )}

            <p className="text-gray-600 text-sm mt-2">
              This will be included in the notice: "The conditional job you were offered will remain available for{" "}
              <span className="font-semibold text-blue-600">
                {formData.businessDays || "[number]"}
              </span>{" "}
              business days so that you may respond to this letter before our decision to revoke the job offer becomes final."
            </p>
          </div>
        </form>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            onClick={() => setShowModal(false)}
          >
            Save for Later
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              onClick={onBack}
            >
              Back
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded font-semibold ${isComplete()
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              onClick={onNext}
              disabled={!isComplete()}
            >
              Next
            </button>
          </div>
        </div>
      </AssessmentPartWrapper>
    </>
  );
};

export default Part4Modal; 
