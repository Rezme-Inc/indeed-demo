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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase";
import { sendOfferLetterEmail } from '@/app/restorative-record/utils/sendEmail';
import AssessmentProgressBar from "@/app/hr-admin/dashboard/[userId]/assessment/components/AssessmentProgressBar";
import ConditionalJobOfferLetter from "./components/ConditionalJobOfferLetter";
import IndividualizedAssessmentModal from "./components/IndividualizedAssessmentModal";
import PreliminaryRevocationModal from './components/PreliminaryRevocationModal';

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
  const [currentStep, setCurrentStep] = useState(1);
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

  // Critical Information Tab State
  const [activeTab, setActiveTab] = useState('Legal');

  // HR Admin profile state
  const [hrAdminProfile, setHrAdminProfile] = useState<any>(null);
  const [headerLoading, setHeaderLoading] = useState(true);

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
    clearAssessmentProgress();

    // Reset state
    setSavedOfferLetter(null);
    setSavedAssessment(null);
    setSavedRevocationNotice(null);
    setSavedReassessment(null);
    setSavedFinalRevocationNotice(null);
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
      sentDate: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      company: hrAdminProfile?.company || '',
      timestamp: Date.now()
    };

    try {
      const { data: candidateEmail, error: candidateEmailError } = await supabase
        .from("user_profiles")
        .select("email")
        .eq("id", params.userId)
        .single();

      if (candidateEmailError) {
        console.error("Error fetching candidate email:", candidateEmailError);
        return;
      }

      const offerLetterDataWithEmail = {
        ...offerLetterData,
        candidateEmail: candidateEmail.email
      };

      // Send the offer letter email
      const emailResult = await sendOfferLetterEmail(offerLetterDataWithEmail);

      if (!emailResult.success) {
        console.error("Failed to send offer letter email:", emailResult.error);
        // You might want to show an error message to the user here
      }

      setSavedOfferLetter(offerLetterDataWithEmail);
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
  const handleSendAssessment = () => {
    // Save the assessment with metadata
    const assessmentData = {
      ...assessmentForm,
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      companyName: hrAdminProfile?.company || '',
    };
    setSavedAssessment(assessmentData);
    setShowAssessmentModal(false);
    setAssessmentPreview(false);
    setInitialAssessmentResults({ ...assessmentForm });
    setCurrentStep((prev) => prev + 1);
    // You can add logic to send/store the assessment here
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

  const handleSendRevocation = () => {
    // Save the revocation notice with metadata
    const revocationData = {
      ...revocationForm,
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      companyName: hrAdminProfile?.company || '',
    };
    setSavedRevocationNotice(revocationData);

    setShowRevocationModal(false);
    setRevocationPreview(false);
    setRevocationSentDate(new Date());
    setCurrentStep((prev) => prev + 1);
    // You can add logic to send/store the revocation here
  };

  const handleProceedWithHire = () => {
    setShowExtendSuccessModal(true);
    // You can add logic to finalize the hire here
  };

  const handleReassessmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReassessmentForm({ ...reassessmentForm, [e.target.name]: e.target.value });
  };
  const handleSendReassessment = () => {
    // Save the reassessment with metadata
    const reassessmentData = {
      ...reassessmentForm,
      decision: reassessmentDecision,
      extendReason: reassessmentDecision === 'extend' ? extendReason : '',
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      companyName: hrAdminProfile?.company || '',
    };
    setSavedReassessment(reassessmentData);

    if (reassessmentDecision === 'extend') {
      setShowExtendSuccessModal(true);
    } else {
      setShowReassessmentSplit(false);
      setReassessmentPreview(false);
      setCurrentStep((prev) => prev + 1);
    }
    // You can add logic to send/store the reassessment here
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

  const handleSendFinalRevocation = () => {
    // Save the final revocation notice with metadata
    const finalRevocationData = {
      ...finalRevocationForm,
      sentAt: new Date().toISOString(),
      candidateId: params.userId,
      hrAdminName: hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : '',
      companyName: hrAdminProfile?.company || '',
    };
    setSavedFinalRevocationNotice(finalRevocationData);

    setShowFinalRevocationModal(false);
    setFinalRevocationPreview(false);
    setShowFinalRevocationSuccessModal(true);
  };

  // Function to fetch candidate's share token for iframe
  const fetchCandidateShareToken = async () => {
    setLoadingCandidateData(true);
    try {
      // Get the candidate's share_token and basic profile info
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('share_token, first_name, last_name, email')
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
          {savedOfferLetter && (
            <button
              onClick={handleViewOfferLetter}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-all duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <FileText className="h-4 w-4" />
              View Offer Letter
            </button>
          )}
          {savedAssessment && (
            <button
              onClick={() => setShowAssessmentViewModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-all duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <ClipboardCheck className="h-4 w-4" />
              View Assessment
            </button>
          )}
          {savedRevocationNotice && (
            <button
              onClick={() => setShowRevocationViewModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-all duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <AlertTriangle className="h-4 w-4" />
              View Revocation Notice
            </button>
          )}
          {savedReassessment && (
            <button
              onClick={() => setShowReassessmentViewModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-all duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <RotateCcw className="h-4 w-4" />
              View Reassessment
            </button>
          )}
          {savedFinalRevocationNotice && (
            <button
              onClick={() => setShowFinalRevocationViewModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-all duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <AlertCircle className="h-4 w-4" />
              View Final Revocation
            </button>
          )}
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
          </div>
          {/* Right Column: Main Content */}
          <div className="lg:col-span-5 space-y-8">
            {/* Main Question Card Placeholder */}
            {currentStep === 1 && (
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
                    className={`px-8 py-3 rounded-xl text-lg font-semibold flex items-center space-x-2 transition-all duration-200 ${
                      answers.conditional_offer 
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
            )}
            {currentStep === 2 && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                  <p className="text-lg mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    The following can be used by employers who would like to conduct an individualized assessment in writing to consider the relevance of past convictions to the job being offered. These assessments need to be done in writing, and held on file for at least one year.
                  </p>
                  <button 
                    className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200" 
                    onClick={() => setShowAssessmentModal(true)}
                    style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                  >
                    Begin Individualized Assessment
                  </button>
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
                  <p className="text-lg mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    The following may be used to inform a job applicant in writing of the intent to revoke a conditional job offer due to relevant criminal history
                  </p>
                  <div className="flex gap-4">
                    <button 
                      className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200" 
                      onClick={() => setShowRevocationModal(true)}
                      style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                    >
                      Issue Preliminary Job Offer Revocation
                    </button>
                    <button 
                      className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200" 
                      onClick={handleProceedWithHire}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Proceed with hire
                    </button>
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
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
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
                      <li>The candidate has 5 business days to respond with mitigating evidence</li>
                      <li>If they challenge the accuracy of the criminal history report, they will receive an additional 5 business days</li>
                      <li>You will be notified when the candidate submits their response</li>
                      <li>After reviewing their response, you must make a final decision</li>
                    </ul>
                  </div>
                  <div className="flex flex-row gap-4 mt-2">
                    <button 
                      className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200" 
                      onClick={handleProceedWithHire}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Proceed with hire
                    </button>
                    <button 
                      className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200" 
                      onClick={() => setShowReassessmentInfoModal(true)}
                      style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                    >
                      Begin Individualized Reassessment
                    </button>
                  </div>
                </div>
                {/* Informational Modal for Individualized Reassessment */}
                {showReassessmentInfoModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-10 relative border border-gray-200">
                      <h2 className="text-2xl font-bold mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Individualized Reassessment Information</h2>
                      <div className="text-lg mb-8" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                        After informing an applicant that you intend to revoke a job offer due to the applicant's criminal history, the applicant must be given at least 5 business days to provide mitigating evidence that speaks to their character and fitness to perform the job being offered. An additional 5 business days are required if the applicant intends to gather and deliver information disputing the accuracy of the criminal history report. During this reassessment process, the position must remain open, except in emergent circumstances. This following form can be used to conduct an individualized reassessment based on information provided by the applicant.
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
                <div className="flex-1 bg-white rounded-xl shadow p-8 border border-gray-200">
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
                      <h3 className="text-lg font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>No Restorative Record Available</h3>
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
                  <div className="w-full max-w-2xl">
                    <h2 className="text-3xl font-bold mb-8 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Final Compliance Step</h2>
                    <div className="text-lg mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                      <span className="font-semibold text-black">Once you have considered any mitigating information provided by the applicant, you may still decide to revoke the conditional job offer due to relevant criminal history.</span> <br />
                      The following notice meets your responsibility to notify the applicant in writing.
                    </div>
                    <div className="flex gap-4">
                      <button
                        className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 w-full"
                        onClick={handleProceedWithHire}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        Extend Offer of Employment
                      </button>
                      <button
                        className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200 w-full"
                        onClick={() => setShowFinalRevocationModal(true)}
                        style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                      >
                        Issue Final Revocation Notice
                      </button>
                    </div>
                  </div>
                </div>
                {/* Final Revocation Notice Modal */}
                {showFinalRevocationModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full p-16 relative max-h-screen overflow-y-auto border border-gray-200">
                      <h2 className="text-2xl font-bold mb-6 text-center text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Notice of Final Decision to Revoke Job Offer Because of Conviction History</h2>
                      {!finalRevocationPreview ? (
                        <form className="space-y-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold mb-1 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Date</label>
                              <input type="date" name="date" value={finalRevocationForm.date} onChange={handleFinalRevocationFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Applicant Name</label>
                              <input type="text" name="applicant" value={finalRevocationForm.applicant} onChange={handleFinalRevocationFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Date of Notice</label>
                              <input type="date" name="dateOfNotice" value={finalRevocationForm.dateOfNotice} onChange={handleFinalRevocationFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                          </div>
                          <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Re: Final Decision to Revoke Job Offer Because of Conviction History</div>
                          <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Dear {finalRevocationForm.applicant || '[APPLICANT NAME]'}:</div>
                          <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>We are following up about our letter dated {finalRevocationForm.dateOfNotice || '[DATE OF NOTICE]'} which notified you of our initial decision to revoke (take back) the conditional job offer:</div>
                          <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>(Please check one:)</div>
                          <div className="flex flex-col gap-4 mb-8">
                            <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              <input type="checkbox" name="noResponse" checked={finalRevocationForm.noResponse} onChange={handleFinalRevocationFormChange} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} />
                              We did not receive a timely response from you after sending you that letter, and our decision to revoke the job offer is now final.
                            </label>
                            <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              <input type="checkbox" name="infoSubmitted" checked={finalRevocationForm.infoSubmitted} onChange={handleFinalRevocationFormChange} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} />
                              We made a final decision to revoke the job offer after considering the information you submitted, which included:
                            </label>
                            {finalRevocationForm.infoSubmitted && (
                              <textarea name="infoSubmittedList" value={finalRevocationForm.infoSubmittedList} onChange={handleFinalRevocationFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 min-h-[40px] focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="List information submitted" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            )}
                          </div>
                          <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>After reviewing the information you submitted, we have determined that there
                            <label className="ml-4 font-normal inline-flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              <input type="radio" name="errorOnReport" value="was" checked={finalRevocationForm.errorOnReport === 'was'} onChange={handleFinalRevocationFormChange} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} /> was
                            </label>
                            <label className="ml-4 font-normal inline-flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              <input type="radio" name="errorOnReport" value="was not" checked={finalRevocationForm.errorOnReport === 'was not'} onChange={handleFinalRevocationFormChange} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} /> was not
                            </label>
                            (check one) an error on your conviction history report. We have decided to revoke our job offer because of the following conviction(s):</div>
                          <div className="flex flex-col gap-2 mb-8">
                            {[0, 1, 2].map((idx) => (
                              <input
                                key={idx}
                                type="text"
                                value={finalRevocationForm.convictions[idx]}
                                onChange={e => handleFinalRevocationArrayChange('convictions', idx, e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder={`Conviction ${idx + 1}`}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                              />
                            ))}
                          </div>
                          <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Individualized Assessment:</div>
                          <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>We have individually assessed whether your conviction history is directly related to the duties of the job we offered you. We considered the following:</div>
                          <ol className="list-decimal ml-8 mb-8 space-y-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: <input type="text" name="seriousReason" value={finalRevocationForm.seriousReason} onChange={handleFinalRevocationFormChange} className="border border-gray-300 rounded-xl px-2 py-1 w-2/3 inline-block focus:ring-2 focus:ring-red-500 focus:border-red-500" style={{ fontFamily: 'Poppins, sans-serif' }} /></li>
                            <li>How long ago the conduct occurred that led to your conviction, which was: <input type="text" name="timeSinceConduct" value={finalRevocationForm.timeSinceConduct} onChange={handleFinalRevocationFormChange} className="border border-gray-300 rounded-xl px-2 py-1 w-1/3 inline-block focus:ring-2 focus:ring-red-500 focus:border-red-500" style={{ fontFamily: 'Poppins, sans-serif' }} /> and how long ago you completed your sentence, which was: <input type="text" name="timeSinceSentence" value={finalRevocationForm.timeSinceSentence} onChange={handleFinalRevocationFormChange} className="border border-gray-300 rounded-xl px-2 py-1 w-1/3 inline-block focus:ring-2 focus:ring-red-500 focus:border-red-500" style={{ fontFamily: 'Poppins, sans-serif' }} />.</li>
                            <li>The specific duties and responsibilities of the position of <input type="text" name="position" value={finalRevocationForm.position} onChange={handleFinalRevocationFormChange} className="border border-gray-300 rounded-xl px-2 py-1 w-1/2 inline-block mx-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="[INSERT POSITION]" style={{ fontFamily: 'Poppins, sans-serif' }} />, which are:
                              <div className="flex flex-col gap-2 mt-2">
                                {[0, 1, 2, 3].map((idx) => (
                                  <input
                                    key={idx}
                                    type="text"
                                    value={finalRevocationForm.jobDuties[idx]}
                                    onChange={e => handleFinalRevocationArrayChange('jobDuties', idx, e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-2 py-1 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder={`Job Duty ${String.fromCharCode(97 + idx)}`}
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                  />
                                ))}
                              </div>
                            </li>
                          </ol>
                          <div className="mb-6 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>We believe your conviction record lessens your fitness/ability to perform the job duties and have made a final decision to revoke the job offer because:</div>
                          <textarea name="fitnessReason" value={finalRevocationForm.fitnessReason} onChange={handleFinalRevocationFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 min-h-[60px] mb-8 focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Outline reasoning for decision to revoke job offer based on relevance of conviction history to position" style={{ fontFamily: 'Poppins, sans-serif' }} />
                          <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Request for Reconsideration:</div>
                          <div className="flex flex-col gap-4 mb-8">
                            <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              <input type="checkbox" name="reconsideration" value="none" checked={finalRevocationForm.reconsideration === 'none'} onChange={() => setFinalRevocationForm((prev: any) => ({ ...prev, reconsideration: prev.reconsideration === 'none' ? '' : 'none' }))} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} />
                              We do not offer any way to challenge this decision or request reconsideration.
                            </label>
                            <label className="flex items-center gap-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              <input type="checkbox" name="reconsideration" value="procedure" checked={finalRevocationForm.reconsideration === 'procedure'} onChange={() => setFinalRevocationForm((prev: any) => ({ ...prev, reconsideration: prev.reconsideration === 'procedure' ? '' : 'procedure' }))} className="h-4 w-4 focus:ring-2 focus:ring-red-500" style={{ accentColor: '#E54747' }} />
                              If you would like to challenge this decision or request reconsideration, you may:
                            </label>
                            {finalRevocationForm.reconsideration === 'procedure' && (
                              <textarea name="reconsiderationProcedure" value={finalRevocationForm.reconsiderationProcedure} onChange={handleFinalRevocationFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 min-h-[40px] focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Describe internal procedure" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            )}
                          </div>
                          <div className="mb-6 font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Your Right to File a Complaint:</div>
                          <div className="text-sm mb-8" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>
                            If you believe your rights under the California Fair Chance Act or the San Diego County Fair Chance Ordinance have been violated during this job application process, you have the right to file a complaint with the California Civil Rights Department (CRD) and/or the San Diego County Office of Labor Standards and Enforcement (OLSE). There are several ways to file a complaint:
                            <ul className="list-disc ml-6">
                              <li>California CRD:
                                <ul className="list-disc ml-6">
                                  <li>File a complaint online at the following link: ccrs.calcivilrights.ca.gov/s/</li>
                                  <li>Download an intake form at the following link: calcivilrights.ca.gov/complaintprocess/filebymail/ and email it to contact.center@calcivilrights.gov or mail it to 2218 Kausen Drive, Suite 100, Elk Grove, CA 95758</li>
                                  <li>Visit a CRD office. Click the following link for office locations: calcivilrights.ca.gov/locations/</li>
                                  <li>Call California CRD at (800) 884-1684</li>
                                </ul>
                              </li>
                              <li>San Diego County OLSE:
                                <ul className="list-disc ml-6">
                                  <li>File a complaint online at the following link: www.sandiegocounty.gov/content/sdc/OLSE/file-a-complaint.html</li>
                                  <li>Visit San Diego County's Office of Labor Standards and Enforcement's office at 1600 Pacific Highway, Room 452, San Diego, CA 92101</li>
                                  <li>Call San Diego County OLSE at 619-531-5129</li>
                                </ul>
                              </li>
                            </ul>
                          </div>
                          <div className="grid grid-cols-2 gap-10 mb-8">
                            <div>
                              <label className="block text-sm font-semibold mb-1 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Employer contact person name</label>
                              <input type="text" name="contactName" value={finalRevocationForm.contactName} onChange={handleFinalRevocationFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Employer company name</label>
                              <input type="text" name="companyName" value={finalRevocationForm.companyName} onChange={handleFinalRevocationFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Employer address</label>
                              <input type="text" name="address" value={finalRevocationForm.address} onChange={handleFinalRevocationFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Employer contact phone number</label>
                              <input type="text" name="phone" value={finalRevocationForm.phone} onChange={handleFinalRevocationFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                          </div>
                          <div className="flex justify-end mt-12 gap-6">
                            <button type="button" className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200" onClick={() => setFinalRevocationPreview(true)} style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}>
                              Preview
                            </button>
                            <button type="button" className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200" onClick={() => setShowFinalRevocationModal(false)} style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Cancel
                            </button>
                            <button type="button" className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200" onClick={handleSendFinalRevocation} style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}>Send</button>
                          </div>
                        </form>
                      ) : (
                        <div className="prose max-w-none text-black text-base bg-white rounded-xl p-16 border border-gray-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <div className="mb-6">{finalRevocationForm.date}</div>
                          <div className="mb-6 font-bold">Re: Final Decision to Revoke Job Offer Because of Conviction History</div>
                          <div className="mb-6">Dear {finalRevocationForm.applicant || '[APPLICANT NAME]'}:</div>
                          <div className="mb-6">We are following up about our letter dated {finalRevocationForm.dateOfNotice || '[DATE OF NOTICE]'} which notified you of our initial decision to revoke (take back) the conditional job offer:</div>
                          <div className="mb-6 font-semibold">(Please check one:)</div>
                          <ul className="list-disc ml-6" style={{ color: '#595959' }}>
                            {finalRevocationForm.noResponse && <li>We did not receive a timely response from you after sending you that letter, and our decision to revoke the job offer is now final.</li>}
                            {finalRevocationForm.infoSubmitted && <li>We made a final decision to revoke the job offer after considering the information you submitted, which included: {finalRevocationForm.infoSubmittedList}</li>}
                          </ul>
                          <div className="mb-6">After reviewing the information you submitted, we have determined that there
                            <span className="font-semibold">{finalRevocationForm.errorOnReport === 'was' ? 'was' : finalRevocationForm.errorOnReport === 'was not' ? 'was not' : '[check one]'}</span> (check one) an error on your conviction history report. We have decided to revoke our job offer because of the following conviction(s):</div>
                          <ul className="list-disc ml-6" style={{ color: '#595959' }}>
                            {finalRevocationForm.convictions.map((conv, idx) => conv && <li key={idx}>{conv}</li>)}
                          </ul>
                          <div className="mb-6 font-semibold">Our Individualized Assessment:</div>
                          <ol className="list-decimal ml-8 mb-8 space-y-4" style={{ color: '#595959' }}>
                            <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: {finalRevocationForm.seriousReason}</li>
                            <li>How long ago the conduct occurred that led to your conviction, which was: {finalRevocationForm.timeSinceConduct} and how long ago you completed your sentence, which was: {finalRevocationForm.timeSinceSentence}.</li>
                            <li>The specific duties and responsibilities of the position of {finalRevocationForm.position}, which are:
                              <ul className="list-disc ml-6">
                                {finalRevocationForm.jobDuties.map((duty: string, idx: number) => duty && <li key={idx}>{duty}</li>)}
                              </ul>
                            </li>
                          </ol>
                          <div className="mb-6">We believe your conviction record lessens your fitness/ability to perform the job duties and have made a final decision to revoke the job offer because:</div>
                          <div className="mb-6">{finalRevocationForm.fitnessReason}</div>
                          <div className="mb-6 font-semibold">Request for Reconsideration:</div>
                          <ul className="list-disc ml-6" style={{ color: '#595959' }}>
                            {finalRevocationForm.reconsideration === 'none' && <li>We do not offer any way to challenge this decision or request reconsideration.</li>}
                            {finalRevocationForm.reconsideration === 'procedure' && <li>If you would like to challenge this decision or request reconsideration, you may: {finalRevocationForm.reconsiderationProcedure}</li>}
                          </ul>
                          <div className="mb-6 font-semibold">Your Right to File a Complaint:</div>
                          <div className="mb-6" style={{ color: '#595959' }}>You also have the right to file a complaint with the Enforcement Unit of the San Diego County Office of Labor Standards and Enforcement within 180 days after the alleged violation of the San Diego County Fair Chance Ordinance. To file a complaint online or request information, visit the Office of Labor Standards and Enforcement online. You may also file a complaint by calling 858-694-2440.</div>
                          <div className="mb-6">Sincerely,<br />{finalRevocationForm.contactName}<br />{finalRevocationForm.companyName}<br />{finalRevocationForm.address}<br />{finalRevocationForm.phone}</div>

                          {/* Document Metadata */}
                          <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 rounded-xl p-4">
                            <h3 className="text-lg font-semibold mb-3 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Document Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              <div>
                                <span className="font-medium text-black">Status:</span> <span style={{ color: '#595959' }}>Preview - Not Sent</span>
                              </div>
                              <div>
                                <span className="font-medium text-black">Prepared By:</span> <span style={{ color: '#595959' }}>{hrAdminProfile ? `${hrAdminProfile.first_name} ${hrAdminProfile.last_name}` : 'HR Admin'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-black">Company:</span> <span style={{ color: '#595959' }}>{hrAdminProfile?.company || finalRevocationForm.companyName || 'Company Name'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-black">Candidate ID:</span> <span style={{ color: '#595959' }}>{params.userId}</span>
                              </div>
                            </div>
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex justify-end mt-8 gap-4">
                            <button
                              type="button"
                              className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                              onClick={() => setFinalRevocationPreview(false)}
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                              onClick={() => setShowFinalRevocationModal(false)}
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="px-8 py-3 rounded-xl text-lg font-semibold text-white hover:opacity-90 transition-all duration-200"
                              onClick={handleSendFinalRevocation}
                              style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            {/* Critical Information Section Placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                {activeTab === 'Legal' && (
                  <div className="space-y-4">
                    {currentStep === 1 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>San Diego Fair Chance Ordinance Requirements</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Internal policy requires documented confirmation of conditional offer before accessing any conviction history information. This ensures compliance with local fair chance hiring legislation.</p>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Individualized Assessment Guidelines</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Legal requirements for conducting fair and compliant individualized assessments under San Diego Fair Chance Ordinance will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Preliminary Decision Legal Framework</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Legal guidelines for preliminary job offer decisions and revocation procedures will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 4 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Reassessment Legal Requirements</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Legal framework for conducting reassessments and handling candidate responses will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 5 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Final Decision Legal Compliance</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Legal requirements for final hiring decisions and documentation will be displayed here.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Company Policy' && (
                  <div className="space-y-4">
                    {currentStep === 1 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Conditional Offer Policy</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Company-specific policies regarding conditional job offers and documentation requirements will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Assessment Procedures</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Internal company policies for conducting individualized assessments will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Decision Making Policy</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Company policies for preliminary hiring decisions and notification procedures will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 4 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Reassessment Guidelines</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Company policies for handling candidate responses and conducting reassessments will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 5 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Final Decision Policy</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Company policies for final hiring decisions and record keeping will be displayed here.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Candidate Context' && (
                  <div className="space-y-4">
                    {currentStep === 1 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Candidate Background</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Relevant candidate information and context for the conditional offer stage will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Assessment Context</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Candidate-specific context and considerations for the individualized assessment will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Decision Context</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Relevant candidate context for preliminary decision making will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 4 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Response Context</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Candidate response and relevant context for reassessment will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 5 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Final Decision Context</h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', color: '#595959' }}>Complete candidate context for final hiring decision will be displayed here.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowOfferLetterModal(false)}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Close
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                onClick={() => {
                  const printContent = document.querySelector('.prose:last-of-type');
                  if (printContent) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Conditional Job Offer Letter</title>
                            <style>
                              body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #000000; }
                              .font-bold, b { font-weight: bold; }
                              .mb-6 { margin-bottom: 1.5rem; }
                              .mb-8 { margin-bottom: 2rem; }
                              .font-semibold { font-weight: 600; }
                              .mb-2 { margin-bottom: 0.5rem; }
                            </style>
                          </head>
                          <body>${printContent.innerHTML}</body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
              >
                <Printer className="h-4 w-4" />
                Print/Save
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
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowAssessmentViewModal(false)}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Close
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                onClick={() => {
                  const printContent = document.querySelector('.prose:last-of-type');
                  if (printContent) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Criminal History Individual Assessment Form</title>
                            <style>
                              body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #000000; }
                              .font-bold { font-weight: bold; }
                              .font-semibold { font-weight: 600; }
                              .mt-2 { margin-top: 0.5rem; }
                              .mt-6 { margin-top: 1.5rem; }
                              .mb-2 { margin-bottom: 0.5rem; }
                              .mb-4 { margin-bottom: 1rem; }
                              .mb-6 { margin-bottom: 1.5rem; }
                              .list-disc { list-style-type: disc; }
                              .ml-6 { margin-left: 1.5rem; }
                              .space-y-2 > * + * { margin-top: 0.5rem; }
                              .space-y-4 > * + * { margin-top: 1rem; }
                            </style>
                          </head>
                          <body>${printContent.innerHTML}</body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
              >
                <Printer className="h-4 w-4" />
                Print/Save
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
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowRevocationViewModal(false)}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Close
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                onClick={() => {
                  const printContent = document.querySelector('.prose:last-of-type');
                  if (printContent) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Notice of Preliminary Decision to Revoke Job Offer</title>
                            <style>
                              body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #000000; }
                              .font-bold, b { font-weight: bold; }
                              .font-semibold { font-weight: 600; }
                              .mb-2 { margin-bottom: 0.5rem; }
                              .mt-8 { margin-top: 2rem; }
                              .list-disc { list-style-type: disc; }
                              .list-decimal { list-style-type: decimal; }
                              .ml-6 { margin-left: 1.5rem; }
                              .text-xs { font-size: 0.75rem; }
                            </style>
                          </head>
                          <body>${printContent.innerHTML}</body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
              >
                <Printer className="h-4 w-4" />
                Print/Save
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
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowReassessmentViewModal(false)}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Close
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                onClick={() => {
                  const printContent = document.querySelector('.prose:last-of-type');
                  if (printContent) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Individualized Reassessment Form</title>
                            <style>
                              body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #000000; }
                              .font-bold { font-weight: bold; }
                              .font-semibold { font-weight: 600; }
                              .mt-2 { margin-top: 0.5rem; }
                              .mt-4 { margin-top: 1rem; }
                              .mt-6 { margin-top: 1.5rem; }
                              .mt-8 { margin-top: 2rem; }
                              .mb-2 { margin-bottom: 0.5rem; }
                              .mb-3 { margin-bottom: 0.75rem; }
                              .mb-4 { margin-bottom: 1rem; }
                              .mb-6 { margin-bottom: 1.5rem; }
                              .space-y-2 > * + * { margin-top: 0.5rem; }
                              .space-y-4 > * + * { margin-top: 1rem; }
                            </style>
                          </head>
                          <body>${printContent.innerHTML}</body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
              >
                <Printer className="h-4 w-4" />
                Print/Save
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
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowFinalRevocationViewModal(false)}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Close
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#E54747' }}
                onClick={() => {
                  const printContent = document.querySelector('.prose:last-of-type');
                  if (printContent) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Notice of Final Decision to Revoke Job Offer</title>
                            <style>
                              body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #000000; }
                              .font-bold, b { font-weight: bold; }
                              .font-semibold { font-weight: 600; }
                              .mb-2 { margin-bottom: 0.5rem; }
                              .mb-6 { margin-bottom: 1.5rem; }
                              .mt-8 { margin-top: 2rem; }
                              .list-disc { list-style-type: disc; }
                              .list-decimal { list-style-type: decimal; }
                              .ml-6 { margin-left: 1.5rem; }
                              .ml-8 { margin-left: 2rem; }
                              .space-y-4 > * + * { margin-top: 1rem; }
                            </style>
                          </head>
                          <body>${printContent.innerHTML}</body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }
                }}
              >
                <Printer className="h-4 w-4" />
                Print/Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
