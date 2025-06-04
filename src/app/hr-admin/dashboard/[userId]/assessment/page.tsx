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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase";

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
  
  // Critical Information Tab State
  const [activeTab, setActiveTab] = useState('Legal');

  // HR Admin profile state
  const [hrAdminProfile, setHrAdminProfile] = useState<any>(null);
  const [headerLoading, setHeaderLoading] = useState(true);

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
    console.log("Setting answer:", questionId, answer);
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: answer };
      console.log("New answers state:", newAnswers);
      return newAnswers;
    });
  };

  const handleNext = () => {
    console.log("Moving to next step from:", currentStep);
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

  const allFieldsFilled = offerForm.date && offerForm.applicant && offerForm.position && offerForm.employer;

  const currentQuestion = questions[currentStep - 1];
  console.log("Current question:", currentQuestion);
  console.log("Current step:", currentStep);
  console.log("Current answers:", answers);

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

  const handleSendOffer = () => {
    setShowOfferModal(false);
    handleNext();
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

  const businessDaysRemaining = revocationSentDate ? getBusinessDaysRemaining(revocationSentDate) : 5;

  const handleSendRevocation = () => {
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
    if (reassessmentDecision === 'extend') {
      setShowExtendSuccessModal(true);
    } else {
      setShowReassessmentSplit(false);
      setReassessmentPreview(false);
      setCurrentStep((prev) => prev + 1);
    }
    // You can add logic to send/store the reassessment here
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Sleek Sticky Header */}
      <header className="w-full bg-white shadow-sm flex items-center justify-between px-8 py-4 mb-8 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="text-black font-bold text-xl tracking-tight flex items-center">
            <span className="mr-2">
              réz<span className="text-red-500">me</span>.
            </span>
            <span className="font-semibold text-gray-800 text-lg">
              {headerLoading ? <span className="animate-pulse text-gray-400">Loading...</span> : hrAdminProfile?.company || ""}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {headerLoading ? (
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
          ) : hrAdminProfile ? (
            <>
              <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-lg mr-2">
                {hrAdminProfile.first_name?.[0]}{hrAdminProfile.last_name?.[0]}
              </div>
              <span className="text-gray-800 font-medium text-base">{hrAdminProfile.first_name} {hrAdminProfile.last_name}</span>
            </>
          ) : null}
        </div>
      </header>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Left Column: Assessment Progress */}
          <div className="lg:col-span-1 lg:-ml-16">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">Assessment Progress</h2>
                      <div className="space-y-4">
                {progressSteps.map((step, idx) => (
                  <div
                    key={step}
                    className={`flex items-center px-3 py-2 rounded border transition-colors ${
                      currentStep - 1 === idx
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span
                      className={`mr-2 h-4 w-4 flex items-center justify-center rounded-full border-2 ${
                        currentStep - 1 === idx
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      {currentStep - 1 > idx ? (
                        <svg className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <span className="block h-1 w-1 rounded-full bg-current"></span>
                      )}
                    </span>
                    <span className={`font-medium text-sm ${currentStep - 1 === idx ? "text-red-600" : "text-gray-800"}`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* San Diego Fair Chance Ordinance Legal Overview Card */}
            <div className="bg-white rounded-lg shadow p-4 mb-8">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl text-red-500">📄</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">San Diego Fair Chance Ordinance Legal Overview</h3>
                  <button 
                    className="px-3 py-2 border border-red-400 text-red-500 text-xs rounded hover:bg-red-50"
                    onClick={() => router.push(`/hr-admin/dashboard/${params.userId}/assessment/ordinance-summary`)}
                  >
                    View Ordinance Summary
                  </button>
                </div>
              </div>
            </div>
            
            {/* View Candidate Response Button */}
            <div className="bg-white rounded-lg shadow p-4 mb-8">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl text-blue-500">👤</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Candidate Information</h3>
                  <button 
                    className="px-3 py-2 border border-blue-400 text-blue-500 text-xs rounded hover:bg-blue-50"
                    onClick={() => setShowCandidateResponseModal(true)}
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
              <div className="bg-white rounded-lg shadow p-8 mb-8 border border-gray-200">
                <h2 className="text-3xl font-bold mb-8">Confirm Conditional Offer</h2>
                <div className="space-y-6 mb-10">
                  <label className="flex items-center space-x-4 cursor-pointer">
                            <input
                              type="radio"
                      name="conditional_offer"
                      value="Yes"
                      checked={answers.conditional_offer === "Yes"}
                      onChange={() => handleAnswer("conditional_offer", "Yes")}
                      className="h-7 w-7 text-red-500 border-2 border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-xl text-gray-900">Yes, a conditional offer has been extended</span>
                  </label>
                  <label className="flex items-center space-x-4 cursor-pointer">
                    <input
                      type="radio"
                      name="conditional_offer"
                      value="No"
                      checked={answers.conditional_offer === "No"}
                      onChange={() => handleAnswer("conditional_offer", "No")}
                      className="h-7 w-7 text-red-500 border-2 border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-xl text-gray-900">No, a conditional offer has not been extended</span>
                  </label>
                          </div>
                <div className="flex justify-between items-center mt-8">
                  <button className="px-8 py-3 bg-gray-100 text-gray-400 rounded text-lg font-semibold cursor-not-allowed" disabled>Previous</button>
                  <button
                    className={`px-8 py-3 rounded text-lg font-semibold flex items-center space-x-2 ${answers.conditional_offer ? "bg-red-300 text-white hover:bg-red-400" : "bg-red-100 text-red-300 cursor-not-allowed"}`}
                    onClick={handleNextConditionalOffer}
                    disabled={!answers.conditional_offer}
                  >
                    Next <span className="ml-2">→</span>
                  </button>
                      </div>
                {/* Modal for Conditional Job Offer Letter */}
                {showOfferModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto">
                      <h2 className="text-2xl font-bold mb-6">Sample Conditional Job Offer Letter</h2>
                      <div className="prose max-w-none text-gray-900 text-base">
                        <div className="mb-2">
                          {editingField === "date" ? (
                            <input
                              type="date"
                              name="date"
                              value={offerForm.date}
                              onChange={handleFieldChange}
                              onBlur={handleFieldBlur}
                              onKeyDown={handleFieldKeyDown}
                              autoFocus
                              className="border rounded px-2 py-1"
                            />
                          ) : (
                            <span className="font-semibold cursor-pointer" onClick={() => handleFieldEdit("date")}>{offerForm.date || "[DATE]"}</span>
                          )}
                    </div>
                        <div className="mb-2">RE: Conditional Offer of Employment & Notice of Conviction Background Check</div>
                        <div className="mb-2">
                          Dear {editingField === "applicant" ? (
                            <input
                              type="text"
                              name="applicant"
                              value={offerForm.applicant}
                              onChange={handleFieldChange}
                              onBlur={handleFieldBlur}
                              onKeyDown={handleFieldKeyDown}
                              autoFocus
                              className="border rounded px-2 py-1"
                            />
                          ) : (
                            <span className="font-semibold cursor-pointer" onClick={() => handleFieldEdit("applicant")}>{offerForm.applicant || "[APPLICANT NAME]"}</span>
                          )}:
                        </div>
                        <div className="mb-2">
                          We are writing to make you a conditional offer of employment for the position of {editingField === "position" ? (
                            <input
                              type="text"
                              name="position"
                              value={offerForm.position}
                              onChange={handleFieldChange}
                              onBlur={handleFieldBlur}
                              onKeyDown={handleFieldKeyDown}
                              autoFocus
                              className="border rounded px-2 py-1"
                            />
                          ) : (
                            <span className="font-semibold cursor-pointer" onClick={() => handleFieldEdit("position")}>{offerForm.position || "[INSERT POSITION]"}</span>
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
                              type="text"
                              name="employer"
                              value={offerForm.employer}
                              onChange={handleFieldChange}
                              onBlur={handleFieldBlur}
                              onKeyDown={handleFieldKeyDown}
                              autoFocus
                              className="border rounded px-2 py-1"
                            />
                          ) : (
                            <span className="font-semibold cursor-pointer" onClick={() => handleFieldEdit("employer")}>{offerForm.employer || "[EMPLOYER]"}</span>
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
                )}
              </div>
            )}
            {currentStep === 2 && (
              <>
                <div className="bg-white rounded-lg shadow p-8 mb-8 border border-gray-200">
                  <p className="text-lg mb-6">
                    The following can be used by employers who would like to conduct an individualized assessment in writing to consider the relevance of past convictions to the job being offered. These assessments need to be done in writing, and held on file for at least one year.
                  </p>
                  <button className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600" onClick={() => setShowAssessmentModal(true)}>
                    Begin Individualized Assessment
                  </button>
                </div>
                {/* Modal for Individualized Assessment */}
                {showAssessmentModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto">
                      <h2 className="text-2xl font-bold mb-6">Criminal History Individual Assessment Form</h2>
                      <div className="flex justify-end mb-4">
                        <button
                          className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold mr-2"
                          onClick={() => setAssessmentPreview(!assessmentPreview)}
                        >
                          {assessmentPreview ? 'Edit' : 'Preview'}
                        </button>
                        <button
                          className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold"
                          onClick={() => setShowAssessmentModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                      {!assessmentPreview ? (
                        <form className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold mb-1">Employer Name</label>
                              <input type="text" name="employer" value={assessmentForm.employer} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Applicant Name</label>
                              <input type="text" name="applicant" value={assessmentForm.applicant} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Position Applied For</label>
                              <input type="text" name="position" value={assessmentForm.position} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Date of Conditional Offer</label>
                              <input type="date" name="offerDate" value={assessmentForm.offerDate} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Date of Assessment</label>
                              <input type="date" name="assessmentDate" value={assessmentForm.assessmentDate} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Date of Criminal History Report</label>
                              <input type="date" name="reportDate" value={assessmentForm.reportDate} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Assessment Performed by</label>
                              <input type="text" name="performedBy" value={assessmentForm.performedBy} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">1. The specific duties and responsibilities of the job are:</label>
                            {[0, 1, 2, 3].map((idx) => (
                              <input
                                key={idx}
                                type="text"
                                value={assessmentForm.duties[idx]}
                                onChange={e => handleAssessmentArrayChange('duties', idx, e.target.value)}
                                className="w-full border rounded px-3 py-2 mb-2"
                                placeholder={`Duty ${String.fromCharCode(97 + idx)}`}
                              />
                            ))}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">2. Description of the criminal conduct and why the conduct is of concern with respect to the position in question</label>
                            <textarea name="conduct" value={assessmentForm.conduct} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2 min-h-[60px]" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">3. How long ago did the criminal activity occur:</label>
                            <input type="text" name="howLongAgo" value={assessmentForm.howLongAgo} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">4. Activities since criminal activity, such as work experience, job training, rehabilitation, community service, etc.:</label>
                            {[0, 1, 2].map((idx) => (
                              <input
                                key={idx}
                                type="text"
                                value={assessmentForm.activities[idx]}
                                onChange={e => handleAssessmentArrayChange('activities', idx, e.target.value)}
                                className="w-full border rounded px-3 py-2 mb-2"
                                placeholder={`Activity ${String.fromCharCode(97 + idx)}`}
                              />
                            ))}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">Based on the factors above, we are considering rescinding our offer of employment because (describe the link between the specific aspects of the applicant's criminal history with risks inherent in the duties of the employment position):</label>
                            <textarea name="rescindReason" value={assessmentForm.rescindReason} onChange={handleAssessmentFormChange} className="w-full border rounded px-3 py-2 min-h-[60px]" />
                          </div>
                          <div className="flex justify-end mt-8">
                            <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600" onClick={() => setAssessmentPreview(true)}>
                              Preview
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="prose max-w-none text-gray-900 text-base bg-gray-50 p-8 rounded">
                          <h3 className="font-bold mb-2">INFORMATION</h3>
                          <div><b>Employer Name:</b> {assessmentForm.employer}</div>
                          <div><b>Applicant Name:</b> {assessmentForm.applicant}</div>
                          <div><b>Position Applied For:</b> {assessmentForm.position}</div>
                          <div><b>Date of Conditional Offer:</b> {assessmentForm.offerDate}</div>
                          <div><b>Date of Assessment:</b> {assessmentForm.assessmentDate}</div>
                          <div><b>Date of Criminal History Report:</b> {assessmentForm.reportDate}</div>
                          <div><b>Assessment Performed by:</b> {assessmentForm.performedBy}</div>
                          <h3 className="font-bold mt-6 mb-2">ASSESSMENT</h3>
                          <div><b>1. The specific duties and responsibilities of the job are:</b>
                            <ul className="list-disc ml-6">
                              {assessmentForm.duties.map((duty, idx) => duty && <li key={idx}>{duty}</li>)}
                            </ul>
                          </div>
                          <div className="mt-2"><b>2. Description of the criminal conduct and why the conduct is of concern with respect to the position in question:</b><br />{assessmentForm.conduct}</div>
                          <div className="mt-2"><b>3. How long ago did the criminal activity occur:</b> {assessmentForm.howLongAgo}</div>
                          <div className="mt-2"><b>4. Activities since criminal activity, such as work experience, job training, rehabilitation, community service, etc.:</b>
                            <ul className="list-disc ml-6">
                              {assessmentForm.activities.map((act, idx) => act && <li key={idx}>{act}</li>)}
                            </ul>
                          </div>
                          <div className="mt-2"><b>Based on the factors above, we are considering rescinding our offer of employment because:</b><br />{assessmentForm.rescindReason}</div>
                          <div className="flex justify-end mt-8">
                            <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600" onClick={handleSendAssessment}>
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
            {currentStep === 3 && (
              <>
                <div className="bg-white rounded-lg shadow p-8 mb-8 border border-gray-200">
                  <p className="text-lg mb-6">
                    The following may be used to inform a job applicant in writing of the intent to revoke a conditional job offer due to relevant criminal history
                  </p>
                  <div className="flex gap-4">
                    <button className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600" onClick={() => setShowRevocationModal(true)}>
                      Issue Preliminary Job Offer Revocation
                    </button>
                    <button className="px-8 py-3 rounded text-lg font-semibold bg-green-500 text-white hover:bg-green-600" onClick={handleProceedWithHire}>
                      Proceed with hire
                    </button>
                  </div>
                </div>
                {/* Modal for Preliminary Job Offer Revocation */}
                {showRevocationModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-7xl w-full p-16 relative max-h-screen overflow-y-auto">
                      <h2 className="text-2xl font-bold mb-6">Notice of Preliminary Decision to Revoke Job Offer Because of Conviction History</h2>
                      <div className="flex justify-end mb-4">
                        <button
                          className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold mr-2"
                          onClick={() => setRevocationPreview(!revocationPreview)}
                        >
                          {revocationPreview ? 'Edit' : 'Preview'}
                        </button>
                        <button
                          className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold"
                          onClick={() => setShowRevocationModal(false)}
                        >
                          Cancel
                        </button>
                  </div>
                      {!revocationPreview ? (
                        <form className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold mb-1">Date</label>
                              <input type="date" name="date" value={revocationForm.date} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
              </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Applicant Name</label>
                              <input type="text" name="applicant" value={revocationForm.applicant} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Position</label>
                              <input type="text" name="position" value={revocationForm.position} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
                </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">Convictions that led to decision to revoke offer</label>
                            {[0, 1, 2].map((idx) => (
                              <input
                                key={idx}
                                type="text"
                                value={revocationForm.convictions[idx]}
                                onChange={e => handleRevocationArrayChange(idx, e.target.value)}
                                className="w-full border rounded px-3 py-2 mb-2"
                                placeholder={`Conviction ${idx + 1}`}
                              />
                            ))}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">Number of business days to respond</label>
                            <input type="number" name="numBusinessDays" value={revocationForm.numBusinessDays} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">Contact Name</label>
                            <input type="text" name="contactName" value={revocationForm.contactName} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">Company Name</label>
                            <input type="text" name="companyName" value={revocationForm.companyName} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">Address</label>
                            <input type="text" name="address" value={revocationForm.address} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">Phone</label>
                            <input type="text" name="phone" value={revocationForm.phone} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">Describe why the conduct was considered serious</label>
                            <textarea name="seriousReason" value={revocationForm.seriousReason} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2 min-h-[60px]" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">How long ago the conduct occurred</label>
                            <input type="text" name="timeSinceConduct" value={revocationForm.timeSinceConduct} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">How long ago sentence was completed</label>
                            <input type="text" name="timeSinceSentence" value={revocationForm.timeSinceSentence} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">Job Duties</label>
                            <textarea name="jobDuties" value={revocationForm.jobDuties} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2 min-h-[60px]" />
                          </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Reason for revoking job offer based on relevance of conviction history to job duties</label>
                            <textarea name="fitnessReason" value={revocationForm.fitnessReason} onChange={handleRevocationFormChange} className="w-full border rounded px-3 py-2 min-h-[60px]" />
                          </div>
                          <div className="flex justify-end mt-8">
                            <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600" onClick={() => setRevocationPreview(true)}>
                              Preview
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="prose max-w-none text-gray-900 text-base bg-gray-50 p-8 rounded">
                          <div className="mb-2">{revocationForm.date}</div>
                          <div className="mb-2">Re: Preliminary Decision to Revoke Job Offer Because of Conviction History</div>
                          <div className="mb-2">Dear {revocationForm.applicant}:</div>
                          <div className="mb-2">After reviewing the results of your conviction history background check, we have made a preliminary (non-final) decision to revoke (take back) our previous job offer for the position of {revocationForm.position} because of the following conviction(s):
                            <ul className="list-disc ml-6">
                              {revocationForm.convictions.map((conv, idx) => conv && <li key={idx}>{conv}</li>)}
                            </ul>
                            A copy of your conviction history report is attached to this letter. More information about our concerns is included in the "Individualized Assessment" below.
                          </div>
                          <div className="mb-2">As prohibited by Local and California law, we have NOT considered any of the following:
                            <ul className="list-disc ml-6">
                              <li>Arrest(s) not followed by conviction;</li>
                              <li>Participation in a pretrial or posttrial diversion program; or</li>
                              <li>Convictions that have been sealed, dismissed, expunged, or pardoned.</li>
                            </ul>
                          </div>
                          <div className="mb-2"><b>Your Right to Respond:</b><br />
                            The conditional job you were offered will remain available for five business days so that you may respond to this letter before our decision to revoke the job offer becomes final. Within {revocationForm.numBusinessDays} business days* from when you first receive this notice, you may send us:
                            <ul className="list-disc ml-6">
                              <li>Evidence of rehabilitation or mitigating circumstances</li>
                              <li>Information challenging the accuracy of the conviction history listed above. If, within 5 business days, you notify us that you are challenging the accuracy of the attached conviction history report, you shall have another 5 business days to respond to this notice with evidence of inaccuracy.</li>
                            </ul>
                            Please send any additional information you would like us to consider to: {revocationForm.contactName}, {revocationForm.companyName}, {revocationForm.address}, {revocationForm.phone}
                          </div>
                          <div className="mb-2"><b>Here are some examples of information you may send us:</b>
                            <ul className="list-disc ml-6">
                              <li>Evidence that you were not convicted of one or more of the offenses we listed above or that the conviction record is inaccurate (such as the number of convictions listed);</li>
                              <li>Facts or circumstances surrounding the offense or conduct, showing that the conduct was less serious than the conviction seems;</li>
                              <li>The time that has passed since the conduct that led to your conviction(s) or since your release from incarceration;</li>
                              <li>The length and consistency of employment history or community involvement (such as volunteer activities) before and after the offense(s);</li>
                              <li>Employment or character references from people who know you, such as letters from teachers, counselors, supervisors, clergy, and probation or parole officers;</li>
                              <li>Evidence that you attended school, job training, or counseling;</li>
                              <li>Evidence that you have performed the same type of work since your conviction;</li>
                              <li>Whether you are bonded under a federal, state, or local bonding program; and</li>
                              <li>Any other evidence of your rehabilitation efforts, such as (i) evidence showing how much time has passed since release from incarceration without subsequent conviction, (ii) evidence showing your compliance with the terms and conditions of probation or parole, or (iii) evidence showing your present fitness for the job.</li>
                            </ul>
                          </div>
                          <div className="mb-2">We are required to review the information you submit and make another individualized assessment of whether to hire you or revoke the job offer. We will notify you in writing if we make a final decision to revoke the job offer.</div>
                          <div className="mb-2"><b>Our Individualized Assessment:</b><br />
                            We have individually assessed whether your conviction history is directly related to the duties of the job we offered you. We considered the following:
                            <ol className="list-decimal ml-6">
                              <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: {revocationForm.seriousReason}</li>
                              <li>How long ago the conduct occurred that led to your conviction, which was: {revocationForm.timeSinceConduct} and how long ago you completed your sentence, which was: {revocationForm.timeSinceSentence}.</li>
                              <li>The specific duties and responsibilities of the position of {revocationForm.position}, which are: {revocationForm.jobDuties}</li>
                            </ol>
                            We believe your conviction record lessens your fitness/ability to perform the job duties because: {revocationForm.fitnessReason}
                          </div>
                          <div className="mb-2"><b>Your Right to File a Complaint:</b><br />
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
                          <div className="mb-2">Sincerely,<br />{revocationForm.contactName}<br />{revocationForm.companyName}<br />{revocationForm.address}<br />{revocationForm.phone}</div>
                          <div className="mb-2">Enclosure: Copy of conviction history report</div>
                          <div className="mb-2 text-xs">* The applicant must be allowed at least 5 business days to respond. If the applicant indicates their intent to provide such evidence, they must be given an additional 5 business days to gather and deliver the information</div>
                          <div className="flex justify-end mt-8">
                            <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600" onClick={handleSendRevocation}>
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
            {currentStep === 4 && !showReassessmentSplit && (
              <>
                <div className="bg-white rounded-lg shadow p-8 mb-8 border border-gray-200 flex flex-col items-center">
                  <div className="flex flex-col items-center mb-6">
                    <div className="rounded-full bg-green-100 p-4 mb-4">
                      <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                    <h2 className="text-2xl font-bold text-center mb-2">Preliminary Decision Notice Sent Successfully</h2>
                    <div className="text-gray-600 text-center mb-4">Time Remaining for Response:</div>
                    <div className="w-full flex flex-col items-center">
                      <div className="bg-blue-50 rounded-lg px-12 py-4 mb-4">
                        <span className="text-4xl font-bold text-blue-600">{businessDaysRemaining}</span>
                        <div className="text-blue-600 text-lg">Business Days Remaining</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-blue-50 rounded-lg p-6 mb-6">
                    <div className="font-semibold text-blue-800 mb-2">Next Steps:</div>
                    <ul className="list-disc list-inside text-blue-800 space-y-1">
                      <li>The candidate has 5 business days to respond with mitigating evidence</li>
                      <li>If they challenge the accuracy of the criminal history report, they will receive an additional 5 business days</li>
                      <li>You will be notified when the candidate submits their response</li>
                      <li>After reviewing their response, you must make a final decision</li>
                    </ul>
                  </div>
                  <div className="flex flex-row gap-4 mt-2">
                    <button className="px-8 py-3 rounded text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700">View Candidate Response</button>
                    <button className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600" onClick={() => setShowReassessmentInfoModal(true)}>Begin Individualized Reassessment</button>
                  </div>
                </div>
                {/* Informational Modal for Individualized Reassessment */}
                {showReassessmentInfoModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-10 relative">
                      <h2 className="text-2xl font-bold mb-6">Individualized Reassessment Information</h2>
                      <div className="text-gray-800 text-lg mb-8">
                        After informing an applicant that you intend to revoke a job offer due to the applicant's criminal history, the applicant must be given at least 5 business days to provide mitigating evidence that speaks to their character and fitness to perform the job being offered. An additional 5 business days are required if the applicant intends to gather and deliver information disputing the accuracy of the criminal history report. During this reassessment process, the position must remain open, except in emergent circumstances. This following form can be used to conduct an individualized reassessment based on information provided by the applicant.
                      </div>
                      <div className="flex justify-end">
                        <button className="px-8 py-3 rounded text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700" onClick={() => { setShowReassessmentInfoModal(false); setShowReassessmentSplit(true); }}>
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
                        <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700" onClick={() => setReassessmentPreview(true)}>
                          Preview
                        </button>
                              </div>
                    </form>
                  ) : (
                    <div className="prose max-w-none text-gray-900 text-base bg-gray-50 p-8 rounded">
                      <h3 className="font-bold mb-2">INFORMATION</h3>
                      <div><b>Employer Name:</b> {reassessmentForm.employer}</div>
                      <div><b>Applicant Name:</b> {reassessmentForm.applicant}</div>
                      <div><b>Position Applied For:</b> {reassessmentForm.position}</div>
                      <div><b>Date of Conditional Offer:</b> {reassessmentForm.offerDate}</div>
                      <div><b>Date of Reassessment:</b> {reassessmentForm.reassessmentDate}</div>
                      <div><b>Date of Criminal History Report:</b> {reassessmentForm.reportDate}</div>
                      <div><b>Assessment Performed by:</b> {reassessmentForm.performedBy}</div>
                      <h3 className="font-bold mt-6 mb-2">REASSESSMENT</h3>
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
                        <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600" onClick={handleSendReassessment}>
                          Send
                        </button>
                        <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-gray-300 text-gray-700 hover:bg-gray-400" onClick={() => setReassessmentPreview(false)}>
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Right: Candidate Response Iframe */}
                <div className="flex-1 bg-white rounded-lg shadow p-8 border border-gray-200">
                  <h2 className="text-2xl font-bold mb-6">Candidate Response</h2>
                  <iframe
                    src="https://example.com/candidate-response"
                    title="Candidate Response"
                    className="w-full h-[500px] rounded border"
                  />
                </div>
              </div>
            )}
            {currentStep === 5 && (
              <>
                <div className="bg-white rounded-lg shadow p-8 mb-8 border border-gray-200 flex flex-col items-center">
                  <div className="w-full max-w-2xl">
                    <div className="text-lg text-gray-800 mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <span className="font-semibold">Once you have considered any mitigating information provided by the applicant, you may still decide to revoke the conditional job offer due to relevant criminal history.</span> <br />
                      The following notice meets your responsibility to notify the applicant in writing.
                    </div>
                    <div className="flex gap-4">
                      <button
                        className="px-8 py-3 rounded text-lg font-semibold bg-green-500 text-white hover:bg-green-600 w-full"
                        onClick={handleProceedWithHire}
                      >
                        Extend Offer of Employment
                      </button>
                      <button
                        className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600 w-full"
                        onClick={() => setShowFinalRevocationModal(true)}
                      >
                        Issue Final Revocation Notice
                      </button>
                    </div>
                  </div>
                </div>
                {/* Final Revocation Notice Modal */}
                {showFinalRevocationModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-16 relative max-h-screen overflow-y-auto">
                      <h2 className="text-2xl font-bold mb-6 text-center">Notice of Final Decision to Revoke Job Offer Because of Conviction History</h2>
                      {!finalRevocationPreview ? (
                        <form className="space-y-10">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold mb-1">Date</label>
                              <input type="date" name="date" value={finalRevocationForm.date} onChange={handleFinalRevocationFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Applicant Name</label>
                              <input type="text" name="applicant" value={finalRevocationForm.applicant} onChange={handleFinalRevocationFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Date of Notice</label>
                              <input type="date" name="dateOfNotice" value={finalRevocationForm.dateOfNotice} onChange={handleFinalRevocationFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                          </div>
                          <div className="mb-6 font-semibold">Re: Final Decision to Revoke Job Offer Because of Conviction History</div>
                          <div className="mb-6">Dear {finalRevocationForm.applicant || '[APPLICANT NAME]'}:</div>
                          <div className="mb-6">We are following up about our letter dated {finalRevocationForm.dateOfNotice || '[DATE OF NOTICE]'} which notified you of our initial decision to revoke (take back) the conditional job offer:</div>
                          <div className="mb-6 font-semibold">(Please check one:)</div>
                          <div className="flex flex-col gap-4 mb-8">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="noResponse" checked={finalRevocationForm.noResponse} onChange={handleFinalRevocationFormChange} />
                              We did not receive a timely response from you after sending you that letter, and our decision to revoke the job offer is now final.
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="infoSubmitted" checked={finalRevocationForm.infoSubmitted} onChange={handleFinalRevocationFormChange} />
                              We made a final decision to revoke the job offer after considering the information you submitted, which included:
                            </label>
                            {finalRevocationForm.infoSubmitted && (
                              <textarea name="infoSubmittedList" value={finalRevocationForm.infoSubmittedList} onChange={handleFinalRevocationFormChange} className="w-full border rounded px-3 py-2 min-h-[40px]" placeholder="List information submitted" />
                            )}
                          </div>
                          <div className="mb-6">After reviewing the information you submitted, we have determined that there
                            <label className="ml-4 font-normal inline-flex items-center gap-2">
                              <input type="radio" name="errorOnReport" value="was" checked={finalRevocationForm.errorOnReport === 'was'} onChange={handleFinalRevocationFormChange} /> was
                            </label>
                            <label className="ml-4 font-normal inline-flex items-center gap-2">
                              <input type="radio" name="errorOnReport" value="was not" checked={finalRevocationForm.errorOnReport === 'was not'} onChange={handleFinalRevocationFormChange} /> was not
                            </label>
                            (check one) an error on your conviction history report. We have decided to revoke our job offer because of the following conviction(s):</div>
                          <div className="flex flex-col gap-2 mb-8">
                            {[0, 1, 2].map((idx) => (
                              <input
                                key={idx}
                                type="text"
                                value={finalRevocationForm.convictions[idx]}
                                onChange={e => handleFinalRevocationArrayChange('convictions', idx, e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                placeholder={`Conviction ${idx + 1}`}
                              />
                            ))}
                          </div>
                          <div className="mb-6 font-semibold">Our Individualized Assessment:</div>
                          <div className="mb-6">We have individually assessed whether your conviction history is directly related to the duties of the job we offered you. We considered the following:</div>
                          <ol className="list-decimal ml-8 mb-8 space-y-4">
                            <li>The nature and seriousness of the conduct that led to your conviction(s), which we assessed as follows: <input type="text" name="seriousReason" value={finalRevocationForm.seriousReason} onChange={handleFinalRevocationFormChange} className="border rounded px-2 py-1 w-2/3 inline-block" /></li>
                            <li>How long ago the conduct occurred that led to your conviction, which was: <input type="text" name="timeSinceConduct" value={finalRevocationForm.timeSinceConduct} onChange={handleFinalRevocationFormChange} className="border rounded px-2 py-1 w-1/3 inline-block" /> and how long ago you completed your sentence, which was: <input type="text" name="timeSinceSentence" value={finalRevocationForm.timeSinceSentence} onChange={handleFinalRevocationFormChange} className="border rounded px-2 py-1 w-1/3 inline-block" />.</li>
                            <li>The specific duties and responsibilities of the position of <input type="text" name="position" value={finalRevocationForm.position} onChange={handleFinalRevocationFormChange} className="border rounded px-2 py-1 w-1/2 inline-block mx-2" placeholder="[INSERT POSITION]" />, which are:
                              <div className="flex flex-col gap-2 mt-2">
                                {[0, 1, 2, 3].map((idx) => (
                                  <input
                                    key={idx}
                                    type="text"
                                    value={finalRevocationForm.jobDuties[idx]}
                                    onChange={e => handleFinalRevocationArrayChange('jobDuties', idx, e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                    placeholder={`Job Duty ${String.fromCharCode(97 + idx)}`}
                                  />
                                ))}
                              </div>
                            </li>
                          </ol>
                          <div className="mb-6">We believe your conviction record lessens your fitness/ability to perform the job duties and have made a final decision to revoke the job offer because:</div>
                          <textarea name="fitnessReason" value={finalRevocationForm.fitnessReason} onChange={handleFinalRevocationFormChange} className="w-full border rounded px-3 py-2 min-h-[60px] mb-8" placeholder="Outline reasoning for decision to revoke job offer based on relevance of conviction history to position" />
                          <div className="mb-6 font-semibold">Request for Reconsideration:</div>
                          <div className="flex flex-col gap-4 mb-8">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="reconsideration" value="none" checked={finalRevocationForm.reconsideration === 'none'} onChange={() => setFinalRevocationForm((prev: any) => ({ ...prev, reconsideration: prev.reconsideration === 'none' ? '' : 'none' }))} />
                              We do not offer any way to challenge this decision or request reconsideration.
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="reconsideration" value="procedure" checked={finalRevocationForm.reconsideration === 'procedure'} onChange={() => setFinalRevocationForm((prev: any) => ({ ...prev, reconsideration: prev.reconsideration === 'procedure' ? '' : 'procedure' }))} />
                              If you would like to challenge this decision or request reconsideration, you may:
                            </label>
                            {finalRevocationForm.reconsideration === 'procedure' && (
                              <textarea name="reconsiderationProcedure" value={finalRevocationForm.reconsiderationProcedure} onChange={handleFinalRevocationFormChange} className="w-full border rounded px-3 py-2 min-h-[40px]" placeholder="Describe internal procedure" />
                            )}
                          </div>
                          <div className="mb-6 font-semibold">Your Right to File a Complaint:</div>
                          <div className="text-sm text-gray-700 mb-8">
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
                              <label className="block text-sm font-semibold mb-1">Employer contact person name</label>
                              <input type="text" name="contactName" value={finalRevocationForm.contactName} onChange={handleFinalRevocationFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Employer company name</label>
                              <input type="text" name="companyName" value={finalRevocationForm.companyName} onChange={handleFinalRevocationFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Employer address</label>
                              <input type="text" name="address" value={finalRevocationForm.address} onChange={handleFinalRevocationFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">Employer contact phone number</label>
                              <input type="text" name="phone" value={finalRevocationForm.phone} onChange={handleFinalRevocationFormChange} className="w-full border rounded px-3 py-2" />
                            </div>
                          </div>
                          <div className="flex justify-end mt-12 gap-6">
                            <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700" onClick={() => setFinalRevocationPreview(true)}>
                              Preview
                            </button>
                            <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-gray-300 text-gray-700 hover:bg-gray-400" onClick={() => setShowFinalRevocationModal(false)}>
                              Cancel
                            </button>
                            <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600" onClick={() => { setShowFinalRevocationModal(false); setFinalRevocationPreview(false); setShowFinalRevocationSuccessModal(true); }}>Send</button>
                          </div>
                        </form>
                      ) : (
                        <div className="prose max-w-none text-gray-900 text-base bg-gray-50 p-16 rounded">
                          <div className="mb-6">{finalRevocationForm.date}</div>
                          <div className="mb-6 font-bold">Re: Final Decision to Revoke Job Offer Because of Conviction History</div>
                          <div className="mb-6">Dear {finalRevocationForm.applicant || '[APPLICANT NAME]'}:</div>
                          <div className="mb-6">We are following up about our letter dated {finalRevocationForm.dateOfNotice || '[DATE OF NOTICE]'} which notified you of our initial decision to revoke (take back) the conditional job offer:</div>
                          <div className="mb-6 font-semibold">(Please check one:)</div>
                          <ul className="list-disc ml-6">
                            {finalRevocationForm.noResponse && <li>We did not receive a timely response from you after sending you that letter, and our decision to revoke the job offer is now final.</li>}
                            {finalRevocationForm.infoSubmitted && <li>We made a final decision to revoke the job offer after considering the information you submitted, which included: {finalRevocationForm.infoSubmittedList}</li>}
                          </ul>
                          <div className="mb-6">After reviewing the information you submitted, we have determined that there
                            <b>{finalRevocationForm.errorOnReport === 'was' ? 'was' : finalRevocationForm.errorOnReport === 'was not' ? 'was not' : '[check one]'}</b> (check one) an error on your conviction history report. We have decided to revoke our job offer because of the following conviction(s):</div>
                          <ul className="list-disc ml-6">
                            {finalRevocationForm.convictions.map((conv, idx) => conv && <li key={idx}>{conv}</li>)}
                          </ul>
                          <div className="mb-6 font-semibold">Our Individualized Assessment:</div>
                          <ol className="list-decimal ml-8 mb-8 space-y-4">
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
                          <ul className="list-disc ml-6">
                            {finalRevocationForm.reconsideration === 'none' && <li>We do not offer any way to challenge this decision or request reconsideration.</li>}
                            {finalRevocationForm.reconsideration === 'procedure' && <li>If you would like to challenge this decision or request reconsideration, you may: {finalRevocationForm.reconsiderationProcedure}</li>}
                          </ul>
                          <div className="mb-6 font-semibold">Your Right to File a Complaint:</div>
                          <div className="text-sm text-gray-700 mb-8">
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
                            For more information, visit www.sandiegocounty.gov/content/sdc/OLSE
                          </div>
                          <div className="grid grid-cols-2 gap-10 mb-8">
                            <div><b>Employer contact person name:</b> {finalRevocationForm.contactName}</div>
                            <div><b>Employer company name:</b> {finalRevocationForm.companyName}</div>
                            <div><b>Employer address:</b> {finalRevocationForm.address}</div>
                            <div><b>Employer contact phone number:</b> {finalRevocationForm.phone}</div>
                          </div>
                          <div className="flex justify-end mt-12 gap-6">
                            <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-gray-300 text-gray-700 hover:bg-gray-400" onClick={() => setFinalRevocationPreview(false)}>
                              Edit
                            </button>
                            <button type="button" className="px-8 py-3 rounded text-lg font-semibold bg-red-500 text-white hover:bg-red-600" onClick={() => { setShowFinalRevocationModal(false); setFinalRevocationPreview(false); setShowFinalRevocationSuccessModal(true); }}>Send</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                  </>
                )}
            {/* Critical Information Section Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <span className="mr-2 text-xl text-gray-700">ℹ️</span>
                <h3 className="text-lg font-bold">Critical Information</h3>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 border-b border-gray-200">
                {['Legal', 'Company Policy', 'Candidate Context'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-semibold text-sm transition-colors relative ${
                      activeTab === tab
                        ? 'text-red-600 border-b-2 border-red-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
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
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">San Diego Fair Chance Ordinance Requirements</h4>
                        <p>Internal policy requires documented confirmation of conditional offer before accessing any conviction history information. This ensures compliance with local fair chance hiring legislation.</p>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Individualized Assessment Guidelines</h4>
                        <p>Legal requirements for conducting fair and compliant individualized assessments under San Diego Fair Chance Ordinance will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Preliminary Decision Legal Framework</h4>
                        <p>Legal guidelines for preliminary job offer decisions and revocation procedures will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 4 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Reassessment Legal Requirements</h4>
                        <p>Legal framework for conducting reassessments and handling candidate responses will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 5 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Final Decision Legal Compliance</h4>
                        <p>Legal requirements for final hiring decisions and documentation will be displayed here.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'Company Policy' && (
                  <div className="space-y-4">
                    {currentStep === 1 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Conditional Offer Policy</h4>
                        <p>Company-specific policies regarding conditional job offers and documentation requirements will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Assessment Procedures</h4>
                        <p>Internal company policies for conducting individualized assessments will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Decision Making Policy</h4>
                        <p>Company policies for preliminary hiring decisions and notification procedures will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 4 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Reassessment Guidelines</h4>
                        <p>Company policies for handling candidate responses and conducting reassessments will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 5 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Final Decision Policy</h4>
                        <p>Company policies for final hiring decisions and record keeping will be displayed here.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'Candidate Context' && (
                  <div className="space-y-4">
                    {currentStep === 1 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Candidate Background</h4>
                        <p>Relevant candidate information and context for the conditional offer stage will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Assessment Context</h4>
                        <p>Candidate-specific context and considerations for the individualized assessment will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Decision Context</h4>
                        <p>Relevant candidate context for preliminary decision making will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 4 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Response Context</h4>
                        <p>Candidate response and relevant context for reassessment will be displayed here.</p>
                      </div>
                    )}
                    {currentStep === 5 && (
                      <div className="text-gray-700">
                        <h4 className="font-semibold mb-2">Final Decision Context</h4>
                        <p>Complete candidate context for final hiring decision will be displayed here.</p>
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
              <div className="text-black font-bold text-2xl mb-3">
                réz<span className="text-red-500">me</span>.
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Automating Fair Chance Hiring<br />
                compliance for modern HR teams.
              </p>
            </div>
            
            {/* Right: Legal Disclaimer */}
            <div className="lg:col-span-2">
              <p className="text-gray-600 text-sm leading-relaxed">
                Rézme provides compliance support tools, not legal advice. Use of this site or platform does not create an attorney-client relationship. Employers retain full responsibility for final hiring decisions and for compliance with applicable laws. Rézme is not a Consumer Reporting Agency and does not furnish consumer reports under the Fair Credit Reporting Act. While our software assists clients in documenting individualized assessments and related compliance steps, Rézme's role is limited to producing records created within our system in the event of an audit. All data sources, partner integrations, and outputs are provided "as-is," without warranty of completeness or accuracy. Tax credit calculations are estimates only and do not guarantee financial outcomes. By using this site, you agree to our Terms of Service, including limitations of liability, indemnification provisions, and governing law clauses.
              </p>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Rézme. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {showExtendSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-10 flex flex-col items-center relative">
            {/* X Close Button */}
            <button 
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowExtendSuccessModal(false)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Applicant Hired!</h2>
            <div className="text-gray-700 text-lg text-center mb-8">You have indicated that you intend to extend an offer of employment to the candidate. Please update your records accordingly. We will store the assessments you conducted on Rézme.</div>
            <button className="px-8 py-3 rounded text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700" onClick={() => { setShowExtendSuccessModal(false); setShowReassessmentSplit(false); setReassessmentPreview(false); router.push('/hr-admin/dashboard'); }}>
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
      {showFinalRevocationSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-6xl w-full flex flex-col items-center">
            <div className="rounded-full bg-green-100 p-6 mb-6">
              <svg className="h-16 w-16 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-center mb-4">Final Revocation Notice Sent</h1>
            <p className="text-lg text-gray-600 text-center mb-8">
              You have indicated that you will not be proceeding with an offer of employment to the candidate. Please update your records accordingly. We will store the assessments and actions you conducted on Rézme including the steps you took to ensure compliance with San Diego County Fair Chance Ordinance and The Office of Labor Standards and Enforcement (OLSE).
            </p>
            <button className="px-8 py-4 rounded-lg text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 mb-8" onClick={() => { setShowFinalRevocationSuccessModal(false); router.push('/hr-admin/dashboard'); }}>
              Return to Dashboard
            </button>
            <div className="w-full border-t border-gray-200 pt-8 flex flex-col items-center">
              <div className="flex flex-row items-center gap-8 text-blue-900 text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <svg className="h-6 w-6 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  OLSE@sdcounty.ca.gov
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-6 w-6 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  <a href="https://www.sandiegocounty.gov/OLSE.html" className="underline">https://www.sandiegocounty.gov/OLSE.html</a>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-6 w-6 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
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
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Candidate Response - Restorative Record</h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowCandidateResponseModal(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content Placeholder */}
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-blue-500">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Candidate Response</h3>
              <p className="text-gray-600">
                The candidate's restorative record and response will be displayed here.
              </p>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end mt-8">
              <button 
                className="px-6 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200" 
                onClick={() => setShowCandidateResponseModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
