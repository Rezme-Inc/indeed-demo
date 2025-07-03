export type FileWithPreview = File & { preview?: string };

export interface Award {
  id: string;
  type: string;
  name: string;
  organization: string;
  date: string;
  file: File | null;
  filePreview: string;
  fileName?: string;
  fileSize?: number;
  narrative: string;
}

export interface Education {
  id: string;
  school: string;
  location: string;
  degree: string;
  field: string;
  currentlyEnrolled: boolean;
  startDate: string;
  endDate: string;
  grade: string;
  description: string;
  file: File | null;
  filePreview: string;
  fileName?: string;
  fileSize?: number;
}

export interface Employment {
  id: string;
  state: string;
  city: string;
  employmentType: string;
  title: string;
  company: string;
  companyUrl: string;
  startDate: string;
  endDate: string;
  currentlyEmployed: boolean;
  employedWhileIncarcerated: boolean;
}

export interface Introduction {
  facebookUrl: string;
  linkedinUrl: string;
  redditUrl: string;
  digitalPortfolioUrl: string;
  instagramUrl: string;
  githubUrl: string;
  tiktokUrl: string;
  pinterestUrl: string;
  twitterUrl: string;
  personalWebsiteUrl: string;
  handshakeUrl: string;
  preferredOccupation: string;
  personalNarrative: string;
  languageProficiency:
    | "Bilingual"
    | "Advanced Proficiency"
    | "Intermediate Proficiency"
    | "Basic Proficiency"
    | "Limited Proficiency"
    | "No Proficiency";
  otherLanguages: string[];
}

export interface RehabPrograms {
  substanceUseDisorder: boolean;
  substanceUseDisorderDetails: string;
  womensJusticeCenters: boolean;
  womensJusticeCentersDetails: string;
  employmentFocused: boolean;
  employmentFocusedDetails: string;
  adaptableJustice: boolean;
  adaptableJusticeDetails: string;
  lifeSkillsTraining: boolean;
  lifeSkillsTrainingDetails: string;
  communityService: boolean;
  communityServiceDetails: string;
  familyReintegration: boolean;
  familyReintegrationDetails: string;
  parentingClasses: boolean;
  parentingClassesDetails: string;
  mentalWellness: boolean;
  mentalWellnessDetails: string;
  faithBased: boolean;
  faithBasedDetails: string;
  peerSupport: boolean;
  peerSupportDetails: string;
  artsRecreation: boolean;
  artsRecreationDetails: string;
  housingAssistance: boolean;
  housingAssistanceDetails: string;
  legalCompliance: boolean;
  legalComplianceDetails: string;
  civicEngagement: boolean;
  civicEngagementDetails: string;
  veteransServices: boolean;
  veteransServicesDetails: string;
  domesticViolenceReduction: boolean;
  domesticViolenceReductionDetails: string;
  sexOffenderTreatment: boolean;
  sexOffenderTreatmentDetails: string;
  medicalHealthCare: boolean;
  medicalHealthCareDetails: string;
  other: boolean;
  otherDetails: string;
}

export type RehabProgramKey = keyof Omit<RehabPrograms, `${string}Details`>;
export type RehabProgramDetailsKey = `${RehabProgramKey}Details`;

export interface Hobby {
  id: string;
  general: string;
  sports: string;
  other: string;
  narrative: string;
  file: File | null;
  filePreview: string;
  fileName?: string;
  fileSize?: number;
}

export interface RehabProgram {
  id: string;
  program: string;
  programType: string;
  startDate: string;
  endDate: string;
  details: string;
  narrative: string;
  file: File | null;
  filePreview: string;
  fileName?: string;
  fileSize?: number;
}

export interface Skill {
  id: string;
  softSkills: string;
  hardSkills: string;
  otherSkills: string;
  file: File | null;
  filePreview: string;
  fileName?: string;
  fileSize?: number;
  narrative: string;
}

export interface Engagement {
  id: string;
  type: string;
  role: string;
  orgName: string;
  orgWebsite: string;
  details: string;
  file: File | null;
  filePreview: string;
  fileName?: string;
  fileSize?: number;
}

export interface Microcredential {
  id: string;
  name: string;
  org: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  narrative: string;
  file: File | null;
  filePreview: string;
  fileName?: string;
  fileSize?: number;
}

export interface Mentor {
  id: string;
  linkedin: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  narrative: string;
} 
