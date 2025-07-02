import React, { useRef, useEffect } from "react";
import { AlertTriangle, Mail } from "lucide-react";

interface ConditionalJobOfferLetterProps {
  showOfferModal: boolean;
  setShowOfferModal: (show: boolean) => void;
  offerForm: any;
  editingField: string | null;
  handleFieldEdit: (field: string) => void;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFieldBlur: () => void;
  handleFieldKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  allFieldsFilled: boolean;
  handleSendOffer: () => void;
}

const ConditionalJobOfferLetter: React.FC<ConditionalJobOfferLetterProps> = ({
  showOfferModal,
  setShowOfferModal,
  offerForm,
  editingField,
  handleFieldEdit,
  handleFieldChange,
  handleFieldBlur,
  handleFieldKeyDown,
  allFieldsFilled,
  handleSendOffer,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const editableSpanClass =
    "font-semibold cursor-pointer inline-flex items-center gap-1 px-1 rounded border border-yellow-400 bg-yellow-100 hover:bg-yellow-200 transition";

  // Auto-focus the input when editing starts
  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingField]);

  return !showOfferModal ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto">
        {/* Warning Header */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-600 mt-1" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Important Legal Compliance Notice
              </h3>
              <div className="text-amber-800 leading-relaxed space-y-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <p>
                  Here is an example of the Conditional Job Offer Letter created by the San Diego County of Labor Enforcement & Standards that you are legally required to send to the applicant prior to initiating a background check. Please don't proceed until you have acknowledged that this Conditional Job Offer has been sent to the candidate along with required attachments and notices prior to conducting a background check.
                </p>
                <p>
                  We understand that this may or may not have been done by your background check provider, but to remain in compliance this step is mandated. We recommend you consult with your attorney if you have any questions about complying with the County of San Diego Fair Chance Ordinance.
                </p>
                <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-300">
                  <p className="text-sm font-medium text-amber-900">
                    <Mail className="h-4 w-4 inline mr-2" />
                    For inquiries, contact San Diego County Office of Labor Standards and Enforcement:
                    <a href="mailto:OLSE@sdcounty.ca.gov" className="ml-2 underline hover:no-underline font-semibold">
                      OLSE@sdcounty.ca.gov
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Sample Conditional Job Offer Letter</h2>
        <div className="prose max-w-none text-gray-900 text-base">
          <div className="mb-2">
            {editingField === "date" ? (
              <input
                ref={inputRef}
                type="date"
                name="date"
                value={offerForm.date}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                onKeyDown={handleFieldKeyDown}
                className="border rounded px-2 py-1"
              />
            ) : (
              <span className={editableSpanClass} onClick={() => handleFieldEdit("date")}>{offerForm.date || "[DATE]"}</span>
            )}
          </div>
          <div className="mb-2">RE: Conditional Offer of Employment & Notice of Conviction Background Check</div>
          <div className="mb-2">
            Dear {editingField === "applicant" ? (
              <input
                ref={inputRef}
                type="text"
                name="applicant"
                value={offerForm.applicant}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                onKeyDown={handleFieldKeyDown}
                className="border rounded px-2 py-1"
              />
            ) : (
              <span className={editableSpanClass} onClick={() => handleFieldEdit("applicant")}>{offerForm.applicant || "[APPLICANT NAME]"}</span>
            )}:
          </div>
          <div className="mb-2">
            We are writing to make you a conditional offer of employment for the position of {editingField === "position" ? (
              <input
                ref={inputRef}
                type="text"
                name="position"
                value={offerForm.position}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                onKeyDown={handleFieldKeyDown}
                className="border rounded px-2 py-1"
              />
            ) : (
              <span className={editableSpanClass} onClick={() => handleFieldEdit("position")}>{offerForm.position || "[INSERT POSITION]"}</span>
            )}. Before this job offer becomes final, we will check your conviction history. The form attached to this letter asks for your permission to check your conviction history and provides more information about that background check.
          </div>
          <div className="mb-2">
            After reviewing your conviction history report, we will either:<br />
            a. Notify you that this conditional job offer has become final; or<br />
            b. Notify you in writing that we intend to revoke (take back) this job offer because of your conviction history.
          </div>
          <div className="mb-2">
            As required by California state and San Diego County law, we will NOT consider any of the following information:<br />
            • Arrest not followed by conviction;<br />
            • Referral to or participation in a pretrial or posttrial diversion program; or<br />
            • Convictions that have been sealed, dismissed, expunged, or pardoned.
          </div>
          <div className="mb-2">
            As required by the California Fair Chance Act and the San Diego County Fair Chance Ordinance, we will consider whether your conviction history is directly related to the duties of the job we have offered you. We will consider all of the following:<br />
            • The nature and seriousness of the offense<br />
            • The amount of time since the offense<br />
            • The nature of the job
          </div>
          <div className="mb-2">
            We will notify you in writing if we plan to revoke (take back) this job offer after reviewing your conviction history. That decision will be preliminary, and you will have an opportunity to respond before it becomes final. We will identify conviction(s) that concern us, give you a copy of the background check report, as well as a copy of the written individualized assessment of the report and the relevance of your history to the position. We will then hold the position open, except in emergent circumstances to allow you at least 5 business days to provide information about your rehabilitation or mitigating circumstances and/or provide notice that you will provide information showing the conviction history report is inaccurate. Should you provide notice that you will provide information showing the conviction history report is inaccurate, you will have an additional 5 business days to provide that evidence. Should you provide additional information, we will then conduct a written individualized reassessment and decide whether to finalize or take back this conditional job offer. We will notify you of that decision in writing.
          </div>
          <div className="mb-2">
            Sincerely,<br />
            {editingField === "employer" ? (
              <input
                ref={inputRef}
                type="text"
                name="employer"
                value={offerForm.employer}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                onKeyDown={handleFieldKeyDown}
                className="border rounded px-2 py-1"
              />
            ) : (
              <span className={editableSpanClass} onClick={() => handleFieldEdit("employer")}>{offerForm.employer || "[EMPLOYER]"}</span>
            )}
          </div>
          <div className="mb-2">
            Enclosure: Authorization for Background Check (as required by the U.S. Fair Credit Reporting Act and California Investigative Consumer Reporting Agencies Act)
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold" onClick={() => setShowOfferModal(false)}>Cancel</button>
          <button type="button" className={`px-6 py-2 rounded bg-red-500 text-white font-semibold ${!allFieldsFilled ? "opacity-50 cursor-not-allowed" : ""}`} onClick={handleSendOffer} disabled={!allFieldsFilled}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ConditionalJobOfferLetter; 
