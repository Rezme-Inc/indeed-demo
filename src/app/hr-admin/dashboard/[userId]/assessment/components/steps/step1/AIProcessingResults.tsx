import React, { useState } from "react";
import { Sparkles, Check, X, Edit2, Save } from "lucide-react";

interface JobDescriptionResults {
  position: string;
  duties: string[];
}

interface OfferLetterResults {
  offerDate: string;
}

interface AIProcessingResultsProps {
  jobDescriptionResults: JobDescriptionResults | null;
  offerLetterResults: OfferLetterResults | null;
  isProcessingJobDescription: boolean;
  isProcessingOfferLetter: boolean;
  onProcessJobDescription: () => void;
  onProcessOfferLetter: () => void;
  onApproveJobDescription: (results: JobDescriptionResults) => void;
  onApproveOfferLetter: (results: OfferLetterResults) => void;
  jobDescriptionApproved: boolean;
  offerLetterApproved: boolean;
}

const AIProcessingResults: React.FC<AIProcessingResultsProps> = ({
  jobDescriptionResults,
  offerLetterResults,
  isProcessingJobDescription,
  isProcessingOfferLetter,
  onProcessJobDescription,
  onProcessOfferLetter,
  onApproveJobDescription,
  onApproveOfferLetter,
  jobDescriptionApproved,
  offerLetterApproved,
}) => {
  const [editedJobDescription, setEditedJobDescription] = useState<JobDescriptionResults | null>(null);
  const [editedOfferLetter, setEditedOfferLetter] = useState<OfferLetterResults | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleEdit = (field: string, type: 'job' | 'offer') => {
    if (type === 'job' && !editedJobDescription && jobDescriptionResults) {
      setEditedJobDescription({ ...jobDescriptionResults });
    }
    if (type === 'offer' && !editedOfferLetter && offerLetterResults) {
      setEditedOfferLetter({ ...offerLetterResults });
    }
    setEditingField(field);
  };

  const handleSave = () => {
    setEditingField(null);
  };

  const handleDutyChange = (index: number, value: string) => {
    if (editedJobDescription) {
      const newDuties = [...editedJobDescription.duties];
      newDuties[index] = value;
      setEditedJobDescription({ ...editedJobDescription, duties: newDuties });
    }
  };

  const addDuty = () => {
    if (editedJobDescription) {
      setEditedJobDescription({
        ...editedJobDescription,
        duties: [...editedJobDescription.duties, ""]
      });
    }
  };

  const removeDuty = (index: number) => {
    if (editedJobDescription && editedJobDescription.duties.length > 1) {
      const newDuties = editedJobDescription.duties.filter((_, i) => i !== index);
      setEditedJobDescription({ ...editedJobDescription, duties: newDuties });
    }
  };

  const handleApproveJobDescription = () => {
    const finalResults = editedJobDescription || jobDescriptionResults;
    if (finalResults) {
      onApproveJobDescription(finalResults);
    }
  };

  const handleApproveOfferLetter = () => {
    const finalResults = editedOfferLetter || offerLetterResults;
    if (finalResults) {
      onApproveOfferLetter(finalResults);
    }
  };

  const currentJobResults = editedJobDescription || jobDescriptionResults;
  const currentOfferResults = editedOfferLetter || offerLetterResults;

  return (
    <div className="space-y-6">
      {/* Job Description Processing */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
          Job Description Processing
        </h3>

        {isProcessingJobDescription ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Processing Job Description
                </h4>
                <p className="text-sm text-blue-700" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Analyzing job description to extract position and duties...
                </p>
              </div>
            </div>
          </div>
        ) : !jobDescriptionResults ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Ready to Process Job Description
                </h4>
                <p className="text-sm text-gray-600" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Extract position title and job duties from the uploaded job description.
                </p>
              </div>
              <button
                onClick={onProcessJobDescription}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Process Job Description
              </button>
            </div>
          </div>
        ) : (
          <div className={`border rounded-xl p-6 ${jobDescriptionApproved ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Sparkles className={`h-6 w-6 ${jobDescriptionApproved ? 'text-green-600' : 'text-purple-600'}`} />
                <h4 className={`text-lg font-semibold ${jobDescriptionApproved ? 'text-green-900' : 'text-purple-900'}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                  {jobDescriptionApproved ? 'Job Description Approved' : 'Job Description Results'}
                </h4>
              </div>
              {!jobDescriptionApproved && (
                <button
                  onClick={onProcessJobDescription}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Reprocess
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Position */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Position Applied For
                  </label>
                  {!jobDescriptionApproved && editingField !== 'position' && (
                    <button
                      onClick={() => handleEdit('position', 'job')}
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Edit position"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {!jobDescriptionApproved && editingField === 'position' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={currentJobResults?.position || ''}
                      onChange={(e) => setEditedJobDescription(prev => prev ? { ...prev, position: e.target.value } : null)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    />
                    <button
                      onClick={handleSave}
                      className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      title="Save changes"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded px-3 py-2">
                    <span className="text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {currentJobResults?.position}
                    </span>
                  </div>
                )}
              </div>

              {/* Job Duties */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Job Duties
                  </label>
                  {!jobDescriptionApproved && editingField !== 'duties' && (
                    <button
                      onClick={() => handleEdit('duties', 'job')}
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Edit duties"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {!jobDescriptionApproved && editingField === 'duties' ? (
                  <div className="space-y-3">
                    {currentJobResults?.duties.map((duty, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={duty}
                          onChange={(e) => handleDutyChange(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                          placeholder={`Duty ${index + 1}`}
                        />
                        {currentJobResults.duties.length > 1 && (
                          <button
                            onClick={() => removeDuty(index)}
                            className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            title="Remove duty"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={addDuty}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        + Add Duty
                      </button>
                      <button
                        onClick={handleSave}
                        className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                        title="Save changes"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded p-3">
                    <ul className="space-y-2">
                      {currentJobResults?.duties.map((duty, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-gray-500 text-sm mt-1">•</span>
                          <span className="text-gray-900 text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                            {duty}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {!jobDescriptionApproved && (
              <div className="mt-6 pt-6 border-t border-purple-200">
                <button
                  onClick={handleApproveJobDescription}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <Check className="h-5 w-5" />
                  <span>Approve Position & Duties</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Offer Letter Processing */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
          Conditional Offer Letter Processing
        </h3>

        {isProcessingOfferLetter ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Processing Offer Letter
                </h4>
                <p className="text-sm text-blue-700" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Analyzing offer letter to extract the date it was sent...
                </p>
              </div>
            </div>
          </div>
        ) : !offerLetterResults ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Ready to Process Offer Letter
                </h4>
                <p className="text-sm text-gray-600" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Extract the date the conditional offer letter was sent to the candidate.
                </p>
              </div>
              <button
                onClick={onProcessOfferLetter}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Process Offer Letter
              </button>
            </div>
          </div>
        ) : (
          <div className={`border rounded-xl p-6 ${offerLetterApproved ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Sparkles className={`h-6 w-6 ${offerLetterApproved ? 'text-green-600' : 'text-purple-600'}`} />
                <h4 className={`text-lg font-semibold ${offerLetterApproved ? 'text-green-900' : 'text-purple-900'}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                  {offerLetterApproved ? 'Offer Date Approved' : 'Offer Letter Results'}
                </h4>
              </div>
              {!offerLetterApproved && (
                <button
                  onClick={onProcessOfferLetter}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Reprocess
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Conditional Offer Date
                </label>
                {!offerLetterApproved && editingField !== 'offerDate' && (
                  <button
                    onClick={() => handleEdit('offerDate', 'offer')}
                    className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                    title="Edit offer date"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              {!offerLetterApproved && editingField === 'offerDate' ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={currentOfferResults?.offerDate || ''}
                    onChange={(e) => setEditedOfferLetter(prev => prev ? { ...prev, offerDate: e.target.value } : null)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  />
                  <button
                    onClick={handleSave}
                    className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    title="Save changes"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded px-3 py-2">
                  <span className="text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {currentOfferResults?.offerDate ? new Date(currentOfferResults.offerDate).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
              )}
            </div>

            {!offerLetterApproved && (
              <div className="mt-6 pt-6 border-t border-purple-200">
                <button
                  onClick={handleApproveOfferLetter}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <Check className="h-5 w-5" />
                  <span>Approve Offer Date</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIProcessingResults; 
