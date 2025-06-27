export interface SharedAssessmentData {
  // Database fields
  applicantName: string;
  employerName: string;
  contactName: string;
  companyAddress: string;
  companyPhone: string;
  
  // Step 1 data
  position: string;
  employer: string;
  
  // Step 2 data
  jobDuties: string[];
  conductDescription: string;
  activitiesSince: string;
  rescissionReasoning: string;
  timeAgo: string;
}

/**
 * Aggregates assessment data from localStorage for cross-step data reuse
 * This is a read-only utility that doesn't create dependencies between steps
 */
export function getSharedAssessmentData(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
): Partial<SharedAssessmentData> {
  const data: Partial<SharedAssessmentData> = {};
  
  // Database fields from context data
  if (candidateProfile) {
    data.applicantName = `${candidateProfile.first_name} ${candidateProfile.last_name}`;
  }
  
  if (hrAdmin) {
    data.employerName = hrAdmin.company;
    data.contactName = `${hrAdmin.first_name} ${hrAdmin.last_name}`;
  }
  
  // Only read localStorage if we're in the browser
  if (typeof window === 'undefined') {
    return data;
  }
  
  try {
    // Step 1 data (conditional job offer)
    const offerFormData = localStorage.getItem(`offerForm_${candidateId}`);
    if (offerFormData) {
      const step1Data = JSON.parse(offerFormData);
      data.position = step1Data.position || '';
      data.employer = step1Data.employer || '';
    }
    
    // Step 2 data (individualized assessment)
    const assessmentFormData = localStorage.getItem(`assessmentForm_${candidateId}`);
    if (assessmentFormData) {
      const step2Data = JSON.parse(assessmentFormData);
      data.jobDuties = step2Data.duties?.filter((d: string) => d.trim()) || [];
      data.conductDescription = step2Data.conduct || '';
      data.activitiesSince = step2Data.activities?.filter((a: string) => a.trim()).join('. ') || '';
      data.rescissionReasoning = step2Data.rescindReason || '';
      data.timeAgo = step2Data.howLongAgo || '';
    }
  } catch (error) {
    console.error('Error reading assessment data from localStorage:', error);
  }
  
  return data;
}

/**
 * Helper function to get autofill suggestions for Step 3 Part 1
 */
export function getStep3Part1Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
  return {
    applicantName: sharedData.applicantName || "",
    position: sharedData.position || "",
    contactName: sharedData.contactName || "",
    companyName: sharedData.employerName || "",
    address: sharedData.companyAddress || "",
    phone: sharedData.companyPhone || "",
    date: new Date().toISOString().split('T')[0]
  };
}

/**
 * Helper function to get autofill suggestions for Step 3 Part 2
 */
export function getStep3Part2Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
  return {
    conductTimeAgo: sharedData.timeAgo || "",
  };
}

/**
 * Helper function to get autofill suggestions for Step 3 Part 3
 */
export function getStep3Part3Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
  return {
    jobDuties: sharedData.jobDuties?.join(', ') || "",
    seriousnessReason: "",
    revocationReason: "",
  };
} 
 