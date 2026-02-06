"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import "react-day-picker/dist/style.css";
import { toast } from "react-hot-toast";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { UserDashboardContent } from "../user/dashboard/components/UserDashboardContent"
import LegalResourcesDisplay from "@/components/LegalResourcesDisplay";
import { getLegalResourcesByJurisdiction } from "@/data/legalResources";

// Import types
import {
  Award,
  ConnectedHRAdmin,
  Education,
  Employment,
  Engagement,
  Hobby,
  HRAdminProfile,
  HRAdminWithAccess,
  Introduction,
  Mentor,
  Microcredential,
  Permission,
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
  admin: HRAdminWithAccess;
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

// Add types for tutorial steps
type TutorialStep = {
  targetId: string;
  title: string;
  description: string;
  dashboardSection: string | null;
  requiresSidebar: boolean;
};

function RestorativeRecordBuilderForm() {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder'>('dashboard');
  const [activeDashboardSection, setActiveDashboardSection] = useState('progress');
  const [expandedHRAdmins, setExpandedHRAdmins] = useState<{ [key: string]: boolean }>({});
  const [expandedStatusUpdates, setExpandedStatusUpdates] = useState<{ [key: string]: boolean }>({});
  const [expandedTimeline, setExpandedTimeline] = useState<{ [key: string]: boolean }>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [connectedHRAdmins, setConnectedHRAdmins] = useState<ConnectedHRAdmin[]>([]);
  const [allHRAdmins, setAllHRAdmins] = useState<HRAdminWithAccess[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [processingPermission, setProcessingPermission] = useState<string | null>(null);
  const [expandedSummaryView, setExpandedSummaryView] = useState<'connected' | 'pending' | null>(null);
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
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
  // Add new state for hover tutorial
  const [hoverTutorialStep, setHoverTutorialStep] = useState<number | null>(null);
  const [hoverTutorialActive, setHoverTutorialActive] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tooltipReady, setTooltipReady] = useState(false);

  // Pre-screening assessment questionnaire state
  const [showPreScreeningModal, setShowPreScreeningModal] = useState(false);
  const [preScreeningStep, setPreScreeningStep] = useState(1);
  const [preScreeningData, setPreScreeningData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // WOTC Survey modal state
  const [showWotcModal, setShowWotcModal] = useState(false);
  const [wotcStep, setWotcStep] = useState(0); // 0 = instructions, 1+ = questions
  const [wotcInfoExpanded, setWotcInfoExpanded] = useState<string | null>(null); // Track which info panel is expanded
  const [wotcAnswers, setWotcAnswers] = useState({
    conditionalCertificate: "",
    receivedTANF: "",
    receivedSNAP: "",
    receivedSSI: "",
    isVeteran: "",
    veteranDisabled: "",
    unemployed27Weeks: "",
    receivedUnemployment: "",
    felonyConviction: "",
    vocationalRehab: "",
    empowermentZone: "",
  });
  const [wotcSSN, setWotcSSN] = useState("");
  const [wotcSignature, setWotcSignature] = useState("");
  const [wotcEditingQuestion, setWotcEditingQuestion] = useState<number | null>(null);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Apply styles to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Store scroll position for restoration
      document.body.dataset.scrollY = scrollY.toString();
    } else {
      // Restore scroll position and remove styles
      const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      // Restore scroll position
      window.scrollTo(0, scrollY);
    }

    // Cleanup function to re-enable scrolling when component unmounts
    return () => {
      const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [mobileMenuOpen]);

  const tutorialSteps: TutorialStep[] = [
    {
      targetId: "progress",
      title: "Progress Tracking",
      description: "See your overall progress as you build your restorative record.",
      dashboardSection: 'progress',
      requiresSidebar: true,
    },
    {
      targetId: "continue-building-btn",
      title: "Continue Building",
      description: "Continue building your restorative record.",
      dashboardSection: 'progress',
      requiresSidebar: false,
    },
    {
      targetId: "preview-record-btn",
      title: "Preview Record",
      description: "Preview what your restorative record will look like.",
      dashboardSection: 'progress',
      requiresSidebar: false,
    },
    {
      targetId: "check-status-btn",
      title: "Status Updates",
      description: "Check who can see your restorative record and where you're at in the hiring process.",
      dashboardSection: 'progress',
      requiresSidebar: false,
    },
    {
      targetId: "status",
      title: "Status Updates",
      description: "Also moves you to the Status Updates page.",
      dashboardSection: 'status',
      requiresSidebar: true,
    },
    {
      targetId: "admin-details-btn",
      title: "Show Details",
      description: "Show specific HR admin's progress.",
      dashboardSection: 'status',
      requiresSidebar: false,
    },
    {
      targetId: "assessment-progress",
      title: "Assesment Progress",
      description: "See where you are in the process.",
      dashboardSection: 'status',
      requiresSidebar: false,
    },
    {
      targetId: "deadline-dropdown",
      title: "Estamated Timeline (IMPORTANT)",
      description: "This is where you see who is waiting on who, and how much time each side has to submit documents.",
      dashboardSection: 'status',
      requiresSidebar: false,
    },
    {
      targetId: "notifications",
      title: "Notifications",
      description: "View important notifications and HR admin access requests.",
      dashboardSection: 'notifications',
      requiresSidebar: true,
    },
    {
      targetId: "grant-access",
      title: "Grant Access",
      description: "You must accept an HR admin's access request to give them your restorative record.",
      dashboardSection: 'notifications',
      requiresSidebar: false,
    },
    {
      targetId: "legal-resources",
      title: "Legal Resources",
      description: "Access information about your rights in fair chance hiring or file a complaint.",
      dashboardSection: "legal-resources",
      requiresSidebar: true,
    },
    {
      targetId: "settings",
      title: "Settings",
      description: "Make changes to your profile",
      dashboardSection: "settings",
      requiresSidebar: true,
    },
    {
      targetId: "my-restorative-record-btn",
      title: "My Restorative Record",
      description: "Preview your completed restorative record at any time.",
      dashboardSection: null,
      requiresSidebar: false,
    },
    {
      targetId: "record-builder-section",
      title: "Record Builder Sidebar",
      description: "This is the Record Builder. Here you can see all the sections you need to complete for your restorative record. Required sections are at the top, recommended sections below.",
      dashboardSection: null,
      requiresSidebar: true,
    },
    {
      targetId: "record-builder-introduction",
      title: "Introduction (Required)",
      description: "Start by telling your story in the Introduction section. Click here to begin.",
      dashboardSection: null,
      requiresSidebar: true,
    },
    {
      targetId: "record-builder-community-engagement",
      title: "Community Engagement (Required)",
      description: "Share your community involvement and contributions.",
      dashboardSection: null,
      requiresSidebar: true,
    },
    {
      targetId: "record-builder-rehabilitative-programs",
      title: "Rehabilitative Programs (Required)",
      description: "List any rehabilitative or educational programs you've completed.",
      dashboardSection: null,
      requiresSidebar: true,
    },
    {
      targetId: "record-builder-education",
      title: "Education (Recommended)",
      description: "Add your educational background.",
      dashboardSection: null,
      requiresSidebar: true,
    },
    {
      targetId: "record-builder-employment-history",
      title: "Employment History (Recommended)",
      description: "Document your work experience.",
      dashboardSection: null,
      requiresSidebar: true,
    },
    {
      targetId: "record-builder-skills",
      title: "Skills (Recommended)",
      description: "Highlight your skills and certifications.",
      dashboardSection: null,
      requiresSidebar: true,
    },
    {
      targetId: "record-builder-microcredentials",
      title: "Microcredentials (Recommended)",
      description: "Showcase any microcredentials or badges earned.",
      dashboardSection: null,
      requiresSidebar: true,
    },
    {
      targetId: "record-builder-mentors",
      title: "Mentors (Recommended)",
      description: "List mentors who have supported your journey.",
      dashboardSection: null,
      requiresSidebar: true,
    },
    {
      targetId: "record-builder-personal-achievements",
      title: "Personal Achievements (Recommended)",
      description: "Share your awards and personal achievements.",
      dashboardSection: null,
      requiresSidebar: true,
    },
    {
      targetId: "record-builder-hobbies",
      title: "Hobbies (Recommended)",
      description: "Add your hobbies and interests.",
      dashboardSection: null,
      requiresSidebar: true,
    },
  ];

  function TutorialTooltip({ step, onNext, onBack, onClose, showBack, isLastStep, hideControls = false }: { step: any; onNext: () => void; onBack: () => void; onClose: () => void; showBack: boolean; isLastStep: boolean; hideControls?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);

    // Helper to position the tooltip
    const positionTooltip = () => {
      const target = document.getElementById(step.targetId);
      if (target && ref.current) {
        const rect = target.getBoundingClientRect();
        ref.current.style.position = "fixed";

        // Calculate tooltip dimensions
        const tooltipHeight = ref.current.offsetHeight || 180;
        const tooltipWidth = ref.current.offsetWidth || 320;

        // Vertical positioning: try to position below, fallback to above if not enough space
        const top = rect.bottom + 12 + tooltipHeight < window.innerHeight
          ? rect.bottom + 12
          : Math.max(rect.top - tooltipHeight - 12, 12);

        // Horizontal positioning: try to align with target, adjust if tooltip would overflow
        let left;
        if (step.targetId === "assessment-progress" || step.targetId === "deadline-dropdown") {
          // Center horizontally relative to the target
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          // Clamp to viewport
          if (left + tooltipWidth > window.innerWidth) {
            left = window.innerWidth - tooltipWidth - 12;
          }
          if (left < 12) {
            left = 12;
          }
        } else {
          // Default horizontal positioning
          left = rect.left;
          if (left + tooltipWidth > window.innerWidth) {
            left = Math.max(rect.right - tooltipWidth, 12);
          }
          if (left < 12) {
            left = 12;
          }
        }

        ref.current.style.top = `${top}px`;
        ref.current.style.left = `${left}px`;
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
        {!hideControls && (
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="text-sm px-2 py-1 rounded bg-gray-200">Close</button>
            {showBack && (
              <button onClick={onBack} className="text-sm px-2 py-1 rounded bg-gray-200">Back</button>
            )}
            <button onClick={onNext} className="text-sm px-2 py-1 rounded bg-red-500 text-white">
              {isLastStep ? 'Done' : 'Next'}
            </button>
          </div>
        )}
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

  // Get user and profile on mount
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Fetch user profile to get location and name data
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, city, state, phone, address_line1, zip_code, birthday')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      }
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
      const hrAdminIds = permissions.map((p: Permission) => p.hr_admin_id);
      const { data: hrProfiles, error: profileError } = await supabase
        .from("hr_admin_profiles")
        .select("id, first_name, last_name, company, email")
        .in("id", hrAdminIds);

      if (profileError) throw profileError;

      // Combine permission and profile data
      const connectedAdmins = hrProfiles?.map((profile: HRAdminProfile) => {
        const permission = permissions.find((p: Permission) => p.hr_admin_id === profile.id);
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
      const allAdmins = hrProfiles?.map((profile: HRAdminProfile) => {
        const permission = permissions?.find((p: Permission) => p.hr_admin_id === profile.id);
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
  const generateNotifications = (admins: HRAdminWithAccess[]) => {
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
        timestamp: admin.granted_at || new Date().toISOString(),
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
    if (file) {
      awardsHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
    } else {
      awardsHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
    }
  };

  const handleSkillsFileChange = (file: File | null) => {
    if (file) {
      skillsHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
    } else {
      skillsHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
    }
  };

  const handleEngagementFileChange = (file: File | null) => {
    if (file) {
      engagementHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
    } else {
      engagementHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
    }
  };

  const handleMicroFileChange = (file: File | null) => {
    if (file) {
      microHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
    } else {
      microHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
    }
  };

  const handleEducationFileChange = (file: File | null) => {
    if (file) {
      educationHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
    } else {
      educationHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
    }
  };

  const handleHobbiesFileChange = (file: File | null) => {
    if (file) {
      hobbiesHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
    } else {
      hobbiesHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
      });
    }
  };

  const handleRehabFileChange = (file: File | null) => {
    if (file) {
      rehabHook.updateForm({
        file,
        filePreview: createFilePreview(file),
        fileName: file.name,
        fileSize: file.size,
      });
    } else {
      rehabHook.updateForm({
        file: null,
        filePreview: "",
        fileName: undefined,
        fileSize: undefined,
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
  const handleSaveToSupabase = async (introductionOverride?: Introduction) => {
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
    { id: 'progress', label: 'Progress Tracking', icon: <img src={currentView === 'dashboard' && activeDashboardSection === 'progress' ? "/dashboard_icons/progress-white.svg" : "/dashboard_icons/progress.svg"} alt="Status Updates" className="w-5 h-5" /> },
    { id: 'status', label: 'Status Updates', icon: <img src={currentView === 'dashboard' && activeDashboardSection === 'status' ? "/dashboard_icons/status-updates-white.svg" : "/dashboard_icons/status-updates.svg"} alt="Status Updates" className="w-5 h-5" /> },
    { id: 'incentives-hub', label: 'Incentives Hub', icon: <svg className="w-5 h-5" fill="none" stroke={currentView === 'dashboard' && activeDashboardSection === 'incentives-hub' ? "white" : "currentColor"} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'pre-screening', label: 'Pre Screening Activities', icon: <svg className="w-5 h-5" fill="none" stroke={currentView === 'dashboard' && activeDashboardSection === 'pre-screening' ? "white" : "currentColor"} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
    { id: 'notifications', label: 'Notifications', icon: <img src={currentView === 'dashboard' && activeDashboardSection === 'notifications' ? "/dashboard_icons/notifications-white.svg" : "/dashboard_icons/notifications.svg"} alt="Notifications" className="w-5 h-5" /> },
    { id: 'legal-resources', label: 'Legal Resources', icon: <img src={currentView === 'dashboard' && activeDashboardSection === 'legal-resources' ? "/dashboard_icons/legal-resources-white.svg" : "/dashboard_icons/legal-resources.svg"} alt="Legal Resources" className="w-5 h-5" />, alt: "Legal Resources" },
    { id: 'settings', label: 'Settings', icon: <img src={currentView === 'dashboard' && activeDashboardSection === 'settings' ? "/dashboard_icons/settings-white.svg" : "/dashboard_icons/settings.svg"} alt="Settings" className="w-5 h-5" />, alt: "Settings" }
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
            <div className="glass-strong rounded-3xl p-4 lg:p-6 bg-white/60 shadow-lg">
              <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Continue Building */}
                <button
                  id="continue-building-btn"
                  onClick={() => {
                    // Find the first incomplete section
                    const firstIncompleteIdx = categories.findIndex(cat => !sectionCompletion[cat]);
                    if (firstIncompleteIdx !== -1) {
                      handleBuilderNavigation(firstIncompleteIdx);
                    } else {
                      handleBuilderNavigation(currentCategory);
                    }
                  }}
                  className="w-full p-4 glass-hover rounded-2xl text-center smooth-transition border border-gray-200 hover:shadow-lg sm:col-span-2 md:col-span-1"
                >
                  <span className="flex justify-center items-center mb-2">
                    <img src="/dashboard_icons/continue-building.svg" alt="Progress" className="w-10 h-10" />
                  </span>
                  <span className="font-medium text-black">Continue Building</span>
                </button>
                {/* Preview Record */}
                <button
                  id="preview-record-btn"
                  onClick={handleViewProfile}
                  className="w-full p-4 glass-hover rounded-2xl text-center smooth-transition border border-gray-200 hover:shadow-lg"
                >
                  <span className="flex justify-center items-center mb-2">
                    <img src="dashboard_icons/preview.svg" alt="Preview" className="w-10 h-10" />
                  </span>
                  <span className="font-medium text-black">Preview Record</span>
                </button>
                {/* Check Status */}
                <button
                  id="check-status-btn"
                  onClick={() => handleDashboardNavigation('status')}
                  className="w-full p-4 glass-hover rounded-2xl text-center smooth-transition border border-gray-200 hover:shadow-lg"
                >
                  <span className="flex justify-center items-center mb-2">
                    <img src="/dashboard_icons/check-status.svg" alt="Check Status" className="w-10 h-10" />
                  </span>
                  <span className="font-medium text-black">Check Status</span>
                </button>
              </div>
            </div>
            <div className="glass-strong rounded-3xl p-4 lg:p-6 bg-white/60 shadow-lg">
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4">Your Restorative Record Progress</h2>

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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {categories.map((cat, idx) => (
                  <div key={cat} className="glass rounded-2xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-black">
                        {cat.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h3>
                      <div className="flex items-center gap-2">
                        {sectionCompletion[cat] && (
                          <span className="text-green-600 text-sm ml-3" style={{ color: '#16A34A' }}>✓</span>
                        )}
                        <button
                          onClick={() => handleBuilderNavigation(idx)}
                          className="text-sm px-3 py-1 rounded-lg smooth-transition hover:opacity-90"
                          style={{
                            color: '#E54747',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA'
                          }}
                        >
                          {sectionCompletion[cat] ? 'Review' : 'Start'}
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
            <div className="glass-strong rounded-3xl p-4 lg:p-6 bg-white/60 shadow-lg">
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4">HR Admin Status Updates</h2>

              {/* Connected HR Admins */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-black mb-4">Connected HR Admins</h3>
                <div className="space-y-3">
                  {connectedHRAdmins.length > 0 ? (
                    connectedHRAdmins.map((admin) => (
                      <div key={admin.id} className="glass rounded-2xl border border-gray-200">
                        {/* Always Visible Header */}
                        <div className="flex items-center justify-between gap-3 p-4">
                          <div className="flex items-center gap-3">
                            <div>
                              {/* Company Name */}
                              <h5 className="font-medium text-black truncate max-w-[140px] block sm:hidden" title={admin.company}>{admin.company}</h5>
                              <h5 className="font-medium text-black hidden sm:block">{admin.company}</h5>
                              {/* HR Admin Name */}
                              <p className="text-sm truncate max-w-[140px] block sm:hidden" style={{ color: '#595959' }} title={`${admin.first_name} ${admin.last_name}`}>{admin.first_name} {admin.last_name}</p>
                              <p className="text-sm hidden sm:block" style={{ color: '#595959' }}>
                                {admin.first_name} {admin.last_name}
                              </p>
                              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                                Connected {admin.granted_at ? new Date(admin.granted_at).toLocaleDateString() : 'recently'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="inline-flex text-center items-center px-2 py-1 rounded-full text-xs font-medium" style={{
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
                              id="admin-details-btn"
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
                              <h6 className="font-semibold text-black mb-1">Assessment Progress</h6>
                              <div id="assessment-progress" className="space-y-3">
                                <div className="flex flex-col items-right sm:flex-row sm:items-center justify-between text-sm">
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
                                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-1 text-xs relative">
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
                            <div id="deadline-dropdown" className="border rounded-lg" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
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
            <div className="glass-strong rounded-3xl p-4 lg:p-6 bg-white/60 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-xl lg:text-2xl font-semibold text-black">Notifications</h2>
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
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-black mb-1">{notification.title}</h3>
                          <p className="text-sm mb-2" style={{ color: '#595959' }}>
                            {notification.message}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs" style={{ color: '#9CA3AF' }}>
                            <span>
                              {new Date(notification.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              {notification.admin.email}
                            </span>
                          </div>
                        </div>

                        {notification.type === 'request' && (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:ml-4">
                                                          <button
                                id="grant-access"
                                onClick={() => handleHRAdminPermission(notification.adminId, true)}
                                disabled={processingPermission === notification.adminId}
                                className="px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 w-full sm:w-auto"
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
                                className="px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 hover:opacity-90 disabled:opacity-50 w-full sm:w-auto"
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
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:ml-4">
                            <button
                              onClick={() => handleHRAdminPermission(notification.adminId, false)}
                              disabled={processingPermission === notification.adminId}
                              className="px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 hover:opacity-90 disabled:opacity-50 w-full sm:w-auto"
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
                              className="px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 hover:opacity-90 w-full sm:w-auto"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                              {/* Company Name */}
                              <h5 className="font-medium text-black truncate max-w-[140px] block sm:hidden" title={admin.company}>{admin.company}</h5>
                              <h5 className="font-medium text-black hidden sm:block">{admin.company}</h5>
                              {/* HR Admin Name and Email */}
                              <p className="text-sm truncate max-w-[140px] block sm:hidden" style={{ color: '#595959' }} title={`${admin.first_name} ${admin.last_name} • ${admin.email}`}>{admin.first_name} {admin.last_name} • {admin.email}</p>
                              <p className="text-sm hidden sm:block" style={{ color: '#595959' }}>
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
                              {/* Company Name */}
                              <h5 className="font-medium text-black truncate max-w-[140px] block sm:hidden" title={notification.admin.company}>{notification.admin.company}</h5>
                              <h5 className="font-medium text-black hidden sm:block">{notification.admin.company}</h5>
                              {/* HR Admin Name and Email */}
                              <p className="text-sm truncate max-w-[140px] block sm:hidden" style={{ color: '#595959' }} title={`${notification.admin.first_name} ${notification.admin.last_name} • ${notification.admin.email}`}>{notification.admin.first_name} {notification.admin.last_name} • {notification.admin.email}</p>
                              <p className="text-sm hidden sm:block" style={{ color: '#595959' }}>
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

        {/* Legal Resources Section */ }
      case 'legal-resources':
        const legalResources = getLegalResourcesByJurisdiction(
          userProfile?.state,
          userProfile?.city
        );
        
        return (
          <div className="space-y-6">
            {/* Legal Resources by Jurisdiction */}
            <LegalResourcesDisplay 
              resources={legalResources}
              userState={userProfile?.state}
              userCity={userProfile?.city}
            />

            {/* Contact Legal Partners Form */}
            <div className="glass-strong rounded-3xl p-4 lg:p-6 bg-white/60 shadow-lg">
              <div className="w-full">
                <div className="p-4 lg:p-6">
                  <h2 className="text-xl font-bold mb-3 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Contact Our Legal Partners
                  </h2>
                  <div className="mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <p className="mb-3 leading-relaxed text-sm">
                      If you believe you have experienced employment discrimination or need personalized legal assistance, you can contact our partnered legal professionals. Your inquiry will be sent to appropriate legal experts in your jurisdiction.
                    </p>
                    <ul className="list-disc pl-5 text-xs mb-3 space-y-1" style={{ color: '#595959' }}>
                      <li>Free initial consultation available through our partners</li>
                      <li>Confidential review of your situation</li>
                      <li>Guidance on filing complaints with appropriate agencies</li>
                      <li>Representation if your case moves forward</li>
                    </ul>
                  </div>
                  {legalSubmitted ? (
                    <div className="text-center py-8 px-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', color: '#059669', fontFamily: 'Poppins, sans-serif' }}>
                      <div className="text-base font-medium mb-2">Thank you!</div>
                      <div className="text-sm">Your request has been submitted. A legal professional will contact you within 2-3 business days.</div>
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

      case 'incentives-hub':
        return (
          <div className="space-y-8">
            {/* Header with Icon */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Candidate Incentives Hub
              </h1>
              <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Access tax benefits and opportunities to maximize your financial potential.
              </p>
            </div>

            {/* Your Activities Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-black mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Your Activities
              </h2>

              {/* WOTC Survey Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-black mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      WOTC Survey
                    </h3>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      WOTC Survey Completed - Employers will contact you directly if you qualify
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setWotcStep(0);
                    setShowWotcModal(true);
                  }}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit WOTC Survey
                </button>
              </div>
            </div>
          </div>
        )

      case 'pre-screening':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-2">
              <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Track your pre-employment screening progress and requirements
              </p>
            </div>

            {/* Partner Companies Section */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Partner Companies
              </h2>
              <p className="text-gray-600 text-sm mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Below are companies that we have partnerships with. If you want to be prescreened for these companies please click to start their assessment.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* JBM Packaging Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          JBM Packaging
                        </h3>
                        <p className="text-sm text-gray-500">Manufacturing</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      New
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Complete JBM Packaging's pre-screening assessment to be considered for their open positions.
                  </p>

                  {/* Assessment Items */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-green-600 font-medium">JBM Packaging Math Assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-yellow-600 font-medium">JBM Packaging Preemployment Screening Questionnaire</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-green-600 font-medium">JBM Upload Resume</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-green-600 font-medium">JBM Personality Test</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // Pre-populate with existing data from user profile
                      setPreScreeningData({
                        firstName: userProfile?.first_name || "",
                        lastName: userProfile?.last_name || "",
                        phoneNumber: userProfile?.phone || "",
                        dateOfBirth: userProfile?.birthday || "",
                        address: userProfile?.address_line1 || "",
                        city: userProfile?.city || "",
                        state: userProfile?.state || "",
                        zipCode: userProfile?.zip_code || "",
                      });
                      setPreScreeningStep(1);
                      setShowPreScreeningModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Start Assessment
                  </button>
                </div>

                {/* More Partners Coming Soon Card */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 border-dashed p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        More Partners
                      </h3>
                      <p className="text-sm text-gray-400">Coming Soon</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Additional partner companies will be added here as they join the platform.
                  </p>

                  <button
                    disabled
                    className="w-full px-4 py-3 bg-gray-200 text-gray-400 font-medium rounded-xl cursor-not-allowed"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Coming Soon
                  </button>
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
    // NEW: If the tutorial step targets a Record Builder category, switch to builder view and set the correct category
    if (tutorialStep) {
      const step = tutorialSteps[tutorialStep - 1];
      if (step.targetId && step.targetId.startsWith('record-builder-')) {
        // Extract the category name from the targetId
        const cat = step.targetId.replace('record-builder-', '');
        const idx = categories.findIndex(c => c === cat);
        if (idx !== -1) {
          setCurrentView('builder');
          setCurrentCategory(idx);
        }
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative w-full sm:w-auto">
      <button
        id="my-restorative-record-btn"
        onClick={handleViewProfile}
        className="px-4 lg:px-5 py-2 text-sm lg:text-base font-medium rounded-xl shadow hover:opacity-90 text-white text-center"
        style={{ backgroundColor: '#E54747' }}
      >
        <span className="inline">MY RESTORATIVE RECORD</span>
      </button>
      <div className="relative">
        <button
          onClick={() => {
            // On mobile, directly start tutorial. On desktop, toggle dropdown
            if (window.innerWidth < 1024) {
              startTutorial();
              setHoverTutorialActive(false);
            } else {
              setHelpMenuOpen((v) => !v);
            }
          }}
          className="px-4 lg:px-5 py-2 text-sm lg:text-base font-medium rounded-xl shadow hover:opacity-90 border w-full sm:w-auto text-center"
          style={{ color: '#E54747', backgroundColor: '#FFFFFF', borderColor: '#E54747', fontFamily: 'Poppins, sans-serif' }}
          title="Help & Hints"
        >
          Help
        </button>
        {helpMenuOpen && (
          <div className="hidden lg:block absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-xl z-50" style={{ borderColor: '#E5E5E5', fontFamily: 'Poppins, sans-serif' }}>
            {/* Caret/triangle */}
            <div style={{ position: 'absolute', top: '-10px', right: '16px', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '10px solid #E5E5E5' }} />
            <div style={{ position: 'absolute', top: '-8px', right: '17px', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '9px solid #fff' }} />
            <button
              className="block w-full text-left px-5 py-3 rounded-xl transition-all duration-150 hover:bg-red-50 text-black font-medium"
              style={{ fontFamily: 'Poppins, sans-serif', color: '#E54747', borderBottom: '1px solid #F3F4F6' }}
              onClick={() => {
                setHelpMenuOpen(false);
                startTutorial();
                setHoverTutorialActive(false);
              }}
            >
              Step-by-step Tutorial
            </button>
            <button
              className="block w-full text-left px-5 py-3 rounded-xl transition-all duration-150 hover:bg-red-50 text-black font-medium"
              style={{ fontFamily: 'Poppins, sans-serif', color: '#E54747' }}
              onClick={() => {
                setHelpMenuOpen(false);
                setHoverTutorialActive(true);
                setTutorialStep(null);
              }}
            >
              Hover Hints
            </button>
          </div>
        )}
      </div>
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

  // Automatically open first HR admin details when tutorial step is 'admin-details-btn'
  useEffect(() => {
    // TODO: Change this to a switch case?
    if (
      tutorialStep &&
      tutorialSteps[tutorialStep - 1]?.targetId === 'assessment-progress' &&
      connectedHRAdmins.length > 0
    ) {
      const firstAdminId = connectedHRAdmins[0]?.id;
      if (firstAdminId && !expandedHRAdmins[firstAdminId]) {
        toggleHRAdminDetails(firstAdminId);
      }
    } else if (
      tutorialStep &&
      tutorialSteps[tutorialStep - 1]?.targetId === 'admin-details-btn' &&
      connectedHRAdmins.length === 0
    ) {
      {/* CURRENTLY SKIPS HR PORTION IF 0 CONNECTED (HARD CODED) */ }
      setTutorialStep(9)
    } else if (
      tutorialStep &&
      tutorialSteps[tutorialStep - 1]?.targetId === 'deadline-dropdown'
    ) {
      // Expand the timeline for the first HR admin
      if (connectedHRAdmins.length > 0) {
        const firstAdminId = connectedHRAdmins[0]?.id;
        if (firstAdminId && !expandedTimeline[firstAdminId]) {
          setExpandedTimeline(prev => ({ ...prev, [firstAdminId]: true }));
        }
      }
    } else if (
      tutorialStep &&
      tutorialSteps[tutorialStep - 1]?.targetId === 'grant-access'
    ) {
      let skip_grant_access = true
      for (let admin of allHRAdmins) {
        if (!admin.hasAccess) {
          skip_grant_access = false
        }
      }
      if (skip_grant_access) {
        setTutorialStep(tutorialStep + 1)
      }
    }
  }, [tutorialStep, connectedHRAdmins]);

  // Add effect to attach hover listeners when hoverTutorialActive is true
  useEffect(() => {
    if (!hoverTutorialActive) return;
    // For each tutorial step, add listeners to the element with the matching id
    const listeners: { el: HTMLElement, enter: any, leave: any }[] = [];
    tutorialSteps.forEach((step, idx) => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const enter = () => setHoverTutorialStep(idx);
        const leave = () => setHoverTutorialStep(null);
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
        listeners.push({ el, enter, leave });
      }
    });
    return () => {
      listeners.forEach(({ el, enter, leave }) => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, [hoverTutorialActive, tutorialSteps]);

  // Render the hover tutorial tooltip if active
  {
    hoverTutorialActive && hoverTutorialStep !== null && (
      <TutorialTooltip
        step={tutorialSteps[hoverTutorialStep]}
        onNext={() => setHoverTutorialStep(null)}
        onBack={() => setHoverTutorialStep(null)}
        onClose={() => setHoverTutorialStep(null)}
        showBack={false}
        isLastStep={false}
        hideControls={true}
      />
    )
  }

  // Fix: Restore body scroll if resizing to desktop while menu is open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Always unlock scroll on desktop
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      } else if (mobileMenuOpen) {
        // If menu is open and we're on mobile, lock scroll
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.body.dataset.scrollY = scrollY.toString();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // --- MOBILE TUTORIAL LOGIC (REDONE FOR RELIABILITY) ---
  // Effect 1: Open/close the sidebar as needed for the current tutorial step
  useEffect(() => {
    if (!tutorialStep) return;
    const step = tutorialSteps[tutorialStep - 1];
    if (!step) return;
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (step.requiresSidebar && !mobileMenuOpen) {
        setMobileMenuOpen(true);
      } else if (!step.requiresSidebar && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
  }, [tutorialStep]);

  // Effect 2: Only after the sidebar is open (if needed), search for the target element and set tooltipReady
  useEffect(() => {
    setTooltipReady(false);
    if (!tutorialStep) return;
    const step = tutorialSteps[tutorialStep - 1];
    if (!step) return;

    // Helper to search for the element and set tooltipReady
    function searchForTargetElement() {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      let observer: MutationObserver | undefined;
      let attempts = 0;
      const maxAttempts = 20;
      function tryFind() {
        const el = document.getElementById(step.targetId);
        if (el) {
          // Scroll into view on mobile
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          setTimeout(() => setTooltipReady(true), 80); // Give a paint frame
          if (observer) observer.disconnect();
          return;
        }
        if (attempts < maxAttempts) {
          attempts++;
          timeoutId = setTimeout(tryFind, 120);
        } else if (observer) {
          observer.disconnect();
        }
      }
      observer = new MutationObserver(() => {
        const el = document.getElementById(step.targetId);
        if (el) {
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          setTimeout(() => setTooltipReady(true), 80);
          if (observer) observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      tryFind();
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (observer) observer.disconnect();
      };
    }

    // If step requires sidebar on mobile, only search after menu is open
    if (step.requiresSidebar && typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (!mobileMenuOpen) return; // Wait for menu to open
      // Add a short delay to ensure sidebar is painted
      const delay = setTimeout(() => {
        const cleanup = searchForTargetElement();
        // Clean up function
        return cleanup;
      }, 180);
      return () => clearTimeout(delay);
    } else {
      // For non-sidebar steps or desktop, search immediately
      return searchForTargetElement();
    }
  }, [tutorialStep, mobileMenuOpen]);

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Mobile Header */}
      <div className="lg:hidden glass border-b border-gray-200/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-black">My Rézme Dashboard</h1>
            <p className="text-xs" style={{ color: '#595959' }}>
              Track your progress and manage your restorative record
            </p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-50"
            style={{ border: '1px solid #E5E5E5' }}
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation with Glass Effect */}
        <nav className={`${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 right-0 z-40 w-80 glass border-l border-gray-200/50 min-h-screen p-6 transition-transform duration-300 ease-in-out lg:transition-none overflow-y-auto`}>
          <div className={`flex flex-col ${mobileMenuOpen ? 'pb-16' : 'pb-0'}`}> {/* Add extra bottom padding only when mobile menu is open */}
            <div>
              {/* Dashboard Header */}
              <div className="mb-6 hidden lg:block">
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
                        className={`w-full text-left px-4 py-3 rounded-2xl smooth-transition flex items-center gap-3 ${currentView === 'dashboard' && activeDashboardSection === section.id
                          ? "text-white font-medium bg-black shadow-md"
                          : "text-black glass-hover"
                          }`}
                        onClick={() => {
                          handleDashboardNavigation(section.id);
                          setMobileMenuOpen(false);
                        }}
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
                <h3 id="record-builder-section" className="text-sm font-semibold text-black mb-3 uppercase tracking-wider">Record Builder</h3>
                {/* Required Sections */}
                <div className="mb-2">
                  <div className="text-xs font-semibold text-gray-500 mb-1 pl-1 tracking-wider">Required</div>
                  <ul className="space-y-1">
                    {categories.map((cat, idx) => (
                      ["introduction", "community-engagement", "rehabilitative-programs"].includes(cat) ? (
                        <li key={cat}>
                          <button
                            id={`record-builder-${cat}`}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'builder' && idx === currentCategory
                              ? "bg-red-50 font-medium border"
                              : "hover:bg-gray-50"
                              }`}
                            style={{
                              color: currentView === 'builder' && idx === currentCategory ? '#E54747' : '#000000',
                              borderColor: currentView === 'builder' && idx === currentCategory ? '#E54747' : 'transparent'
                            }}
                            onClick={() => {
                              handleBuilderNavigation(idx);
                              setMobileMenuOpen(false);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                {cat
                                  .replace(/-/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                              {sectionCompletion[cat] && (
                                <span className="text-green-600 text-sm ml-3" style={{ color: '#16A34A' }}>✓</span>
                              )}
                            </div>
                          </button>
                        </li>
                      ) : null
                    ))}
                  </ul>
                </div>
                {/* Recommended Sections */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1 pl-1 tracking-wider">Recommended</div>
                  <ul className="space-y-1">
                    {categories.map((cat, idx) => (
                      !["introduction", "community-engagement", "rehabilitative-programs"].includes(cat) ? (
                        <li key={cat}>
                          <button
                            id={`record-builder-${cat}`}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'builder' && idx === currentCategory
                              ? "bg-red-50 font-medium border"
                              : "hover:bg-gray-50"
                              }`}
                            style={{
                              color: currentView === 'builder' && idx === currentCategory ? '#E54747' : '#000000',
                              borderColor: currentView === 'builder' && idx === currentCategory ? '#E54747' : 'transparent'
                            }}
                            onClick={() => {
                              handleBuilderNavigation(idx);
                              setMobileMenuOpen(false);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                {cat
                                  .replace(/-/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                              {sectionCompletion[cat] && (
                                <span className="text-green-600 text-sm ml-3" style={{ color: '#16A34A' }}>✓</span>
                              )}
                            </div>
                          </button>
                        </li>
                      ) : null
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* Mobile Menu Close X (top right) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors z-50"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 w-full">
          <div className="max-w-6xl mx-auto">
            {currentView === 'dashboard' ? (
              <>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-semibold text-black">
                      {dashboardSections.find(s => s.id === activeDashboardSection)?.label}
                    </h1>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {ButtonGroup}
                  </div>
                </div>
                {renderDashboardContent()}
              </>
            ) : (
              <>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
                  <h1 className="text-2xl lg:text-3xl font-semibold text-black">
                    Restorative Record Builder
                  </h1>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {ButtonGroup}
                  </div>
                </div>
                <div className="mb-8">{renderSection()}</div>
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={currentCategory === 0}
                    className="px-4 lg:px-6 py-3 border text-sm lg:text-base font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
                      className="px-4 lg:px-6 py-3 text-sm lg:text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90 text-white w-full sm:w-auto"
                      style={{ backgroundColor: '#E54747' }}
                    >
                      Submit
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-4 lg:px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 w-full sm:w-auto"
                    >
                      Save
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 lg:p-6 max-w-md w-full mx-4">
            <h3 className="text-lg lg:text-xl font-semibold mb-3 text-black">
              Complete Your Restorative Record
            </h3>
            <p className="mb-6 text-sm lg:text-base" style={{ color: '#595959' }}>
              Please complete the Restorative Record to use this feature. You
              must go through all sections and submit your record before viewing
              your profile.
            </p>
            <button
              onClick={() => setShowIncompleteModal(false)}
              className="w-full px-4 py-2 text-sm lg:text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90 text-white"
              style={{ backgroundColor: '#E54747' }}
            >
              Continue Building Your Restorative Record
            </button>
          </div>
        </div>
      )}

      {/* Pre-Screening Assessment Questionnaire Modal */}
      {showPreScreeningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-md w-full mx-4 animate-fade-in">
            {/* Step 1: First Name (Confirm) */}
            {preScreeningStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-black mb-2">Confirm your first name</h2>
                  <p className="text-gray-500 text-sm">Let's make sure we have your information correct.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">First Name</label>
                  <input
                    type="text"
                    value={preScreeningData.firstName}
                    onChange={(e) => setPreScreeningData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setPreScreeningStep(2)}
                  disabled={!preScreeningData.firstName.trim()}
                  className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                    preScreeningData.firstName.trim()
                      ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
                <button
                  onClick={() => setShowPreScreeningModal(false)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Step 2: Last Name */}
            {preScreeningStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-black mb-2">What's your last name?</h2>
                  <p className="text-gray-500 text-sm">We need this for your assessment profile.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Last Name</label>
                  <input
                    type="text"
                    value={preScreeningData.lastName}
                    onChange={(e) => setPreScreeningData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setPreScreeningStep(3)}
                  disabled={!preScreeningData.lastName.trim()}
                  className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                    preScreeningData.lastName.trim()
                      ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
                <button
                  onClick={() => setPreScreeningStep(1)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 3: Phone Number */}
            {preScreeningStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-black mb-2">What's your phone number?</h2>
                  <p className="text-gray-500 text-sm">We may need to contact you about your assessment.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={preScreeningData.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      let formatted = value;
                      if (value.length > 3 && value.length <= 6) {
                        formatted = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                      } else if (value.length > 6) {
                        formatted = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                      }
                      setPreScreeningData(prev => ({ ...prev, phoneNumber: formatted }));
                    }}
                    placeholder="(555) 555-5555"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                    autoFocus
                    maxLength={14}
                  />
                </div>
                <button
                  onClick={() => setPreScreeningStep(4)}
                  disabled={preScreeningData.phoneNumber.replace(/\D/g, "").length < 10}
                  className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                    preScreeningData.phoneNumber.replace(/\D/g, "").length >= 10
                      ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
                <button
                  onClick={() => setPreScreeningStep(2)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 4: Date of Birth */}
            {preScreeningStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-black mb-2">What's your date of birth?</h2>
                  <p className="text-gray-500 text-sm">This is required for the pre-screening process.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={preScreeningData.dateOfBirth}
                    onChange={(e) => setPreScreeningData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setPreScreeningStep(5)}
                  disabled={!preScreeningData.dateOfBirth}
                  className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                    preScreeningData.dateOfBirth
                      ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
                <button
                  onClick={() => setPreScreeningStep(3)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 5: Address */}
            {preScreeningStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-black mb-2">What's your street address?</h2>
                  <p className="text-gray-500 text-sm">Enter your current street address.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Street Address</label>
                  <input
                    type="text"
                    value={preScreeningData.address}
                    onChange={(e) => setPreScreeningData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setPreScreeningStep(6)}
                  disabled={!preScreeningData.address.trim()}
                  className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                    preScreeningData.address.trim()
                      ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
                <button
                  onClick={() => setPreScreeningStep(4)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 6: City (Confirm) */}
            {preScreeningStep === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-black mb-2">Confirm your city</h2>
                  <p className="text-gray-500 text-sm">Make sure your city is correct.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">City</label>
                  <input
                    type="text"
                    value={preScreeningData.city}
                    onChange={(e) => setPreScreeningData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter your city"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setPreScreeningStep(7)}
                  disabled={!preScreeningData.city.trim()}
                  className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                    preScreeningData.city.trim()
                      ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
                <button
                  onClick={() => setPreScreeningStep(5)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 7: State */}
            {preScreeningStep === 7 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-black mb-2">What state do you live in?</h2>
                  <p className="text-gray-500 text-sm">Select your state of residence.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">State</label>
                  <input
                    type="text"
                    value={preScreeningData.state}
                    onChange={(e) => setPreScreeningData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="e.g. California, TX, New York"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setPreScreeningStep(8)}
                  disabled={!preScreeningData.state.trim()}
                  className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                    preScreeningData.state.trim()
                      ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
                <button
                  onClick={() => setPreScreeningStep(6)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 8: Zip Code */}
            {preScreeningStep === 8 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-black mb-2">What's your zip code?</h2>
                  <p className="text-gray-500 text-sm">Almost done! Enter your zip code.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={preScreeningData.zipCode}
                    onChange={(e) => setPreScreeningData(prev => ({ ...prev, zipCode: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                    placeholder="12345"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                    autoFocus
                    maxLength={5}
                  />
                </div>
                <button
                  onClick={() => {
                    // Save the data and proceed to assessment
                    toast.success("Profile information saved! Starting assessment...");
                    setShowPreScreeningModal(false);
                    // Here you would save to database and redirect to actual assessment
                  }}
                  disabled={preScreeningData.zipCode.length < 5}
                  className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                    preScreeningData.zipCode.length >= 5
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Start Assessment
                </button>
                <button
                  onClick={() => setPreScreeningStep(7)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WOTC Survey Modal */}
      {showWotcModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-md w-full mx-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Step 0: Instructions */}
            {wotcStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2">Candidate Instructions</h2>
                </div>
                
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    This survey asks a few questions about your background and work history. <strong className="text-black">It is critical that you answer them honestly.</strong>
                  </p>
                  <p>
                    Your answers help your employer check whether they may qualify for hiring incentives and tax credits that support people getting back to work. These programs are set by the government.
                  </p>
                  
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>There are no right or wrong answers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Your answers will not affect whether you get the job</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Some questions may not apply to you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>If you are not sure about a question, it is okay to choose "Not sure"</span>
                    </li>
                  </ul>
                  
                  <p>
                    You may see questions about past work, benefits, or programs you were part of. These questions are required to complete government forms after someone is hired.
                  </p>
                  <p className="font-medium text-black">
                    This survey usually takes only a few minutes. Please answer as best you can.
                  </p>
                </div>

                <button
                  onClick={() => setWotcStep(1)}
                  className="w-full py-4 px-4 font-semibold rounded-full bg-black text-white hover:bg-gray-800 shadow-lg transition-all duration-200"
                >
                  Start Survey
                </button>
                <button
                  onClick={() => setShowWotcModal(false)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Step 1: Conditional Certificate */}
            {wotcStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-black mb-2">Conditional Certificate</h2>
                  <p className="text-gray-500 text-sm">Question 1 of 11</p>
                </div>
                <p className="text-gray-700 text-center">
                  Before you were offered this job, did a government agency or workforce program give you a written "conditional certification" saying an employer could receive a Work Opportunity Tax Credit for hiring you?
                </p>
                <div className="space-y-3">
                  {["Yes", "No"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWotcAnswers(prev => ({ ...prev, conditionalCertificate: option }));
                        if (wotcEditingQuestion === 1) {
                          setWotcEditingQuestion(null);
                          setWotcStep(12);
                        } else {
                          setWotcStep(2);
                        }
                      }}
                      className={`w-full py-4 px-4 font-medium rounded-2xl border-2 transition-all duration-200 ${
                        wotcAnswers.conditionalCertificate === option
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setWotcStep(0)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 2: TANF */}
            {wotcStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-black mb-2">TANF Benefits</h2>
                  <p className="text-gray-500 text-sm">Question 2 of 11</p>
                </div>
                <p className="text-gray-700 text-center">
                  Have you received Temporary Assistance for Needy Families (TANF) in the past 18 months?
                </p>
                
                {/* Expandable Info Section */}
                <button
                  type="button"
                  onClick={() => setWotcInfoExpanded(wotcInfoExpanded === 'tanf' ? null : 'tanf')}
                  className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform ${wotcInfoExpanded === 'tanf' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Not sure what this means?
                </button>
                {wotcInfoExpanded === 'tanf' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700 space-y-3 animate-fade-in">
                    <p className="font-medium text-blue-800">What is TANF?</p>
                    <p>TANF (Temporary Assistance for Needy Families) is a government program that provides cash assistance to low-income families with children. It helps with basic needs like food, housing, and utilities.</p>
                    <p className="font-medium text-blue-800 mt-3">Examples:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Monthly cash payments from your state welfare office</li>
                      <li>CalWORKs (California), TAFDC (Massachusetts), or similar state programs</li>
                      <li>Cash assistance specifically for families with children under 18</li>
                    </ul>
                    <p className="font-medium text-blue-800 mt-3">Documentation you would have:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Benefit approval letter from your state</li>
                      <li>EBT card statements showing cash benefits</li>
                      <li>Correspondence from your local Department of Social Services</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {["Yes", "No", "Not sure"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWotcAnswers(prev => ({ ...prev, receivedTANF: option }));
                        if (wotcEditingQuestion === 2) {
                          setWotcEditingQuestion(null);
                          setWotcStep(12);
                        } else {
                          setWotcStep(3);
                        }
                      }}
                      className={`w-full py-4 px-4 font-medium rounded-2xl border-2 transition-all duration-200 ${
                        wotcAnswers.receivedTANF === option
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setWotcStep(1)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 3: SNAP */}
            {wotcStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-black mb-2">SNAP Benefits</h2>
                  <p className="text-gray-500 text-sm">Question 3 of 11</p>
                </div>
                <p className="text-gray-700 text-center">
                  Have you received SNAP (food stamps) benefits in the past 6 months?
                </p>
                
                {/* Expandable Info Section */}
                <button
                  type="button"
                  onClick={() => setWotcInfoExpanded(wotcInfoExpanded === 'snap' ? null : 'snap')}
                  className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform ${wotcInfoExpanded === 'snap' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Not sure what this means?
                </button>
                {wotcInfoExpanded === 'snap' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700 space-y-3 animate-fade-in">
                    <p className="font-medium text-blue-800">What is SNAP?</p>
                    <p>SNAP (Supplemental Nutrition Assistance Program), formerly known as food stamps, helps low-income individuals and families buy groceries. Benefits are loaded onto an EBT (Electronic Benefits Transfer) card each month.</p>
                    <p className="font-medium text-blue-800 mt-3">Examples:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Monthly food benefits on an EBT card</li>
                      <li>CalFresh (California), SNAP benefits in other states</li>
                      <li>Benefits used specifically at grocery stores for food purchases</li>
                    </ul>
                    <p className="font-medium text-blue-800 mt-3">Documentation you would have:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>EBT card with your name on it</li>
                      <li>SNAP benefit approval letter</li>
                      <li>Monthly benefit statements</li>
                      <li>Correspondence from your local SNAP office</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {["Yes", "No", "Not sure"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWotcAnswers(prev => ({ ...prev, receivedSNAP: option }));
                        if (wotcEditingQuestion === 3) {
                          setWotcEditingQuestion(null);
                          setWotcStep(12);
                        } else {
                          setWotcStep(4);
                        }
                      }}
                      className={`w-full py-4 px-4 font-medium rounded-2xl border-2 transition-all duration-200 ${
                        wotcAnswers.receivedSNAP === option
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setWotcStep(2)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 4: SSI */}
            {wotcStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-black mb-2">SSI Benefits</h2>
                  <p className="text-gray-500 text-sm">Question 4 of 11</p>
                </div>
                <p className="text-gray-700 text-center">
                  Have you received Supplemental Security Income (SSI) in the past 60 days?
                </p>
                
                {/* Expandable Info Section */}
                <button
                  type="button"
                  onClick={() => setWotcInfoExpanded(wotcInfoExpanded === 'ssi' ? null : 'ssi')}
                  className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform ${wotcInfoExpanded === 'ssi' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Not sure what this means?
                </button>
                {wotcInfoExpanded === 'ssi' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700 space-y-3 animate-fade-in">
                    <p className="font-medium text-blue-800">What is SSI?</p>
                    <p>SSI (Supplemental Security Income) is a federal program that provides monthly cash payments to people who are aged, blind, or have a disability and have limited income and resources. It is different from Social Security Disability Insurance (SSDI).</p>
                    <p className="font-medium text-blue-800 mt-3">Examples:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Monthly payments from Social Security Administration for disability</li>
                      <li>Benefits for low-income seniors aged 65 or older</li>
                      <li>Disability payments for those who haven&apos;t worked enough to qualify for SSDI</li>
                    </ul>
                    <p className="font-medium text-blue-800 mt-3">Documentation you would have:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>SSI award letter from Social Security Administration</li>
                      <li>Monthly benefit statements from SSA</li>
                      <li>Direct deposit records showing SSI payments</li>
                      <li>SSA-1099 form showing SSI benefits received</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {["Yes", "No", "Not sure"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWotcAnswers(prev => ({ ...prev, receivedSSI: option }));
                        if (wotcEditingQuestion === 4) {
                          setWotcEditingQuestion(null);
                          setWotcStep(12);
                        } else {
                          setWotcStep(5);
                        }
                      }}
                      className={`w-full py-4 px-4 font-medium rounded-2xl border-2 transition-all duration-200 ${
                        wotcAnswers.receivedSSI === option
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setWotcStep(3)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 5: Veteran Status */}
            {wotcStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-black mb-2">Veteran Status</h2>
                  <p className="text-gray-500 text-sm">Question 5 of 11</p>
                </div>
                <p className="text-gray-700 text-center">
                  Are you a veteran of the U.S. Armed Forces?
                </p>
                <div className="space-y-3">
                  {["Yes", "No"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWotcAnswers(prev => ({ ...prev, isVeteran: option }));
                        if (wotcEditingQuestion === 5) {
                          setWotcEditingQuestion(null);
                          setWotcStep(12);
                        } else {
                          setWotcStep(option === "Yes" ? 6 : 7);
                        }
                      }}
                      className={`w-full py-4 px-4 font-medium rounded-2xl border-2 transition-all duration-200 ${
                        wotcAnswers.isVeteran === option
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setWotcStep(4)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 6: Veteran Disability (only if veteran) */}
            {wotcStep === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-black mb-2">Service-Connected Disability</h2>
                  <p className="text-gray-500 text-sm">Question 6 of 11</p>
                </div>
                <p className="text-gray-700 text-center">
                  Do you have a service-connected disability?
                </p>
                
                {/* Expandable Info Section */}
                <button
                  type="button"
                  onClick={() => setWotcInfoExpanded(wotcInfoExpanded === 'veteranDisability' ? null : 'veteranDisability')}
                  className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform ${wotcInfoExpanded === 'veteranDisability' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Not sure what this means?
                </button>
                {wotcInfoExpanded === 'veteranDisability' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700 space-y-3 animate-fade-in">
                    <p className="font-medium text-blue-800">What is a Service-Connected Disability?</p>
                    <p>A service-connected disability is an injury, illness, or condition that was caused or made worse by your military service. The VA assigns a disability rating from 0% to 100% based on the severity.</p>
                    <p className="font-medium text-blue-800 mt-3">Examples:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Hearing loss or tinnitus from military service</li>
                      <li>PTSD or other mental health conditions related to service</li>
                      <li>Physical injuries sustained during active duty</li>
                      <li>Conditions caused by exposure to hazardous materials during service</li>
                    </ul>
                    <p className="font-medium text-blue-800 mt-3">Documentation you would have:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>VA disability rating letter</li>
                      <li>VA Benefits Summary Letter (also called VA Award Letter)</li>
                      <li>DD-214 showing disability discharge</li>
                      <li>VA compensation and pension records</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {["Yes", "No", "Not sure"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWotcAnswers(prev => ({ ...prev, veteranDisabled: option }));
                        if (wotcEditingQuestion === 6) {
                          setWotcEditingQuestion(null);
                          setWotcStep(12);
                        } else {
                          setWotcStep(7);
                        }
                      }}
                      className={`w-full py-4 px-4 font-medium rounded-2xl border-2 transition-all duration-200 ${
                        wotcAnswers.veteranDisabled === option
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setWotcStep(5)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 7: Unemployment Duration */}
            {wotcStep === 7 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-black mb-2">Unemployment Duration</h2>
                  <p className="text-gray-500 text-sm">Question 7 of 11</p>
                </div>
                <p className="text-gray-700 text-center">
                  Have you been unemployed for 27 weeks or more?
                </p>
                
                {/* Expandable Info Section */}
                <button
                  type="button"
                  onClick={() => setWotcInfoExpanded(wotcInfoExpanded === 'unemployment' ? null : 'unemployment')}
                  className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform ${wotcInfoExpanded === 'unemployment' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Not sure what this means?
                </button>
                {wotcInfoExpanded === 'unemployment' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700 space-y-3 animate-fade-in">
                    <p className="font-medium text-blue-800">What counts as being unemployed for 27 weeks?</p>
                    <p>This means you have been without a job and actively looking for work for at least 27 consecutive weeks (about 6 months). Part-time work or temporary jobs may reset this count.</p>
                    <p className="font-medium text-blue-800 mt-3">Examples:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>You were laid off 7 months ago and have been job searching since</li>
                      <li>You haven&apos;t had a regular job for over 6 months</li>
                      <li>Your unemployment benefits have been running for 27+ weeks</li>
                    </ul>
                    <p className="font-medium text-blue-800 mt-3">Documentation you would have:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Unemployment benefit statements showing duration</li>
                      <li>Last pay stub from your previous employer</li>
                      <li>Termination letter with date</li>
                      <li>Records from your state unemployment office</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {["Yes", "No", "Not sure"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWotcAnswers(prev => ({ ...prev, unemployed27Weeks: option }));
                        if (wotcEditingQuestion === 7) {
                          setWotcEditingQuestion(null);
                          setWotcStep(12);
                        } else {
                          setWotcStep(8);
                        }
                      }}
                      className={`w-full py-4 px-4 font-medium rounded-2xl border-2 transition-all duration-200 ${
                        wotcAnswers.unemployed27Weeks === option
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setWotcStep(wotcAnswers.isVeteran === "Yes" ? 6 : 5)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 8: Unemployment Compensation */}
            {wotcStep === 8 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-black mb-2">Unemployment Benefits</h2>
                  <p className="text-gray-500 text-sm">Question 8 of 11</p>
                </div>
                <p className="text-gray-700 text-center">
                  Have you received unemployment compensation during your unemployment period?
                </p>
                
                {/* Expandable Info Section */}
                <button
                  type="button"
                  onClick={() => setWotcInfoExpanded(wotcInfoExpanded === 'unemploymentComp' ? null : 'unemploymentComp')}
                  className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform ${wotcInfoExpanded === 'unemploymentComp' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Not sure what this means?
                </button>
                {wotcInfoExpanded === 'unemploymentComp' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700 space-y-3 animate-fade-in">
                    <p className="font-medium text-blue-800">What is Unemployment Compensation?</p>
                    <p>Unemployment compensation (also called unemployment insurance or UI) is money paid by your state to workers who have lost their job through no fault of their own. You must apply for these benefits and meet eligibility requirements.</p>
                    <p className="font-medium text-blue-800 mt-3">Examples:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Weekly or bi-weekly payments from your state unemployment office</li>
                      <li>Direct deposits or debit card payments labeled as UI benefits</li>
                      <li>Pandemic Unemployment Assistance (PUA) received during COVID-19</li>
                    </ul>
                    <p className="font-medium text-blue-800 mt-3">Documentation you would have:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Unemployment benefit award letter</li>
                      <li>Weekly/bi-weekly payment statements</li>
                      <li>1099-G tax form showing unemployment benefits received</li>
                      <li>Bank statements showing UI deposits</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {["Yes", "No", "Not sure"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWotcAnswers(prev => ({ ...prev, receivedUnemployment: option }));
                        if (wotcEditingQuestion === 8) {
                          setWotcEditingQuestion(null);
                          setWotcStep(12);
                        } else {
                          setWotcStep(9);
                        }
                      }}
                      className={`w-full py-4 px-4 font-medium rounded-2xl border-2 transition-all duration-200 ${
                        wotcAnswers.receivedUnemployment === option
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setWotcStep(7)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 9: Felony Conviction */}
            {wotcStep === 9 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-black mb-2">Criminal History</h2>
                  <p className="text-gray-500 text-sm">Question 9 of 11</p>
                </div>
                <p className="text-gray-700 text-center">
                  Have you been convicted of a felony and released from prison within the past year?
                </p>
                
                {/* Expandable Info Section */}
                <button
                  type="button"
                  onClick={() => setWotcInfoExpanded(wotcInfoExpanded === 'felony' ? null : 'felony')}
                  className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform ${wotcInfoExpanded === 'felony' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Not sure what this means?
                </button>
                {wotcInfoExpanded === 'felony' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-gray-700 space-y-3 animate-fade-in">
                    <p className="font-medium text-green-800">Why we ask this question</p>
                    <p><strong className="text-green-700">This is not a disqualifying question!</strong> In fact, employers receive significant tax credits for hiring individuals who have been recently released. Your answer helps connect you with employers who want to give you an opportunity.</p>
                    <p className="font-medium text-green-800 mt-3">What this means:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>You were convicted of a felony (not a misdemeanor)</li>
                      <li>You were released from prison within the last 12 months</li>
                      <li>This includes release from a federal, state, or local prison</li>
                    </ul>
                    <p className="font-medium text-green-800 mt-3">How this helps you:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Employers can receive tax credits of up to $2,400 for hiring you</li>
                      <li>Many employers actively seek candidates who qualify for these credits</li>
                      <li>This program is designed to support your successful reentry into the workforce</li>
                    </ul>
                    <p className="font-medium text-green-800 mt-3">Documentation you may have:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Release papers or discharge documents</li>
                      <li>Parole or probation paperwork</li>
                      <li>Court records showing conviction and release dates</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {["Yes", "No", "Not sure"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWotcAnswers(prev => ({ ...prev, felonyConviction: option }));
                        if (wotcEditingQuestion === 9) {
                          setWotcEditingQuestion(null);
                          setWotcStep(12);
                        } else {
                          setWotcStep(10);
                        }
                      }}
                      className={`w-full py-4 px-4 font-medium rounded-2xl border-2 transition-all duration-200 ${
                        wotcAnswers.felonyConviction === option
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setWotcStep(8)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 10: Vocational Rehabilitation */}
            {wotcStep === 10 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-black mb-2">Vocational Rehabilitation</h2>
                  <p className="text-gray-500 text-sm">Question 10 of 11</p>
                </div>
                <p className="text-gray-700 text-center">
                  Have you participated in a vocational rehabilitation program?
                </p>
                
                {/* Expandable Info Section */}
                <button
                  type="button"
                  onClick={() => setWotcInfoExpanded(wotcInfoExpanded === 'vocRehab' ? null : 'vocRehab')}
                  className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform ${wotcInfoExpanded === 'vocRehab' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Not sure what this means?
                </button>
                {wotcInfoExpanded === 'vocRehab' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700 space-y-3 animate-fade-in">
                    <p className="font-medium text-blue-800">What is Vocational Rehabilitation?</p>
                    <p>Vocational rehabilitation programs help people with disabilities prepare for, find, and keep jobs. These programs are run by state agencies and provide job training, counseling, and other services to help people return to work.</p>
                    <p className="font-medium text-blue-800 mt-3">Examples:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>State Department of Rehabilitation services</li>
                      <li>VA Vocational Rehabilitation and Employment (VR&E) program</li>
                      <li>Ticket to Work program</li>
                      <li>Job training programs for people with disabilities</li>
                      <li>Employment services through a disability services agency</li>
                    </ul>
                    <p className="font-medium text-blue-800 mt-3">Documentation you would have:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Individualized Plan for Employment (IPE)</li>
                      <li>Letters from your vocational rehabilitation counselor</li>
                      <li>Program enrollment or completion certificates</li>
                      <li>Records from your state&apos;s Department of Rehabilitation</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {["Yes", "No", "Not sure"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWotcAnswers(prev => ({ ...prev, vocationalRehab: option }));
                        if (wotcEditingQuestion === 10) {
                          setWotcEditingQuestion(null);
                          setWotcStep(12);
                        } else {
                          setWotcStep(11);
                        }
                      }}
                      className={`w-full py-4 px-4 font-medium rounded-2xl border-2 transition-all duration-200 ${
                        wotcAnswers.vocationalRehab === option
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setWotcStep(9)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 11: Empowerment Zone */}
            {wotcStep === 11 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-black mb-2">Empowerment Zone</h2>
                  <p className="text-gray-500 text-sm">Question 11 of 11</p>
                </div>
                <p className="text-gray-700 text-center">
                  Do you live in an Empowerment Zone or Rural Renewal County?
                </p>
                
                {/* Expandable Info Section */}
                <button
                  type="button"
                  onClick={() => setWotcInfoExpanded(wotcInfoExpanded === 'empZone' ? null : 'empZone')}
                  className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform ${wotcInfoExpanded === 'empZone' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Not sure what this means?
                </button>
                {wotcInfoExpanded === 'empZone' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700 space-y-3 animate-fade-in">
                    <p className="font-medium text-blue-800">What is an Empowerment Zone or Rural Renewal County?</p>
                    <p>Empowerment Zones and Rural Renewal Counties are designated areas where the government provides special incentives to encourage business growth and hiring. These are typically economically disadvantaged urban or rural communities.</p>
                    <p className="font-medium text-blue-800 mt-3">Examples of designated areas:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Urban Empowerment Zones in cities like Detroit, Cleveland, Baltimore, Chicago</li>
                      <li>Rural Empowerment Zones in counties across Texas, Kentucky, Mississippi</li>
                      <li>Enterprise Communities and Renewal Communities</li>
                      <li>Historically underserved neighborhoods with high poverty rates</li>
                    </ul>
                    <p className="font-medium text-blue-800 mt-3">How to check if you qualify:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Your city or county government can confirm if your address is in a designated zone</li>
                      <li>Check with your local economic development office</li>
                      <li>Look up your address on HUD&apos;s Empowerment Zone website</li>
                      <li>If you live in a low-income or economically distressed area, you may qualify</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {["Yes", "No", "Not sure"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWotcAnswers(prev => ({ ...prev, empowermentZone: option }));
                        if (wotcEditingQuestion === 11) {
                          setWotcEditingQuestion(null);
                        }
                        setWotcStep(12);
                      }}
                      className={`w-full py-4 px-4 font-medium rounded-2xl border-2 transition-all duration-200 ${
                        wotcAnswers.empowermentZone === option
                          ? "border-black bg-gray-100"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setWotcStep(10)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 12: Review Answers */}
            {wotcStep === 12 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-black mb-2">Review Your Answers</h2>
                  <p className="text-gray-500 text-sm">Please confirm your responses before submitting.</p>
                </div>
                
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                  {/* Question 1: Conditional Certificate */}
                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Q1: Conditional Certificate</p>
                      <p className="text-sm font-medium text-black">{wotcAnswers.conditionalCertificate || "Not answered"}</p>
                    </div>
                    <button
                      onClick={() => { setWotcEditingQuestion(1); setWotcStep(1); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Question 2: TANF */}
                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Q2: TANF Benefits</p>
                      <p className="text-sm font-medium text-black">{wotcAnswers.receivedTANF || "Not answered"}</p>
                    </div>
                    <button
                      onClick={() => { setWotcEditingQuestion(2); setWotcStep(2); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Question 3: SNAP */}
                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Q3: SNAP Benefits</p>
                      <p className="text-sm font-medium text-black">{wotcAnswers.receivedSNAP || "Not answered"}</p>
                    </div>
                    <button
                      onClick={() => { setWotcEditingQuestion(3); setWotcStep(3); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Question 4: SSI */}
                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Q4: SSI Benefits</p>
                      <p className="text-sm font-medium text-black">{wotcAnswers.receivedSSI || "Not answered"}</p>
                    </div>
                    <button
                      onClick={() => { setWotcEditingQuestion(4); setWotcStep(4); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Question 5: Veteran Status */}
                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Q5: Veteran Status</p>
                      <p className="text-sm font-medium text-black">{wotcAnswers.isVeteran || "Not answered"}</p>
                    </div>
                    <button
                      onClick={() => { setWotcEditingQuestion(5); setWotcStep(5); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Question 6: Veteran Disability - only show if veteran */}
                  {wotcAnswers.isVeteran === "Yes" && (
                    <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Q6: Service-Connected Disability</p>
                        <p className="text-sm font-medium text-black">{wotcAnswers.veteranDisabled || "Not answered"}</p>
                      </div>
                      <button
                        onClick={() => { setWotcEditingQuestion(6); setWotcStep(6); }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                      >
                        Edit
                      </button>
                    </div>
                  )}

                  {/* Question 7: Unemployment Duration */}
                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Q7: Unemployment Duration</p>
                      <p className="text-sm font-medium text-black">{wotcAnswers.unemployed27Weeks || "Not answered"}</p>
                    </div>
                    <button
                      onClick={() => { setWotcEditingQuestion(7); setWotcStep(7); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Question 8: Unemployment Benefits */}
                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Q8: Unemployment Benefits</p>
                      <p className="text-sm font-medium text-black">{wotcAnswers.receivedUnemployment || "Not answered"}</p>
                    </div>
                    <button
                      onClick={() => { setWotcEditingQuestion(8); setWotcStep(8); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Question 9: Criminal History */}
                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Q9: Criminal History</p>
                      <p className="text-sm font-medium text-black">{wotcAnswers.felonyConviction || "Not answered"}</p>
                    </div>
                    <button
                      onClick={() => { setWotcEditingQuestion(9); setWotcStep(9); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Question 10: Vocational Rehabilitation */}
                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Q10: Vocational Rehabilitation</p>
                      <p className="text-sm font-medium text-black">{wotcAnswers.vocationalRehab || "Not answered"}</p>
                    </div>
                    <button
                      onClick={() => { setWotcEditingQuestion(10); setWotcStep(10); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Question 11: Empowerment Zone */}
                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Q11: Empowerment Zone</p>
                      <p className="text-sm font-medium text-black">{wotcAnswers.empowermentZone || "Not answered"}</p>
                    </div>
                    <button
                      onClick={() => { setWotcEditingQuestion(11); setWotcStep(11); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setWotcStep(13)}
                  className="w-full py-4 px-4 font-semibold rounded-full bg-black text-white hover:bg-gray-800 shadow-lg transition-all duration-200"
                >
                  Confirm & Continue
                </button>
                <button
                  onClick={() => setWotcStep(11)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step 13: SSN and Signature */}
            {wotcStep === 13 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-black mb-2">Final Step</h2>
                  <p className="text-gray-500 text-sm">To submit your WOTC forms to the Department of Labor, we need your SSN and signature.</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700">
                  <p className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Your information is encrypted and securely transmitted. It will only be used to process your WOTC certification with the appropriate state agency.</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Social Security Number
                    </label>
                    <input
                      type="text"
                      value={wotcSSN}
                      onChange={(e) => {
                        // Format SSN as XXX-XX-XXXX
                        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                        let formatted = value;
                        if (value.length > 5) {
                          formatted = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
                        } else if (value.length > 3) {
                          formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
                        }
                        setWotcSSN(formatted);
                      }}
                      placeholder="XXX-XX-XXXX"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all text-center text-lg tracking-wider"
                      maxLength={11}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Electronic Signature
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Type your full legal name as it appears on official documents.</p>
                    <input
                      type="text"
                      value={wotcSignature}
                      onChange={(e) => setWotcSignature(e.target.value)}
                      placeholder="Your full legal name"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                      style={{ fontFamily: 'cursive', fontStyle: 'italic' }}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600">
                  <p>By signing above, I certify under penalty of perjury that the information I have provided is true and correct to the best of my knowledge. I authorize the release of this information to the appropriate state workforce agency for WOTC certification purposes.</p>
                </div>

                <button
                  onClick={() => setWotcStep(14)}
                  disabled={wotcSSN.length !== 11 || wotcSignature.length < 2}
                  className={`w-full py-4 px-4 font-semibold rounded-full transition-all duration-200 ${
                    wotcSSN.length === 11 && wotcSignature.length >= 2
                      ? "bg-green-500 text-white hover:bg-green-600 shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Submit to Department of Labor
                </button>
                <button
                  onClick={() => setWotcStep(12)}
                  className="w-full py-3 text-gray-500 hover:text-black transition-colors text-sm"
                >
                  ← Back to Review
                </button>
              </div>
            )}

            {/* Step 14: Final Completion */}
            {wotcStep === 14 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2">Successfully Submitted!</h2>
                  <p className="text-gray-500 text-sm">Your WOTC forms have been submitted to the Department of Labor.</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
                  <p className="text-sm text-green-800 text-center font-medium">
                    What happens next?
                  </p>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Your forms will be reviewed by your state&apos;s workforce agency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Employers will be notified if you qualify for tax credits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>This can make you a more attractive candidate to employers</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    toast.success("WOTC Survey submitted successfully!");
                    setShowWotcModal(false);
                    setWotcStep(0);
                    setWotcSSN("");
                    setWotcSignature("");
                  }}
                  className="w-full py-4 px-4 font-semibold rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all duration-200"
                >
                  Done
                </button>
              </div>
            )}
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
      {hoverTutorialActive && hoverTutorialStep !== null && (
        <TutorialTooltip
          step={tutorialSteps[hoverTutorialStep]}
          onNext={() => setHoverTutorialStep(null)}
          onBack={() => setHoverTutorialStep(null)}
          onClose={() => setHoverTutorialStep(null)}
          showBack={false}
          isLastStep={false}
          hideControls={true}
        />
      )}
      {hoverTutorialActive && (
        <div
          onClick={() => setHoverTutorialActive(false)}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] px-4 lg:px-6 py-3 rounded-xl shadow-lg cursor-pointer text-sm lg:text-base"
          style={{ backgroundColor: '#E54747', color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 500, maxWidth: '90vw' }}
        >
          <span className="hidden sm:inline">Hover hints are enabled.</span>
          <span className="sm:hidden">Hints enabled.</span>
          <span className="underline"> Click here to disable</span>.
        </div>
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
