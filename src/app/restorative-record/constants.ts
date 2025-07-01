export const categories = [
  "introduction",
  "community-engagement",
  "rehabilitative-programs",
  "education",
  "employment-history",
  "skills",
  "microcredentials",
  "mentors",
  "personal-achievements",
  "hobbies",
];

export const socialFields = [
  { name: "facebookUrl", label: "Facebook", text: "Enter your Facebook URL" },
  { name: "linkedinUrl", label: "LinkedIn", text: "Enter your LinkedIn URL" },
  { name: "redditUrl", label: "Reddit", text: "Enter your Reddit URL" },
  { name: "digitalPortfolioUrl", label: "Digital Portfolio", text: "Enter your Digital Portfolio Link URL" },
  { name: "instagramUrl", label: "Instagram", text: "Enter your Instagram URL" },
  { name: "githubUrl", label: "Github", text: "Enter your GitHub URL" },
  { name: "tiktokUrl", label: "TikTok", text: "Enter your TikTok URL" },
  { name: "pinterestUrl", label: "Pinterest", text: "Enter your Pinterest URL" },
  { name: "twitterUrl", label: "X (Twitter)", text: "Enter your X (Twitter) URL" },
  { name: "personalWebsiteUrl", label: "Personal Website", text: "Enter your Personal Website URL" },
  { name: "handshakeUrl", label: "Handshake", text: "Enter your Handshake URL" },
];

export const englishOptions = [
  "Bilingual",
  "Advanced Proficiency",
  "Intermediate Proficiency",
  "Basic Proficiency",
  "Limited Proficiency",
  "No Proficiency",
];

export const otherLanguages = [
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Tagalog",
  "Vietnamese",
  "Other...",
];

export const awardTypes = [
  "Academic Achievement",
  "Athletic Achievement",
  "Community Service",
  "Leadership",
  "Professional Achievement",
  "Other",
];

export const softSkillsOptions = [
  "Communication",
  "Teamwork",
  "Problem Solving",
  "Adaptability",
  "Creativity",
  "Work Ethic",
  "Other...",
];

export const hardSkillsOptions = [
  "Programming",
  "Data Analysis",
  "Project Management",
  "Writing",
  "Design",
  "Marketing",
  "Other...",
];

export const engagementTypes = [
  "Volunteer Work",
  "Advocacy",
  "Community Service",
  "Mentorship",
  "Fundraising",
  "Other",
];

export const employmentTypeOptions = [
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

export const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

export const generalHobbyOptions = [
  "Reading", "Writing", "Cooking", "Gardening", "Photography", "Music",
  "Art/Drawing", "Crafts", "Gaming", "Technology", "Travel", "Movies/TV",
  "Volunteering", "Collecting", "Learning Languages", "Other",
];

export const sportsOptions = [
  "Basketball", "Football", "Soccer", "Baseball", "Tennis", "Swimming",
  "Running/Jogging", "Cycling", "Weightlifting", "Yoga", "Boxing",
  "Wrestling", "Track and Field", "Golf", "Martial Arts", "Dancing", "Other",
];

export const rehabProgramOptions = [
  "Substance Use Disorder Treatment",
  "Women's Justice Centers", 
  "Employment-Focused Programs",
  "Adaptable Justice Programs",
  "Life Skills Training",
  "Community Service",
  "Family and Community Reintegration Programs",
  "Parenting Classes",
  "Mental and Wellness Programs",
  "Faith-Based Initiatives",
  "Peer Support Groups",
  "Arts and Recreation Programs",
  "Housing Assistance Programs",
  "Legal Compliance",
  "Civic Engagement Activities",
  "Veterans Services",
  "Domestic Violence Reduction",
  "Sex Offender Treatment Programs",
  "Medical and Physical Health Care",
  "Other",
];

export const rehabProgramTypeOptions = [
  "Completed Before Incarceration",
  "Completed During Incarceration", 
  "Completed After Release",
  "Currently Participating",
  "Alternative-to-Incarceration Program",
];

export const rehabProgramsList = [
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
