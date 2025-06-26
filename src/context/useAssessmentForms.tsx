import { createContext, useContext, useEffect, useState } from "react";

interface OfferForm {
  date: string;
  applicant: string;
  position: string;
  employer: string;
}
interface AssessmentForm {
  employer: string;
  applicant: string;
  position: string;
  offerDate: string;
  assessmentDate: string;
  reportDate: string;
  performedBy: string;
  duties: string[];
  conduct: string;
  howLongAgo: string;
  activities: string[];
  rescindReason: string;
}
interface RevocationForm {
  date: string;
  applicant: string;
  position: string;
  convictions: string[];
  numBusinessDays: string;
  contactName: string;
  companyName: string;
  address: string;
  phone: string;
  seriousReason: string;
  timeSinceConduct: string;
  timeSinceSentence: string;
  jobDuties: string;
  fitnessReason: string;
}
interface ReassessmentForm {
  employer: string;
  applicant: string;
  position: string;
  offerDate: string;
  reassessmentDate: string;
  reportDate: string;
  performedBy: string;
  error: string;
  errorYesNo: string;
  workExperience: string;
  jobTraining: string;
  education: string;
  rehabPrograms: string;
  counseling: string;
  communityService: string;
  lettersOfSupport: string;
  religiousAttendance: string;
  rescindReason: string;
  evidenceA: string;
  evidenceB: string;
  evidenceC: string;
  evidenceD: string;
}
interface FinalRevocationForm {
  date: string;
  applicant: string;
  dateOfNotice: string;
  noResponse: boolean;
  infoSubmitted: boolean;
  infoSubmittedList: string;
  errorOnReport: string;
  convictions: string[];
  seriousReason: string;
  timeSinceConduct: string;
  timeSinceSentence: string;
  position: string;
  jobDuties: string[];
  fitnessReason: string;
  reconsideration: string;
  reconsiderationProcedure: string;
  contactName: string;
  companyName: string;
  address: string;
  phone: string;
}

interface FormsState {
  offerForm: OfferForm;
  setOfferForm: React.Dispatch<React.SetStateAction<OfferForm>>;
  assessmentForm: AssessmentForm;
  setAssessmentForm: React.Dispatch<React.SetStateAction<AssessmentForm>>;
  revocationForm: RevocationForm;
  setRevocationForm: React.Dispatch<React.SetStateAction<RevocationForm>>;
  reassessmentForm: ReassessmentForm;
  setReassessmentForm: React.Dispatch<React.SetStateAction<ReassessmentForm>>;
  finalRevocationForm: FinalRevocationForm;
  setFinalRevocationForm: React.Dispatch<React.SetStateAction<FinalRevocationForm>>;
  showOfferModal: boolean;
  setShowOfferModal: (b: boolean) => void;
  showAssessmentModal: boolean;
  setShowAssessmentModal: (b: boolean) => void;
  assessmentPreview: boolean;
  setAssessmentPreview: (b: boolean) => void;
  showRevocationModal: boolean;
  setShowRevocationModal: (b: boolean) => void;
  revocationPreview: boolean;
  setRevocationPreview: (b: boolean) => void;
  showReassessmentModal: boolean;
  setShowReassessmentModal: (b: boolean) => void;
  reassessmentPreview: boolean;
  setReassessmentPreview: (b: boolean) => void;
  showFinalRevocationModal: boolean;
  setShowFinalRevocationModal: (b: boolean) => void;
  finalRevocationPreview: boolean;
  setFinalRevocationPreview: (b: boolean) => void;
}

const AssessmentFormsContext = createContext<FormsState | undefined>(undefined);

interface ProviderProps { children: React.ReactNode; candidateId: string; }

export function AssessmentFormsProvider({ children, candidateId }: ProviderProps) {
  const [offerForm, setOfferForm] = useState<OfferForm>(() => {
    if (typeof window === "undefined") return { date: "", applicant: "", position: "", employer: "" };
    const saved = localStorage.getItem(`offerForm_${candidateId}`);
    return saved ? JSON.parse(saved) : { date: "", applicant: "", position: "", employer: "" };
  });
  const [assessmentForm, setAssessmentForm] = useState<AssessmentForm>(() => {
    if (typeof window === "undefined") return {
      employer: "", applicant: "", position: "", offerDate: "", assessmentDate: "", reportDate: "", performedBy: "", duties: ["", "", "", ""], conduct: "", howLongAgo: "", activities: ["", "", ""], rescindReason: "",
    };
    const saved = localStorage.getItem(`assessmentForm_${candidateId}`);
    return saved ? JSON.parse(saved) : {
      employer: "", applicant: "", position: "", offerDate: "", assessmentDate: "", reportDate: "", performedBy: "", duties: ["", "", "", ""], conduct: "", howLongAgo: "", activities: ["", "", ""], rescindReason: "",
    };
  });
  const [revocationForm, setRevocationForm] = useState<RevocationForm>(() => {
    if (typeof window === "undefined") return {
      date: "", applicant: "", position: "", convictions: ["", "", ""], numBusinessDays: "", contactName: "", companyName: "", address: "", phone: "", seriousReason: "", timeSinceConduct: "", timeSinceSentence: "", jobDuties: "", fitnessReason: "",
    };
    const saved = localStorage.getItem(`revocationForm_${candidateId}`);
    return saved ? JSON.parse(saved) : {
      date: "", applicant: "", position: "", convictions: ["", "", ""], numBusinessDays: "", contactName: "", companyName: "", address: "", phone: "", seriousReason: "", timeSinceConduct: "", timeSinceSentence: "", jobDuties: "", fitnessReason: "",
    };
  });
  const [reassessmentForm, setReassessmentForm] = useState<ReassessmentForm>(() => {
    if (typeof window === "undefined") return {
      employer: "", applicant: "", position: "", offerDate: "", reassessmentDate: "", reportDate: "", performedBy: "", error: "", errorYesNo: "No", workExperience: "", jobTraining: "", education: "", rehabPrograms: "", counseling: "", communityService: "", lettersOfSupport: "", religiousAttendance: "", rescindReason: "", evidenceA: "", evidenceB: "", evidenceC: "", evidenceD: "",
    };
    const saved = localStorage.getItem(`reassessmentForm_${candidateId}`);
    return saved ? JSON.parse(saved) : {
      employer: "", applicant: "", position: "", offerDate: "", reassessmentDate: "", reportDate: "", performedBy: "", error: "", errorYesNo: "No", workExperience: "", jobTraining: "", education: "", rehabPrograms: "", counseling: "", communityService: "", lettersOfSupport: "", religiousAttendance: "", rescindReason: "", evidenceA: "", evidenceB: "", evidenceC: "", evidenceD: "",
    };
  });
  const [finalRevocationForm, setFinalRevocationForm] = useState<FinalRevocationForm>(() => {
    if (typeof window === "undefined") return {
      date: "", applicant: "", dateOfNotice: "", noResponse: false, infoSubmitted: false, infoSubmittedList: "", errorOnReport: "", convictions: ["", "", ""], seriousReason: "", timeSinceConduct: "", timeSinceSentence: "", position: "", jobDuties: ["", "", "", ""], fitnessReason: "", reconsideration: "", reconsiderationProcedure: "", contactName: "", companyName: "", address: "", phone: "",
    };
    const saved = localStorage.getItem(`finalRevocationForm_${candidateId}`);
    return saved ? JSON.parse(saved) : {
      date: "", applicant: "", dateOfNotice: "", noResponse: false, infoSubmitted: false, infoSubmittedList: "", errorOnReport: "", convictions: ["", "", ""], seriousReason: "", timeSinceConduct: "", timeSinceSentence: "", position: "", jobDuties: ["", "", "", ""], fitnessReason: "", reconsideration: "", reconsiderationProcedure: "", contactName: "", companyName: "", address: "", phone: "",
    };
  });
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentPreview, setAssessmentPreview] = useState(false);
  const [showRevocationModal, setShowRevocationModal] = useState(false);
  const [revocationPreview, setRevocationPreview] = useState(false);
  const [showReassessmentModal, setShowReassessmentModal] = useState(false);
  const [reassessmentPreview, setReassessmentPreview] = useState(false);
  const [showFinalRevocationModal, setShowFinalRevocationModal] = useState(false);
  const [finalRevocationPreview, setFinalRevocationPreview] = useState(false);

  useEffect(() => {
    localStorage.setItem(`offerForm_${candidateId}`, JSON.stringify(offerForm));
  }, [offerForm, candidateId]);
  useEffect(() => {
    localStorage.setItem(`assessmentForm_${candidateId}`, JSON.stringify(assessmentForm));
  }, [assessmentForm, candidateId]);
  useEffect(() => {
    localStorage.setItem(`revocationForm_${candidateId}`, JSON.stringify(revocationForm));
  }, [revocationForm, candidateId]);
  useEffect(() => {
    localStorage.setItem(`reassessmentForm_${candidateId}`, JSON.stringify(reassessmentForm));
  }, [reassessmentForm, candidateId]);
  useEffect(() => {
    localStorage.setItem(`finalRevocationForm_${candidateId}`, JSON.stringify(finalRevocationForm));
  }, [finalRevocationForm, candidateId]);

  return (
    <AssessmentFormsContext.Provider
      value={{
        offerForm,
        setOfferForm,
        assessmentForm,
        setAssessmentForm,
        revocationForm,
        setRevocationForm,
        reassessmentForm,
        setReassessmentForm,
        finalRevocationForm,
        setFinalRevocationForm,
        showOfferModal,
        setShowOfferModal,
        showAssessmentModal,
        setShowAssessmentModal,
        assessmentPreview,
        setAssessmentPreview,
        showRevocationModal,
        setShowRevocationModal,
        revocationPreview,
        setRevocationPreview,
        showReassessmentModal,
        setShowReassessmentModal,
        reassessmentPreview,
        setReassessmentPreview,
        showFinalRevocationModal,
        setShowFinalRevocationModal,
        finalRevocationPreview,
        setFinalRevocationPreview,
      }}
    >
      {children}
    </AssessmentFormsContext.Provider>
  );
}

export function useAssessmentForms() {
  const ctx = useContext(AssessmentFormsContext);
  if (!ctx) throw new Error("useAssessmentForms must be used within provider");
  return ctx;
}
