import React, { useMemo, useState } from "react";
import AssessmentPartWrapper from "@/components/assessment/AssessmentPartWrapper";
import SmartSuggestionField from "@/components/assessment/SmartSuggestionField";
import ReferencePanel from "@/components/assessment/ReferencePanel";
import { useReferenceData } from "@/hooks/useReferenceData";
import { getReferenceData } from "@/utils/referenceDataHelpers";
import { getStep3Part2Suggestions } from "@/utils/assessmentDataAggregator";

interface Part2ModalProps {
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

const Part2Modal: React.FC<Part2ModalProps> = ({
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
      console.log('Part2Modal - Candidate profile:', candidateProfile);
      console.log('Part2Modal - HR admin:', hrAdmin);
      console.log('Part2Modal - Step1 storage:', step1Storage?.offerForm);
      console.log('Part2Modal - Step2 storage:', step2Storage?.assessmentForm);

      // Use real data from Step 2 for conduct timing
      const newSuggestions = await getStep3Part2Suggestions(candidateId, candidateProfile, hrAdmin);

      console.log('Part2Modal - Final suggestions:', newSuggestions);

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
    return formData.convictions &&
      formData.convictions.length > 0 &&
      formData.convictions.some((c: string) => c.trim() !== "") &&
      formData.conductTimeAgo &&
      formData.sentenceCompletedTimeAgo;
  };

  const handleConvictionChange = (index: number, value: string) => {
    const newConvictions = [...(formData.convictions || [])];
    newConvictions[index] = value;
    updateFormData({ convictions: newConvictions });
  };

  const addConviction = () => {
    const newConvictions = [...(formData.convictions || []), ""];
    updateFormData({ convictions: newConvictions });
  };

  const removeConviction = (index: number) => {
    const newConvictions = formData.convictions.filter((_: any, i: number) => i !== index);
    updateFormData({ convictions: newConvictions });
  };

  const handleShowReference = (referenceType: string) => {
    // Create a compatible data structure for the reference helper
    const compatibleData = {
      step1: step1Storage?.offerForm,
      step2: {
        conductDescription: step2Storage?.assessmentForm?.conduct,
        activitiesSince: step2Storage?.assessmentForm?.activities?.join('. '),
        rescissionReasoning: step2Storage?.assessmentForm?.rescindReason,
      },
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

  // Initialize convictions array if empty
  const convictions = formData.convictions || [""];

  return (
    <>
      <AssessmentPartWrapper
        title="Part 2: Conviction Details"
        stepNumber="Step 2 of 4"
        showModal={showModal}
        onAutofill={handleAutofill}
        onClose={() => setShowModal(false)}
      >
        <form className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Convictions that led to decision to revoke offer
                <span className="text-red-500 ml-1">*</span>
              </label>
              <button
                type="button"
                onClick={() => handleShowReference('conductDescription')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                title="View reference from Step 2"
              >
                <span>👁️</span>
                <span>View Reference</span>
              </button>
            </div>

            <div className="space-y-3">
              {convictions.map((conviction: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={conviction}
                      onChange={(e) => handleConvictionChange(index, e.target.value)}
                      className="w-full border rounded px-3 py-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder={`Conviction ${index + 1}`}
                    />
                  </div>
                  {convictions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeConviction(index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Remove conviction"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addConviction}
                className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
              >
                + Add Conviction
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <SmartSuggestionField
              label="How long ago did the conduct occur"
              value={formData.conductTimeAgo || ''}
              onChange={(value) => updateFormData({ conductTimeAgo: value })}
              suggestion={suggestions.conductTimeAgo}
              suggestionsEnabled={true}
              placeholder="e.g., 5 years ago, 2 months ago"
              showReference={true}
              referenceData={undefined}
              onShowReference={() => handleShowReference('conductDescription')}
              required
            />

            <SmartSuggestionField
              label="How long ago was the sentence completed"
              value={formData.sentenceCompletedTimeAgo || ''}
              onChange={(value) => updateFormData({ sentenceCompletedTimeAgo: value })}
              suggestionsEnabled={false}
              placeholder="e.g., 3 years ago, 1 year ago"
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

      <ReferencePanel
        isOpen={isReferencePanelOpen}
        onClose={closeReference}
        referenceData={currentReferenceData}
      />
    </>
  );
};

export default Part2Modal;
