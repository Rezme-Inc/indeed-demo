"use client";
// put comment here
import AssessmentProgressBar from "./components/layout/AssessmentProgressBar";

import { AssessmentProvider } from "@/context/AssessmentProvider";
import { useCandidateData } from "@/context/useCandidateData";
import { useDocumentUploads } from "@/context/useDocumentUploads";
import { DocumentRefreshProvider } from "@/context/DocumentRefreshContext";
import { useAssessmentStorage } from "@/hooks/useAssessmentStorage";
import { useCandidateDataFetchers } from "@/hooks/useCandidateDataFetchers";
import { useDocumentAvailability } from "@/hooks/useDocumentAvailability";
import { useDocumentHandlers } from "@/hooks/useDocumentHandlers";
import { useHRAdminProfile } from "@/hooks/useHRAdminProfile";
import { safeAssessmentTracking } from "@/lib/services/safeAssessmentTracking";
import { useEffect, useState } from "react";
import CandidateInfoBox from "./components/candidate/CandidateInfoBox";
import CandidateResponseModal from "./components/candidate/CandidateResponseModal";
import FairChanceOverviewBox from "./components/candidate/FairChanceOverviewBox";
import OrdinanceSummary from "./components/common/OrdinanceSummary";
import DocumentUploadPanel from "./components/documents/DocumentUploadPanel";
import DocumentViewer from "./components/documents/DocumentViewer";
import AssessmentHeader from "./components/layout/AssessmentHeader";
import Footer from "./components/layout/Footer";
import Step1 from "./components/steps/step1/Step1";
import OfferLetterViewModal from "./components/steps/step1/view/OfferLetterViewModal";
import Step2 from "./components/steps/step2/Step2";
import AssessmentViewModal from "./components/steps/step2/view/AssessmentViewModal";
import Step3 from "./components/steps/step3/Step3";
import RevocationNoticeViewModal from "./components/steps/step3/view/RevocationNoticeViewModal";
import ReassessmentViewModal from "./components/steps/step4/view/ReassessmentViewModal";
import FinalRevocationViewModal from "./components/steps/step5/view/FinalRevocationViewModal";
// TODO: Enable when tracking is implemented properly
// import { assessmentTracking } from "@/lib/services/assessmentTracking";

import { useSecureSession } from "@/hooks/useSecureSession";
import { supabase } from "@/lib/supabase";
import TimelinePanel from "./components/layout/TimelinePanel";
import Step4 from "./components/steps/step4/Step4";
import Step5 from "./components/steps/step5/Step5";
import Step6 from "./components/steps/step6/Step6";
import { AssessmentDatabaseService } from "@/lib/services/assessmentDatabase";

// Add interface for document data
interface AssessmentDocument {
  document_type: string;
  sent_at: string | null;
  created_at: string;
}

/**
 * HR Admin Assessment Page with Form Persistence
 *
 * This component manages the criminal history assessment workflow for HR admins.
 * All forms filled out by HR admins are automatically saved to localStorage using
 * the candidate's user ID as a unique key. This ensures:
 *
 * 1. Forms remain accessible when HR admins return to continue assessments
 * 2. Assessment progress (answers, current step, notes) is preserved
 * 3. View buttons in the header show saved forms even after navigating away
 * 4. All compliance documentation is retained throughout the process
 *
 * Persisted Data:
 * - Offer Letter: `offerLetter_${candidateId}`
 * - Individual Assessment: `assessment_${candidateId}`
 * - Preliminary Revocation Notice: `revocationNotice_${candidateId}`
 * - Individualized Reassessment: `reassessment_${candidateId}`
 * - Final Revocation Notice: `finalRevocationNotice_${candidateId}`
 * - Assessment Progress: `assessmentAnswers_${candidateId}`, `assessmentCurrentStep_${candidateId}`, `assessmentNotes_${candidateId}`
 */

function AssessmentContent({ params }: { params: { userId: string } }) {
  // Enable secure session monitoring for HR admin
  useSecureSession();

  const [isLoading, setIsLoading] = useState(true);
  const {
    currentStep,
    setCurrentStep,
    answers,
    setAnswers,
    notes,
    setNotes,
    handleNext,
    handleBack,
    savedOfferLetter,
    setSavedOfferLetter,
    savedAssessment,
    setSavedAssessment,
    savedRevocationNotice,
    setSavedRevocationNotice,
    savedReassessment,
    setSavedReassessment,
    savedFinalRevocationNotice,
    setSavedFinalRevocationNotice,
    savedHireDecision,
    setSavedHireDecision,
    savedPreliminaryDecision,
    setSavedPreliminaryDecision,
    clearAssessmentProgress,
  } = useAssessmentStorage(params.userId);
  const [showCandidateResponseModal, setShowCandidateResponseModal] =
    useState(false);
  const [showOrdinanceSummary, setShowOrdinanceSummary] = useState(false);

  // Candidate Response Modal State
  const {
    candidateShareToken,
    setCandidateShareToken,
    candidateProfile,
    setCandidateProfile,
    timelineData,
    setTimelineData,
  } = useCandidateData();
  const [loadingCandidateData, setLoadingCandidateData] = useState(false);

  // Candidate data fetching helpers
  const { fetchCandidateShareToken, fetchTimelineData } =
    useCandidateDataFetchers(params.userId, setLoadingCandidateData);

  // Auto-fetch candidate data on component mount
  useEffect(() => {
    fetchCandidateShareToken();
  }, [fetchCandidateShareToken]);

  // Conditional Offer Letter State
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false);
  const [showAssessmentViewModal, setShowAssessmentViewModal] = useState(false);
  const [showRevocationViewModal, setShowRevocationViewModal] = useState(false);
  const [showReassessmentViewModal, setShowReassessmentViewModal] =
    useState(false);
  const [showFinalRevocationViewModal, setShowFinalRevocationViewModal] =
    useState(false);

  // HR Admin profile
  const { hrAdmin: hrAdminProfile, loading: headerLoading } =
    useHRAdminProfile();

  // Database-driven document availability (replaces localStorage-based saved document states)
  const documentAvailability = useDocumentAvailability(params.userId);

  // Assessment tracking state
  const [assessmentSessionId, setAssessmentSessionId] = useState<string | null>(
    null
  );
  const hrAdminId = hrAdminProfile?.id || null;
  const [trackingActive, setTrackingActive] = useState(false);

  // Document Upload Panel State
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
    viewingDocument,
    setViewingDocument,
    showDocumentViewer,
    setShowDocumentViewer,
    showDocumentsDropdown,
    setShowDocumentsDropdown,
  } = useDocumentUploads();

  // HR Action Timeline State
  const [showTimelinePanel, setShowTimelinePanel] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDocumentsDropdown && !target.closest(".documents-dropdown")) {
        setShowDocumentsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDocumentsDropdown]);

  // Saved forms persist automatically via useLocalStorageState

  // HR Admin profile is loaded via hook

  // Initialize assessment tracking session (non-blocking)
  useEffect(() => {
    async function initializeTracking() {
      // Only initialize if we have both IDs
      if (!hrAdminId || !params.userId) {
        console.log("[Assessment Tracking] Waiting for IDs...");
        return;
      }

      console.log("[Assessment Tracking] Checking if tracking is available...");
      const isAvailable = await safeAssessmentTracking.isAvailable();

      if (!isAvailable) {
        console.log(
          "[Assessment Tracking] Not available - using localStorage only"
        );
        return;
      }

      console.log("[Assessment Tracking] Available! Initializing session...");
      const sessionId = await safeAssessmentTracking.initializeSession(
        hrAdminId,
        params.userId
      );

      if (sessionId) {
        setAssessmentSessionId(sessionId);
        setTrackingActive(true);
        console.log("[Assessment Tracking] Session initialized:", sessionId);

        // Log page view
        await safeAssessmentTracking.logAction(
          hrAdminId,
          "assessment_page_viewed",
          { candidate_id: params.userId }
        );
      } else {
        console.log("[Assessment Tracking] Failed to initialize session");
      }
    }

    initializeTracking();
  }, [hrAdminId, params.userId]);

  // Initialize assessment database record (ensure assessment exists)
  useEffect(() => {
    async function initializeAssessmentDatabase() {
      if (!params.userId) {
        console.log("[Assessment DB] No candidate ID available");
        return;
      }

      try {
        console.log("[Assessment DB] Checking if assessment exists for candidate:", params.userId);

        // Check if assessment already exists
        const assessmentExists = await AssessmentDatabaseService.assessmentExists(params.userId);

        if (!assessmentExists) {
          console.log("[Assessment DB] Assessment doesn't exist, creating new assessment record...");
          const success = await AssessmentDatabaseService.initializeAssessment(params.userId);

          if (success) {
            console.log("[Assessment DB] Assessment initialized successfully");
          } else {
            console.error("[Assessment DB] Failed to initialize assessment");
          }
        } else {
          console.log("[Assessment DB] Assessment already exists");
        }
      } catch (error) {
        console.error("[Assessment DB] Error during assessment initialization:", error);
      }
    }

    initializeAssessmentDatabase();
  }, [params.userId]);

  // Load timeline data on mount
  useEffect(() => {
    fetchTimelineData().then((data) => {
      setTimelineData(data);
    });
    setIsLoading(false);
  }, [params.userId]);

  const progressSteps = [
    "Conditional Job Offers",
    "Written Individualized Assessment",
    "Preliminary Job Offer Revocation",
    "Individual Reassessment",
    "Final Revocation Notice",
  ];

  // utility functions are imported from @/lib/dateUtils

  const handleViewCandidateResponse = () => {
    setShowCandidateResponseModal(true);
    fetchCandidateShareToken();
  };

  const handleViewOrdinanceSummary = () => {
    setShowOrdinanceSummary(true);
  };

  const handleViewOfferLetter = () => {
    setShowOfferLetterModal(true);
  };

  // Document Upload Handlers

  const { viewDocument, downloadDocument, getFilePreviewUrl } =
    useDocumentHandlers();

  // Modify your render logic to handle loading state
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-white"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white py-12"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Sleek Sticky Header */}
      <AssessmentHeader
        documentAvailability={documentAvailability}
        trackingActive={trackingActive}
        hrAdminProfile={hrAdminProfile}
        headerLoading={headerLoading}
        handleViewDocument={viewDocument}
        setShowAssessmentViewModal={setShowAssessmentViewModal}
        setShowRevocationViewModal={setShowRevocationViewModal}
        setShowReassessmentViewModal={setShowReassessmentViewModal}
        setShowFinalRevocationViewModal={setShowFinalRevocationViewModal}
        setShowTimelinePanel={setShowTimelinePanel}
      />
      {process.env.NODE_ENV === "development" && assessmentSessionId && (
        <div className="px-8 mt-2 flex justify-end">
          <button
            onClick={async () => {
              console.log("=== ASSESSMENT DEBUG INFO ===");
              console.log("Session ID:", assessmentSessionId);
              console.log("HR Admin ID:", hrAdminId);
              console.log("Candidate ID:", params.userId);
              console.log("Current Answers:", answers);
              console.log("Current Step:", currentStep);
              console.log("Notes:", notes);
              console.log("Tracking Active:", trackingActive);

              const { data: sessionData } = await supabase
                .from("assessment_sessions")
                .select("*")
                .eq("id", assessmentSessionId)
                .single();

              const { data: stepsData } = await supabase
                .from("assessment_steps")
                .select("*")
                .eq("session_id", assessmentSessionId)
                .order("step_number", { ascending: true });

              const { data: documentsData } = await supabase
                .from("assessment_documents")
                .select("*")
                .eq("session_id", assessmentSessionId)
                .order("created_at", { ascending: true });

              const { data: auditLogData } = await supabase
                .from("assessment_audit_log")
                .select("*")
                .eq("session_id", assessmentSessionId)
                .order("created_at", { ascending: false })
                .limit(20);

              console.log("=== DATABASE DATA ===");
              console.log("Session:", sessionData);
              console.log(`Steps (${stepsData?.length || 0}):`, stepsData);
              console.log(
                `Documents (${documentsData?.length || 0}):`,
                documentsData
              );
              console.log(`Audit Log (last 20):`, auditLogData);

              if (documentsData && documentsData.length > 0) {
                console.log("=== DOCUMENT SUMMARY ===");
                documentsData.forEach((doc: AssessmentDocument) => {
                  console.log(
                    `- ${doc.document_type}: ${doc.sent_at ? "SENT" : "DRAFT"} (Created: ${new Date(doc.created_at).toLocaleString()})`,
                  );
                });
              }

              console.log("=== LOCALSTORAGE DATA ===");
              console.log(
                "Saved Offer Letter:",
                savedOfferLetter ? "YES" : "NO"
              );
              console.log("Saved Assessment:", savedAssessment ? "YES" : "NO");
              console.log(
                "Saved Revocation:",
                savedRevocationNotice ? "YES" : "NO"
              );
              console.log(
                "Saved Reassessment:",
                savedReassessment ? "YES" : "NO"
              );
              console.log(
                "Saved Final Revocation:",
                savedFinalRevocationNotice ? "YES" : "NO"
              );
            }}
            className="ml-2 px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Debug DB
          </button>
        </div>
      )}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Left Column: Assessment Progress */}
          <div className="lg:col-span-1 lg:-ml-16">
            {/* View Candidate Response Button */}
            <CandidateInfoBox
              onViewCandidateResponse={handleViewCandidateResponse}
            />

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <h2
                className="text-xl font-bold mb-6 text-black"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Assessment Progress
              </h2>
              <AssessmentProgressBar
                progressSteps={progressSteps}
                currentStep={currentStep}
              />
            </div>

            {/* San Diego Fair Chance Ordinance Legal Overview Card */}
            <FairChanceOverviewBox onViewSummary={handleViewOrdinanceSummary} />
          </div>
          {/* Right Column: Main Content */}
          <div className="lg:col-span-5 space-y-8">
            {/* Main Question Card Placeholder */}
            <DocumentRefreshProvider refreshDocuments={documentAvailability.refresh}>
              {currentStep === 1 && <Step1 />}
              {currentStep === 2 && <Step2 />}
              {currentStep === 3 && <Step3 />}
              {currentStep === 4 && <Step4 />}
              {currentStep === 5 && <Step5 />}
              {currentStep === 6 && (
                <Step6
                  onViewCandidateResponse={handleViewCandidateResponse}
                  currentStep={currentStep}
                />
              )}
            </DocumentRefreshProvider>
          </div>
        </div>
      </div>

      <Footer />

      <CandidateResponseModal
        open={showCandidateResponseModal}
        onClose={() => setShowCandidateResponseModal(false)}
        candidateShareToken={candidateShareToken}
        candidateProfile={candidateProfile}
        loading={loadingCandidateData}
      />

      <OfferLetterViewModal
        open={showOfferLetterModal}
        candidateId={params.userId}
        onClose={() => setShowOfferLetterModal(false)}
      />

      <AssessmentViewModal
        open={showAssessmentViewModal}
        candidateId={params.userId}
        onClose={() => setShowAssessmentViewModal(false)}
      />

      <RevocationNoticeViewModal
        open={showRevocationViewModal}
        candidateId={params.userId}
        onClose={() => setShowRevocationViewModal(false)}
      />

      <ReassessmentViewModal
        open={showReassessmentViewModal}
        candidateId={params.userId}
        onClose={() => setShowReassessmentViewModal(false)}
      />

      <FinalRevocationViewModal
        open={showFinalRevocationViewModal}
        candidateId={params.userId}
        onClose={() => setShowFinalRevocationViewModal(false)}
      />

      <OrdinanceSummary
        open={showOrdinanceSummary}
        onClose={() => setShowOrdinanceSummary(false)}
      />

      <DocumentUploadPanel
        progressSteps={progressSteps}
        currentStep={currentStep}
        onView={viewDocument}
        onDownload={downloadDocument}
      />
      <DocumentViewer />

      {showTimelinePanel && (
        <TimelinePanel
          timelineData={timelineData}
          documents={{
            backgroundCheckFile,
            jobDescriptionFile,
            jobPostingFile,
            emailsFile,
            notesFile,
            companyPolicyFile,
          }}
          progressSteps={progressSteps}
          currentStep={currentStep}
          savedOfferLetter={savedOfferLetter}
          savedAssessment={savedAssessment}
          savedRevocationNotice={savedRevocationNotice}
          savedHireDecision={savedHireDecision}
          savedPreliminaryDecision={savedPreliminaryDecision}
          savedReassessment={savedReassessment}
          savedFinalRevocationNotice={savedFinalRevocationNotice}
          candidateProfile={candidateProfile}
          onClose={() => setShowTimelinePanel(false)}
          onViewDocument={viewDocument}
        />
      )}
    </div>
  );
}

export default function AssessmentPage({
  params,
}: {
  params: { userId: string };
}) {
  return (
    <AssessmentProvider candidateId={params.userId}>
      <AssessmentContent params={params} />
    </AssessmentProvider>
  );
}
