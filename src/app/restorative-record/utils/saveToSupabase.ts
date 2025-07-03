import { supabase } from "@/lib/supabase";
import { useFormCRUD } from "../hooks/useFormCRUD";
import {
    Award,
    Education,
    Employment,
    Engagement,
    Hobby,
    Introduction,
    Mentor,
    Microcredential,
    RehabProgram,
    RehabPrograms,
    Skill,
} from "../types";
import { uploadFileToSupabase } from "../utils";

interface SaveToSupabaseParams {
  user: any;
  formData: Introduction;
  educationHook: ReturnType<typeof useFormCRUD<Omit<Education, "id">>>;
  rehabPrograms: RehabPrograms;
  rehabHook: ReturnType<typeof useFormCRUD<Omit<RehabProgram, "id">>>;
  skillsHook: ReturnType<typeof useFormCRUD<Omit<Skill, "id">>>;
  engagementHook: ReturnType<typeof useFormCRUD<Omit<Engagement, "id">>>;
  microHook: ReturnType<typeof useFormCRUD<Omit<Microcredential, "id">>>;
  hobbiesHook: ReturnType<typeof useFormCRUD<Omit<Hobby, "id">>>;
  employmentHook: ReturnType<typeof useFormCRUD<Omit<Employment, "id">>>;
  awardsHook: ReturnType<typeof useFormCRUD<Omit<Award, "id">>>;
  mentorHook: ReturnType<typeof useFormCRUD<Omit<Mentor, "id">>>;
  toast: (options: { title: string; description: string; variant?: string }) => void;
}

export async function saveToSupabase({
  user,
  formData,
  educationHook,
  rehabPrograms,
  rehabHook,
  skillsHook,
  engagementHook,
  microHook,
  hobbiesHook,
  employmentHook,
  awardsHook,
  mentorHook,
  toast,
}: SaveToSupabaseParams) {
  // Save introduction information
  const { error: introError } = await supabase.from("introduction").upsert(
    {
      user_id: user.id,
      facebook_url: formData.facebookUrl || null,
      linkedin_url: formData.linkedinUrl || null,
      reddit_url: formData.redditUrl || null,
      digital_portfolio_url: formData.digitalPortfolioUrl || null,
      instagram_url: formData.instagramUrl || null,
      github_url: formData.githubUrl || null,
      tiktok_url: formData.tiktokUrl || null,
      pinterest_url: formData.pinterestUrl || null,
      twitter_url: formData.twitterUrl || null,
      personal_website_url: formData.personalWebsiteUrl || null,
      handshake_url: formData.handshakeUrl || null,
      preferred_occupation: formData.preferredOccupation || null,
      personal_narrative: formData.personalNarrative || null,
      language_proficiency: formData.languageProficiency || "No Proficiency",
      other_languages: formData.otherLanguages || [],
    },
    {
      onConflict: "user_id",
    }
  );

  if (introError) {
    console.error("Error saving introduction:", introError);
    toast({
      title: "Error",
      description: "Failed to save introduction information",
      variant: "destructive",
    });
    return;
  }

  // Save education information
  for (const education of educationHook.items) {
    // Always preserve existing file fields unless a new file is uploaded or user deletes the file
    let fileUrl = education.filePreview || null;
    let fileName = education.fileName || null;
    let fileSize = education.fileSize || null;

    // Upload file if it exists (new upload)
    if (education.file) {
      const fileData = await uploadFileToSupabase(
        "education-files",
        user.id,
        education.id,
        education.file
      );
      if (fileData) {
        fileUrl = fileData.url;
        fileName = fileData.fileName;
        fileSize = fileData.fileSize;
      } else {
        toast({
          title: "Error",
          description: "Failed to upload education file",
          variant: "destructive",
        });
        continue;
      }
    }

    // Validation: ensure all required fields are present
    if (!education.id || !user.id || !education.school || !education.location || !education.degree || !education.field || !education.startDate) {
      console.error("Skipping upsert: missing required fields for education", { education, userId: user.id });
      toast({
        title: "Error",
        description: "Missing required fields for education. Not saved.",
        variant: "destructive",
      });
      continue;
    }

    // Log the payload
    const educationPayload = {
      user_id: user.id,
      id: education.id,
      school_name: education.school,
      school_location: education.location,
      degree: education.degree,
      field_of_study: education.field,
      currently_enrolled: education.currentlyEnrolled,
      start_date: education.startDate || null,
      end_date: education.currentlyEnrolled ? null : education.endDate || null,
      grade: education.grade || null,
      description: education.description || null,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
    };
    console.log("Upserting education with payload:", educationPayload);

    // Save education data
    const { error: educationError } = await supabase
      .from("education")
      .upsert(educationPayload);

    if (educationError) {
      console.error("Error saving education:", educationError);
      toast({
        title: "Error",
        description: "Failed to save education",
        variant: "destructive",
      });
    }
  }

  // Save rehabilitative programs
  const { error: rehabError } = await supabase
    .from("rehabilitative_programs")
    .upsert({
      user_id: user.id,
      substance_use_disorder: rehabPrograms.substanceUseDisorder,
      substance_use_disorder_details:
        rehabPrograms.substanceUseDisorderDetails,
      womens_justice_centers: rehabPrograms.womensJusticeCenters,
      womens_justice_centers_details:
        rehabPrograms.womensJusticeCentersDetails,
      employment_focused: rehabPrograms.employmentFocused,
      employment_focused_details: rehabPrograms.employmentFocusedDetails,
      adaptable_justice: rehabPrograms.adaptableJustice,
      adaptable_justice_details: rehabPrograms.adaptableJusticeDetails,
      life_skills_training: rehabPrograms.lifeSkillsTraining,
      life_skills_training_details: rehabPrograms.lifeSkillsTrainingDetails,
      community_service: rehabPrograms.communityService,
      community_service_details: rehabPrograms.communityServiceDetails,
      family_reintegration: rehabPrograms.familyReintegration,
      family_reintegration_details: rehabPrograms.familyReintegrationDetails,
      parenting_classes: rehabPrograms.parentingClasses,
      parenting_classes_details: rehabPrograms.parentingClassesDetails,
      mental_wellness: rehabPrograms.mentalWellness,
      mental_wellness_details: rehabPrograms.mentalWellnessDetails,
      faith_based: rehabPrograms.faithBased,
      faith_based_details: rehabPrograms.faithBasedDetails,
      peer_support: rehabPrograms.peerSupport,
      peer_support_details: rehabPrograms.peerSupportDetails,
      arts_recreation: rehabPrograms.artsRecreation,
      arts_recreation_details: rehabPrograms.artsRecreationDetails,
      housing_assistance: rehabPrograms.housingAssistance,
      housing_assistance_details: rehabPrograms.housingAssistanceDetails,
      legal_compliance: rehabPrograms.legalCompliance,
      legal_compliance_details: rehabPrograms.legalComplianceDetails,
      civic_engagement: rehabPrograms.civicEngagement,
      civic_engagement_details: rehabPrograms.civicEngagementDetails,
      veterans_services: rehabPrograms.veteransServices,
      veterans_services_details: rehabPrograms.veteransServicesDetails,
      domestic_violence_reduction: rehabPrograms.domesticViolenceReduction,
      domestic_violence_reduction_details:
        rehabPrograms.domesticViolenceReductionDetails,
      sex_offender_treatment: rehabPrograms.sexOffenderTreatment,
      sex_offender_treatment_details:
        rehabPrograms.sexOffenderTreatmentDetails,
      medical_health_care: rehabPrograms.medicalHealthCare,
      medical_health_care_details: rehabPrograms.medicalHealthCareDetails,
      other: rehabPrograms.other,
      other_details: rehabPrograms.otherDetails,
    });

  if (rehabError) {
    console.error("Error saving rehabilitative programs:", rehabError);
    toast({
      title: "Error",
      description: "Failed to save rehabilitative programs",
      variant: "destructive",
    });
  }

  // Save new rehab programs (CRUD format)
  for (const rehabProgram of rehabHook.items) {
    // Always preserve existing file fields unless a new file is uploaded or user deletes the file
    let fileUrl = rehabProgram.filePreview || null;
    let fileName = rehabProgram.fileName || null;
    let fileSize = rehabProgram.fileSize || null;

    // Upload file if it exists (new upload)
    if (rehabProgram.file) {
      const fileData = await uploadFileToSupabase(
        "rehab-program-files",
        user.id,
        rehabProgram.id,
        rehabProgram.file
      );
      if (fileData) {
        fileUrl = fileData.url;
        fileName = fileData.fileName;
        fileSize = fileData.fileSize;
      } else {
        toast({
          title: "Error",
          description: "Failed to upload rehab program file",
          variant: "destructive",
        });
        continue;
      }
    }

    // Validation: ensure all required fields are present
    if (!rehabProgram.id || !user.id || !rehabProgram.program || !rehabProgram.programType) {
      console.error("Skipping upsert: missing required fields for rehab program", { rehabProgram, userId: user.id });
      toast({
        title: "Error",
        description: "Missing required fields for rehab program. Not saved.",
        variant: "destructive",
      });
      continue;
    }

    // Log the payload
    const rehabPayload = {
      user_id: user.id,
      id: rehabProgram.id,
      program: rehabProgram.program,
      program_type: rehabProgram.programType,
      start_date: rehabProgram.startDate || null,
      end_date: rehabProgram.endDate || null,
      details: rehabProgram.details || null,
      narrative: rehabProgram.narrative || null,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
    };
    console.log("Upserting rehab program with payload:", rehabPayload);

    // Save rehab program data
    const { error: rehabProgramError } = await supabase
      .from("rehab_programs")
      .upsert(rehabPayload);

    if (rehabProgramError) {
      console.error("Error saving rehab program:", rehabProgramError);
      toast({
        title: "Error",
        description: "Failed to save rehab program",
        variant: "destructive",
      });
    }
  }

  // Save skills
  for (const skill of skillsHook.items) {
    // Always preserve existing file fields unless a new file is uploaded or user deletes the file
    let fileUrl = skill.filePreview || null;
    let fileName = skill.fileName || null;
    let fileSize = skill.fileSize || null;

    // Upload file if it exists (new upload)
    if (skill.file) {
      const fileData = await uploadFileToSupabase(
        "skill-files",
        user.id,
        skill.id,
        skill.file
      );
      if (fileData) {
        fileUrl = fileData.url;
        fileName = fileData.fileName;
        fileSize = fileData.fileSize;
      } else {
        toast({
          title: "Error",
          description: "Failed to upload skill file",
          variant: "destructive",
        });
        continue;
      }
    }

    // Validation: ensure all required fields are present
    if (!skill.id || !user.id || !skill.softSkills || !skill.hardSkills) {
      console.error("Skipping upsert: missing required fields for skill", { skill, userId: user.id });
      toast({
        title: "Error",
        description: "Missing required fields for skill. Not saved.",
        variant: "destructive",
      });
      continue;
    }

    // Log the payload
    const skillPayload = {
      user_id: user.id,
      id: skill.id,
      soft_skills: [skill.softSkills], // Convert to array
      hard_skills: [skill.hardSkills], // Convert to array
      other_skills: skill.otherSkills || null,
      narrative: skill.narrative || null,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
    };
    console.log("Upserting skill with payload:", skillPayload);

    // Save skill data
    const { error: skillError } = await supabase.from("skills").upsert(skillPayload);

    if (skillError) {
      console.error("Error saving skill:", skillError);
      toast({
        title: "Error",
        description: "Failed to save skill",
        variant: "destructive",
      });
    }
  }

  // Save community engagement
  for (const engagement of engagementHook.items) {
    // Always preserve existing file fields unless a new file is uploaded or user deletes the file
    let fileUrl = engagement.filePreview || null;
    let fileName = engagement.fileName || null;
    let fileSize = engagement.fileSize || null;

    // Upload file if it exists (new upload)
    if (engagement.file) {
      const fileData = await uploadFileToSupabase(
        "community-engagement-files",
        user.id,
        engagement.id,
        engagement.file
      );
      if (fileData) {
        fileUrl = fileData.url;
        fileName = fileData.fileName;
        fileSize = fileData.fileSize;
      } else {
        toast({
          title: "Error",
          description: "Failed to upload engagement file",
          variant: "destructive",
        });
        continue;
      }
    }

    // Validation: ensure all required fields are present
    if (!engagement.id || !user.id || !engagement.type || !engagement.role || !engagement.orgName || !engagement.details) {
      console.error("Skipping upsert: missing required fields for engagement", { engagement, userId: user.id });
      toast({
        title: "Error",
        description: "Missing required fields for community engagement. Not saved.",
        variant: "destructive",
      });
      continue;
    }

    // Log the payload
    const engagementPayload = {
      user_id: user.id,
      id: engagement.id,
      type: engagement.type,
      role: engagement.role,
      organization_name: engagement.orgName,
      organization_website: engagement.orgWebsite || null,
      details: engagement.details,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
    };
    console.log("Upserting engagement with payload:", engagementPayload);

    // Save engagement data
    const { error: engagementError } = await supabase
      .from("community_engagements")
      .upsert(engagementPayload);

    if (engagementError) {
      console.error("Error saving engagement:", engagementError);
      toast({
        title: "Error",
        description: "Failed to save community engagement",
        variant: "destructive",
      });
    }
  }

  // Save microcredentials
  for (const micro of microHook.items) {
    // Always preserve existing file fields unless a new file is uploaded or user deletes the file
    let fileUrl = micro.filePreview || null;
    let fileName = micro.fileName || null;
    let fileSize = micro.fileSize || null;

    // Upload file if it exists (new upload)
    if (micro.file) {
      const fileData = await uploadFileToSupabase(
        "microcredential-files",
        user.id,
        micro.id,
        micro.file
      );
      if (fileData) {
        fileUrl = fileData.url;
        fileName = fileData.fileName;
        fileSize = fileData.fileSize;
      } else {
        toast({
          title: "Error",
          description: "Failed to upload microcredential file",
          variant: "destructive",
        });
        continue;
      }
    }

    // Validation: ensure all required fields are present
    if (!micro.id || !user.id || !micro.name || !micro.org || !micro.issueDate) {
      console.error("Skipping upsert: missing required fields for microcredential", { micro, userId: user.id });
      toast({
        title: "Error",
        description: "Missing required fields for microcredential. Not saved.",
        variant: "destructive",
      });
      continue;
    }

    // Log the payload
    const microPayload = {
      user_id: user.id,
      id: micro.id,
      name: micro.name,
      issuing_organization: micro.org,
      issue_date: micro.issueDate || null,
      expiry_date: micro.expiryDate || null,
      credential_id: micro.credentialId || null,
      credential_url: micro.credentialUrl || null,
      narrative: micro.narrative || null,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
    };
    console.log("Upserting microcredential with payload:", microPayload);

    // Save microcredential data
    const { error: microError } = await supabase
      .from("micro_credentials")
      .upsert(microPayload);

    if (microError) {
      console.error("Error saving microcredential:", microError);
      toast({
        title: "Error",
        description: "Failed to save microcredential",
        variant: "destructive",
      });
    }
  }

  // Save hobbies
  for (const hobby of hobbiesHook.items) {
    // Always preserve existing file fields unless a new file is uploaded or user deletes the file
    let fileUrl = hobby.filePreview || null;
    let fileName = hobby.fileName || null;
    let fileSize = hobby.fileSize || null;

    // Upload file if it exists (new upload)
    if (hobby.file) {
      const fileData = await uploadFileToSupabase(
        "hobby-files",
        user.id,
        hobby.id,
        hobby.file
      );
      if (fileData) {
        fileUrl = fileData.url;
        fileName = fileData.fileName;
        fileSize = fileData.fileSize;
      } else {
        toast({
          title: "Error",
          description: "Failed to upload hobby file",
          variant: "destructive",
        });
        continue;
      }
    }

    // Validation: ensure all required fields are present
    if (!hobby.id || !user.id || (!hobby.general && !hobby.sports && !hobby.other)) {
      console.error("Skipping upsert: missing required fields for hobby", { hobby, userId: user.id });
      toast({
        title: "Error",
        description: "Missing required fields for hobby. Not saved.",
        variant: "destructive",
      });
      continue;
    }

    // Log the payload
    const hobbyPayload = {
      user_id: user.id,
      id: hobby.id,
      general_hobby: hobby.general || null,
      sports: hobby.sports || null,
      other_interests: hobby.other || null,
      narrative: hobby.narrative || null,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
    };
    console.log("Upserting hobby with payload:", hobbyPayload);

    // Save hobby data
    const { error: hobbyError } = await supabase.from("hobbies").upsert(hobbyPayload);

    if (hobbyError) {
      console.error("Error saving hobby:", hobbyError);
      toast({
        title: "Error",
        description: "Failed to save hobby",
        variant: "destructive",
      });
    }
  }

  // Save employment information
  for (const employment of employmentHook.items) {
    const { error: employmentError } = await supabase
      .from("employment")
      .upsert({
        user_id: user.id,
        id: employment.id,
        state: employment.state,
        city: employment.city,
        employment_type: employment.employmentType,
        title: employment.title,
        company: employment.company,
        company_url: employment.companyUrl || null,
        start_date: employment.startDate || null,
        end_date: employment.currentlyEmployed
          ? null
          : employment.endDate || null,
        currently_employed: employment.currentlyEmployed,
        incarcerated: employment.employedWhileIncarcerated,
      });

    if (employmentError) {
      console.error("Error saving employment:", employmentError);
      toast({
        title: "Error",
        description: "Failed to save employment",
        variant: "destructive",
      });
    }
  }

  // Save awards
  for (const award of awardsHook.items) {
    // Always preserve existing file fields unless a new file is uploaded or user deletes the file
    let fileUrl = award.filePreview || null;
    let fileName = award.fileName || null;
    let fileSize = award.fileSize || null;

    // Upload file if it exists (new upload)
    if (award.file) {
      const fileData = await uploadFileToSupabase(
        "award-files",
        user.id,
        award.id,
        award.file
      );
      if (fileData) {
        fileUrl = fileData.url;
        fileName = fileData.fileName;
        fileSize = fileData.fileSize;
      } else {
        toast({
          title: "Error",
          description: "Failed to upload award file",
          variant: "destructive",
        });
        continue;
      }
    }

    // Validation: ensure all required fields are present
    if (!award.id || !user.id || !award.type || !award.name || !award.organization || !award.date) {
      console.error("Skipping upsert: missing required fields for award", { award, userId: user.id });
      toast({
        title: "Error",
        description: "Missing required fields for award. Not saved.",
        variant: "destructive",
      });
      continue;
    }

    // Format the date to ensure it's in the correct timezone
    const awardDate = award.date ? new Date(award.date + "T00:00:00") : null;

    // Log the payload
    const awardPayload = {
      user_id: user.id,
      id: award.id,
      type: award.type,
      name: award.name,
      organization: award.organization,
      date: awardDate ? awardDate.toISOString().split("T")[0] : null,
      narrative: award.narrative || null,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
    };
    console.log("Upserting award with payload:", awardPayload);

    // Save award data
    const { error: awardError } = await supabase.from("awards").upsert(awardPayload);

    if (awardError) {
      console.error("Error saving award:", awardError);
      toast({
        title: "Error",
        description: "Failed to save award",
        variant: "destructive",
      });
    }
  }

  // Save mentors
  for (const mentor of mentorHook.items) {
    const { error: mentorError } = await supabase.from("mentors").upsert({
      user_id: user.id,
      id: mentor.id,
      linkedin_profile: mentor.linkedin || null,
      name: mentor.name,
      company: mentor.company || null,
      title: mentor.title || null,
      email: mentor.email || null,
      phone: mentor.phone || null,
      website: mentor.website || null,
      narrative: mentor.narrative || null,
    });

    if (mentorError) {
      console.error("Error saving mentor:", mentorError);
      toast({
        title: "Error",
        description: "Failed to save mentor",
        variant: "destructive",
      });
    }
  }
}

export async function deleteFromSupabase(
  table: string,
  id: string,
  userId: string,
  toast: (options: { title: string; description: string; variant?: string }) => void
) {
  try {
    console.log(`Attempting to delete item ${id} from ${table} for user ${userId}`);
    
    // Delete the item directly - no need to check existence first
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error(`Error deleting from ${table}:`, deleteError);
      toast({
        title: "Error",
        description: `Failed to delete from ${table}`,
        variant: "destructive",
      });
      return false;
    }

    console.log(`Successfully deleted item ${id} from ${table}`);
    return true;
  } catch (error) {
    console.error(`Unexpected error deleting from ${table}:`, error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while deleting",
      variant: "destructive",
    });
    return false;
  }
} 
