import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import SmartSuggestionField from "@/components/assessment/SmartSuggestionField";
import DynamicSmartSuggestionField from "@/components/assessment/DynamicSmartSuggestionField";
import { getStep5Suggestions } from "@/utils/assessmentDataAggregator";

interface Part2ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  candidateProfile?: any;
  hrAdmin?: any;
  candidateId: string;
}

const Part2Modal: React.FC<Part2ModalProps> = ({
  showModal,
  setShowModal,
  formData,
  setFormData,
  onNext,
  onBack,
  candidateProfile,
  hrAdmin,
  candidateId,
}) => {
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [suggestions, setSuggestions] = useState<any>({});

  const handleAutofill = async () => {
    if (!candidateProfile || !hrAdmin) {
      console.warn('Missing required data for autofill');
      return;
    }

    setIsAutofilling(true);
    try {
      const newSuggestions = await getStep5Suggestions(candidateId, candidateProfile, hrAdmin);
      console.log('Part2 autofill suggestions:', newSuggestions);

      setSuggestions(newSuggestions);

      // Only fill empty fields to preserve user input
      const updatedData = { ...formData };
      if (!updatedData.seriousReason) updatedData.seriousReason = newSuggestions.seriousReason;
      if (!updatedData.timeSinceConduct) updatedData.timeSinceConduct = newSuggestions.timeSinceConduct;
      if (!updatedData.timeSinceSentence) updatedData.timeSinceSentence = newSuggestions.timeSinceSentence;
      if (!updatedData.position) updatedData.position = newSuggestions.position;
      if (!updatedData.jobDuties || updatedData.jobDuties.length === 0) {
        updatedData.jobDuties = newSuggestions.jobDuties || [''];
      }

      setFormData(updatedData);
    } catch (error) {
      console.error('Error during Part2 autofill:', error);
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleConvictionChange = (index: number, value: string) => {
    const newConvictions = [...(formData.convictions || [])];
    newConvictions[index] = value;
    setFormData({ ...formData, convictions: newConvictions });
  };

  const addConviction = () => {
    const newConvictions = [...(formData.convictions || []), ""];
    setFormData({ ...formData, convictions: newConvictions });
  };

  const removeConviction = (index: number) => {
    const newConvictions = formData.convictions.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, convictions: newConvictions });
  };

  if (!showModal) return null;

  const isComplete = () => {
    const hasSeriousReason = formData.seriousReason && formData.seriousReason.trim() !== '';
    const hasTimeSinceConduct = formData.timeSinceConduct && formData.timeSinceConduct.trim() !== '';
    const hasTimeSinceSentence = formData.timeSinceSentence && formData.timeSinceSentence.trim() !== '';
    const hasPosition = formData.position && formData.position.trim() !== '';
    const hasJobDuties = formData.jobDuties && formData.jobDuties.length > 0 && formData.jobDuties.some((duty: string) => duty.trim() !== '');

    return hasSeriousReason && hasTimeSinceConduct && hasTimeSinceSentence && hasPosition && hasJobDuties;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Part 2: Individualized Assessment</h2>
            <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Step 2 of 4</p>
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
          <div className="space-y-6">
            <div>
              <SmartSuggestionField
                label="The nature and seriousness of the conduct that led to the conviction(s):"
                type="textarea"
                value={formData.seriousReason || ''}
                onChange={(value) => setFormData({ ...formData, seriousReason: value })}
                suggestion={suggestions.seriousReason}
                suggestionsEnabled={true}
                placeholder="Describe the nature and seriousness of the conduct"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <SmartSuggestionField
                  label="How long ago the conduct occurred:"
                  type="text"
                  value={formData.timeSinceConduct || ''}
                  onChange={(value) => setFormData({ ...formData, timeSinceConduct: value })}
                  suggestion={suggestions.timeSinceConduct}
                  suggestionsEnabled={true}
                  placeholder="e.g., 5 years ago"
                  required
                />
              </div>
              <div>
                <SmartSuggestionField
                  label="How long ago the sentence was completed:"
                  type="text"
                  value={formData.timeSinceSentence || ''}
                  onChange={(value) => setFormData({ ...formData, timeSinceSentence: value })}
                  suggestion={suggestions.timeSinceSentence}
                  suggestionsEnabled={true}
                  placeholder="e.g., 3 years ago"
                  required
                />
              </div>
            </div>

            <div>
              <SmartSuggestionField
                label="Position the candidate was applying for:"
                type="text"
                value={formData.position || ''}
                onChange={(value) => setFormData({ ...formData, position: value })}
                suggestion={suggestions.position}
                suggestionsEnabled={true}
                placeholder="INSERT POSITION"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Job duties and responsibilities for this position:
              </label>
              <div className="space-y-3">
                {(formData.jobDuties || ['']).map((duty: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <DynamicSmartSuggestionField
                        value={duty}
                        onChange={(value: string) => {
                          const newJobDuties = [...(formData.jobDuties || [''])];
                          newJobDuties[index] = value;
                          setFormData({ ...formData, jobDuties: newJobDuties });
                        }}
                        suggestion={suggestions.jobDuties?.[index]}
                        suggestionsEnabled={true}
                        placeholder={`Job Duty ${index + 1}`}
                        isManual={false}
                        onManualChange={() => { }}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      />
                    </div>
                    {(formData.jobDuties || ['']).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newJobDuties = (formData.jobDuties || ['']).filter((_: any, i: number) => i !== index);
                          setFormData({ ...formData, jobDuties: newJobDuties });
                        }}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Remove job duty"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const newJobDuties = [...(formData.jobDuties || ['']), ''];
                    setFormData({ ...formData, jobDuties: newJobDuties });
                  }}
                  className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  + Add Job Duty
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            onClick={onBack}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Back
          </button>
          <div className="flex gap-3">
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
    </div>
  );
};

export default Part2Modal; 
