import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import SmartSuggestionField from "@/components/assessment/SmartSuggestionField";
import { getStep5Suggestions } from "@/utils/assessmentDataAggregator";

interface Part4ModalProps {
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

const Part4Modal: React.FC<Part4ModalProps> = ({
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

  // Set current date when modal opens
  useEffect(() => {
    if (showModal && !formData.currentDate) {
      const today = new Date();
      const currentDate = today.toISOString().split('T')[0];
      setFormData({ ...formData, currentDate });
    }
  }, [showModal]);

  const handleAutofill = async () => {
    if (!candidateProfile || !hrAdmin) {
      console.warn('Missing required data for autofill');
      return;
    }

    setIsAutofilling(true);
    try {
      const newSuggestions = getStep5Suggestions(candidateId, candidateProfile, hrAdmin);
      console.log('Part4 autofill suggestions:', newSuggestions);

      setSuggestions(newSuggestions);

      // Only fill empty fields to preserve user input
      const updatedData = { ...formData };
      if (!updatedData.applicant) updatedData.applicant = newSuggestions.applicant;
      if (!updatedData.dateOfNotice) updatedData.dateOfNotice = newSuggestions.dateOfNotice;
      if (!updatedData.contactName) updatedData.contactName = newSuggestions.contactName;
      if (!updatedData.companyName) updatedData.companyName = newSuggestions.companyName;
      if (!updatedData.address) updatedData.address = newSuggestions.address;
      if (!updatedData.phone) updatedData.phone = newSuggestions.phone;

      setFormData(updatedData);
    } catch (error) {
      console.error('Error during Part4 autofill:', error);
    } finally {
      setIsAutofilling(false);
    }
  };

  if (!showModal) return null;

  const isComplete = () => {
    const basicFieldsComplete = formData.applicant && formData.currentDate && formData.dateOfNotice && formData.contactName && formData.companyName;

    // If user selected the reconsideration procedure option, they must fill in the procedure field
    if (formData.reconsideration === 'procedure') {
      return basicFieldsComplete && formData.reconsiderationProcedure && formData.reconsiderationProcedure.trim() !== '';
    }

    return basicFieldsComplete;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Part 4: Final Information & Contact</h2>
            <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Step 4 of 4</p>
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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Additional Information:
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <SmartSuggestionField
                    label="Candidate Name"
                    type="text"
                    value={formData.applicant || ''}
                    onChange={(value) => setFormData({ ...formData, applicant: value })}
                    suggestion={suggestions.applicant}
                    suggestionsEnabled={true}
                    required
                  />
                </div>
                <div>
                  <SmartSuggestionField
                    label="Date of this form (current date)"
                    type="date"
                    value={formData.currentDate || ''}
                    onChange={(value) => setFormData({ ...formData, currentDate: value })}
                    suggestion={suggestions.date}
                    suggestionsEnabled={true}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <SmartSuggestionField
                    label="Date of notice (when initial decision to revoke job offer was made)"
                    type="date"
                    value={formData.dateOfNotice || ''}
                    onChange={(value) => setFormData({ ...formData, dateOfNotice: value })}
                    suggestion={suggestions.dateOfNotice}
                    suggestionsEnabled={true}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Request for Reconsideration:
              </h3>
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <input
                    type="checkbox"
                    checked={formData.reconsideration === 'none'}
                    onChange={(e) => setFormData({ ...formData, reconsideration: e.target.checked ? 'none' : '' })}
                    className="h-4 w-4 focus:ring-2 focus:ring-red-500"
                    style={{ accentColor: '#E54747' }}
                  />
                  We do not offer any way to challenge this decision or request reconsideration.
                </label>
                <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <input
                    type="checkbox"
                    checked={formData.reconsideration === 'procedure'}
                    onChange={(e) => setFormData({ ...formData, reconsideration: e.target.checked ? 'procedure' : '' })}
                    className="h-4 w-4 focus:ring-2 focus:ring-red-500"
                    style={{ accentColor: '#E54747' }}
                  />
                  If you would like to challenge this decision or request reconsideration, you may:
                </label>
                {formData.reconsideration === 'procedure' && (
                  <textarea
                    value={formData.reconsiderationProcedure || ''}
                    onChange={(e) => setFormData({ ...formData, reconsiderationProcedure: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 min-h-[40px] focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Describe internal procedure"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  />
                )}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Contact Information:
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <SmartSuggestionField
                    label="Employer contact person name"
                    type="text"
                    value={formData.contactName || ''}
                    onChange={(value) => setFormData({ ...formData, contactName: value })}
                    suggestion={suggestions.contactName}
                    suggestionsEnabled={true}
                    required
                  />
                </div>
                <div>
                  <SmartSuggestionField
                    label="Employer company name"
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(value) => setFormData({ ...formData, companyName: value })}
                    suggestion={suggestions.companyName}
                    suggestionsEnabled={true}
                    required
                  />
                </div>
                <div>
                  <SmartSuggestionField
                    label="Employer address"
                    type="text"
                    value={formData.address || ''}
                    onChange={(value) => setFormData({ ...formData, address: value })}
                    suggestion={suggestions.address}
                    suggestionsEnabled={true}
                    required
                  />
                </div>
                <div>
                  <SmartSuggestionField
                    label="Employer contact phone number"
                    type="text"
                    value={formData.phone || ''}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    suggestion={suggestions.phone}
                    suggestionsEnabled={true}
                    required
                  />
                </div>
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
              Preview & Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Part4Modal; 
