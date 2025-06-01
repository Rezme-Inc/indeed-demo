"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
// Import Radix UI components as needed
// import { Button, Input, Select, ... } from '@radix-ui/react-*';
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const categories = [
  "introduction",
  "personal-achievements",
  "skills",
  "community-engagement",
  "rehabilitative-programs",
  "microcredentials",
  "mentors",
  "education",
  "employment-history",
  "hobbies",
];

// Example interfaces
type FileWithPreview = File & { preview?: string };

interface Award {
  type: string;
  name: string;
  organization: string;
  date: string;
  file?: FileWithPreview;
  narrative?: string;
}

interface Education {
  school: string;
  location: string;
  degree: string;
  field: string;
  currentlyEnrolled: boolean;
  startDate: string;
  endDate: string;
  grade: string;
  description: string;
  file?: FileWithPreview;
}

interface Employment {
  title: string;
  type: string;
  company: string;
  location: string;
  incarcerated: boolean;
  currentlyWorking: boolean;
  startDate: string;
  endDate: string;
  description: string;
  file?: FileWithPreview;
}

interface Introduction {
  facebookUrl: string;
  linkedinUrl: string;
  redditUrl: string;
  digitalPortfolioUrl: string;
  instagramUrl: string;
  githubUrl: string;
  tiktokUrl: string;
  pinterestUrl: string;
  twitterUrl: string;
  personalWebsiteUrl: string;
  handshakeUrl: string;
  preferredOccupation: string;
  personalNarrative: string;
  languageProficiency:
    | "Bilingual"
    | "Advanced Proficiency"
    | "Intermediate Proficiency"
    | "Basic Proficiency"
    | "Limited Proficiency"
    | "No Proficiency";
  otherLanguages: string[];
}

interface RehabPrograms {
  substanceUseDisorder: boolean;
  substanceUseDisorderDetails: string;
  womensJusticeCenters: boolean;
  womensJusticeCentersDetails: string;
  employmentFocused: boolean;
  employmentFocusedDetails: string;
  adaptableJustice: boolean;
  adaptableJusticeDetails: string;
  lifeSkillsTraining: boolean;
  lifeSkillsTrainingDetails: string;
  communityService: boolean;
  communityServiceDetails: string;
  familyReintegration: boolean;
  familyReintegrationDetails: string;
  parentingClasses: boolean;
  parentingClassesDetails: string;
  mentalWellness: boolean;
  mentalWellnessDetails: string;
  faithBased: boolean;
  faithBasedDetails: string;
  peerSupport: boolean;
  peerSupportDetails: string;
  artsRecreation: boolean;
  artsRecreationDetails: string;
  housingAssistance: boolean;
  housingAssistanceDetails: string;
  legalCompliance: boolean;
  legalComplianceDetails: string;
  civicEngagement: boolean;
  civicEngagementDetails: string;
  veteransServices: boolean;
  veteransServicesDetails: string;
  domesticViolenceReduction: boolean;
  domesticViolenceReductionDetails: string;
  sexOffenderTreatment: boolean;
  sexOffenderTreatmentDetails: string;
  medicalHealthCare: boolean;
  medicalHealthCareDetails: string;
  other: boolean;
  otherDetails: string;
}

type RehabProgramKey = keyof Omit<RehabPrograms, `${string}Details`>;
type RehabProgramDetailsKey = `${RehabProgramKey}Details`;

interface Hobby {
  id: string;
  general: string;
  sports: string;
  other: string;
  narrative: string;
  file?: FileWithPreview;
}

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
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [awardFileError, setAwardFileError] = useState("");

  // Social media fields
  const socialFields = [
    { name: "facebookUrl", label: "Enter your Facebook URL" },
    { name: "linkedinUrl", label: "Enter your LinkedIn URL" },
    { name: "redditUrl", label: "Enter your Reddit URL" },
    {
      name: "digitalPortfolioUrl",
      label: "Enter your Digital Portfolio Link URL",
    },
    { name: "instagramUrl", label: "Enter your Instagram URL" },
    { name: "githubUrl", label: "Enter your GitHub URL" },
    { name: "tiktokUrl", label: "Enter your TikTok URL" },
    { name: "pinterestUrl", label: "Enter your Pinterest URL" },
    { name: "twitterUrl", label: "Enter your X (Twitter) URL" },
    { name: "personalWebsiteUrl", label: "Enter your Personal Website URL" },
    { name: "handshakeUrl", label: "Enter your Handshake URL" },
  ];

  // English proficiency options
  const englishOptions = [
    "Bilingual",
    "Advanced Proficiency",
    "Intermediate Proficiency",
    "Basic Proficiency",
    "Limited Proficiency",
    "No Proficiency",
  ];

  // Other languages options (example)
  const otherLanguages = [
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Tagalog",
    "Vietnamese",
    "Other...",
  ];

  // Step 2: Personal Achievements state
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [awards, setAwards] = useState<
    Array<{
      id: string;
      type: string;
      name: string;
      organization: string;
      date: string;
      file: File | null;
      filePreview: string;
      narrative: string;
    }>
  >([]);
  const [editingAwardId, setEditingAwardId] = useState<string | null>(null);
  const [awardForm, setAwardForm] = useState({
    type: "",
    name: "",
    organization: "",
    date: "",
    file: null as File | null,
    filePreview: "",
    narrative: "",
  });
  const [awardFormTouched, setAwardFormTouched] = useState(false);
  const awardTypes = [
    "Academic Achievement",
    "Athletic Achievement",
    "Community Service",
    "Leadership",
    "Professional Achievement",
    "Other",
  ];

  // Step 3: Skills state
  const [showSkillsForm, setShowSkillsForm] = useState(false);
  const [skills, setSkills] = useState<
    Array<{
      id: string;
      softSkills: string;
      hardSkills: string;
      otherSkills: string;
      file: File | null;
      filePreview: string;
      narrative: string;
    }>
  >([]);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillsForm, setSkillsForm] = useState({
    softSkills: "",
    hardSkills: "",
    otherSkills: "",
    file: null as File | null,
    filePreview: "",
    narrative: "",
  });
  const [skillsFileError, setSkillsFileError] = useState("");
  const softSkillsOptions = [
    "Communication",
    "Teamwork",
    "Problem Solving",
    "Adaptability",
    "Creativity",
    "Work Ethic",
    "Other...",
  ];
  const hardSkillsOptions = [
    "Programming",
    "Data Analysis",
    "Project Management",
    "Writing",
    "Design",
    "Marketing",
    "Other...",
  ];

  // Step 4: Community Engagement state
  const [showEngagementForm, setShowEngagementForm] = useState(false);
  const [engagements, setEngagements] = useState<
    Array<{
      id: string;
      type: string;
      role: string;
      orgName: string;
      orgWebsite: string;
      details: string;
      file: File | null;
      filePreview: string;
    }>
  >([]);
  const [editingEngagementId, setEditingEngagementId] = useState<string | null>(
    null
  );
  const [engagementForm, setEngagementForm] = useState({
    type: "",
    role: "",
    orgName: "",
    orgWebsite: "",
    details: "",
    file: null as File | null,
    filePreview: "",
  });
  const [engagementFileError, setEngagementFileError] = useState("");
  const engagementTypes = [
    "Volunteer Work",
    "Advocacy",
    "Community Service",
    "Mentorship",
    "Fundraising",
    "Other",
  ];

  // Step 5: Rehabilitative Programs state
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

  const [hobbyList, setHobbyList] = useState<Hobby[]>([]);

  // Step 6: Microcredentials and Certifications state
  const [showMicroForm, setShowMicroForm] = useState(false);
  const [microcredentials, setMicrocredentials] = useState<
    Array<{
      id: string;
      name: string;
      org: string;
      issueDate: string;
      expiryDate: string;
      credentialId: string;
      credentialUrl: string;
      narrative: string;
      file: File | null;
      filePreview: string;
    }>
  >([]);
  const [editingMicroId, setEditingMicroId] = useState<string | null>(null);
  const [microForm, setMicroForm] = useState({
    name: "",
    org: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    narrative: "",
    file: null as File | null,
    filePreview: "",
  });
  const [microFileError, setMicroFileError] = useState("");
  const [microIssueDatePickerOpen, setMicroIssueDatePickerOpen] =
    useState(false);
  const [microExpiryDatePickerOpen, setMicroExpiryDatePickerOpen] =
    useState(false);
  const microIssueDateInputRef = useRef<HTMLInputElement>(null);
  const microExpiryDateInputRef = useRef<HTMLInputElement>(null);
  const handleMicroInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMicroForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleMicroIssueDateChange = (date: Date | undefined) => {
    setMicroForm((prev) => ({
      ...prev,
      issueDate: date ? date.toISOString().split("T")[0] : "",
    }));
    setMicroIssueDatePickerOpen(false);
  };
  const handleMicroExpiryDateChange = (date: Date | undefined) => {
    setMicroForm((prev) => ({
      ...prev,
      expiryDate: date ? date.toISOString().split("T")[0] : "",
    }));
    setMicroExpiryDatePickerOpen(false);
  };
  const handleMicroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMicroFileError("File size must be less than 5MB");
        return;
      }
      setMicroFileError("");
      setMicroForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleMicroFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMicroFileError("File size must be less than 5MB");
        return;
      }
      setMicroFileError("");
      setMicroForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleMicroFileDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  const handleMicroFormOpen = () => {
    setShowMicroForm(true);
    setEditingMicroId(null);
    setMicroForm({
      name: "",
      org: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
      narrative: "",
      file: null,
      filePreview: "",
    });
  };
  const handleMicroFormClose = () => {
    setShowMicroForm(false);
    setEditingMicroId(null);
  };
  const handleMicroSave = () => {
    if (!microForm.name || !microForm.org || !microForm.issueDate) {
      return;
    }

    if (editingMicroId) {
      setMicrocredentials(
        microcredentials.map((micro) =>
          micro.id === editingMicroId
            ? { ...micro, ...microForm, id: micro.id }
            : micro
        )
      );
    } else {
      setMicrocredentials([
        ...microcredentials,
        { ...microForm, id: Date.now().toString() },
      ]);
    }

    handleMicroFormClose();
  };
  const handleMicroEdit = (id: string) => {
    const micro = microcredentials.find((m) => m.id === id);
    if (micro) {
      setMicroForm({
        name: micro.name,
        org: micro.org,
        issueDate: micro.issueDate,
        expiryDate: micro.expiryDate,
        credentialId: micro.credentialId,
        credentialUrl: micro.credentialUrl,
        narrative: micro.narrative,
        file: micro.file,
        filePreview: micro.filePreview,
      });
      setEditingMicroId(id);
      setShowMicroForm(true);
    }
  };
  const handleMicroDelete = (id: string) => {
    setMicrocredentials(microcredentials.filter((m) => m.id !== id));
  };

  // Step 7: Mentors & Recommendations state
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [mentors, setMentors] = useState<
    Array<{
      id: string;
      linkedin: string;
      name: string;
      company: string;
      title: string;
      email: string;
      phone: string;
      website: string;
      narrative: string;
    }>
  >([]);
  const [editingMentorId, setEditingMentorId] = useState<string | null>(null);
  const [mentorForm, setMentorForm] = useState({
    linkedin: "",
    name: "",
    company: "",
    title: "",
    email: "",
    phone: "",
    website: "",
    narrative: "",
  });
  const handleMentorInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMentorForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleMentorFormOpen = () => {
    setShowMentorForm(true);
    setEditingMentorId(null);
    setMentorForm({
      linkedin: "",
      name: "",
      company: "",
      title: "",
      email: "",
      phone: "",
      website: "",
      narrative: "",
    });
  };
  const handleMentorFormClose = () => {
    setShowMentorForm(false);
    setEditingMentorId(null);
  };
  const handleMentorSave = () => {
    if (!mentorForm.name || !mentorForm.company || !mentorForm.title) {
      return;
    }

    if (editingMentorId) {
      setMentors(
        mentors.map((mentor) =>
          mentor.id === editingMentorId
            ? { ...mentor, ...mentorForm, id: mentor.id }
            : mentor
        )
      );
    } else {
      // Generate a UUID v4 for new mentor entries
      const newId = crypto.randomUUID();
      setMentors([...mentors, { ...mentorForm, id: newId }]);
    }

    handleMentorFormClose();
  };
  const handleMentorEdit = (id: string) => {
    const mentor = mentors.find((m) => m.id === id);
    if (mentor) {
      setMentorForm({
        linkedin: mentor.linkedin,
        name: mentor.name,
        company: mentor.company,
        title: mentor.title,
        email: mentor.email,
        phone: mentor.phone,
        website: mentor.website,
        narrative: mentor.narrative,
      });
      setEditingMentorId(id);
      setShowMentorForm(true);
    }
  };
  const handleMentorDelete = (id: string) => {
    setMentors(mentors.filter((m) => m.id !== id));
  };

  // Step 8: Education state
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [educations, setEducations] = useState<
    Array<{
      id: string;
      school: string;
      location: string;
      degree: string;
      field: string;
      currentlyEnrolled: boolean;
      startDate: string;
      endDate: string;
      grade: string;
      description: string;
      file: File | null;
      filePreview: string;
    }>
  >([]);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(
    null
  );
  const [educationForm, setEducationForm] = useState({
    school: "",
    location: "",
    degree: "",
    field: "",
    currentlyEnrolled: false,
    startDate: "",
    endDate: "",
    grade: "",
    description: "",
    file: null as File | null,
    filePreview: "",
  });
  const [educationFileError, setEducationFileError] = useState("");
  const [educationStartDatePickerOpen, setEducationStartDatePickerOpen] =
    useState(false);
  const [educationEndDatePickerOpen, setEducationEndDatePickerOpen] =
    useState(false);
  const educationStartDateInputRef = useRef<HTMLInputElement>(null);
  const educationEndDateInputRef = useRef<HTMLInputElement>(null);
  const handleEducationInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setEducationForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setEducationForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleEducationStartDateChange = (date: Date | undefined) => {
    setEducationForm((prev) => ({
      ...prev,
      startDate: date ? date.toISOString().split("T")[0] : "",
    }));
    setEducationStartDatePickerOpen(false);
  };
  const handleEducationEndDateChange = (date: Date | undefined) => {
    setEducationForm((prev) => ({
      ...prev,
      endDate: date ? date.toISOString().split("T")[0] : "",
    }));
    setEducationEndDatePickerOpen(false);
  };
  const handleEducationFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setEducationFileError("File size must be less than 5MB");
        return;
      }
      setEducationFileError("");
      setEducationForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleEducationFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setEducationFileError("File size must be less than 5MB");
        return;
      }
      setEducationFileError("");
      setEducationForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleEducationFileDragOver = (
    e: React.DragEvent<HTMLLabelElement>
  ) => {
    e.preventDefault();
  };
  const handleEducationFormOpen = () => {
    setShowEducationForm(true);
    setEditingEducationId(null);
    setEducationForm({
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
    });
  };
  const handleEducationFormClose = () => {
    setShowEducationForm(false);
    setEditingEducationId(null);
  };
  const handleEducationSave = () => {
    if (
      !educationForm.school ||
      !educationForm.location ||
      !educationForm.degree ||
      !educationForm.field ||
      !educationForm.startDate
    ) {
      return;
    }

    if (editingEducationId) {
      setEducations(
        educations.map((education) =>
          education.id === editingEducationId
            ? { ...education, ...educationForm, id: education.id }
            : education
        )
      );
    } else {
      // Generate a UUID v4 for new education entries
      const newId = crypto.randomUUID();
      setEducations([...educations, { ...educationForm, id: newId }]);
    }

    handleEducationFormClose();
  };
  const handleEducationEdit = (id: string) => {
    const education = educations.find((e) => e.id === id);
    if (education) {
      setEducationForm({
        school: education.school,
        location: education.location,
        degree: education.degree,
        field: education.field,
        currentlyEnrolled: education.currentlyEnrolled,
        startDate: education.startDate,
        endDate: education.endDate,
        grade: education.grade,
        description: education.description,
        file: education.file,
        filePreview: education.filePreview,
      });
      setEditingEducationId(id);
      setShowEducationForm(true);
    }
  };
  const handleEducationDelete = (id: string) => {
    setEducations(educations.filter((e) => e.id !== id));
  };

  // Step 9: Employment History state
  const [showEmploymentForm, setShowEmploymentForm] = useState(false);
  const [employments, setEmployments] = useState<
    Array<{
      id: string;
      state: string;
      city: string;
      employmentType: string;
      title: string;
      company: string;
      companyUrl: string;
      startDate: string;
      endDate: string;
      currentlyEmployed: boolean;
      employedWhileIncarcerated: boolean;
    }>
  >([]);
  const [editingEmploymentId, setEditingEmploymentId] = useState<string | null>(
    null
  );
  const [employmentForm, setEmploymentForm] = useState({
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
  });
  const [employmentStartDatePickerOpen, setEmploymentStartDatePickerOpen] =
    useState(false);
  const [employmentEndDatePickerOpen, setEmploymentEndDatePickerOpen] =
    useState(false);
  const employmentStartDateInputRef = useRef<HTMLInputElement>(null);
  const employmentEndDateInputRef = useRef<HTMLInputElement>(null);
  const employmentTypeOptions = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
    "Apprenticeship",
    "Freelance",
    "Self-employed",
    "Volunteer",
    "Other",
  ];
  const usStates = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];
  const handleEmploymentInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setEmploymentForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setEmploymentForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleEmploymentStartDateChange = (date: Date | undefined) => {
    setEmploymentForm((prev) => ({
      ...prev,
      startDate: date ? date.toISOString().split("T")[0] : "",
    }));
    setEmploymentStartDatePickerOpen(false);
  };
  const handleEmploymentEndDateChange = (date: Date | undefined) => {
    setEmploymentForm((prev) => ({
      ...prev,
      endDate: date ? date.toISOString().split("T")[0] : "",
    }));
    setEmploymentEndDatePickerOpen(false);
  };
  const handleEmploymentFormOpen = () => {
    setShowEmploymentForm(true);
    setEditingEmploymentId(null);
    setEmploymentForm({
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
    });
  };
  const handleEmploymentFormClose = () => {
    setShowEmploymentForm(false);
    setEditingEmploymentId(null);
  };
  const handleEmploymentSave = () => {
    if (
      !employmentForm.title ||
      !employmentForm.company ||
      !employmentForm.employmentType ||
      !employmentForm.startDate
    ) {
      return;
    }

    if (editingEmploymentId) {
      setEmployments(
        employments.map((employment) =>
          employment.id === editingEmploymentId
            ? { ...employment, ...employmentForm, id: employment.id }
            : employment
        )
      );
    } else {
      // Generate a UUID v4 for new employment entries
      const newId = crypto.randomUUID();
      setEmployments([...employments, { ...employmentForm, id: newId }]);
    }

    handleEmploymentFormClose();
  };
  const handleEmploymentEdit = (id: string) => {
    const employment = employments.find((e) => e.id === id);
    if (employment) {
      setEmploymentForm({
        state: employment.state,
        city: employment.city,
        employmentType: employment.employmentType,
        title: employment.title,
        company: employment.company,
        companyUrl: employment.companyUrl,
        startDate: employment.startDate,
        endDate: employment.endDate,
        currentlyEmployed: employment.currentlyEmployed,
        employedWhileIncarcerated: employment.employedWhileIncarcerated,
      });
      setEditingEmploymentId(id);
      setShowEmploymentForm(true);
    }
  };
  const handleEmploymentDelete = (id: string) => {
    setEmployments(employments.filter((e) => e.id !== id));
  };

  // Navigation
  const handleNext = async () => {
    if (currentCategory < categories.length - 1) {
      await saveToSupabase();
      setCurrentCategory((c) => c + 1);
    }
  };
  const handlePrevious = () => {
    if (currentCategory > 0) setCurrentCategory((c) => c - 1);
  };

  // File Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: any) => ({ ...prev, file }));
      setFilePreview(URL.createObjectURL(file));
    }
  };

  // Date Handling
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setFormData((prev: any) => ({ ...prev, date: date?.toISOString() }));
  };

  // Handlers
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const key = name as keyof Introduction;
    if (key in formData) {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const [occupationInput, setOccupationInput] = useState("");
  const [occupations, setOccupations] = useState<string[]>([]);

  const handleOccupationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOccupationInput(e.target.value);
  };

  const handleOccupationKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && occupationInput.trim()) {
      e.preventDefault();
      setOccupations((prev) => [...prev, occupationInput.trim()]);
      setFormData((prev) => ({
        ...prev,
        preferredOccupation: occupationInput.trim(),
      }));
      setOccupationInput("");
    }
  };

  const handleRemoveOccupation = (idx: number) => {
    setOccupations((prev) => prev.filter((_, i) => i !== idx));
    if (idx === 0) {
      setFormData((prev) => ({
        ...prev,
        preferredOccupation: "",
      }));
    }
  };

  // Form Submission
  const handleSubmit = async () => {
    await saveToSupabase();
    toast.success("Restorative Record submitted!");
  };

  // Step 2: Personal Achievements handlers
  const handleAwardInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setAwardForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAwardDateChange = (date: Date | undefined) => {
    setAwardForm((prev) => ({
      ...prev,
      date: date ? date.toISOString().split("T")[0] : "",
    }));
    setDatePickerOpen(false);
  };
  const handleAwardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setAwardFileError("File size must be less than 2MB");
        return;
      }
      setAwardFileError("");
      setAwardForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleAwardFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setAwardFileError("File size must be less than 2MB");
        return;
      }
      setAwardFileError("");
      setAwardForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleAwardFileDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  const handleAwardFormOpen = () => {
    setShowAwardForm(true);
    setEditingAwardId(null);
    setAwardForm({
      type: "",
      name: "",
      organization: "",
      date: "",
      file: null,
      filePreview: "",
      narrative: "",
    });
  };
  const handleAwardFormClose = () => {
    setShowAwardForm(false);
    setEditingAwardId(null);
  };
  const handleAwardSave = () => {
    if (
      !awardForm.type ||
      !awardForm.name ||
      !awardForm.organization ||
      !awardForm.date
    ) {
      setAwardFormTouched(true);
      return;
    }

    if (editingAwardId) {
      setAwards(
        awards.map((award) =>
          award.id === editingAwardId
            ? { ...award, ...awardForm, id: award.id }
            : award
        )
      );
    } else {
      // Generate a UUID v4 for new award entries
      const newId = crypto.randomUUID();
      setAwards([...awards, { ...awardForm, id: newId }]);
    }

    handleAwardFormClose();
  };
  const handleAwardEdit = (id: string) => {
    const award = awards.find((a) => a.id === id);
    if (award) {
      setAwardForm({
        type: award.type,
        name: award.name,
        organization: award.organization,
        date: award.date,
        file: award.file,
        filePreview: award.filePreview,
        narrative: award.narrative,
      });
      setEditingAwardId(id);
      setShowAwardForm(true);
    }
  };
  const handleAwardDelete = (id: string) => {
    setAwards(awards.filter((a) => a.id !== id));
  };

  // Step 3: Skills handlers
  const handleSkillsInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setSkillsForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSkillsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSkillsFileError("File size must be less than 5MB");
        return;
      }
      setSkillsFileError("");
      setSkillsForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleSkillsFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSkillsFileError("File size must be less than 5MB");
        return;
      }
      setSkillsFileError("");
      setSkillsForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleSkillsFileDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  const handleSkillsFormOpen = () => {
    setShowSkillsForm(true);
    setEditingSkillId(null);
    setSkillsForm({
      softSkills: "",
      hardSkills: "",
      otherSkills: "",
      file: null,
      filePreview: "",
      narrative: "",
    });
  };
  const handleSkillsFormClose = () => {
    setShowSkillsForm(false);
    setEditingSkillId(null);
  };
  const handleSkillsSave = () => {
    if (!skillsForm.softSkills || !skillsForm.hardSkills) {
      return;
    }

    if (editingSkillId) {
      setSkills(
        skills.map((skill) =>
          skill.id === editingSkillId
            ? { ...skill, ...skillsForm, id: skill.id }
            : skill
        )
      );
    } else {
      setSkills([...skills, { ...skillsForm, id: Date.now().toString() }]);
    }

    handleSkillsFormClose();
  };
  const handleSkillsEdit = (id: string) => {
    const skill = skills.find((s) => s.id === id);
    if (skill) {
      setSkillsForm({
        softSkills: skill.softSkills,
        hardSkills: skill.hardSkills,
        otherSkills: skill.otherSkills,
        file: skill.file,
        filePreview: skill.filePreview,
        narrative: skill.narrative,
      });
      setEditingSkillId(id);
      setShowSkillsForm(true);
    }
  };
  const handleSkillsDelete = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  // Step 4: Community Engagement handlers
  const handleEngagementInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEngagementForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEngagementFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setEngagementFileError("File size must be less than 5MB");
        return;
      }
      setEngagementFileError("");
      setEngagementForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleEngagementFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setEngagementFileError("File size must be less than 5MB");
        return;
      }
      setEngagementFileError("");
      setEngagementForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleEngagementFileDragOver = (
    e: React.DragEvent<HTMLLabelElement>
  ) => {
    e.preventDefault();
  };
  const handleEngagementFormOpen = () => {
    setShowEngagementForm(true);
    setEditingEngagementId(null);
    setEngagementForm({
      type: "",
      role: "",
      orgName: "",
      orgWebsite: "",
      details: "",
      file: null,
      filePreview: "",
    });
  };
  const handleEngagementFormClose = () => {
    setShowEngagementForm(false);
    setEditingEngagementId(null);
  };
  const handleEngagementSave = () => {
    if (
      !engagementForm.type ||
      !engagementForm.role ||
      !engagementForm.orgName ||
      !engagementForm.details
    ) {
      return;
    }

    if (editingEngagementId) {
      setEngagements(
        engagements.map((engagement) =>
          engagement.id === editingEngagementId
            ? { ...engagement, ...engagementForm, id: engagement.id }
            : engagement
        )
      );
    } else {
      setEngagements([
        ...engagements,
        { ...engagementForm, id: Date.now().toString() },
      ]);
    }

    handleEngagementFormClose();
  };
  const handleEngagementEdit = (id: string) => {
    const engagement = engagements.find((e) => e.id === id);
    if (engagement) {
      setEngagementForm({
        type: engagement.type,
        role: engagement.role,
        orgName: engagement.orgName,
        orgWebsite: engagement.orgWebsite,
        details: engagement.details,
        file: engagement.file,
        filePreview: engagement.filePreview,
      });
      setEditingEngagementId(id);
      setShowEngagementForm(true);
    }
  };
  const handleEngagementDelete = (id: string) => {
    setEngagements(engagements.filter((e) => e.id !== id));
  };

  // Step 10: Hobbies & Interests state
  const [showHobbiesForm, setShowHobbiesForm] = useState(false);
  const [hobbies, setHobbies] = useState<
    Array<{
      id: string;
      general: string;
      sports: string;
      other: string;
      narrative: string;
      file: File | null;
      filePreview: string;
    }>
  >([]);
  const [editingHobbyId, setEditingHobbyId] = useState<string | null>(null);
  const [hobbiesForm, setHobbiesForm] = useState({
    general: "",
    sports: "",
    other: "",
    narrative: "",
    file: null as File | null,
    filePreview: "",
  });
  const [hobbiesFileError, setHobbiesFileError] = useState("");
  const generalHobbyOptions = [
    "Reading",
    "Writing",
    "Cooking",
    "Gardening",
    "Photography",
    "Music",
    "Art/Drawing",
    "Crafts",
    "Gaming",
    "Technology",
    "Travel",
    "Movies/TV",
    "Volunteering",
    "Collecting",
    "Learning Languages",
    "Other",
  ];
  const sportsOptions = [
    "Basketball",
    "Football",
    "Soccer",
    "Baseball",
    "Tennis",
    "Swimming",
    "Running/Jogging",
    "Cycling",
    "Weightlifting",
    "Yoga",
    "Boxing",
    "Wrestling",
    "Track and Field",
    "Golf",
    "Martial Arts",
    "Dancing",
    "Other",
  ];
  const handleHobbiesInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setHobbiesForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleHobbiesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setHobbiesFileError("File size must be less than 5MB");
        return;
      }
      setHobbiesFileError("");
      setHobbiesForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleHobbiesFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setHobbiesFileError("File size must be less than 5MB");
        return;
      }
      setHobbiesFileError("");
      setHobbiesForm((prev) => ({
        ...prev,
        file,
        filePreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleHobbiesFileDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  const handleHobbiesFormOpen = () => {
    setShowHobbiesForm(true);
    setEditingHobbyId(null);
    setHobbiesForm({
      general: "",
      sports: "",
      other: "",
      narrative: "",
      file: null,
      filePreview: "",
    });
  };
  const handleHobbiesFormClose = () => {
    setShowHobbiesForm(false);
    setEditingHobbyId(null);
  };
  const handleHobbiesSave = () => {
    if (!hobbiesForm.general && !hobbiesForm.sports && !hobbiesForm.other) {
      return;
    }

    if (editingHobbyId) {
      setHobbies(
        hobbies.map((hobby) =>
          hobby.id === editingHobbyId
            ? { ...hobby, ...hobbiesForm, id: hobby.id }
            : hobby
        )
      );
    } else {
      // Generate a UUID v4 for new hobby entries
      const newId = crypto.randomUUID();
      setHobbies([...hobbies, { ...hobbiesForm, id: newId }]);
    }

    handleHobbiesFormClose();
  };
  const handleHobbiesEdit = (id: string) => {
    const hobby = hobbies.find((h) => h.id === id);
    if (hobby) {
      setHobbiesForm({
        general: hobby.general,
        sports: hobby.sports,
        other: hobby.other,
        narrative: hobby.narrative,
        file: hobby.file,
        filePreview: hobby.filePreview,
      });
      setEditingHobbyId(id);
      setShowHobbiesForm(true);
    }
  };
  const handleHobbiesDelete = (id: string) => {
    setHobbies(hobbies.filter((h) => h.id !== id));
  };
  const handleHobbiesClose = () => {
    handleHobbiesFormClose();
  };
  const handleHobbiesUploadClick = () => {
    handleHobbiesFormOpen();
  };

  // Placeholder section UIs
  const renderSection = () => {
    switch (categories[currentCategory]) {
      case "introduction":
        return (
          <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-black mb-2">
              Introduction
            </h2>
            <p className="mb-6 text-secondary">
              Welcome to the Introduction section. Here, you can share your
              preferred occupations, personal narrative, and language
              proficiency. This information helps us understand your background
              and aspirations, setting the foundation for your restorative
              record.
            </p>
            {/* Social Media Profiles */}
            <div className="mb-6">
              <h3 className="font-medium text-black mb-3">
                Social Media Profiles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {socialFields.map((field) => (
                  <input
                    key={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder={field.label}
                  />
                ))}
              </div>
            </div>
            {/* Preferred Occupation */}
            <div className="mb-6">
              <h3 className="font-medium text-black mb-3">
                Preferred Occupation
              </h3>
              <input
                type="text"
                name="occupationInput"
                value={occupationInput}
                onChange={handleOccupationInput}
                onKeyDown={handleOccupationKeyDown}
                className="border border-gray-200 px-4 py-2 rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Type occupation and press Enter"
              />
              <div className="flex flex-wrap gap-2">
                {occupations.map((occ: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-gray-100 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    {occ}
                    <button
                      type="button"
                      onClick={() => handleRemoveOccupation(idx)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="text-xs text-secondary mt-2">
                You can add 10 occupations of your choice
              </div>
            </div>
            {/* Personal Narrative */}
            <div className="mb-6">
              <h3 className="font-medium text-black mb-3">
                Personal Narrative
              </h3>
              <textarea
                name="personalNarrative"
                value={formData.personalNarrative}
                onChange={handleInputChange}
                className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
            {/* Language */}
            <div className="mb-6">
              <h3 className="font-medium text-black mb-3">Language</h3>
              <div className="mb-4">
                <span className="text-primary font-medium mr-1">
                  English Proficiency *
                </span>
                <div className="flex flex-col gap-2 mt-2">
                  {englishOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="languageProficiency"
                        value={opt}
                        checked={formData.languageProficiency === opt}
                        onChange={handleInputChange}
                        className="accent-primary"
                        required
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span className="block mb-2 font-medium text-black">
                  Other Languages
                </span>
                <select
                  name="otherLanguages"
                  value={formData.otherLanguages.join(", ")}
                  onChange={(e) => {
                    const languages = e.target.value
                      .split(",")
                      .map((lang) => lang.trim());
                    setFormData((prev) => ({
                      ...prev,
                      otherLanguages: languages,
                    }));
                  }}
                  className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select a language...</option>
                  {otherLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      case "personal-achievements":
        return (
          <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-black">
                Personal Achievements
              </h2>
              <button
                type="button"
                className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                onClick={handleAwardFormOpen}
              >
                ADD MORE
              </button>
            </div>
            <p className="mb-6 text-secondary">
              Your personal achievements tell a powerful story about your
              journey and growth. Include any milestones, awards, or
              recognitions you've earned—whether before, during, or after
              incarceration. These experiences highlight your resilience,
              dedication, and the positive impact you've made.
            </p>

            {/* List of awards */}
            {awards.length > 0 && (
              <div className="mb-6 space-y-4">
                {awards.map((award) => (
                  <div
                    key={award.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-black">{award.name}</h4>
                        <p className="text-sm text-secondary">
                          {award.type} • {award.organization}
                        </p>
                        <p className="text-sm text-secondary">
                          Awarded: {new Date(award.date).toLocaleDateString()}
                        </p>
                        {award.narrative && (
                          <p className="text-sm mt-2 text-black">
                            {award.narrative}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAwardEdit(award.id)}
                          className="text-primary hover:text-red-600 font-medium text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAwardDelete(award.id)}
                          className="text-primary hover:text-red-600 font-medium text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Award form */}
            {showAwardForm && (
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-black">
                    {editingAwardId ? "Edit Award" : "Add Award or Recognition"}
                  </h3>
                  <button
                    type="button"
                    className="text-2xl text-secondary hover:text-black transition-colors"
                    onClick={handleAwardFormClose}
                  >
                    &times;
                  </button>
                </div>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAwardSave();
                  }}
                >
                  <div>
                    <label className="block font-medium text-black mb-2">
                      Award Type *
                    </label>
                    <select
                      name="type"
                      value={awardForm.type}
                      onChange={handleAwardInputChange}
                      onBlur={() => setAwardFormTouched(true)}
                      className={`border ${
                        awardFormTouched && !awardForm.type
                          ? "border-primary"
                          : "border-gray-200"
                      } px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                      required
                    >
                      <option value="">
                        Select award type from the options
                      </option>
                      {awardTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-black mb-2">
                      Name of Award *
                    </label>
                    <input
                      name="name"
                      value={awardForm.name}
                      onChange={handleAwardInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter name of Award"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-black mb-2">
                      Award Organization *
                    </label>
                    <input
                      name="organization"
                      value={awardForm.organization}
                      onChange={handleAwardInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter Award Organization name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-black mb-2">
                      Date Awarded *
                    </label>
                    <div className="relative">
                      <input
                        ref={dateInputRef}
                        name="date"
                        value={awardForm.date}
                        readOnly
                        className="border border-gray-200 px-4 py-2 rounded-lg w-full pr-10 cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="mm/dd/yyyy"
                        onClick={() => setDatePickerOpen((open) => !open)}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-black transition-colors"
                        onClick={() => setDatePickerOpen((open) => !open)}
                        tabIndex={-1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75z"
                          />
                        </svg>
                      </button>
                      {datePickerOpen && (
                        <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg left-0">
                          <DayPicker
                            mode="single"
                            selected={
                              awardForm.date
                                ? new Date(awardForm.date)
                                : undefined
                            }
                            onSelect={handleAwardDateChange}
                            initialFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-black mb-2">
                      Upload optional supporting file (image or pdf)
                    </label>
                    <label
                      htmlFor="award-file-upload"
                      onDrop={handleAwardFileDrop}
                      onDragOver={handleAwardFileDragOver}
                      className="block cursor-pointer border-dashed border-2 border-gray-200 rounded-lg min-h-[100px] flex flex-col items-center justify-center bg-gray-50 relative text-center transition hover:border-primary"
                    >
                      <input
                        id="award-file-upload"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleAwardFileChange}
                        className="hidden"
                      />
                      {!awardForm.filePreview && (
                        <>
                          <svg
                            className="w-10 h-10 text-gray-300 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                            />
                          </svg>
                          <span className="text-secondary text-sm">
                            Click to upload or drag and drop
                            <br />
                            Images or PDF (max 2MB)
                          </span>
                        </>
                      )}
                      {awardForm.filePreview && (
                        <div className="mt-2 w-full flex flex-col items-center">
                          {awardForm.file?.type.startsWith("image/") ? (
                            <img
                              src={awardForm.filePreview}
                              alt="Preview"
                              className="max-h-32 mx-auto"
                            />
                          ) : (
                            <a
                              href={awardForm.filePreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-red-600"
                            >
                              View PDF
                            </a>
                          )}
                        </div>
                      )}
                      {awardFileError && (
                        <div className="text-primary text-xs mt-2">
                          {awardFileError}
                        </div>
                      )}
                    </label>
                  </div>
                  <div>
                    <label className="block font-medium text-black mb-2">
                      Narrative
                    </label>
                    <textarea
                      name="narrative"
                      value={awardForm.narrative}
                      onChange={handleAwardInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Provide a narrative about this achievement or recognition. Describe its significance, your role, and what it means to you."
                      maxLength={500}
                    />
                    <div className="text-xs text-secondary text-right mt-1">
                      {awardForm.narrative.length}/500 characters
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {editingAwardId ? "Update Award" : "Save Award"}
                    </button>
                    <button
                      type="button"
                      onClick={handleAwardFormClose}
                      className="px-4 py-2 bg-gray-200 text-secondary font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      case "skills":
        return (
          <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-black">Skills</h2>
              <button
                type="button"
                className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                onClick={handleSkillsFormOpen}
              >
                ADD MORE
              </button>
            </div>
            <p className="mb-6 text-secondary">
              Your skills—both hard and soft—are a key part of your story. List
              any abilities, talents, or expertise you've developed through
              work, education, volunteering, or personal experience. Don't
              forget to include skills gained during incarceration or through
              self-study. These show your readiness and value to future
              employers.
            </p>

            {/* List of skills */}
            {skills.length > 0 && (
              <div className="mb-6 space-y-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="border rounded p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Skills Set</h4>
                        <p className="text-sm text-secondary">
                          Soft Skills: {skill.softSkills}
                        </p>
                        <p className="text-sm text-secondary">
                          Hard Skills: {skill.hardSkills}
                        </p>
                        {skill.otherSkills && (
                          <p className="text-sm text-secondary">
                            Other Skills: {skill.otherSkills}
                          </p>
                        )}
                        {skill.narrative && (
                          <p className="text-sm mt-2">{skill.narrative}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSkillsEdit(skill.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSkillsDelete(skill.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills form */}
            {showSkillsForm && (
              <div className="border rounded p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">
                    {editingSkillId ? "Edit Skills" : "Add Skills"}
                  </h3>
                  <button
                    type="button"
                    className="text-2xl text-secondary hover:text-black"
                    onClick={handleSkillsFormClose}
                  >
                    &times;
                  </button>
                </div>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSkillsSave();
                  }}
                >
                  <div>
                    <label className="block font-medium mb-1">
                      Soft Skills *
                    </label>
                    <select
                      name="softSkills"
                      value={skillsForm.softSkills}
                      onChange={handleSkillsInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    >
                      <option value="">
                        Select your Soft Skills from the options below
                      </option>
                      {softSkillsOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Hard Skills *
                    </label>
                    <select
                      name="hardSkills"
                      value={skillsForm.hardSkills}
                      onChange={handleSkillsInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    >
                      <option value="">
                        Select your Hard Skills from the options below
                      </option>
                      {hardSkillsOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Other Skills
                    </label>
                    <textarea
                      name="otherSkills"
                      value={skillsForm.otherSkills}
                      onChange={handleSkillsInputChange}
                      className="border p-2 rounded w-full min-h-[60px]"
                      placeholder="List any additional skills not covered above"
                      maxLength={500}
                    />
                    <div className="text-xs text-secondary text-right">
                      {skillsForm.otherSkills.length}/500 characters
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Upload optional supporting file (image or pdf)
                    </label>
                    <label
                      htmlFor="skills-file-upload"
                      onDrop={handleSkillsFileDrop}
                      onDragOver={handleSkillsFileDragOver}
                      className="block cursor-pointer border-dashed border-2 border-gray-200 rounded min-h-[100px] flex flex-col items-center justify-center bg-gray-50 relative text-center transition hover:border-black"
                    >
                      <input
                        id="skills-file-upload"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleSkillsFileChange}
                        className="hidden"
                      />
                      {!skillsForm.filePreview && (
                        <>
                          <svg
                            className="w-10 h-10 text-gray-300 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                            />
                          </svg>
                          <span className="text-secondary text-sm">
                            Click to upload or drag and drop
                            <br />
                            Images or PDF (max 5MB)
                          </span>
                        </>
                      )}
                      {skillsForm.filePreview && (
                        <div className="mt-2 w-full flex flex-col items-center">
                          {skillsForm.file?.type.startsWith("image/") ? (
                            <img
                              src={skillsForm.filePreview}
                              alt="Preview"
                              className="max-h-32 mx-auto"
                            />
                          ) : (
                            <a
                              href={skillsForm.filePreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              View PDF
                            </a>
                          )}
                        </div>
                      )}
                      {skillsFileError && (
                        <div className="text-red-500 text-xs mt-2">
                          {skillsFileError}
                        </div>
                      )}
                    </label>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Narrative</label>
                    <textarea
                      name="narrative"
                      value={skillsForm.narrative}
                      onChange={handleSkillsInputChange}
                      className="border p-2 rounded w-full min-h-[80px]"
                      placeholder="Provide a narrative about your skills. Describe how you developed them, their significance, and how they have helped you."
                      maxLength={500}
                    />
                    <div className="text-xs text-secondary text-right">
                      {skillsForm.narrative.length}/500 characters
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {editingSkillId ? "Update Skills" : "Save Skills"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSkillsFormClose}
                      className="px-4 py-2 bg-gray-200 text-secondary font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      case "community-engagement":
        return (
          <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-black">
                Community Engagement
              </h2>
              <button
                type="button"
                className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                onClick={handleEngagementFormOpen}
              >
                ADD MORE
              </button>
            </div>
            <p className="mb-6 text-secondary">
              Community engagement and volunteering show your commitment to
              giving back and being part of something bigger than yourself. List
              any volunteer work, advocacy, or community service—before, during,
              or after incarceration. These experiences highlight your values,
              teamwork, and positive impact.
            </p>

            {/* List of engagements */}
            {engagements.length > 0 && (
              <div className="mb-6 space-y-4">
                {engagements.map((engagement) => (
                  <div
                    key={engagement.id}
                    className="border rounded p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{engagement.role}</h4>
                        <p className="text-sm text-secondary">
                          {engagement.type} • {engagement.orgName}
                        </p>
                        {engagement.orgWebsite && (
                          <p className="text-sm text-blue-500">
                            <a
                              href={engagement.orgWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {engagement.orgWebsite}
                            </a>
                          </p>
                        )}
                        {engagement.details && (
                          <p className="text-sm mt-2">{engagement.details}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEngagementEdit(engagement.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEngagementDelete(engagement.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Engagement form */}
            {showEngagementForm && (
              <div className="border rounded p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">
                    {editingEngagementId
                      ? "Edit Community Engagement"
                      : "Add Community Engagement"}
                  </h3>
                  <button
                    type="button"
                    className="text-2xl text-secondary hover:text-black"
                    onClick={handleEngagementFormClose}
                  >
                    &times;
                  </button>
                </div>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEngagementSave();
                  }}
                >
                  <div>
                    <label className="block font-medium mb-1">
                      Community Engagement Type *
                    </label>
                    <select
                      name="type"
                      value={engagementForm.type}
                      onChange={handleEngagementInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    >
                      <option value="">
                        Select Community Engagement type from the options
                      </option>
                      {engagementTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Engagement role *
                    </label>
                    <input
                      name="role"
                      value={engagementForm.role}
                      onChange={handleEngagementInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your engagement role"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Organization or Event name *
                    </label>
                    <input
                      name="orgName"
                      value={engagementForm.orgName}
                      onChange={handleEngagementInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your organization or event name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Organization or Event website
                    </label>
                    <input
                      name="orgWebsite"
                      value={engagementForm.orgWebsite}
                      onChange={handleEngagementInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your organization or event website (optional)"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Involvement details *
                    </label>
                    <textarea
                      name="details"
                      value={engagementForm.details}
                      onChange={handleEngagementInputChange}
                      className="border p-2 rounded w-full min-h-[80px]"
                      placeholder="Define in your words how you contributed or participated in this engagement and what that means to you"
                      maxLength={500}
                      required
                    />
                    <div className="text-xs text-secondary text-right">
                      {engagementForm.details.length}/500 characters
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Upload optional supporting file (image or pdf)
                    </label>
                    <label
                      htmlFor="engagement-file-upload"
                      onDrop={handleEngagementFileDrop}
                      onDragOver={handleEngagementFileDragOver}
                      className="block cursor-pointer border-dashed border-2 border-gray-200 rounded min-h-[100px] flex flex-col items-center justify-center bg-gray-50 relative text-center transition hover:border-black"
                    >
                      <input
                        id="engagement-file-upload"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleEngagementFileChange}
                        className="hidden"
                      />
                      {!engagementForm.filePreview && (
                        <>
                          <svg
                            className="w-10 h-10 text-gray-300 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                            />
                          </svg>
                          <span className="text-secondary text-sm">
                            Click to upload or drag and drop
                            <br />
                            Images or PDF (max 5MB)
                          </span>
                        </>
                      )}
                      {engagementForm.filePreview && (
                        <div className="mt-2 w-full flex flex-col items-center">
                          {engagementForm.file?.type.startsWith("image/") ? (
                            <img
                              src={engagementForm.filePreview}
                              alt="Preview"
                              className="max-h-32 mx-auto"
                            />
                          ) : (
                            <a
                              href={engagementForm.filePreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              View PDF
                            </a>
                          )}
                        </div>
                      )}
                      {engagementFileError && (
                        <div className="text-red-500 text-xs mt-2">
                          {engagementFileError}
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {editingEngagementId
                        ? "Update Engagement"
                        : "Save Engagement"}
                    </button>
                    <button
                      type="button"
                      onClick={handleEngagementFormClose}
                      className="px-4 py-2 bg-gray-200 text-secondary font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      case "rehabilitative-programs":
        return (
          <div className="p-6 bg-white rounded shadow relative">
            <h2 className="text-2xl font-bold mb-2">Rehabilitative Programs</h2>
            <p className="mb-6 text-secondary">
              Listing your participation in rehabilitative programs highlights
              your resilience, growth, and commitment to positive change.
              Include any programs you completed before, during, or after
              incarceration—these experiences show your dedication to
              self-improvement and your readiness for new opportunities.
            </p>
            <div className="space-y-4">
              {rehabProgramsList.map((prog) => {
                const programKey = prog.key as RehabProgramKey;
                return (
                  <div key={prog.key} className="border rounded p-4 bg-white">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rehabPrograms[programKey]}
                        onChange={() => handleRehabCheckbox(programKey)}
                        className="mt-1 accent-red-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{prog.label}</div>
                        <div className="text-sm text-secondary mt-1">
                          {prog.desc}
                        </div>
                        {rehabPrograms[programKey] && (
                          <div>
                            <textarea
                              className="border p-2 rounded w-full min-h-[60px]"
                              placeholder="Describe your experience with this program. Describe its value, how it helped you, and any outcomes."
                              value={
                                rehabPrograms[
                                  `${programKey}Details` as RehabProgramDetailsKey
                                ]
                              }
                              onChange={(e) =>
                                handleRehabDetailsChange(
                                  programKey,
                                  e.target.value
                                )
                              }
                              maxLength={500}
                            />
                            <div className="text-xs text-secondary text-right">
                              {
                                rehabPrograms[
                                  `${programKey}Details` as RehabProgramDetailsKey
                                ].length
                              }
                              /500 characters
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "microcredentials":
        return (
          <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-black">
                Microcredentials and Certifications
              </h2>
              <button
                type="button"
                className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                onClick={handleMicroFormOpen}
              >
                ADD MORE
              </button>
            </div>
            <p className="mb-6 text-secondary">
              Microcredentials, certifications, and licenses are valuable proof
              of your skills and commitment to learning. Include any
              certificates, training, or credentials you've earned—whether
              through formal education, online courses, or programs completed
              during incarceration or reentry. These achievements help you prove
              your expertise and dedication.
            </p>

            {/* List of microcredentials */}
            {microcredentials.length > 0 && (
              <div className="mb-6 space-y-4">
                {microcredentials.map((micro) => (
                  <div key={micro.id} className="border rounded p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{micro.name}</h4>
                        <p className="text-sm text-secondary">{micro.org}</p>
                        <p className="text-sm text-secondary">
                          Issued:{" "}
                          {new Date(micro.issueDate).toLocaleDateString()}
                          {micro.expiryDate &&
                            ` • Expires: ${new Date(
                              micro.expiryDate
                            ).toLocaleDateString()}`}
                        </p>
                        {micro.credentialId && (
                          <p className="text-sm text-secondary">
                            ID: {micro.credentialId}
                          </p>
                        )}
                        {micro.credentialUrl && (
                          <p className="text-sm text-blue-500">
                            <a
                              href={micro.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Credential
                            </a>
                          </p>
                        )}
                        {micro.narrative && (
                          <p className="text-sm mt-2">{micro.narrative}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleMicroEdit(micro.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMicroDelete(micro.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Microcredential form */}
            {showMicroForm && (
              <div className="border rounded p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">
                    {editingMicroId
                      ? "Edit Microcredential"
                      : "Add Microcredential / Certification"}
                  </h3>
                  <button
                    type="button"
                    className="text-2xl text-secondary hover:text-black"
                    onClick={handleMicroFormClose}
                  >
                    &times;
                  </button>
                </div>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleMicroSave();
                  }}
                >
                  <div>
                    <label className="block font-medium mb-1">
                      Certification or Microcredential name *
                    </label>
                    <input
                      name="name"
                      value={microForm.name}
                      onChange={handleMicroInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter certification or microcredential name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Issuing organization *
                    </label>
                    <input
                      name="org"
                      value={microForm.org}
                      onChange={handleMicroInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter name of issuing organization"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Issue Date *
                    </label>
                    <div className="relative">
                      <input
                        ref={microIssueDateInputRef}
                        name="issueDate"
                        value={microForm.issueDate}
                        readOnly
                        className="border p-2 rounded w-full pr-10 cursor-pointer bg-white"
                        placeholder="mm/dd/yyyy"
                        onClick={() =>
                          setMicroIssueDatePickerOpen((open) => !open)
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-black"
                        onClick={() =>
                          setMicroIssueDatePickerOpen((open) => !open)
                        }
                        tabIndex={-1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75z"
                          />
                        </svg>
                      </button>
                      {microIssueDatePickerOpen && (
                        <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg left-0">
                          <DayPicker
                            mode="single"
                            selected={
                              microForm.issueDate
                                ? new Date(microForm.issueDate)
                                : undefined
                            }
                            onSelect={handleMicroIssueDateChange}
                            initialFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <input
                        ref={microExpiryDateInputRef}
                        name="expiryDate"
                        value={microForm.expiryDate}
                        readOnly
                        className="border p-2 rounded w-full pr-10 cursor-pointer bg-white"
                        placeholder="mm/dd/yyyy"
                        onClick={() =>
                          setMicroExpiryDatePickerOpen((open) => !open)
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-black"
                        onClick={() =>
                          setMicroExpiryDatePickerOpen((open) => !open)
                        }
                        tabIndex={-1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75z"
                          />
                        </svg>
                      </button>
                      {microExpiryDatePickerOpen && (
                        <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg left-0">
                          <DayPicker
                            mode="single"
                            selected={
                              microForm.expiryDate
                                ? new Date(microForm.expiryDate)
                                : undefined
                            }
                            onSelect={handleMicroExpiryDateChange}
                            initialFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Credential ID
                    </label>
                    <input
                      name="credentialId"
                      value={microForm.credentialId}
                      onChange={handleMicroInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter credential ID of the issuing organization"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Credential URL
                    </label>
                    <input
                      name="credentialUrl"
                      value={microForm.credentialUrl}
                      onChange={handleMicroInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter credential URL of the issuing organization"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Narrative</label>
                    <textarea
                      name="narrative"
                      value={microForm.narrative}
                      onChange={handleMicroInputChange}
                      className="border p-2 rounded w-full min-h-[80px]"
                      placeholder="Describe what this credential means to you and how it has helped in your journey."
                      maxLength={500}
                    />
                    <div className="text-xs text-secondary text-right">
                      {microForm.narrative.length}/500 characters
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Upload optional supporting file (image or pdf)
                    </label>
                    <label
                      htmlFor="micro-file-upload"
                      onDrop={handleMicroFileDrop}
                      onDragOver={handleMicroFileDragOver}
                      className="block cursor-pointer border-dashed border-2 border-gray-200 rounded min-h-[100px] flex flex-col items-center justify-center bg-gray-50 relative text-center transition hover:border-black"
                    >
                      <input
                        id="micro-file-upload"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleMicroFileChange}
                        className="hidden"
                      />
                      {!microForm.filePreview && (
                        <>
                          <svg
                            className="w-10 h-10 text-gray-300 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                            />
                          </svg>
                          <span className="text-secondary text-sm">
                            Click to upload or drag and drop
                            <br />
                            Images or PDF (max 5MB)
                          </span>
                        </>
                      )}
                      {microForm.filePreview && (
                        <div className="mt-2 w-full flex flex-col items-center">
                          {microForm.file?.type.startsWith("image/") ? (
                            <img
                              src={microForm.filePreview}
                              alt="Preview"
                              className="max-h-32 mx-auto"
                            />
                          ) : (
                            <a
                              href={microForm.filePreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              View PDF
                            </a>
                          )}
                        </div>
                      )}
                      {microFileError && (
                        <div className="text-red-500 text-xs mt-2">
                          {microFileError}
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {editingMicroId ? "Update Credential" : "Save Credential"}
                    </button>
                    <button
                      type="button"
                      onClick={handleMicroFormClose}
                      className="px-4 py-2 bg-gray-200 text-secondary font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      case "mentors":
        return (
          <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-black">
                Mentors & Recommendations
              </h2>
              <button
                type="button"
                className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                onClick={handleMentorFormOpen}
              >
                ADD MORE
              </button>
            </div>
            <p className="mb-4 text-secondary">
              Mentors and recommendations can make a big difference in your
              journey. List anyone who has supported, guided, or advocated for
              you—whether personally, professionally, or during your time in a
              program. Their support helps show your growth, character, and
              readiness for new opportunities.
            </p>
            <p className="mb-6 text-secondary">
              List mentors or advisors who have guided you to amplify your
              credibility and open doors to new opportunities.
            </p>

            {/* List of mentors */}
            {mentors.length > 0 && (
              <div className="mb-6 space-y-4">
                {mentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="border rounded p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{mentor.name}</h4>
                        <p className="text-sm text-secondary">
                          {mentor.title} • {mentor.company}
                        </p>
                        {mentor.email && (
                          <p className="text-sm text-secondary">
                            Email: {mentor.email}
                          </p>
                        )}
                        {mentor.phone && (
                          <p className="text-sm text-secondary">
                            Phone: {mentor.phone}
                          </p>
                        )}
                        {mentor.linkedin && (
                          <p className="text-sm text-blue-500">
                            <a
                              href={mentor.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              LinkedIn Profile
                            </a>
                          </p>
                        )}
                        {mentor.website && (
                          <p className="text-sm text-blue-500">
                            <a
                              href={mentor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Website
                            </a>
                          </p>
                        )}
                        {mentor.narrative && (
                          <p className="text-sm mt-2">{mentor.narrative}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleMentorEdit(mentor.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMentorDelete(mentor.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mentor form */}
            {showMentorForm && (
              <div className="border rounded p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">
                    {editingMentorId ? "Edit Mentor" : "Add Mentor Information"}
                  </h3>
                  <button
                    type="button"
                    className="text-2xl text-secondary hover:text-black"
                    onClick={handleMentorFormClose}
                  >
                    &times;
                  </button>
                </div>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleMentorSave();
                  }}
                >
                  <div>
                    <label className="block font-medium mb-1">
                      LinkedIn Profile
                    </label>
                    <input
                      name="linkedin"
                      value={mentorForm.linkedin}
                      onChange={handleMentorInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="https://www.linkedin.com/in/mentor-profile"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Name of Mentor *
                    </label>
                    <input
                      name="name"
                      value={mentorForm.name}
                      onChange={handleMentorInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter mentor's full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Company *</label>
                    <input
                      name="company"
                      value={mentorForm.company}
                      onChange={handleMentorInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Title/Position *
                    </label>
                    <input
                      name="title"
                      value={mentorForm.title}
                      onChange={handleMentorInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter mentor's title or position"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Email address
                    </label>
                    <input
                      name="email"
                      value={mentorForm.email}
                      onChange={handleMentorInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="mentor@example.com"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Phone number
                    </label>
                    <input
                      name="phone"
                      value={mentorForm.phone}
                      onChange={handleMentorInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="(000) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Website</label>
                    <input
                      name="website"
                      value={mentorForm.website}
                      onChange={handleMentorInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Narrative</label>
                    <textarea
                      name="narrative"
                      value={mentorForm.narrative}
                      onChange={handleMentorInputChange}
                      className="border p-2 rounded w-full min-h-[80px]"
                      placeholder="Describe how this mentor supported you, what you learned from them, or why their recommendation is meaningful."
                      maxLength={500}
                    />
                    <div className="text-xs text-secondary text-right">
                      {mentorForm.narrative.length}/500 characters
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {editingMentorId ? "Update Mentor" : "Save Mentor"}
                    </button>
                    <button
                      type="button"
                      onClick={handleMentorFormClose}
                      className="px-4 py-2 bg-gray-200 text-secondary font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      case "education":
        return (
          <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-black">Education</h2>
              <button
                type="button"
                className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                onClick={handleEducationFormOpen}
              >
                ADD MORE
              </button>
            </div>
            <p className="mb-4 text-secondary">
              No matter the level—high school, GED, associate's degree, all the
              way up to a PhD—every educational experience helps tell your story
              and shows the progress you've made.
            </p>
            <p className="mb-6 text-secondary">
              Be sure to include any education you completed while incarcerated
              or through an alternative-to-incarceration program—these
              experiences demonstrate your commitment to growth and learning in
              challenging circumstances.
            </p>

            {/* List of educations */}
            {educations.length > 0 && (
              <div className="mb-6 space-y-4">
                {educations.map((education) => (
                  <div
                    key={education.id}
                    className="border rounded p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">
                          {education.degree} in {education.field}
                        </h4>
                        <p className="text-sm text-secondary">
                          {education.school} • {education.location}
                        </p>
                        <p className="text-sm text-secondary">
                          {new Date(education.startDate).toLocaleDateString()} -
                          {education.currentlyEnrolled
                            ? " Present"
                            : ` ${new Date(
                                education.endDate
                              ).toLocaleDateString()}`}
                        </p>
                        {education.grade && (
                          <p className="text-sm text-secondary">
                            Grade: {education.grade}
                          </p>
                        )}
                        {education.description && (
                          <p className="text-sm mt-2">
                            {education.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEducationEdit(education.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEducationDelete(education.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Education form */}
            {showEducationForm && (
              <div className="border rounded p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">
                    {editingEducationId ? "Edit Education" : "Add Education"}
                  </h3>
                  <button
                    type="button"
                    className="text-2xl text-secondary hover:text-black"
                    onClick={handleEducationFormClose}
                  >
                    &times;
                  </button>
                </div>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEducationSave();
                  }}
                >
                  <div>
                    <label className="block font-medium mb-1">
                      School's Name *
                    </label>
                    <input
                      name="school"
                      value={educationForm.school}
                      onChange={handleEducationInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter the name of your school"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      School's location *
                    </label>
                    <input
                      name="location"
                      value={educationForm.location}
                      onChange={handleEducationInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your school's location"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Degree *</label>
                    <input
                      name="degree"
                      value={educationForm.degree}
                      onChange={handleEducationInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter the degree you obtained"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Field of Study *
                    </label>
                    <input
                      name="field"
                      value={educationForm.field}
                      onChange={handleEducationInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your field of study"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="currentlyEnrolled"
                      checked={educationForm.currentlyEnrolled}
                      onChange={handleEducationInputChange}
                      className="accent-red-500"
                    />
                    <label className="font-medium">
                      I am currently enrolled here
                    </label>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block font-medium mb-1">
                        Start Date *
                      </label>
                      <div className="relative">
                        <input
                          ref={educationStartDateInputRef}
                          name="startDate"
                          value={educationForm.startDate}
                          readOnly
                          className="border p-2 rounded w-full pr-10 cursor-pointer bg-white"
                          placeholder="MM/DD/YYYY"
                          onClick={() =>
                            setEducationStartDatePickerOpen((open) => !open)
                          }
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-black"
                          onClick={() =>
                            setEducationStartDatePickerOpen((open) => !open)
                          }
                          tabIndex={-1}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75z"
                            />
                          </svg>
                        </button>
                        {educationStartDatePickerOpen && (
                          <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg left-0">
                            <DayPicker
                              mode="single"
                              selected={
                                educationForm.startDate
                                  ? new Date(educationForm.startDate)
                                  : undefined
                              }
                              onSelect={handleEducationStartDateChange}
                              initialFocus
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block font-medium mb-1">
                        End Date {!educationForm.currentlyEnrolled && "*"}
                      </label>
                      <div className="relative">
                        <input
                          ref={educationEndDateInputRef}
                          name="endDate"
                          value={educationForm.endDate}
                          readOnly
                          className="border p-2 rounded w-full pr-10 cursor-pointer bg-white"
                          placeholder="MM/DD/YYYY"
                          onClick={() =>
                            setEducationEndDatePickerOpen((open) => !open)
                          }
                          disabled={educationForm.currentlyEnrolled}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-black"
                          onClick={() =>
                            setEducationEndDatePickerOpen((open) => !open)
                          }
                          tabIndex={-1}
                          disabled={educationForm.currentlyEnrolled}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75z"
                            />
                          </svg>
                        </button>
                        {educationEndDatePickerOpen &&
                          !educationForm.currentlyEnrolled && (
                            <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg left-0">
                              <DayPicker
                                mode="single"
                                selected={
                                  educationForm.endDate
                                    ? new Date(educationForm.endDate)
                                    : undefined
                                }
                                onSelect={handleEducationEndDateChange}
                                initialFocus
                              />
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Grade</label>
                    <input
                      name="grade"
                      value={educationForm.grade}
                      onChange={handleEducationInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your grade"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Description of the experience
                    </label>
                    <textarea
                      name="description"
                      value={educationForm.description}
                      onChange={handleEducationInputChange}
                      className="border p-2 rounded w-full min-h-[80px]"
                      placeholder="Summarize your education, degrees, and relevant coursework. Highlight how your academic experience prepares you to contribute to the organization's goals"
                      maxLength={700}
                    />
                    <div className="text-xs text-secondary text-right">
                      {educationForm.description.length}/700 characters
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Upload optional supporting file (image or pdf)
                    </label>
                    <label
                      htmlFor="education-file-upload"
                      onDrop={handleEducationFileDrop}
                      onDragOver={handleEducationFileDragOver}
                      className="block cursor-pointer border-dashed border-2 border-gray-200 rounded min-h-[100px] flex flex-col items-center justify-center bg-gray-50 relative text-center transition hover:border-black"
                    >
                      <input
                        id="education-file-upload"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleEducationFileChange}
                        className="hidden"
                      />
                      {!educationForm.filePreview && (
                        <>
                          <svg
                            className="w-10 h-10 text-gray-300 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                            />
                          </svg>
                          <span className="text-secondary text-sm">
                            Click to upload or drag and drop
                            <br />
                            Images or PDF (max 5MB)
                          </span>
                        </>
                      )}
                      {educationForm.filePreview && (
                        <div className="mt-2 w-full flex flex-col items-center">
                          {educationForm.file?.type.startsWith("image/") ? (
                            <img
                              src={educationForm.filePreview}
                              alt="Preview"
                              className="max-h-32 mx-auto"
                            />
                          ) : (
                            <a
                              href={educationForm.filePreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              View PDF
                            </a>
                          )}
                        </div>
                      )}
                      {educationFileError && (
                        <div className="text-red-500 text-xs mt-2">
                          {educationFileError}
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {editingEducationId
                        ? "Update Education"
                        : "Save Education"}
                    </button>
                    <button
                      type="button"
                      onClick={handleEducationFormClose}
                      className="px-4 py-2 bg-gray-200 text-secondary font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      case "employment-history":
        return (
          <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-black">
                Employment History
              </h2>
              <button
                type="button"
                className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                onClick={handleEmploymentFormOpen}
              >
                ADD MORE
              </button>
            </div>
            <p className="mb-6 text-secondary">
              Share your employment profile with us at Restorative Records.
            </p>

            {/* List of employments */}
            {employments.length > 0 && (
              <div className="mb-6 space-y-4">
                {employments.map((employment) => (
                  <div
                    key={employment.id}
                    className="border rounded p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{employment.title}</h4>
                        <p className="text-sm text-secondary">
                          {employment.company} • {employment.employmentType}
                        </p>
                        {(employment.city || employment.state) && (
                          <p className="text-sm text-secondary">
                            {employment.city}
                            {employment.city && employment.state && ", "}
                            {employment.state}
                          </p>
                        )}
                        <p className="text-sm text-secondary">
                          {new Date(employment.startDate).toLocaleDateString()}{" "}
                          -
                          {employment.currentlyEmployed
                            ? " Present"
                            : ` ${new Date(
                                employment.endDate
                              ).toLocaleDateString()}`}
                        </p>
                        {employment.employedWhileIncarcerated && (
                          <p className="text-sm text-red-600">
                            Employed while incarcerated
                          </p>
                        )}
                        {employment.companyUrl && (
                          <p className="text-sm text-blue-500">
                            <a
                              href={employment.companyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Company Website
                            </a>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEmploymentEdit(employment.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEmploymentDelete(employment.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Employment form */}
            {showEmploymentForm && (
              <div className="border rounded p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">
                    {editingEmploymentId
                      ? "Edit Employment"
                      : "Add Employment Information"}
                  </h3>
                  <button
                    type="button"
                    className="text-2xl text-secondary hover:text-black"
                    onClick={handleEmploymentFormClose}
                  >
                    &times;
                  </button>
                </div>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEmploymentSave();
                  }}
                >
                  <div>
                    <label className="block font-medium mb-1">State</label>
                    <select
                      name="state"
                      value={employmentForm.state}
                      onChange={handleEmploymentInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">Select state</option>
                      {usStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">City</label>
                    <input
                      name="city"
                      value={employmentForm.city}
                      onChange={handleEmploymentInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Employment Type *
                    </label>
                    <select
                      name="employmentType"
                      value={employmentForm.employmentType}
                      onChange={handleEmploymentInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select employment type</option>
                      {employmentTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Title/Position *
                    </label>
                    <input
                      name="title"
                      value={employmentForm.title}
                      onChange={handleEmploymentInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your title or position"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Company *</label>
                    <input
                      name="company"
                      value={employmentForm.company}
                      onChange={handleEmploymentInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Company URL
                    </label>
                    <input
                      name="companyUrl"
                      value={employmentForm.companyUrl}
                      onChange={handleEmploymentInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="https://www.company.com"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block font-medium mb-1">
                        Start Date *
                      </label>
                      <div className="relative">
                        <input
                          ref={employmentStartDateInputRef}
                          name="startDate"
                          value={employmentForm.startDate}
                          readOnly
                          className="border p-2 rounded w-full pr-10 cursor-pointer bg-white"
                          placeholder="MM/DD/YYYY"
                          onClick={() =>
                            setEmploymentStartDatePickerOpen((open) => !open)
                          }
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-black"
                          onClick={() =>
                            setEmploymentStartDatePickerOpen((open) => !open)
                          }
                          tabIndex={-1}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75z"
                            />
                          </svg>
                        </button>
                        {employmentStartDatePickerOpen && (
                          <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg left-0">
                            <DayPicker
                              mode="single"
                              selected={
                                employmentForm.startDate
                                  ? new Date(employmentForm.startDate)
                                  : undefined
                              }
                              onSelect={handleEmploymentStartDateChange}
                              initialFocus
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block font-medium mb-1">End Date</label>
                      <div className="relative">
                        <input
                          ref={employmentEndDateInputRef}
                          name="endDate"
                          value={employmentForm.endDate}
                          readOnly
                          className="border p-2 rounded w-full pr-10 cursor-pointer bg-white"
                          placeholder="MM/DD/YYYY"
                          onClick={() =>
                            setEmploymentEndDatePickerOpen((open) => !open)
                          }
                          disabled={employmentForm.currentlyEmployed}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-black"
                          onClick={() =>
                            setEmploymentEndDatePickerOpen((open) => !open)
                          }
                          tabIndex={-1}
                          disabled={employmentForm.currentlyEmployed}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75z"
                            />
                          </svg>
                        </button>
                        {employmentEndDatePickerOpen &&
                          !employmentForm.currentlyEmployed && (
                            <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg left-0">
                              <DayPicker
                                mode="single"
                                selected={
                                  employmentForm.endDate
                                    ? new Date(employmentForm.endDate)
                                    : undefined
                                }
                                onSelect={handleEmploymentEndDateChange}
                                initialFocus
                              />
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="currentlyEmployed"
                      checked={employmentForm.currentlyEmployed}
                      onChange={handleEmploymentInputChange}
                      className="accent-red-500"
                    />
                    <label className="font-medium">
                      I am currently employed at this job
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="employedWhileIncarcerated"
                      checked={employmentForm.employedWhileIncarcerated}
                      onChange={handleEmploymentInputChange}
                      className="accent-red-500"
                    />
                    <label className="font-medium">
                      I was employed in this role while I was incarcerated
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {editingEmploymentId
                        ? "Update Employment"
                        : "Save Employment"}
                    </button>
                    <button
                      type="button"
                      onClick={handleEmploymentFormClose}
                      className="px-4 py-2 bg-gray-200 text-secondary font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      case "hobbies":
        return (
          <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-black">
                Hobbies & Interests
              </h2>
              <button
                type="button"
                className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                onClick={handleHobbiesUploadClick}
              >
                ADD MORE
              </button>
            </div>
            <p className="mb-6 text-secondary">
              Hobbies and interests are a great way to showcase your diverse
              range of activities and passions. List any hobbies, sports, or
              other interests you enjoy, and describe why they are meaningful to
              you.
            </p>

            {/* List of hobbies */}
            {hobbies.length > 0 && (
              <div className="mb-6 space-y-4">
                {hobbies.map((hobby) => (
                  <div key={hobby.id} className="border rounded p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{hobby.general}</h4>
                        <p className="text-sm text-secondary">{hobby.sports}</p>
                        <p className="text-sm text-secondary">{hobby.other}</p>
                        {hobby.narrative && (
                          <p className="text-sm mt-2">{hobby.narrative}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleHobbiesEdit(hobby.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHobbiesDelete(hobby.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hobbies form */}
            {showHobbiesForm && (
              <div className="border rounded p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">
                    {editingHobbyId ? "Edit Hobby" : "Add Hobby"}
                  </h3>
                  <button
                    type="button"
                    className="text-2xl text-secondary hover:text-black"
                    onClick={handleHobbiesClose}
                  >
                    &times;
                  </button>
                </div>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleHobbiesSave();
                  }}
                >
                  <div>
                    <label className="block font-medium mb-1">
                      General Hobby
                    </label>
                    <input
                      name="general"
                      value={hobbiesForm.general}
                      onChange={handleHobbiesInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your general hobby"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Sports</label>
                    <input
                      name="sports"
                      value={hobbiesForm.sports}
                      onChange={handleHobbiesInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your sports interest"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Other Interests
                    </label>
                    <input
                      name="other"
                      value={hobbiesForm.other}
                      onChange={handleHobbiesInputChange}
                      className="border border-gray-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter any other interests"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Narrative</label>
                    <textarea
                      name="narrative"
                      value={hobbiesForm.narrative}
                      onChange={handleHobbiesInputChange}
                      className="border p-2 rounded w-full min-h-[80px]"
                      placeholder="Describe why this hobby or interest is meaningful to you"
                      maxLength={500}
                    />
                    <div className="text-xs text-secondary text-right">
                      {hobbiesForm.narrative.length}/500 characters
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Upload optional supporting file (image or pdf)
                    </label>
                    <label
                      htmlFor="hobbies-file-upload"
                      onDrop={handleHobbiesFileDrop}
                      onDragOver={handleHobbiesFileDragOver}
                      className="block cursor-pointer border-dashed border-2 border-gray-200 rounded min-h-[100px] flex flex-col items-center justify-center bg-gray-50 relative text-center transition hover:border-black"
                    >
                      <input
                        id="hobbies-file-upload"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleHobbiesFileChange}
                        className="hidden"
                      />
                      {!hobbiesForm.filePreview && (
                        <>
                          <svg
                            className="w-10 h-10 text-gray-300 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                            />
                          </svg>
                          <span className="text-secondary text-sm">
                            Click to upload or drag and drop
                            <br />
                            Images or PDF (max 5MB)
                          </span>
                        </>
                      )}
                      {hobbiesForm.filePreview && (
                        <div className="mt-2 w-full flex flex-col items-center">
                          {hobbiesForm.file?.type.startsWith("image/") ? (
                            <img
                              src={hobbiesForm.filePreview}
                              alt="Preview"
                              className="max-h-32 mx-auto"
                            />
                          ) : (
                            <a
                              href={hobbiesForm.filePreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              View PDF
                            </a>
                          )}
                        </div>
                      )}
                      {hobbiesFileError && (
                        <div className="text-red-500 text-xs mt-2">
                          {hobbiesFileError}
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {editingHobbyId ? "Update Hobby" : "Save Hobby"}
                    </button>
                    <button
                      type="button"
                      onClick={handleHobbiesClose}
                      className="px-4 py-2 bg-gray-200 text-secondary font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      // Add more cases for each category with appropriate fields
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

  // Save to Supabase
  const saveToSupabase = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

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
      toast.error("Failed to save introduction information");
      return;
    }

    // Save education information
    for (const education of educations) {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      // Upload file if it exists
      if (education.file) {
        const fileExt = education.file.name.split(".").pop();
        const filePath = `${user.id}/${education.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("education-files")
          .upload(filePath, education.file);

        if (uploadError) {
          console.error("Error uploading education file:", uploadError);
          toast.error("Failed to upload education file");
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("education-files").getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = education.file.name;
        fileSize = education.file.size;
      }

      // Save education data
      const { error: educationError } = await supabase
        .from("education")
        .upsert({
          user_id: user.id,
          id: education.id,
          school_name: education.school,
          school_location: education.location,
          degree: education.degree,
          field_of_study: education.field,
          currently_enrolled: education.currentlyEnrolled,
          start_date: education.startDate || null,
          end_date: education.currentlyEnrolled
            ? null
            : education.endDate || null,
          grade: education.grade || null,
          description: education.description || null,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
        });

      if (educationError) {
        console.error("Error saving education:", educationError);
        toast.error("Failed to save education");
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
      toast.error("Failed to save rehabilitative programs");
    }

    // Save hobbies
    for (const hobby of hobbies) {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      // Upload file if it exists
      if (hobby.file) {
        const fileExt = hobby.file.name.split(".").pop();
        const filePath = `${user.id}/${hobby.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("hobby-files")
          .upload(filePath, hobby.file);

        if (uploadError) {
          console.error("Error uploading hobby file:", uploadError);
          toast.error("Failed to upload hobby file");
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("hobby-files").getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = hobby.file.name;
        fileSize = hobby.file.size;
      }

      // Save hobby data
      const { error: hobbyError } = await supabase.from("hobbies").upsert({
        user_id: user.id,
        id: hobby.id,
        general_hobby: hobby.general || null,
        sports: hobby.sports || null,
        other_interests: hobby.other || null,
        narrative: hobby.narrative || null,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
      });

      if (hobbyError) {
        console.error("Error saving hobby:", hobbyError);
        toast.error("Failed to save hobby");
      }
    }

    // Save employment information
    for (const employment of employments) {
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
        toast.error("Failed to save employment");
      }
    }

    // Save awards
    for (const award of awards) {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      // Upload file if it exists
      if (award.file) {
        const fileExt = award.file.name.split(".").pop();
        const filePath = `${user.id}/${award.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("award-files")
          .upload(filePath, award.file);

        if (uploadError) {
          console.error("Error uploading award file:", uploadError);
          toast.error("Failed to upload award file");
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("award-files").getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = award.file.name;
        fileSize = award.file.size;
      }

      // Format the date to ensure it's in the correct timezone
      const awardDate = award.date ? new Date(award.date + "T00:00:00") : null;

      // Save award data
      const { error: awardError } = await supabase.from("awards").upsert({
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
      });

      if (awardError) {
        console.error("Error saving award:", awardError);
        toast.error("Failed to save award");
      }
    }

    // Save mentors
    for (const mentor of mentors) {
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
        toast.error("Failed to save mentor");
      }
    }
  };

  const rehabProgramsList = [
    {
      key: "substanceUseDisorder",
      label: "Substance Use Disorder Treatment",
      desc: "Counseling, residential, outpatient, relapse prevention, harm reduction or AA/NA/peer.",
    },
    {
      key: "womensJusticeCenters",
      label: "Women's Justice Centers",
      desc: "Gender-responsive, trauma-informed, family-focused care.",
    },
    {
      key: "employmentFocused",
      label: "Employment-Focused Programs",
      desc: "Job readiness, skills training, job placement, work release, transitional jobs, social enterprise.",
    },
    {
      key: "adaptableJustice",
      label: "Adaptable Justice Programs",
      desc: "Restorative, transformative, victim-offender healing, circle conferencing.",
    },
    {
      key: "lifeSkillsTraining",
      label: "Life Skills Training",
      desc: "Education, basic life management, financial management, communication skills.",
    },
    {
      key: "communityService",
      label: "Community Service",
      desc: "Service learning, restitution, reparative projects, neighborhood initiatives.",
    },
    {
      key: "familyReintegration",
      label: "Family and Community Reintegration Programs",
      desc: "Family reunification, mediation, mentoring, parenting programs.",
    },
    {
      key: "parentingClasses",
      label: "Parenting Classes",
      desc: "Child development education, discipline techniques, child–parent visitation and practice.",
    },
    {
      key: "mentalWellness",
      label: "Mental and Wellness Programs",
      desc: "Psychological counseling, trauma, substance programs, cognitive behavioral health.",
    },
    {
      key: "faithBased",
      label: "Faith-Based Initiatives",
      desc: "Spiritual support, religious programs, faith-based support groups.",
    },
    {
      key: "peerSupport",
      label: "Peer Support Groups",
      desc: "Group therapy, peer mentoring, recovery, lived-experience.",
    },
    {
      key: "artsRecreation",
      label: "Arts and Recreation Programs",
      desc: "Creative arts, music, theater, recreation, leisure and play.",
    },
    {
      key: "housingAssistance",
      label: "Housing Assistance Programs",
      desc: "Transitional housing, supportive housing, independent living, shelter.",
    },
    {
      key: "legalCompliance",
      label: "Legal Compliance",
      desc: "Court-ordered, parole/probation, monitoring, mediation or legal skills training.",
    },
    {
      key: "civicEngagement",
      label: "Civic Engagement Activities",
      desc: "Voter registration, community service, volunteering, civic or resident participation.",
    },
    {
      key: "veteransServices",
      label: "Veterans Services",
      desc: "Veteran-specific services, case management, advocacy, including those dealing with reentry.",
    },
    {
      key: "domesticViolenceReduction",
      label: "Domestic Violence Reduction",
      desc: "Domestic violence education, counseling, advocacy, including those dealing with victimization and reentry.",
    },
    {
      key: "sexOffenderTreatment",
      label: "Sex Offender Treatment Programs",
      desc: "Therapy and treatment for persons convicted of sex offenses.",
    },
    {
      key: "medicalHealthCare",
      label: "Medical and Physical Health Care",
      desc: "General medical care, physical rehabilitation, and related services for individuals affected by physical illness or injury, physical disabilities, or special health and self-care needs.",
    },
    {
      key: "other",
      label: "Other",
      desc: "Specify other relevant program.",
    },
  ];

  const handleRehabCheckbox = (key: RehabProgramKey) => {
    setRehabPrograms((prev) => ({
      ...prev,
      [key]: !prev[key],
      [`${key}Details`]: !prev[key] ? prev[`${key}Details`] : "",
    }));
  };

  const handleRehabDetailsChange = (key: RehabProgramKey, value: string) => {
    setRehabPrograms((prev) => ({
      ...prev,
      [`${key}Details`]: value.slice(0, 500),
    }));
  };

  const [introductionData, setIntroductionData] = useState<Introduction>({
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

  const handleIntroductionChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLanguageProficiencyChange = (
    value: Introduction["languageProficiency"]
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      languageProficiency: value || "No Proficiency",
    }));
  };

  const handleOtherLanguagesChange = (languages: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      otherLanguages: languages || [],
    }));
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
