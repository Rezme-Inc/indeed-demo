"use client";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { socialFields } from "@/app/restorative-record/constants";
import { Info, Menu, X } from "lucide-react";

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

const languages = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "mandarin", label: "Mandarin" },
  { value: "vietnamese", label: "Vietnamese" },
  { value: "tagalog", label: "Tagalog" },
  { value: "other", label: "Other" },
];

export default function MyRestorativeRecordProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [addedEmails, setAddedEmails] = useState<string[]>([]);
  const [shareStatus, setShareStatus] = useState("private"); // private, public, employer
  const [copySuccess, setCopySuccess] = useState(false);
  const [employer, setEmployer] = useState<{
    name: string;
    logo: string;
  } | null>({
    name: "Tech for Good",
    logo: "https://example.com/logo.png",
  }); // Replace with actual employer data
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalForm, setLegalForm] = useState({
    name: "",
    email: "",
    question: "",
    employers: "",
  });
  const [legalSubmitted, setLegalSubmitted] = useState(false);

  // State for all restorative record data
  const [introduction, setIntroduction] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [communityEngagements, setCommunityEngagements] = useState<any[]>([]);
  const [newRehabPrograms, setNewRehabPrograms] = useState<any[]>([]);
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [employments, setEmployments] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);

  const useCaseDetails = [
    {
      label: "Employment applications",
      description: "Share your restorative record with potential employers to demonstrate your rehabilitation, skills, and character during the hiring process."
    },
    {
      label: "Housing applications",
      description: "Provide your restorative record to landlords or housing authorities to support your application and show your commitment to positive change."
    },
    {
      label: "Volunteering opportunities",
      description: "Use your restorative record to apply for volunteer positions, especially those that require background checks or character references."
    },
    {
      label: "Character references",
      description: "Share your record with individuals or organizations who need to verify your character, such as for court, school, or community purposes."
    },
    {
      label: "Licensing & certifications",
      description: "Submit your restorative record when applying for professional licenses or certifications that require background or moral fitness evaluations."
    },
    {
      label: "Moral or character fitness evaluations",
      description: "Support applications for roles or credentials that require a demonstration of moral character, such as legal, medical, or government positions."
    },
    {
      label: "Other situations where you want to demonstrate your rehabilitation, skills, or character",
      description: "Share your restorative record in any context where you want to provide evidence of your growth, achievements, and positive contributions."
    },
  ];
  const [openUseCase, setOpenUseCase] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single();
      setProfile(profileData);
      setLoading(false);
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchRestorativeRecordData() {
      if (!user) return;

      try {
        // Fetch introduction
        const { data: introData } = await supabase
          .from("introduction")
          .select("*")
          .eq("user_id", user.id)
          .single();
        setIntroduction(introData);

        // Fetch awards/achievements
        const { data: awardsData } = await supabase
          .from("awards")
          .select("*")
          .eq("user_id", user.id);
        setAchievements(awardsData || []);

        // Fetch skills
        const { data: skillsData } = await supabase
          .from("skills")
          .select("*")
          .eq("user_id", user.id);
        setSkills(skillsData || []);

        // Fetch community engagements
        const { data: engagementData } = await supabase
          .from("community_engagements")
          .select("*")
          .eq("user_id", user.id);
        if (engagementData && Array.isArray(engagementData)) {
          const mappedEngagements = engagementData.map((remote) => ({
            id: remote.id,
            type: remote.type || "",
            role: remote.role || "",
            orgName: remote.organization_name || "",
            orgWebsite: remote.organization_website || "",
            details: remote.details || "",
            file_url: remote.file_url || "",
            file_name: remote.file_name || "",
            file_size: remote.file_size || null,
          }));
          setCommunityEngagements(mappedEngagements);
        } else {
          setCommunityEngagements([]);
        }

        // Fetch new rehab programs (CRUD format)
        const { data: newRehabData } = await supabase
          .from("rehab_programs")
          .select("*")
          .eq("user_id", user.id);
        setNewRehabPrograms(newRehabData || []);

        // Fetch hobbies
        const { data: hobbiesData } = await supabase
          .from("hobbies")
          .select("*")
          .eq("user_id", user.id);
        setHobbies(hobbiesData || []);

        // Fetch microcredentials/certifications
        const { data: certsData } = await supabase
          .from("micro_credentials")
          .select("*")
          .eq("user_id", user.id);
        setCertifications(certsData || []);

        // Fetch mentors
        const { data: mentorsData } = await supabase
          .from("mentors")
          .select("*")
          .eq("user_id", user.id);
        setMentors(mentorsData || []);

        // Fetch employment
        const { data: employmentData } = await supabase
          .from("employment")
          .select("*")
          .eq("user_id", user.id);
        setEmployments(employmentData || []);

        // Fetch education
        const { data: educationData } = await supabase
          .from("education")
          .select("*")
          .eq("user_id", user.id);
        setEducation(educationData || []);
      } catch (error) {
        console.error("Error fetching restorative record data:", error);
      }
    }

    fetchRestorativeRecordData();

    // Refetch data when page becomes visible (e.g., returning from builder)
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchRestorativeRecordData();
      }
    };

    const handleFocus = () => {
      if (user) {
        fetchRestorativeRecordData();
      }
    };

    // Listen for data updates from other tabs/windows (e.g., builder page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'restorative-record-updated' && user) {
        fetchRestorativeRecordData();
        // Clear the flag
        localStorage.removeItem('restorative-record-updated');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const handleShare = async (type: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      switch (type) {
        case "email":
          if (!shareEmail) return;
          setAddedEmails([...addedEmails, shareEmail]);
          setShareEmail("");
          break;
        case "public":
          setShareStatus("public");
          break;
        case "private":
          setShareStatus("private");
          break;
        case "employer":
          setShareStatus("employer");
          break;
        case "copy":
          // Generate or get the share token
          const { data: shareTokenResult, error: tokenError } = await supabase
            .rpc('generate_new_share_token', { user_id: user.id });
          
          if (tokenError) {
            console.error("Error generating share token:", tokenError);
            alert("Error generating share link. Please try again.");
            return;
          }
          
          // Create the shareable URL
          const baseUrl = window.location.origin;
          const shareUrl = `${baseUrl}/restorative-record/share/${shareTokenResult}`;
          
          // Copy to clipboard
          await navigator.clipboard.writeText(shareUrl);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
          break;
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Error sharing record. Please try again.");
    }
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  
    // Optional cleanup if component unmounts while menu is open
    return () => document.body.classList.remove('overflow-hidden');
  }, [mobileMenuOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
  
    const handleBreakpointChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setMobileMenuOpen(false); // Close the menu
        document.body.classList.remove("overflow-hidden"); // Ensure scroll is restored
      }
    };
  
    handleBreakpointChange(mediaQuery); // run on mount
  
    mediaQuery.addEventListener("change", handleBreakpointChange);
    return () => mediaQuery.removeEventListener("change", handleBreakpointChange);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen && window.innerWidth < 1024) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [mobileMenuOpen]);

  const removeEmail = (emailToRemove: string) => {
    setAddedEmails(addedEmails.filter((email) => email !== emailToRemove));
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Full-width Header */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 py-4 lg:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-2 lg:gap-0">
            {/* Flexbox row for logo, print, share, dashboard button */}
            <div className="flex flex-col lg:flex-row justify-between gap-3 w-full">
              {/* Logo */}
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span style={{ color: '#000000' }}>réz</span>
                  <span style={{ color: '#E54747' }}>me.</span>
                </div>
                {/* Hamburger menu for lg and below */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-50 lg:hidden"
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
              {/* Print button (desktop only) */}
              <button
                className="hidden lg:inline-flex px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:bg-gray-50"
                style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}
                onClick={() => window.print()}
              >
                Print
              </button>
              {/* Share button (desktop only) */}
              <button
                onClick={() => setShowShareModal(true)}
                className="hidden lg:inline-flex px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:bg-gray-50"
                style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}
              >
                Share
              </button>
              {/* Dashboard button: visible in header on desktop, in menu on mobile */}
              <Link href="/restorative-record" passHref legacyBehavior>
                <a className="hidden lg:inline-flex w-auto px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg text-center"
                   style={{
                     backgroundColor: '#E54747',
                     color: 'white',
                     fontFamily: 'Poppins, sans-serif',
                   }}>
                  My Rézme Dashboard
                </a>
              </Link>
            </div>
          </div>
        </div>
        {/* Hamburger Slide-out Menu (mobile/medium) */}
        <div 
          className={`fixed inset-0 bg-black z-30 transition-bg-opacity duration-300 lg:hidden 
            ${mobileMenuOpen ? 'bg-opacity-50 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'}
          `}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 
        transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden`}>
          <button 
            className="fixed top-0 right-0 p-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="m-8 pt-4 space-y-4">
            <Link href="/restorative-record" passHref legacyBehavior>
              <a className="w-full px-4 py-3 rounded-xl flex items-center gap-3 hover:opacity-90 text-white text-center"
                style={{ backgroundColor: '#E54747' }}>
                <span className="font-medium">My Rézme Dashboard</span>
              </a>
            </Link>

            <div>
              <h3 className="text-sm font-semibold text-black mb-3 uppercase">Restorative Record Options</h3>
            </div>

            <div>
              <button
                className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-black bg-gray-50 hover:bg-gray-50"
                onClick={() => {
                  window.print();
                  setMobileMenuOpen(false);
                }}
              >
                <span className="font-medium">Print</span>
              </button>
            </div>

            <div>
              <button
                className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-black bg-gray-50 hover:bg-gray-50"
                onClick={() => {
                  setShowShareModal(true)
                  setMobileMenuOpen(false);
                }}
              >
                <span className="font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-8 px-4 lg:px-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
            My Restorative Record
          </h1>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl mx-4 shadow-lg">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Share your Restorative Record
                  </h2>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                    style={{ color: '#595959' }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 512 512"
                      stroke="currentColor"
                    >
                      <path d="m130.91 327.37l145.57-165.37c12.389-14.074 52.926-3.3688 67 9.0206 13.37 11.77 29.832 51.242 17.442 65.316l-207.52 235.74c-24.778 28.148-86.5 23.773-109.37 3.6403s-35.034-80.802-10.256-108.95l297.34-337.77c18.584-21.111 82.907-1.9558 114.57 25.92s58.821 89.252 40.237 110.36l-235.4 267.4"/>
                    </svg>
                  </button>
                </div>
                {/* Use Cases Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Common Use Cases
                  </h3>
                  <ul className="list-disc pl-6 text-sm space-y-1" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                    {useCaseDetails.map((uc, idx) => (
                      <li key={uc.label} className="relative flex items-start gap-2">
                        <span>{uc.label}</span>
                        <button
                          type="button"
                          aria-label={`More info about ${uc.label}`}
                          className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none"
                          onClick={() => setOpenUseCase(openUseCase === idx ? null : idx)}
                          tabIndex={0}
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {openUseCase === idx && (
                          <div className="absolute left-6 top-6 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-72 text-xs text-black animate-fade-in" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {uc.description}
                            <button
                              className="block mt-2 ml-auto text-xs text-red-500 hover:underline focus:outline-none"
                              onClick={() => setOpenUseCase(null)}
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Share with specific people */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-black mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Share with specific people
                  </h3>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ 
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    />
                    <button
                      onClick={() => handleShare("email")}
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                      style={{ 
                        backgroundColor: '#E54747', 
                        color: 'white',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {addedEmails.length > 0 && (
                    <div className="space-y-2">
                      {addedEmails.map((email, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: '#f8f9fa' }}
                        >
                          <span className="text-sm text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>{email}</span>
                          <button
                            onClick={() => removeEmail(email)}
                            className="p-1 rounded transition-all duration-200 hover:bg-gray-200"
                            style={{ color: '#595959' }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm mt-3" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                    Only people you add will be able to view this record.
                  </p>
                </div>

                {/* Share options */}
                <div className="space-y-4 mb-8">
                  <label className="flex items-start gap-4 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    <input
                      type="radio"
                      name="shareStatus"
                      checked={shareStatus === "public"}
                      onChange={() => handleShare("public")}
                      className="mt-1"
                      style={{ accentColor: '#E54747' }}
                    />
                    <div>
                      <div className="font-medium text-black mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Share with everyone
                      </div>
                      <p className="text-sm" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                        Anyone with the link can view your record.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    <input
                      type="radio"
                      name="shareStatus"
                      checked={shareStatus === "private"}
                      onChange={() => handleShare("private")}
                      className="mt-1"
                      style={{ accentColor: '#E54747' }}
                    />
                    <div>
                      <div className="font-medium text-black mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Keep it private
                      </div>
                      <p className="text-sm" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                        Only you can view this record.
                      </p>
                    </div>
                  </label>

                  {employer && (
                    <label className="flex items-start gap-4 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
                      <input
                        type="radio"
                        name="shareStatus"
                        checked={shareStatus === "employer"}
                        onChange={() => handleShare("employer")}
                        className="mt-1"
                        style={{ accentColor: '#E54747' }}
                      />
                      <div>
                        <span className="font-medium text-black mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Share with employer who requested it
                        </span>
                        <p className="text-sm" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                          Only the employer can view this record.
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Copy link */}
                <div className="mb-8">
                  <button
                    onClick={() => handleShare("copy")}
                    className="w-full px-6 py-3 border border-gray-200 rounded-lg font-medium transition-all duration-200 hover:bg-gray-50 hover:shadow-lg flex items-center justify-center gap-3"
                    style={{ 
                      color: '#000000',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    {copySuccess ? "Link copied!" : "Copy link"}
                  </button>
                  <p className="text-sm mt-3 text-center" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                    Copy a link to share this record.
                  </p>
                </div>

                {/* Done button */}
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: '#E54747', 
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legal Assistance Modal */}
        {showLegalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-3xl mx-4 shadow-lg max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Legal Assistance
                  </h2>
                  <button
                    onClick={() => {
                      setShowLegalModal(false);
                      setLegalSubmitted(false);
                    }}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                    style={{ color: '#595959' }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mb-4 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <p className="mb-3 leading-relaxed text-sm">
                    If you believe you have experienced employment
                    discrimination or have questions about your rights under
                    Fair Chance Hiring laws, you can contact a legal team for
                    assistance. Your inquiry will be sent to the appropriate
                    legal professionals in your jurisdiction.
                  </p>
                  <ul className="list-disc pl-5 text-xs mb-3 space-y-1" style={{ color: '#595959' }}>
                    <li>
                      Fair Chance Hiring laws protect individuals with criminal
                      records from unfair discrimination in employment.
                    </li>
                    <li>
                      You have the right to know if an employer has run a
                      background check on you.
                    </li>
                    <li>
                      Legal teams can help you understand your rights and
                      options if you believe you have been treated unfairly.
                    </li>
                  </ul>
                  {/* San Diego Applicants Message */}
                  <div className="border-l-4 p-4 my-4 rounded-lg" style={{ borderColor: '#E54747', backgroundColor: '#fef7f7' }}>
                    <div className="font-semibold mb-2 text-sm" style={{ color: '#E54747', fontFamily: 'Poppins, sans-serif' }}>
                      San Diego Applicants
                    </div>
                    <p className="mb-2 text-black leading-relaxed text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      If you would like to file a fair chance complaint, please
                      complete the{" "}
                      <a
                        href="https://forms.office.com/Pages/ResponsePage.aspx?id=E69jRSnAs0G3TJZejuyPlqdlrWcla0pGkN2zYgm3FclUMUVUlgdGOFZDWlNJSlRDODBNlgNRWVNHOCQlQCN0PWcu"
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
                        <span className="font-medium">Email:</span>{" "}
                        <a
                          href="mailto:olse@sdcounty.ca.gov"
                          className="font-medium underline transition-colors duration-200 hover:opacity-80"
                          style={{ color: '#E54747' }}
                        >
                          olse@sdcounty.ca.gov
                        </a>
                      </li>
                      <li>
                        <span className="font-medium">Office:</span>{" "}
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
                      If your question is not related to fair chance hiring,
                      please call{" "}
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
                        style={{ 
                          fontFamily: 'Poppins, sans-serif'
                        }}
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
                        style={{ 
                          fontFamily: 'Poppins, sans-serif'
                        }}
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
                        style={{ 
                          fontFamily: 'Poppins, sans-serif'
                        }}
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
                        style={{ 
                          fontFamily: 'Poppins, sans-serif'
                        }}
                        placeholder="Enter employer names, separated by commas"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg text-sm"
                      style={{ 
                        backgroundColor: '#E54747', 
                        color: 'white',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    >
                      Submit Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* About / Introduction */}
        <section className="mb-8 p-8 bg-white rounded-xl shadow-sm" style={{ border: '1px solid #f0f0f0' }}>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>About</h2>
            <Link
              href="/restorative-record?section=introduction"
              passHref
              legacyBehavior
            >
              <a className="block ml-4 p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-gray-800" 
                 style={{ backgroundColor: '#000000', color: 'white' }}
                 title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 512 512"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={40}
                    d="m 130.91 327.37 l 145.57 -165.37 c 12.389 -14.074 52.926 -3.3688 67 9.0206 c 13.37 11.77 29.832 51.242 17.442 65.316 l -207.52 235.74 c -24.778 28.148 -86.5 23.773 -109.37 3.6403 s -35.034 -80.802 -10.256 -108.95 l 297.34 -337.77 c 18.584 -21.111 82.907 -1.9558 114.57 25.92 s 58.821 89.252 40.237 110.36 l -235.4 267.4"
                  />
                </svg>
              </a>
            </Link>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 items-center md:items-start">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover shadow-lg"
                style={{ border: '3px solid #f0f0f0' }}
              />
            ) : (
              <div className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-semibold shadow-lg"
                   style={{ 
                     backgroundColor: '#f8f9fa', 
                     color: '#595959',
                     border: '3px solid #f0f0f0',
                     fontFamily: 'Poppins, sans-serif'
                   }}>
                {profile?.first_name?.[0] || "U"}
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <div className="font-semibold text-2xl mb-3 text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {profile?.first_name || ""} {profile?.last_name || ""}
              </div>
              {introduction && (
                <>
                  <div className="mb-4 text-lg" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                    {introduction.preferred_occupation || "Professional"} |{" "}
                    {introduction.language_proficiency || "English"}
                    {introduction.other_languages &&
                      introduction.other_languages.length > 0 &&
                      ` | ${introduction.other_languages.join(", ")}`}
                  </div>
                  <div className="mb-4 text-black leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {introduction.personal_narrative ||
                      "No narrative provided yet."}
                  </div>
                  {/* Social Media Links */}
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    {socialFields.map((field) => {
                      const dbField = field.name.replace(/Url$/, "_url").replace(/([A-Z])/g, "_$1").toLowerCase();
                      const url = introduction[dbField] || introduction[field.name] || "";
                      if (!url) return null;
                      return (
                        <a
                          key={field.name}
                          href={url}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:bg-red-500 hover:text-white"
                          style={{ 
                            color: '#E54747', 
                            backgroundColor: '#fef7f7',
                            border: '1px solid #E54747',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={field.label.replace("Enter your ", "")}>
                          {field.label.replace("Enter your ", "").replace(" URL", "")}
                        </a>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Personal Achievements & Awards
            </h2>
            <Link
              href="/restorative-record?section=personal-achievements"
              passHref
              legacyBehavior
            >
              <a className="block ml-4 p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-gray-800" 
                 style={{ backgroundColor: '#000000', color: 'white' }}
                 title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 512 512"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={40}
                    d="m 130.91 327.37 l 145.57 -165.37 c 12.389 -14.074 52.926 -3.3688 67 9.0206 c 13.37 11.77 29.832 51.242 17.442 65.316 l -207.52 235.74 c -24.778 28.148 -86.5 23.773 -109.37 3.6403 s -35.034 -80.802 -10.256 -108.95 l 297.34 -337.77 c 18.584 -21.111 82.907 -1.9558 114.57 25.92 s 58.821 89.252 40.237 110.36 l -235.4 267.4"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {achievements.map((award: any, idx: number) => (
            <div
              key={idx}
              className="p-6 mb-4 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg"
              style={{ border: '1px solid #f0f0f0' }}
            >
              <div className="font-semibold text-lg text-black mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>{award.name}</div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                Type: {award.type}
              </div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                Organization: {award.organization}
              </div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                Date: {new Date(award.date).toLocaleDateString()}
              </div>
              {award.narrative && (
                <div className="text-sm text-black mb-4 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Narrative: {award.narrative}
                </div>
              )}
              {/* External Links Section - Always at bottom */}
              {award.file_url && (
                <div className="text-sm mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={award.file_url}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      color: '#E54747', 
                      backgroundColor: '#fef7f7',
                      border: '1px solid #E54747',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {award.file_name || "View attachment"}
                    {award.file_size && (
                      <span className="ml-2" style={{ color: '#595959' }}>
                        ({formatFileSize(award.file_size)})
                      </span>
                    )}
                  </a>
                </div>
              )}
            </div>
          ))}
          {achievements.length === 0 && (
            <p className="text-center py-8" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
              No achievements added yet.
            </p>
          )}
        </section>

        {/* Skills */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Skills</h2>
            <Link
              href="/restorative-record?section=skills"
              passHref
              legacyBehavior
            >
              <a className="block ml-4 p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-gray-800" 
                 style={{ backgroundColor: '#000000', color: 'white' }}
                 title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 512 512"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={40}
                    d="m 130.91 327.37 l 145.57 -165.37 c 12.389 -14.074 52.926 -3.3688 67 9.0206 c 13.37 11.77 29.832 51.242 17.442 65.316 l -207.52 235.74 c -24.778 28.148 -86.5 23.773 -109.37 3.6403 s -35.034 -80.802 -10.256 -108.95 l 297.34 -337.77 c 18.584 -21.111 82.907 -1.9558 114.57 25.92 s 58.821 89.252 40.237 110.36 l -235.4 267.4"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {skills.map((skill: any, idx: number) => (
            <div
              key={idx}
              className="p-6 mb-4 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg"
              style={{ border: '1px solid #f0f0f0' }}
            >
              {skill.soft_skills && skill.soft_skills.length > 0 && (
                <div className="text-sm mb-3" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Soft Skills:</span> {skill.soft_skills.join(", ")}
                </div>
              )}
              {skill.hard_skills && skill.hard_skills.length > 0 && (
                <div className="text-sm mb-3" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Hard Skills:</span> {skill.hard_skills.join(", ")}
                </div>
              )}
              {skill.other_skills && (
                <div className="text-sm mb-3" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Other Skills:</span> {skill.other_skills}
                </div>
              )}
              {skill.narrative && (
                <div className="text-sm text-black mb-4 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium">Narrative:</span> {skill.narrative}
                </div>
              )}
              {/* External Links Section - Always at bottom */}
              {skill.file_url && (
                <div className="text-sm mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={skill.file_url}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      color: '#E54747', 
                      backgroundColor: '#fef7f7',
                      border: '1px solid #E54747',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {skill.file_name || "View attachment"}
                    {skill.file_size && (
                      <span className="ml-2" style={{ color: '#595959' }}>
                        ({formatFileSize(skill.file_size)})
                      </span>
                    )}
                  </a>
                </div>
              )}
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-center py-8" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
              No skills added yet.
            </p>
          )}
        </section>

        {/* Community Engagement */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Community Engagement
            </h2>
            <Link
              href="/restorative-record?section=community-engagement"
              passHref
              legacyBehavior
            >
              <a className="block ml-4 p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-gray-800" 
                 style={{ backgroundColor: '#000000', color: 'white' }}
                 title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 512 512"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={40}
                    d="m 130.91 327.37 l 145.57 -165.37 c 12.389 -14.074 52.926 -3.3688 67 9.0206 c 13.37 11.77 29.832 51.242 17.442 65.316 l -207.52 235.74 c -24.778 28.148 -86.5 23.773 -109.37 3.6403 s -35.034 -80.802 -10.256 -108.95 l 297.34 -337.77 c 18.584 -21.111 82.907 -1.9558 114.57 25.92 s 58.821 89.252 40.237 110.36 l -235.4 267.4"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {communityEngagements.map((eng: any, idx: number) => (
            <div
              key={idx}
              className="p-6 mb-4 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg"
              style={{ border: '1px solid #f0f0f0' }}
            >
              <div className="font-semibold text-lg text-black mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>{eng.role}</div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">Type:</span> {eng.type}
              </div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">Organization:</span> {eng.orgName}
              </div>
              <div className="text-sm text-black mb-4 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium">Details:</span> {eng.details}
              </div>
              {/* External Links Section - Always at bottom */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                {eng.orgWebsite && (
                  <div className="text-sm">
                    <a
                      href={eng.orgWebsite}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg mr-3"
                      style={{ 
                        color: '#E54747', 
                        backgroundColor: '#fef7f7',
                        border: '1px solid #E54747',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                {eng.file_url && (
                  <div className="text-sm">
                    <a
                      href={eng.file_url}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                      style={{ 
                        color: '#E54747', 
                        backgroundColor: '#fef7f7',
                        border: '1px solid #E54747',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {eng.file_name || "View attachment"}
                      {eng.file_size && (
                        <span className="ml-2" style={{ color: '#595959' }}>
                          ({formatFileSize(eng.file_size)})
                        </span>
                      )}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
          {communityEngagements.length === 0 && (
            <p className="text-center py-8" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
              No community engagements added yet.
            </p>
          )}
        </section>

        {/* Rehabilitative Programs */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Rehabilitative Programs
            </h2>
            <Link
              href="/restorative-record?section=rehabilitative-programs"
              passHref
              legacyBehavior
            >
              <a className="block ml-4 p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-gray-800" 
                 style={{ backgroundColor: '#000000', color: 'white' }}
                 title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 512 512"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={40}
                    d="m 130.91 327.37 l 145.57 -165.37 c 12.389 -14.074 52.926 -3.3688 67 9.0206 c 13.37 11.77 29.832 51.242 17.442 65.316 l -207.52 235.74 c -24.778 28.148 -86.5 23.773 -109.37 3.6403 s -35.034 -80.802 -10.256 -108.95 l 297.34 -337.77 c 18.584 -21.111 82.907 -1.9558 114.57 25.92 s 58.821 89.252 40.237 110.36 l -235.4 267.4"
                  />
                </svg>
              </a>
            </Link>
          </div>
          
          {/* Display new format rehab programs */}
          {newRehabPrograms.map((program: any, idx: number) => (
            <div
              key={idx}
              className="p-6 mb-4 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg"
              style={{ border: '1px solid #f0f0f0' }}
            >
              <div className="font-semibold text-lg text-black mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>{program.program}</div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">Type:</span> {program.program_type}
              </div>
              {(program.start_date || program.end_date) && (
                <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Duration:</span>{" "}
                  {program.start_date
                    ? new Date(program.start_date).toLocaleDateString()
                    : "N/A"}{" "}
                  -{" "}
                  {program.end_date
                    ? new Date(program.end_date).toLocaleDateString()
                    : "Present"}
                </div>
              )}
              {program.details && (
                <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Details:</span> {program.details}
                </div>
              )}
              {program.narrative && (
                <div className="text-sm text-black mb-4 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium">Narrative:</span> {program.narrative}
                </div>
              )}
              {/* External Links Section - Always at bottom */}
              {program.file_url && (
                <div className="text-sm mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={program.file_url}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      color: '#E54747', 
                      backgroundColor: '#fef7f7',
                      border: '1px solid #E54747',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {program.file_name || "View attachment"}
                    {program.file_size && (
                      <span className="ml-2" style={{ color: '#595959' }}>
                        ({formatFileSize(program.file_size)})
                      </span>
                    )}
                  </a>
                </div>
              )}
            </div>
          ))}

          {/* Display old format rehab programs (for backward compatibility) */}
          
          {newRehabPrograms.length === 0 && (
            <p className="text-center py-8" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
              No rehabilitative programs added yet.
            </p>
          )}
        </section>

        {/* Hobbies & Interests */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Hobbies & Interests
            </h2>
            <Link
              href="/restorative-record?section=hobbies"
              passHref
              legacyBehavior
            >
              <a className="block ml-4 p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-gray-800" 
                 style={{ backgroundColor: '#000000', color: 'white' }}
                 title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 512 512"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={40}
                    d="m 130.91 327.37 l 145.57 -165.37 c 12.389 -14.074 52.926 -3.3688 67 9.0206 c 13.37 11.77 29.832 51.242 17.442 65.316 l -207.52 235.74 c -24.778 28.148 -86.5 23.773 -109.37 3.6403 s -35.034 -80.802 -10.256 -108.95 l 297.34 -337.77 c 18.584 -21.111 82.907 -1.9558 114.57 25.92 s 58.821 89.252 40.237 110.36 l -235.4 267.4"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {hobbies.map((hobby: any, idx: number) => (
            <div
              key={idx}
              className="p-6 mb-4 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg"
              style={{ border: '1px solid #f0f0f0' }}
            >
              {hobby.general_hobby && (
                <div className="text-sm mb-3" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">General:</span> {hobby.general_hobby}
                </div>
              )}
              {hobby.sports && (
                <div className="text-sm mb-3" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Sports:</span> {hobby.sports}
                </div>
              )}
              {hobby.other_interests && (
                <div className="text-sm mb-3" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Other:</span> {hobby.other_interests}
                </div>
              )}
              {hobby.narrative && (
                <div className="text-sm text-black mb-4 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium">Narrative:</span> {hobby.narrative}
                </div>
              )}
              {/* External Links Section - Always at bottom */}
              {hobby.file_url && (
                <div className="text-sm mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={hobby.file_url}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      color: '#E54747', 
                      backgroundColor: '#fef7f7',
                      border: '1px solid #E54747',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {hobby.file_name || "View attachment"}
                    {hobby.file_size && (
                      <span className="ml-2" style={{ color: '#595959' }}>
                        ({formatFileSize(hobby.file_size)})
                      </span>
                    )}
                  </a>
                </div>
              )}
            </div>
          ))}
          {hobbies.length === 0 && (
            <p className="text-center py-8" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
              No hobbies added yet.
            </p>
          )}
        </section>

        {/* Certifications and Licenses */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Certifications and Licenses
            </h2>
            <Link
              href="/restorative-record?section=microcredentials"
              passHref
              legacyBehavior
            >
              <a className="block ml-4 p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-gray-800" 
                 style={{ backgroundColor: '#000000', color: 'white' }}
                 title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 512 512"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={40}
                    d="m 130.91 327.37 l 145.57 -165.37 c 12.389 -14.074 52.926 -3.3688 67 9.0206 c 13.37 11.77 29.832 51.242 17.442 65.316 l -207.52 235.74 c -24.778 28.148 -86.5 23.773 -109.37 3.6403 s -35.034 -80.802 -10.256 -108.95 l 297.34 -337.77 c 18.584 -21.111 82.907 -1.9558 114.57 25.92 s 58.821 89.252 40.237 110.36 l -235.4 267.4"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {certifications.map((cert: any, idx: number) => (
            <div
              key={idx}
              className="p-6 mb-4 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg"
              style={{ border: '1px solid #f0f0f0' }}
            >
              <div className="font-semibold text-lg text-black mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>{cert.name}</div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">Organization:</span> {cert.issuing_organization}
              </div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">Issue Date:</span>{" "}
                {cert.issue_date
                  ? new Date(cert.issue_date).toLocaleDateString()
                  : "N/A"}
              </div>
              {cert.expiry_date && (
                <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Expiry Date:</span> {new Date(cert.expiry_date).toLocaleDateString()}
                </div>
              )}
              {cert.credential_id && (
                <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Credential ID:</span> {cert.credential_id}
                </div>
              )}
              {cert.narrative && (
                <div className="text-sm text-black mb-4 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium">Narrative:</span> {cert.narrative}
                </div>
              )}
              {/* External Links Section - Always at bottom */}
              {(cert.credential_url || cert.file_url) && (
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                  {cert.credential_url && (
                    <div className="text-sm">
                      <a
                        href={cert.credential_url.startsWith("http://") || cert.credential_url.startsWith("https://") 
                          ? cert.credential_url 
                          : `https://${cert.credential_url}`}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg mr-3"
                        style={{ 
                          color: '#E54747', 
                          backgroundColor: '#fef7f7',
                          border: '1px solid #E54747',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Credential
                      </a>
                    </div>
                  )}
                  {cert.file_url && (
                    <div className="text-sm">
                      <a
                        href={cert.file_url}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                        style={{ 
                          color: '#E54747', 
                          backgroundColor: '#fef7f7',
                          border: '1px solid #E54747',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {cert.file_name || "View attachment"}
                        {cert.file_size && (
                          <span className="ml-2" style={{ color: '#595959' }}>
                            ({formatFileSize(cert.file_size)})
                          </span>
                        )}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {certifications.length === 0 && (
            <p className="text-center py-8" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
              No certifications added yet.
            </p>
          )}
        </section>

        {/* Mentors */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Mentors</h2>
            <Link
              href="/restorative-record?section=mentors"
              passHref
              legacyBehavior
            >
              <a className="block ml-4 p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-gray-800" 
                 style={{ backgroundColor: '#000000', color: 'white' }}
                 title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 512 512"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={40}
                    d="m 130.91 327.37 l 145.57 -165.37 c 12.389 -14.074 52.926 -3.3688 67 9.0206 c 13.37 11.77 29.832 51.242 17.442 65.316 l -207.52 235.74 c -24.778 28.148 -86.5 23.773 -109.37 3.6403 s -35.034 -80.802 -10.256 -108.95 l 297.34 -337.77 c 18.584 -21.111 82.907 -1.9558 114.57 25.92 s 58.821 89.252 40.237 110.36 l -235.4 267.4"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {mentors.map((mentor: any, idx: number) => (
            <div
              key={idx}
              className="p-6 mb-4 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg"
              style={{ border: '1px solid #f0f0f0' }}
            >
              <div className="font-semibold text-lg text-black mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>{mentor.name}</div>
              {mentor.title && (
                <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Title:</span> {mentor.title}
                </div>
              )}
              {mentor.company && (
                <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Company:</span> {mentor.company}
                </div>
              )}
              {mentor.email && (
                <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Email:</span> {mentor.email}
                </div>
              )}
              {mentor.phone && (
                <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Phone:</span> {mentor.phone}
                </div>
              )}
              {mentor.narrative && (
                <div className="text-sm text-black mb-4 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium">Narrative:</span> {mentor.narrative}
                </div>
              )}
              {/* External Links Section - Always at bottom */}
              {(mentor.linkedin_profile || mentor.website) && (
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                  {mentor.linkedin_profile && (
                    <div className="text-sm">
                      <a
                        href={mentor.linkedin_profile}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg mr-3"
                        style={{ 
                          color: '#E54747', 
                          backgroundColor: '#fef7f7',
                          border: '1px solid #E54747',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {mentor.website && (
                    <div className="text-sm">
                      <a
                        href={mentor.website}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                        style={{ 
                          color: '#E54747', 
                          backgroundColor: '#fef7f7',
                          border: '1px solid #E54747',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {mentors.length === 0 && (
            <p className="text-center py-8" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
              No mentors added yet.
            </p>
          )}
        </section>

        {/* Employment History */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Employment History
            </h2>
            <Link
              href="/restorative-record?section=employment-history"
              passHref
              legacyBehavior
            >
              <a className="block ml-4 p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-gray-800" 
                 style={{ backgroundColor: '#000000', color: 'white' }}
                 title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 512 512"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={40}
                    d="m 130.91 327.37 l 145.57 -165.37 c 12.389 -14.074 52.926 -3.3688 67 9.0206 c 13.37 11.77 29.832 51.242 17.442 65.316 l -207.52 235.74 c -24.778 28.148 -86.5 23.773 -109.37 3.6403 s -35.034 -80.802 -10.256 -108.95 l 297.34 -337.77 c 18.584 -21.111 82.907 -1.9558 114.57 25.92 s 58.821 89.252 40.237 110.36 l -235.4 267.4"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {employments.map((job: any, idx: number) => (
            <div
              key={idx}
              className="p-6 mb-4 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg"
              style={{ border: '1px solid #f0f0f0' }}
            >
              <div className="font-semibold text-lg text-black mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.title}</div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">Company:</span> {job.company}
              </div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">Type:</span> {job.employment_type}
              </div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">Location:</span> {job.city}, {job.state}
              </div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">Duration:</span>{" "}
                {job.start_date
                  ? new Date(job.start_date).toLocaleDateString()
                  : "N/A"}{" "}
                -{" "}
                {job.currently_employed
                  ? "Present"
                  : job.end_date
                  ? new Date(job.end_date).toLocaleDateString()
                  : "N/A"}
              </div>
              {job.incarcerated && (
                <div className="text-sm mb-4" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Note:</span> Employed while incarcerated
                </div>
              )}
              {/* External Links Section - Always at bottom */}
              {job.company_url && (
                <div className="text-sm mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={job.company_url.startsWith("http://") || job.company_url.startsWith("https://") 
                      ? job.company_url 
                      : `https://${job.company_url}`}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      color: '#E54747', 
                      backgroundColor: '#fef7f7',
                      border: '1px solid #E54747',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Company Website
                  </a>
                </div>
              )}
            </div>
          ))}
          {employments.length === 0 && (
            <p className="text-center py-8" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
              No employment history added yet.
            </p>
          )}
        </section>

        {/* Education */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>Education</h2>
            <Link
              href="/restorative-record?section=education"
              passHref
              legacyBehavior
            >
              <a className="block ml-4 p-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:bg-gray-800" 
                 style={{ backgroundColor: '#000000', color: 'white' }}
                 title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 512 512"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={40}
                    d="m 130.91 327.37 l 145.57 -165.37 c 12.389 -14.074 52.926 -3.3688 67 9.0206 c 13.37 11.77 29.832 51.242 17.442 65.316 l -207.52 235.74 c -24.778 28.148 -86.5 23.773 -109.37 3.6403 s -35.034 -80.802 -10.256 -108.95 l 297.34 -337.77 c 18.584 -21.111 82.907 -1.9558 114.57 25.92 s 58.821 89.252 40.237 110.36 l -235.4 267.4"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {education.map((edu: any, idx: number) => (
            <div
              key={idx}
              className="p-6 mb-4 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg"
              style={{ border: '1px solid #f0f0f0' }}
            >
              <div className="font-semibold text-lg text-black mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {edu.degree} in {edu.field_of_study}
              </div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">School:</span> {edu.school_name}
              </div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">Location:</span> {edu.school_location}
              </div>
              <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                <span className="font-medium text-black">Duration:</span>{" "}
                {edu.start_date
                  ? new Date(edu.start_date).toLocaleDateString()
                  : "N/A"}{" "}
                -{" "}
                {edu.currently_enrolled
                  ? "Present"
                  : edu.end_date
                  ? new Date(edu.end_date).toLocaleDateString()
                  : "N/A"}
              </div>
              {edu.grade && (
                <div className="text-sm mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium text-black">Grade:</span> {edu.grade}
                </div>
              )}
              {edu.description && (
                <div className="text-sm text-black mb-4 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-medium">Description:</span> {edu.description}
                </div>
              )}
              {/* External Links Section - Always at bottom */}
              {edu.file_url && (
                <div className="text-sm mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={edu.file_url}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      color: '#E54747', 
                      backgroundColor: '#fef7f7',
                      border: '1px solid #E54747',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {edu.file_name || "View attachment"}
                    {edu.file_size && (
                      <span className="ml-2" style={{ color: '#595959' }}>
                        ({formatFileSize(edu.file_size)})
                      </span>
                    )}
                  </a>
                </div>
              )}
            </div>
          ))}
          {education.length === 0 && (
            <p className="text-center py-8" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
              No education added yet.
            </p>
          )}
        </section>
      </div>
      <style jsx global>{`
        @media print {
          header, .print-hide, .platform-header, .print-share-btn, .dashboard-btn {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .max-w-5xl, .mx-auto, .py-8, .px-4, .lg\:px-6 {
            max-width: 100% !important;
            padding: 0 !important;
          }
          a[href^="http"], a[href^="/uploads"], a[href*="file"] {
            color: #0645AD !important;
            text-decoration: underline !important;
            border: none !important;
            background: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            display: inline !important;
          }
          /* Hide browser print headers/footers and page URL if possible */
          @page {
            margin: 1in;
            size: auto;
          }
          /* Hide elements that may contain the date/time, title, or URL */
          body > div[style*="position: fixed"],
          body > div[style*="position: absolute"],
          body > header,
          body > footer,
          body > #__next > header,
          body > #__next > footer,
          body > #__next > .print-header,
          body > #__next > .print-footer {
            display: none !important;
          }
          /* Hide any element containing 'Rezme - Professional Profile Management' or the URL */
          *:contains('Rezme - Professional Profile Management'),
          *:contains('localhost:6787/restorative-record/profile') {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
