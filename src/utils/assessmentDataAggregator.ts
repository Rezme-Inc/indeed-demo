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
    data.companyAddress = hrAdmin.company_address || '';
    data.companyPhone = hrAdmin.phone || '';
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
      data.offerDate = step1Data.date || '';
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
      data.assessmentDate = step2Data.assessmentDate || '';
      data.reportDate = step2Data.reportDate || '';
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

/**
 * Helper function to get autofill suggestions for Step 2 Part 5 (Assessment Details)
 */
export function getStep2Part5Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
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
export function getStep4Suggestions(
  candidateId: string,
  candidateProfile?: any,
  hrAdmin?: any
) {
  const sharedData = getSharedAssessmentData(candidateId, candidateProfile, hrAdmin);
  
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
 