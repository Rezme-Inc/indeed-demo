import React from "react";
import {
  Mail,
  UserCheck,
  ClipboardCheck,
  FileText,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface DocumentFiles {
  backgroundCheckFile: File | null;
  jobDescriptionFile: File | null;
  jobPostingFile: File | null;
  emailsFile: File | null;
  notesFile: File | null;
  companyPolicyFile: File | null;
}

interface TimelineData {
  inviteSent: string | null;
  accessGranted: string | null;
  candidateResponse: string | null;
  profileCreated: string | null;
}

interface TimelinePanelProps {
  timelineData: TimelineData;
  documents: DocumentFiles;
  progressSteps: string[];
  currentStep: number;
  savedOfferLetter: any;
  savedAssessment: any;
  savedRevocationNotice: any;
  savedHireDecision: any;
  savedPreliminaryDecision: any;
  savedReassessment: any;
  savedFinalRevocationNotice: any;
  candidateProfile: any;
  onClose: () => void;
  onViewDocument: (file: File, type: "background" | "jobdesc" | "jobposting" | "emails" | "notes" | "companypolicy") => void;
}

const TimelinePanel: React.FC<TimelinePanelProps> = ({
  timelineData,
  documents,
  progressSteps,
  currentStep,
  savedOfferLetter,
  savedAssessment,
  savedRevocationNotice,
  savedHireDecision,
  savedPreliminaryDecision,
  savedReassessment,
  savedFinalRevocationNotice,
  candidateProfile,
  onClose,
  onViewDocument,
}) => {
  const {
    backgroundCheckFile,
    jobDescriptionFile,
    jobPostingFile,
    emailsFile,
    notesFile,
    companyPolicyFile,
  } = documents;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40">
      <div
        className="fixed right-0 top-0 h-full w-96 shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 translate-x-0"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center p-6 border-b border-gray-200"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}
          >
            HR Action Timeline
          </h2>
          <button
            className="p-2 rounded-xl transition-all duration-200 hover:bg-gray-100"
            style={{ color: "#595959" }}
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 h-full overflow-y-auto" style={{ backgroundColor: "#FFFFFF" }}>
          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Timeline Items */}
            <div className="space-y-8">
              {/* 1. Invite Date */}
              <div className="relative flex items-start">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10"
                  style={{ backgroundColor: timelineData.inviteSent ? "#E54747" : "#9CA3AF" }}
                >
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                      Invite Sent
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {timelineData.inviteSent ? new Date(timelineData.inviteSent).toLocaleDateString() : "Not sent"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Initial invitation email sent to candidate
                  </p>
                </div>
              </div>

              {/* 2. Access Granted Date */}
              <div className="relative flex items-start">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10"
                  style={{ backgroundColor: timelineData.accessGranted ? "#10B981" : "#9CA3AF" }}
                >
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                      Access Granted
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {timelineData.accessGranted ? new Date(timelineData.accessGranted).toLocaleDateString() : "Pending"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Candidate granted access to assessment portal
                  </p>
                </div>
              </div>

              {/* 3. Candidate Response Received */}
              <div className="relative flex items-start">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10"
                  style={{ backgroundColor: timelineData.candidateResponse ? "#10B981" : "#9CA3AF" }}
                >
                  <ClipboardCheck className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                      Candidate Response
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {timelineData.candidateResponse ? new Date(timelineData.candidateResponse).toLocaleDateString() : "Pending"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Initial candidate assessment response
                  </p>
                </div>
              </div>

              {/* 4. Conditional Job Offer */}
              <div className="relative flex items-start">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10"
                  style={{ backgroundColor: savedOfferLetter ? "#10B981" : "#9CA3AF" }}
                >
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                      Conditional Job Offer
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {savedOfferLetter ? new Date(savedOfferLetter.sentAt).toLocaleDateString() : "Not sent"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Conditional job offer sent to candidate
                  </p>
                </div>
              </div>

              {/* 5. Written Individualized Assessment */}
              <div className="relative flex items-start">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10"
                  style={{ backgroundColor: currentStep >= 3 ? "#10B981" : "#9CA3AF" }}
                >
                  <ClipboardCheck className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                      Written Individualized Assessment
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {savedAssessment ? new Date(savedAssessment.sentAt).toLocaleDateString() : currentStep >= 3 ? "Completed" : "Pending"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Individual assessment conducted and documented
                  </p>

                  {/* Sub-items for Assessment */}
                  {currentStep >= 3 && (
                    <div className="ml-4 mt-3 space-y-2">
                      {/* Candidate Response Received */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: candidateProfile ? "#10B981" : "#9CA3AF" }}
                          ></div>
                          <p className="text-xs font-medium text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                            Candidate Response
                          </p>
                        </div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {candidateProfile ? "Received" : "Pending"}
                        </p>
                      </div>

                      {/* Decision */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: currentStep >= 4 ? "#10B981" : "#9CA3AF" }}
                          ></div>
                          <p className="text-xs font-medium text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                            Decision
                          </p>
                        </div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {savedAssessment && savedAssessment.decision === "rescind" ? "Decision: Pre-Adverse Action" : currentStep >= 4 ? "Completed" : "Pending"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Preliminary Job Offer Revocation */}
              <div className="relative flex items-start">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10"
                  style={{
                    backgroundColor: savedHireDecision ? "#10B981" : savedRevocationNotice ? "#F59E0B" : currentStep >= 4 ? "#F59E0B" : "#9CA3AF",
                  }}
                >
                  {savedHireDecision ? (
                    <UserCheck className="h-5 w-5 text-white" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {savedHireDecision ? "Preliminary Decision" : "Preliminary Revocation"}
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {savedHireDecision
                        ? new Date(savedHireDecision.sentAt).toLocaleDateString()
                        : savedRevocationNotice
                        ? new Date(savedRevocationNotice.sentAt).toLocaleDateString()
                        : currentStep >= 4
                        ? "In Progress"
                        : "Not reached"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {savedHireDecision
                      ? "Decision made to proceed with hire"
                      : savedRevocationNotice
                      ? "Preliminary job offer revocation notice sent"
                      : "Preliminary job offer revocation notice"}
                  </p>

                  {/* Sub-items for Preliminary Revocation */}
                  {(currentStep >= 4 || savedRevocationNotice || savedHireDecision || savedPreliminaryDecision) && (
                    <div className="ml-4 mt-3 space-y-2">
                      {/* 6a. Candidate Response Received */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: "#9CA3AF" }}></div>
                          <p className="text-xs font-medium text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                            Candidate Response
                          </p>
                        </div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {savedHireDecision ? "Not Required - Hired" : "Pending"}
                        </p>
                      </div>

                      {/* 6b. Decision */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: savedHireDecision || savedPreliminaryDecision ? "#10B981" : "#9CA3AF" }}
                          ></div>
                          <p className="text-xs font-medium text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                            Decision
                          </p>
                        </div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {savedHireDecision
                            ? "Decision: Hired"
                            : savedPreliminaryDecision
                            ? "Decision: Pre-Adverse Action"
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 7. Individual Reassessment */}
              <div className="relative flex items-start">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10"
                  style={{ backgroundColor: savedReassessment ? "#8B5CF6" : "#9CA3AF" }}
                >
                  <RotateCcw className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                      Individual Reassessment
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {savedReassessment ? new Date(savedReassessment.sentAt).toLocaleDateString() : "Not sent"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Individual reassessment conducted
                  </p>

                  {/* Sub-items for Reassessment */}
                  {savedReassessment && (
                    <div className="ml-4 mt-3 space-y-2">
                      {/* 7a. Candidate Response Received */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: "#9CA3AF" }}></div>
                          <p className="text-xs font-medium text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                            Candidate Response
                          </p>
                        </div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                          Pending
                        </p>
                      </div>

                      {/* 7b. Decision */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: savedReassessment && savedReassessment.decision ? "#10B981" : "#9CA3AF" }}
                          ></div>
                          <p className="text-xs font-medium text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                            Decision
                          </p>
                        </div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {savedReassessment && savedReassessment.decision === "extend"
                            ? "Decision: Hired"
                            : savedReassessment && savedReassessment.decision === "rescind"
                            ? "Decision: Adverse Action"
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 8. Final Revocation Notice */}
              <div className="relative flex items-start">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10"
                  style={{
                    backgroundColor: savedHireDecision && currentStep === 5 ? "#10B981" : savedFinalRevocationNotice ? "#DC2626" : "#9CA3AF",
                  }}
                >
                  {savedHireDecision && currentStep === 5 ? (
                    <UserCheck className="h-5 w-5 text-white" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {savedHireDecision && currentStep === 5 ? "Final Decision" : "Final Revocation Notice"}
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {savedHireDecision && currentStep === 5
                        ? new Date(savedHireDecision.sentAt).toLocaleDateString()
                        : savedFinalRevocationNotice
                        ? new Date(savedFinalRevocationNotice.sentAt).toLocaleDateString()
                        : "Not sent"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {savedHireDecision && currentStep === 5
                      ? "Final decision made to extend offer of employment"
                      : "Final job offer revocation notice"}
                  </p>

                  {/* Sub-items for Final Revocation */}
                  {(savedFinalRevocationNotice || (savedHireDecision && currentStep === 5)) && (
                    <div className="ml-4 mt-3 space-y-2">
                      {/* 8a. Candidate Response Received */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: "#9CA3AF" }}></div>
                          <p className="text-xs font-medium text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                            Candidate Response
                          </p>
                        </div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {savedHireDecision && currentStep === 5 ? "Not Required - Hired" : "Pending"}
                        </p>
                      </div>

                      {/* 8b. Decision */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: (savedHireDecision && currentStep === 5) || savedFinalRevocationNotice ? "#10B981" : "#9CA3AF" }}
                          ></div>
                          <p className="text-xs font-medium text-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                            Decision
                          </p>
                        </div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {savedHireDecision && currentStep === 5
                            ? "Decision: Hired"
                            : savedFinalRevocationNotice
                            ? "Decision: Adverse Action"
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="border border-gray-200 rounded-xl p-4 mt-8" style={{ backgroundColor: "#F9FAFB" }}>
            <h4
              className="text-sm font-semibold mb-3"
              style={{ fontFamily: "Poppins, sans-serif", color: "#000000" }}
            >
              Process Status
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                  Time Remaining
                </span>
                <span className="text-xs font-medium" style={{ fontFamily: "Poppins, sans-serif", color: "#E54747" }}>
                  5 days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
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
                <span className="text-xs" style={{ fontFamily: "Poppins, sans-serif", color: "#595959" }}>
                  Assessment Progress
                </span>
                <span className="text-xs font-medium" style={{ fontFamily: "Poppins, sans-serif", color: "#10B981" }}>
                  Step {currentStep} of {progressSteps.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200" style={{ backgroundColor: "#FFFFFF" }}>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:opacity-90"
            style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#E54747", color: "#FFFFFF" }}
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelinePanel;
