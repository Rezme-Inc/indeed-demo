import React from 'react';

interface Part1ModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
  candidateProfile?: any;
  hrAdmin?: any;
  candidateId: string;
}

const Part1Modal: React.FC<Part1ModalProps> = ({
  showModal,
  setShowModal,
  formData,
  setFormData,
  onNext,
  candidateProfile,
  hrAdmin,
  candidateId,
}) => {

  if (!showModal) return null;

  const isComplete = () => {
    // Check that at least one response option is selected
    const hasResponse = formData.noResponse || formData.infoSubmitted;

    // If info was submitted, check that the list is filled
    const infoSubmittedComplete = !formData.infoSubmitted || (formData.infoSubmittedList && formData.infoSubmittedList.trim() !== '');

    // Check error determination is selected
    const hasErrorDetermination = formData.errorOnReport && (formData.errorOnReport === 'was' || formData.errorOnReport === 'was not');

    // Check at least one conviction is filled
    const hasConvictions = formData.convictions && formData.convictions.length > 0 && formData.convictions.some((c: string) => c && c.trim() !== '');

    return hasResponse && infoSubmittedComplete && hasErrorDetermination && hasConvictions;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Part 1: Basic Information</h2>
            <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Step 1 of 4</p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowModal(false)}
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
          <b>Notice:</b> All fields are required. Please complete all information before proceeding.
        </div>

        <form className="space-y-6">
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                (Please check one:)
              </h3>
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <input
                    type="checkbox"
                    checked={formData.noResponse || false}
                    onChange={(e) => setFormData({ ...formData, noResponse: e.target.checked, infoSubmitted: false })}
                    className="h-4 w-4 focus:ring-2 focus:ring-red-500"
                    style={{ accentColor: '#E54747' }}
                  />
                  We did not receive a timely response from you after sending you that letter, and our decision to revoke the job offer is now final.
                </label>
                <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <input
                    type="checkbox"
                    checked={formData.infoSubmitted || false}
                    onChange={(e) => setFormData({ ...formData, infoSubmitted: e.target.checked, noResponse: false })}
                    className="h-4 w-4 focus:ring-2 focus:ring-red-500"
                    style={{ accentColor: '#E54747' }}
                  />
                  We made a final decision to revoke the job offer after considering the information you submitted, which included:
                </label>
                {formData.infoSubmitted && (
                  <div className="mt-2">
                    <label className="block text-sm font-semibold mb-1 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      List information submitted <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.infoSubmittedList || ''}
                      onChange={(e) => setFormData({ ...formData, infoSubmittedList: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Please describe the information that was submitted by the candidate..."
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                After reviewing the information the candidate submitted, we have determined that there
              </div>

              <div className="flex items-center gap-4 my-4">
                <label className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg cursor-pointer transition-all duration-200"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    borderColor: formData.errorOnReport === 'was' ? '#E54747' : '#D1D5DB',
                    backgroundColor: formData.errorOnReport === 'was' ? '#FEF2F2' : 'white'
                  }}>
                  <input
                    type="radio"
                    name="errorOnReport"
                    value="was"
                    checked={formData.errorOnReport === 'was'}
                    onChange={(e) => setFormData({ ...formData, errorOnReport: e.target.value })}
                    className="h-4 w-4 focus:ring-2 focus:ring-red-500"
                    style={{ accentColor: '#E54747' }}
                  />
                  <span className={`font-semibold ${formData.errorOnReport === 'was' ? 'text-red-700' : 'text-black'}`}>
                    WAS
                  </span>
                </label>

                <label className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg cursor-pointer transition-all duration-200"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    borderColor: formData.errorOnReport === 'was not' ? '#E54747' : '#D1D5DB',
                    backgroundColor: formData.errorOnReport === 'was not' ? '#FEF2F2' : 'white'
                  }}>
                  <input
                    type="radio"
                    name="errorOnReport"
                    value="was not"
                    checked={formData.errorOnReport === 'was not'}
                    onChange={(e) => setFormData({ ...formData, errorOnReport: e.target.value })}
                    className="h-4 w-4 focus:ring-2 focus:ring-red-500"
                    style={{ accentColor: '#E54747' }}
                  />
                  <span className={`font-semibold ${formData.errorOnReport === 'was not' ? 'text-red-700' : 'text-black'}`}>
                    WAS NOT
                  </span>
                </label>
              </div>

              <div className="text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                (check one) an error on the candidate's conviction history report.
              </div>

              <div className="text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Conviction(s) that leads to the revocation of the job offer:
              </div>

              <div className="space-y-3">
                {(formData.convictions || ['']).map((conviction: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={conviction}
                        onChange={(e) => {
                          const newConvictions = [...(formData.convictions || [''])];
                          newConvictions[index] = e.target.value;
                          setFormData({ ...formData, convictions: newConvictions });
                        }}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder={`Conviction ${index + 1}`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      />
                    </div>
                    {(formData.convictions || ['']).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newConvictions = (formData.convictions || ['']).filter((_: any, i: number) => i !== index);
                          setFormData({ ...formData, convictions: newConvictions });
                        }}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Remove conviction"
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
                    const newConvictions = [...(formData.convictions || ['']), ''];
                    setFormData({ ...formData, convictions: newConvictions });
                  }}
                  className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  + Add Conviction
                </button>
              </div>
            </div>
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
