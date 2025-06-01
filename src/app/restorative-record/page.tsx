"use client";

import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import "react-day-picker/dist/style.css";

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
  const { toast } = useToast();
  const [currentCategory, setCurrentCategory] = useState(0);
  const searchParams = useSearchParams();
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
  });

  const [engagementFileError, setEngagementFileError] = useState("");

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
  });

  const [microFileError, setMicroFileError] = useState("");

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
  });

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
  });

  const [hobbiesFileError, setHobbiesFileError] = useState("");

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
    toast({
      title: "Success",
      description: "Restorative Record submitted!",
    });
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

  // Save to Supabase
  const handleSaveToSupabase = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await saveToSupabase({
      user,
      formData,
      educationHook,
      rehabPrograms,
      skillsHook,
      engagementHook,
      microHook,
      hobbiesHook,
      employmentHook,
      awardsHook,
      mentorHook,
      toast,
    });
  };

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
          />
        );

      case "rehabilitative-programs":
        return (
          <RehabilitativeProgramsSection
            rehabPrograms={rehabPrograms}
            handleRehabCheckbox={handleRehabCheckbox}
            handleRehabDetailsChange={handleRehabDetailsChange}
          />
        );

      case "microcredentials":
        return (
          <MicrocredentialsSection
            microHook={microHook}
            handleMicroFileChange={handleMicroFileChange}
            microFileError={microFileError}
            setMicroFileError={setMicroFileError}
          />
        );

      case "mentors":
        return <MentorsSection mentorHook={mentorHook} />;

      case "education":
        return (
          <EducationSection
            educationHook={educationHook}
            handleEducationFileChange={handleEducationFileChange}
            educationFileError={educationFileError}
            setEducationFileError={setEducationFileError}
          />
        );

      case "employment-history":
        return <EmploymentHistorySection employmentHook={employmentHook} />;

      case "hobbies":
        return (
          <HobbiesSection
            hobbiesHook={hobbiesHook}
            handleHobbiesFileChange={handleHobbiesFileChange}
            hobbiesFileError={hobbiesFileError}
            setHobbiesFileError={setHobbiesFileError}
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
              <Link href="/restorative-record/profile" legacyBehavior>
                <a className="px-5 py-2 bg-primary text-white rounded-lg font-medium shadow hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ml-4">
                  MY RESTORATIVE RECORD
                </a>
              </Link>
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
    </div>
  );
}
