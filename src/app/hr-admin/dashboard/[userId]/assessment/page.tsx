"use client";
// put comment here
import AssessmentProgressBar from "@/app/hr-admin/dashboard/[userId]/assessment/components/AssessmentProgressBar";
import {
  getCandidateEmail,
  sendAssessmentEmail,
  sendFinalRevocationEmail,
  sendOfferLetterEmail,
  sendReassessmentEmail,
  sendRevocationEmail,
} from "@/app/restorative-record/utils/sendEmail";
import { safeAssessmentTracking } from "@/lib/services/safeAssessmentTracking";
import { supabase } from "@/lib/supabase";
import { useHRAdminProfile } from '@/hooks/useHRAdminProfile';
import {
  AlertCircle,
  AlertTriangle,
  Briefcase,
  Building,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  History,
  Info,
  Mail,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AssessmentProvider } from "@/context/AssessmentProvider";
import { useAssessmentStorage } from "@/hooks/useAssessmentStorage";
import { useAssessmentForms } from "@/context/useAssessmentForms";
import { useCandidateData } from "@/context/useCandidateData";
import { useDocumentUploads } from "@/context/useDocumentUploads";
import { useAssessmentMutators } from "@/hooks/useAssessmentMutators";
import { useDocumentHandlers } from "@/hooks/useDocumentHandlers";
import { useCandidateDataFetchers } from "@/hooks/useCandidateDataFetchers";
import ConditionalJobOfferLetter from "./components/ConditionalJobOfferLetter";
import CriticalInfoTabs from "./components/CriticalInfoTabs";
import CriticalInfoSection from "./components/CriticalInfoSection";
import DocumentMetadata from "./components/DocumentMetadata";
import FinalRevocationModal from "./components/FinalRevocationModal";
import IndividualizedAssessmentModal from "./components/IndividualizedAssessmentModal";
import PreliminaryRevocationModal from "./components/PreliminaryRevocationModal";
import PrintPreviewButton from "./components/PrintButton";
import CandidateResponseModal from "./components/CandidateResponseModal";
import DocumentUploadPanel from "./components/DocumentUploadPanel";
import DocumentViewer from "./components/DocumentViewer";
import CandidateInfoBox from "./components/CandidateInfoBox";
import FairChanceOverviewBox from "./components/FairChanceOverviewBox";
import AssessmentHeader from "./components/AssessmentHeader";
import ExtendSuccessModal from "./components/ExtendSuccessModal";
import FinalRevocationSuccessModal from "./components/FinalRevocationSuccessModal";
import Footer from "./components/Footer";
import OfferLetterViewModal from "./components/view/OfferLetterViewModal";
import AssessmentViewModal from "./components/view/AssessmentViewModal";
import RevocationNoticeViewModal from "./components/view/RevocationNoticeViewModal";
import ReassessmentViewModal from "./components/view/ReassessmentViewModal";
import FinalRevocationViewModal from "./components/view/FinalRevocationViewModal";
import Step1 from "./components/steps/Step1";
import Step2 from "./components/steps/Step2";
import Step3 from "./components/steps/Step3";
// TODO: Enable when tracking is implemented properly
// import { assessmentTracking } from "@/lib/services/assessmentTracking";

import Step4 from "./components/steps/Step4";
import Step5 from "./components/steps/Step5";
import TimelinePanel from "./components/TimelinePanel";
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


function AssessmentContent({
  params,
}: {
  params: { userId: string };
}) {
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
  const {
    offerForm,
    setOfferForm,
    showOfferModal,
    setShowOfferModal,
    showAssessmentModal,
    setShowAssessmentModal,
    assessmentForm,
    setAssessmentForm,
    assessmentPreview,
    setAssessmentPreview,
    showRevocationModal,
    setShowRevocationModal,
    revocationForm,
    setRevocationForm,
    revocationPreview,
    setRevocationPreview,
    showReassessmentModal,
    setShowReassessmentModal,
    reassessmentForm,
    setReassessmentForm,
    reassessmentPreview,
    setReassessmentPreview,
    showFinalRevocationModal,
    setShowFinalRevocationModal,
    finalRevocationForm,
    setFinalRevocationForm,
    finalRevocationPreview,
    setFinalRevocationPreview,
  } = useAssessmentForms();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [revocationSentDate, setRevocationSentDate] = useState<Date | null>(
    null
  );
  const [showReassessmentSplit, setShowReassessmentSplit] = useState(false);
  const [showReassessmentInfoModal, setShowReassessmentInfoModal] =
    useState(false);
  const [initialAssessmentResults, setInitialAssessmentResults] =
    useState<any>(null);
  const [reassessmentDecision, setReassessmentDecision] = useState<
    "rescind" | "extend"
  >("rescind");
  const [extendReason, setExtendReason] = useState(
    "BASED ON THE FACTORS ABOVE, WE ARE EXTENDING OUR OFFER OF EMPLOYMENT."
  );
  const [showExtendSuccessModal, setShowExtendSuccessModal] = useState(false);
  const [showFinalRevocationSuccessModal, setShowFinalRevocationSuccessModal] =
    useState(false);
  const [showCandidateResponseModal, setShowCandidateResponseModal] =
    useState(false);

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

  // Conditional Offer Letter State
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false);
  const [showAssessmentViewModal, setShowAssessmentViewModal] = useState(false);
  const [showRevocationViewModal, setShowRevocationViewModal] = useState(false);
  const [showReassessmentViewModal, setShowReassessmentViewModal] =
    useState(false);
  const [showFinalRevocationViewModal, setShowFinalRevocationViewModal] =
    useState(false);



  // Critical Information Tab State
  const [activeTab, setActiveTab] = useState("Legal");

  // HR Admin profile
  const {
    hrAdmin: hrAdminProfile,
    loading: headerLoading,
  } = useHRAdminProfile();

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

  const [businessDaysRemaining, setBusinessDaysRemaining] = useState<number>(
    () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("businessDaysRemaining");
        return stored ? parseInt(stored, 10) : 0;
      }
      return 0;
    }
  );

  const handleBusinessDaysSet = (days: number) => {
    setBusinessDaysRemaining(days);
    localStorage.setItem("businessDaysRemaining", days.toString());
  };

  // Add useEffect to clear localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem("businessDaysRemaining");
    };
  }, []);


  const handleAnswer = (questionId: string, answer: string) => {
    // Update state immediately for UI responsiveness
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Save to database in parallel (non-blocking)
    if (trackingActive && assessmentSessionId) {
      console.log("[Assessment Tracking] Saving answer:", {
        questionId,
        answer,
      });

      // Fire and forget - don't await to keep UI responsive
      safeAssessmentTracking
        .saveStep(assessmentSessionId, currentStep, questionId, answer, notes)
        .then((success) => {
          if (success) {
            console.log("[Assessment Tracking] Answer saved to database");
          }
        });

      // Log the action
      safeAssessmentTracking.logAction(hrAdminId, "question_answered", {
        question_id: questionId,
        answer,
        step: currentStep,
      });
    }
  };


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

  // Load timeline data on mount
  useEffect(() => {
    fetchTimelineData().then((data) => {
      setTimelineData(data);
    });
    setIsLoading(false);
  }, [params.userId]);

  const handleNextConditionalOffer = () => {
    if (answers.conditional_offer === "No") {
      setShowOfferModal(true);
    } else {
      // "Yes" was selected - acknowledge external conditional job offer was sent
      const externalOfferData = {
        sentAt: new Date().toISOString(),
        candidateId: params.userId,
        hrAdminName: hrAdminProfile
          ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
          : "",
        company: hrAdminProfile?.company || "",
        sentExternally: true, // Flag to indicate this was sent outside the system
        timestamp: Date.now(),
      };

      // Save the external offer record for timeline tracking
      setSavedOfferLetter(externalOfferData);

      // Proceed to next step
      handleNext();
    }
  };

  const handleFieldEdit = (field: string) => setEditingField(field);
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfferForm({ ...offerForm, [e.target.name]: e.target.value });
  };
  const handleFieldBlur = () => setEditingField(null);
  const handleFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setEditingField(null);
  };

  const allFieldsFilled = !!(
    offerForm.date &&
    offerForm.applicant &&
    offerForm.position &&
    offerForm.employer
  );


  const progressSteps = [
    "Conditional Job Offers",
    "Written Individualized Assessment",
    "Preliminary Job Offer Revocation",
    "Individual Reassessment",
    "Final Revocation Notice",
  ];

  const handleSendOffer = async () => {
    // Save the offer letter data with timestamp
    const offerLetterData = {
      ...offerForm,
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      company: hrAdminProfile?.company || "",
      timestamp: Date.now(),
    };

    try {
      const candidateEmail = await getCandidateEmail(params.userId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      // Send the offer letter email
      const emailResult = await sendOfferLetterEmail(
        offerLetterData,
        candidateEmail
      );

      if (!emailResult.success) {
        console.error("Failed to send offer letter email:", emailResult.error);
        // You might want to show an error message to the user here
      }

      setSavedOfferLetter(offerLetterData);

      // Save to database if tracking is active
      if (trackingActive && assessmentSessionId) {
        console.log("[Assessment Tracking] Saving offer letter...");

        const saved = await safeAssessmentTracking.saveDocument(
          assessmentSessionId,
          "offer_letter",
          offerLetterData,
          true // mark as sent
        );

        if (saved) {
          console.log("[Assessment Tracking] Offer letter saved to database");
          await safeAssessmentTracking.logAction(
            hrAdminId || "",
            "offer_letter_sent",
            {
              recipient_email: candidateEmail,
              position: offerLetterData.position,
              employer: offerLetterData.employer,
            }
          );
        }
      }

      setShowOfferModal(false);
      handleNext();
    } catch (error) {
      console.error("Error in handleSendOffer:", error);
    }
  };

  const handleAssessmentFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAssessmentForm({ ...assessmentForm, [e.target.name]: e.target.value });
  };
  const handleAssessmentArrayChange = (
    field: "duties" | "activities",
    idx: number,
    value: string
  ) => {
    setAssessmentForm({
      ...assessmentForm,
      [field]: assessmentForm[field].map((item: string, i: number) =>
        i === idx ? value : item
      ),
    });
  };
  const handleSendAssessment = async () => {
    // Save the assessment with metadata
    const assessmentData = {
      ...assessmentForm,
      decision: "rescind", // Always rescind since we're proceeding to revocation
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      companyName: hrAdminProfile?.company || "",
    };

    try {
      const candidateEmail = await getCandidateEmail(params.userId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      // Use the helper to send the assessment email
      await sendAssessmentEmail(assessmentData, candidateEmail);

      setSavedAssessment(assessmentData);

      // Save to database if tracking is active
      if (trackingActive && assessmentSessionId) {
        console.log("[Assessment Tracking] Saving individual assessment...");

        const saved = await safeAssessmentTracking.saveDocument(
          assessmentSessionId,
          "assessment",
          assessmentData,
          true
        );

        if (saved) {
          console.log(
            "[Assessment Tracking] Individual assessment saved to database"
          );
          await safeAssessmentTracking.logAction(
            hrAdminId || "",
            "assessment_sent",
            {
              recipient_email: candidateEmail,
              position: assessmentData.position,
              rescind_reason: assessmentData.rescindReason,
            }
          );
        }
      }

      setShowAssessmentModal(false);
      setAssessmentPreview(false);
      setInitialAssessmentResults({ ...assessmentForm });
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      console.error("Error in handleSendAssessment:", error);
    }
  };

  const handleRevocationFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRevocationForm({ ...revocationForm, [e.target.name]: e.target.value });
  };
  const handleRevocationArrayChange = (idx: number, value: string) => {
    setRevocationForm({
      ...revocationForm,
      convictions: revocationForm.convictions.map((item: string, i: number) =>
        i === idx ? value : item
      ),
    });
  };

  // utility functions are imported from @/lib/dateUtils

  // const businessDaysRemaining = revocationSentDate ? getBusinessDaysRemaining(revocationSentDate) : 5;

  const handleSendRevocation = async () => {
    // Save the revocation with metadata
    const revocationData = {
      ...revocationForm,
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      companyName: hrAdminProfile?.company || "",
    };

    try {
      const candidateEmail = await getCandidateEmail(params.userId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      await sendRevocationEmail(revocationData, candidateEmail);

      setSavedRevocationNotice(revocationData);

      // Save to database if tracking is active
      if (trackingActive && assessmentSessionId) {
        console.log("[Assessment Tracking] Saving revocation notice...");

        const saved = await safeAssessmentTracking.saveDocument(
          assessmentSessionId,
          "revocation_notice",
          revocationData,
          true
        );

        if (saved) {
          console.log(
            "[Assessment Tracking] Revocation notice saved to database"
          );
          await safeAssessmentTracking.logAction(
            hrAdminId || "",
            "revocation_notice_sent",
            {
              recipient_email: candidateEmail,
              business_days: revocationForm.numBusinessDays,
              convictions: revocationForm.convictions.filter((c) => c),
              position: revocationForm.position,
            }
          );
        }
      }

      setShowRevocationModal(false);
      setRevocationPreview(false);
      setRevocationSentDate(new Date());
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      console.error("Error in handleSendRevocation:", error);
    }
  };

  const handleProceedWithHire = async () => {
    // Create a decision record for the timeline
    const hireDecisionData = {
      decision: "hire",
      decisionType: "hired",
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      companyName: hrAdminProfile?.company || "",
    };

    // Save decision for timeline tracking
    setSavedHireDecision(hireDecisionData);

    // Update Supabase user_profiles.final_decision to 'Hired'
    try {
      await supabase
        .from("user_profiles")
        .update({ final_decision: "Hired" })
        .eq("id", params.userId);

      // Complete assessment session if tracking is active
      if (trackingActive && assessmentSessionId) {
        console.log("[Assessment Tracking] Marking candidate as hired...");

        await safeAssessmentTracking.completeSession(
          assessmentSessionId,
          "hired"
        );

        await safeAssessmentTracking.logAction(
          hrAdminId || "",
          "candidate_hired",
          {
            candidate_id: params.userId,
            step_when_hired: currentStep,
            timestamp: new Date().toISOString(),
          }
        );

        console.log(
          "[Assessment Tracking] Session completed - candidate hired"
        );
      }
    } catch (error) {
      console.error("Error updating final_decision in Supabase:", error);
    }
    setShowExtendSuccessModal(true);
    // You can add logic to finalize the hire here
  };

  const handleProceedWithReassessment = async () => {
    // Create a decision record for the timeline - choosing to proceed with adverse action/reassessment
    const reassessmentDecisionData = {
      decision: "reassessment",
      decisionType: "adverse_action",
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      companyName: hrAdminProfile?.company || "",
    };

    // Save decision for timeline tracking
    setSavedPreliminaryDecision(reassessmentDecisionData);

    // Continue with the reassessment flow
    setShowReassessmentInfoModal(true);
  };

  const handleReassessmentFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setReassessmentForm({
      ...reassessmentForm,
      [e.target.name]: e.target.value,
    });
  };
  const handleSendReassessment = async () => {
    // Save the reassessment with metadata
    const reassessmentData = {
      ...reassessmentForm,
      decision: reassessmentDecision, // Include the decision choice
      extendReason: extendReason, // Include extend reason if extending
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      companyName: hrAdminProfile?.company || "",
    };

    try {
      const candidateEmail = await getCandidateEmail(params.userId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      await sendReassessmentEmail(reassessmentData, candidateEmail);

      setSavedReassessment(reassessmentData);

      // Save to database if tracking is active
      if (trackingActive && assessmentSessionId) {
        console.log("[Assessment Tracking] Saving reassessment...");

        const saved = await safeAssessmentTracking.saveDocument(
          assessmentSessionId,
          "reassessment",
          reassessmentData,
          true
        );

        if (saved) {
          console.log("[Assessment Tracking] Reassessment saved to database");
          await safeAssessmentTracking.logAction(
            hrAdminId || "",
            "reassessment_sent",
            {
              recipient_email: candidateEmail,
              decision: reassessmentDecision,
              position: reassessmentData.position,
              error_found: reassessmentData.errorYesNo === "Yes",
            }
          );
        }
      }

      setShowReassessmentInfoModal(false);
      setReassessmentPreview(false);
      setShowReassessmentSplit(false);
      setInitialAssessmentResults({ ...reassessmentForm });
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      console.error("Error in handleSendReassessment:", error);
    }
  };

  // Fetch candidate data when reassessment split is shown
  useEffect(() => {
    if (
      showReassessmentSplit &&
      !candidateShareToken &&
      !loadingCandidateData
    ) {
      fetchCandidateShareToken();
    }
  }, [showReassessmentSplit]);

  const handleFinalRevocationFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === "checkbox") {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setFinalRevocationForm((prev: any) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };
  const handleFinalRevocationArrayChange = (
    field: "convictions" | "jobDuties",
    idx: number,
    value: string
  ) => {
    setFinalRevocationForm((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) =>
        i === idx ? value : item
      ),
    }));
  };

  const router = useRouter();

  const handleSendFinalRevocation = async () => {
    // Save the final revocation with metadata
    const finalRevocationData = {
      ...finalRevocationForm,
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile
        ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}`
        : "",
      companyName: hrAdminProfile?.company || "",
    };

    try {
      const candidateEmail = await getCandidateEmail(params.userId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      await sendFinalRevocationEmail(finalRevocationData, candidateEmail);

      setSavedFinalRevocationNotice(finalRevocationData);

      // Save to database if tracking is active
      if (trackingActive && assessmentSessionId) {
        console.log("[Assessment Tracking] Saving final revocation notice...");

        const saved = await safeAssessmentTracking.saveDocument(
          assessmentSessionId,
          "final_revocation",
          finalRevocationData,
          true
        );

        if (saved) {
          console.log(
            "[Assessment Tracking] Final revocation saved to database"
          );

          // Complete the session as "revoked"
          await safeAssessmentTracking.completeSession(
            assessmentSessionId,
            "revoked"
          );

          await safeAssessmentTracking.logAction(
            hrAdminId || "",
            "final_revocation_sent",
            {
              recipient_email: candidateEmail,
              position: finalRevocationData.position,
              no_response: finalRevocationData.noResponse,
              info_submitted: finalRevocationData.infoSubmitted,
            }
          );
        }
      }

      setShowFinalRevocationModal(false);
      setFinalRevocationPreview(false);
      setShowFinalRevocationSuccessModal(true);
      setCurrentStep((prev) => prev + 1);

      try {
        await supabase
          .from("user_profiles")
          .update({ final_decision: "Revoked" })
          .eq("id", params.userId);
      } catch (error) {
        console.error("Error updating final_decision in Supabase:", error);
      }
    } catch (error) {
      console.error("Error in handleSendFinalRevocation:", error);
    }
  };


  const handleViewCandidateResponse = () => {
    setShowCandidateResponseModal(true);
    fetchCandidateShareToken();
  };

  const handleViewOfferLetter = () => {
    setShowOfferLetterModal(true);
  };

  const { addDuty, addActivity, addConviction } = useAssessmentMutators(
    setAssessmentForm,
    setRevocationForm
  );

  // Document Upload Handlers

  const { viewDocument, downloadDocument, getFilePreviewUrl } =
    useDocumentHandlers();

  // Prevent background scroll when Conditional Job Offer Letter modal is open
  useEffect(() => {
    if (showOfferModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showOfferModal]);

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
        savedOfferLetter={savedOfferLetter}
        savedAssessment={savedAssessment}
        savedRevocationNotice={savedRevocationNotice}
        savedReassessment={savedReassessment}
        savedFinalRevocationNotice={savedFinalRevocationNotice}
        trackingActive={trackingActive}
        hrAdminProfile={hrAdminProfile}
        headerLoading={headerLoading}
        handleViewOfferLetter={handleViewOfferLetter}
        handleViewDocument={viewDocument}
        setShowAssessmentViewModal={setShowAssessmentViewModal}
        setShowRevocationViewModal={setShowRevocationViewModal}
        setShowReassessmentViewModal={setShowReassessmentViewModal}
        setShowFinalRevocationViewModal={setShowFinalRevocationViewModal}
        setShowTimelinePanel={setShowTimelinePanel}
      />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Left Column: Assessment Progress */}
          <div className="lg:col-span-1 lg:-ml-16">
          {/* View Candidate Response Button */}
          <CandidateInfoBox onViewCandidateResponse={handleViewCandidateResponse} />

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
          <FairChanceOverviewBox candidateId={params.userId} />
          </div>
          {/* Right Column: Main Content */}
          <div className="lg:col-span-5 space-y-8">
            {/* Main Question Card Placeholder */}
            {currentStep === 1 && (
              <Step1
                answers={answers}
                handleAnswer={handleAnswer}
                handleNextConditionalOffer={handleNextConditionalOffer}
                showOfferModal={showOfferModal}
                setShowOfferModal={setShowOfferModal}
                offerForm={offerForm}
                editingField={editingField}
                handleFieldEdit={handleFieldEdit}
                handleFieldChange={handleFieldChange}
                handleFieldBlur={handleFieldBlur}
                handleFieldKeyDown={handleFieldKeyDown}
                allFieldsFilled={allFieldsFilled}
                handleSendOffer={handleSendOffer}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                currentStep={currentStep}
              />
            )}
            {currentStep === 2 && (
              <Step2
                savedHireDecision={savedHireDecision}
                setShowAssessmentModal={setShowAssessmentModal}
                showAssessmentModal={showAssessmentModal}
                assessmentForm={assessmentForm}
                handleAssessmentFormChange={handleAssessmentFormChange}
                handleAssessmentArrayChange={handleAssessmentArrayChange}
                assessmentPreview={assessmentPreview}
                setAssessmentPreview={setAssessmentPreview}
                handleSendAssessment={handleSendAssessment}
                onAddDuty={addDuty}
                onAddActivity={addActivity}
                handleProceedWithHire={handleProceedWithHire}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                currentStep={currentStep}
              />
            )}
            {currentStep === 3 && (
              <Step3
                savedHireDecision={savedHireDecision}
                setShowRevocationModal={setShowRevocationModal}
                showRevocationModal={showRevocationModal}
                revocationForm={revocationForm}
                handleRevocationFormChange={handleRevocationFormChange}
                handleRevocationArrayChange={handleRevocationArrayChange}
                revocationPreview={revocationPreview}
                setRevocationPreview={setRevocationPreview}
                handleSendRevocation={handleSendRevocation}
                onBusinessDaysSet={handleBusinessDaysSet}
                onAddConviction={addConviction}
                handleProceedWithHire={handleProceedWithHire}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                currentStep={currentStep}
              />
            )}
            {currentStep === 4 && (
              <Step4
                savedHireDecision={savedHireDecision}
                showReassessmentSplit={showReassessmentSplit}
                businessDaysRemaining={businessDaysRemaining}
                handleProceedWithHire={handleProceedWithHire}
                handleProceedWithReassessment={handleProceedWithReassessment}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                currentStep={currentStep}
                showReassessmentInfoModal={showReassessmentInfoModal}
                setShowReassessmentInfoModal={setShowReassessmentInfoModal}
                setShowReassessmentSplit={setShowReassessmentSplit}
                initialAssessmentResults={initialAssessmentResults}
                reassessmentForm={reassessmentForm}
                handleReassessmentFormChange={handleReassessmentFormChange}
                reassessmentPreview={reassessmentPreview}
                setReassessmentPreview={setReassessmentPreview}
                handleSendReassessment={handleSendReassessment}
                reassessmentDecision={reassessmentDecision}
                setReassessmentDecision={setReassessmentDecision}
                extendReason={extendReason}
                setExtendReason={setExtendReason}
                candidateShareToken={candidateShareToken}
                candidateProfile={candidateProfile}
                loadingCandidateData={loadingCandidateData}
              />
            )}
            {currentStep === 5 && (
              <Step5
                savedHireDecision={savedHireDecision}
                handleProceedWithHire={handleProceedWithHire}
                showFinalRevocationModal={showFinalRevocationModal}
                setShowFinalRevocationModal={setShowFinalRevocationModal}
                finalRevocationForm={finalRevocationForm}
                handleFinalRevocationFormChange={handleFinalRevocationFormChange}
                handleFinalRevocationArrayChange={handleFinalRevocationArrayChange}
                finalRevocationPreview={finalRevocationPreview}
                setFinalRevocationPreview={setFinalRevocationPreview}
                handleSendFinalRevocation={handleSendFinalRevocation}
                setFinalRevocationForm={setFinalRevocationForm}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                currentStep={currentStep}
              />
            )}
            {currentStep === 6 && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                  <div className="w-full text-center">
                    <div className="rounded-full bg-green-50 p-6 mb-6 mx-auto w-fit border border-green-100">
                      <svg
                        className="h-16 w-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        style={{ color: "#10B981" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h2
                      className="text-3xl font-bold mb-4 text-black"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Assessment Complete
                    </h2>
                    <p
                      className="text-lg mb-8"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        color: "#595959",
                      }}
                    >
                      All assessment steps have been completed successfully. The
                      fair chance hiring process is now complete for this
                      candidate.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                        onClick={() =>
                          (window.location.href = "/hr-admin/dashboard")
                        }
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        Return to Dashboard
                      </button>
                      <button
                        className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
                        onClick={handleViewCandidateResponse}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          backgroundColor: "#E54747",
                        }}
                      >
                        View Final Records
                      </button>
                    </div>
                  </div>
                </div>

                {/* Critical Information Section */}
                <CriticalInfoSection
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  currentStep={currentStep}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <ExtendSuccessModal
        open={showExtendSuccessModal}
        onClose={() => setShowExtendSuccessModal(false)}
        onReturn={() => {
          setShowExtendSuccessModal(false);
          setShowReassessmentSplit(false);
          setReassessmentPreview(false);
          router.push("/hr-admin/dashboard");
        }}
      />
      <FinalRevocationSuccessModal
        open={showFinalRevocationSuccessModal}
        onClose={() => setShowFinalRevocationSuccessModal(false)}
        onReturn={() => {
          setShowFinalRevocationSuccessModal(false);
          router.push("/hr-admin/dashboard");
        }}
      />

      <CandidateResponseModal
        open={showCandidateResponseModal}
        onClose={() => setShowCandidateResponseModal(false)}
        candidateShareToken={candidateShareToken}
        candidateProfile={candidateProfile}
        loading={loadingCandidateData}
      />

      <OfferLetterViewModal
        open={showOfferLetterModal}
        offerLetter={savedOfferLetter}
        onClose={() => setShowOfferLetterModal(false)}
      />

      <AssessmentViewModal
        open={showAssessmentViewModal}
        assessment={savedAssessment}
        onClose={() => setShowAssessmentViewModal(false)}
      />

      <RevocationNoticeViewModal
        open={showRevocationViewModal}
        notice={savedRevocationNotice}
        onClose={() => setShowRevocationViewModal(false)}
      />

      <ReassessmentViewModal
        open={showReassessmentViewModal}
        reassessment={savedReassessment}
        onClose={() => setShowReassessmentViewModal(false)}
      />

      <FinalRevocationViewModal
        open={showFinalRevocationViewModal}
        notice={savedFinalRevocationNotice}
        onClose={() => setShowFinalRevocationViewModal(false)}
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
