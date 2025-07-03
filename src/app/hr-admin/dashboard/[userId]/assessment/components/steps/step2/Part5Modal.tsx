import React, { useState } from "react";
import AssessmentPartWrapper from "@/components/assessment/AssessmentPartWrapper";
import SmartSuggestionField from "@/components/assessment/SmartSuggestionField";
import { getStep2Part5Suggestions } from "@/utils/assessmentDataAggregator";

interface Part5ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  assessmentForm: any;
  handleAssessmentFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNext: () => void;
  onBack: () => void;
  candidateProfile?: any;
  hrAdmin?: any;
  candidateId: string;
}

const Part5Modal: React.FC<Part5ModalProps> = ({
  showModal,
  setShowModal,
  assessmentForm,
  handleAssessmentFormChange,
  onNext,
  onBack,
  candidateProfile,
  hrAdmin,
  candidateId,
}) => {
  const [suggestions, setSuggestions] = useState<any>({});

  if (!showModal) return null;

  const handleAutofill = async () => {
    try {
      console.log('Part5Modal - Autofill triggered');
      console.log('Part5Modal - Candidate profile:', candidateProfile);
      console.log('Part5Modal - HR admin:', hrAdmin);

      // Use the new async data aggregation utility
      const newSuggestions = await getStep2Part5Suggestions(candidateId, candidateProfile, hrAdmin);

      console.log('Part5Modal - Generated suggestions:', newSuggestions);

      setSuggestions(newSuggestions);

      // Auto-fill only empty fields with suggestions
      const updates: any = {};
      Object.keys(newSuggestions).forEach(key => {
        const suggestionValue = newSuggestions[key as keyof typeof newSuggestions];
        const currentValue = assessmentForm[key];
        // Only fill if field is empty and we have a suggestion
        if (suggestionValue && (!currentValue || currentValue.trim() === '')) {
          updates[key] = suggestionValue;
        }
      });

      console.log('Part5Modal - Updates to apply:', updates);

      if (Object.keys(updates).length > 0) {
        // Apply updates by creating synthetic events
        Object.keys(updates).forEach(key => {
          const syntheticEvent = {
            target: {
              name: key,
              value: updates[key]
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleAssessmentFormChange(syntheticEvent);
        });
      }
    } catch (error) {
      console.error('Error during autofill:', error);
    }
  };

  const isComplete = () => {
    return assessmentForm.employer &&
      assessmentForm.applicant &&
      assessmentForm.offerDate &&
      assessmentForm.assessmentDate &&
      assessmentForm.performedBy;
  };

  return (
    <AssessmentPartWrapper
      title="Part 5: Assessment Details"
      stepNumber="Step 5 of 5"
      showModal={showModal}
      onAutofill={handleAutofill}
      onClose={() => setShowModal(false)}
    >

      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <SmartSuggestionField
            label="Employer Name"
            value={assessmentForm.employer || ''}
            onChange={(value) => {
              const syntheticEvent = {
                target: { name: 'employer', value }
              } as React.ChangeEvent<HTMLInputElement>;
              handleAssessmentFormChange(syntheticEvent);
            }}
            suggestion={suggestions.employer}
            suggestionsEnabled={true}
            placeholder="Enter employer/company name"
            required
          />

          <SmartSuggestionField
            label="Applicant Name"
            value={assessmentForm.applicant || ''}
            onChange={(value) => {
              const syntheticEvent = {
                target: { name: 'applicant', value }
              } as React.ChangeEvent<HTMLInputElement>;
              handleAssessmentFormChange(syntheticEvent);
            }}
            suggestion={suggestions.applicant}
            suggestionsEnabled={true}
            placeholder="Enter applicant's full name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <SmartSuggestionField
            label="Date of Conditional Offer"
            value={assessmentForm.offerDate || ''}
            onChange={(value) => {
              const syntheticEvent = {
                target: { name: 'offerDate', value }
              } as React.ChangeEvent<HTMLInputElement>;
              handleAssessmentFormChange(syntheticEvent);
            }}
            suggestion={suggestions.offerDate}
            suggestionsEnabled={true}
            type="date"
            required
          />

          <SmartSuggestionField
            label="Date of Assessment"
            value={assessmentForm.assessmentDate || ''}
            onChange={(value) => {
              const syntheticEvent = {
                target: { name: 'assessmentDate', value }
              } as React.ChangeEvent<HTMLInputElement>;
              handleAssessmentFormChange(syntheticEvent);
            }}
            suggestion={suggestions.assessmentDate}
            suggestionsEnabled={true}
            type="date"
            required
          />
        </div>

        <SmartSuggestionField
          label="Assessment Performed by"
          value={assessmentForm.performedBy || ''}
          onChange={(value) => {
            const syntheticEvent = {
              target: { name: 'performedBy', value }
            } as React.ChangeEvent<HTMLInputElement>;
            handleAssessmentFormChange(syntheticEvent);
          }}
          suggestion={suggestions.performedBy}
          suggestionsEnabled={true}
          placeholder="Enter name of person performing assessment"
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
  );
};

export default Part5Modal; 
