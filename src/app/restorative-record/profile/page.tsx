"use client";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// Placeholder data arrays for demonstration
const certifications = [
  {
    name: "Certificate of Ethical Conduct",
    organization: "Tech for Good",
    issueDate: "2021-06-01",
    expiryDate: "2024-06-01",
    credentialId: "12345",
    credentialUrl: "https://certs.techforgood.org/12345",
    narrative: "This is a narrative for the certification.",
    file: {
      name: "ethics-cert.pdf",
      url: "https://example.com/ethics-cert.pdf",
      size: 30720, // in bytes
    },
  },
];

const achievements = [
  {
    type: "Community Service",
    name: "Volunteer of the Year",
    organization: "LA Food Bank",
    date: "2022-05-01",
    narrative: "Recognized for outstanding volunteer service.",
    file: {
      name: "award-photo.jpg",
      url: "https://example.com/award-photo.jpg",
      size: 204800,
    },
  },
  {
    type: "Academic Achievement",
    name: "Dean's List",
    organization: "State University",
    date: "2021-12-15",
    narrative: "Maintained a GPA above 3.8.",
    file: null,
  },
];

const skills = [
  {
    softSkills: "Communication, Teamwork",
    hardSkills: "JavaScript, React",
    otherSkills: "Public Speaking",
    narrative: "Developed strong communication skills through group projects.",
    file: null,
  },
  {
    softSkills: "Problem Solving",
    hardSkills: "Python, Data Analysis",
    otherSkills: "Mentoring",
    narrative: "Mentored peers in coding bootcamp.",
    file: {
      name: "skills-certificate.pdf",
      url: "https://example.com/skills-certificate.pdf",
      size: 102400,
    },
  },
];

const communityEngagements = [
  {
    type: "Mentorship",
    role: "Mentor",
    orgName: "Youth Coding Bootcamp",
    orgWebsite: "https://youthcode.org",
    details: "Guided students through their first coding projects.",
    file: null,
  },
  {
    type: "Volunteer Work",
    role: "Volunteer",
    orgName: "LA Food Bank",
    orgWebsite: "https://lafoodbank.org",
    details: "Helped distribute food to families in need.",
    file: {
      name: "volunteer-photo.jpg",
      url: "https://example.com/volunteer-photo.jpg",
      size: 51200,
    },
  },
];

const rehabPrograms = [
  {
    label: "Substance Use Disorder Treatment",
    year: "2020",
    narrative:
      "Completed a 12-week outpatient program focused on relapse prevention.",
  },
  {
    label: "Life Skills Training",
    year: "2021",
    narrative: "Learned financial management and communication skills.",
  },
];

const hobbies = [
  {
    general: "Reading",
    sports: "Basketball",
    other: "Photography",
    narrative:
      "Reading helps me relax and learn new things. I enjoy playing basketball with friends and capturing moments through photography.",
    file: null,
  },
  {
    general: "Gardening",
    sports: "Running",
    other: "Cooking",
    narrative:
      "Gardening and cooking are my creative outlets. Running keeps me healthy.",
    file: {
      name: "garden-photo.jpg",
      url: "https://example.com/garden-photo.jpg",
      size: 25600,
    },
  },
];

const mentors = [
  {
    name: "Mark Walsh",
    title: "Mentor",
    company: "Tech for Good",
    linkedin: "https://linkedin.com/in/markwalsh",
    email: "mark@example.com",
    phone: "555-123-4567",
    website: "https://markwalsh.com",
    narrative:
      "Mark provided invaluable guidance and support during my transition, helping me develop both technical and soft skills.",
  },
];

const employments = [
  {
    title: "Software Engineer",
    company: "Tech for Good",
    type: "Full-time",
    location: "San Francisco, CA",
    startDate: "2020-06-01",
    endDate: null, // Present
    description: "Worked on social impact projects.",
    file: {
      name: "employment-proof.pdf",
      url: "https://example.com/employment-proof.pdf",
      size: 40960, // in bytes
    },
  },
];

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

export default function MyRestorativeRecordProfile() {
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
          const url = window.location.href;
          await navigator.clipboard.writeText(url);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
          break;
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Error sharing record. Please try again.");
    }
  };

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
    <div className="min-h-screen bg-white py-10 px-4 md:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-black">
            My Restorative Record
          </h1>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-100 text-secondary rounded-lg font-medium hover:bg-gray-200 transition-colors"
              onClick={() => window.print()}
            >
              Print
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-gray-100 text-secondary rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Share
            </button>
            <Link href="/user/dashboard" passHref legacyBehavior>
              <a className="px-4 py-2 bg-gray-100 text-secondary rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Settings
              </a>
            </Link>
            <button
              className="px-4 py-2 bg-gray-100 text-secondary rounded-lg font-medium hover:bg-gray-200 transition-colors"
              onClick={() => setShowLegalModal(true)}
            >
              Legal Assistance
            </button>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-black">
                    Share your Restorative Record
                  </h2>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-500 hover:text-gray-700"
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

                {/* Share with specific people */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-black mb-2">
                    Share with specific people
                  </h3>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      onClick={() => handleShare("email")}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {addedEmails.length > 0 && (
                    <div className="space-y-2">
                      {addedEmails.map((email, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                        >
                          <span className="text-sm text-gray-700">{email}</span>
                          <button
                            onClick={() => removeEmail(email)}
                            className="text-gray-500 hover:text-gray-700"
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
                  <p className="text-sm text-gray-500 mt-2">
                    Only people you add will be able to view this record.
                  </p>
                </div>

                {/* Share options */}
                <div className="space-y-4 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="shareStatus"
                      checked={shareStatus === "public"}
                      onChange={() => handleShare("public")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-black">
                        Share with everyone
                      </div>
                      <p className="text-sm text-gray-500">
                        Anyone with the link can view your record.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="shareStatus"
                      checked={shareStatus === "private"}
                      onChange={() => handleShare("private")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-black">
                        Keep it private
                      </div>
                      <p className="text-sm text-gray-500">
                        Only you can view this record.
                      </p>
                    </div>
                  </label>

                  {employer && (
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="shareStatus"
                        checked={shareStatus === "employer"}
                        onChange={() => handleShare("employer")}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-medium text-black">
                          Share with employer who requested it
                        </span>
                        <p className="text-sm text-gray-500">
                          Only the employer can view this record.
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Copy link */}
                <div className="mb-6">
                  <button
                    onClick={() => handleShare("copy")}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
                  <p className="text-sm text-gray-500 mt-2">
                    Copy a link to share this record.
                  </p>
                </div>

                {/* Done button */}
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
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
            <div className="bg-white rounded-lg w-full max-w-6xl mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-black">
                    Legal Assistance
                  </h2>
                  <button
                    onClick={() => {
                      setShowLegalModal(false);
                      setLegalSubmitted(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
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
                <div className="mb-4 text-gray-700">
                  <p className="mb-2">
                    If you believe you have experienced employment
                    discrimination or have questions about your rights under
                    Fair Chance Hiring laws, you can contact a legal team for
                    assistance. Your inquiry will be sent to the appropriate
                    legal professionals in your jurisdiction.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 mb-2">
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
                  <div className="border-l-4 border-primary bg-gray-50 p-4 my-4 rounded">
                    <div className="font-semibold text-primary mb-1">
                      San Diego Applicants
                    </div>
                    <p className="mb-2 text-black">
                      If you would like to file a fair chance complaint, please
                      complete the{" "}
                      <a
                        href="https://forms.office.com/Pages/ResponsePage.aspx?id=E69jRSnAs0G3TJZejuyPlqdlrWcla0pGkN2zYgm3FclUMUVUMDdGOFZDWlNJSlRDODBNMDNRWVNHOCQlQCN0PWcu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        official fair chance complaint inquiry form
                      </a>
                      .
                    </p>
                    <p className="mb-1 text-black">
                      If you are unable to fill out the form, contact us via:
                    </p>
                    <ul className="text-black text-sm mb-1">
                      <li>
                        <span className="font-medium">Email:</span>{" "}
                        <a
                          href="mailto:olse@sdcounty.ca.gov"
                          className="text-blue-600 underline"
                        >
                          olse@sdcounty.ca.gov
                        </a>
                      </li>
                      <li>
                        <span className="font-medium">Office:</span>{" "}
                        <a
                          href="tel:6195315129"
                          className="text-blue-600 underline"
                        >
                          619-531-5129
                        </a>
                      </li>
                      <li>We are open Monday-Friday 8:00 am-5:00 pm</li>
                    </ul>
                    <p className="text-black text-sm">
                      If your question is not related to fair chance hiring,
                      please call{" "}
                      <a
                        href="tel:8586943900"
                        className="text-blue-600 underline"
                      >
                        858-694-3900
                      </a>
                      .
                    </p>
                  </div>
                </div>
                {legalSubmitted ? (
                  <div className="text-green-600 font-medium text-center py-8">
                    Thank you! Your request has been submitted. A legal
                    professional will contact you soon.
                  </div>
                ) : (
                  <form onSubmit={handleLegalSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={legalForm.name}
                        onChange={handleLegalInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={legalForm.email}
                        onChange={handleLegalInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Describe your question or issue
                      </label>
                      <textarea
                        name="question"
                        value={legalForm.question}
                        onChange={handleLegalInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer(s) who have run background checks on you
                      </label>
                      <input
                        type="text"
                        name="employers"
                        value={legalForm.employers}
                        onChange={handleLegalInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter employer names, separated by commas"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
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
        <section className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-semibold text-black">About</h2>
            <Link
              href="/restorative-record?section=introduction"
              passHref
              legacyBehavior
            >
              <a className="bg-black text-white p-2 rounded-lg" title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z"
                  />
                </svg>
              </a>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-secondary">
                {profile?.first_name?.[0] || "S"}
              </div>
            )}
            <div className="flex-1">
              <div className="font-semibold text-lg mb-1">
                {profile?.first_name || "Sam"} {profile?.last_name || "Finn"}
              </div>
              <div className="text-secondary mb-2">
                Aspiring Software Engineer | Bilingual | Los Angeles, CA
              </div>
              <div className="mb-2 text-black">
                "My journey is about resilience, growth, and giving back. I
                believe in second chances and the power of community."
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  Software Engineer
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  Mentor
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  Volunteer
                </span>
              </div>
              <div className="flex gap-3 mt-2">
                <a href="#" className="text-blue-500 underline text-sm">
                  LinkedIn
                </a>
                <a href="#" className="text-blue-500 underline text-sm">
                  GitHub
                </a>
                <a href="#" className="text-blue-500 underline text-sm">
                  Portfolio
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-black">
              Personal Achievements & Awards
            </h2>
            <Link
              href="/restorative-record?section=personal-achievements"
              passHref
              legacyBehavior
            >
              <a className="bg-black text-white p-2 rounded-lg" title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {achievements.map((award, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="font-semibold text-black mb-1">{award.name}</div>
              <div className="text-sm text-secondary mb-1">
                Type: {award.type}
              </div>
              <div className="text-sm text-secondary mb-1">
                Organization: {award.organization}
              </div>
              <div className="text-sm text-secondary mb-1">
                Date: {award.date}
              </div>
              <div className="text-sm text-black mb-1">
                Narrative: {award.narrative}
              </div>
              {award.file && (
                <div className="text-sm mt-2">
                  <a
                    href={award.file.url}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {award.file.name}
                  </a>
                  <span className="ml-2 text-gray-400">
                    {formatFileSize(award.file.size)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Skills */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-black">Skills</h2>
            <Link
              href="/restorative-record?section=skills"
              passHref
              legacyBehavior
            >
              <a className="bg-black text-white p-2 rounded-lg" title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {skills.map((skill, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="text-sm text-secondary mb-1">
                Soft Skills: {skill.softSkills}
              </div>
              <div className="text-sm text-secondary mb-1">
                Hard Skills: {skill.hardSkills}
              </div>
              {skill.otherSkills && (
                <div className="text-sm text-secondary mb-1">
                  Other Skills: {skill.otherSkills}
                </div>
              )}
              <div className="text-sm text-black mb-1">
                Narrative: {skill.narrative}
              </div>
              {skill.file && (
                <div className="text-sm mt-2">
                  <a
                    href={skill.file.url}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {skill.file.name}
                  </a>
                  <span className="ml-2 text-gray-400">
                    {formatFileSize(skill.file.size)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Community Engagement */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-black">
              Community Engagement
            </h2>
            <Link
              href="/restorative-record?section=community-engagement"
              passHref
              legacyBehavior
            >
              <a className="bg-black text-white p-2 rounded-lg" title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {communityEngagements.map((eng, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="font-semibold text-black mb-1">{eng.role}</div>
              <div className="text-sm text-secondary mb-1">
                Type: {eng.type}
              </div>
              <div className="text-sm text-secondary mb-1">
                Organization: {eng.orgName}
              </div>
              <div className="text-sm mb-1">
                <a
                  href={eng.orgWebsite}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {eng.orgWebsite}
                </a>
              </div>
              <div className="text-sm text-black mb-1">
                Details: {eng.details}
              </div>
              {eng.file && (
                <div className="text-sm mt-2">
                  <a
                    href={eng.file.url}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {eng.file.name}
                  </a>
                  <span className="ml-2 text-gray-400">
                    {formatFileSize(eng.file.size)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Rehabilitative Programs */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-black">
              Rehabilitative Programs
            </h2>
            <Link
              href="/restorative-record?section=rehabilitative-programs"
              passHref
              legacyBehavior
            >
              <a className="bg-black text-white p-2 rounded-lg" title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {rehabPrograms.map((prog, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="font-semibold text-black mb-1">{prog.label}</div>
              <div className="text-sm text-secondary mb-1">
                Year: {prog.year}
              </div>
              <div className="text-sm text-black mb-1">
                Narrative: {prog.narrative}
              </div>
            </div>
          ))}
        </section>

        {/* Hobbies & Interests */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-black">
              Hobbies & Interests
            </h2>
            <Link
              href="/restorative-record?section=hobbies"
              passHref
              legacyBehavior
            >
              <a className="bg-black text-white p-2 rounded-lg" title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {hobbies.map((hobby, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="text-sm text-secondary mb-1">
                General: {hobby.general}
              </div>
              <div className="text-sm text-secondary mb-1">
                Sports: {hobby.sports}
              </div>
              <div className="text-sm text-secondary mb-1">
                Other: {hobby.other}
              </div>
              <div className="text-sm text-black mb-1">
                Narrative: {hobby.narrative}
              </div>
              {hobby.file && (
                <div className="text-sm mt-2">
                  <a
                    href={hobby.file.url}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {hobby.file.name}
                  </a>
                  <span className="ml-2 text-gray-400">
                    {formatFileSize(hobby.file.size)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Certifications and Licenses */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-black">
              Certifications and Licenses
            </h2>
            <Link
              href="/restorative-record?section=microcredentials"
              passHref
              legacyBehavior
            >
              <a className="bg-black text-white p-2 rounded-lg" title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {certifications.map((cert, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="font-semibold text-black mb-1">{cert.name}</div>
              <div className="text-sm text-secondary mb-1">
                Organization: {cert.organization}
              </div>
              <div className="text-sm text-secondary mb-1">
                Issue Date: {cert.issueDate}
              </div>
              <div className="text-sm text-secondary mb-1">
                Expiry Date: {cert.expiryDate}
              </div>
              <div className="text-sm text-secondary mb-1">
                Credential ID: {cert.credentialId}
              </div>
              <div className="text-sm mb-1">
                <a
                  href={cert.credentialUrl}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cert.credentialUrl}
                </a>
              </div>
              <div className="text-sm text-black mb-1">
                Narrative: {cert.narrative}
              </div>
              {cert.file && (
                <div className="text-sm mt-2">
                  <a
                    href={cert.file.url}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {cert.file.name}
                  </a>
                  <span className="ml-2 text-gray-400">
                    {formatFileSize(cert.file.size)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Mentors */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-black">Mentors</h2>
            <Link
              href="/restorative-record?section=mentors"
              passHref
              legacyBehavior
            >
              <a className="bg-black text-white p-2 rounded-lg" title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {mentors.map((mentor, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="font-semibold text-black mb-1">{mentor.name}</div>
              <div className="text-sm text-secondary mb-1">
                Title: {mentor.title}
              </div>
              <div className="text-sm text-secondary mb-1">
                Company: {mentor.company}
              </div>
              <div className="text-sm mb-1">
                <a
                  href={mentor.linkedin}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {mentor.linkedin}
                </a>
              </div>
              <div className="text-sm text-secondary mb-1">
                Email: {mentor.email}
              </div>
              <div className="text-sm text-secondary mb-1">
                Phone: {mentor.phone}
              </div>
              <div className="text-sm mb-1">
                <a
                  href={mentor.website}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {mentor.website}
                </a>
              </div>
              <div className="text-sm text-black mb-1">
                Narrative: {mentor.narrative}
              </div>
            </div>
          ))}
        </section>

        {/* Employment History */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-black">
              Employment History
            </h2>
            <Link
              href="/restorative-record?section=employment-history"
              passHref
              legacyBehavior
            >
              <a className="bg-black text-white p-2 rounded-lg" title="Edit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z"
                  />
                </svg>
              </a>
            </Link>
          </div>
          {employments.map((job, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="font-semibold text-black mb-1">{job.title}</div>
              <div className="text-sm text-secondary mb-1">
                Company: {job.company}
              </div>
              <div className="text-sm text-secondary mb-1">
                Type: {job.type}
              </div>
              <div className="text-sm text-secondary mb-1">
                Location: {job.location}
              </div>
              <div className="text-sm text-secondary mb-1">
                {job.startDate} - {job.endDate ? job.endDate : "Present"}
              </div>
              <div className="text-sm text-black mb-1">
                Description: {job.description}
              </div>
              {job.file && (
                <div className="text-sm mt-2">
                  <a
                    href={job.file.url}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {job.file.name}
                  </a>
                  <span className="ml-2 text-gray-400">
                    {formatFileSize(job.file.size)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
