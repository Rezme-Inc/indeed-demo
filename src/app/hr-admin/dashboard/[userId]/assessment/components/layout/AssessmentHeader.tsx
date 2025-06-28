import React from "react";
import {
  FileText,
  ChevronDown,
  ClipboardCheck,
  AlertTriangle,
  RotateCcw,
  AlertCircle,
  Building,
  Briefcase,
  Mail,
  StickyNote,
  History,
  ChevronLeft,
} from "lucide-react";
import { useDocumentUploads } from "@/context/useDocumentUploads";
import { useRouter } from "next/navigation";

interface AssessmentHeaderProps {
  savedOfferLetter: any;
  savedAssessment: any;
  savedRevocationNotice: any;
  savedReassessment: any;
  savedFinalRevocationNotice: any;
  trackingActive: boolean;
  hrAdminProfile: any;
  headerLoading: boolean;
  handleViewOfferLetter: () => void;
  handleViewDocument: (
    file: File,
    type:
      | "background"
      | "jobdesc"
      | "jobposting"
      | "emails"
      | "notes"
      | "companypolicy"
  ) => void;
  setShowAssessmentViewModal: (b: boolean) => void;
  setShowRevocationViewModal: (b: boolean) => void;
  setShowReassessmentViewModal: (b: boolean) => void;
  setShowFinalRevocationViewModal: (b: boolean) => void;
  setShowTimelinePanel: (b: boolean) => void;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  savedOfferLetter,
  savedAssessment,
  savedRevocationNotice,
  savedReassessment,
  savedFinalRevocationNotice,
  trackingActive,
  hrAdminProfile,
  headerLoading,
  handleViewOfferLetter,
  handleViewDocument,
  setShowAssessmentViewModal,
  setShowRevocationViewModal,
  setShowReassessmentViewModal,
  setShowFinalRevocationViewModal,
  setShowTimelinePanel,
}) => {
  const router = useRouter();
  const {
    showDocumentsDropdown,
    setShowDocumentsDropdown,
    backgroundCheckFile,
    jobDescriptionFile,
    jobPostingFile,
    emailsFile,
    notesFile,
    companyPolicyFile,
    setShowDocumentPanel,
  } = useDocumentUploads();

  return (
    <header className="w-full bg-white shadow-sm flex items-center justify-between px-8 py-4 mb-8 sticky top-0 z-30 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <span
          className="text-black font-bold text-xl tracking-tight flex items-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <span className="mr-2">
            réz
            <span className="text-red-500" style={{ color: "#E54747" }}>
              me
            </span>
            .
          </span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        {/* Documents Dropdown Menu */}
        <div className="relative documents-dropdown">
          <button
            onClick={() => setShowDocumentsDropdown(!showDocumentsDropdown)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-all duration-200"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <FileText className="h-4 w-4" />
            View Documents
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${showDocumentsDropdown ? "rotate-180" : ""
                }`}
            />
          </button>

          {showDocumentsDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-64 z-50">
              {savedOfferLetter && (
                <button
                  onClick={() => {
                    handleViewOfferLetter();
                    setShowDocumentsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <FileText className="h-4 w-4" />
                  View Conditional Job Offer
                </button>
              )}
              {savedAssessment && (
                <button
                  onClick={() => {
                    setShowAssessmentViewModal(true);
                    setShowDocumentsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  View Assessment
                </button>
              )}
              {savedRevocationNotice && (
                <button
                  onClick={() => {
                    setShowRevocationViewModal(true);
                    setShowDocumentsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <AlertTriangle className="h-4 w-4" />
                  View Revocation Notice
                </button>
              )}
              {savedReassessment && (
                <button
                  onClick={() => {
                    setShowReassessmentViewModal(true);
                    setShowDocumentsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <RotateCcw className="h-4 w-4" />
                  View Reassessment
                </button>
              )}
              {savedFinalRevocationNotice && (
                <button
                  onClick={() => {
                    setShowFinalRevocationViewModal(true);
                    setShowDocumentsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <AlertCircle className="h-4 w-4" />
                  View Final Revocation
                </button>
              )}
              {backgroundCheckFile && (
                <button
                  onClick={() => {
                    handleViewDocument(backgroundCheckFile, "background");
                    setShowDocumentsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <FileText className="h-4 w-4" />
                  View Background Check
                </button>
              )}
              {jobDescriptionFile && (
                <button
                  onClick={() => {
                    handleViewDocument(jobDescriptionFile, "jobdesc");
                    setShowDocumentsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <Building className="h-4 w-4" />
                  View Job Description
                </button>
              )}
              {jobPostingFile && (
                <button
                  onClick={() => {
                    handleViewDocument(jobPostingFile, "jobposting");
                    setShowDocumentsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <Briefcase className="h-4 w-4" />
                  View Job Posting
                </button>
              )}
              {emailsFile && (
                <button
                  onClick={() => {
                    handleViewDocument(emailsFile, "emails");
                    setShowDocumentsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <Mail className="h-4 w-4" />
                  View Emails
                </button>
              )}
              {notesFile && (
                <button
                  onClick={() => {
                    handleViewDocument(notesFile, "notes");
                    setShowDocumentsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <StickyNote className="h-4 w-4" />
                  View Notes
                </button>
              )}
              {companyPolicyFile && (
                <button
                  onClick={() => {
                    handleViewDocument(companyPolicyFile, "companypolicy");
                    setShowDocumentsDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <Building className="h-4 w-4" />
                  View Company Policy
                </button>
              )}
              {!savedOfferLetter &&
                !savedAssessment &&
                !savedRevocationNotice &&
                !savedReassessment &&
                !savedFinalRevocationNotice &&
                !backgroundCheckFile &&
                !jobDescriptionFile &&
                !jobPostingFile &&
                !emailsFile &&
                !notesFile &&
                !companyPolicyFile && (
                  <div
                    className="px-4 py-2 text-gray-500 text-sm"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    No documents available
                  </div>
                )}
            </div>
          )}
        </div>

        {/* HR Action Timeline Trigger */}
        <button
          onClick={() => setShowTimelinePanel(true)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-all duration-200"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          <History className="h-4 w-4" />
          HR Action Timeline
        </button>

        {/* Document Upload Panel Trigger */}
        <button
          onClick={() => setShowDocumentPanel(true)}
          className="px-4 py-2 text-white rounded-xl hover:opacity-90 text-sm font-medium flex items-center gap-2 transition-all duration-200"
          style={{
            fontFamily: "Poppins, sans-serif",
            backgroundColor: "#E54747",
          }}
        >
          <FileText className="h-4 w-4" />
          Upload Documents
        </button>
        {/* Return to Dashboard Button */}
        <button
          onClick={() => router.push("/hr-admin/dashboard")}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 border-l-2 border-gray-300 ml-4 pl-4 transition-all duration-200"
          style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}
        >
          <ChevronLeft className="h-4 w-4" />
          Return to Dashboard
        </button>

        {/* Tracking Status Indicator */}
        {trackingActive && (
          <div className="ml-4 flex items-center gap-2 text-xs text-green-600">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span style={{ fontFamily: "Poppins, sans-serif" }}>
              Compliance Tracking Active
            </span>
          </div>
        )}

        {headerLoading ? (
          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
        ) : hrAdminProfile ? (
          <>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg mr-2"
              style={{
                backgroundColor: "#E54747",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {hrAdminProfile.first_name?.[0]}
              {hrAdminProfile.last_name?.[0]}
            </div>
            <div className="flex flex-col">
              <span
                className="text-black font-medium text-base"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {hrAdminProfile.first_name} {hrAdminProfile.last_name}
              </span>
              <span
                className="text-gray-600 text-sm"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  color: "#595959",
                }}
              >
                {hrAdminProfile.company || ""}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
};

export default AssessmentHeader;
