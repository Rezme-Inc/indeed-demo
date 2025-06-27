import { supabase } from "@/lib/supabase";

// Legacy interface - keeping for compatibility but will be deprecated
export interface AutofillData {
  // Database fields (from user_profiles and hr_admin_profiles)
  applicantName: string;
  employerName: string;
  positionTitle: string;
  contactName: string;
  companyAddress: string;
  companyPhone: string;
  
  // Step 1 data (from localStorage or previous assessment)
  position: string;
  jobDuties: string[];
  
  // Step 2 data (from localStorage or previous assessment)
  convictions: Array<{
    date: string;
    description: string;
    timeline: string;
  }>;
  conductDescription: string;
  activitiesSince: string;
  rescissionReasoning: string;
}

// Note: This function is deprecated. Use assessmentDataAggregator.ts instead
// Keeping for backward compatibility but will be removed in future versions

function generateJobDuties(skillsData: any[], employmentData: any[]): string[] {
  const duties: string[] = [];
  
  // Add duties based on skills
  if (skillsData && skillsData.length > 0) {
    skillsData.forEach(skill => {
      if (skill.description) {
        duties.push(`Utilize ${skill.skill_name} skills: ${skill.description}`);
      } else {
        duties.push(`Apply ${skill.skill_name} expertise in daily tasks`);
      }
    });
  }
  
  // Add duties from most recent employment
  if (employmentData && employmentData.length > 0) {
    const recentJob = employmentData[0];
    if (recentJob.responsibilities) {
      try {
        // Handle responsibilities - could be string or array
        let responsibilities: string[] = [];
        
        if (Array.isArray(recentJob.responsibilities)) {
          responsibilities = recentJob.responsibilities;
        } else if (typeof recentJob.responsibilities === 'string') {
          responsibilities = recentJob.responsibilities.split(/[,;]/).map((r: string) => r.trim()).filter(r => r.length > 0);
        }
        
        duties.push(...responsibilities);
      } catch (error) {
        console.error('Error processing responsibilities:', error);
      }
    }
    
    // Add a generic duty based on job title if no specific responsibilities
    if (recentJob.job_title && duties.length === 0) {
      duties.push(`Perform duties as ${recentJob.job_title} at ${recentJob.company_name}`);
    }
  }
  
  // Default duties if none found
  if (duties.length === 0) {
    duties.push(
      "Perform assigned duties in accordance with company policies",
      "Collaborate with team members to achieve departmental goals",
      "Maintain professional standards and work quality"
    );
  }
  
  return duties.slice(0, 5); // Limit to 5 duties
}

function generateActivitiesSince(employmentData: any[], educationData: any[]): string {
  const activities: string[] = [];
  
  // Add employment activities
  if (employmentData && employmentData.length > 0) {
    employmentData.forEach(job => {
      const startYear = new Date(job.start_date).getFullYear();
      const endYear = job.end_date ? new Date(job.end_date).getFullYear() : 'present';
      activities.push(`Employed at ${job.company_name} as ${job.job_title} (${startYear}-${endYear})`);
    });
  }
  
  // Add education activities
  if (educationData && educationData.length > 0) {
    educationData.forEach(edu => {
      const gradYear = edu.graduation_date ? new Date(edu.graduation_date).getFullYear() : 'ongoing';
      activities.push(`Completed ${edu.degree} in ${edu.field_of_study} at ${edu.institution} (${gradYear})`);
    });
  }
  
  return activities.join('. ') || 'Maintained steady employment and continued personal development.';
} 
