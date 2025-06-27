import { ReferenceData } from "@/hooks/useReferenceData";

// Mock data structure - replace with actual assessment data structure
interface AssessmentData {
  step1?: {
    position?: string;
    jobDuties?: string[];
    employer?: string;
  };
  step2?: {
    convictions?: Array<{
      date: string;
      description: string;
      timeline: string;
    }>;
    conductDescription?: string;
    activitiesSince?: string;
    rescissionReasoning?: string;
    assessmentDetails?: {
      performedBy?: string;
      date?: string;
      location?: string;
    };
  };
  databaseFields?: {
    applicantName?: string;
    employerName?: string;
    positionTitle?: string;
  };
}

export function getReferenceData(
  assessmentData: AssessmentData,
  referenceType: string
): ReferenceData | null {
  switch (referenceType) {
    case 'position':
      return {
        title: 'Position Title',
        content: assessmentData.step1?.position || assessmentData.databaseFields?.positionTitle || 'Not specified',
        source: 'Step 1 - Job Information',
        fieldType: 'text'
      };

    case 'jobDuties':
      return {
        title: 'Job Duties',
        content: assessmentData.step1?.jobDuties || [],
        source: 'Step 1 - Job Information',
        fieldType: 'array'
      };

    case 'convictions':
      const convictions = assessmentData.step2?.convictions || [];
      const convictionList = convictions.map((conv, index) => 
        `${index + 1}. Date: ${conv.date} - ${conv.description} (Timeline: ${conv.timeline})`
      );
      return {
        title: 'Criminal History Details',
        content: convictionList.length > 0 ? convictionList : ['No convictions recorded'],
        source: 'Step 2 - Criminal History',
        fieldType: 'array'
      };

    case 'conductDescription':
      return {
        title: 'Nature of Criminal Conduct',
        content: assessmentData.step2?.conductDescription || 'Not specified',
        source: 'Step 2 - Criminal History',
        fieldType: 'text'
      };

    case 'activitiesSince':
      return {
        title: 'Activities Since Criminal Activity',
        content: assessmentData.step2?.activitiesSince || 'Not specified',
        source: 'Step 2 - Criminal History',
        fieldType: 'text'
      };

    case 'rescissionReasoning':
      return {
        title: 'Rescission Reasoning',
        content: assessmentData.step2?.rescissionReasoning || 'Not specified',
        source: 'Step 2 - Assessment Details',
        fieldType: 'text'
      };

    case 'applicantName':
      return {
        title: 'Applicant Name',
        content: assessmentData.databaseFields?.applicantName || 'Not specified',
        source: 'Database - Applicant Information',
        fieldType: 'text'
      };

    case 'employerName':
      return {
        title: 'Employer Name',
        content: assessmentData.databaseFields?.employerName || assessmentData.step1?.employer || 'Not specified',
        source: 'Database/Step 1 - Employer Information',
        fieldType: 'text'
      };

    default:
      return null;
  }
}

// Helper function to get multiple references at once
export function getMultipleReferences(
  assessmentData: AssessmentData,
  referenceTypes: string[]
): Record<string, ReferenceData | null> {
  const references: Record<string, ReferenceData | null> = {};
  
  referenceTypes.forEach(type => {
    references[type] = getReferenceData(assessmentData, type);
  });
  
  return references;
}

// Helper function to check if reference data exists
export function hasReferenceData(
  assessmentData: AssessmentData,
  referenceType: string
): boolean {
  const reference = getReferenceData(assessmentData, referenceType);
  
  if (!reference) return false;
  
  if (Array.isArray(reference.content)) {
    return reference.content.length > 0 && reference.content[0] !== 'Not specified';
  }
  
  return reference.content !== 'Not specified' && reference.content.trim() !== '';
} 
