import React, { useState } from "react";
import { Sparkles } from 'lucide-react';
import SmartSuggestionField from "@/components/assessment/SmartSuggestionField";
import DynamicSmartSuggestionField from "@/components/assessment/DynamicSmartSuggestionField";
import { getStep2Part1Suggestions } from "@/utils/assessmentDataAggregator";

interface Part1ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  assessmentForm: any;
  handleAssessmentFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAssessmentArrayChange: (field: 'duties' | 'activities', idx: number, value: string) => void;
  onAddDuty: () => void;
  onRemoveDuty: (index: number) => void;
  onNext: () => void;
  candidateProfile?: any;
  hrAdmin?: any;
  candidateId: string;
}

const Part1Modal: React.FC<Part1ModalProps> = ({
  showModal,
  setShowModal,
  assessmentForm,
  handleAssessmentFormChange,
  handleAssessmentArrayChange,
  onAddDuty,
  onRemoveDuty,
  onNext,
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
      const newSuggestions = getStep2Part1Suggestions(candidateId, candidateProfile, hrAdmin);
      console.log('Part1 autofill suggestions:', newSuggestions);

      setSuggestions(newSuggestions);

      // Only fill empty fields to preserve user input
      const updatedAssessmentForm = { ...assessmentForm };

      // Fill position if empty
      if (!updatedAssessmentForm.position && newSuggestions.position) {
        updatedAssessmentForm.position = newSuggestions.position;
      }

      // Fill duties if empty or has only empty strings
      if ((!updatedAssessmentForm.duties || updatedAssessmentForm.duties.every((d: string) => !d.trim())) &&
        newSuggestions.duties && newSuggestions.duties.length > 0) {

        // First, ensure we have enough duties in the array by adding empty ones
        const currentLength = assessmentForm.duties?.length || 0;
        const newLength = newSuggestions.duties.length;

        if (newLength > currentLength) {
          // Add empty duties to match the new length
          for (let i = currentLength; i < newLength; i++) {
            onAddDuty();
          }
        }

        // Then fill all duties with the suggestions
        setTimeout(() => {
          newSuggestions.duties.forEach((duty: string, index: number) => {
            handleAssessmentArrayChange('duties', index, duty);
          });
        }, 50); // Small delay to ensure state updates
      }

      // Apply updates by creating synthetic events
      if (updatedAssessmentForm.position !== assessmentForm.position) {
        const syntheticEvent = {
          target: { name: 'position', value: updatedAssessmentForm.position }
        } as React.ChangeEvent<HTMLInputElement>;
        handleAssessmentFormChange(syntheticEvent);
      }
    } catch (error) {
      console.error('Error during Part1 autofill:', error);
    } finally {
      setIsAutofilling(false);
    }
  };

  const isComplete = () => {
    return assessmentForm.position &&
      assessmentForm.duties &&
      Array.isArray(assessmentForm.duties) &&
      assessmentForm.duties.filter((d: string) => d && d.trim() !== "").length > 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Part 1: Position & Job Duties</h2>
            <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Step 1 of 5</p>
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
              label="Position Applied For"
              value={assessmentForm.position || ''}
              onChange={(value) => {
                const syntheticEvent = {
                  target: { name: 'position', value }
                } as React.ChangeEvent<HTMLInputElement>;
                handleAssessmentFormChange(syntheticEvent);
              }}
              suggestion={suggestions.position}
              suggestionsEnabled={true}
              placeholder="Enter the position title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Specific duties and responsibilities of the job are:
            </label>
            <div className="space-y-3">
              {assessmentForm.duties && assessmentForm.duties.map((duty: string, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <div className="flex-1">
                    <DynamicSmartSuggestionField
                      value={duty}
                      onChange={(value: string) => handleAssessmentArrayChange('duties', idx, value)}
                      suggestion={suggestions.duties?.[idx]}
                      suggestionsEnabled={true}
                      placeholder={`Duty ${String.fromCharCode(97 + idx)}`}
                      isManual={false}
                      onManualChange={() => { }}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                  </div>
                  {assessmentForm.duties.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveDuty(idx)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Remove duty"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
              onClick={onAddDuty}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              + Add Duty
            </button>
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
  );
};

export default Part1Modal;
