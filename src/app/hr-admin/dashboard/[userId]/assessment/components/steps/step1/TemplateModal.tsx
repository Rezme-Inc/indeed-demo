import React, { useState, useRef, useEffect } from "react";
import { X, Copy, Check, AlertTriangle, Mail } from "lucide-react";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateContent: string;
}

interface TemplateFields {
  date: string;
  applicantName: string;
  position: string;
  employerName: string;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  templateContent,
}) => {
  const [copied, setCopied] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [templateFields, setTemplateFields] = useState<TemplateFields>({
    date: new Date().toLocaleDateString(),
    applicantName: "",
    position: "",
    employerName: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when editing starts
  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingField]);

  const handleFieldEdit = (field: string) => setEditingField(field);
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleFieldBlur = () => setEditingField(null);
  const handleFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setEditingField(null);
  };

  const getFilledTemplate = () => {
    return templateContent
      .replace(/\[DATE\]/g, templateFields.date || "[DATE]")
      .replace(/\[APPLICANT NAME\]/g, templateFields.applicantName || "[APPLICANT NAME]")
      .replace(/\[INSERT POSITION\]/g, templateFields.position || "[INSERT POSITION]")
      .replace(/\[EMPLOYER NAME\]/g, templateFields.employerName || "[EMPLOYER NAME]");
  };

  const handleCopyTemplate = async () => {
    try {
      const filledTemplate = getFilledTemplate();
      await navigator.clipboard.writeText(filledTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy template:', err);
    }
  };

  const editableSpanClass = "font-semibold cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded border border-yellow-400 bg-yellow-100 hover:bg-yellow-200 transition";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-7xl w-full p-8 relative max-h-screen overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
            Conditional Job Offer Letter Template
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyTemplate}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Filled Template</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Warning Header */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
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
                  Fill in the highlighted fields below, then copy the completed letter and send it to the candidate before proceeding with the assessment process.
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

        {/* Template Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="prose max-w-none text-gray-900 text-base leading-relaxed" style={{ fontFamily: "Times, serif" }}>
            <div className="mb-4">
              {editingField === "date" ? (
                <input
                  ref={inputRef}
                  type="text"
                  name="date"
                  value={templateFields.date}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  onKeyDown={handleFieldKeyDown}
                  className="border rounded px-2 py-1 font-serif"
                  placeholder="Enter date"
                />
              ) : (
                <span
                  className={editableSpanClass}
                  onClick={() => handleFieldEdit("date")}
                >
                  {templateFields.date || "[DATE]"}
                </span>
              )}
            </div>

            <div className="mb-4">RE: Conditional Offer of Employment & Notice of Conviction Background Check</div>

            <div className="mb-4">
              Dear{" "}
              {editingField === "applicantName" ? (
                <input
                  ref={inputRef}
                  type="text"
                  name="applicantName"
                  value={templateFields.applicantName}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  onKeyDown={handleFieldKeyDown}
                  className="border rounded px-2 py-1 font-serif"
                  placeholder="Enter applicant name"
                />
              ) : (
                <span
                  className={editableSpanClass}
                  onClick={() => handleFieldEdit("applicantName")}
                >
                  {templateFields.applicantName || "[APPLICANT NAME]"}
                </span>
              )}
              :
            </div>

            <div className="mb-4">
              We are writing to make you a conditional offer of employment for the position of{" "}
              {editingField === "position" ? (
                <input
                  ref={inputRef}
                  type="text"
                  name="position"
                  value={templateFields.position}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  onKeyDown={handleFieldKeyDown}
                  className="border rounded px-2 py-1 font-serif"
                  placeholder="Enter position title"
                />
              ) : (
                <span
                  className={editableSpanClass}
                  onClick={() => handleFieldEdit("position")}
                >
                  {templateFields.position || "[INSERT POSITION]"}
                </span>
              )}
              . Before this job offer becomes final, we will check your conviction history. The form attached to this letter asks for your permission to check your conviction history and provides more information about that background check.
            </div>

            <div className="mb-4">
              After reviewing your conviction history report, we will either:<br />
              a. Notify you that this conditional job offer has become final; or<br />
              b. Notify you in writing that we intend to revoke (take back) this job offer because of your conviction history.
            </div>

            <div className="mb-4">
              As required by California state and San Diego County law, we will NOT consider any of the following information:<br />
              • Arrest not followed by conviction;<br />
              • Referral to or participation in a pretrial or posttrial diversion program; or<br />
              • Convictions that have been sealed, dismissed, expunged, or pardoned.
            </div>

            <div className="mb-4">
              As required by the California Fair Chance Act and the San Diego County Fair Chance Ordinance, we will consider whether your conviction history is directly related to the duties of the job we have offered you. We will consider all of the following:<br />
              • The nature and seriousness of the offense<br />
              • The amount of time since the offense<br />
              • The nature of the job
            </div>

            <div className="mb-4">
              We will notify you in writing if we plan to revoke (take back) this job offer after reviewing your conviction history. That decision will be preliminary, and you will have an opportunity to respond before it becomes final. We will identify conviction(s) that concern us, give you a copy of the background check report, as well as a copy of the written individualized assessment of the report and the relevance of your history to the position. We will then hold the position open, except in emergent circumstances to allow you at least 5 business days to provide information about your rehabilitation or mitigating circumstances and/or provide notice that you will provide information showing the conviction history report is inaccurate. Should you provide notice that you will provide information showing the conviction history report is inaccurate, you will have an additional 5 business days to provide that evidence. Should you provide additional information, we will then conduct a written individualized reassessment and decide whether to finalize or take back this conditional job offer. We will notify you of that decision in writing.
            </div>

            <div className="mb-4">
              Sincerely,<br />
              {editingField === "employerName" ? (
                <input
                  ref={inputRef}
                  type="text"
                  name="employerName"
                  value={templateFields.employerName}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  onKeyDown={handleFieldKeyDown}
                  className="border rounded px-2 py-1 font-serif"
                  placeholder="Enter employer/company name"
                />
              ) : (
                <span
                  className={editableSpanClass}
                  onClick={() => handleFieldEdit("employerName")}
                >
                  {templateFields.employerName || "[EMPLOYER NAME]"}
                </span>
              )}
            </div>

            <div className="mb-4">
              Enclosure: Authorization for Background Check (as required by the U.S. Fair Credit Reporting Act and California Investigative Consumer Reporting Agencies Act)
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600" style={{ fontFamily: "Poppins, sans-serif" }}>
            Click on the highlighted fields to edit them, then copy the completed template.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal; 
