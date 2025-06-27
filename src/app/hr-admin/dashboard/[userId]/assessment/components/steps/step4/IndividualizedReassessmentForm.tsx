import React from "react";
import AIAutofillButton from "@/components/assessment/AIAutofillButton";
import SmartSuggestionField from "@/components/assessment/SmartSuggestionField";
import ReferencePanel from "@/components/assessment/ReferencePanel";
import { useReferenceData } from "@/hooks/useReferenceData";
import { getStep4Suggestions, getStep4ReferenceData } from "@/utils/assessmentDataAggregator";

interface IndividualizedReassessmentFormProps {
  initialAssessmentResults: any;
  reassessmentForm: any;
  handleReassessmentFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  reassessmentPreview: boolean;
  setReassessmentPreview: (v: boolean) => void;
  handleSendReassessment: () => void;
  reassessmentDecision: "rescind" | "extend";
  setReassessmentDecision: (d: "rescind" | "extend") => void;
  extendReason: string;
  setExtendReason: (v: string) => void;
  candidateId: string;
  candidateProfile?: any;
  hrAdmin?: any;
  restorativeData?: any;
}

const IndividualizedReassessmentForm: React.FC<IndividualizedReassessmentFormProps> = ({
  initialAssessmentResults,
  reassessmentForm,
  handleReassessmentFormChange,
  reassessmentPreview,
  setReassessmentPreview,
  handleSendReassessment,
  reassessmentDecision,
  setReassessmentDecision,
  extendReason,
  setExtendReason,
  candidateId,
  candidateProfile,
  hrAdmin,
  restorativeData,
}) => {
  const { isReferencePanelOpen, currentReferenceData, showReference, closeReference } = useReferenceData();

  // Track manual input state for each field
  const [manualFields, setManualFields] = React.useState<{ [key: string]: boolean }>({});

  // Debug manual fields state changes
  React.useEffect(() => {
    console.log('[Step4] manualFields state updated:', manualFields);
  }, [manualFields]);

  const handleAutofill = async () => {
    const suggestions = getStep4Suggestions(candidateId, candidateProfile, hrAdmin);
    console.log('[Step4] Autofill triggered with suggestions:', suggestions);

    // Only fill empty fields and mark them as non-manual
    const updatedForm = { ...reassessmentForm };
    const updatedManualFields = { ...manualFields };

    Object.entries(suggestions).forEach(([key, value]) => {
      if (!updatedForm[key] && value) {
        console.log(`[Step4] Autofilling field ${key}: "${value}"`);
        updatedForm[key] = value;
        updatedManualFields[key] = false; // Mark as autofilled (not manual)
      }
    });

    console.log('[Step4] Updated manual fields state:', updatedManualFields);
    setManualFields(updatedManualFields);

    // Update form with non-empty suggestions
    if (JSON.stringify(updatedForm) !== JSON.stringify(reassessmentForm)) {
      // Trigger change events for each field that was updated
      Object.entries(suggestions).forEach(([key, value]) => {
        if (!reassessmentForm[key] && value) {
          const event = {
            target: { name: key, value: value }
          } as React.ChangeEvent<HTMLInputElement>;
          handleReassessmentFormChange(event);
        }
      });
    }
  };

  const handleShowReference = (referenceType: string) => {
    const referenceData = getStep4ReferenceData(restorativeData);
    const data = referenceData[referenceType as keyof typeof referenceData];
    if (data) {
      showReference(data);
    }
  };

  // Create wrapper functions for SmartSuggestionField compatibility
  const createFieldHandler = (fieldName: string) => (value: string) => {
    const event = {
      target: { name: fieldName, value: value }
    } as React.ChangeEvent<HTMLInputElement>;
    handleReassessmentFormChange(event);
  };

  // Handle manual input state changes
  const handleManualChange = (fieldName: string) => (isManual: boolean) => {
    console.log(`[Step4] Manual change for ${fieldName}: ${isManual}`);
    setManualFields(prev => {
      const newState = {
        ...prev,
        [fieldName]: isManual
      };
      console.log(`[Step4] New manual fields state:`, newState);
      return newState;
    });
  };

  return (
    <div className="flex-1 bg-white rounded-lg shadow p-8 border border-gray-200 max-h-[600px] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Individualized Reassessment Form</h2>
      {initialAssessmentResults && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
          <h3 className="font-semibold mb-2 text-gray-700">
            Initial Criminal History Individual Assessment (Reference)
          </h3>
          <div className="text-sm text-gray-700">
            <div>
              <b>Employer Name:</b> {initialAssessmentResults.employer}
            </div>
            <div>
              <b>Applicant Name:</b> {initialAssessmentResults.applicant}
            </div>
            <div>
              <b>Position Applied For:</b> {initialAssessmentResults.position}
            </div>
            <div>
              <b>Date of Conditional Offer:</b> {initialAssessmentResults.offerDate}
            </div>
            <div>
              <b>Date of Assessment:</b> {initialAssessmentResults.assessmentDate}
            </div>
            <div>
              <b>Date of Criminal History Report:</b> {initialAssessmentResults.reportDate}
            </div>
            <div>
              <b>Assessment Performed by:</b> {initialAssessmentResults.performedBy}
            </div>
            <div>
              <b>Duties:</b>{" "}
              {initialAssessmentResults.duties &&
                Array.isArray(initialAssessmentResults.duties)
                ? initialAssessmentResults.duties.filter(Boolean).join(", ")
                : ""}
            </div>
            <div>
              <b>Conduct of Concern:</b> {initialAssessmentResults.conduct}
            </div>
            <div>
              <b>How long ago:</b> {initialAssessmentResults.howLongAgo}
            </div>
            <div>
              <b>Activities since criminal activity:</b>{" "}
              {initialAssessmentResults.activities &&
                Array.isArray(initialAssessmentResults.activities)
                ? initialAssessmentResults.activities.filter(Boolean).join(", ")
                : ""}
            </div>
            <div>
              <b>Reason for Rescinding Offer:</b> {initialAssessmentResults.rescindReason}
            </div>
          </div>
        </div>
      )}
      {!reassessmentPreview ? (
        <form className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <AIAutofillButton onAutofill={handleAutofill} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <SmartSuggestionField
                label="Employer Name"
                value={reassessmentForm.employer}
                onChange={createFieldHandler('employer')}
                suggestion={getStep4Suggestions(candidateId, candidateProfile, hrAdmin).employer}
                suggestionsEnabled={true}
                isManual={(() => {
                  const isManual = manualFields.employer || false;
                  console.log(`[Step4] Passing isManual=${isManual} to Employer Name field`);
                  return isManual;
                })()}
                onManualChange={handleManualChange('employer')}
              />
            </div>
            <div>
              <SmartSuggestionField
                label="Applicant Name"
                value={reassessmentForm.applicant}
                onChange={createFieldHandler('applicant')}
                suggestion={getStep4Suggestions(candidateId, candidateProfile, hrAdmin).applicant}
                suggestionsEnabled={true}
                isManual={manualFields.applicant || false}
                onManualChange={handleManualChange('applicant')}
              />
            </div>
            <div>
              <SmartSuggestionField
                label="Position Applied For"
                value={reassessmentForm.position}
                onChange={createFieldHandler('position')}
                suggestion={getStep4Suggestions(candidateId, candidateProfile, hrAdmin).position}
                suggestionsEnabled={true}
                isManual={manualFields.position || false}
                onManualChange={handleManualChange('position')}
              />
            </div>
            <div>
              <SmartSuggestionField
                label="Date of Conditional Offer"
                type="date"
                value={reassessmentForm.offerDate}
                onChange={createFieldHandler('offerDate')}
                suggestion={getStep4Suggestions(candidateId, candidateProfile, hrAdmin).offerDate}
                suggestionsEnabled={true}
                isManual={manualFields.offerDate || false}
                onManualChange={handleManualChange('offerDate')}
              />
            </div>
            <div>
              <SmartSuggestionField
                label="Date of Reassessment"
                type="date"
                value={reassessmentForm.reassessmentDate}
                onChange={createFieldHandler('reassessmentDate')}
                suggestion={getStep4Suggestions(candidateId, candidateProfile, hrAdmin).reassessmentDate}
                suggestionsEnabled={true}
                isManual={manualFields.reassessmentDate || false}
                onManualChange={handleManualChange('reassessmentDate')}
              />
            </div>
            <div>
              <SmartSuggestionField
                label="Date of Criminal History Report"
                type="date"
                value={reassessmentForm.reportDate}
                onChange={createFieldHandler('reportDate')}
                suggestion={getStep4Suggestions(candidateId, candidateProfile, hrAdmin).reportDate}
                suggestionsEnabled={true}
                isManual={manualFields.reportDate || false}
                onManualChange={handleManualChange('reportDate')}
              />
            </div>
            <div>
              <SmartSuggestionField
                label="Assessment Performed by"
                value={reassessmentForm.performedBy}
                onChange={createFieldHandler('performedBy')}
                suggestion={getStep4Suggestions(candidateId, candidateProfile, hrAdmin).performedBy}
                suggestionsEnabled={true}
                isManual={manualFields.performedBy || false}
                onManualChange={handleManualChange('performedBy')}
              />
            </div>
          </div>
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Assessment Questions</h3>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">
                1. Was there an error in the Criminal History Report?
              </label>
              <div className="flex items-center gap-6 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="errorYesNo"
                    value="Yes"
                    checked={reassessmentForm.errorYesNo === "Yes"}
                    onChange={handleReassessmentFormChange}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="errorYesNo"
                    value="No"
                    checked={reassessmentForm.errorYesNo === "No"}
                    onChange={handleReassessmentFormChange}
                  />
                  No
                </label>
              </div>
              {reassessmentForm.errorYesNo === "Yes" && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    If yes, describe the error:
                  </label>
                  <textarea
                    name="error"
                    value={reassessmentForm.error}
                    onChange={handleReassessmentFormChange}
                    className="w-full border rounded px-3 py-2 min-h-[80px]"
                    placeholder="Describe the error in detail"
                  />
                </div>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">
                2. Evidence of rehabilitation and good conduct (this evidence may include, but is not limited to, documents or other information demonstrating that the Applicant attended school, a religious institution, job training, or counseling, or is involved with the community. This evidence can include letters from people who know the Applicant, such as teachers, counselors, supervisors, clergy, and parole or probation officers):
              </label>

              {/* Reference buttons for evidence sources */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-3">Reference sources from candidate's restorative record:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'education', label: 'Education & Training' },
                    { key: 'employment', label: 'Employment History' },
                    { key: 'programs', label: 'Rehabilitation Programs' },
                    { key: 'community', label: 'Community Engagement' },
                    { key: 'achievements', label: 'Achievements' },
                    { key: 'skills', label: 'Skills & Abilities' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleShowReference(key)}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      title={`View ${label.toLowerCase()} from candidate's restorative record`}
                    >
                      <span>👁️</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-2 italic">
                  Click any reference above to view the candidate's record, then copy relevant information to the evidence fields below.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">a.</label>
                  <textarea
                    name="evidenceA"
                    value={reassessmentForm.evidenceA}
                    onChange={handleReassessmentFormChange}
                    className="w-full border rounded px-3 py-2 min-h-[60px]"
                    placeholder="Evidence item A - Consider education, training, or certifications"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">b.</label>
                  <textarea
                    name="evidenceB"
                    value={reassessmentForm.evidenceB}
                    onChange={handleReassessmentFormChange}
                    className="w-full border rounded px-3 py-2 min-h-[60px]"
                    placeholder="Evidence item B - Consider employment history or work experience"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">c.</label>
                  <textarea
                    name="evidenceC"
                    value={reassessmentForm.evidenceC}
                    onChange={handleReassessmentFormChange}
                    className="w-full border rounded px-3 py-2 min-h-[60px]"
                    placeholder="Evidence item C - Consider rehabilitation programs or community service"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">d.</label>
                  <textarea
                    name="evidenceD"
                    value={reassessmentForm.evidenceD}
                    onChange={handleReassessmentFormChange}
                    className="w-full border rounded px-3 py-2 min-h-[60px]"
                    placeholder="Evidence item D - Consider achievements or skills development"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Decision</label>
            <div className="flex items-center gap-6 mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="reassessmentDecision"
                  value="rescind"
                  checked={reassessmentDecision === "rescind"}
                  onChange={() => setReassessmentDecision("rescind")}
                />
                Rescind Offer
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="reassessmentDecision"
                  value="extend"
                  checked={reassessmentDecision === "extend"}
                  onChange={() => setReassessmentDecision("extend")}
                />
                Extend Offer
              </label>
            </div>
            {reassessmentDecision === "rescind" && (
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Based on the factors above, we are rescinding our offer of employment because
                </label>
                <textarea
                  name="rescindReason"
                  value={reassessmentForm.rescindReason}
                  onChange={handleReassessmentFormChange}
                  className="w-full border rounded px-3 py-2 min-h-[60px]"
                  placeholder="Describe the link between the specific aspects of the applicant's criminal history with risks inherent in the duties of the employment position"
                />
              </div>
            )}
            {reassessmentDecision === "extend" && (
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Based on the factors above, we are extending our offer of employment.
                </label>
                <textarea
                  name="extendReason"
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-h-[60px]"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end mt-8 gap-4">
            <button
              type="button"
              className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
              onClick={() => setReassessmentPreview(true)}
              style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
            >
              Preview
            </button>
          </div>
        </form>
      ) : (
        <div
          className="prose max-w-none text-black text-base bg-gray-50 p-8 rounded-xl border border-gray-200"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <h3 className="font-bold mb-2 text-black">INFORMATION</h3>
          <div>
            <b>Employer Name:</b> {reassessmentForm.employer}
          </div>
          <div>
            <b>Applicant Name:</b> {reassessmentForm.applicant}
          </div>
          <div>
            <b>Position Applied For:</b> {reassessmentForm.position}
          </div>
          <div>
            <b>Date of Conditional Offer:</b> {reassessmentForm.offerDate}
          </div>
          <div>
            <b>Date of Reassessment:</b> {reassessmentForm.reassessmentDate}
          </div>
          <div>
            <b>Date of Criminal History Report:</b> {reassessmentForm.reportDate}
          </div>
          <div>
            <b>Assessment Performed by:</b> {reassessmentForm.performedBy}
          </div>
          <h3 className="font-bold mt-6 mb-2 text-black">REASSESSMENT</h3>
          <div>
            <b>1. Was there an error in the Criminal History Report?</b> {reassessmentForm.errorYesNo}
          </div>
          {reassessmentForm.errorYesNo === "Yes" && (
            <div className="mb-2">
              <b>If yes, describe the error:</b> {reassessmentForm.error}
            </div>
          )}
          <div className="mt-4">
            <b>2. Evidence of rehabilitation and good conduct:</b>
            {reassessmentForm.evidenceA && (
              <div className="mt-2">
                <b>a.</b> {reassessmentForm.evidenceA}
              </div>
            )}
            {reassessmentForm.evidenceB && (
              <div className="mt-2">
                <b>b.</b> {reassessmentForm.evidenceB}
              </div>
            )}
            {reassessmentForm.evidenceC && (
              <div className="mt-2">
                <b>c.</b> {reassessmentForm.evidenceC}
              </div>
            )}
            {reassessmentForm.evidenceD && (
              <div className="mt-2">
                <b>d.</b> {reassessmentForm.evidenceD}
              </div>
            )}
          </div>
          <div className="mt-2">
            {reassessmentDecision === "rescind" ? (
              <>
                <b>
                  Based on the factors above, we are rescinding our offer of employment because:
                </b>
                <br />
                {reassessmentForm.rescindReason}
              </>
            ) : (
              <>
                <b>Based on the factors above, we are extending our offer of employment.</b>
                <br />
                {extendReason}
              </>
            )}
          </div>
          <div className="flex justify-end mt-8 gap-4">
            <button
              type="button"
              className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
              onClick={handleSendReassessment}
              style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747" }}
            >
              Send
            </button>
            <button
              type="button"
              className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              onClick={() => setReassessmentPreview(false)}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Edit
            </button>
          </div>
        </div>
      )}

      <ReferencePanel
        isOpen={isReferencePanelOpen}
        onClose={closeReference}
        referenceData={currentReferenceData}
      />
    </div>
  );
};

export default IndividualizedReassessmentForm;
