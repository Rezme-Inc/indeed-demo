import React, { useState } from "react";
import { Sparkles } from 'lucide-react';
import SmartSuggestionField from "@/components/assessment/SmartSuggestionField";
import { getStep2Part2Suggestions } from "@/utils/assessmentDataAggregator";

interface Part2ModalProps {
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

const Part2Modal: React.FC<Part2ModalProps> = ({
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
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [suggestions, setSuggestions] = useState<any>({});

  if (!showModal) return null;

  const handleAutofill = async () => {
    if (!candidateProfile || !hrAdmin) {
      console.warn('Missing required data for autofill');
      return;
    }

    setIsAutofilling(true);
    try {
      const newSuggestions = getStep2Part2Suggestions(candidateId, candidateProfile, hrAdmin);
      console.log('Part2 autofill suggestions:', newSuggestions);

      setSuggestions(newSuggestions);

      // Only fill empty fields to preserve user input
      const updates: any = {};
      Object.keys(newSuggestions).forEach(key => {
        const suggestionValue = newSuggestions[key as keyof typeof newSuggestions];
        const currentValue = assessmentForm[key];
        // Only fill if field is empty and we have a suggestion
        if (suggestionValue && (!currentValue || currentValue.trim() === '')) {
          updates[key] = suggestionValue;
        }
      });

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
      console.error('Error during Part2 autofill:', error);
    } finally {
      setIsAutofilling(false);
    }
  };

  const isComplete = () => {
    return assessmentForm.reportDate &&
      assessmentForm.howLongAgo &&
      assessmentForm.conduct;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Part 2: Criminal History Details</h2>
            <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Step 2 of 5</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAutofill}
              disabled={isAutofilling}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <Sparkles className="h-4 w-4" />
              {isAutofilling ? 'Autofilling...' : 'AI Autofill'}
            </button>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
          <b>Notice:</b> All fields are required. Please complete all information before proceeding.
        </div>

        <form className="space-y-6">
          <div>
            <SmartSuggestionField
              label="Date of Criminal History Report"
              type="date"
              value={assessmentForm.reportDate || ''}
              onChange={(value) => {
                const syntheticEvent = {
                  target: { name: 'reportDate', value }
                } as React.ChangeEvent<HTMLInputElement>;
                handleAssessmentFormChange(syntheticEvent);
              }}
              suggestion={suggestions.reportDate}
              suggestionsEnabled={true}
              required
            />
          </div>

          <div>
            <SmartSuggestionField
              label="How long ago did the criminal activity occur:"
              value={assessmentForm.howLongAgo || ''}
              onChange={(value) => {
                const syntheticEvent = {
                  target: { name: 'howLongAgo', value }
                } as React.ChangeEvent<HTMLInputElement>;
                handleAssessmentFormChange(syntheticEvent);
              }}
              suggestion={suggestions.howLongAgo}
              suggestionsEnabled={true}
              placeholder="e.g., 5 years ago, 2 months ago"
              required
            />
          </div>

          <div>
            <SmartSuggestionField
              label="Description of the criminal conduct and why the conduct is of concern with respect to the position in question"
              type="textarea"
              value={assessmentForm.conduct || ''}
              onChange={(value) => {
                const syntheticEvent = {
                  target: { name: 'conduct', value }
                } as React.ChangeEvent<HTMLInputElement>;
                handleAssessmentFormChange(syntheticEvent);
              }}
              suggestion={suggestions.conduct}
              suggestionsEnabled={true}
              placeholder="Provide detailed description of the criminal conduct and explain why it's concerning for this specific position..."
              required
            />
          </div>
        </form>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            onClick={() => setShowModal(false)}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Save for Later
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              onClick={onBack}
              style={{ fontFamily: 'Poppins, sans-serif' }}
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
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Part2Modal;
