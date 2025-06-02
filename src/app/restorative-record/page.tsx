"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import "react-day-picker/dist/style.css";
import { toast } from "react-hot-toast";

// Import types
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
  RehabProgramDetailsKey,
  RehabProgramKey,
  RehabPrograms,
  Skill,
} from "./types";

// Import constants
import { categories } from "./constants";

// Import utils
import { createFilePreview } from "./utils";
import { saveToSupabase } from "./utils/saveToSupabase";

// Import section components
import {
  CommunityEngagementSection,
  EducationSection,
  EmploymentHistorySection,
  HobbiesSection,
  IntroductionSection,
  MentorsSection,
  MicrocredentialsSection,
  PersonalAchievementsSection,
  RehabilitativeProgramsSection,
  SkillsSection,
} from "./sections";

// Import hooks
import { useFormCRUD } from "./hooks/useFormCRUD";

export default function RestorativeRecordBuilder() {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState(0);
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<Introduction>({
    facebookUrl: "",
    linkedinUrl: "",
    redditUrl: "",
    digitalPortfolioUrl: "",
    instagramUrl: "",
    githubUrl: "",
    tiktokUrl: "",
    pinterestUrl: "",
    twitterUrl: "",
    personalWebsiteUrl: "",
    handshakeUrl: "",
    preferredOccupation: "",
    personalNarrative: "",
    languageProficiency: "No Proficiency",
    otherLanguages: [],
  });
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Award state with custom hook
  const awardsHook = useFormCRUD<Omit<Award, "id">>({
    initialFormState: {
      type: "",
      name: "",
      organization: "",
      date: "",
      file: null,
      filePreview: "",
      narrative: "",
    },
    validateForm: (form) => {
      return !!(form.type && form.name && form.organization && form.date);
    },
  });

  const [awardFileError, setAwardFileError] = useState("");

  // Fetch awards from Supabase on mount and when navigating to the Personal Achievements section
  useEffect(() => {
    async function fetchAwards() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: awardsData } = await supabase
        .from("awards")
        .select("*")
        .eq("user_id", user.id);
      if (awardsData && Array.isArray(awardsData)) {
        // Map Supabase fields to form fields
        const mappedAwards = awardsData.map((remote) => ({
          id: remote.id,
          type: remote.type || "",
          name: remote.name || "",
          organization: remote.organization || "",
          date: remote.date || "",
          file: null, // File upload not restored from DB
          filePreview: remote.file_url || "",
          narrative: remote.narrative || "",
        }));
        // Merge with local unsaved entries by id
        const localAwards = awardsHook.items || [];
        const mergedAwards = [
          ...mappedAwards.filter(
            (remote) => !localAwards.some((local) => local.id === remote.id)
          ),
          ...localAwards,
        ];
        awardsHook.setItems(mergedAwards);
      }
    }
    // Fetch on mount and whenever the Personal Achievements section is active
    if (categories[currentCategory] === "personal-achievements") {
      fetchAwards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory]);

  // Skills state with custom hook
  const skillsHook = useFormCRUD<Omit<Skill, "id">>({
    initialFormState: {
      softSkills: "",
      hardSkills: "",
      otherSkills: "",
      file: null,
      filePreview: "",
      narrative: "",
    },
    validateForm: (form) => {
      return !!(form.softSkills && form.hardSkills);
    },
  });

  const [skillsFileError, setSkillsFileError] = useState("");

  // Fetch skills from Supabase on mount and when navigating to the Skills section
  useEffect(() => {
    async function fetchSkills() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: skillsData } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", user.id);
      if (skillsData && Array.isArray(skillsData)) {
        // Map Supabase fields to form fields
        const mappedSkills = skillsData.map((remote) => ({
          id: remote.id,
          softSkills: Array.isArray(remote.soft_skills) ? remote.soft_skills.join(", ") : "",
          hardSkills: Array.isArray(remote.hard_skills) ? remote.hard_skills.join(", ") : "",
          otherSkills: remote.other_skills || "",
          file: null, // File upload not restored from DB
          filePreview: remote.file_url || "",
          narrative: remote.narrative || "",
        }));
        // Merge with local unsaved entries by id
        const localSkills = skillsHook.items || [];
        const mergedSkills = [
          ...mappedSkills.filter(
            (remote) => !localSkills.some((local) => local.id === remote.id)
          ),
          ...localSkills,
        ];
        skillsHook.setItems(mergedSkills);
      }
    }
    // Fetch on mount and whenever the Skills section is active
    if (categories[currentCategory] === "skills") {
      fetchSkills();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory]);

  // Get user on mount
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  // Function to refresh community engagement data
  const refreshEngagements = async () => {
    if (!user) return;
    
    const { data: engagementData } = await supabase
      .from("community_engagements")
      .select("*")
      .eq("user_id", user.id);
    if (engagementData && Array.isArray(engagementData)) {
      // Map Supabase fields to form fields
      const mappedEngagements = engagementData.map((remote) => ({
        id: remote.id,
        type: remote.type || "",
        role: remote.role || "",
        orgName: remote.organization_name || "",
        orgWebsite: remote.organization_website || "",
        details: remote.details || "",
        file: null, // File upload not restored from DB
        filePreview: remote.file_url || "",
      }));
      engagementHook.setItems(mappedEngagements);
    } else {
      engagementHook.setItems([]);
    }
  };

  // Engagement state with custom hook
  const engagementHook = useFormCRUD<Omit<Engagement, "id">>({
    initialFormState: {
      type: "",
      role: "",
      orgName: "",
      orgWebsite: "",
      details: "",
      file: null,
      filePreview: "",
    },
    validateForm: (form) => {
      return !!(form.type && form.role && form.orgName && form.details);
    },
    tableName: "community_engagements",
    userId: user?.id,
    toast: (options) => {
      if (options.variant === "destructive") {
        toast.error(options.description);
      } else {
        toast.success(options.description);
      }
    },
  });

  const [engagementFileError, setEngagementFileError] = useState("");

  // Fetch community engagement from Supabase on mount and when navigating to the Community Engagement section
  useEffect(() => {
    async function fetchEngagements() {
      if (!user) return;
      
      const { data: engagementData } = await supabase
        .from("community_engagements")
        .select("*")
        .eq("user_id", user.id);
      if (engagementData && Array.isArray(engagementData)) {
        // Map Supabase fields to form fields
        const mappedEngagements = engagementData.map((remote) => ({
          id: remote.id,
          type: remote.type || "",
          role: remote.role || "",
          orgName: remote.organization_name || "",
          orgWebsite: remote.organization_website || "",
          details: remote.details || "",
          file: null, // File upload not restored from DB
          filePreview: remote.file_url || "",
        }));
        engagementHook.setItems(mappedEngagements);
      } else {
        engagementHook.setItems([]);
      }
    }
    // Always fetch when entering the community engagement section and user is available
    if (categories[currentCategory] === "community-engagement" && user) {
      fetchEngagements();
    }
  }, [currentCategory, user]);

  // Rehabilitative Programs state
  const [rehabPrograms, setRehabPrograms] = useState<RehabPrograms>({
    substanceUseDisorder: false,
    substanceUseDisorderDetails: "",
    womensJusticeCenters: false,
    womensJusticeCentersDetails: "",
    employmentFocused: false,
    employmentFocusedDetails: "",
    adaptableJustice: false,
    adaptableJusticeDetails: "",
    lifeSkillsTraining: false,
    lifeSkillsTrainingDetails: "",
    communityService: false,
    communityServiceDetails: "",
    familyReintegration: false,
    familyReintegrationDetails: "",
    parentingClasses: false,
    parentingClassesDetails: "",
    mentalWellness: false,
    mentalWellnessDetails: "",
    faithBased: false,
    faithBasedDetails: "",
    peerSupport: false,
    peerSupportDetails: "",
    artsRecreation: false,
    artsRecreationDetails: "",
    housingAssistance: false,
    housingAssistanceDetails: "",
    legalCompliance: false,
    legalComplianceDetails: "",
    civicEngagement: false,
    civicEngagementDetails: "",
    veteransServices: false,
    veteransServicesDetails: "",
    domesticViolenceReduction: false,
    domesticViolenceReductionDetails: "",
    sexOffenderTreatment: false,
    sexOffenderTreatmentDetails: "",
    medicalHealthCare: false,
    medicalHealthCareDetails: "",
    other: false,
    otherDetails: "",
  });

  // Function to refresh microcredentials data
  const refreshMicrocredentials = async () => {
    if (!user) return;
    
    const { data: microData } = await supabase
      .from("micro_credentials")
      .select("*")
      .eq("user_id", user.id);
    if (microData && Array.isArray(microData)) {
      // Map Supabase fields to form fields
      const mappedMicrocredentials = microData.map((remote) => ({
        id: remote.id,
        name: remote.name || "",
        org: remote.issuing_organization || "",
        issueDate: remote.issue_date || "",
        expiryDate: remote.expiry_date || "",
        credentialId: remote.credential_id || "",
        credentialUrl: remote.credential_url || "",
        narrative: remote.narrative || "",
        file: null,
        filePreview: remote.file_url || "",
      }));
      microHook.setItems(mappedMicrocredentials);
    } else {
      microHook.setItems([]);
    }
  };

  // Function to refresh mentors data
  const refreshMentors = async () => {
    if (!user) return;
    
    const { data: mentorsData } = await supabase
      .from("mentors")
      .select("*")
      .eq("user_id", user.id);
    if (mentorsData && Array.isArray(mentorsData)) {
      // Map Supabase fields to form fields
      const mappedMentors = mentorsData.map((remote) => ({
        id: remote.id,
        linkedin: remote.linkedin_profile || "",
        name: remote.name || "",
        company: remote.company || "",
        title: remote.title || "",
        email: remote.email || "",
        phone: remote.phone || "",
        website: remote.website || "",
        narrative: remote.narrative || "",
      }));
      mentorHook.setItems(mappedMentors);
    } else {
      mentorHook.setItems([]);
    }
  };

  // Function to refresh employment data
  const refreshEmployment = async () => {
    if (!user) return;
    
    const { data: employmentData } = await supabase
      .from("employment")
      .select("*")
      .eq("user_id", user.id);
    if (employmentData && Array.isArray(employmentData)) {
      // Map Supabase fields to form fields
      const mappedEmployment = employmentData.map((remote) => ({
        id: remote.id,
        state: remote.state || "",
        city: remote.city || "",
        employmentType: remote.employment_type || "",
        title: remote.title || "",
        company: remote.company || "",
        companyUrl: remote.company_url || "",
        startDate: remote.start_date || "",
        endDate: remote.end_date || "",
        currentlyEmployed: remote.currently_employed || false,
        employedWhileIncarcerated: remote.incarcerated || false,
      }));
      employmentHook.setItems(mappedEmployment);
    } else {
      employmentHook.setItems([]);
    }
  };

  // Function to refresh education data
  const refreshEducation = async () => {
    if (!user) return;
    
    const { data: educationData } = await supabase
      .from("education")
      .select("*")
      .eq("user_id", user.id);
    if (educationData && Array.isArray(educationData)) {
      // Map Supabase fields to form fields
      const mappedEducation = educationData.map((remote) => ({
        id: remote.id,
        school: remote.school_name || "",
        location: remote.school_location || "",
        degree: remote.degree || "",
        field: remote.field_of_study || "",
        currentlyEnrolled: remote.currently_enrolled || false,
        startDate: remote.start_date || "",
        endDate: remote.end_date || "",
        grade: remote.grade || "",
        description: remote.description || "",
        file: null,
        filePreview: remote.file_url || "",
      }));
      educationHook.setItems(mappedEducation);
    } else {
      educationHook.setItems([]);
    }
  };

  // Microcredentials state with custom hook
  const microHook = useFormCRUD<Omit<Microcredential, "id">>({
    initialFormState: {
      name: "",
      org: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
      narrative: "",
      file: null,
      filePreview: "",
    },
    validateForm: (form) => {
      return !!(form.name && form.org && form.issueDate);
    },
    tableName: "micro_credentials",
    userId: user?.id,
    toast: (options: { title: string; description: string; variant?: string }) => {
      if (options.variant === "destructive") {
        toast.error(options.description);
      } else {
        toast.success(options.description);
      }
    },
  });

  const [microFileError, setMicroFileError] = useState("");

  // Fetch microcredentials from Supabase when navigating to the microcredentials section
  useEffect(() => {
    async function fetchMicrocredentials() {
      if (!user) return;
      
      const { data: microData } = await supabase
        .from("micro_credentials")
        .select("*")
        .eq("user_id", user.id);
      if (microData && Array.isArray(microData)) {
        // Map Supabase fields to form fields
        const mappedMicrocredentials = microData.map((remote) => ({
          id: remote.id,
          name: remote.name || "",
          org: remote.issuing_organization || "",
          issueDate: remote.issue_date || "",
          expiryDate: remote.expiry_date || "",
          credentialId: remote.credential_id || "",
          credentialUrl: remote.credential_url || "",
          narrative: remote.narrative || "",
          file: null,
          filePreview: remote.file_url || "",
        }));
        
        // Merge with existing local data if any
        const existingIds = microHook.items.map(item => item.id);
        const newItems = mappedMicrocredentials.filter(item => !existingIds.includes(item.id));
        microHook.setItems([...microHook.items, ...newItems]);
      }
    }
    
    if (currentCategory === categories.findIndex(cat => cat === "microcredentials") && user) {
      fetchMicrocredentials();
    }
  }, [currentCategory, user]);

  // Mentors state with custom hook
  const mentorHook = useFormCRUD<Omit<Mentor, "id">>({
    initialFormState: {
      linkedin: "",
      name: "",
      company: "",
      title: "",
      email: "",
      phone: "",
      website: "",
      narrative: "",
    },
    validateForm: (form) => {
      return !!(form.name && form.company && form.title);
    },
    tableName: "mentors",
    userId: user?.id,
    toast: (options: { title: string; description: string; variant?: string }) => {
      if (options.variant === "destructive") {
        toast.error(options.description);
      } else {
        toast.success(options.description);
      }
    },
  });

  // Education state with custom hook
  const educationHook = useFormCRUD<Omit<Education, "id">>({
    initialFormState: {
      school: "",
      location: "",
      degree: "",
      field: "",
      currentlyEnrolled: false,
      startDate: "",
      endDate: "",
      grade: "",
      description: "",
      file: null,
      filePreview: "",
    },
    validateForm: (form) => {
      return !!(
        form.school &&
        form.location &&
        form.degree &&
        form.field &&
        form.startDate
      );
    },
    tableName: "education",
    userId: user?.id,
    toast: (options: { title: string; description: string; variant?: string }) => {
      if (options.variant === "destructive") {
        toast.error(options.description);
      } else {
        toast.success(options.description);
      }
    },
  });

  const [educationFileError, setEducationFileError] = useState("");

  // Employment state with custom hook
  const employmentHook = useFormCRUD<Omit<Employment, "id">>({
    initialFormState: {
      state: "",
      city: "",
      employmentType: "",
      title: "",
      company: "",
      companyUrl: "",
      startDate: "",
      endDate: "",
      currentlyEmployed: false,
      employedWhileIncarcerated: false,
    },
    validateForm: (form) => {
      return !!(
        form.title &&
        form.company &&
        form.employmentType &&
        form.startDate
      );
    },
    tableName: "employment",
    userId: user?.id,
    toast: (options: { title: string; description: string; variant?: string }) => {
      if (options.variant === "destructive") {
        toast.error(options.description);
      } else {
        toast.success(options.description);
      }
    },
  });

  const [hobbiesFileError, setHobbiesFileError] = useState("");

  // Function to refresh hobbies data
  const refreshHobbies = async () => {
    if (!user) return;
    
    const { data: hobbiesData } = await supabase
      .from("hobbies")
      .select("*")
      .eq("user_id", user.id);
    if (hobbiesData && Array.isArray(hobbiesData)) {
      // Map Supabase fields to form fields
      const mappedHobbies = hobbiesData.map((remote) => ({
        id: remote.id,
        general: remote.general_hobby || "",
        sports: remote.sports || "",
        other: remote.other_interests || "",
        narrative: remote.narrative || "",
        file: null,
        filePreview: remote.file_url || "",
      }));
      hobbiesHook.setItems(mappedHobbies);
    } else {
      hobbiesHook.setItems([]);
    }
  };

  // Hobbies state with custom hook
  const hobbiesHook = useFormCRUD<Omit<Hobby, "id">>({
    initialFormState: {
      general: "",
      sports: "",
      other: "",
      narrative: "",
      file: null,
      filePreview: "",
    },
    validateForm: (form) => {
      return !!(form.general || form.sports || form.other);
    },
    tableName: "hobbies",
    userId: user?.id,
    toast: (options: { title: string; description: string; variant?: string }) => {
      if (options.variant === "destructive") {
        toast.error(options.description);
      } else {
        toast.success(options.description);
      }
    },
  });

  // Fetch hobbies from Supabase when navigating to the hobbies section
  useEffect(() => {
    async function fetchHobbies() {
      if (!user) return;
      
      const { data: hobbiesData } = await supabase
        .from("hobbies")
        .select("*")
        .eq("user_id", user.id);
      if (hobbiesData && Array.isArray(hobbiesData)) {
        // Map Supabase fields to form fields
        const mappedHobbies = hobbiesData.map((remote) => ({
          id: remote.id,
          general: remote.general_hobby || "",
          sports: remote.sports || "",
          other: remote.other_interests || "",
          narrative: remote.narrative || "",
          file: null,
          filePreview: remote.file_url || "",
        }));
        
        // Merge with existing local data if any
        const existingIds = hobbiesHook.items.map(item => item.id);
        const newItems = mappedHobbies.filter(item => !existingIds.includes(item.id));
        hobbiesHook.setItems([...hobbiesHook.items, ...newItems]);
      }
    }
    
    if (currentCategory === categories.findIndex(cat => cat === "hobbies") && user) {
      fetchHobbies();
    }
  }, [currentCategory, user]);

  // Fetch mentors from Supabase when navigating to the mentors section
  useEffect(() => {
    async function fetchMentors() {
      if (!user) return;
      
      const { data: mentorsData } = await supabase
        .from("mentors")
        .select("*")
        .eq("user_id", user.id);
      if (mentorsData && Array.isArray(mentorsData)) {
        // Map Supabase fields to form fields
        const mappedMentors = mentorsData.map((remote) => ({
          id: remote.id,
          linkedin: remote.linkedin_profile || "",
          name: remote.name || "",
          company: remote.company || "",
          title: remote.title || "",
          email: remote.email || "",
          phone: remote.phone || "",
          website: remote.website || "",
          narrative: remote.narrative || "",
        }));
        
        // Merge with existing local data if any
        const existingIds = mentorHook.items.map(item => item.id);
        const newItems = mappedMentors.filter(item => !existingIds.includes(item.id));
        mentorHook.setItems([...mentorHook.items, ...newItems]);
      }
    }
    
    if (currentCategory === categories.findIndex(cat => cat === "mentors") && user) {
      fetchMentors();
    }
  }, [currentCategory, user]);

  // Fetch employment from Supabase when navigating to the employment section
  useEffect(() => {
    async function fetchEmployment() {
      if (!user) return;
      
      const { data: employmentData } = await supabase
        .from("employment")
        .select("*")
        .eq("user_id", user.id);
      if (employmentData && Array.isArray(employmentData)) {
        // Map Supabase fields to form fields
        const mappedEmployment = employmentData.map((remote) => ({
          id: remote.id,
          state: remote.state || "",
          city: remote.city || "",
          employmentType: remote.employment_type || "",
          title: remote.title || "",
          company: remote.company || "",
          companyUrl: remote.company_url || "",
          startDate: remote.start_date || "",
          endDate: remote.end_date || "",
          currentlyEmployed: remote.currently_employed || false,
          employedWhileIncarcerated: remote.incarcerated || false,
        }));
        
        // Merge with existing local data if any
        const existingIds = employmentHook.items.map(item => item.id);
        const newItems = mappedEmployment.filter(item => !existingIds.includes(item.id));
        employmentHook.setItems([...employmentHook.items, ...newItems]);
      }
    }
    
    if (currentCategory === categories.findIndex(cat => cat === "employment-history") && user) {
      fetchEmployment();
    }
  }, [currentCategory, user]);

  // Fetch education from Supabase when navigating to the education section
  useEffect(() => {
    async function fetchEducation() {
      if (!user) return;
      
      const { data: educationData } = await supabase
        .from("education")
        .select("*")
        .eq("user_id", user.id);
      if (educationData && Array.isArray(educationData)) {
        // Map Supabase fields to form fields
        const mappedEducation = educationData.map((remote) => ({
          id: remote.id,
          school: remote.school_name || "",
          location: remote.school_location || "",
          degree: remote.degree || "",
          field: remote.field_of_study || "",
          currentlyEnrolled: remote.currently_enrolled || false,
          startDate: remote.start_date || "",
          endDate: remote.end_date || "",
          grade: remote.grade || "",
          description: remote.description || "",
          file: null,
          filePreview: remote.file_url || "",
        }));
        
        // Merge with existing local data if any
        const existingIds = educationHook.items.map(item => item.id);
        const newItems = mappedEducation.filter(item => !existingIds.includes(item.id));
        educationHook.setItems([...educationHook.items, ...newItems]);
      }
    }
    
    if (currentCategory === categories.findIndex(cat => cat === "education") && user) {
      fetchEducation();
    }
  }, [currentCategory, user]);

  // Function to refresh rehab programs data
  const refreshRehabPrograms = async () => {
    console.log("🔄 refreshRehabPrograms called");
    
    if (!user) {
      console.log("❌ No user, skipping refresh");
      return;
    }
    
    console.log("📥 Fetching from Supabase...");
    const { data: rehabData } = await supabase
      .from("rehab_programs")
      .select("*")
      .eq("user_id", user.id);
      
    console.log("📥 Fetched data:", rehabData);
    
    if (rehabData && Array.isArray(rehabData)) {
      // Map Supabase fields to form fields
      const mappedRehabPrograms = rehabData.map((remote) => ({
        id: remote.id,
        program: remote.program || "",
        programType: remote.program_type || "",
        startDate: remote.start_date || "",
        endDate: remote.end_date || "",
        details: remote.details || "",
        narrative: remote.narrative || "",
        file: null,
        filePreview: remote.file_url || "",
      }));
      
      console.log("🗂️ Mapped programs:", mappedRehabPrograms);
      rehabHook.setItems(mappedRehabPrograms);
      console.log("✅ Items set, current count:", mappedRehabPrograms.length);
    } else {
      console.log("📭 No data found, clearing items");
      rehabHook.setItems([]);
    }
    
    // Signal that data has been updated for cross-page synchronization
    localStorage.setItem('restorative-record-updated', Date.now().toString());
    console.log("🔄 Refresh complete");
  };

  // Rehab programs state with custom hook
  const rehabHook = useFormCRUD<Omit<RehabProgram, "id">>({
    initialFormState: {
      program: "",
      programType: "",
      startDate: "",
      endDate: "",
      details: "",
      narrative: "",
      file: null,
      filePreview: "",
    },
    validateForm: (form) => {
      return !!(form.program && form.programType);
    },
    tableName: "rehab_programs",
    userId: user?.id,
    toast: (options: { title: string; description: string; variant?: string }) => {
      if (options.variant === "destructive") {
        toast.error(options.description);
      } else {
        toast.success(options.description);
      }
    },
  });

  const [rehabFileError, setRehabFileError] = useState("");

  // Fetch rehab programs on mount when user is available
  useEffect(() => {
    async function fetchRehabProgramsOnMount() {
      if (!user) return;
      
      const { data: rehabData } = await supabase
        .from("rehab_programs")
        .select("*")
        .eq("user_id", user.id);
      if (rehabData && Array.isArray(rehabData)) {
        // Map Supabase fields to form fields
        const mappedRehabPrograms = rehabData.map((remote) => ({
          id: remote.id,
          program: remote.program || "",
          programType: remote.program_type || "",
          startDate: remote.start_date || "",
          endDate: remote.end_date || "",
          details: remote.details || "",
          narrative: remote.narrative || "",
          file: null,
          filePreview: remote.file_url || "",
        }));
        
        // Get current local items
        const currentItems = rehabHook.items || [];
        
        // Find unsaved local items (those without an ID that exists in Supabase)
        const savedIds = new Set(mappedRehabPrograms.map(item => item.id));
        const unsavedLocalItems = currentItems.filter(item => !savedIds.has(item.id));
        
        // Merge saved data from Supabase with unsaved local items
        const mergedItems = [
          ...mappedRehabPrograms, // All saved items from Supabase
          ...unsavedLocalItems    // Any unsaved local items
        ];
        
        rehabHook.setItems(mergedItems);
      }
    }
    
    fetchRehabProgramsOnMount();
  }, [user]);

  // Fetch rehab programs from Supabase when navigating to the rehab programs section
  useEffect(() => {
    async function fetchRehabPrograms() {
      if (!user) return;
      
      const { data: rehabData } = await supabase
        .from("rehab_programs")
        .select("*")
        .eq("user_id", user.id);
      if (rehabData && Array.isArray(rehabData)) {
        // Map Supabase fields to form fields
        const mappedRehabPrograms = rehabData.map((remote) => ({
          id: remote.id,
          program: remote.program || "",
          programType: remote.program_type || "",
          startDate: remote.start_date || "",
          endDate: remote.end_date || "",
          details: remote.details || "",
          narrative: remote.narrative || "",
          file: null,
          filePreview: remote.file_url || "",
        }));
        
        // Get current local items
        const currentItems = rehabHook.items || [];
        
        // Find unsaved local items (those without an ID that exists in Supabase)
        const savedIds = new Set(mappedRehabPrograms.map(item => item.id));
        const unsavedLocalItems = currentItems.filter(item => !savedIds.has(item.id));
        
        // Merge saved data from Supabase with unsaved local items
        const mergedItems = [
          ...mappedRehabPrograms, // All saved items from Supabase
          ...unsavedLocalItems    // Any unsaved local items
        ];
        
        rehabHook.setItems(mergedItems);
      } else {
        // If no data in Supabase, keep any local unsaved items
        const currentItems = rehabHook.items || [];
        rehabHook.setItems(currentItems);
      }
    }
    
    if (currentCategory === categories.findIndex(cat => cat === "rehabilitative-programs") && user) {
      fetchRehabPrograms();
    }

    // Also refetch when page gains focus (e.g., returning from profile page)
    const handleFocus = () => {
      if (currentCategory === categories.findIndex(cat => cat === "rehabilitative-programs") && user) {
        fetchRehabPrograms();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentCategory, user]);

  // Navigation
  const handleNext = async () => {
    if (currentCategory < categories.length - 1) {
      await handleSaveToSupabase();
      setCurrentCategory((c) => c + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCategory > 0) setCurrentCategory((c) => c - 1);
  };

  // Form Submission
  const handleSubmit = async () => {
    await handleSaveToSupabase();

    // Mark the restorative record as completed in user_profiles
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          rr_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error marking record as completed:", error);
        toast.error("Failed to complete the restorative record");
        return;
      }
    }

    toast.success("Restorative Record submitted successfully!");

    // Redirect to the profile page
    router.push("/restorative-record/profile");
  };

  // Handlers for file uploads
  const handleAwardFileChange = (file: File | null) => {
    if (file) {
      awardsHook.updateForm({
        file,
        filePreview: createFilePreview(file),
      });
    }
  };

  const handleSkillsFileChange = (file: File | null) => {
    if (file) {
      skillsHook.updateForm({
        file,
        filePreview: createFilePreview(file),
      });
    }
  };

  const handleEngagementFileChange = (file: File | null) => {
    if (file) {
      engagementHook.updateForm({
        file,
        filePreview: createFilePreview(file),
      });
    }
  };

  const handleMicroFileChange = (file: File | null) => {
    if (file) {
      microHook.updateForm({
        file,
        filePreview: createFilePreview(file),
      });
    }
  };

  const handleEducationFileChange = (file: File | null) => {
    if (file) {
      educationHook.updateForm({
        file,
        filePreview: createFilePreview(file),
      });
    }
  };

  const handleHobbiesFileChange = (file: File | null) => {
    if (file) {
      hobbiesHook.updateForm({
        file,
        filePreview: createFilePreview(file),
      });
    }
  };

  const handleRehabFileChange = (file: File | null) => {
    if (file) {
      rehabHook.updateForm({
        file,
        filePreview: createFilePreview(file),
      });
    }
  };

  // Rehab programs handlers
  const handleRehabCheckbox = (key: RehabProgramKey) => {
    setRehabPrograms((prev) => ({
      ...prev,
      [key]: !prev[key],
      [`${key}Details`]: !prev[key]
        ? prev[`${key}Details` as RehabProgramDetailsKey]
        : "",
    }));
  };

  const handleRehabDetailsChange = (key: RehabProgramKey, value: string) => {
    setRehabPrograms((prev) => ({
      ...prev,
      [`${key}Details`]: value.slice(0, 500),
    }));
  };

  // Save rehab programs specifically to Supabase
  const saveRehabProgramsToSupabase = async (formData: RehabProgram & { id: string }, isEdit: boolean) => {
    console.log("🚀 saveRehabProgramsToSupabase called with:", { formData, isEdit });
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ No user found");
      return;
    }

    console.log("👤 User ID:", user.id);

    // Create a toast wrapper that matches the expected format
    const toastWrapper = (options: {
      title: string;
      description: string;
      variant?: string;
    }) => {
      if (options.variant === "destructive") {
        toast.error(options.description);
      } else {
        toast.success(options.description);
      }
    };

    try {
      // Import upload function
      const { uploadFileToSupabase } = await import("./utils");
      
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      // Upload file if it exists
      if (formData.file) {
        console.log("📎 Uploading file...", formData.file.name);
        const fileData = await uploadFileToSupabase(
          "rehab-program-files",
          user.id,
          formData.id,
          formData.file
        );
        if (fileData) {
          fileUrl = fileData.url;
          fileName = fileData.fileName;
          fileSize = fileData.fileSize;
          console.log("✅ File uploaded:", fileUrl);
        } else {
          console.error("❌ File upload failed");
          toastWrapper({
            title: "Error",
            description: "Failed to upload rehab program file",
            variant: "destructive",
          });
          return;
        }
      }

      // Save rehab program data
      console.log("💾 Saving to database...");
      const dataToSave = {
        user_id: user.id,
        id: formData.id,
        program: formData.program,
        program_type: formData.programType,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        details: formData.details || null,
        narrative: formData.narrative || null,
        file_url: fileUrl || formData.filePreview || null,
        file_name: fileName,
        file_size: fileSize,
      };
      
      console.log("💾 Data to save:", dataToSave);
      
      const { error: rehabProgramError } = await supabase
        .from("rehab_programs")
        .upsert(dataToSave);

      if (rehabProgramError) {
        console.error("❌ Database save error:", rehabProgramError);
        toastWrapper({
          title: "Error",
          description: "Failed to save rehab program",
          variant: "destructive",
        });
        throw rehabProgramError;
      } else {
        console.log("✅ Database save successful");
        toastWrapper({
          title: "Success",
          description: `Rehab program ${isEdit ? 'updated' : 'saved'} successfully`,
        });
      }
    } catch (error) {
      console.error("❌ Error in saveRehabProgramsToSupabase:", error);
      throw error;
    }
  };

  // Save to Supabase
  const handleSaveToSupabase = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Create a toast wrapper that matches the expected format
    const toastWrapper = (options: {
      title: string;
      description: string;
      variant?: string;
    }) => {
      if (options.variant === "destructive") {
        toast.error(options.description);
      } else {
        toast.success(options.description);
      }
    };

    await saveToSupabase({
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
      toast: toastWrapper,
    });
  };

  // Fetch introduction from Supabase on mount and when navigating to the Introduction section
  useEffect(() => {
    async function fetchIntroduction() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("introduction")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setFormData({
          facebookUrl: data.facebook_url || "",
          linkedinUrl: data.linkedin_url || "",
          redditUrl: data.reddit_url || "",
          digitalPortfolioUrl: data.digital_portfolio_url || "",
          instagramUrl: data.instagram_url || "",
          githubUrl: data.github_url || "",
          tiktokUrl: data.tiktok_url || "",
          pinterestUrl: data.pinterest_url || "",
          twitterUrl: data.twitter_url || "",
          personalWebsiteUrl: data.personal_website_url || "",
          handshakeUrl: data.handshake_url || "",
          preferredOccupation: data.preferred_occupation || "",
          personalNarrative: data.personal_narrative || "",
          languageProficiency: data.language_proficiency || "No Proficiency",
          otherLanguages: data.other_languages || [],
        });
      } else {
        setFormData({
          facebookUrl: "",
          linkedinUrl: "",
          redditUrl: "",
          digitalPortfolioUrl: "",
          instagramUrl: "",
          githubUrl: "",
          tiktokUrl: "",
          pinterestUrl: "",
          twitterUrl: "",
          personalWebsiteUrl: "",
          handshakeUrl: "",
          preferredOccupation: "",
          personalNarrative: "",
          languageProficiency: "No Proficiency",
          otherLanguages: [],
        });
      }
    }
    if (categories[currentCategory] === "introduction") {
      fetchIntroduction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory]);

  // Render current section
  const renderSection = () => {
    switch (categories[currentCategory]) {
      case "introduction":
        return (
          <IntroductionSection
            formData={formData}
            onChange={(updates) =>
              setFormData((prev) => ({ ...prev, ...updates }))
            }
            onDelete={handleDeleteIntroduction}
          />
        );

      case "personal-achievements":
        return (
          <PersonalAchievementsSection
            awardsHook={awardsHook}
            handleAwardFileChange={handleAwardFileChange}
            awardFileError={awardFileError}
            setAwardFileError={setAwardFileError}
          />
        );

      case "skills":
        return (
          <SkillsSection
            skillsHook={skillsHook}
            handleSkillsFileChange={handleSkillsFileChange}
            skillsFileError={skillsFileError}
            setSkillsFileError={setSkillsFileError}
          />
        );

      case "community-engagement":
        return (
          <CommunityEngagementSection
            engagementHook={engagementHook}
            handleEngagementFileChange={handleEngagementFileChange}
            engagementFileError={engagementFileError}
            setEngagementFileError={setEngagementFileError}
            onChange={handleSaveToSupabase}
          />
        );

      case "rehabilitative-programs":
        return (
          <RehabilitativeProgramsSection
            rehabHook={rehabHook}
            handleRehabFileChange={handleRehabFileChange}
            rehabFileError={rehabFileError}
            setRehabFileError={setRehabFileError}
            onSave={saveRehabProgramsToSupabase}
            onChange={refreshRehabPrograms}
          />
        );

      case "microcredentials":
        return (
          <MicrocredentialsSection
            microHook={microHook}
            handleMicroFileChange={handleMicroFileChange}
            microFileError={microFileError}
            setMicroFileError={setMicroFileError}
            onChange={handleSaveToSupabase}
          />
        );

      case "mentors":
        return <MentorsSection mentorHook={mentorHook} onChange={handleSaveToSupabase} />;

      case "education":
        return (
          <EducationSection
            educationHook={educationHook}
            handleEducationFileChange={handleEducationFileChange}
            educationFileError={educationFileError}
            setEducationFileError={setEducationFileError}
            onChange={handleSaveToSupabase}
          />
        );

      case "employment-history":
        return <EmploymentHistorySection employmentHook={employmentHook} onChange={handleSaveToSupabase} />;

      case "hobbies":
        return (
          <HobbiesSection
            hobbiesHook={hobbiesHook}
            handleHobbiesFileChange={handleHobbiesFileChange}
            hobbiesFileError={hobbiesFileError}
            setHobbiesFileError={setHobbiesFileError}
            onChange={handleSaveToSupabase}
          />
        );

      default:
        return (
          <div className="p-4 bg-white rounded shadow">
            Section coming soon...
          </div>
        );
    }
  };

  useEffect(() => {
    async function fetchRecord() {
      // Only fetch if we're not on the introduction page
      if (currentCategory === 0) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("introduction")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setFormData((prev: any) => ({
          ...prev,
          ...data,
          introduction: data.personal_narrative || "",
          narrative: data.personal_narrative || "",
          linkedin: data.linkedin_url || "",
          github: data.github_url || "",
          twitter: data.twitter_url || "",
          portfolio: data.digital_portfolio_url || "",
          preferred_occupation: data.preferred_occupation || "",
          language: data.language_proficiency || "",
          additional_languages: data.other_languages || [],
        }));
      }
    }
    fetchRecord();
  }, [currentCategory]);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section) {
      const idx = categories.findIndex(
        (cat) => cat.replace(/_/g, "-") === section || cat === section
      );
      if (idx !== -1) setCurrentCategory(idx);
    }
    // eslint-disable-next-line
  }, []);

  const handleViewProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Check if the restorative record is completed in user_profiles
    const { data, error } = await supabase
      .from("user_profiles")
      .select("rr_completed")
      .eq("id", user.id)
      .single();

    if (error || !data || !data.rr_completed) {
      setShowIncompleteModal(true);
    } else {
      router.push("/restorative-record/profile");
    }
  };

  const handleDeleteIntroduction = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("introduction").delete().eq("user_id", user.id);
    setFormData({
      facebookUrl: "",
      linkedinUrl: "",
      redditUrl: "",
      digitalPortfolioUrl: "",
      instagramUrl: "",
      githubUrl: "",
      tiktokUrl: "",
      pinterestUrl: "",
      twitterUrl: "",
      personalWebsiteUrl: "",
      handshakeUrl: "",
      preferredOccupation: "",
      personalNarrative: "",
      languageProficiency: "No Proficiency",
      otherLanguages: [],
    });
    toast.success("Introduction deleted.");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <h2 className="text-lg font-semibold text-black mb-4">Navigation</h2>
          <ul className="space-y-1">
            {categories.map((cat, idx) => (
              <li key={cat}>
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    idx === currentCategory
                      ? "bg-red-50 text-primary font-medium border border-primary"
                      : "text-secondary hover:bg-gray-50 hover:text-black"
                  }`}
                  onClick={() => setCurrentCategory(idx)}
                >
                  {cat
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-semibold text-black">
                Restorative Record Builder
              </h1>
              <button
                onClick={handleViewProfile}
                className="px-5 py-2 bg-primary text-white rounded-lg font-medium shadow hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ml-4"
              >
                MY RESTORATIVE RECORD
              </button>
            </div>
            <div className="mb-8">{renderSection()}</div>
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentCategory === 0}
                className="px-6 py-3 bg-gray-200 text-secondary rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {currentCategory === categories.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Incomplete Record Modal */}
      {showIncompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-3">
              Complete Your Restorative Record
            </h3>
            <p className="text-gray-600 mb-6">
              Please complete the Restorative Record to use this feature. You
              must go through all sections and submit your record before viewing
              your profile.
            </p>
            <button
              onClick={() => setShowIncompleteModal(false)}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Continue Building Your Restorative Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
