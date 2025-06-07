import React from "react";

interface IndividualizedAssessmentModalProps {
  showAssessmentModal: boolean;
  setShowAssessmentModal: (show: boolean) => void;
  assessmentForm: any;
  handleAssessmentFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAssessmentArrayChange: (field: 'duties' | 'activities', idx: number, value: string) => void;
  assessmentPreview: boolean;
  setAssessmentPreview: (show: boolean) => void;
  handleSendAssessment: () => void;
  onAddDuty: () => void;
  onAddActivity: () => void;
}

function isAssessmentFormComplete(assessmentForm: any) {
  // Check all string fields
  const requiredFields = [
    'employer', 'applicant', 'position', 'offerDate', 'assessmentDate', 'reportDate', 'performedBy', 'conduct', 'howLongAgo', 'rescindReason'
  ];
  for (const field of requiredFields) {
    if (!assessmentForm[field] || assessmentForm[field].toString().trim() === "") return false;
  }
  // Duties: at least one non-empty
  if (!assessmentForm.duties || !Array.isArray(assessmentForm.duties) || assessmentForm.duties.filter((d: string) => d && d.trim() !== "").length === 0) return false;
  // Activities: at least one non-empty
  if (!assessmentForm.activities || !Array.isArray(assessmentForm.activities) || assessmentForm.activities.filter((a: string) => a && a.trim() !== "").length === 0) return false;
  return true;
}

const IndividualizedAssessmentModal: React.FC<IndividualizedAssessmentModalProps> = ({
  showAssessmentModal,
  setShowAssessmentModal,
  assessmentForm,
  handleAssessmentFormChange,
  handleAssessmentArrayChange,
  assessmentPreview,
  setAssessmentPreview,
  handleSendAssessment,
  onAddDuty,
  onAddActivity,
}) => {
  if (!showAssessmentModal) return null;
  const isComplete = isAssessmentFormComplete(assessmentForm);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Criminal History Individual Assessment Form</h2>
        {/* Compliance Notice */}
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
          <b>Notice:</b> All fields are required. Failure to complete all fields may result in legal incompliance.
        </div>
        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold mr-2"
            onClick={() => setAssessmentPreview(!assessmentPreview)}
          >
            {assessmentPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold"
            onClick={() => setShowAssessmentModal(false)}
          >
            Cancel
          </button>
        </div>
        {!assessmentPreview ? (
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1">Employer Name</label>
                <input type="text" name="employer" value={assessmentForm.employer} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Applicant Name</label>
                <input type="text" name="applicant" value={assessmentForm.applicant} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Position Applied For</label>
                <input type="text" name="position" value={assessmentForm.position} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date of Conditional Offer</label>
                <input type="date" name="offerDate" value={assessmentForm.offerDate} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date of Assessment</label>
                <input type="date" name="assessmentDate" value={assessmentForm.assessmentDate} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date of Criminal History Report</label>
                <input type="date" name="reportDate" value={assessmentForm.reportDate} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Assessment Performed by</label>
                <input type="text" name="performedBy" value={assessmentForm.performedBy} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">1. The specific duties and responsibilities of the job are:</label>
              {assessmentForm.duties.map((duty: string, idx: number) => (
                <input
                  key={idx}
                  type="text"
                  value={duty}
                  onChange={e => handleAssessmentArrayChange('duties', idx, e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder={`Duty ${String.fromCharCode(97 + idx)}`}
                />
              ))}
              <button type="button" className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium" onClick={onAddDuty}>
                + Add Duty
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">4. Activities since criminal activity, such as work experience, job training, rehabilitation, community service, etc.:</label>
              {assessmentForm.activities.map((activity: string, idx: number) => (
                <input
                  key={idx}
                  type="text"
                  value={activity}
                  onChange={e => handleAssessmentArrayChange('activities', idx, e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder={`Activity ${String.fromCharCode(97 + idx)}`}
                />
              ))}
              <button type="button" className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium" onClick={onAddActivity}>
                + Add Activity
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">2. Description of the criminal conduct and why the conduct is of concern with respect to the position in question</label>
              <textarea name="conduct" value={assessmentForm.conduct} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2 min-h-[60px]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">3. How long ago did the criminal activity occur:</label>
              <input type="text" name="howLongAgo" value={assessmentForm.howLongAgo} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Based on the factors above, we are considering rescinding our offer of employment because (describe the link between the specific aspects of the applicant's criminal history with risks inherent in the duties of the employment position):</label>
              <textarea name="rescindReason" value={assessmentForm.rescindReason} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2 min-h-[60px]" />
            </div>
            <div className="flex justify-end mt-8">
              <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600" onClick={() => setAssessmentPreview(true)}>
                Preview
              </button>
            </div>
          </form>
        ) : (
          <div className="prose max-w-none text-gray-900 text-base bg-gray-50 p-8 rounded">
            <h3 className="font-bold mb-2">INFORMATION</h3>
            <div><b>Employer Name:</b> {assessmentForm.employer}</div>
            <div><b>Applicant Name:</b> {assessmentForm.applicant}</div>
            <div><b>Position Applied For:</b> {assessmentForm.position}</div>
            <div><b>Date of Conditional Offer:</b> {assessmentForm.offerDate}</div>
            <div><b>Date of Assessment:</b> {assessmentForm.assessmentDate}</div>
            <div><b>Date of Criminal History Report:</b> {assessmentForm.reportDate}</div>
            <div><b>Assessment Performed by:</b> {assessmentForm.performedBy}</div>
            <h3 className="font-bold mt-6 mb-2">ASSESSMENT</h3>
            <div><b>1. The specific duties and responsibilities of the job are:</b>
              <ul className="list-disc ml-6">
                {assessmentForm.duties.map((duty: string, idx: number) => duty && <li key={idx}>{duty}</li>)}
              </ul>
            </div>
            <div className="mt-2"><b>2. Description of the criminal conduct and why the conduct is of concern with respect to the position in question:</b><br />{assessmentForm.conduct}</div>
            <div className="mt-2"><b>3. How long ago did the criminal activity occur:</b> {assessmentForm.howLongAgo}</div>
            <div className="mt-2"><b>4. Activities since criminal activity, such as work experience, job training, rehabilitation, community service, etc.:</b>
              <ul className="list-disc ml-6">
                {assessmentForm.activities.map((act: string, idx: number) => act && <li key={idx}>{act}</li>)}
              </ul>
            </div>
            <div className="mt-2"><b>Based on the factors above, we are considering rescinding our offer of employment because:</b><br />{assessmentForm.rescindReason}</div>
            <div className="flex justify-end mt-8 gap-4 items-center">
              {!isComplete && (
                <span className="text-red-600 text-sm font-semibold mr-4">All fields must be filled before sending.</span>
              )}
              <button type="button" className={`px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600 ${!isComplete ? "opacity-50 cursor-not-allowed" : ""}`} onClick={handleSendAssessment} disabled={!isComplete}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualizedAssessmentModal; 
