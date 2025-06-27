import React, { useMemo, useState } from "react";
import AssessmentPartWrapper from "@/components/assessment/AssessmentPartWrapper";
import SmartSuggestionField from "@/components/assessment/SmartSuggestionField";
import ReferencePanel from "@/components/assessment/ReferencePanel";
import { useReferenceData } from "@/hooks/useReferenceData";
import { getReferenceData } from "@/utils/referenceDataHelpers";
import { getStep3Part1Suggestions } from "@/utils/assessmentDataAggregator";

interface Part1ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  formData: any;
  updateFormData: (updates: any) => void;
  candidateProfile: any;
  hrAdmin: any;
  step1Storage: any;
  step2Storage: any;
  onNext: () => void;
  candidateId: string;
}

const Part1Modal: React.FC<Part1ModalProps> = ({
  showModal,
  setShowModal,
  formData,
  updateFormData,
  candidateProfile,
  hrAdmin,
  step1Storage,
  step2Storage,
  onNext,
  candidateId,
}) => {
  const { isReferencePanelOpen, currentReferenceData, showReference, closeReference } = useReferenceData();
  const [suggestions, setSuggestions] = useState<any>({});

  const handleAutofill = async () => {
    try {
      console.log('Part1Modal - Candidate profile:', candidateProfile);
      console.log('Part1Modal - HR admin:', hrAdmin);
      console.log('Part1Modal - Step1 storage:', step1Storage?.offerForm);
      console.log('Part1Modal - Step2 storage:', step2Storage?.assessmentForm);

      // Use the new data aggregation utility
      const newSuggestions = getStep3Part1Suggestions(candidateId, candidateProfile, hrAdmin);

      console.log('Part1Modal - Final suggestions:', newSuggestions);

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

      console.log('Part1Modal - Updates to apply:', updates);

      if (Object.keys(updates).length > 0) {
        updateFormData(updates);
      }
    } catch (error) {
      console.error('Error during autofill:', error);
    }
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

  const isComplete = () => {
    return formData.applicantName &&
      formData.position &&
      formData.contactName &&
      formData.companyName &&
      formData.address &&
      formData.phone &&
      formData.date;
  };

  return (
    <>
      <AssessmentPartWrapper
        title="Part 1: Basic Information"
        stepNumber="Step 1 of 3"
        showModal={showModal}
        onAutofill={handleAutofill}
        onClose={() => setShowModal(false)}
      >
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <SmartSuggestionField
              label="Applicant Name"
              value={formData.applicantName || ''}
              onChange={(value) => updateFormData({ applicantName: value })}
              suggestion={suggestions.applicantName}
              suggestionsEnabled={true}
              showReference={true}
              referenceData={undefined}
              onShowReference={() => handleShowReference('applicantName')}
              required
            />

            <SmartSuggestionField
              label="Position"
              value={formData.position || ''}
              onChange={(value) => updateFormData({ position: value })}
              suggestion={suggestions.position}
              suggestionsEnabled={true}
              showReference={true}
              referenceData={undefined}
              onShowReference={() => handleShowReference('position')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <SmartSuggestionField
              label="Contact Name"
              value={formData.contactName || ''}
              onChange={(value) => updateFormData({ contactName: value })}
              suggestion={suggestions.contactName}
              suggestionsEnabled={true}
              required
            />

            <SmartSuggestionField
              label="Company Name"
              value={formData.companyName || ''}
              onChange={(value) => updateFormData({ companyName: value })}
              suggestion={suggestions.companyName}
              suggestionsEnabled={true}
              showReference={true}
              referenceData={undefined}
              onShowReference={() => handleShowReference('employerName')}
              required
            />
          </div>

          <SmartSuggestionField
            label="Address"
            value={formData.address || ''}
            onChange={(value) => updateFormData({ address: value })}
            suggestion={suggestions.address}
            suggestionsEnabled={true}
            type="textarea"
            required
          />

          <div className="grid grid-cols-2 gap-6">
            <SmartSuggestionField
              label="Phone"
              value={formData.phone || ''}
              onChange={(value) => updateFormData({ phone: value })}
              suggestion={suggestions.phone}
              suggestionsEnabled={true}
              required
            />

            <SmartSuggestionField
              label="Date"
              value={formData.date || ''}
              onChange={(value) => updateFormData({ date: value })}
              suggestion={suggestions.date}
              suggestionsEnabled={true}
              type="date"
              required
            />
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
      </AssessmentPartWrapper>

      <ReferencePanel
        isOpen={isReferencePanelOpen}
        onClose={closeReference}
        referenceData={currentReferenceData}
      />
    </>
  );
};

export default Part1Modal; 
