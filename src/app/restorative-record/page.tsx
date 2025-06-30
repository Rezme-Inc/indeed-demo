"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import "react-day-picker/dist/style.css";
import { toast } from "react-hot-toast";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { UserDashboardContent } from "../user/dashboard/page"

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

// Notification interface
interface Notification {
  id: string;
  type: 'connection' | 'request' | 'update';
  title: string;
  message: string;
  timestamp: string;
  adminId: string;
  admin: any;
}

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

function RestorativeRecordBuilderForm() {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder'>('dashboard');
  const [activeDashboardSection, setActiveDashboardSection] = useState('progress');
  const [expandedHRAdmins, setExpandedHRAdmins] = useState<{[key: string]: boolean}>({});
  const [expandedStatusUpdates, setExpandedStatusUpdates] = useState<{[key: string]: boolean}>({});
  const [expandedTimeline, setExpandedTimeline] = useState<{[key: string]: boolean}>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [connectedHRAdmins, setConnectedHRAdmins] = useState<any[]>([]);
  const [allHRAdmins, setAllHRAdmins] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [processingPermission, setProcessingPermission] = useState<string | null>(null);
  const [expandedSummaryView, setExpandedSummaryView] = useState<'connected' | 'pending' | null>(null);
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
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [tutorialDismissedByOverlay, setTutorialDismissedByOverlay] = useState(false);
  const originalDashboardSection = useRef<string | null>(null);
  const originalView = useRef<'dashboard' | 'builder' | null>(null);
  const originalBuilderSection = useRef<number | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalForm, setLegalForm] = useState({
    name: "",
    email: "",
    question: "",
    employers: "",
  });
  const [legalSubmitted, setLegalSubmitted] = useState(false);

  const tutorialSteps = [
    {
      targetId: "progress",
      title: "Progress Tracking",
      description: "See your overall progress as you build your restorative record.",
      dashboardSection: 'progress',
    },
    {
      targetId: "continue-building-btn",
      title: "Continue Building",
      description: "Continue building your restorative record.",
      dashboardSection: 'progress',
    },
    {
      targetId: "preview-record-btn",
      title: "Preview Record",
      description: "Preview what your restorative record will look like.",
      dashboardSection: 'progress',
    },
    {
      targetId: "check-status-btn",
      title: "Status Updates",
      description: "Check who can see your restorative record and where you're at in the hiring process.",
      dashboardSection: 'progress',
    },
    {
      targetId: "status",
      title: "Status Updates",
      description: "Also moves you to the Status Updates page.",
      dashboardSection: 'status',
    },
    {
      targetId: "notifications",
      title: "Notifications",
      description: "View important notifications and HR admin access requests.",
      dashboardSection: 'notifications',
    },
    {
      targetId: "my-restorative-record-btn",
      title: "My Restorative Record",
      description: "Preview your completed restorative record at any time.",
      dashboardSection: null,
    },
  ];

  function TutorialTooltip({ step, onNext, onBack, onClose, showBack, isLastStep }: { step: any; onNext: () => void; onBack: () => void; onClose: () => void; showBack: boolean; isLastStep: boolean }) {
    const ref = useRef<HTMLDivElement>(null);

    // Helper to position the tooltip
    const positionTooltip = () => {
      const target = document.getElementById(step.targetId);
      if (target && ref.current) {
        const rect = target.getBoundingClientRect();
        ref.current.style.position = "fixed";
        // Try to position below, fallback to above if not enough space
        const tooltipHeight = ref.current.offsetHeight || 180;
        const top = rect.bottom + 12 + tooltipHeight < window.innerHeight
          ? rect.bottom + 12
          : Math.max(rect.top - tooltipHeight - 12, 12);
        ref.current.style.top = `${top}px`;
        ref.current.style.left = `${rect.left}px`;
        ref.current.style.zIndex = "9999";
        ref.current.style.maxWidth = "320px";
      }
    };

    useEffect(() => {
      positionTooltip();
      window.addEventListener('scroll', positionTooltip, true);
      window.addEventListener('resize', positionTooltip);
      return () => {
        window.removeEventListener('scroll', positionTooltip, true);
        window.removeEventListener('resize', positionTooltip);
      };
    }, [step.targetId]);

    return (
      <div ref={ref} className="bg-white border-2 border-red-400 shadow-xl rounded-xl p-4 max-w-xs animate-fade-in">
        <h4 className="font-bold mb-2 text-black">{step.title}</h4>
        <p className="mb-4 text-gray-700">{step.description}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-2 py-1 rounded bg-gray-200">Close</button>
          {showBack && (
            <button onClick={onBack} className="text-sm px-2 py-1 rounded bg-gray-200">Back</button>
          )}
          <button onClick={onNext} className="text-sm px-2 py-1 rounded bg-red-500 text-white">
            {isLastStep ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  // Award state with custom hook
  const awardsHook = useFormCRUD<Omit<Award, "id">>({
    initialFormState: {
      type: "",
      name: "",
      organization: "",
      date: "",
      file: null,
      filePreview: "",
      fileName: undefined,
      fileSize: undefined,
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
          fileName: remote.file_name || undefined,
          fileSize: remote.file_size || undefined,
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
      fileName: undefined,
      fileSize: undefined,
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
          fileName: remote.file_name || undefined,
          fileSize: remote.file_size || undefined,
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

  // Fetch connected HR admins
  const fetchConnectedHRAdmins = async () => {
    if (!user) return;

    try {
      // Get HR admin permissions
      const { data: permissions, error: permError } = await supabase
        .from("user_hr_permissions")
        .select("hr_admin_id, granted_at")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (permError) throw permError;

      if (!permissions || permissions.length === 0) {
        setConnectedHRAdmins([]);
        return;
      }

      // Get HR admin profiles
      const hrAdminIds = permissions.map(p => p.hr_admin_id);
      const { data: hrProfiles, error: profileError } = await supabase
        .from("hr_admin_profiles")
        .select("id, first_name, last_name, company, email")
        .in("id", hrAdminIds);

      if (profileError) throw profileError;

      // Combine permission and profile data
      const connectedAdmins = hrProfiles?.map(profile => {
        const permission = permissions.find(p => p.hr_admin_id === profile.id);
        const currentStep = getCurrentAssessmentStep(user.id);
        const stepName = getCurrentStepName(user.id);
        const progress = getProgressPercentage(user.id);
        const status = getAssessmentStatus(user.id);

        return {
          ...profile,
          granted_at: permission?.granted_at,
          // Real assessment data from localStorage tracking
          currentStep: currentStep + 1, // Display as 1-based for UI
          totalSteps: 5,
          stepName: stepName,
          status: status,
          progress: progress
        };
      }) || [];

      setConnectedHRAdmins(connectedAdmins);
    } catch (error) {
      console.error("Error fetching connected HR admins:", error);
    }
  };

  // Fetch connected HR admins when user is available
  useEffect(() => {
    if (user) {
      fetchConnectedHRAdmins();
    }
  }, [user]);

  // Refresh assessment data when viewing status section
  useEffect(() => {
    if (user && currentView === 'dashboard' && activeDashboardSection === 'status') {
      fetchConnectedHRAdmins();
    }
  }, [user, currentView, activeDashboardSection]);

  // Fetch all HR admins for notifications
  const fetchAllHRAdmins = async () => {
    if (!user) return;

    try {
      const { data: hrProfiles, error: profileError } = await supabase
        .from("hr_admin_profiles")
        .select("id, first_name, last_name, company, email, created_at");

      if (profileError) throw profileError;

      // Get current user permissions
      const { data: permissions, error: permError } = await supabase
        .from("user_hr_permissions")
        .select("hr_admin_id, granted_at, is_active")
        .eq("user_id", user.id);

      if (permError) throw permError;

      // Combine HR admin data with permission status
      const allAdmins = hrProfiles?.map(profile => {
        const permission = permissions?.find(p => p.hr_admin_id === profile.id);
        return {
          ...profile,
          hasAccess: permission?.is_active || false,
          granted_at: permission?.granted_at
        };
      }) || [];

      setAllHRAdmins(allAdmins);
      generateNotifications(allAdmins);
    } catch (error) {
      console.error("Error fetching all HR admins:", error);
    }
  };

  // Generate notifications based on HR admin data
  const generateNotifications = (admins: any[]) => {
    const notifs: Notification[] = [];

    // Recent new connections
    const recentConnections = admins.filter(admin =>
      admin.hasAccess && admin.granted_at &&
      new Date(admin.granted_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days
    );

    recentConnections.forEach(admin => {
      notifs.push({
        id: `connection-${admin.id}`,
        type: 'connection',
        title: 'HR Admin Access Granted',
        message: `${admin.first_name} ${admin.last_name} (${admin.company}) now has access to your Restorative Record.`,
        timestamp: admin.granted_at,
        adminId: admin.id,
        admin: admin
      });
    });

    // Potential requests (HR admins without access - simulate pending requests)
    const potentialRequests = admins.filter(admin => !admin.hasAccess);

    // Show a few as "simulated requests" for demo purposes
    potentialRequests.slice(0, 2).forEach(admin => {
      notifs.push({
        id: `request-${admin.id}`,
        type: 'request',
        title: 'HR Admin Access Request',
        message: `${admin.first_name} ${admin.last_name} from ${admin.company} would like access to your Restorative Record.`,
        timestamp: new Date().toISOString(),
        adminId: admin.id,
        admin: admin
      });
    });

    // Sort by timestamp (newest first)
    notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setNotifications(notifs);
  };

  // Handle granting/revoking HR admin access
  const handleHRAdminPermission = async (adminId: string, grant: boolean) => {
    if (!user) return;

    setProcessingPermission(adminId);

    try {
      if (grant) {
        // Check if permission already exists
        const { data: existing } = await supabase
          .from("user_hr_permissions")
          .select("*")
          .eq("user_id", user.id)
          .eq("hr_admin_id", adminId)
          .single();

        if (existing) {
          // Update existing permission
          const { error } = await supabase
            .from("user_hr_permissions")
            .update({
              is_active: true,
              revoked_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id)
            .eq("hr_admin_id", adminId);

          if (error) throw error;
        } else {
          // Insert new permission
          const { error } = await supabase.from("user_hr_permissions").insert({
            user_id: user.id,
            hr_admin_id: adminId,
            is_active: true,
          });

          if (error) throw error;
        }
      } else {
        // Revoke permission
        const { error } = await supabase
          .from("user_hr_permissions")
          .update({
            is_active: false,
            revoked_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("hr_admin_id", adminId);

        if (error) throw error;
      }

      // Refresh data
      await Promise.all([fetchConnectedHRAdmins(), fetchAllHRAdmins()]);

    } catch (error) {
      console.error("Error updating HR admin permission:", error);
      alert("Failed to update HR admin permission. Please try again.");
    } finally {
      setProcessingPermission(null);
    }
  };

  // Fetch all HR admins when user is available and viewing notifications
  useEffect(() => {
    if (user && currentView === 'dashboard' && activeDashboardSection === 'notifications') {
      fetchAllHRAdmins();
    }
  }, [user, currentView, activeDashboardSection]);

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
        fileName: remote.file_name || undefined,
        fileSize: remote.file_size || undefined,
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
      fileName: undefined,
      fileSize: undefined,
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
          fileName: remote.file_name || undefined,
          fileSize: remote.file_size || undefined,
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
        fileName: remote.file_name || undefined,
        fileSize: remote.file_size || undefined,
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
        fileName: remote.file_name || undefined,
        fileSize: remote.file_size || undefined,
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
      fileName: undefined,
      fileSize: undefined,
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
          fileName: remote.file_name || undefined,
          fileSize: remote.file_size || undefined,
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
      fileName: undefined,
      fileSize: undefined,
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
        fileName: remote.file_name || undefined,
        fileSize: remote.file_size || undefined,
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
      fileName: undefined,
      fileSize: undefined,
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
          fileName: remote.file_name || undefined,
          fileSize: remote.file_size || undefined,
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
          fileName: remote.file_name || undefined,
          fileSize: remote.file_size || undefined,
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

  const recordHookMap = {
    "introduction": formData,
    "personal-achievements": awardsHook,
    "skills": skillsHook,
    "community-engagement": engagementHook,
    "rehabilitative-programs": rehabHook,
    "microcredentials": microHook,
    "mentors": mentorHook,
    "education": educationHook,
    "employment-history": employmentHook,
    "hobbies": hobbiesHook,
  };

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
    console.log("🏆 Award file change:", file ? file.name : "null");
    if (file) {
      awardsHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
      console.log("🏆 Award form updated with file:", {
        fileName: file.name,
        fileSize: file.size,
        preview: createFilePreview(file).substring(0, 50) + "..."
      });
    } else {
      awardsHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
      console.log("🏆 Award file cleared");
    }
  };

  const handleSkillsFileChange = (file: File | null) => {
    console.log("💪 Skills file change:", file ? file.name : "null");
    if (file) {
      skillsHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
      console.log("💪 Skills form updated with file:", {
        fileName: file.name,
        fileSize: file.size
      });
    } else {
      skillsHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
      console.log("💪 Skills file cleared");
    }
  };

  const handleEngagementFileChange = (file: File | null) => {
    console.log("🤝 Engagement file change:", file ? file.name : "null");
    if (file) {
      engagementHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
      console.log("🤝 Engagement form updated with file:", {
        fileName: file.name,
        fileSize: file.size
      });
    } else {
      engagementHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
      console.log("🤝 Engagement file cleared");
    }
  };

  const handleMicroFileChange = (file: File | null) => {
    console.log("🎓 Microcredential file change:", file ? file.name : "null");
    if (file) {
      microHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
      console.log("🎓 Microcredential form updated with file:", {
        fileName: file.name,
        fileSize: file.size
      });
    } else {
      microHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
      console.log("🎓 Microcredential file cleared");
    }
  };

  const handleEducationFileChange = (file: File | null) => {
    console.log("📚 Education file change:", file ? file.name : "null");
    if (file) {
      educationHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
      console.log("📚 Education form updated with file:", {
        fileName: file.name,
        fileSize: file.size
      });
    } else {
      educationHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
      console.log("📚 Education file cleared");
    }
  };

  const handleHobbiesFileChange = (file: File | null) => {
    console.log("🎨 Hobbies file change:", file ? file.name : "null");
    if (file) {
      hobbiesHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
      console.log("🎨 Hobbies form updated with file:", {
        fileName: file.name,
        fileSize: file.size
      });
    } else {
      hobbiesHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
      console.log("🎨 Hobbies file cleared");
    }
  };

  const handleRehabFileChange = (file: File | null) => {
    console.log("🔄 Rehab file change:", file ? file.name : "null");
    if (file) {
      rehabHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
      console.log("🔄 Rehab form updated with file:", {
        fileName: file.name,
        fileSize: file.size
      });
    } else {
      rehabHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
      console.log("🔄 Rehab file cleared");
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
  const handleSaveToSupabase = async (introductionOverride?: Introduction) => {
    console.log("💾 handleSaveToSupabase called");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log("❌ No user found for save");
      return;
    }

    console.log("👤 User ID for save:", user.id);

    // Log current form states to see if files are present
    console.log("🏆 Awards items with files:", awardsHook.items.map(item => ({
      id: item.id,
      name: item.name,
      hasFile: !!item.file,
      fileName: item.fileName,
      fileSize: item.fileSize
    })));
    
    console.log("💪 Skills items with files:", skillsHook.items.map(item => ({
      id: item.id,
      hasFile: !!item.file,
      fileName: item.fileName,
      fileSize: item.fileSize
    })));
    
    console.log("🤝 Engagement items with files:", engagementHook.items.map(item => ({
      id: item.id,
      role: item.role,
      hasFile: !!item.file,
      fileName: item.fileName,
      fileSize: item.fileSize
    })));

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

    console.log("🚀 Calling saveToSupabase...");
    
    await saveToSupabase({
      user,
      formData: introductionOverride || formData,
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
    
    console.log("✅ saveToSupabase completed");
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
            onChange={(updates) => {
              if (updates === null) {
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
              } else {
                setFormData((prev) => ({ ...prev, ...updates }));
              }
            }}
            onDelete={handleDeleteIntroduction}
            onSaveToSupabase={async (newIntroduction) => {
              setFormData(newIntroduction);
              await handleSaveToSupabase(newIntroduction);
            }}
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

  // Dashboard functions
  const dashboardSections = [
    { id: 'progress', label: 'Progress Tracking', icon: <img src={currentView === 'dashboard' && activeDashboardSection === 'progress' ? "dashboard_icons/progress-white.svg" : "dashboard_icons/progress.svg"} alt="Status Updates" className="w-5 h-5" />},
    { id: 'status', label: 'Status Updates', icon: <img src={currentView === 'dashboard' && activeDashboardSection === 'status' ? "dashboard_icons/status-updates-white.svg" : "dashboard_icons/status-updates.svg"} alt="Status Updates" className="w-5 h-5" />},
    { id: 'notifications', label: 'Notifications', icon: <img src={currentView === 'dashboard' && activeDashboardSection === 'notifications' ? "dashboard_icons/notifications-white.svg" : "dashboard_icons/notifications.svg"} alt="Notifications" className="w-5 h-5" />},
    { id: 'legal-resources', label: 'Legal Resources', icon: <img src={currentView === 'dashboard' && activeDashboardSection === 'legal-resources' ? "dashboard_icons/legal-resources-white.svg" : "dashboard_icons/legal-resources.svg"} alt="Legal Resources" className="w-5 h-5" />, alt: "Legal Resources" },
    { id: 'settings', label: 'Settings', icon: <img src={currentView === 'dashboard' && activeDashboardSection === 'settings' ? "dashboard_icons/settings-white.svg" : "dashboard_icons/settings.svg"} alt="Settings" className="w-5 h-5" />, alt: "Settings" }
  ];

  const handleDashboardNavigation = (section: string) => {
    setCurrentView('dashboard');
    setActiveDashboardSection(section);
  };

  const handleBuilderNavigation = (categoryIndex: number) => {
    setCurrentView('builder');
    setCurrentCategory(categoryIndex);
  };

  const toggleHRAdminDetails = (adminId: string) => {
    setExpandedHRAdmins(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  const toggleStatusUpdates = (adminId: string) => {
    setExpandedStatusUpdates(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  const toggleTimeline = (adminId: string) => {
    setExpandedTimeline(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  // Tooltip data for assessment steps
  const stepTooltips = {
    'step1': {
      title: 'Conditional Job Offer',
      content: 'You have received a conditional job offer. This means the employer is interested in hiring you, pending the completion of an individualized assessment based on your criminal history record. You have the right to provide additional context through your Restorative Record.',
      rights: ['Right to provide additional context', 'Right to challenge inaccurate information', 'Right to legal representation']
    },
    'step2': {
      title: 'Individual Assessment',
      content: 'The employer is conducting an individualized assessment of your background in relation to the specific job duties. This assessment must consider factors like the nature of the conviction, time elapsed, and job relevance. You have 5 business days to update your record or provide additional information.',
      rights: ['Right to provide additional evidence', 'Right to explain circumstances', 'Right to appeal the decision', 'Right to request additional time']
    },
    'step3': {
      title: 'Preliminary Revocation Notice',
      content: 'If the employer is considering withdrawing the job offer, they must provide a preliminary notice explaining their reasoning. You will have an opportunity to respond and provide additional information before any final decision is made.',
      rights: ['Right to written explanation', 'Right to respond within 5 business days', 'Right to provide counter-evidence', 'Right to request a meeting']
    },
    'step4': {
      title: 'Reassessment Period',
      content: 'After receiving your response to the preliminary notice, the employer must conduct a reassessment. They must consider any new information you provided and give you a reasonable opportunity to demonstrate rehabilitation or that the conviction is not relevant to the job.',
      rights: ['Right to fair reassessment', 'Right to have new evidence considered', 'Right to demonstrate rehabilitation', 'Right to appeal the process']
    },
    'step5': {
      title: 'Final Decision',
      content: 'The employer makes their final hiring decision. If they decide not to hire you, they must provide a written explanation and inform you of your right to file a complaint with the appropriate agency. The entire process must be documented and defensible.',
      rights: ['Right to written final decision', 'Right to explanation of reasoning', 'Right to file a complaint', 'Right to review documentation']
    }
  };

  const handleTooltipToggle = (stepId: string) => {
    setActiveTooltip(activeTooltip === stepId ? null : stepId);
  };

  // Assessment tracking functions (copied from HR admin dashboard)
  const getCurrentAssessmentStep = (userId: string): number => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`assessmentCurrentStep_${userId}`);
      if (saved && !isNaN(Number(saved))) {
        return Number(saved) - 1; // localStorage is 1-based, return 0-based
      }
    }
    return 0;
  };

  const getCurrentStepName = (userId: string): string => {
    const stepIndex = getCurrentAssessmentStep(userId);
    const steps = [
      'Not Started',
      'Conditional Job Offer',
      'Individualized Assessment',
      'Preliminary Job Offer Revocation',
      'Individual Reassessment',
      'Final Revocation Notice'
    ];
    return steps[stepIndex] || 'Not Started';
  };

  const getProgressPercentage = (userId: string): number => {
    const stepIndex = getCurrentAssessmentStep(userId);
    return Math.round((stepIndex / 5) * 100);
  };

  const getAssessmentStatus = (userId: string): string => {
    const stepIndex = getCurrentAssessmentStep(userId);
    if (stepIndex === 0) return 'Not Started';
    if (stepIndex >= 5) return 'Completed';
    return 'In Progress';
  };

  const calculateProgress = () => {
    const totalSections = categories.length;
    const completedSections = Object.values(sectionCompletion).filter(Boolean).length;
    return Math.round((completedSections / totalSections) * 100);
  };

  const renderDashboardContent = () => {
    const progress = calculateProgress();

    switch (activeDashboardSection) {
      case 'progress':
        return (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white border rounded-xl p-6" style={{ borderColor: '#E5E5E5' }}>
              <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  id="continue-building-btn" 
                  onClick={() => handleBuilderNavigation(currentCategory)}
                  className="p-4 border rounded-xl text-center transition-all duration-200 hover:shadow-lg"
                  style={{ borderColor: '#E5E5E5' }}
                >
                  <span className="flex justify-center items-center mb-2">
                    <img src="dashboard_icons/continue-building.svg" alt="Progress" className="w-10 h-10" />
                  </span>
                  <span className="font-medium text-black">Continue Building</span>
                </button>
                <button
                  id="preview-record-btn"
                  onClick={handleViewProfile}
                  className="p-4 border rounded-xl text-center transition-all duration-200 hover:shadow-lg"
                  style={{ borderColor: '#E5E5E5' }}
                >
                  <span className="flex justify-center items-center mb-2">
                    <img src="dashboard_icons/preview.svg" alt="Preview" className="w-10 h-10" />
                  </span>
                  <span className="font-medium text-black">Preview Record</span>
                </button>
                <button
                  id="check-status-btn"
                  onClick={() => handleDashboardNavigation('status')}
                  className="p-4 border rounded-xl text-center transition-all duration-200 hover:shadow-lg"
                  style={{ borderColor: '#E5E5E5' }}
                >
                  <span className="flex justify-center items-center mb-2">
                    <img src="dashboard_icons/check-status.svg" alt="Check Status" className="w-10 h-10" />
                  </span>
                  <span className="font-medium text-black">Check Status</span>
                </button>
              </div>
            </div>
            <div className="bg-white border rounded-xl p-6" style={{ borderColor: '#E5E5E5' }}>
              <h2 className="text-2xl font-semibold text-black mb-4">Your Restorative Record Progress</h2>

              {/* Progress Overview */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-black">Overall Completion</span>
                  <span className="text-sm font-medium" style={{ color: '#E54747' }}>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: '#E54747',
                      width: `${progress}%`
                    }}
                  />
                </div>
              </div>

              {/* Section Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, idx) => (
                  <div key={cat} className="border rounded-lg p-4" style={{ borderColor: '#E5E5E5' }}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-black">
                        {cat.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h3>
                      <div className="flex items-center gap-2">
                        {sectionCompletion[cat] && (
                          <span className="text-green-600 text-sm" style={{ color: '#16A34A' }}>✓</span>
                        )}
                        <button
                          onClick={() => handleBuilderNavigation(idx)}
                          className="text-sm px-3 py-1 rounded-lg transition-all duration-200 hover:opacity-90"
                          style={{
                            color: '#E54747',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA'
                          }}
                        >
                          {idx <= currentCategory ? 'Review' : 'Start'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6" style={{ borderColor: '#E5E5E5' }}>
              <h2 className="text-2xl font-semibold text-black mb-4">HR Admin Status Updates</h2>

              {/* Connected HR Admins */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-black mb-4">Connected HR Admins</h3>
                <div className="space-y-3">
                  {connectedHRAdmins.length > 0 ? (
                    connectedHRAdmins.map((admin) => (
                      <div key={admin.id} className="border rounded-lg" style={{ borderColor: '#E5E5E5' }}>
                        {/* Always Visible Header */}
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-medium text-black">{admin.company}</h4>
                              <p className="text-sm" style={{ color: '#595959' }}>
                                {admin.first_name} {admin.last_name}
                              </p>
                              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                                Connected {admin.granted_at ? new Date(admin.granted_at).toLocaleDateString() : 'recently'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{
                                backgroundColor: admin.status === 'In Progress' ? '#FFF3CD' : '#F0FDF4',
                                color: admin.status === 'In Progress' ? '#856404' : '#166534',
                                border: admin.status === 'In Progress' ? '1px solid #FFEAA7' : '1px solid #BBF7D0'
                              }}>
                                {admin.status}
                              </span>
                              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                                Step {admin.currentStep} of {admin.totalSteps} - {admin.stepName}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleHRAdminDetails(admin.id)}
                              className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-50"
                              style={{ border: '1px solid #E5E5E5' }}
                            >
                              <span className="text-lg">
                                {expandedHRAdmins[admin.id] ? '▼' : '▶'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Detailed Status */}
                        {expandedHRAdmins[admin.id] && (
                          <div className="border-t p-4 space-y-4" style={{ borderColor: '#E5E5E5', backgroundColor: '#F8F9FA' }}>
                            {/* Assessment Progress Bar */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                              <h6 className="font-semibold text-black mb-3">Assessment Progress</h6>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-black">Step {admin.currentStep} of {admin.totalSteps}: {admin.stepName}</span>
                                  <span className="font-medium" style={{ color: '#F59E0B' }}>{admin.progress}% Complete</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                      backgroundColor: '#F59E0B',
                                      width: `${admin.progress}%`
                                    }}
                                  />
                                </div>
                                <div className="grid grid-cols-5 gap-1 text-xs relative">
                                  {/* Step 1: Conditional Job Offer */}
                                  <div className="text-center relative">
                                    <div className="flex flex-col items-center">
                                      <div className="flex items-center gap-1 mb-1 pr-5">
                                        <span className="text-green-600">✓</span>
                                      </div>
                                      <div className="flex items-center">
                                      <p style={{ color: '#10B981' }}>Conditional Job Offer</p>
                                      <button
                                          onClick={() => handleTooltipToggle('step1')}
                                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                          title="Learn more about this step"
                                        >
                                          <Info className="h-3 w-3 text-gray-500 hover:text-blue-600" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Tooltip for Step 1 */}
                                    {activeTooltip === 'step1' && (
                                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 w-80 bg-white border rounded-lg shadow-xl p-4" style={{ borderColor: '#E5E5E5' }}>
                                        <div className="mb-3">
                                          <h4 className="font-semibold text-black mb-2">{stepTooltips.step1.title}</h4>
                                          <p className="text-sm text-gray-700 mb-3">{stepTooltips.step1.content}</p>
                                          <div>
                                            <h5 className="font-medium text-black mb-2 text-sm">Your Rights:</h5>
                                            <ul className="text-xs space-y-1">
                                              {stepTooltips.step1.rights.map((right, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                  <span className="text-green-600 font-bold">•</span>
                                                  <span className="text-gray-600">{right}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => setActiveTooltip(null)}
                                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                        >
                                          Close
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Step 2: Individual Assessment */}
                                  <div className="text-center relative">
                                    <div className="flex flex-col items-center">
                                      <div className="flex items-center gap-1 mb-1 pr-5">
                                        <span style={{ color: '#F59E0B' }}>●</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <p style={{ color: '#F59E0B' }}>Individual Assessment</p>
                                        <button
                                          onClick={() => handleTooltipToggle('step2')}
                                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                          title="Learn more about this step"
                                        >
                                          <Info className="h-3 w-3 text-gray-500 hover:text-blue-600" />
                                        </button>
                                      </div>
                                    </div>
                                    {/* Tooltip for Step 2 */}
                                    {activeTooltip === 'step2' && (
                                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 w-80 bg-white border rounded-lg shadow-xl p-4" style={{ borderColor: '#E5E5E5' }}>
                                        <div className="mb-3">
                                          <h4 className="font-semibold text-black mb-2">{stepTooltips.step2.title}</h4>
                                          <p className="text-sm text-gray-700 mb-3">{stepTooltips.step2.content}</p>
                                          <div>
                                            <h5 className="font-medium text-black mb-2 text-sm">Your Rights:</h5>
                                            <ul className="text-xs space-y-1">
                                              {stepTooltips.step2.rights.map((right, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                  <span className="text-green-600 font-bold">•</span>
                                                  <span className="text-gray-600">{right}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => setActiveTooltip(null)}
                                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                        >
                                          Close
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Step 3: Preliminary Revocation */}
                                  <div className="text-center relative">
                                    <div className="flex flex-col items-center">
                                      <div className="flex items-center gap-1 mb-1 pr-5">
                                        <span className="text-gray-400">○</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <p style={{ color: '#9CA3AF' }}>Prelim. Revocation</p>
                                        <button
                                          onClick={() => handleTooltipToggle('step3')}
                                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                          title="Learn more about this step"
                                        >
                                          <Info className="h-3 w-3 text-gray-500 hover:text-blue-600" />
                                        </button>
                                      </div>
                                    </div>
                                    {/* Tooltip for Step 3 */}
                                    {activeTooltip === 'step3' && (
                                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 w-80 bg-white border rounded-lg shadow-xl p-4" style={{ borderColor: '#E5E5E5' }}>
                                        <div className="mb-3">
                                          <h4 className="font-semibold text-black mb-2">{stepTooltips.step3.title}</h4>
                                          <p className="text-sm text-gray-700 mb-3">{stepTooltips.step3.content}</p>
                                          <div>
                                            <h5 className="font-medium text-black mb-2 text-sm">Your Rights:</h5>
                                            <ul className="text-xs space-y-1">
                                              {stepTooltips.step3.rights.map((right, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                  <span className="text-green-600 font-bold">•</span>
                                                  <span className="text-gray-600">{right}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => setActiveTooltip(null)}
                                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                        >
                                          Close
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Step 4: Reassessment */}
                                  <div className="text-center relative">
                                    <div className="flex flex-col items-center">
                                      <div className="flex items-center gap-1 mb-1 pr-5">
                                        <span className="text-gray-400">○</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <p style={{ color: '#9CA3AF' }}>Reassessment</p>
                                        <button
                                          onClick={() => handleTooltipToggle('step4')}
                                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                          title="Learn more about this step"
                                        >
                                          <Info className="h-3 w-3 text-gray-500 hover:text-blue-600" />
                                        </button>
                                      </div>
                                    </div>
                                    {/* Tooltip for Step 4 */}
                                    {activeTooltip === 'step4' && (
                                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 w-80 bg-white border rounded-lg shadow-xl p-4" style={{ borderColor: '#E5E5E5' }}>
                                        <div className="mb-3">
                                          <h4 className="font-semibold text-black mb-2">{stepTooltips.step4.title}</h4>
                                          <p className="text-sm text-gray-700 mb-3">{stepTooltips.step4.content}</p>
                                          <div>
                                            <h5 className="font-medium text-black mb-2 text-sm">Your Rights:</h5>
                                            <ul className="text-xs space-y-1">
                                              {stepTooltips.step4.rights.map((right, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                  <span className="text-green-600 font-bold">•</span>
                                                  <span className="text-gray-600">{right}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => setActiveTooltip(null)}
                                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                        >
                                          Close
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Step 5: Final Decision */}
                                  <div className="text-center relative">
                                    <div className="flex flex-col items-center">
                                      <div className="flex items-center gap-1 mb-1 pr-5">
                                        <span className="text-gray-400">○</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <p style={{ color: '#9CA3AF' }}>Final Decision</p>
                                        <button
                                          onClick={() => handleTooltipToggle('step5')}
                                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                          title="Learn more about this step"
                                        >
                                          <Info className="h-3 w-3 text-gray-500 hover:text-blue-600" />
                                        </button>
                                      </div>
                                    </div>
                                    {/* Tooltip for Step 5 */}
                                    {activeTooltip === 'step5' && (
                                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 w-80 bg-white border rounded-lg shadow-xl p-4" style={{ borderColor: '#E5E5E5' }}>
                                        <div className="mb-3">
                                          <h4 className="font-semibold text-black mb-2">{stepTooltips.step5.title}</h4>
                                          <p className="text-sm text-gray-700 mb-3">{stepTooltips.step5.content}</p>
                                          <div>
                                            <h5 className="font-medium text-black mb-2 text-sm">Your Rights:</h5>
                                            <ul className="text-xs space-y-1">
                                              {stepTooltips.step5.rights.map((right, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                  <span className="text-green-600 font-bold">•</span>
                                                  <span className="text-gray-600">{right}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => setActiveTooltip(null)}
                                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                        >
                                          Close
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Detailed Status Updates - Collapsible with new design */}
                            <div className="border rounded-lg" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
                              <div 
                                className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 transition-all duration-200"
                                onClick={() => toggleStatusUpdates(admin.id)}
                              >
                                <h6 className="font-semibold text-black">Detailed Status Updates</h6>
                                {expandedStatusUpdates[admin.id] ? (
                                  <ChevronDown className="h-5 w-5 text-gray-600" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-600" />
                                )}
                              </div>

                              {expandedStatusUpdates[admin.id] && (
                                <div className="p-4 border-t" style={{ borderColor: '#E5E5E5' }}>
                                  <div className="space-y-3">
                                    <div className="border-l-4 pl-4 py-3" style={{ borderColor: '#10B981' }}>
                                      <h6 className="font-semibold text-black">Record Submitted Successfully</h6>
                                      <p className="text-sm" style={{ color: '#595959' }}>
                                        Your Restorative Record has been completed and is available for HR review.
                                      </p>
                                      <span className="text-xs" style={{ color: '#9CA3AF' }}>2 days ago</span>
                                    </div>

                                    <div className="border-l-4 pl-4 py-3" style={{ borderColor: '#F59E0B' }}>
                                      <h6 className="font-semibold text-black">Assessment in Progress: {admin.stepName}</h6>
                                      <p className="text-sm" style={{ color: '#595959' }}>
                                        {admin.company} is currently preparing your written individualized assessment based on your Restorative Record.
                                      </p>
                                      <div className="mt-2 text-xs" style={{ color: '#9CA3AF' }}>
                                        <p>Current Step: Step {admin.currentStep} of {admin.totalSteps} - {admin.stepName}</p>
                                        <p>Updated: 1 day ago</p>
                                      </div>
                                    </div>

                                    <div className="border-l-4 pl-4 py-3" style={{ borderColor: '#E5E5E5' }}>
                                      <h6 className="font-semibold" style={{ color: '#9CA3AF' }}>Next: Preliminary Job Offer Revocation</h6>
                                      <p className="text-sm" style={{ color: '#9CA3AF' }}>
                                        Pending completion of current assessment step.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Estimated Timeline & Important Deadlines - Collapsible */}
                            <div className="border rounded-lg" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
                              <div 
                                className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 transition-all duration-200"
                                onClick={() => toggleTimeline(admin.id)}
                              >
                                <h6 className="font-semibold text-black">Estimated Timeline & Important Deadlines</h6>
                                {expandedTimeline[admin.id] ? (
                                  <ChevronDown className="h-5 w-5 text-gray-600" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-600" />
                                )}
                              </div>

                              {expandedTimeline[admin.id] && (
                                <div className="p-4 border-t" style={{ borderColor: '#E5E5E5' }}>
                                  <p className="text-sm mb-3" style={{ color: '#595959' }}>
                                    Your assessment is progressing well. Based on the current step, you can expect to hear back within 3-5 business days for the next update.
                                  </p>

                                  {/* Important 5-day deadline notice */}
                                  <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}>
                                    <div className="flex items-start gap-2">
                                      <span className="text-lg">⚠️</span>
                                      <div>
                                        <p className="font-semibold text-black mb-1">Important: 5-Day Response Window</p>
                                        <p className="text-sm" style={{ color: '#92400E' }}>
                                          You have <strong>5 business days</strong> from the completion of each assessment step to:
                                        </p>
                                        <ul className="text-sm mt-2 ml-4 list-disc" style={{ color: '#92400E' }}>
                                          <li>Update or add information to your Restorative Record</li>
                                          <li>Challenge the accuracy of any background check report</li>
                                          <li>Request additional time if needed</li>
                                        </ul>
                                        <p className="text-xs mt-2" style={{ color: '#78350F' }}>
                                          <strong>Deadline for current step:</strong> 3 days remaining (expires January 15, 2024)
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}>
                                      Next Update Expected: Within 3 days
                                    </span>
                                    <button
                                      onClick={() => handleBuilderNavigation(0)}
                                      className="text-xs px-2 py-1 rounded transition-all duration-200 hover:opacity-90"
                                      style={{ backgroundColor: '#E54747', color: '#FFFFFF' }}
                                    >
                                      Update Record Now
                                    </button>
                                    <button
                                      className="text-xs px-2 py-1 rounded border transition-all duration-200 hover:opacity-90"
                                      style={{ borderColor: '#E54747', color: '#E54747', backgroundColor: 'transparent' }}
                                    >
                                      Request Extension
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 border-2 border-dashed rounded-lg text-center" style={{ borderColor: '#E5E5E5' }}>
                      <p className="text-sm" style={{ color: '#9CA3AF' }}>
                        No HR admin connections yet. Visit your user dashboard to grant access to HR administrators.
                      </p>
                      <button
                        onClick={() => router.push('/user/dashboard')}
                        className="mt-3 px-4 py-2 text-sm rounded-lg transition-all duration-200 hover:opacity-90"
                        style={{
                          backgroundColor: '#E54747',
                          color: '#FFFFFF'
                        }}
                      >
                        Manage HR Access
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6" style={{ borderColor: '#E5E5E5' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-black">Notifications</h2>
                <button
                  onClick={() => fetchAllHRAdmins()}
                  className="text-sm px-3 py-1 rounded-lg transition-all duration-200 hover:opacity-90"
                  style={{
                    color: '#E54747',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA'
                  }}
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 ${notification.type === 'request' ? 'bg-blue-50' :
                        notification.type === 'connection' ? 'bg-green-50' : 'bg-yellow-50'
                        }`}
                      style={{
                        borderColor: notification.type === 'request' ? '#3B82F6' :
                          notification.type === 'connection' ? '#10B981' : '#F59E0B'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-black mb-1">{notification.title}</h3>
                          <p className="text-sm mb-2" style={{ color: '#595959' }}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs" style={{ color: '#9CA3AF' }}>
                            <span>
                              {new Date(notification.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span>•</span>
                            <span>
                              {notification.admin.email}
                            </span>
                          </div>
                        </div>

                        {notification.type === 'request' && (
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleHRAdminPermission(notification.adminId, true)}
                              disabled={processingPermission === notification.adminId}
                              className="px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                              style={{
                                backgroundColor: '#10B981',
                                color: '#FFFFFF'
                              }}
                            >
                              {processingPermission === notification.adminId ? 'Processing...' : 'Grant Access'}
                            </button>
                            <button
                              onClick={() => {
                                // Remove the notification without granting access
                                setNotifications(prev => prev.filter(n => n.id !== notification.id));
                              }}
                              disabled={processingPermission === notification.adminId}
                              className="px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                              style={{
                                borderColor: '#E5E5E5',
                                color: '#595959',
                                backgroundColor: '#FFFFFF'
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        )}

                        {notification.type === 'connection' && (
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleHRAdminPermission(notification.adminId, false)}
                              disabled={processingPermission === notification.adminId}
                              className="px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                              style={{
                                borderColor: '#E54747',
                                color: '#E54747',
                                backgroundColor: '#FFFFFF'
                              }}
                            >
                              {processingPermission === notification.adminId ? 'Processing...' : 'Revoke Access'}
                            </button>
                            <button
                              onClick={() => handleDashboardNavigation('status')}
                              className="px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 hover:opacity-90"
                              style={{
                                backgroundColor: '#3B82F6',
                                color: '#FFFFFF'
                              }}
                            >
                              View Status
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8" style={{ color: '#9CA3AF' }}>
                    <div className="mb-4">
                      <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM21 3H3v14h18V3z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">No notifications</p>
                    <p className="text-sm">
                      You'll see notifications here when HR admins request access to your Restorative Record.
                    </p>
                    <button
                      onClick={() => router.push('/user/dashboard')}
                      className="mt-4 px-4 py-2 text-sm rounded-lg transition-all duration-200 hover:opacity-90"
                      style={{
                        backgroundColor: '#E54747',
                        color: '#FFFFFF'
                      }}
                    >
                      Manage HR Access
                    </button>
                  </div>
                )}
              </div>

              {/* Summary Section */}
              {allHRAdmins.length > 0 && (
                <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA', border: '1px solid #E5E5E5' }}>
                  <h3 className="font-semibold text-black mb-3">HR Admin Access Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <button
                      onClick={() => setExpandedSummaryView(expandedSummaryView === 'connected' ? null : 'connected')}
                      className="text-center p-3 rounded-lg transition-all duration-200 hover:shadow-md"
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5' }}
                    >
                      <div className="text-2xl font-bold text-black">
                        {allHRAdmins.filter(admin => admin.hasAccess).length}
                      </div>
                      <div className="text-sm" style={{ color: '#595959' }}>
                        Currently Connected
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                        Click to {expandedSummaryView === 'connected' ? 'hide' : 'view'} details
                      </div>
                    </button>
                    <button
                      onClick={() => setExpandedSummaryView(expandedSummaryView === 'pending' ? null : 'pending')}
                      className="text-center p-3 rounded-lg transition-all duration-200 hover:shadow-md"
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5' }}
                    >
                      <div className="text-2xl font-bold text-black">
                        {notifications.filter(n => n.type === 'request').length}
                      </div>
                      <div className="text-sm" style={{ color: '#595959' }}>
                        Pending Requests
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                        Click to {expandedSummaryView === 'pending' ? 'hide' : 'view'} details
                      </div>
                    </button>
                  </div>

                  {/* Expanded Views */}
                  {expandedSummaryView === 'connected' && (
                    <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                      <h4 className="font-semibold text-black mb-3">Currently Connected Companies</h4>
                      <div className="space-y-3">
                        {allHRAdmins.filter(admin => admin.hasAccess).map((admin) => (
                          <div key={admin.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F8F9FA', border: '1px solid #E5E5E5' }}>
                            <div className="flex-1">
                              <h5 className="font-medium text-black">{admin.company}</h5>
                              <p className="text-sm" style={{ color: '#595959' }}>
                                {admin.first_name} {admin.last_name} • {admin.email}
                              </p>
                              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                                Connected {admin.granted_at ? new Date(admin.granted_at).toLocaleDateString() : 'recently'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDashboardNavigation('status')}
                                className="px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 hover:opacity-90"
                                style={{
                                  backgroundColor: '#3B82F6',
                                  color: '#FFFFFF'
                                }}
                              >
                                View Status
                              </button>
                              <button
                                onClick={() => handleHRAdminPermission(admin.id, false)}
                                disabled={processingPermission === admin.id}
                                className="px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                                style={{
                                  borderColor: '#E54747',
                                  color: '#E54747',
                                  backgroundColor: '#FFFFFF'
                                }}
                              >
                                {processingPermission === admin.id ? 'Processing...' : 'Revoke Access'}
                              </button>
                            </div>
                          </div>
                        ))}
                        {allHRAdmins.filter(admin => admin.hasAccess).length === 0 && (
                          <div className="text-center py-4" style={{ color: '#9CA3AF' }}>
                            <p>No HR admins currently connected.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {expandedSummaryView === 'pending' && (
                    <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                      <h4 className="font-semibold text-black mb-3">Pending Access Requests</h4>
                      <div className="space-y-3">
                        {notifications.filter(n => n.type === 'request').map((notification) => (
                          <div key={notification.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F8F9FA', border: '1px solid #E5E5E5' }}>
                            <div className="flex-1">
                              <h5 className="font-medium text-black">{notification.admin.company}</h5>
                              <p className="text-sm" style={{ color: '#595959' }}>
                                {notification.admin.first_name} {notification.admin.last_name} • {notification.admin.email}
                              </p>
                              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                                Requested {new Date(notification.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleHRAdminPermission(notification.adminId, true)}
                                disabled={processingPermission === notification.adminId}
                                className="px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                                style={{
                                  backgroundColor: '#10B981',
                                  color: '#FFFFFF'
                                }}
                              >
                                {processingPermission === notification.adminId ? 'Processing...' : 'Grant Access'}
                              </button>
                              <button
                                onClick={() => {
                                  setNotifications(prev => prev.filter(n => n.id !== notification.id));
                                }}
                                disabled={processingPermission === notification.adminId}
                                className="px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                                style={{
                                  borderColor: '#E5E5E5',
                                  color: '#595959',
                                  backgroundColor: '#FFFFFF'
                                }}
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        ))}
                        {notifications.filter(n => n.type === 'request').length === 0 && (
                          <div className="text-center py-4" style={{ color: '#9CA3AF' }}>
                            <p>No pending access requests.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      {/* Legal Assistance Modal */}
      case 'legal-resources':
        return (
          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6" style={{ borderColor: '#E5E5E5' }}>
              <h2 className="text-2xl font-semibold text-black mb-4">Legal Resources</h2>
              <div className="w-full">
                <div className="p-6">
                  <div className="mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <p className="mb-3 leading-relaxed text-sm">
                      If you believe you have experienced employment discrimination or have questions about your rights under Fair Chance Hiring laws, you can contact a legal team for assistance. Your inquiry will be sent to the appropriate legal professionals in your jurisdiction.
                    </p>
                    <ul className="list-disc pl-5 text-xs mb-3 space-y-1" style={{ color: '#595959' }}>
                      <li>Fair Chance Hiring laws protect individuals with criminal records from unfair discrimination in employment.</li>
                      <li>You have the right to know if an employer has run a background check on you.</li>
                      <li>Legal teams can help you understand your rights and options if you believe you have been treated unfairly.</li>
                    </ul>
                    <div className="border-l-4 p-4 my-4 rounded-lg" style={{ borderColor: '#E54747', backgroundColor: '#fef7f7' }}>
                      <div className="font-semibold mb-2 text-sm" style={{ color: '#E54747', fontFamily: 'Poppins, sans-serif' }}>
                        San Diego Applicants
                      </div>
                      <p className="mb-2 text-black leading-relaxed text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        If you would like to file a fair chance complaint, please complete the{' '}
                        <a
                          href="https://forms.office.com/Pages/ResponsePage.aspx?id=E69jRSnAs0G3TJZejuyPlqdlrWcla0pGkN2zYgm3FclUMUVUMDdGOFZDWlNJSlRDODBNMDNRWVNHOCQlQCN0PWcu"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium underline transition-colors duration-200 hover:opacity-80"
                          style={{ color: '#E54747' }}
                        >
                          official fair chance complaint inquiry form
                        </a>
                        .
                      </p>
                      <p className="mb-2 text-black text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        If you are unable to fill out the form, contact us via:
                      </p>
                      <ul className="text-black text-xs mb-2 space-y-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <li>
                          <span className="font-medium">Email:</span>{' '}
                          <a
                            href="mailto:olse@sdcounty.ca.gov"
                            className="font-medium underline transition-colors duration-200 hover:opacity-80"
                            style={{ color: '#E54747' }}
                          >
                            olse@sdcounty.ca.gov
                          </a>
                        </li>
                        <li>
                          <span className="font-medium">Office:</span>{' '}
                          <a
                            href="tel:6195315129"
                            className="font-medium underline transition-colors duration-200 hover:opacity-80"
                            style={{ color: '#E54747' }}
                          >
                            619-531-5129
                          </a>
                        </li>
                        <li>We are open Monday-Friday 8:00 am-5:00 pm</li>
                      </ul>
                      <p className="text-black text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        If your question is not related to fair chance hiring, please call{' '}
                        <a
                          href="tel:8586943900"
                          className="font-medium underline transition-colors duration-200 hover:opacity-80"
                          style={{ color: '#E54747' }}
                        >
                          858-694-3900
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                  {legalSubmitted ? (
                    <div className="text-center py-8 px-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', color: '#059669', fontFamily: 'Poppins, sans-serif' }}>
                      <div className="text-base font-medium mb-2">Thank you!</div>
                      <div className="text-sm">Your request has been submitted. A legal professional will contact you soon.</div>
                    </div>
                  ) : (
                    <form onSubmit={handleLegalSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={legalForm.name}
                          onChange={handleLegalInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Your Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={legalForm.email}
                          onChange={handleLegalInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Describe your question or issue
                        </label>
                        <textarea
                          name="question"
                          value={legalForm.question}
                          onChange={handleLegalInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 resize-none text-sm"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                          rows={3}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Employer(s) who have run background checks on you
                        </label>
                        <input
                          type="text"
                          name="employers"
                          value={legalForm.employers}
                          onChange={handleLegalInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                          placeholder="Enter employer names, separated by commas"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md text-sm"
                        style={{ backgroundColor: '#E54747', color: 'white', fontFamily: 'Poppins, sans-serif' }}
                      >
                        Submit Request
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 'settings':
        return (
          <UserDashboardContent />
        )

      default:
        return null;
    }
  };

  // When starting the tutorial, save the original dashboard section, view, and builder section
  const startTutorial = () => {
    originalView.current = currentView;
    if (currentView === 'dashboard') {
      originalDashboardSection.current = activeDashboardSection;
      originalBuilderSection.current = null;
    } else if (currentView === 'builder') {
      originalDashboardSection.current = activeDashboardSection;
      originalBuilderSection.current = currentCategory;
      setCurrentView('dashboard');
    }
    setTutorialStep(1);
  };

  useEffect(() => {
    // Only switch if in dashboard view and the step has a dashboardSection
    if (tutorialStep && currentView === 'dashboard') {
      const step = tutorialSteps[tutorialStep - 1];
      if (step.dashboardSection && activeDashboardSection !== step.dashboardSection) {
        setActiveDashboardSection(step.dashboardSection);
      }
    }
    // Only restore if not dismissed by overlay
    if (!tutorialStep && currentView === 'dashboard' && !tutorialDismissedByOverlay) {
      if (originalView.current === 'dashboard' && originalDashboardSection.current) {
        setActiveDashboardSection(originalDashboardSection.current);
        originalDashboardSection.current = null;
      } else if (originalView.current === 'builder' && originalBuilderSection.current !== null) {
        setCurrentView('builder');
        setCurrentCategory(originalBuilderSection.current);
        originalBuilderSection.current = null;
      }
      originalView.current = null;
    }
    // Always reset the flag when tutorialStep is null
    if (!tutorialStep && tutorialDismissedByOverlay) {
      setTutorialDismissedByOverlay(false);
      originalView.current = null;
      originalBuilderSection.current = null;
      originalDashboardSection.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return;
  }, [tutorialStep, currentView]);

  // Create a shared button group for MY RESTORATIVE RECORD and Help
  const ButtonGroup = (
    <div className="flex items-center gap-3">
      <button
        id="my-restorative-record-btn"
        onClick={handleViewProfile}
        className="px-5 py-2 text-base font-medium rounded-xl shadow hover:opacity-90 text-white"
        style={{ backgroundColor: '#E54747' }}
      >
        MY RESTORATIVE RECORD
      </button>
      <button
        onClick={startTutorial}
        className="px-5 py-2 text-base font-medium rounded-xl shadow hover:opacity-90 border ml-2"
        style={{ color: '#E54747', backgroundColor: '#FFFFFF', borderColor: '#E54747' }}
        title="Show Tutorial"
      >
        Help
      </button>
    </div>
  );

  const handleLegalInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLegalForm({ ...legalForm, [e.target.name]: e.target.value });
  };

  const handleLegalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLegalSubmitted(true);
    // TODO: Send form data to backend or legal team
  };

  const sectionCompletion: Record<string, boolean> = categories.reduce((acc, cat) => {
    const section = recordHookMap[cat as keyof typeof recordHookMap];
    if (cat === "introduction" && typeof section === "object" && "personalNarrative" in section) {
      acc[cat] = Boolean(section.personalNarrative);
    } else if (section && "items" in section && Array.isArray(section.items)) {
      acc[cat] = section.items.length > 0;
    } else {
      acc[cat] = false;
    }
    return acc;
  }, {} as Record<string, boolean>);

  // Define refreshAwards before useEffect
  const refreshAwards = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: awardsData } = await supabase
      .from("awards")
      .select("*")
      .eq("user_id", user.id);
    if (awardsData && Array.isArray(awardsData)) {
      const mappedAwards = awardsData.map((remote) => ({
        id: remote.id,
        type: remote.type || "",
        name: remote.name || "",
        organization: remote.organization || "",
        date: remote.date || "",
        file: null,
        filePreview: remote.file_url || "",
        fileName: remote.file_name || undefined,
        fileSize: remote.file_size || undefined,
        narrative: remote.narrative || "",
      }));
      const localAwards = awardsHook.items || [];
      const mergedAwards = [
        ...mappedAwards.filter(
          (remote) => !localAwards.some((local) => local.id === remote.id)
        ),
        ...localAwards,
      ];
      awardsHook.setItems(mergedAwards);
    }
  };

  const refreshSkills = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: skillsData } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", user.id);
    if (skillsData && Array.isArray(skillsData)) {
      const mappedSkills = skillsData.map((remote) => ({
        id: remote.id,
        softSkills: Array.isArray(remote.soft_skills) ? remote.soft_skills.join(", ") : "",
        hardSkills: Array.isArray(remote.hard_skills) ? remote.hard_skills.join(", ") : "",
        otherSkills: remote.other_skills || "",
        file: null,
        filePreview: remote.file_url || "",
        fileName: remote.file_name || undefined,
        fileSize: remote.file_size || undefined,
        narrative: remote.narrative || "",
      }));
      const localSkills = skillsHook.items || [];
      const mergedSkills = [
        ...mappedSkills.filter(
          (remote) => !localSkills.some((local) => local.id === remote.id)
        ),
        ...localSkills,
      ];
      skillsHook.setItems(mergedSkills);
    }
  };

  // Now your useEffect can use them
  useEffect(() => {
    if (activeDashboardSection === "progress" && user) {
      refreshAwards?.();
      refreshSkills?.();
      refreshEngagements?.();
      refreshRehabPrograms?.();
      refreshMicrocredentials?.();
      refreshMentors?.();
      refreshEducation?.();
      refreshEmployment?.();
      refreshHobbies?.();
      // Add any other fetch/refresh functions you have
    }
  }, [activeDashboardSection, user]);

  
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-80 bg-white border-r min-h-screen p-6" style={{ borderColor: '#E5E5E5' }}>
          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-black mb-2">My Rézme Dashboard</h1>
            <p className="text-sm" style={{ color: '#595959' }}>
              Track your progress and manage your restorative record
            </p>
          </div>

          {/* Dashboard Sections */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wider">Dashboard</h3>
            <ul className="space-y-1">
              {dashboardSections.map((section) => (
                <li key={section.id}>
                  <button
                    id={section.id}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      currentView === 'dashboard' && activeDashboardSection === section.id
                        ? "text-white font-medium"
                        : "text-black hover:bg-gray-50"
                    }`}
                    style={{
                      backgroundColor: currentView === 'dashboard' && activeDashboardSection === section.id ? '#E54747' : 'transparent'
                    }}
                    onClick={() => handleDashboardNavigation(section.id)}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Divider */}
          <div className="mb-8">
            <div className="border-t" style={{ borderColor: '#E5E5E5' }}></div>
          </div>

          {/* Builder Sections */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wider">Record Builder</h3>
            <ul className="space-y-1">
              {categories.map((cat, idx) => (
                <li key={cat}>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'builder' && idx === currentCategory
                      ? "bg-red-50 font-medium border"
                      : "hover:bg-gray-50"
                      }`}
                    style={{
                      color: currentView === 'builder' && idx === currentCategory ? '#E54747' : '#000000',
                      borderColor: currentView === 'builder' && idx === currentCategory ? '#E54747' : 'transparent'
                    }}
                    onClick={() => handleBuilderNavigation(idx)}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {cat
                          .replace(/-/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      {sectionCompletion[cat] && (
                        <span className="text-green-600 text-sm" style={{ color: '#16A34A' }}>✓</span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {currentView === 'dashboard' ? (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-semibold text-black">
                      {dashboardSections.find(s => s.id === activeDashboardSection)?.label}
                    </h1>
                  </div>
                  {ButtonGroup}
                </div>
                {renderDashboardContent()}
              </>
            ) : (
              <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-semibold text-black">
                Restorative Record Builder
              </h1>
              {ButtonGroup}
            </div>
            <div className="mb-8">{renderSection()}</div>
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentCategory === 0}
                className="px-6 py-3 border text-base font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: '#595959',
                  borderColor: '#E5E5E5',
                  backgroundColor: 'transparent'
                }}
              >
                Previous
              </button>
              {currentCategory === categories.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90 text-white"
                  style={{ backgroundColor: '#E54747' }}
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200"
                >
                  Next
                </button>
              )}
            </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Incomplete Record Modal */}
      {showIncompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-3 text-black">
              Complete Your Restorative Record
            </h3>
            <p className="mb-6" style={{ color: '#595959' }}>
              Please complete the Restorative Record to use this feature. You
              must go through all sections and submit your record before viewing
              your profile.
            </p>
            <button
              onClick={() => setShowIncompleteModal(false)}
              className="w-full px-4 py-2 text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90 text-white"
              style={{ backgroundColor: '#E54747' }}
            >
              Continue Building Your Restorative Record
            </button>
          </div>
        </div>
      )}
      {tutorialStep && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black bg-opacity-0"
            onClick={() => {
              setTutorialDismissedByOverlay(true);
              setTutorialStep(null);
            }}
          />
          <TutorialTooltip
            step={tutorialSteps[tutorialStep - 1]}
            onNext={() => {
              setTutorialDismissedByOverlay(false);
              if (tutorialStep < tutorialSteps.length) setTutorialStep(tutorialStep + 1);
              else setTutorialStep(null);
            }}
            onBack={() => {
              setTutorialDismissedByOverlay(false);
              if (tutorialStep > 1) setTutorialStep(tutorialStep - 1);
            }}
            onClose={() => {
              setTutorialDismissedByOverlay(false);
              setTutorialStep(null);
            }}
            showBack={tutorialStep > 1}
            isLastStep={tutorialStep === tutorialSteps.length}
          />
        </>
      )}
    </div>
  );
}

export default function RestorativeRecordBuilder() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestorativeRecordBuilderForm />
    </Suspense>
  );
}
