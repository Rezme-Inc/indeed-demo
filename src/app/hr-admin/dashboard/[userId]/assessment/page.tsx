"use client";
// put comment here
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
  FileText,
  ClipboardCheck,
  RotateCcw,
  AlertTriangle,
  User,
  Scale,
  Building,
  UserCheck,
  Printer,
  Mail,
  StickyNote,
  Briefcase,
  Clock,
  History,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase";
import { sendOfferLetterEmail } from '@/app/restorative-record/utils/sendEmail';
import AssessmentProgressBar from "@/app/hr-admin/dashboard/[userId]/assessment/components/AssessmentProgressBar";
import ConditionalJobOfferLetter from "./components/ConditionalJobOfferLetter";
import IndividualizedAssessmentModal from "./components/IndividualizedAssessmentModal";
import PreliminaryRevocationModal from './components/PreliminaryRevocationModal';
import PrintPreviewButton from './components/PrintButton';
import { sendAssessmentEmail, getCandidateEmail, sendRevocationEmail, sendReassessmentEmail, sendFinalRevocationEmail } from '@/app/restorative-record/utils/sendEmail';
import FinalRevocationModal from './components/FinalRevocationModal';
import CriticalInfoTabs from './components/CriticalInfoTabs';

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

interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  dependsOn?: {
    id: string;
    value: string;
  };
  context?: string;
  guidelines?: string[];
  helpText?: string;
  warning?: string;
}

export default function AssessmentPage({
  params,
}: {
  params: { userId: string };
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({
    date: "",
    applicant: "",
    position: "",
    employer: "",
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    employer: '',
    applicant: '',
    position: '',
    offerDate: '',
    assessmentDate: '',
    reportDate: '',
    performedBy: '',
    duties: ['', '', '', ''],
    conduct: '',
    howLongAgo: '',
    activities: ['', '', ''],
    rescindReason: '',
  });
  const [assessmentPreview, setAssessmentPreview] = useState(false);
  const [showRevocationModal, setShowRevocationModal] = useState(false);
  const [revocationForm, setRevocationForm] = useState({
    date: '',
    applicant: '',
    position: '',
    convictions: ['', '', ''],
    numBusinessDays: '',
    contactName: '',
    companyName: '',
    address: '',
    phone: '',
    seriousReason: '',
    timeSinceConduct: '',
    timeSinceSentence: '',
    jobDuties: '',
    fitnessReason: '',
  });
  const [revocationPreview, setRevocationPreview] = useState(false);
  const [revocationSentDate, setRevocationSentDate] = useState<Date | null>(null);
  const [showReassessmentSplit, setShowReassessmentSplit] = useState(false);
  const [showReassessmentInfoModal, setShowReassessmentInfoModal] = useState(false);
  const [reassessmentForm, setReassessmentForm] = useState({
    employer: '',
    applicant: '',
    position: '',
    offerDate: '',
    reassessmentDate: '',
    reportDate: '',
    performedBy: '',
    error: '',
    errorYesNo: 'No',
    workExperience: '',
    jobTraining: '',
    education: '',
    rehabPrograms: '',
    counseling: '',
    communityService: '',
    lettersOfSupport: '',
    religiousAttendance: '',
    rescindReason: '',
    evidenceA: '',
    evidenceB: '',
    evidenceC: '',
    evidenceD: '',
  });
  const [reassessmentPreview, setReassessmentPreview] = useState(false);
  const [initialAssessmentResults, setInitialAssessmentResults] = useState<any>(null);
  const [reassessmentDecision, setReassessmentDecision] = useState<'rescind' | 'extend'>('rescind');
  const [extendReason, setExtendReason] = useState('BASED ON THE FACTORS ABOVE, WE ARE EXTENDING OUR OFFER OF EMPLOYMENT.');
  const [showExtendSuccessModal, setShowExtendSuccessModal] = useState(false);
  const [showFinalRevocationModal, setShowFinalRevocationModal] = useState(false);
  const [finalRevocationForm, setFinalRevocationForm] = useState({
    date: '',
    applicant: '',
    dateOfNotice: '',
    noResponse: false,
    infoSubmitted: false,
    infoSubmittedList: '',
    errorOnReport: '',
    convictions: ['', '', ''],
    seriousReason: '',
    timeSinceConduct: '',
    timeSinceSentence: '',
    position: '',
    jobDuties: ['', '', '', ''],
    fitnessReason: '',
    reconsideration: '',
    reconsiderationProcedure: '',
    contactName: '',
    companyName: '',
    address: '',
    phone: '',
  });
  const [finalRevocationPreview, setFinalRevocationPreview] = useState(false);
  const [showFinalRevocationSuccessModal, setShowFinalRevocationSuccessModal] = useState(false);
  const [showCandidateResponseModal, setShowCandidateResponseModal] = useState(false);

  // Candidate Response Modal State
  const [candidateShareToken, setCandidateShareToken] = useState<string | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [loadingCandidateData, setLoadingCandidateData] = useState(false);

  // Conditional Offer Letter State
  const [savedOfferLetter, setSavedOfferLetter] = useState<any>(null);
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false);

  // Individual Assessment State
  const [savedAssessment, setSavedAssessment] = useState<any>(null);
  const [showAssessmentViewModal, setShowAssessmentViewModal] = useState(false);

  // Preliminary Revocation Notice State
  const [savedRevocationNotice, setSavedRevocationNotice] = useState<any>(null);
  const [showRevocationViewModal, setShowRevocationViewModal] = useState(false);

  // Individualized Reassessment State
  const [savedReassessment, setSavedReassessment] = useState<any>(null);
  const [showReassessmentViewModal, setShowReassessmentViewModal] = useState(false);

  // Final Revocation Notice State
  const [savedFinalRevocationNotice, setSavedFinalRevocationNotice] = useState<any>(null);
  const [showFinalRevocationViewModal, setShowFinalRevocationViewModal] = useState(false);

  // Hire Decision State
  const [savedHireDecision, setSavedHireDecision] = useState<any>(null);

  // Preliminary Decision State (for timeline tracking of preliminary revocation decisions)
  const [savedPreliminaryDecision, setSavedPreliminaryDecision] = useState<any>(null);

  // Timeline Data State
  const [timelineData, setTimelineData] = useState<{
    inviteSent: string | null;
    accessGranted: string | null;
    candidateResponse: string | null;
    profileCreated: string | null;
  }>({
    inviteSent: null,
    accessGranted: null,
    candidateResponse: null,
    profileCreated: null
  });

  // Critical Information Tab State
  const [activeTab, setActiveTab] = useState('Legal');

  // HR Admin profile state
  const [hrAdminProfile, setHrAdminProfile] = useState<any>(null);
  const [headerLoading, setHeaderLoading] = useState(true);

  // Document Upload Panel State
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [backgroundCheckFile, setBackgroundCheckFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jobPostingFile, setJobPostingFile] = useState<File | null>(null);
  const [emailsFile, setEmailsFile] = useState<File | null>(null);
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [companyPolicyFile, setCompanyPolicyFile] = useState<File | null>(null);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadingJobDesc, setUploadingJobDesc] = useState(false);
  const [uploadingJobPosting, setUploadingJobPosting] = useState(false);
  const [uploadingEmails, setUploadingEmails] = useState(false);
  const [uploadingNotes, setUploadingNotes] = useState(false);
  const [uploadingCompanyPolicy, setUploadingCompanyPolicy] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{ file: File; type: 'background' | 'jobdesc' | 'jobposting' | 'emails' | 'notes' | 'companypolicy'; title: string } | null>(null);
  
  // HR Action Timeline State
  const [showTimelinePanel, setShowTimelinePanel] = useState(false);

  // Documents Dropdown State
  const [showDocumentsDropdown, setShowDocumentsDropdown] = useState(false);

  // Document Viewer State
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDocumentsDropdown && !target.closest('.documents-dropdown')) {
        setShowDocumentsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDocumentsDropdown]);

  const [businessDaysRemaining, setBusinessDaysRemaining] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('businessDaysRemaining');
      return stored ? parseInt(stored, 10) : 0;
    }
    return 0;
  });

  const handleBusinessDaysSet = (days: number) => {
    setBusinessDaysRemaining(days);
    localStorage.setItem('businessDaysRemaining', days.toString());
  };

  // Add useEffect to clear localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('businessDaysRemaining');
    };
  }, []);

  const questions: AssessmentQuestion[] = [
    {
      id: "conditional_offer",
      question:
        "Has a conditional offer of employment been made to the candidate?",
      options: ["Yes", "No"],
      context:
        "Before conducting a criminal history assessment, employers must first make a conditional offer of employment to the candidate.",
      guidelines: [
        "The offer must be in writing",
        "The offer must be contingent only on the criminal history assessment",
        "The offer must include the job title, salary, and start date",
      ],
      helpText:
        "A conditional offer is a formal job offer that is contingent upon the successful completion of the criminal history assessment.",
      warning:
        "Without a conditional offer, you cannot proceed with the assessment.",
    },
    {
      id: "criminal_history",
      question: "Does the candidate have a criminal history?",
      options: ["Yes", "No"],
      dependsOn: { id: "conditional_offer", value: "Yes" },
      context:
        "Criminal history includes any record of arrests, charges, or convictions.",
      guidelines: [
        "Only consider convictions that have not been sealed, expunged, or statutorily eradicated",
        "Do not consider arrests that did not result in conviction",
        "Do not consider participation in diversion programs",
      ],
      helpText:
        "Criminal history refers to any past convictions that have not been legally expunged or sealed.",
      warning:
        "Be thorough in your review of the candidate's criminal history.",
    },
    {
      id: "conviction_type",
      question: "If yes, what type of conviction?",
      options: ["Felony", "Misdemeanor", "Infraction"],
      dependsOn: { id: "criminal_history", value: "Yes" },
      context:
        "The type of conviction can affect how it is evaluated in the assessment process.",
      guidelines: [
        "Felonies are the most serious type of conviction",
        "Misdemeanors are less serious than felonies",
        "Infractions are the least serious type of conviction",
      ],
      helpText:
        "The severity of the conviction type helps determine the level of consideration needed.",
    },
    {
      id: "conviction_age",
      question: "How old is the conviction?",
      options: [
        "Less than 1 year",
        "1-3 years",
        "3-5 years",
        "More than 5 years",
      ],
      dependsOn: { id: "criminal_history", value: "Yes" },
      context:
        "The age of the conviction is an important factor in the assessment.",
      guidelines: [
        "More recent convictions may require additional consideration",
        "Older convictions may be less relevant to current job performance",
        "Consider the nature of the conviction in relation to its age",
      ],
      helpText:
        "The time elapsed since the conviction can indicate rehabilitation and reduced risk.",
    },
    {
      id: "job_related",
      question: "Is the conviction directly related to the job?",
      options: ["Yes", "No"],
      dependsOn: { id: "criminal_history", value: "Yes" },
      context:
        "A conviction is directly related to the job if it has a direct and specific negative bearing on the candidate's ability to perform the job duties.",
      guidelines: [
        "Consider the nature of the conviction",
        "Evaluate the job duties and responsibilities",
        "Assess the potential risk to others",
      ],
      helpText:
        "Job-relatedness is a key factor in determining if a conviction should affect employment.",
      warning:
        "Carefully evaluate the relationship between the conviction and job duties.",
    },
    {
      id: "rehabilitation",
      question: "Has the candidate shown evidence of rehabilitation?",
      options: ["Yes", "No", "Not Applicable"],
      dependsOn: { id: "criminal_history", value: "Yes" },
      context:
        "Evidence of rehabilitation can include various factors that demonstrate the candidate's efforts to move forward positively.",
      guidelines: [
        "Consider completion of probation or parole",
        "Look for evidence of good conduct",
        "Evaluate efforts at rehabilitation",
        "Consider character references",
      ],
      helpText:
        "Rehabilitation shows the candidate's commitment to positive change.",
    },
    {
      id: "time_elapsed",
      question: "Has sufficient time elapsed since the conviction?",
      options: ["Yes", "No", "Not Applicable"],
      dependsOn: { id: "criminal_history", value: "Yes" },
      context:
        "The amount of time that has passed since the conviction is an important consideration.",
      guidelines: [
        "Consider the nature and severity of the conviction",
        "Evaluate the candidate's conduct since the conviction",
        "Assess the relevance of the conviction to the current time",
      ],
      helpText:
        "Time elapsed can indicate reduced risk and successful rehabilitation.",
    },
  ];

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Single effect to handle all localStorage saves
  useEffect(() => {
    if (!isLoading) {  // Only save after initial load
      const candidateId = params.userId;

      // Save current step
      if (currentStep > 0) {
        localStorage.setItem(`assessmentCurrentStep_${candidateId}`, currentStep.toString());
      }

      // Save answers if there are any
      if (Object.keys(answers).length > 0) {
        localStorage.setItem(`assessmentAnswers_${candidateId}`, JSON.stringify(answers));
      }

      // Save notes if there are any
      if (notes) {
        localStorage.setItem(`assessmentNotes_${candidateId}`, notes);
      }
    }
  }, [currentStep, answers, notes, params.userId, isLoading]);

  // Save forms to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && savedOfferLetter) {
      localStorage.setItem(`offerLetter_${params.userId}`, JSON.stringify(savedOfferLetter));
    }
  }, [savedOfferLetter, params.userId, isLoading]);

  useEffect(() => {
    if (!isLoading && savedAssessment) {
      localStorage.setItem(`assessment_${params.userId}`, JSON.stringify(savedAssessment));
    }
  }, [savedAssessment, params.userId, isLoading]);

  useEffect(() => {
    if (!isLoading && savedRevocationNotice) {
      localStorage.setItem(`revocationNotice_${params.userId}`, JSON.stringify(savedRevocationNotice));
    }
  }, [savedRevocationNotice, params.userId, isLoading]);

  useEffect(() => {
    if (!isLoading && savedReassessment) {
      localStorage.setItem(`reassessment_${params.userId}`, JSON.stringify(savedReassessment));
    }
  }, [savedReassessment, params.userId, isLoading]);

  useEffect(() => {
    if (!isLoading && savedFinalRevocationNotice) {
      localStorage.setItem(`finalRevocationNotice_${params.userId}`, JSON.stringify(savedFinalRevocationNotice));
    }
  }, [savedFinalRevocationNotice, params.userId, isLoading]);

  useEffect(() => {
    if (!isLoading && savedHireDecision) {
      localStorage.setItem(`hireDecision_${params.userId}`, JSON.stringify(savedHireDecision));
    }
  }, [savedHireDecision, params.userId, isLoading]);

  useEffect(() => {
    if (!isLoading && savedPreliminaryDecision) {
      localStorage.setItem(`preliminaryDecision_${params.userId}`, JSON.stringify(savedPreliminaryDecision));
    }
  }, [savedPreliminaryDecision, params.userId, isLoading]);

  // Fetch HR Admin Profile
  useEffect(() => {
    async function fetchHRAdminProfile() {
      setHeaderLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data, error } = await supabase
          .from("hr_admin_profiles")
          .select("first_name, last_name, company")
          .eq("id", session.user.id)
          .single();
        if (error) throw error;
        setHrAdminProfile(data);
      } catch (err) {
        setHrAdminProfile(null);
      } finally {
        setHeaderLoading(false);
      }
    }
    fetchHRAdminProfile();
  }, []);

  // Load saved forms and progress from localStorage on mount
  useEffect(() => {
    const candidateId = params.userId;

    // Load progress tracking from localStorage first
    const savedStep = localStorage.getItem(`assessmentCurrentStep_${candidateId}`);
    const savedAnswersData = localStorage.getItem(`assessmentAnswers_${candidateId}`);
    const savedNotesData = localStorage.getItem(`assessmentNotes_${candidateId}`);

    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
    if (savedAnswersData) {
      setAnswers(JSON.parse(savedAnswersData));
    }
    if (savedNotesData) {
      setNotes(savedNotesData);
    }

    // Load other saved forms
    const savedOfferLetterData = localStorage.getItem(`offerLetter_${candidateId}`);
    if (savedOfferLetterData) {
      setSavedOfferLetter(JSON.parse(savedOfferLetterData));
    }

    const savedAssessmentData = localStorage.getItem(`assessment_${candidateId}`);
    if (savedAssessmentData) {
      setSavedAssessment(JSON.parse(savedAssessmentData));
    }

    const savedRevocationNoticeData = localStorage.getItem(`revocationNotice_${candidateId}`);
    if (savedRevocationNoticeData) {
      setSavedRevocationNotice(JSON.parse(savedRevocationNoticeData));
    }

    const savedReassessmentData = localStorage.getItem(`reassessment_${candidateId}`);
    if (savedReassessmentData) {
      setSavedReassessment(JSON.parse(savedReassessmentData));
    }

    const savedFinalRevocationNoticeData = localStorage.getItem(`finalRevocationNotice_${candidateId}`);
    if (savedFinalRevocationNoticeData) {
      setSavedFinalRevocationNotice(JSON.parse(savedFinalRevocationNoticeData));
    }

    const savedHireDecisionData = localStorage.getItem(`hireDecision_${candidateId}`);
    if (savedHireDecisionData) {
      setSavedHireDecision(JSON.parse(savedHireDecisionData));
    }

    const savedPreliminaryDecisionData = localStorage.getItem(`preliminaryDecision_${candidateId}`);
    if (savedPreliminaryDecisionData) {
      setSavedPreliminaryDecision(JSON.parse(savedPreliminaryDecisionData));
    }

    // Fetch timeline data
    fetchTimelineData().then(data => {
      setTimelineData(data);
    });

    setIsLoading(false);
  }, [params.userId]);

  const clearAssessmentProgress = () => {
    // Clear assessment progress from localStorage
    localStorage.removeItem(`assessmentAnswers_${params.userId}`);
    localStorage.removeItem(`assessmentCurrentStep_${params.userId}`);
    localStorage.removeItem(`assessmentNotes_${params.userId}`);
  };

  // Utility function to clear all saved forms for this candidate
  // This could be useful for testing or if an assessment needs to be reset
  const clearAllSavedForms = () => {
    const candidateId = params.userId;
    localStorage.removeItem(`offerLetter_${candidateId}`);
    localStorage.removeItem(`assessment_${candidateId}`);
    localStorage.removeItem(`revocationNotice_${candidateId}`);
    localStorage.removeItem(`reassessment_${candidateId}`);
    localStorage.removeItem(`finalRevocationNotice_${candidateId}`);
    localStorage.removeItem(`hireDecision_${candidateId}`);
    localStorage.removeItem(`preliminaryDecision_${candidateId}`);
    clearAssessmentProgress();

    // Reset state
    setSavedOfferLetter(null);
    setSavedAssessment(null);
    setSavedRevocationNotice(null);
    setSavedReassessment(null);
    setSavedFinalRevocationNotice(null);
    setSavedHireDecision(null);
    setSavedPreliminaryDecision(null);
  };

  const handleComplete = () => {
    // Determine decision based on answers
    let decision = "proceed";
    let reason = "";

    if (answers.conditional_offer !== "Yes") {
      decision = "review";
      reason = "Conditional offer must be made before assessment";
    } else if (answers.criminal_history === "Yes") {
      if (
        answers.conviction_type === "Felony" &&
        answers.conviction_age === "Less than 1 year"
      ) {
        decision = "review";
        reason = "Recent felony conviction";
      } else if (answers.job_related === "Yes") {
        decision = "review";
        reason = "Conviction directly related to job";
      } else if (answers.rehabilitation === "No") {
        decision = "review";
        reason = "No evidence of rehabilitation";
      } else if (answers.time_elapsed === "No") {
        decision = "review";
        reason = "Insufficient time elapsed since conviction";
      }
    }

    // Clear assessment progress since it's completed
    clearAssessmentProgress();

    // Log results and redirect
    console.log("Assessment completed:", { decision, reason, answers, notes });
    window.location.href = "/hr-admin/dashboard";
  };

  const handleNextConditionalOffer = () => {
    if (answers.conditional_offer === "No") {
      setShowOfferModal(true);
    } else {
      // "Yes" was selected - acknowledge external conditional job offer was sent
      const externalOfferData = {
        sentAt: new Date().toISOString(),
        candidateId: params.userId,
        hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
        company: hrAdminProfile?.company || '',
        sentExternally: true, // Flag to indicate this was sent outside the system
        timestamp: Date.now()
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

  const allFieldsFilled = !!(offerForm.date && offerForm.applicant && offerForm.position && offerForm.employer);

  const currentQuestion = questions[currentStep - 1];
  // console.log("Current question:", currentQuestion);
  // console.log("Current step:", currentStep);
  // console.log("Current answers:", answers);

  const showQuestion =
    !currentQuestion.dependsOn ||
    answers[currentQuestion.dependsOn.id] === currentQuestion.dependsOn.value;

  const canGoNext =
    currentStep < questions.length && answers[currentQuestion.id];
  const canGoBack = currentStep > 1;

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
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      company: hrAdminProfile?.company || '',
      timestamp: Date.now()
    };

    try {
      const candidateEmail = await getCandidateEmail(params.userId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      // Send the offer letter email
      const emailResult = await sendOfferLetterEmail(offerLetterData, candidateEmail);

      if (!emailResult.success) {
        console.error("Failed to send offer letter email:", emailResult.error);
        // You might want to show an error message to the user here
      }

      setSavedOfferLetter(offerLetterData);
      setShowOfferModal(false);
      handleNext();
    } catch (error) {
      console.error("Error in handleSendOffer:", error);
    }
  }

  const handleAssessmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAssessmentForm({ ...assessmentForm, [e.target.name]: e.target.value });
  };
  const handleAssessmentArrayChange = (field: 'duties' | 'activities', idx: number, value: string) => {
    setAssessmentForm({
      ...assessmentForm,
      [field]: assessmentForm[field].map((item: string, i: number) => (i === idx ? value : item)),
    });
  };
  const handleSendAssessment = async () => {
    // Save the assessment with metadata
    const assessmentData = {
      ...assessmentForm,
      decision: 'rescind', // Always rescind since we're proceeding to revocation
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      companyName: hrAdminProfile?.company || '',
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
      setShowAssessmentModal(false);
      setAssessmentPreview(false);
      setInitialAssessmentResults({ ...assessmentForm });
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      console.error("Error in handleSendAssessment:", error);
    }
  };

  const handleRevocationFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRevocationForm({ ...revocationForm, [e.target.name]: e.target.value });
  };
  const handleRevocationArrayChange = (idx: number, value: string) => {
    setRevocationForm({
      ...revocationForm,
      convictions: revocationForm.convictions.map((item: string, i: number) => (i === idx ? value : item)),
    });
  };

  function addBusinessDays(startDate: Date, businessDays: number) {
    let days = 0;
    let date = new Date(startDate);
    while (days < businessDays) {
      date.setDate(date.getDate() + 1);
      // 0 = Sunday, 6 = Saturday
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        days++;
      }
    }
    return date;
  }

  function getBusinessDaysRemaining(sentDate: Date) {
    const today = new Date();
    let days = 0;
    let date = new Date(sentDate);
    while (date < today) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        days++;
      }
    }
    return Math.max(5 - days, 0);
  }

  // const businessDaysRemaining = revocationSentDate ? getBusinessDaysRemaining(revocationSentDate) : 5;

  const handleSendRevocation = async () => {
    // Save the revocation with metadata
    const revocationData = {
      ...revocationForm,
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      companyName: hrAdminProfile?.company || '',
    };

    try {
      const candidateEmail = await getCandidateEmail(params.userId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      await sendRevocationEmail(revocationData, candidateEmail);

      setSavedRevocationNotice(revocationData);
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
      decision: 'hire',
      decisionType: 'hired',
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      companyName: hrAdminProfile?.company || '',
    };
    
    // Save to localStorage for timeline tracking
    localStorage.setItem(`hireDecision_${params.userId}`, JSON.stringify(hireDecisionData));
    
    // Update state for immediate timeline display
    setSavedHireDecision(hireDecisionData);
    
    // Update Supabase user_profiles.final_decision to 'Hired'
    try {
      await supabase
        .from('user_profiles')
        .update({ final_decision: 'Hired' })
        .eq('id', params.userId);
    } catch (error) {
      console.error('Error updating final_decision in Supabase:', error);
    }
    setShowExtendSuccessModal(true);
    // You can add logic to finalize the hire here
  };

  const handleProceedWithReassessment = async () => {
    // Create a decision record for the timeline - choosing to proceed with adverse action/reassessment
    const reassessmentDecisionData = {
      decision: 'reassessment',
      decisionType: 'adverse_action',
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      companyName: hrAdminProfile?.company || '',
    };
    
    // Save to localStorage for timeline tracking
    localStorage.setItem(`preliminaryDecision_${params.userId}`, JSON.stringify(reassessmentDecisionData));
    
    // Update state for immediate timeline display (we'll create this state variable)
    setSavedPreliminaryDecision(reassessmentDecisionData);
    
    // Continue with the reassessment flow
    setShowReassessmentInfoModal(true);
  };

  const handleReassessmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReassessmentForm({ ...reassessmentForm, [e.target.name]: e.target.value });
  };
  const handleSendReassessment = async () => {
    // Save the reassessment with metadata
    const reassessmentData = {
      ...reassessmentForm,
      decision: reassessmentDecision, // Include the decision choice
      extendReason: extendReason, // Include extend reason if extending
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      companyName: hrAdminProfile?.company || '',
    };

    try {
      const candidateEmail = await getCandidateEmail(params.userId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      await sendReassessmentEmail(reassessmentData, candidateEmail);

      setSavedReassessment(reassessmentData);
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
    if (showReassessmentSplit && !candidateShareToken && !loadingCandidateData) {
      fetchCandidateShareToken();
    }
  }, [showReassessmentSplit]);

  const handleFinalRevocationFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === 'checkbox') {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setFinalRevocationForm((prev: any) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };
  const handleFinalRevocationArrayChange = (field: 'convictions' | 'jobDuties', idx: number, value: string) => {
    setFinalRevocationForm((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => (i === idx ? value : item)),
    }));
  };

  const router = useRouter();

  const handleSendFinalRevocation = async () => {
    // Save the final revocation with metadata
    const finalRevocationData = {
      ...finalRevocationForm,
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      companyName: hrAdminProfile?.company || '',
    };

    try {
      const candidateEmail = await getCandidateEmail(params.userId);
      if (!candidateEmail) {
        console.error("Error fetching candidate email");
        return;
      }

      await sendFinalRevocationEmail(finalRevocationData, candidateEmail);

      setSavedFinalRevocationNotice(finalRevocationData);
      setShowFinalRevocationModal(false);
      setFinalRevocationPreview(false);
      setShowFinalRevocationSuccessModal(true);
      setCurrentStep((prev) => prev + 1);

      try {
        await supabase
          .from('user_profiles')
          .update({ final_decision: 'Revoked' })
          .eq('id', params.userId);
      } catch (error) {
        console.error('Error updating final_decision in Supabase:', error);
      }
    } catch (error) {
      console.error("Error in handleSendFinalRevocation:", error);
    }
  };

  // Function to fetch candidate's share token for iframe
  const fetchCandidateShareToken = async () => {
    setLoadingCandidateData(true);
    try {
      // Get the candidate's share_token and basic profile info
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('share_token, first_name, last_name, email, rr_completed, created_at')
        .eq('id', params.userId)
        .single();

      if (profileError) {
        console.error('Error fetching candidate profile:', profileError);
        setCandidateProfile(null);
        setCandidateShareToken(null);
        return;
      }

      // Set the profile data regardless of share token status
      setCandidateProfile(profileData);

      if (!profileData.share_token) {
        // Profile exists but sharing is not enabled
        setCandidateShareToken(null);
        return;
      }

      setCandidateShareToken(profileData.share_token);
    } catch (error) {
      console.error('Error fetching candidate share token:', error);
      setCandidateProfile(null);
      setCandidateShareToken(null);
    } finally {
      setLoadingCandidateData(false);
    }
  };

  // Function to fetch complete timeline data
  const fetchTimelineData = async () => {
    try {
      // Get invite data from localStorage
      const savedInvites = localStorage.getItem('hr_sent_invites');
      let inviteData = null;
      if (savedInvites) {
        const invites = JSON.parse(savedInvites);
        inviteData = invites.find((invite: any) => invite.id === params.userId);
      }

      // Get access granted data from user_hr_permissions
      const { data: permissionData } = await supabase
        .from('user_hr_permissions')
        .select('granted_at')
        .eq('user_id', params.userId)
        .eq('is_active', true)
        .single();

      // Get profile data including restorative record completion
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('rr_completed, created_at, updated_at')
        .eq('id', params.userId)
        .single();

      return {
        inviteSent: inviteData?.dateSent || null,
        accessGranted: permissionData?.granted_at || null,
        candidateResponse: profileData?.rr_completed ? profileData.updated_at : null,
        profileCreated: profileData?.created_at || null
      };
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      return {
        inviteSent: null,
        accessGranted: null,
        candidateResponse: null,
        profileCreated: null
      };
    }
  };

  const handleViewCandidateResponse = () => {
    setShowCandidateResponseModal(true);
    fetchCandidateShareToken();
  };

  const handleViewOfferLetter = () => {
    setShowOfferLetterModal(true);
  };

  const handleAddDuty = () => {
    setAssessmentForm((prev: any) => ({
      ...prev,
      duties: [...prev.duties, ""]
    }));
  };
  const handleAddActivity = () => {
    setAssessmentForm((prev: any) => ({
      ...prev,
      activities: [...prev.activities, ""]
    }));
  };

  const handleAddConviction = () => {
    setRevocationForm(prev => ({
      ...prev,
      convictions: [...prev.convictions, ""]
    }));
  };

  // Document Upload Handlers
  const handleBackgroundCheckUpload = async (file: File) => {
    setUploadingBackground(true);
    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid file format (PDF, JPEG, PNG, DOCX, DOC)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setBackgroundCheckFile(file);
      // Here you would typically upload to your file storage service
      console.log('Background check file uploaded:', file.name);
    } catch (error) {
      console.error('Error uploading background check:', error);
      alert('Failed to upload background check report');
    } finally {
      setUploadingBackground(false);
    }
  };

  const handleJobDescriptionUpload = async (file: File) => {
    setUploadingJobDesc(true);
    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid file format (PDF, JPEG, PNG, DOCX, DOC)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setJobDescriptionFile(file);
      // Here you would typically upload to your file storage service
      console.log('Job description file uploaded:', file.name);
    } catch (error) {
      console.error('Error uploading job description:', error);
      alert('Failed to upload job description');
    } finally {
      setUploadingJobDesc(false);
    }
  };

  const handleJobPostingUpload = async (file: File) => {
    setUploadingJobPosting(true);
    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid file format (PDF, JPEG, PNG, DOCX, DOC)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setJobPostingFile(file);
      // Here you would typically upload to your file storage service
      console.log('Job posting file uploaded:', file.name);
    } catch (error) {
      console.error('Error uploading job posting:', error);
      alert('Failed to upload job posting');
    } finally {
      setUploadingJobPosting(false);
    }
  };

  const handleEmailsUpload = async (file: File) => {
    setUploadingEmails(true);
    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid file format (PDF, JPEG, PNG, DOCX, DOC)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setEmailsFile(file);
      // Here you would typically upload to your file storage service
      console.log('Emails file uploaded:', file.name);
    } catch (error) {
      console.error('Error uploading emails:', error);
      alert('Failed to upload emails');
    } finally {
      setUploadingEmails(false);
    }
  };

  const handleNotesUpload = async (file: File) => {
    setUploadingNotes(true);
    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid file format (PDF, JPEG, PNG, DOCX, DOC)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setNotesFile(file);
      // Here you would typically upload to your file storage service
      console.log('Notes file uploaded:', file.name);
    } catch (error) {
      console.error('Error uploading notes:', error);
      alert('Failed to upload notes');
    } finally {
      setUploadingNotes(false);
    }
  };

  const handleCompanyPolicyUpload = async (file: File) => {
    setUploadingCompanyPolicy(true);
    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid file format (PDF, JPEG, PNG, DOCX, DOC)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setCompanyPolicyFile(file);
      // Here you would typically upload to your file storage service
      console.log('Company policy file uploaded:', file.name);
    } catch (error) {
      console.error('Error uploading company policy:', error);
      alert('Failed to upload company policy');
    } finally {
      setUploadingCompanyPolicy(false);
    }
  };

  const handleRemoveFile = (type: 'background' | 'jobdesc' | 'jobposting' | 'emails' | 'notes' | 'companypolicy') => {
    if (type === 'background') {
      setBackgroundCheckFile(null);
    } else if (type === 'jobdesc') {
      setJobDescriptionFile(null);
    } else if (type === 'jobposting') {
      setJobPostingFile(null);
    } else if (type === 'emails') {
      setEmailsFile(null);
    } else if (type === 'notes') {
      setNotesFile(null);
    } else if (type === 'companypolicy') {
      setCompanyPolicyFile(null);
    }
  };

  // Document Viewing Handlers
  const handleViewDocument = (file: File, type: 'background' | 'jobdesc' | 'jobposting' | 'emails' | 'notes' | 'companypolicy') => {
    const title = type === 'background' ? 'Background Check Report' : 
                  type === 'jobdesc' ? 'Job Description' : 
                  type === 'jobposting' ? 'Job Posting' : 
                  type === 'emails' ? 'Emails' : 
                  type === 'notes' ? 'Notes' : 'Company Policy';
    setViewingDocument({ file, type, title });
    setShowDocumentViewer(true);
  };

  const handleDownloadDocument = (file: File, filename: string) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFilePreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  // Prevent background scroll when Conditional Job Offer Letter modal is open
  useEffect(() => {
    if (showOfferModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showOfferModal]);

  // Modify your render logic to handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Sleek Sticky Header */}
      <header className="w-full bg-white shadow-sm flex items-center justify-between px-8 py-4 mb-8 sticky top-0 z-30 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-black font-bold text-xl tracking-tight flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <span className="mr-2">
              réz<span className="text-red-500" style={{ color: '#E54747' }}>me</span>.
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Documents Dropdown Menu */}
          <div className="relative documents-dropdown">
            <button
              onClick={() => setShowDocumentsDropdown(!showDocumentsDropdown)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-all duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <FileText className="h-4 w-4" />
              View Documents
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDocumentsDropdown ? 'rotate-180' : ''}`} />
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
                    style={{ fontFamily: 'Poppins, sans-serif' }}
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
                    style={{ fontFamily: 'Poppins, sans-serif' }}
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
                    style={{ fontFamily: 'Poppins, sans-serif' }}
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
                    style={{ fontFamily: 'Poppins, sans-serif' }}
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
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <AlertCircle className="h-4 w-4" />
                    View Final Revocation
                  </button>
                )}
                {backgroundCheckFile && (
                  <button
                    onClick={() => {
                      handleViewDocument(backgroundCheckFile, 'background');
                      setShowDocumentsDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <FileText className="h-4 w-4" />
                    View Background Check
                  </button>
                )}
                {jobDescriptionFile && (
                  <button
                    onClick={() => {
                      handleViewDocument(jobDescriptionFile, 'jobdesc');
                      setShowDocumentsDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <Building className="h-4 w-4" />
                    View Job Description
                  </button>
                )}
                {jobPostingFile && (
                  <button
                    onClick={() => {
                      handleViewDocument(jobPostingFile, 'jobposting');
                      setShowDocumentsDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <Briefcase className="h-4 w-4" />
                    View Job Posting
                  </button>
                )}
                {emailsFile && (
                  <button
                    onClick={() => {
                      handleViewDocument(emailsFile, 'emails');
                      setShowDocumentsDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <Mail className="h-4 w-4" />
                    View Emails
                  </button>
                )}
                {notesFile && (
                  <button
                    onClick={() => {
                      handleViewDocument(notesFile, 'notes');
                      setShowDocumentsDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <StickyNote className="h-4 w-4" />
                    View Notes
                  </button>
                )}
                {companyPolicyFile && (
                  <button
                    onClick={() => {
                      handleViewDocument(companyPolicyFile, 'companypolicy');
                      setShowDocumentsDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <Building className="h-4 w-4" />
                    View Company Policy
                  </button>
                )}
                {!savedOfferLetter && !savedAssessment && !savedRevocationNotice && !savedReassessment && !savedFinalRevocationNotice && !backgroundCheckFile && !jobDescriptionFile && !jobPostingFile && !emailsFile && !notesFile && !companyPolicyFile && (
                  <div className="px-4 py-2 text-gray-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <History className="h-4 w-4" />
            HR Action Timeline
          </button>

          {/* Document Upload Panel Trigger */}
          <button
            onClick={() => setShowDocumentPanel(true)}
            className="px-4 py-2 text-white rounded-xl hover:opacity-90 text-sm font-medium flex items-center gap-2 transition-all duration-200"
            style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
          >
            <FileText className="h-4 w-4" />
            Upload Documents
          </button>
          {/* Return to Dashboard Button */}
          <button
            onClick={() => router.push('/hr-admin/dashboard')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 border-l-2 border-gray-300 ml-4 pl-4 transition-all duration-200"
            style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
          >
            <ChevronLeft className="h-4 w-4" />
            Return to Dashboard
          </button>
          {headerLoading ? (
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
          ) : hrAdminProfile ? (
            <>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg mr-2" style={{ backgroundColor: '#E54747', fontFamily: 'Poppins, sans-serif' }}>
                {hrAdminProfile.first_name?.[0]}{hrAdminProfile.last_name?.[0]}
              </div>
              <div className="flex flex-col">
                <span className="text-black font-medium text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>{hrAdminProfile.first_name} {hrAdminProfile.last_name}</span>
                <span className="text-gray-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>{hrAdminProfile.company || ""}</span>
              </div>
            </>
          ) : null}
        </div>
      </header>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Left Column: Assessment Progress */}
          <div className="lg:col-span-1 lg:-ml-16">
            {/* View Candidate Response Button */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6" style={{ color: '#595959' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Candidate Information</h3>
                  <button
                    className="px-3 py-2 border border-gray-300 rounded-xl text-xs transition-all duration-200 hover:bg-gray-50"
                    style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                    onClick={handleViewCandidateResponse}
                  >
                    View Candidate Response
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Assessment Progress</h2>
              <AssessmentProgressBar progressSteps={progressSteps} currentStep={currentStep} />
            </div>

            {/* San Diego Fair Chance Ordinance Legal Overview Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-12 w-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <Scale className="h-6 w-6" style={{ color: '#E54747' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>San Diego Fair Chance Ordinance Legal Overview</h3>
                  <button
                    className="px-3 py-2 border border-gray-300 rounded-xl text-xs transition-all duration-200 hover:bg-gray-50"
                    style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}
                    onClick={() => router.push(`/hr-admin/dashboard/${params.userId}/assessment/ordinance-summary`)}
                  >
                    View Ordinance Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column: Main Content */}
          <div className="lg:col-span-5 space-y-8">
            {/* Main Question Card Placeholder */}
            {currentStep === 1 && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                  <h2 className="text-3xl font-bold mb-8 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Confirm Conditional Offer</h2>
                <div className="space-y-6 mb-10">
                  <label className="flex items-center space-x-4 cursor-pointer">
                    <input
                      type="radio"
                      name="conditional_offer"
                      value="Yes"
                      checked={answers.conditional_offer === "Yes"}
                      onChange={() => handleAnswer("conditional_offer", "Yes")}
                        className="h-6 w-6 border-2 border-gray-300 focus:ring-2 focus:ring-red-500"
                        style={{ accentColor: '#E54747' }}
                    />
                      <span className="text-xl text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Yes, a conditional offer has been extended</span>
                  </label>
                  <label className="flex items-center space-x-4 cursor-pointer">
                    <input
                      type="radio"
                      name="conditional_offer"
                      value="No"
                      checked={answers.conditional_offer === "No"}
                      onChange={() => handleAnswer("conditional_offer", "No")}
                        className="h-6 w-6 border-2 border-gray-300 focus:ring-2 focus:ring-red-500"
                        style={{ accentColor: '#E54747' }}
                    />
                      <span className="text-xl text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>No, a conditional offer has not been extended</span>
                  </label>
                </div>
                <div className="flex justify-between items-center mt-8">
                  <button
                      className="px-8 py-3 border border-gray-300 text-gray-400 rounded-xl text-lg font-semibold cursor-not-allowed"
                      disabled
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Previous
                    </button>
                    <button
                      className={`px-8 py-3 rounded-xl text-lg font-semibold flex items-center space-x-2 transition-all duration-200 ${answers.conditional_offer
                        ? "text-white hover:opacity-90"
                        : "border border-gray-300 text-gray-400 cursor-not-allowed"
                        }`}
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        backgroundColor: answers.conditional_offer ? '#E54747' : 'transparent'
                      }}
                    onClick={handleNextConditionalOffer}
                    disabled={!answers.conditional_offer}
                  >
                      Next <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
                {/* Modal for Conditional Job Offer Letter */}
                <ConditionalJobOfferLetter
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
                />
              </div>

                {/* Critical Information Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <Info className="h-5 w-5 mr-2" style={{ color: '#595959' }} />
                    <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Critical Information</h3>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex space-x-1 mb-6 border-b border-gray-200">
                    {['Legal', 'Company Policy', 'Candidate Context'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-semibold text-sm transition-colors relative ${activeTab === tab
                          ? 'border-b-2 border-red-600'
                          : 'hover:text-gray-800'
                          }`}
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: activeTab === tab ? '#E54747' : '#595959'
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[200px]">
                    <CriticalInfoTabs activeTab={activeTab} currentStep={currentStep} />
                  </div>
                </div>
              </>
            )}
            {currentStep === 2 && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                  <h2 className="text-3xl font-bold mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Individualized Assessment</h2>
                  
                  {/* Hire Decision Success Message */}
                  {savedHireDecision && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Decision Made: Extend Offer of Employment
                          </p>
                          <p className="text-sm text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Decision made on {new Date(savedHireDecision.sentAt).toLocaleDateString()} to extend the offer of employment to this candidate. The assessment process is complete.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Compliance Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Info className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-900 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        The following compliance step is to conduct an individualized assessment in writing to consider the relevance of past convictions to the job being offered.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-200 ${savedHireDecision ? 'opacity-50 cursor-not-allowed' : 'text-white hover:opacity-90'}`}
                      onClick={() => savedHireDecision ? undefined : setShowAssessmentModal(true)}
                      disabled={!!savedHireDecision}
                      style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                    >
                      Begin Individualized Assessment
                    </button>
                    <button
                      className={`px-8 py-3 rounded-xl text-lg font-semibold border transition-all duration-200 ${savedHireDecision ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => savedHireDecision ? undefined : handleProceedWithHire()}
                      disabled={!!savedHireDecision}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {savedHireDecision ? '✓ Extend Offer of Employment (Selected)' : 'Extend Offer of Employment'}
                    </button>
                  </div>
                </div>

                {/* Critical Information Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <Info className="h-5 w-5 mr-2" style={{ color: '#595959' }} />
                    <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Critical Information</h3>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex space-x-1 mb-6 border-b border-gray-200">
                    {['Legal', 'Company Policy', 'Candidate Context'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-semibold text-sm transition-colors relative ${activeTab === tab
                          ? 'border-b-2 border-red-600'
                          : 'hover:text-gray-800'
                          }`}
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: activeTab === tab ? '#E54747' : '#595959'
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[200px]">
                    <CriticalInfoTabs activeTab={activeTab} currentStep={currentStep} />
                  </div>
                </div>

                {/* Modal for Individualized Assessment */}
                <IndividualizedAssessmentModal
                  showAssessmentModal={showAssessmentModal}
                  setShowAssessmentModal={setShowAssessmentModal}
                  assessmentForm={assessmentForm}
                  handleAssessmentFormChange={handleAssessmentFormChange}
                  handleAssessmentArrayChange={handleAssessmentArrayChange}
                  assessmentPreview={assessmentPreview}
                  setAssessmentPreview={setAssessmentPreview}
                  handleSendAssessment={handleSendAssessment}
                  onAddDuty={handleAddDuty}
                  onAddActivity={handleAddActivity}
                />
              </>
            )}
            {currentStep === 3 && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                  <h2 className="text-3xl font-bold mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Preliminary Job Offer Revocation</h2>
                  
                  {/* Hire Decision Success Message */}
                  {savedHireDecision && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Decision Made: Proceed with Hire
                          </p>
                          <p className="text-sm text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Decision made on {new Date(savedHireDecision.sentAt).toLocaleDateString()} to proceed with hiring this candidate. The assessment process is complete.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Compliance Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Info className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-900 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        The following may be used to inform a job applicant in writing of the intent to revoke a conditional job offer due to relevant criminal history
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-200 ${savedHireDecision ? 'opacity-50 cursor-not-allowed' : 'text-white hover:opacity-90'}`}
                      onClick={() => savedHireDecision ? undefined : setShowRevocationModal(true)}
                      disabled={!!savedHireDecision}
                      style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                    >
                      Issue Preliminary Job Offer Revocation
                    </button>
                    <button
                      className={`px-8 py-3 rounded-xl text-lg font-semibold border transition-all duration-200 ${savedHireDecision ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => savedHireDecision ? undefined : handleProceedWithHire()}
                      disabled={!!savedHireDecision}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {savedHireDecision ? '✓ Proceed with hire (Selected)' : 'Proceed with hire'}
                    </button>
                  </div>
                </div>

                {/* Critical Information Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <Info className="h-5 w-5 mr-2" style={{ color: '#595959' }} />
                    <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Critical Information</h3>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex space-x-1 mb-6 border-b border-gray-200">
                    {['Legal', 'Company Policy', 'Candidate Context'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-semibold text-sm transition-colors relative ${activeTab === tab
                          ? 'border-b-2 border-red-600'
                          : 'hover:text-gray-800'
                          }`}
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: activeTab === tab ? '#E54747' : '#595959'
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[200px]">
                    <CriticalInfoTabs activeTab={activeTab} currentStep={currentStep} />
                  </div>
                </div>

                {/* Preliminary Revocation Modal */}
                <PreliminaryRevocationModal
                  showRevocationModal={showRevocationModal}
                  setShowRevocationModal={setShowRevocationModal}
                  revocationForm={revocationForm}
                  handleRevocationFormChange={handleRevocationFormChange}
                  handleRevocationArrayChange={handleRevocationArrayChange}
                  revocationPreview={revocationPreview}
                  setRevocationPreview={setRevocationPreview}
                  handleSendRevocation={handleSendRevocation}
                  onBusinessDaysSet={handleBusinessDaysSet}
                  onAddConviction={handleAddConviction}
                />
              </>
            )}
            {currentStep === 4 && !showReassessmentSplit && (
              <>
                {/* Hire Decision Success Message */}
                {savedHireDecision && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Decision Made: Proceed with Hire
                        </p>
                        <p className="text-sm text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Decision made on {new Date(savedHireDecision.sentAt).toLocaleDateString()} to proceed with hiring this candidate. The assessment process is complete.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col items-center mb-6">
                  <div className="rounded-full bg-red-50 p-4 mb-4">
                    <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#E54747' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Preliminary Decision Notice Sent Successfully</h2>
                  <div className="text-center mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Time Remaining for Response:</div>
                  <div className="w-full flex flex-col items-center">
                    <div className="flex flex-col items-center bg-red-50 rounded-xl px-12 py-4 mb-4 border border-red-100">
                      <span className="text-4xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: '#E54747' }}>{businessDaysRemaining}</span>
                      <div className="text-lg" style={{ fontFamily: 'Poppins, sans-serif', color: '#E54747' }}>Business Days Remaining</div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                  <div className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Next Steps:</div>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                    <li>The candidate has {businessDaysRemaining} business days to respond with mitigating evidence</li>
                    <li>If they challenge the accuracy of the criminal history report, they will receive an additional 5 business days</li>
                    <li>You will be notified when the candidate submits their response</li>
                    <li>After reviewing their response, you must make a final decision</li>
                  </ul>
                </div>
                <div className="flex flex-row gap-4 mt-2">
                  <button
                    className={`px-8 py-3 rounded-xl text-lg font-semibold border transition-all duration-200 ${savedHireDecision ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => savedHireDecision ? undefined : handleProceedWithHire()}
                    disabled={!!savedHireDecision}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {savedHireDecision ? '✓ Proceed with hire (Selected)' : 'Proceed with hire'}
                  </button>
                  <button
                    className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-200 ${savedHireDecision ? 'opacity-50 cursor-not-allowed' : 'text-white hover:opacity-90'}`}
                    onClick={() => savedHireDecision ? undefined : handleProceedWithReassessment()}
                    disabled={!!savedHireDecision}
                    style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                  >
                    Begin Individualized Reassessment
                  </button>
                </div>

                {/* Critical Information Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <Info className="h-5 w-5 mr-2" style={{ color: '#595959' }} />
                    <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Critical Information</h3>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex space-x-1 mb-6 border-b border-gray-200">
                    {['Legal', 'Company Policy', 'Candidate Context'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-semibold text-sm transition-colors relative ${activeTab === tab
                          ? 'border-b-2 border-red-600'
                          : 'hover:text-gray-800'
                          }`}
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: activeTab === tab ? '#E54747' : '#595959'
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[200px]">
                    <CriticalInfoTabs activeTab={activeTab} currentStep={currentStep} />
                  </div>
                </div>
                
                {/* Informational Modal for Individualized Reassessment */}
                {showReassessmentInfoModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-10 relative border border-gray-200">
                      <h2 className="text-2xl font-bold mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Individualized Reassessment Information</h2>
                      <div className="space-y-4 mb-8" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                        <p className="text-base leading-relaxed">
                          After informing an applicant that you intend to revoke a job offer due to the applicant's criminal history, <strong>the applicant must be given specific timeframes to respond</strong>:
                        </p>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="font-semibold text-blue-900 mb-3">Required Timeframes:</h3>
                          <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span><strong>At least 5 business days</strong> to provide mitigating evidence that speaks to their character and fitness to perform the job</span>
                            </li>
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span><strong>Additional 5 business days</strong> if the applicant intends to gather and deliver information disputing the accuracy of the criminal history report</span>
                            </li>
                          </ul>
                        </div>
                        
                        <p className="text-base leading-relaxed">
                          <strong>Important:</strong> During this reassessment process, the position must remain open, except in emergent circumstances.
                        </p>
                        
                        <p className="text-base leading-relaxed">
                          The following form can be used to conduct an individualized reassessment based on information provided by the applicant.
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <button
                          className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
                          onClick={() => { setShowReassessmentInfoModal(false); setShowReassessmentSplit(true); }}
                          style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {currentStep === 4 && showReassessmentSplit && (
              <div className="flex flex-row w-full min-h-[70vh] gap-8">
                {/* Left: Individualized Reassessment Form */}
                <div className="flex-1 bg-white rounded-lg shadow p-8 border border-gray-200 max-h-[600px] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-6">Individualized Reassessment Form</h2>
                  {/* Reference: Initial Assessment Results */}
                  {initialAssessmentResults && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
                      <h3 className="font-semibold mb-2 text-gray-700">Initial Criminal History Individual Assessment (Reference)</h3>
                      <div className="text-sm text-gray-700">
                        <div><b>Employer Name:</b> {initialAssessmentResults.employer}</div>
                        <div><b>Applicant Name:</b> {initialAssessmentResults.applicant}</div>
                        <div><b>Position Applied For:</b> {initialAssessmentResults.position}</div>
                        <div><b>Date of Conditional Offer:</b> {initialAssessmentResults.offerDate}</div>
                        <div><b>Date of Assessment:</b> {initialAssessmentResults.assessmentDate}</div>
                        <div><b>Date of Criminal History Report:</b> {initialAssessmentResults.reportDate}</div>
                        <div><b>Assessment Performed by:</b> {initialAssessmentResults.performedBy}</div>
                        <div><b>Duties:</b> {initialAssessmentResults.duties && Array.isArray(initialAssessmentResults.duties) ? initialAssessmentResults.duties.filter(Boolean).join(', ') : ''}</div>
                        <div><b>Conduct of Concern:</b> {initialAssessmentResults.conduct}</div>
                        <div><b>How long ago:</b> {initialAssessmentResults.howLongAgo}</div>
                        <div><b>Activities since criminal activity:</b> {initialAssessmentResults.activities && Array.isArray(initialAssessmentResults.activities) ? initialAssessmentResults.activities.filter(Boolean).join(', ') : ''}</div>
                        <div><b>Reason for Rescinding Offer:</b> {initialAssessmentResults.rescindReason}</div>
                      </div>
                    </div>
                  )}
                  {/* End Reference Section */}
                  {!reassessmentPreview ? (
                    <form className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Employer Name</label>
                          <input type="text" name="employer" value={reassessmentForm.employer} onChange={handleReassessmentFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Applicant Name</label>
                          <input type="text" name="applicant" value={reassessmentForm.applicant} onChange={handleReassessmentFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Position Applied For</label>
                          <input type="text" name="position" value={reassessmentForm.position} onChange={handleReassessmentFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Date of Conditional Offer</label>
                          <input type="date" name="offerDate" value={reassessmentForm.offerDate} onChange={handleReassessmentFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Date of Reassessment</label>
                          <input type="date" name="reassessmentDate" value={reassessmentForm.reassessmentDate} onChange={handleReassessmentFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Date of Criminal History Report</label>
                          <input type="date" name="reportDate" value={reassessmentForm.reportDate} onChange={handleReassessmentFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Assessment Performed by</label>
                          <input type="text" name="performedBy" value={reassessmentForm.performedBy} onChange={handleReassessmentFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                      </div>

                      {/* Additional Assessment Questions */}
                      <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4">Assessment Questions</h3>

                        {/* Question 1: Error in Criminal History Report */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold mb-3">1. Was there an error in the Criminal History Report?</label>
                          <div className="flex items-center gap-6 mb-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="errorYesNo"
                                value="Yes"
                                checked={reassessmentForm.errorYesNo === 'Yes'}
                                onChange={handleReassessmentFormChange}
                              />
                              Yes
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="errorYesNo"
                                value="No"
                                checked={reassessmentForm.errorYesNo === 'No'}
                                onChange={handleReassessmentFormChange}
                              />
                              No
                            </label>
                          </div>
                          {reassessmentForm.errorYesNo === 'Yes' && (
                            <div>
                              <label className="block text-sm font-semibold mb-1">If yes, describe the error:</label>
                              <textarea
                                name="error"
                                value={reassessmentForm.error}
                                onChange={handleReassessmentFormChange}
                                className="w-full border rounded px-3 py-2 min-h-[80px]"
                                placeholder="Describe the error in detail"
                              />
                            </div>
                          )}
                        </div>

                        {/* Question 2: Evidence of Rehabilitation */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold mb-3">
                            2. Evidence of rehabilitation and good conduct (this evidence may include, but is not limited to, documents or other information demonstrating that the Applicant attended school, a religious institution, job training, or counseling, or is involved with the community. This evidence can include letters from people who know the Applicant, such as teachers, counselors, supervisors, clergy, and parole or probation officers):
                          </label>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">a.</label>
                              <textarea
                                name="evidenceA"
                                value={reassessmentForm.evidenceA}
                                onChange={handleReassessmentFormChange}
                                className="w-full border rounded px-3 py-2 min-h-[60px]"
                                placeholder="Evidence item A"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">b.</label>
                              <textarea
                                name="evidenceB"
                                value={reassessmentForm.evidenceB}
                                onChange={handleReassessmentFormChange}
                                className="w-full border rounded px-3 py-2 min-h-[60px]"
                                placeholder="Evidence item B"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">c.</label>
                              <textarea
                                name="evidenceC"
                                value={reassessmentForm.evidenceC}
                                onChange={handleReassessmentFormChange}
                                className="w-full border rounded px-3 py-2 min-h-[60px]"
                                placeholder="Evidence item C"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">d.</label>
                              <textarea
                                name="evidenceD"
                                value={reassessmentForm.evidenceD}
                                onChange={handleReassessmentFormChange}
                                className="w-full border rounded px-3 py-2 min-h-[60px]"
                                placeholder="Evidence item D"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-1">Decision</label>
                        <div className="flex items-center gap-6 mb-2">
                          <label className="flex items-center gap-2">
                            <input type="radio" name="reassessmentDecision" value="rescind" checked={reassessmentDecision === 'rescind'} onChange={() => setReassessmentDecision('rescind')} /> Rescind Offer
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name="reassessmentDecision" value="extend" checked={reassessmentDecision === 'extend'} onChange={() => setReassessmentDecision('extend')} /> Extend Offer
                          </label>
                        </div>
                        {reassessmentDecision === 'rescind' && (
                          <div>
                            <label className="block text-sm font-semibold mb-1">Based on the factors above, we are rescinding our offer of employment because</label>
                            <textarea name="rescindReason" value={reassessmentForm.rescindReason} onChange={handleReassessmentFormChange} className="w-full border rounded px-3 py-2 min-h-[60px]" placeholder="Describe the link between the specific aspects of the applicant's criminal history with risks inherent in the duties of the employment position" />
                          </div>
                        )}
                        {reassessmentDecision === 'extend' && (
                          <div>
                            <label className="block text-sm font-semibold mb-1">Based on the factors above, we are extending our offer of employment.</label>
                            <textarea name="extendReason" value={extendReason} onChange={e => setExtendReason(e.target.value)} className="w-full border rounded px-3 py-2 min-h-[60px]" />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end mt-8 gap-4">
                        <button
                          type="button"
                          className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
                          onClick={() => setReassessmentPreview(true)}
                          style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                        >
                          Preview
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="prose max-w-none text-black text-base bg-gray-50 p-8 rounded-xl border border-gray-200" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <h3 className="font-bold mb-2 text-black">INFORMATION</h3>
                      <div><b>Employer Name:</b> {reassessmentForm.employer}</div>
                      <div><b>Applicant Name:</b> {reassessmentForm.applicant}</div>
                      <div><b>Position Applied For:</b> {reassessmentForm.position}</div>
                      <div><b>Date of Conditional Offer:</b> {reassessmentForm.offerDate}</div>
                      <div><b>Date of Reassessment:</b> {reassessmentForm.reassessmentDate}</div>
                      <div><b>Date of Criminal History Report:</b> {reassessmentForm.reportDate}</div>
                      <div><b>Assessment Performed by:</b> {reassessmentForm.performedBy}</div>
                      <h3 className="font-bold mt-6 mb-2 text-black">REASSESSMENT</h3>
                      <div><b>1. Was there an error in the Criminal History Report?</b> {reassessmentForm.errorYesNo}</div>
                      {reassessmentForm.errorYesNo === 'Yes' && (
                        <div className="mb-2"><b>If yes, describe the error:</b> {reassessmentForm.error}</div>
                      )}
                      <div className="mt-4">
                        <b>2. Evidence of rehabilitation and good conduct:</b>
                        {reassessmentForm.evidenceA && (
                          <div className="mt-2"><b>a.</b> {reassessmentForm.evidenceA}</div>
                        )}
                        {reassessmentForm.evidenceB && (
                          <div className="mt-2"><b>b.</b> {reassessmentForm.evidenceB}</div>
                        )}
                        {reassessmentForm.evidenceC && (
                          <div className="mt-2"><b>c.</b> {reassessmentForm.evidenceC}</div>
                        )}
                        {reassessmentForm.evidenceD && (
                          <div className="mt-2"><b>d.</b> {reassessmentForm.evidenceD}</div>
                        )}
                      </div>
                      <div className="mt-2">
                        {reassessmentDecision === 'rescind' ? (
                          <><b>Based on the factors above, we are rescinding our offer of employment because:</b><br />{reassessmentForm.rescindReason}</>
                        ) : (
                          <><b>Based on the factors above, we are extending our offer of employment.</b><br />{extendReason}</>
                        )}
                      </div>
                      <div className="flex justify-end mt-8 gap-4">
                        <button
                          type="button"
                          className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
                          onClick={handleSendReassessment}
                          style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                        >
                          Send
                        </button>
                        <button
                          type="button"
                          className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                          onClick={() => setReassessmentPreview(false)}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Right: Candidate Response Iframe */}
                <div className="flex-1 bg-white rounded-xl shadow p-8 border border-gray-200 max-h-[600px] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Candidate Response</h2>
                  {loadingCandidateData ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E54747' }}></div>
                      <p style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Loading candidate's restorative record...</p>
                    </div>
                  ) : candidateShareToken ? (
                    <iframe
                      src={`${window.location.origin}/restorative-record/share/${candidateShareToken}`}
                      title="Candidate Restorative Record"
                      className="w-full h-[500px] rounded-xl border border-gray-200"
                      frameBorder="0"
                    />
                  ) : candidateProfile ? (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Profile is Private</h3>
                      <p className="mb-6 max-w-md mx-auto" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                        {candidateProfile.first_name} {candidateProfile.last_name} has chosen to keep their restorative record private. The candidate would need to enable sharing to make their record accessible.
                      </p>
                      <button
                        className="px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 mb-6"
                        style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                      >
                        Request Restorative Record
                      </button>
                      <div className="bg-red-50 rounded-xl p-6 max-w-md mx-auto border border-red-100">
                        <h4 className="font-semibold mb-3 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>How to Enable Sharing:</h4>
                        <p className="text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                          The candidate can enable sharing by visiting their restorative record profile page and clicking the "Share" button to generate a shareable link.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>No Restorative Record Available</h3>
                      <p style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                        This candidate has not yet created a restorative record or it may not be available for sharing.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {currentStep === 5 && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                  <div className="w-full">
                    <h2 className="text-3xl font-bold mb-8 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Final Compliance Step</h2>
                    
                    {/* Hire Decision Success Message */}
                    {savedHireDecision && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-green-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Decision Made: Extend Offer of Employment
                            </p>
                            <p className="text-sm text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Decision made on {new Date(savedHireDecision.sentAt).toLocaleDateString()} to extend the offer of employment to this candidate. The assessment process is complete.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Compliance Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Info className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-sm text-blue-900 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <span className="font-semibold">Once you have considered any mitigating information provided by the applicant, you may still decide to revoke the conditional job offer due to relevant criminal history.</span> <br />
                          The following notice meets your responsibility to notify the applicant in writing.
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-8">
                      <button
                        className={`px-12 py-3 rounded-xl text-lg font-semibold border transition-all duration-200 w-full ${savedHireDecision ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => savedHireDecision ? undefined : handleProceedWithHire()}
                        disabled={!!savedHireDecision}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {savedHireDecision ? '✓ Extend Offer of Employment (Selected)' : 'Extend Offer of Employment'}
                      </button>
                      <button
                        className={`px-12 py-3 rounded-xl text-lg font-semibold transition-all duration-200 w-full ${savedHireDecision ? 'opacity-50 cursor-not-allowed' : 'text-white hover:opacity-90'}`}
                        onClick={() => savedHireDecision ? undefined : setShowFinalRevocationModal(true)}
                        disabled={!!savedHireDecision}
                        style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                      >
                        Issue Final Revocation Notice
                      </button>
                    </div>
                  </div>
                </div>
                {/* Final Revocation Notice Modal */}
                <FinalRevocationModal
                  show={showFinalRevocationModal}
                  onClose={() => setShowFinalRevocationModal(false)}
                  onPreview={() => setFinalRevocationPreview(true)}
                  onSend={handleSendFinalRevocation}
                  preview={finalRevocationPreview}
                  form={finalRevocationForm}
                  handleFormChange={handleFinalRevocationFormChange}
                  handleArrayChange={handleFinalRevocationArrayChange}
                  setPreview={setFinalRevocationPreview}
                  setForm={setFinalRevocationForm}
                />

                {/* Critical Information Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <Info className="h-5 w-5 mr-2" style={{ color: '#595959' }} />
                    <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Critical Information</h3>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex space-x-1 mb-6 border-b border-gray-200">
                    {['Legal', 'Company Policy', 'Candidate Context'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-semibold text-sm transition-colors relative ${activeTab === tab
                          ? 'border-b-2 border-red-600'
                          : 'hover:text-gray-800'
                          }`}
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: activeTab === tab ? '#E54747' : '#595959'
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[200px]">
                    <CriticalInfoTabs activeTab={activeTab} currentStep={currentStep} />
                  </div>
                </div>

              </>
            )}
            {currentStep === 6 && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                  <div className="w-full text-center">
                    <div className="rounded-full bg-green-50 p-6 mb-6 mx-auto w-fit border border-green-100">
                      <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#10B981' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Assessment Complete</h2>
                    <p className="text-lg mb-8" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                      All assessment steps have been completed successfully. The fair chance hiring process is now complete for this candidate.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                        onClick={() => window.location.href = '/hr-admin/dashboard'}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        Return to Dashboard
                      </button>
                      <button
                        className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
                        onClick={handleViewCandidateResponse}
                        style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                      >
                        View Final Records
                      </button>
                    </div>
                  </div>
                </div>

                {/* Critical Information Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <Info className="h-5 w-5 mr-2" style={{ color: '#595959' }} />
                    <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Critical Information</h3>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex space-x-1 mb-6 border-b border-gray-200">
                    {['Legal', 'Company Policy', 'Candidate Context'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-semibold text-sm transition-colors relative ${activeTab === tab
                          ? 'border-b-2 border-red-600'
                          : 'hover:text-gray-800'
                          }`}
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: activeTab === tab ? '#E54747' : '#595959'
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[200px]">
                    <CriticalInfoTabs activeTab={activeTab} currentStep={currentStep} />
                  </div>
                </div>

              </>
            )}

          </div>
        </div>
      </div>

      {/* Footer with Disclaimer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Logo and Tagline */}
            <div>
              <div className="text-black font-bold text-2xl mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                réz<span style={{ color: '#E54747' }}>me</span>.
              </div>
              <p className="text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                Automating Fair Chance Hiring<br />
                compliance for modern HR teams.
              </p>
            </div>

            {/* Right: Legal Disclaimer */}
            <div className="lg:col-span-2">
              <p className="text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                Rézme provides compliance support tools, not legal advice. Use of this site or platform does not create an attorney-client relationship. Employers retain full responsibility for final hiring decisions and for compliance with applicable laws. Rézme is not a Consumer Reporting Agency and does not furnish consumer reports under the Fair Credit Reporting Act. While our software assists clients in documenting individualized assessments and related compliance steps, Rézme's role is limited to producing records created within our system in the event of an audit. All data sources, partner integrations, and outputs are provided "as-is," without warranty of completeness or accuracy. Tax credit calculations are estimates only and do not guarantee financial outcomes. By using this site, you agree to our Terms of Service, including limitations of liability, indemnification provisions, and governing law clauses.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
              © 2024 Rézme. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {showExtendSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-10 flex flex-col items-center relative border border-gray-200">
            {/* X Close Button */}
            <button
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              onClick={() => setShowExtendSuccessModal(false)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="rounded-full bg-red-50 p-4 mb-4 border border-red-100">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#E54747' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Applicant Hired!</h2>
            <div className="text-lg text-center mb-8" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>You have indicated that you intend to extend an offer of employment to the candidate. Please update your records accordingly. We will store the assessments you conducted on Rézme.</div>
            <button
              className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
              onClick={() => { setShowExtendSuccessModal(false); setShowReassessmentSplit(false); setReassessmentPreview(false); router.push('/hr-admin/dashboard'); }}
              style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
      {showFinalRevocationSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-12 max-w-6xl w-full flex flex-col items-center relative border border-gray-200">
            {/* X button in top right corner */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              onClick={() => setShowFinalRevocationSuccessModal(false)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="rounded-full bg-red-50 p-6 mb-6 border border-red-100">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#E54747' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-center mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Final Revocation Notice Sent</h1>
            <p className="text-lg text-center mb-8 max-w-4xl" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
              You have indicated that you will not be proceeding with an offer of employment to the candidate. Please update your records accordingly. We will store the assessments and actions you conducted on Rézme including the steps you took to ensure compliance with San Diego County Fair Chance Ordinance and The Office of Labor Standards and Enforcement (OLSE).
            </p>
            <button
              className="px-8 py-4 rounded-xl text-lg font-semibold text-white hover:opacity-90 mb-8 transition-all duration-200"
              onClick={() => { setShowFinalRevocationSuccessModal(false); router.push('/hr-admin/dashboard'); }}
              style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
            >
              Return to Dashboard
            </button>
            <div className="w-full border-t border-gray-200 pt-8 flex flex-col items-center">
              <div className="flex flex-row items-center gap-8 text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                <div className="flex items-center gap-2">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#595959' }}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  OLSE@sdcounty.ca.gov
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#595959' }}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  <a href="https://www.sandiegocounty.gov/OLSE.html" className="underline hover:no-underline transition-all duration-200">https://www.sandiegocounty.gov/OLSE.html</a>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#595959' }}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  619-531-5129
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Response Modal */}
      {showCandidateResponseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full p-8 relative max-h-screen overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Candidate Response - Restorative Record
                {candidateProfile && ` - ${candidateProfile.first_name} ${candidateProfile.last_name}`}
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowCandidateResponseModal(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Loading State */}
            {loadingCandidateData ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E54747' }}></div>
                <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Loading candidate's restorative record...</p>
              </div>
            ) : candidateShareToken ? (
              /* Iframe Content */
              <div className="h-[70vh]">
                <iframe
                  src={`${window.location.origin}/restorative-record/share/${candidateShareToken}`}
                  title="Candidate Restorative Record"
                  className="w-full h-full rounded-xl border border-gray-200"
                  frameBorder="0"
                />
              </div>
            ) : candidateProfile ? (
              /* Private Profile State */
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Profile is Private</h3>
                <p className="mb-6 max-w-md mx-auto" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                  {candidateProfile.first_name} {candidateProfile.last_name} has chosen to keep their restorative record private. The candidate would need to enable sharing to make their record accessible.
                </p>
                <button
                  className="px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 mb-6"
                  style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                >
                  Request Restorative Record
                </button>
                <div className="bg-red-50 rounded-xl p-6 max-w-md mx-auto border border-red-100">
                  <h4 className="font-semibold mb-3 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>How to Enable Sharing:</h4>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                    The candidate can enable sharing by visiting their restorative record profile page and clicking the "Share" button to generate a shareable link.
                  </p>
                </div>
              </div>
            ) : (
              /* No Data State */
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>No Restorative Record Available</h3>
                <p className="text-gray-600">
                  This candidate has not yet created a restorative record or it may not be available for sharing.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end mt-6">
              <button
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowCandidateResponseModal(false)}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Offer Letter Modal */}
      {showOfferLetterModal && savedOfferLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Conditional Job Offer Letter</h2>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowOfferLetterModal(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Saved Offer Letter Content */}
            <div className="prose max-w-none text-black text-base bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <div className="mb-2">
                <span className="font-semibold">{savedOfferLetter.date}</span>
              </div>
              <div className="mb-2">RE: Conditional Offer of Employment & Notice of Conviction Background Check</div>
              <div className="mb-2">
                Dear <span className="font-semibold">{savedOfferLetter.applicant}</span>:
              </div>
              <div className="mb-2">
                We are writing to make you a conditional offer of employment for the position of <span className="font-semibold">{savedOfferLetter.position}</span>. Before this job offer becomes final, we will check your conviction history. The form attached to this letter asks for your permission to check your conviction history and provides more information about that background check.
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
                <span className="font-semibold">{savedOfferLetter.employer}</span>
              </div>
              <div className="mb-2">
                Enclosure: Authorization for Background Check (as required by the U.S. Fair Credit Reporting Act and California Investigative Consumer Reporting Agencies Act)
              </div>

              {/* Document Metadata */}
              <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Document Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div>
                    <span className="font-medium text-black">Sent Date:</span> <span style={{ color: '#595959' }}>{new Date(savedOfferLetter.sentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Sent By:</span> <span style={{ color: '#595959' }}>{savedOfferLetter.hrAdminName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Company:</span> <span style={{ color: '#595959' }}>{savedOfferLetter.company}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Candidate ID:</span> <span style={{ color: '#595959' }}>{savedOfferLetter.candidateId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-4 mt-6">
              <PrintPreviewButton documentSelector=".prose" documentTitle="Conditional Job Offer" />
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowOfferLetterModal(false)}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Assessment Modal */}
      {showAssessmentViewModal && savedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Criminal History Individual Assessment Form</h2>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowAssessmentViewModal(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Saved Assessment Content */}
            <div className="prose max-w-none text-black text-base bg-white rounded-xl p-8 border border-gray-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <h3 className="font-bold mb-4 text-black text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>INFORMATION</h3>
              <div className="space-y-2 mb-6">
                <div><span className="font-semibold text-black">Employer Name:</span> <span style={{ color: '#595959' }}>{savedAssessment.employer}</span></div>
                <div><span className="font-semibold text-black">Applicant Name:</span> <span style={{ color: '#595959' }}>{savedAssessment.applicant}</span></div>
                <div><span className="font-semibold text-black">Position Applied For:</span> <span style={{ color: '#595959' }}>{savedAssessment.position}</span></div>
                <div><span className="font-semibold text-black">Date of Conditional Offer:</span> <span style={{ color: '#595959' }}>{savedAssessment.offerDate}</span></div>
                <div><span className="font-semibold text-black">Date of Assessment:</span> <span style={{ color: '#595959' }}>{savedAssessment.assessmentDate}</span></div>
                <div><span className="font-semibold text-black">Date of Criminal History Report:</span> <span style={{ color: '#595959' }}>{savedAssessment.reportDate}</span></div>
                <div><span className="font-semibold text-black">Assessment Performed by:</span> <span style={{ color: '#595959' }}>{savedAssessment.performedBy}</span></div>
              </div>

              <h3 className="font-bold mb-4 text-black text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>ASSESSMENT</h3>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-black">1. The specific duties and responsibilities of the job are:</span>
                  <ul className="list-disc ml-6 mt-2" style={{ color: '#595959' }}>
                    {savedAssessment.duties.map((duty: string, idx: number) => duty && <li key={idx}>{duty}</li>)}
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-black">2. Description of the criminal conduct and why the conduct is of concern with respect to the position in question:</span>
                  <div className="mt-2" style={{ color: '#595959' }}>{savedAssessment.conduct}</div>
                </div>

                <div>
                  <span className="font-semibold text-black">3. How long ago did the criminal activity occur:</span>
                  <div className="mt-2" style={{ color: '#595959' }}>{savedAssessment.howLongAgo}</div>
                </div>

                <div>
                  <span className="font-semibold text-black">4. Activities since criminal activity, such as work experience, job training, rehabilitation, community service, etc.:</span>
                  <ul className="list-disc ml-6 mt-2" style={{ color: '#595959' }}>
                    {savedAssessment.activities.map((act: string, idx: number) => act && <li key={idx}>{act}</li>)}
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-black">Based on the factors above, we are considering rescinding our offer of employment because:</span>
                  <div className="mt-2" style={{ color: '#595959' }}>{savedAssessment.rescindReason}</div>
                </div>
              </div>

              {/* Document Metadata */}
              <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Document Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div>
                    <span className="font-medium text-black">Sent Date:</span> <span style={{ color: '#595959' }}>{new Date(savedAssessment.sentAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Sent By:</span> <span style={{ color: '#595959' }}>{savedAssessment.hrAdminName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Company:</span> <span style={{ color: '#595959' }}>{savedAssessment.companyName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Candidate ID:</span> <span style={{ color: '#595959' }}>{savedAssessment.candidateId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-4 mt-6">
              <PrintPreviewButton
                documentSelector=".prose"
                documentTitle="=Individualized Assessment Form"
              />
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowAssessmentViewModal(false)}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Revocation Notice Modal */}
      {showRevocationViewModal && savedRevocationNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Notice of Preliminary Decision to Revoke Job Offer Because of Conviction History</h2>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowRevocationViewModal(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Saved Revocation Notice Content */}
            <div className="prose max-w-none text-black text-base bg-white rounded-xl p-8 border border-gray-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <div className="mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>{savedRevocationNotice.date}</div>
              <div className="mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Re: Preliminary Decision to Revoke Job Offer Because of Conviction History</div>
              <div className="mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Dear {savedRevocationNotice.applicant}:</div>
              <div className="mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>After reviewing the results of your conviction history background check, we have made a preliminary (non-final) decision to revoke (take back) our previous job offer for the position of {savedRevocationNotice.position} because of the following conviction(s):
                <ul className="list-disc ml-6" style={{ color: '#595959' }}>
                  {savedRevocationNotice.convictions.map((conv: string, idx: number) => conv && <li key={idx}>{conv}</li>)}
                </ul>
                A copy of your conviction history report is attached to this letter. More information about our concerns is included in the "Individualized Assessment" below.
              </div>
              <div className="mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>As prohibited by Local and California law, we have NOT considered any of the following:
                <ul className="list-disc ml-6" style={{ color: '#595959' }}>
                  <li>Arrest(s) not followed by conviction;</li>
                  <li>Participation in a pretrial or posttrial diversion program; or</li>
                  <li>Convictions that have been sealed, dismissed, expunged, or pardoned.</li>
                </ul>
              </div>
              <div className="mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}><span className="font-semibold">Your Right to Respond:</span><br />
                The conditional job you were offered will remain available for five business days so that you may respond to this letter before our decision to revoke the job offer becomes final. Within {savedRevocationNotice.numBusinessDays} business days* from when you first receive this notice, you may send us:
                <ul className="list-disc ml-6" style={{ color: '#595959' }}>
                  <li>Evidence of rehabilitation or mitigating circumstances</li>
                  <li>Information challenging the accuracy of the conviction history listed above. If, within 5 business days, you notify us that you are challenging the accuracy of the attached conviction history report, you shall have another 5 business days to respond to this notice with evidence of inaccuracy.</li>
                </ul>
                Please send any additional information you would like us to consider to: {savedRevocationNotice.contactName}, {savedRevocationNotice.companyName}, {savedRevocationNotice.address}, {savedRevocationNotice.phone}
              </div>
              <div className="mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>We are required to review the information you submit and make another individualized assessment of whether to hire you or revoke the job offer. We will notify you in writing if we make a final decision to revoke the job offer.</div>
              <div className="mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}><span className="font-semibold">Our Individualized Assessment:</span><br />
                We have individually assessed whether your conviction history is directly related to the duties of the job we offered you. We considered the following:
                <ol className="list-decimal ml-6" style={{ color: '#595959' }}>
                  <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: {savedRevocationNotice.seriousReason}</li>
                  <li>How long ago the conduct occurred that led to your conviction, which was: {savedRevocationNotice.timeSinceConduct} and how long ago you completed your sentence, which was: {savedRevocationNotice.timeSinceSentence}.</li>
                  <li>The specific duties and responsibilities of the position of {savedRevocationNotice.position}, which are: {savedRevocationNotice.jobDuties}</li>
                </ol>
                We believe your conviction record lessens your fitness/ability to perform the job duties because: {savedRevocationNotice.fitnessReason}
              </div>
              <div className="mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Sincerely,<br />{savedRevocationNotice.contactName}<br />{savedRevocationNotice.companyName}<br />{savedRevocationNotice.address}<br />{savedRevocationNotice.phone}</div>
              <div className="mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Enclosure: Copy of conviction history report</div>
              <div className="mb-2 text-xs text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>* The applicant must be allowed at least 5 business days to respond. If the applicant indicates their intent to provide such evidence, they must be given an additional 5 business days to gather and deliver the information</div>

              {/* Document Metadata */}
              <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Document Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div>
                    <span className="font-medium text-black">Sent Date:</span> <span style={{ color: '#595959' }}>{new Date(savedRevocationNotice.sentAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Sent By:</span> <span style={{ color: '#595959' }}>{savedRevocationNotice.hrAdminName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Company:</span> <span style={{ color: '#595959' }}>{savedRevocationNotice.companyName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Candidate ID:</span> <span style={{ color: '#595959' }}>{savedRevocationNotice.candidateId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-4 mt-6">
              <PrintPreviewButton
                documentSelector=".prose"
                documentTitle="Job Revocation Notice"
              />
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowRevocationViewModal(false)}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Reassessment Modal */}
      {showReassessmentViewModal && savedReassessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Individualized Reassessment Form</h2>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowReassessmentViewModal(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Saved Reassessment Content */}
            <div className="prose max-w-none text-black text-base bg-white rounded-xl p-8 border border-gray-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <h3 className="font-bold mb-4 text-black text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>INFORMATION</h3>
              <div className="space-y-2 mb-6">
                <div><span className="font-semibold text-black">Employer Name:</span> <span style={{ color: '#595959' }}>{savedReassessment.employer}</span></div>
                <div><span className="font-semibold text-black">Applicant Name:</span> <span style={{ color: '#595959' }}>{savedReassessment.applicant}</span></div>
                <div><span className="font-semibold text-black">Position Applied For:</span> <span style={{ color: '#595959' }}>{savedReassessment.position}</span></div>
                <div><span className="font-semibold text-black">Date of Conditional Offer:</span> <span style={{ color: '#595959' }}>{savedReassessment.offerDate}</span></div>
                <div><span className="font-semibold text-black">Date of Reassessment:</span> <span style={{ color: '#595959' }}>{savedReassessment.reassessmentDate}</span></div>
                <div><span className="font-semibold text-black">Date of Criminal History Report:</span> <span style={{ color: '#595959' }}>{savedReassessment.reportDate}</span></div>
                <div><span className="font-semibold text-black">Assessment Performed by:</span> <span style={{ color: '#595959' }}>{savedReassessment.performedBy}</span></div>
              </div>

              <h3 className="font-bold mt-6 mb-4 text-black text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>REASSESSMENT</h3>
              <div className="space-y-4">
                <div><span className="font-semibold text-black">1. Was there an error in the Criminal History Report?</span> <span style={{ color: '#595959' }}>{savedReassessment.errorYesNo}</span></div>
                {savedReassessment.errorYesNo === 'Yes' && (
                  <div><span className="font-semibold text-black">If yes, describe the error:</span> <span style={{ color: '#595959' }}>{savedReassessment.error}</span></div>
                )}

                <div>
                  <span className="font-semibold text-black">2. Evidence of rehabilitation and good conduct:</span>
                  <div className="mt-2 space-y-2">
                    {savedReassessment.evidenceA && (
                      <div><span className="font-semibold text-black">a.</span> <span style={{ color: '#595959' }}>{savedReassessment.evidenceA}</span></div>
                    )}
                    {savedReassessment.evidenceB && (
                      <div><span className="font-semibold text-black">b.</span> <span style={{ color: '#595959' }}>{savedReassessment.evidenceB}</span></div>
                    )}
                    {savedReassessment.evidenceC && (
                      <div><span className="font-semibold text-black">c.</span> <span style={{ color: '#595959' }}>{savedReassessment.evidenceC}</span></div>
                    )}
                    {savedReassessment.evidenceD && (
                      <div><span className="font-semibold text-black">d.</span> <span style={{ color: '#595959' }}>{savedReassessment.evidenceD}</span></div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-black">Decision:</span> <span style={{ color: '#595959' }}>{savedReassessment.decision === 'rescind' ? 'Rescind Offer' : 'Extend Offer'}</span>
                </div>

                <div>
                  {savedReassessment.decision === 'rescind' ? (
                    <><span className="font-semibold text-black">Based on the factors above, we are rescinding our offer of employment because:</span><br /><span style={{ color: '#595959' }}>{savedReassessment.rescindReason}</span></>
                  ) : (
                    <><span className="font-semibold text-black">Based on the factors above, we are extending our offer of employment.</span><br /><span style={{ color: '#595959' }}>{savedReassessment.extendReason}</span></>
                  )}
                </div>
              </div>

              {/* Document Metadata */}
              <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Document Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div>
                    <span className="font-medium text-black">Sent Date:</span> <span style={{ color: '#595959' }}>{new Date(savedReassessment.sentAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Sent By:</span> <span style={{ color: '#595959' }}>{savedReassessment.hrAdminName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Company:</span> <span style={{ color: '#595959' }}>{savedReassessment.companyName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Candidate ID:</span> <span style={{ color: '#595959' }}>{savedReassessment.candidateId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-4 mt-6">
              <PrintPreviewButton
                documentSelector=".prose"
                documentTitle="Individualized Reassessment Form"
              />
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowReassessmentViewModal(false)}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Final Revocation Notice Modal */}
      {showFinalRevocationViewModal && savedFinalRevocationNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Notice of Final Decision to Revoke Job Offer Because of Conviction History</h2>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowFinalRevocationViewModal(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Saved Final Revocation Notice Content */}
            <div className="prose max-w-none text-black text-base bg-white rounded-xl p-8 border border-gray-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>{savedFinalRevocationNotice.date}</div>
              <div className="mb-6 font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Re: Final Decision to Revoke Job Offer Because of Conviction History</div>
              <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Dear {savedFinalRevocationNotice.applicant || '[APPLICANT NAME]'}:</div>
              <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>We are following up about our letter dated {savedFinalRevocationNotice.dateOfNotice || '[DATE OF NOTICE]'} which notified you of our initial decision to revoke (take back) the conditional job offer:</div>
              <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>(Please check one:)</div>
              <ul className="list-disc ml-6" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                {savedFinalRevocationNotice.noResponse && <li>We did not receive a timely response from you after sending you that letter, and our decision to revoke the job offer is now final.</li>}
                {savedFinalRevocationNotice.infoSubmitted && <li>We made a final decision to revoke the job offer after considering the information you submitted, which included: {savedFinalRevocationNotice.infoSubmittedList}</li>}
              </ul>
              <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>After reviewing the information you submitted, we have determined that there
                <span className="font-semibold text-black"> {savedFinalRevocationNotice.errorOnReport === 'was' ? 'was' : savedFinalRevocationNotice.errorOnReport === 'was not' ? 'was not' : '[check one]'}</span> (check one) an error on your conviction history report. We have decided to revoke our job offer because of the following conviction(s):</div>
              <ul className="list-disc ml-6" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                {savedFinalRevocationNotice.convictions.map((conv: string, idx: number) => conv && <li key={idx}>{conv}</li>)}
              </ul>
              <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Individualized Assessment:</div>
              <ol className="list-decimal ml-8 mb-8 space-y-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: {savedFinalRevocationNotice.seriousReason}</li>
                <li>How long ago the conduct occurred that led to your conviction, which was: {savedFinalRevocationNotice.timeSinceConduct} and how long ago you completed your sentence, which was: {savedFinalRevocationNotice.timeSinceSentence}.</li>
                <li>The specific duties and responsibilities of the position of {savedFinalRevocationNotice.position}, which are:
                  <ul className="list-disc ml-6">
                    {savedFinalRevocationNotice.jobDuties.map((duty: string, idx: number) => duty && <li key={idx}>{duty}</li>)}
                  </ul>
                </li>
              </ol>
              <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>We believe your conviction record lessens your fitness/ability to perform the job duties and have made a final decision to revoke the job offer because:</div>
              <div className="mb-6" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>{savedFinalRevocationNotice.fitnessReason}</div>
              <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Request for Reconsideration:</div>
              <ul className="list-disc ml-6" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                {savedFinalRevocationNotice.reconsideration === 'none' && <li>We do not offer any way to challenge this decision or request reconsideration.</li>}
                {savedFinalRevocationNotice.reconsideration === 'procedure' && <li>If you would like to challenge this decision or request reconsideration, you may: {savedFinalRevocationNotice.reconsiderationProcedure}</li>}
              </ul>
              <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Your Right to File a Complaint:</div>
              <div className="mb-6" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>You also have the right to file a complaint with the Enforcement Unit of the San Diego County Office of Labor Standards and Enforcement within 180 days after the alleged violation of the San Diego County Fair Chance Ordinance. To file a complaint online or request information, visit the Office of Labor Standards and Enforcement online. You may also file a complaint by calling 858-694-2440.</div>
              <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Sincerely,<br />{savedFinalRevocationNotice.contactName}<br />{savedFinalRevocationNotice.companyName}<br />{savedFinalRevocationNotice.address}<br />{savedFinalRevocationNotice.phone}</div>

              {/* Document Metadata */}
              <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Document Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div>
                    <span className="font-medium text-black">Sent Date:</span> <span style={{ color: '#595959' }}>{new Date(savedFinalRevocationNotice.sentAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Sent By:</span> <span style={{ color: '#595959' }}>{savedFinalRevocationNotice.hrAdminName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Company:</span> <span style={{ color: '#595959' }}>{savedFinalRevocationNotice.companyName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Candidate ID:</span> <span style={{ color: '#595959' }}>{savedFinalRevocationNotice.candidateId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-4 mt-6">
              <PrintPreviewButton
                documentSelector=".prose"
                documentTitle="Final Job Revocation Notice"
              />
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowFinalRevocationViewModal(false)}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Slide-out Panel */}
      {showDocumentPanel && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40">
          <div
            className={`fixed right-0 top-0 h-full w-96 shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 ${showDocumentPanel ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                Document Upload
              </h2>
              <button
                className="p-2 rounded-xl transition-all duration-200 hover:bg-gray-100"
                style={{ color: '#595959' }}
                onClick={() => setShowDocumentPanel(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 h-full overflow-y-auto" style={{ backgroundColor: '#FFFFFF' }}>

              {/* Background Check Report Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                    <FileText className="h-5 w-5" style={{ color: '#E54747' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                      Background Check Report
                    </h3>
                    <p className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                      Upload the candidate's background check report
                    </p>
                  </div>
                </div>

                {!backgroundCheckFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-200 hover:border-gray-400 hover:bg-gray-50">
                    <input
                      type="file"
                      id="background-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleBackgroundCheckUpload(file);
                      }}
                      disabled={uploadingBackground}
                    />
                    <label htmlFor="background-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                          {uploadingBackground ? 'Uploading...' : 'Click to upload'}
                        </p>
                        <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                          PDF, JPEG, PNG, DOCX (max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                          <FileText className="h-5 w-5" style={{ color: '#E54747' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                            {backgroundCheckFile.name}
                          </p>
                          <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                            {(backgroundCheckFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDocument(backgroundCheckFile, 'background')}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}
                          title="View Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(backgroundCheckFile, backgroundCheckFile.name)}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-green-50"
                          style={{ color: '#10B981' }}
                          title="Download Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveFile('background')}
                          className="p-2 rounded-xl transition-all duration-200"
                          style={{ color: '#E54747' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Remove Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Policy Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
                    <Building className="h-5 w-5" style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                      Company Policy
                    </h3>
                    <p className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                      Upload the company's policy document
                    </p>
                  </div>
                </div>

                {!companyPolicyFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-200 hover:border-gray-400 hover:bg-gray-50">
                    <input
                      type="file"
                      id="companypolicy-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCompanyPolicyUpload(file);
                      }}
                      disabled={uploadingCompanyPolicy}
                    />
                    <label htmlFor="companypolicy-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                          <Building className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                          {uploadingCompanyPolicy ? 'Uploading...' : 'Click to upload'}
                        </p>
                        <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                          PDF, JPEG, PNG, DOCX (max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
                          <Building className="h-5 w-5" style={{ color: '#3B82F6' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                            {companyPolicyFile.name}
                          </p>
                          <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                            {(companyPolicyFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDocument(companyPolicyFile, 'companypolicy')}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}
                          title="View Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(companyPolicyFile, companyPolicyFile.name)}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-green-50"
                          style={{ color: '#10B981' }}
                          title="Download Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveFile('companypolicy')}
                          className="p-2 rounded-xl transition-all duration-200"
                          style={{ color: '#E54747' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Remove Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Job Description Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
                    <Building className="h-5 w-5" style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                      Job Description
                    </h3>
                    <p className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                      Upload the official job description document
                    </p>
                  </div>
                </div>

                {!jobDescriptionFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-200 hover:border-gray-400 hover:bg-gray-50">
                    <input
                      type="file"
                      id="jobdesc-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleJobDescriptionUpload(file);
                      }}
                      disabled={uploadingJobDesc}
                    />
                    <label htmlFor="jobdesc-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                          <Building className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                          {uploadingJobDesc ? 'Uploading...' : 'Click to upload'}
                        </p>
                        <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                          PDF, JPEG, PNG, DOCX (max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
                          <Building className="h-5 w-5" style={{ color: '#3B82F6' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                            {jobDescriptionFile.name}
                          </p>
                          <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                            {(jobDescriptionFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDocument(jobDescriptionFile, 'jobdesc')}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}
                          title="View Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(jobDescriptionFile, jobDescriptionFile.name)}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-green-50"
                          style={{ color: '#10B981' }}
                          title="Download Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveFile('jobdesc')}
                          className="p-2 rounded-xl transition-all duration-200"
                          style={{ color: '#E54747' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Remove Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Job Posting Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F0FDF4' }}>
                    <Briefcase className="h-5 w-5" style={{ color: '#10B981' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                      Job Posting
                    </h3>
                    <p className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                      Upload the official job posting document
                    </p>
                  </div>
                </div>

                {!jobPostingFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-200 hover:border-gray-400 hover:bg-gray-50">
                    <input
                      type="file"
                      id="jobposting-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleJobPostingUpload(file);
                      }}
                      disabled={uploadingJobPosting}
                    />
                    <label htmlFor="jobposting-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                          <Briefcase className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                          {uploadingJobPosting ? 'Uploading...' : 'Click to upload'}
                        </p>
                        <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                          PDF, JPEG, PNG, DOCX (max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F0FDF4' }}>
                          <Briefcase className="h-5 w-5" style={{ color: '#10B981' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                            {jobPostingFile.name}
                          </p>
                          <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                            {(jobPostingFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDocument(jobPostingFile, 'jobposting')}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}
                          title="View Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(jobPostingFile, jobPostingFile.name)}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-green-50"
                          style={{ color: '#10B981' }}
                          title="Download Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveFile('jobposting')}
                          className="p-2 rounded-xl transition-all duration-200"
                          style={{ color: '#E54747' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Remove Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Emails Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F3E8FF' }}>
                    <Mail className="h-5 w-5" style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                      Emails
                    </h3>
                    <p className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                      Upload any relevant emails related to the job application process
                    </p>
                  </div>
                </div>

                {!emailsFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-200 hover:border-gray-400 hover:bg-gray-50">
                    <input
                      type="file"
                      id="emails-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleEmailsUpload(file);
                      }}
                      disabled={uploadingEmails}
                    />
                    <label htmlFor="emails-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                          <Mail className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                          {uploadingEmails ? 'Uploading...' : 'Click to upload'}
                        </p>
                        <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                          PDF, JPEG, PNG, DOCX (max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F3E8FF' }}>
                          <Mail className="h-5 w-5" style={{ color: '#8B5CF6' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                            {emailsFile.name}
                          </p>
                          <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                            {(emailsFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDocument(emailsFile, 'emails')}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}
                          title="View Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(emailsFile, emailsFile.name)}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-green-50"
                          style={{ color: '#10B981' }}
                          title="Download Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveFile('emails')}
                          className="p-2 rounded-xl transition-all duration-200"
                          style={{ color: '#E54747' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Remove Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFFBEB' }}>
                    <StickyNote className="h-5 w-5" style={{ color: '#F59E0B' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                      Notes
                    </h3>
                    <p className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                      Upload any additional notes or comments you want to include
                    </p>
                  </div>
                </div>

                {!notesFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-200 hover:border-gray-400 hover:bg-gray-50">
                    <input
                      type="file"
                      id="notes-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleNotesUpload(file);
                      }}
                      disabled={uploadingNotes}
                    />
                    <label htmlFor="notes-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                          <StickyNote className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                          {uploadingNotes ? 'Uploading...' : 'Click to upload'}
                        </p>
                        <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                          PDF, JPEG, PNG, DOCX (max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFFBEB' }}>
                          <StickyNote className="h-5 w-5" style={{ color: '#F59E0B' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                            {notesFile.name}
                          </p>
                          <p className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                            {(notesFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDocument(notesFile, 'notes')}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}
                          title="View Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(notesFile, notesFile.name)}
                          className="p-2 rounded-xl transition-all duration-200 hover:bg-green-50"
                          style={{ color: '#10B981' }}
                          title="Download Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveFile('notes')}
                          className="p-2 rounded-xl transition-all duration-200"
                          style={{ color: '#E54747' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Remove Document"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Status */}
              {(backgroundCheckFile || jobDescriptionFile || jobPostingFile || emailsFile || notesFile || companyPolicyFile) && (
                <div className="border border-gray-200 rounded-xl p-4" style={{ backgroundColor: '#F9FAFB' }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                    Upload Status
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                        Time Remaining
                      </span>
                      <span className="text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif', color: '#E54747' }}>
                        5 days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                        Current Phase
                      </span>
                      <span className="text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif', color: '#E54747' }}>
                        {currentStep === 1 ? 'Conditional Offer' : 
                         currentStep === 2 ? 'Assessment' : 
                         currentStep === 3 ? 'Review' : 
                         currentStep === 4 ? 'Decision' : 
                         'Final Steps'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                        Assessment Progress
                      </span>
                      <span className="text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif', color: '#10B981' }}>
                        Step {currentStep} of {progressSteps.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="border border-gray-200 rounded-xl p-4" style={{ backgroundColor: '#F9FAFB' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                  Upload Guidelines
                </h4>
                <ul className="text-xs space-y-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                  <li>• Supported formats: PDF, JPEG, PNG, DOCX, DOC</li>
                  <li>• Maximum file size: 10MB per document</li>
                  <li>• Documents will be securely stored and accessible during the assessment</li>
                  <li>• Both documents are recommended for a complete assessment</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
              <button
                onClick={() => setShowDocumentPanel(false)}
                className="w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:opacity-90"
                style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747', color: '#FFFFFF' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentViewer && viewingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] relative border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${viewingDocument.type === 'background' ? 'bg-red-50' : viewingDocument.type === 'jobdesc' ? 'bg-blue-50' : viewingDocument.type === 'jobposting' ? 'bg-green-50' : viewingDocument.type === 'emails' ? 'bg-purple-50' : viewingDocument.type === 'notes' ? 'bg-yellow-50' : 'bg-gray-50'
                  }`}>
                  {viewingDocument.type === 'background' ? (
                    <FileText className="h-5 w-5" style={{ color: '#E54747' }} />
                  ) : viewingDocument.type === 'jobdesc' ? (
                    <Building className="h-5 w-5 text-blue-600" />
                  ) : viewingDocument.type === 'jobposting' ? (
                    <Briefcase className="h-5 w-5 text-green-600" />
                  ) : viewingDocument.type === 'emails' ? (
                    <Mail className="h-5 w-5 text-purple-600" />
                  ) : viewingDocument.type === 'notes' ? (
                    <StickyNote className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <Building className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {viewingDocument.title}
                  </h2>
                  <p className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                    {viewingDocument.file.name} • {(viewingDocument.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadDocument(viewingDocument.file, viewingDocument.file.name)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-all duration-200"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  Download
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => {
                    setShowDocumentViewer(false);
                    setViewingDocument(null);
                  }}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-hidden">
              {viewingDocument.file.type === 'application/pdf' ? (
                /* PDF Viewer */
                <iframe
                  src={getFilePreviewUrl(viewingDocument.file)}
                  className="w-full h-[70vh] border-0"
                  title={`${viewingDocument.title} Preview`}
                />
              ) : viewingDocument.file.type.startsWith('image/') ? (
                /* Image Viewer */
                <div className="flex items-center justify-center p-8 h-[70vh] bg-gray-50">
                  <img
                    src={getFilePreviewUrl(viewingDocument.file)}
                    alt={viewingDocument.title}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                  />
                </div>
              ) : (
                /* Unsupported File Type */
                <div className="flex flex-col items-center justify-center p-12 h-[70vh] bg-gray-50">
                  <div className="h-16 w-16 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Preview Not Available
                  </h3>
                  <p className="text-center mb-6 max-w-md" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                    This file type cannot be previewed in the browser. You can download the file to view it in an appropriate application.
                  </p>
                  <button
                    onClick={() => handleDownloadDocument(viewingDocument.file, viewingDocument.file.name)}
                    className="px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                    style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Download File
                  </button>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                <div>
                  File Type: {viewingDocument.file.type || 'Unknown'} •
                  Size: {(viewingDocument.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="flex items-center gap-4">
                  <span>Uploaded: {new Date().toLocaleDateString()}</span>
                  <span className="text-green-600 font-medium">✓ Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HR Action Timeline Slide-out Panel */}
      {showTimelinePanel && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40">
          <div
            className={`fixed right-0 top-0 h-full w-96 shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 ${showTimelinePanel ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                HR Action Timeline
              </h2>
              <button
                className="p-2 rounded-xl transition-all duration-200 hover:bg-gray-100"
                style={{ color: '#595959' }}
                onClick={() => setShowTimelinePanel(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 h-full overflow-y-auto" style={{ backgroundColor: '#FFFFFF' }}>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Timeline Items */}
                <div className="space-y-8">
                  
                  {/* 1. Invite Date */}
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: timelineData.inviteSent ? '#E54747' : '#9CA3AF' }}>
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Invite Sent
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {timelineData.inviteSent ? new Date(timelineData.inviteSent).toLocaleDateString() : 'Not sent'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Initial invitation email sent to candidate
                      </p>
                    </div>
                  </div>

                  {/* 2. Access Granted Date */}
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: timelineData.accessGranted ? '#10B981' : '#9CA3AF' }}>
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Access Granted
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {timelineData.accessGranted ? new Date(timelineData.accessGranted).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Candidate granted access to assessment portal
                      </p>
                    </div>
                  </div>

                  {/* 3. Candidate Response Received */}
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: timelineData.candidateResponse ? '#10B981' : '#9CA3AF' }}>
                      <ClipboardCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Candidate Response
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {timelineData.candidateResponse ? new Date(timelineData.candidateResponse).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Initial candidate assessment response
                      </p>
                    </div>
                  </div>

                  {/* 4. Conditional Job Offer */}
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: savedOfferLetter ? '#10B981' : '#9CA3AF' }}>
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Conditional Job Offer
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {savedOfferLetter ? new Date(savedOfferLetter.sentAt).toLocaleDateString() : 'Not sent'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Conditional job offer sent to candidate
                      </p>
                    </div>
                  </div>

                  {/* 5. Written Individualized Assessment */}
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: currentStep >= 3 ? '#10B981' : '#9CA3AF' }}>
                      <ClipboardCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Written Individualized Assessment
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {savedAssessment ? new Date(savedAssessment.sentAt).toLocaleDateString() : currentStep >= 3 ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Individual assessment conducted and documented
                      </p>

                      {/* Sub-items for Assessment */}
                      {currentStep >= 3 && (
                        <div className="ml-4 mt-3 space-y-2">
                          {/* Candidate Response Received */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: candidateProfile ? '#10B981' : '#9CA3AF' }}></div>
                              <p className="text-xs font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Candidate Response
                              </p>
                            </div>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {candidateProfile ? 'Received' : 'Pending'}
                            </p>
                          </div>

                          {/* Decision */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: currentStep >= 4 ? '#10B981' : '#9CA3AF' }}></div>
                              <p className="text-xs font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Decision
                              </p>
                            </div>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {savedAssessment && savedAssessment.decision === 'rescind' ? 'Decision: Pre-Adverse Action' : currentStep >= 4 ? 'Completed' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 6. Preliminary Job Offer Revocation */}
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: savedHireDecision ? '#10B981' : savedRevocationNotice ? '#F59E0B' : currentStep >= 4 ? '#F59E0B' : '#9CA3AF' }}>
                      {savedHireDecision ? (
                        <UserCheck className="h-5 w-5 text-white" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {savedHireDecision ? 'Preliminary Decision' : 'Preliminary Revocation'}
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {savedHireDecision ? new Date(savedHireDecision.sentAt).toLocaleDateString() : 
                           savedRevocationNotice ? new Date(savedRevocationNotice.sentAt).toLocaleDateString() : 
                           currentStep >= 4 ? 'In Progress' : 'Not reached'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {savedHireDecision ? 'Decision made to proceed with hire' : 
                         savedRevocationNotice ? 'Preliminary job offer revocation notice sent' : 
                         'Preliminary job offer revocation notice'}
                      </p>

                      {/* Sub-items for Preliminary Revocation */}
                      {(currentStep >= 4 || savedRevocationNotice || savedHireDecision || savedPreliminaryDecision) && (
                        <div className="ml-4 mt-3 space-y-2">
                          {/* 6a. Candidate Response Received */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#9CA3AF' }}></div>
                              <p className="text-xs font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Candidate Response
                              </p>
                            </div>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {savedHireDecision ? 'Not Required - Hired' : 'Pending'}
                            </p>
                          </div>

                          {/* 6b. Decision */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: (savedHireDecision || savedPreliminaryDecision) ? '#10B981' : '#9CA3AF' }}></div>
                              <p className="text-xs font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Decision
                              </p>
                            </div>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {savedHireDecision ? 'Decision: Hired' : 
                               savedPreliminaryDecision ? 'Decision: Pre-Adverse Action' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 7. Individual Reassessment */}
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: savedReassessment ? '#8B5CF6' : '#9CA3AF' }}>
                      <RotateCcw className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Individual Reassessment
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {savedReassessment ? new Date(savedReassessment.sentAt).toLocaleDateString() : 'Not sent'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Individual reassessment conducted
                      </p>

                      {/* Sub-items for Reassessment */}
                      {savedReassessment && (
                        <div className="ml-4 mt-3 space-y-2">
                          {/* 7a. Candidate Response Received */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#9CA3AF' }}></div>
                              <p className="text-xs font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Candidate Response
                              </p>
                            </div>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Pending
                            </p>
                          </div>

                          {/* 7b. Decision */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: savedReassessment && savedReassessment.decision ? '#10B981' : '#9CA3AF' }}></div>
                              <p className="text-xs font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Decision
                              </p>
                            </div>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {savedReassessment && savedReassessment.decision === 'extend' ? 'Decision: Hired' : 
                               savedReassessment && savedReassessment.decision === 'rescind' ? 'Decision: Adverse Action' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 8. Final Revocation Notice */}
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: (savedHireDecision && currentStep === 5) ? '#10B981' : savedFinalRevocationNotice ? '#DC2626' : '#9CA3AF' }}>
                      {(savedHireDecision && currentStep === 5) ? (
                        <UserCheck className="h-5 w-5 text-white" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {(savedHireDecision && currentStep === 5) ? 'Final Decision' : 'Final Revocation Notice'}
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {(savedHireDecision && currentStep === 5) ? new Date(savedHireDecision.sentAt).toLocaleDateString() :
                           savedFinalRevocationNotice ? new Date(savedFinalRevocationNotice.sentAt).toLocaleDateString() : 'Not sent'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {(savedHireDecision && currentStep === 5) ? 'Final decision made to extend offer of employment' : 'Final job offer revocation notice'}
                      </p>

                      {/* Sub-items for Final Revocation */}
                      {(savedFinalRevocationNotice || (savedHireDecision && currentStep === 5)) && (
                        <div className="ml-4 mt-3 space-y-2">
                          {/* 8a. Candidate Response Received */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#9CA3AF' }}></div>
                              <p className="text-xs font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Candidate Response
                              </p>
                            </div>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {(savedHireDecision && currentStep === 5) ? 'Not Required - Hired' : 'Pending'}
                            </p>
                          </div>

                          {/* 8b. Decision */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: ((savedHireDecision && currentStep === 5) || savedFinalRevocationNotice) ? '#10B981' : '#9CA3AF' }}></div>
                              <p className="text-xs font-medium text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Decision
                              </p>
                            </div>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {(savedHireDecision && currentStep === 5) ? 'Decision: Hired' :
                               savedFinalRevocationNotice ? 'Decision: Adverse Action' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Summary */}
              <div className="border border-gray-200 rounded-xl p-4 mt-8" style={{ backgroundColor: '#F9FAFB' }}>
                <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                  Process Status
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                      Time Remaining
                    </span>
                    <span className="text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif', color: '#E54747' }}>
                      5 days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                      Current Phase
                    </span>
                    <span className="text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif', color: '#E54747' }}>
                      {currentStep === 1 ? 'Conditional Offer' : 
                       currentStep === 2 ? 'Assessment' : 
                       currentStep === 3 ? 'Review' : 
                       currentStep === 4 ? 'Decision' : 
                       'Final Steps'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                      Assessment Progress
                    </span>
                    <span className="text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif', color: '#10B981' }}>
                      Step {currentStep} of {progressSteps.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
              <button
                onClick={() => setShowTimelinePanel(false)}
                className="w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:opacity-90"
                style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747', color: '#FFFFFF' }}
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
