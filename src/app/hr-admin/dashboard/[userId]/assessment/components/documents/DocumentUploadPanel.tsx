import React from "react";
import { FileText, Building, Briefcase, Mail, StickyNote } from "lucide-react";
import { DocumentUpload } from "@/components/DocumentUpload";
import { useDocumentUploads } from "@/context/useDocumentUploads";

interface DocumentUploadPanelProps {
  progressSteps: string[];
  currentStep: number;
  onView: (file: File, type: "background" | "jobdesc" | "jobposting" | "emails" | "notes" | "companypolicy") => void;
  onDownload: (file: File, filename: string) => void;
}

const DocumentUploadPanel: React.FC<DocumentUploadPanelProps> = ({
  progressSteps,
  currentStep,
  onView,
  onDownload,
}) => {
  const {
    showDocumentPanel,
    setShowDocumentPanel,
    backgroundCheckFile,
    setBackgroundCheckFile,
    jobDescriptionFile,
    setJobDescriptionFile,
    jobPostingFile,
    setJobPostingFile,
    emailsFile,
    setEmailsFile,
    notesFile,
    setNotesFile,
    companyPolicyFile,
    setCompanyPolicyFile,
    uploadingBackground,
    setUploadingBackground,
    uploadingJobDesc,
    setUploadingJobDesc,
    uploadingJobPosting,
    setUploadingJobPosting,
    uploadingEmails,
    setUploadingEmails,
    uploadingNotes,
    setUploadingNotes,
    uploadingCompanyPolicy,
    setUploadingCompanyPolicy,
  } = useDocumentUploads();

  if (!showDocumentPanel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40">
      <div
        className={`fixed right-0 top-0 h-full w-96 shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 translate-x-0`}
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200" style={{ backgroundColor: "#FFFFFF" }}>
          <h2 className="text-xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}>
            Document Upload
          </h2>
          <button
            className="p-2 rounded-xl transition-all duration-200 hover:bg-gray-100"
            style={{ color: "#595959" }}
            onClick={() => setShowDocumentPanel(false)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 h-full overflow-y-auto" style={{ backgroundColor: "#FFFFFF" }}>
          {/* Background Check Report Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FEF2F2" }}>
                <FileText className="h-5 w-5" style={{ color: "#E54747" }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}>
                  Background Check Report
                </h3>
                <p className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                  Upload the candidate's background check report
                </p>
              </div>
            </div>
            <DocumentUpload
              file={backgroundCheckFile}
              setFile={setBackgroundCheckFile}
              uploading={uploadingBackground}
              setUploading={setUploadingBackground}
              type="background"
              inputId="background-upload"
              icon={FileText}
              iconBg="#FEF2F2"
              iconColor="#E54747"
              onView={onView}
              onDownload={onDownload}
            />
          </div>

          {/* Company Policy Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EFF6FF" }}>
                <Building className="h-5 w-5" style={{ color: "#3B82F6" }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}>
                  Company Policy
                </h3>
                <p className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                  Upload the company's policy document
                </p>
              </div>
            </div>
            <DocumentUpload
              file={companyPolicyFile}
              setFile={setCompanyPolicyFile}
              uploading={uploadingCompanyPolicy}
              setUploading={setUploadingCompanyPolicy}
              type="companypolicy"
              inputId="companypolicy-upload"
              icon={Building}
              iconBg="#EFF6FF"
              iconColor="#3B82F6"
              onView={onView}
              onDownload={onDownload}
            />
          </div>

          {/* Job Description Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EFF6FF" }}>
                <Building className="h-5 w-5" style={{ color: "#3B82F6" }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}>
                  Job Description
                </h3>
                <p className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                  Upload the official job description document
                </p>
              </div>
            </div>
            <DocumentUpload
              file={jobDescriptionFile}
              setFile={setJobDescriptionFile}
              uploading={uploadingJobDesc}
              setUploading={setUploadingJobDesc}
              type="jobdesc"
              inputId="jobdesc-upload"
              icon={Building}
              iconBg="#EFF6FF"
              iconColor="#3B82F6"
              onView={onView}
              onDownload={onDownload}
            />
          </div>

          {/* Job Posting Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F0FDF4" }}>
                <Briefcase className="h-5 w-5" style={{ color: "#10B981" }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}>
                  Job Posting
                </h3>
                <p className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                  Upload the official job posting document
                </p>
              </div>
            </div>
            <DocumentUpload
              file={jobPostingFile}
              setFile={setJobPostingFile}
              uploading={uploadingJobPosting}
              setUploading={setUploadingJobPosting}
              type="jobposting"
              inputId="jobposting-upload"
              icon={Briefcase}
              iconBg="#F0FDF4"
              iconColor="#10B981"
              onView={onView}
              onDownload={onDownload}
            />
          </div>

          {/* Emails Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F3E8FF" }}>
                <Mail className="h-5 w-5" style={{ color: "#8B5CF6" }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}>
                  Emails
                </h3>
                <p className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                  Upload any relevant emails related to the job application process
                </p>
              </div>
            </div>
            <DocumentUpload
              file={emailsFile}
              setFile={setEmailsFile}
              uploading={uploadingEmails}
              setUploading={setUploadingEmails}
              type="emails"
              inputId="emails-upload"
              icon={Mail}
              iconBg="#F3E8FF"
              iconColor="#8B5CF6"
              onView={onView}
              onDownload={onDownload}
            />
          </div>

          {/* Notes Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFFBEB" }}>
                <StickyNote className="h-5 w-5" style={{ color: "#F59E0B" }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}>
                  Notes
                </h3>
                <p className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                  Upload any additional notes or comments you want to include
                </p>
              </div>
            </div>
            <DocumentUpload
              file={notesFile}
              setFile={setNotesFile}
              uploading={uploadingNotes}
              setUploading={setUploadingNotes}
              type="notes"
              inputId="notes-upload"
              icon={StickyNote}
              iconBg="#FFFBEB"
              iconColor="#F59E0B"
              onView={onView}
              onDownload={onDownload}
            />
          </div>

          {/* Upload Status */}
          {(backgroundCheckFile ||
            jobDescriptionFile ||
            jobPostingFile ||
            emailsFile ||
            notesFile ||
            companyPolicyFile) && (
            <div className="border border-gray-200 rounded-xl p-4" style={{ backgroundColor: "#F9FAFB" }}>
              <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}>
                Upload Status
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                    Background Check Report
                  </span>
                  <span
                    className={`text-sm font-medium`}
                    style={{ fontFamily: "Poppins, sans-serif", color: backgroundCheckFile ? "#10B981" : "#9CA3AF" }}
                  >
                    {backgroundCheckFile ? "✓ Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                    Job Description
                  </span>
                  <span
                    className={`text-sm font-medium`}
                    style={{ fontFamily: "Poppins, sans-serif", color: jobDescriptionFile ? "#10B981" : "#9CA3AF" }}
                  >
                    {jobDescriptionFile ? "✓ Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                    Job Posting
                  </span>
                  <span
                    className={`text-sm font-medium`}
                    style={{ fontFamily: "Poppins, sans-serif", color: jobPostingFile ? "#10B981" : "#9CA3AF" }}
                  >
                    {jobPostingFile ? "✓ Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                    Emails
                  </span>
                  <span
                    className={`text-sm font-medium`}
                    style={{ fontFamily: "Poppins, sans-serif", color: emailsFile ? "#10B981" : "#9CA3AF" }}
                  >
                    {emailsFile ? "✓ Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                    Notes
                  </span>
                  <span
                    className={`text-sm font-medium`}
                    style={{ fontFamily: "Poppins, sans-serif", color: notesFile ? "#10B981" : "#9CA3AF" }}
                  >
                    {notesFile ? "✓ Uploaded" : "Pending"}
                  </span>
                </div>
                {companyPolicyFile && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                      Company Policy
                    </span>
                    <span className={`text-sm font-medium`} style={{ fontFamily: "Poppins, sans-serif", color: "#10B981" }}>
                      ✓ Uploaded
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                  <span className="text-xs font-medium" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                    Current Phase
                  </span>
                  <span className="text-xs font-medium" style={{ fontFamily: "Poppins, sans-serif", color: "#E54747" }}>
                    {currentStep === 1
                      ? "Conditional Offer"
                      : currentStep === 2
                      ? "Assessment"
                      : currentStep === 3
                      ? "Review"
                      : currentStep === 4
                      ? "Decision"
                      : "Final Steps"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                    Assessment Progress
                  </span>
                  <span className="text-xs font-medium" style={{ fontFamily: "Poppins, sans-serif", color: "#10B981" }}>
                    Step {currentStep} of {progressSteps.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="border border-gray-200 rounded-xl p-4" style={{ backgroundColor: "#F9FAFB" }}>
            <h4 className="text-sm font-semibold mb-2" style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}>
              Upload Guidelines
            </h4>
            <ul className="text-xs space-y-1" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
              <li>• Supported formats: PDF, JPEG, PNG, DOCX, DOC</li>
              <li>• Maximum file size: 10MB per document</li>
              <li>• Documents will be securely stored and accessible during the assessment</li>
              <li>• Both documents are recommended for a complete assessment</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200" style={{ backgroundColor: "#FFFFFF" }}>
          <button
            onClick={() => setShowDocumentPanel(false)}
            className="w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:opacity-90"
            style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747", color: "#FFFFFF" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadPanel;
