import { AssessmentDatabaseService } from '@/lib/services/assessmentDatabase';

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
  offerDate: string;
  
  // Step 2 data
  jobDuties: string[];
  conductDescription: string;
  activitiesSince: string;
  rescissionReasoning: string;
  timeAgo: string;
  assessmentDate: string;
  reportDate: string;
  
  // Step 4 data
  reassessmentDecision: string;
  extendReason: boolean;
  reassessmentDate: string;
  evidence: string[];
  errorYesNo: string;
  rescindReason: string;
  
  // Step 5 data
  finalDecision: string;
  finalRevocationDate: string;
  noResponse: boolean;
  infoSubmitted: boolean;
  infoSubmittedList: string;
  convictions: string[];
  seriousReason: string;
  fitnessReason: string;
}

/**
 * Main function to get shared assessment data across all steps
 * Checks database first for completed steps, falls back to localStorage
 */
export async function getSharedAssessmentData(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
): Promise<Partial<SharedAssessmentData>> {
  const data: Partial<SharedAssessmentData> = {};
  
  // Database fields from context data
  if (candidateProfile) {
    data.applicantName = `${candidateProfile.first_name || ''} ${candidateProfile.last_name || ''}`.trim();
  } else {
    console.warn('[getSharedAssessmentData] candidateProfile is missing');
  }
  
  if (hrAdmin) {
    data.employerName = hrAdmin.company || '';
    data.contactName = `${hrAdmin.first_name || ''} ${hrAdmin.last_name || ''}`.trim();
    data.companyAddress = hrAdmin.company_address || '';
    data.companyPhone = hrAdmin.phone || '';
  } else {
    console.warn('[getSharedAssessmentData] hrAdmin is missing');
  }
  
  // Only read localStorage if we're in the browser
  if (typeof window === 'undefined') {
    return data;
  }
  
  try {
    // Step 1 data - Check database first, then localStorage
    await getStep1Data(candidateId, data);
    
    // Step 2 data - Check database first, then localStorage
    await getStep2Data(candidateId, data);
    
    // Step 4 data - Check database first, then localStorage
    await getStep4Data(candidateId, data);
    
    // Step 5 data - Check database first, then localStorage
    await getStep5Data(candidateId, data);
    
  } catch (error) {
    console.error('[getSharedAssessmentData] Error reading assessment data:', error);
  }
  
  return data;
}

/**
 * Helper function to get Step 1 data (position, job duties, offer date)
 */
async function getStep1Data(candidateId: string, data: Partial<SharedAssessmentData>) {
  try {
    // First check if assessment exists at all - if not, skip database queries entirely
    const assessmentExists = await AssessmentDatabaseService.assessmentExists(candidateId);
    
    if (assessmentExists) {
      // Get current step to avoid unnecessary queries to assessment_steps_new
      const currentStep = await AssessmentDatabaseService.getCurrentStep(candidateId);
      
      // Only query step data if we're past Step 1 (Step 1 completed means current step > 1)
      if (currentStep > 1) {
        console.log('[getStep1Data] Step 1 is completed, getting data from database...');
        const step1FromDB = await AssessmentDatabaseService.getStepData(candidateId, 1);
        
        if (step1FromDB) {
          console.log('[getStep1Data] Found completed Step 1 in database:', step1FromDB);
          
          // Map database fields to our data structure
          data.position = step1FromDB.position || '';
          data.jobDuties = step1FromDB.duties || [];
          data.offerDate = step1FromDB.offer_date || '';
          
          return; // Exit early if we found database data
        }
      }
    }
    
    console.log('[getStep1Data] Using localStorage for Step 1 data...');
    
    // Use localStorage (Step 1 in progress, not started, or assessment doesn't exist)
    const offerResultsData = localStorage.getItem(`step1_offer_results_${candidateId}`);
    if (offerResultsData) {
      const offerResults = JSON.parse(offerResultsData);
      data.offerDate = offerResults.offerDate || '';
      console.log(`[getStep1Data] Found offer date from localStorage: ${data.offerDate}`);
    } else {
      console.warn(`[getStep1Data] No offer results found in localStorage for candidateId: ${candidateId}`);
    }

    const jobResultsData = localStorage.getItem(`step1_job_results_${candidateId}`);
    if (jobResultsData) {
      const jobResults = JSON.parse(jobResultsData);
      data.jobDuties = jobResults.duties?.filter((d: string) => d.trim()) || [];
      data.position = jobResults.position || '';
      console.log(`[getStep1Data] Found job data from localStorage - position: ${data.position}, duties: ${data.jobDuties?.length}`);
    } else {
      console.warn(`[getStep1Data] No job results found in localStorage for candidateId: ${candidateId}`);
    }
    
  } catch (error) {
    console.error('[getStep1Data] Error getting Step 1 data:', error);
  }
}

/**
 * Helper function to get Step 2 data (conduct, timing, etc.)
 */
async function getStep2Data(candidateId: string, data: Partial<SharedAssessmentData>) {
  try {
    // First check if assessment exists at all - if not, skip database queries entirely
    const assessmentExists = await AssessmentDatabaseService.assessmentExists(candidateId);
    
    if (assessmentExists) {
      // Get current step to avoid unnecessary queries to assessment_steps_new
      const currentStep = await AssessmentDatabaseService.getCurrentStep(candidateId);
      
      // Only query step data if we're past Step 2 (Step 2 completed means current step > 2)
      if (currentStep > 2) {
        console.log('[getStep2Data] Step 2 is completed, getting data from database...');
        const step2FromDB = await AssessmentDatabaseService.getStepData(candidateId, 2);
        
        if (step2FromDB) {
          console.log('[getStep2Data] Found completed Step 2 in database:', step2FromDB);
          console.log('[getStep2Data] howLongAgo field from DB:', step2FromDB.howLongAgo);
          
          // Map database fields to our data structure
          data.conductDescription = step2FromDB.conduct || '';
          data.activitiesSince = step2FromDB.activities?.filter((a: string) => a.trim()).join('. ') || '';
          data.rescissionReasoning = step2FromDB.rescindReason || '';
          data.timeAgo = step2FromDB.howLongAgo || '';
          data.assessmentDate = step2FromDB.assessmentDate || '';
          data.reportDate = step2FromDB.reportDate || '';
          
          console.log('[getStep2Data] Mapped timeAgo field:', data.timeAgo);
          
          return; // Exit early if we found database data
        }
      }
    }
    
    console.log('[getStep2Data] Using localStorage for Step 2 data...');
    
    // Use localStorage (Step 2 in progress, not started, or assessment doesn't exist)
    const assessmentFormData = localStorage.getItem(`assessmentForm_${candidateId}`);
    if (assessmentFormData) {
      const step2Data = JSON.parse(assessmentFormData);
      console.log('[getStep2Data] Step 2 data from localStorage:', step2Data);
      console.log('[getStep2Data] howLongAgo field from localStorage:', step2Data.howLongAgo);
      
      data.conductDescription = step2Data.conduct || '';
      data.activitiesSince = step2Data.activities?.filter((a: string) => a.trim()).join('. ') || '';
      data.rescissionReasoning = step2Data.rescindReason || '';
      data.timeAgo = step2Data.howLongAgo || '';
      data.assessmentDate = step2Data.assessmentDate || '';
      data.reportDate = step2Data.reportDate || '';
      
      console.log('[getStep2Data] Mapped timeAgo from localStorage:', data.timeAgo);
      console.log(`[getStep2Data] Found Step 2 data from localStorage`);
    } else {
      console.warn(`[getStep2Data] No Step 2 data found in localStorage for candidateId: ${candidateId}`);
    }
    
  } catch (error) {
    console.error('[getStep2Data] Error getting Step 2 data:', error);
  }
}

/**
 * Helper function to get Step 4 data (reassessment decision, evidence, etc.)
 */
async function getStep4Data(candidateId: string, data: Partial<SharedAssessmentData>) {
  try {
    // First check if assessment exists at all - if not, skip database queries entirely
    const assessmentExists = await AssessmentDatabaseService.assessmentExists(candidateId);
    
    if (assessmentExists) {
      // Get current step to avoid unnecessary queries to assessment_steps_new
      const currentStep = await AssessmentDatabaseService.getCurrentStep(candidateId);
      
      // Only query step data if we're past Step 4 (Step 4 completed means current step > 4)
      if (currentStep > 4) {
        console.log('[getStep4Data] Step 4 is completed, getting data from database...');
        const step4FromDB = await AssessmentDatabaseService.getStepData(candidateId, 4);
        
        if (step4FromDB) {
          console.log('[getStep4Data] Found completed Step 4 in database:', step4FromDB);
          
          // Map database fields to our data structure
          data.reassessmentDecision = step4FromDB.decision || '';
          data.extendReason = step4FromDB.decision === 'extend';
          data.reassessmentDate = step4FromDB.reassessmentDate || '';
          data.evidence = step4FromDB.evidence || [];
          data.errorYesNo = step4FromDB.errorYesNo || '';
          data.rescindReason = step4FromDB.rescindReason || '';
          
          return; // Exit early if we found database data
        }
      }
    }
    
    console.log('[getStep4Data] Using localStorage for Step 4 data...');
    
    // Use localStorage (Step 4 in progress, not started, or assessment doesn't exist)
    const reassessmentFormData = localStorage.getItem(`reassessmentForm_${candidateId}`);
    if (reassessmentFormData) {
      const step4Data = JSON.parse(reassessmentFormData);
      console.log('[getStep4Data] Step 4 data from localStorage:', step4Data);
      
      // Map localStorage fields to our data structure - need to convert old format to new format
      data.reassessmentDecision = step4Data.decision || '';
      data.extendReason = step4Data.decision === 'extend';
      data.reassessmentDate = step4Data.reassessmentDate || '';
      
      // Convert individual evidence fields to evidence array
      const evidenceFields = [
        step4Data.evidenceA,
        step4Data.evidenceB, 
        step4Data.evidenceC,
        step4Data.evidenceD
      ].filter(evidence => evidence && evidence.trim());
      
      data.evidence = evidenceFields;
      data.errorYesNo = step4Data.errorYesNo || '';
      data.rescindReason = step4Data.rescindReason || '';
      
      console.log(`[getStep4Data] Found Step 4 data from localStorage`);
    } else {
      console.warn(`[getStep4Data] No Step 4 data found in localStorage for candidateId: ${candidateId}`);
    }
    
  } catch (error) {
    console.error('[getStep4Data] Error getting Step 4 data:', error);
  }
}

/**
 * Helper function to get Step 5 data (final revocation decision, reasons, etc.)
 */
async function getStep5Data(candidateId: string, data: Partial<SharedAssessmentData>) {
  try {
    // First check if assessment exists at all - if not, skip database queries entirely
    const assessmentExists = await AssessmentDatabaseService.assessmentExists(candidateId);
    
    if (assessmentExists) {
      // Get current step to avoid unnecessary queries to assessment_steps_new
      const currentStep = await AssessmentDatabaseService.getCurrentStep(candidateId);
      
      // Only query step data if we're past Step 5 (Step 5 completed means current step > 5)
      if (currentStep > 5) {
        console.log('[getStep5Data] Step 5 is completed, getting data from database...');
        const step5FromDB = await AssessmentDatabaseService.getStepData(candidateId, 5);
        
        if (step5FromDB) {
          console.log('[getStep5Data] Found completed Step 5 in database:', step5FromDB);
          
          // Map database fields to our data structure
          data.finalDecision = "revoked"; // Step 5 completion means revocation
          data.finalRevocationDate = step5FromDB.dateOfNotice || step5FromDB.date || '';
          data.noResponse = step5FromDB.noResponse || false;
          data.infoSubmitted = step5FromDB.infoSubmitted || false;
          data.infoSubmittedList = step5FromDB.infoSubmittedList || '';
          data.convictions = step5FromDB.convictions || [];
          data.seriousReason = step5FromDB.seriousReason || '';
          data.fitnessReason = step5FromDB.fitnessReason || '';
          
          return; // Exit early if we found database data
        }
      }
    }
    
    console.log('[getStep5Data] Using localStorage for Step 5 data...');
    
    // Use localStorage (Step 5 in progress, not started, or assessment doesn't exist)
    const finalRevocationFormData = localStorage.getItem(`finalRevocationForm_${candidateId}`);
    if (finalRevocationFormData) {
      const step5Data = JSON.parse(finalRevocationFormData);
      console.log('[getStep5Data] Step 5 data from localStorage:', step5Data);
      
      // Map localStorage fields to our data structure
      data.finalDecision = step5Data.decision || "revoked"; // Step 5 is for revocation
      data.finalRevocationDate = step5Data.dateOfNotice || step5Data.date || '';
      data.noResponse = step5Data.noResponse || false;
      data.infoSubmitted = step5Data.infoSubmitted || false;
      data.infoSubmittedList = step5Data.infoSubmittedList || '';
      data.convictions = step5Data.convictions || [];
      data.seriousReason = step5Data.seriousReason || '';
      data.fitnessReason = step5Data.fitnessReason || '';
      
      console.log(`[getStep5Data] Found Step 5 data from localStorage`);
    } else {
      console.warn(`[getStep5Data] No Step 5 data found in localStorage for candidateId: ${candidateId}`);
    }
    
  } catch (error) {
    console.error('[getStep5Data] Error getting Step 5 data:', error);
  }
}

/**
 * Helper function to get autofill suggestions for Step 2 Part 1 (Position & Job Duties)
 */
export async function getStep2Part1Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = await getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
  return {
    position: sharedData.position || "",
    duties: sharedData.jobDuties || [],
  };
}

/**
 * Helper function to get autofill suggestions for Step 2 Part 2 (Criminal History Details)
 */
export async function getStep2Part2Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = await getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
  // Get current date in user's local timezone for report date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDate = `${year}-${month}-${day}`;
  
  return {
    reportDate: sharedData.reportDate || localDate, // Use stored report date or current date
    howLongAgo: sharedData.timeAgo || "",
    conduct: sharedData.conductDescription || "",
  };
}

/**
 * Helper function to get autofill suggestions for Step 3 Part 1
 */
export async function getStep3Part1Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = await getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
  // Get current date in user's local timezone
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDate = `${year}-${month}-${day}`;
  
  return {
    applicantName: sharedData.applicantName || "",
    position: sharedData.position || "",
    contactName: sharedData.contactName || "",
    companyName: sharedData.employerName || "",
    address: sharedData.companyAddress || "",
    phone: sharedData.companyPhone || "",
    date: localDate
  };
}

/**
 * Helper function to get autofill suggestions for Step 3 Part 2
 */
export async function getStep3Part2Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  console.log('[getStep3Part2Suggestions] Starting...');
  const sharedData = await getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
  console.log('[getStep3Part2Suggestions] Shared data:', sharedData);
  console.log('[getStep3Part2Suggestions] timeAgo from shared data:', sharedData.timeAgo);
  
  const result = {
    conductTimeAgo: sharedData.timeAgo || "",
  };
  
  console.log('[getStep3Part2Suggestions] Final result:', result);
  return result;
}

/**
 * Helper function to get autofill suggestions for Step 3 Part 3
 */
export async function getStep3Part3Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = await getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
  return {
    jobDuties: sharedData.jobDuties?.join(', ') || "",
    seriousnessReason: "",
    revocationReason: "",
  };
}

/**
 * Helper function to get autofill suggestions for Step 2 Part 5 (Assessment Details)
 */
export async function getStep2Part5Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = await getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
  // Get current date in user's local timezone
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDate = `${year}-${month}-${day}`;
  
  return {
    employer: sharedData.employerName || "",
    applicant: sharedData.applicantName || "",
    offerDate: sharedData.offerDate || "",
    assessmentDate: localDate, // Current date in user's local timezone
    performedBy: sharedData.contactName || "",
  };
}

/**
 * Helper function to get autofill suggestions for Step 4 Individual Reassessment
 */
export async function getStep4Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = await getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
  // Get current date in user's local timezone
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDate = `${year}-${month}-${day}`;
  
  return {
    employer: sharedData.employerName || "",
    applicant: sharedData.applicantName || "",
    position: sharedData.position || "",
    offerDate: sharedData.offerDate || "",
    reassessmentDate: localDate, // Current date in user's local timezone
    reportDate: sharedData.reportDate || "",
    performedBy: sharedData.contactName || "",
  };
}

/**
 * Helper function to get autofill suggestions for Step 5 Final Revocation Notice
 */
export async function getStep5Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = await getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
  // Get current date in user's local timezone
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDate = `${year}-${month}-${day}`;
  
  return {
    // Basic information
    date: localDate, // Current date
    applicant: sharedData.applicantName || "",
    dateOfNotice: localDate, // Current date for notice
    position: sharedData.position || "",
    
    // Job duties from Step 1 AI processing results
    jobDuties: sharedData.jobDuties || [],
    
    // Assessment reasoning (can be pulled from Step 2 or Step 3 data)
    seriousReason: "", // This would need to be filled manually
    timeSinceConduct: sharedData.timeAgo || "",
    timeSinceSentence: sharedData.timeAgo || "", // Use same timeAgo as conduct for now
    fitnessReason: sharedData.rescissionReasoning || "",
    
    // Convictions (these would typically come from Step 3 data)
    convictions: ["", "", ""], // Empty array to be filled
    
    // Contact information
    contactName: sharedData.contactName || "",
    companyName: sharedData.employerName || "",
    address: sharedData.companyAddress || "",
    phone: sharedData.companyPhone || "",
    
    // Default values for checkboxes/radios
    noResponse: false,
    infoSubmitted: false,
    infoSubmittedList: "",
    errorOnReport: "",
    reconsideration: "",
    reconsiderationProcedure: "",
  };
}

/**
 * Helper function to get reference data for Step 4 evidence fields
 * This provides context from the candidate's restorative record for evidence of rehabilitation
 */
export function getStep4ReferenceData(restorativeData?: any) {
  const formatEducationContent = (education: any[]) => {
    if (!education || education.length === 0) return "No education records available";
    return education.map((edu, index) => 
      `${index + 1}. ${edu.degree} in ${edu.field_of_study} from ${edu.school_name} (${edu.start_date ? new Date(edu.start_date).getFullYear() : 'N/A'}-${edu.currently_enrolled ? 'Present' : edu.end_date ? new Date(edu.end_date).getFullYear() : 'N/A'})${edu.description ? ` - ${edu.description}` : ''}`
    );
  };

  const formatEmploymentContent = (employment: any[]) => {
    if (!employment || employment.length === 0) return "No employment records available";
    return employment.map((emp, index) => 
      `${index + 1}. ${emp.title} at ${emp.company} (${emp.start_date ? new Date(emp.start_date).getFullYear() : 'N/A'}-${emp.currently_employed ? 'Present' : emp.end_date ? new Date(emp.end_date).getFullYear() : 'N/A'}) - ${emp.employment_type || 'N/A'}`
    );
  };

  const formatProgramsContent = (programs: any[]) => {
    if (!programs || programs.length === 0) return "No rehabilitation programs available";
    return programs.map((prog, index) => 
      `${index + 1}. ${prog.program_name || prog.type || 'Program'}: ${prog.details || prog.description || 'No details available'}`
    );
  };

  const formatCommunityContent = (community: any[]) => {
    if (!community || community.length === 0) return "No community engagement records available";
    return community.map((comm, index) => 
      `${index + 1}. ${comm.role || 'Role'} at ${comm.organization_name || comm.orgName || 'Organization'} - ${comm.type}: ${comm.details || 'No details available'}`
    );
  };

  const formatAchievementsContent = (achievements: any[]) => {
    if (!achievements || achievements.length === 0) return "No achievements available";
    return achievements.map((ach, index) => 
      `${index + 1}. ${ach.name} (${ach.type}) from ${ach.organization} - ${new Date(ach.date).getFullYear()}${ach.narrative ? `: ${ach.narrative}` : ''}`
    );
  };

  const formatSkillsContent = (skills: any[]) => {
    if (!skills || skills.length === 0) return "No skills records available";
    return skills.map((skill, index) => {
      const parts = [];
      if (skill.soft_skills) parts.push(`Soft Skills: ${skill.soft_skills}`);
      if (skill.hard_skills) parts.push(`Hard Skills: ${skill.hard_skills}`);
      if (skill.other_skills) parts.push(`Other Skills: ${skill.other_skills}`);
      if (skill.narrative) parts.push(`Description: ${skill.narrative}`);
      return `${index + 1}. ${parts.join(' | ')}`;
    });
  };
  
  return {
    education: {
      title: "Education & Training",
      content: restorativeData?.education ? formatEducationContent(restorativeData.education) : "No education records available",
      source: "Restorative Record",
      fieldType: 'array' as const
    },
    employment: {
      title: "Employment History", 
      content: restorativeData?.employment ? formatEmploymentContent(restorativeData.employment) : "No employment records available",
      source: "Restorative Record",
      fieldType: 'array' as const
    },
    programs: {
      title: "Rehabilitative Programs",
      content: restorativeData?.rehab_programs ? formatProgramsContent(restorativeData.rehab_programs) : "No rehabilitation programs available",
      source: "Restorative Record", 
      fieldType: 'array' as const
    },
    community: {
      title: "Community Engagement",
      content: restorativeData?.community_engagements ? formatCommunityContent(restorativeData.community_engagements) : "No community engagement records available",
      source: "Restorative Record",
      fieldType: 'array' as const
    },
    achievements: {
      title: "Personal Achievements",
      content: restorativeData?.awards ? formatAchievementsContent(restorativeData.awards) : "No achievements available",
      source: "Restorative Record",
      fieldType: 'array' as const
    },
    skills: {
      title: "Skills & Abilities", 
      content: restorativeData?.skills ? formatSkillsContent(restorativeData.skills) : "No skills records available",
      source: "Restorative Record",
      fieldType: 'array' as const
    }
  };
} 
 