import React, { useMemo, useState } from "react";
import AssessmentPartWrapper from "@/components/assessment/AssessmentPartWrapper";
import SmartSuggestionField from "@/components/assessment/SmartSuggestionField";
import ReferencePanel from "@/components/assessment/ReferencePanel";
import { useReferenceData } from "@/hooks/useReferenceData";
import { getReferenceData } from "@/utils/referenceDataHelpers";
import { getStep3Part3Suggestions } from "@/utils/assessmentDataAggregator";

interface Part3ModalProps {
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

const Part3Modal: React.FC<Part3ModalProps> = ({
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
  const { isReferencePanelOpen, currentReferenceData, showReference, closeReference } = useReferenceData();
  const [suggestions, setSuggestions] = useState<any>({});

  const handleAutofill = async () => {
    try {
      console.log('Part3Modal - Candidate profile:', candidateProfile);
      console.log('Part3Modal - HR admin:', hrAdmin);
      console.log('Part3Modal - Step1 storage:', step1Storage?.offerForm);
      console.log('Part3Modal - Step2 storage:', step2Storage?.assessmentForm);

      // Use the new data aggregation utility
      const newSuggestions = getStep3Part3Suggestions(candidateId, candidateProfile, hrAdmin);

      console.log('Part3Modal - Final suggestions:', newSuggestions);

      setSuggestions(newSuggestions);

      // Auto-fill only empty fields with suggestions
      const updates: any = {};
      Object.keys(newSuggestions).forEach(key => {
        const suggestionValue = newSuggestions[key as keyof typeof newSuggestions];
        const currentValue = formData[key];
        // Only fill if field is empty and we have a suggestion
        if (suggestionValue && (!currentValue || currentValue.trim() === '')) {
          updates[key] = suggestionValue;
        }
      });

      if (Object.keys(updates).length > 0) {
        updateFormData(updates);
      }
    } catch (error) {
      console.error('Error during autofill:', error);
    }
  };

  const isComplete = () => {
    return formData.jobDuties &&
      formData.seriousnessReason &&
      formData.revocationReason;
  };

  const handleShowReference = (referenceType: string) => {
    // Create a compatible data structure for the reference helper
    const compatibleData = {
      step1: step1Storage?.offerForm,
      step2: step2Storage?.assessmentForm,
      databaseFields: {
        applicantName: candidateProfile ? `${candidateProfile.first_name} ${candidateProfile.last_name}` : '',
        employerName: hrAdmin?.company || '',
        positionTitle: step1Storage?.offerForm?.position || '',
      }
    };

    const referenceData = getReferenceData(compatibleData, referenceType);
    if (referenceData) {
      showReference(referenceData);
    }
  };

  return (
    <>
      <AssessmentPartWrapper
        title="Part 3: Assessment & Reasoning"
        stepNumber="Step 3 of 3"
        showModal={showModal}
        onAutofill={handleAutofill}
        onClose={() => setShowModal(false)}
      >
        <form className="space-y-6">
          <SmartSuggestionField
            label="Job duties"
            value={formData.jobDuties || ''}
            onChange={(value) => updateFormData({ jobDuties: value })}
            suggestion={suggestions.jobDuties}
            suggestionsEnabled={true}
            type="textarea"
            placeholder="Describe the specific duties and responsibilities of the position"
            showReference={true}
            referenceData={undefined}
            onShowReference={() => handleShowReference('jobDuties')}
            required
          />

          <SmartSuggestionField
            label="Describe why the conduct was considered serious"
            value={formData.seriousnessReason || ''}
            onChange={(value) => updateFormData({ seriousnessReason: value })}
            suggestion={suggestions.seriousnessReason}
            suggestionsEnabled={true}
            type="textarea"
            placeholder="Explain why this criminal conduct is considered serious for this position..."
            showReference={true}
            referenceData={undefined}
            onShowReference={() => handleShowReference('conductDescription')}
            required
          />

          <SmartSuggestionField
            label="Reason for revoking job offer based on relevance of conviction history"
            value={formData.revocationReason || ''}
            onChange={(value) => updateFormData({ revocationReason: value })}
            suggestion={suggestions.revocationReason}
            suggestionsEnabled={true}
            type="textarea"
            placeholder="Describe the specific link between the criminal history and the risks inherent in this position..."
            showReference={true}
            referenceData={undefined}
            onShowReference={() => handleShowReference('rescissionReasoning')}
            required
          />
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
              Review & Send
            </button>
          </div>
        </div>
      </AssessmentPartWrapper>

      <ReferencePanel
        isOpen={isReferencePanelOpen}
        onClose={closeReference}
        referenceData={currentReferenceData}
      />
    </>
  );
};

export default Part3Modal;
