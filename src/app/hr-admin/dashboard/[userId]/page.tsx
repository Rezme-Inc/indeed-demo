"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Award,
  Brain,
  Briefcase,
  ExternalLink,
  Facebook,
  Github,
  Globe,
  GraduationCap,
  Heart,
  Instagram,
  Linkedin,
  Loader2,
  Shield,
  Target,
  Twitter,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  interests: string[];
  rr_completed: boolean;
  avatar_url: string | null;
}

interface RestorativeData {
  introduction: any;
  awards: any[];
  skills: any[];
  education: any[];
  employment: any[];
  community_engagements: any[];
  hobbies: any[];
  mentors: any[];
  micro_credentials: any[];
  rehabilitative_programs: any[];
}

export default function UserProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [restorativeData, setRestorativeData] =
    useState<RestorativeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  useEffect(() => {
    fetchUserAndRestorativeData();
  }, [params.userId]);

  const fetchUserAndRestorativeData = async () => {
    try {
      // Verify HR admin has permission
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authUser) throw new Error("Not authenticated");

      // Check permission
      const { data: permission } = await supabase
        .from("user_hr_permissions")
        .select("*")
        .eq("user_id", params.userId)
        .eq("hr_admin_id", authUser.id)
        .eq("is_active", true)
        .single();

      if (!permission) {
        throw new Error("You don't have permission to view this profile");
      }

      // Get user profile
      const { data: userProfile, error: userError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", params.userId)
        .single();

      if (userError) throw userError;
      setUser(userProfile);

      // Fetch all restorative record data
      const [
        introduction,
        awards,
        skills,
        education,
        employment,
        community_engagements,
        hobbies,
        mentors,
        micro_credentials,
        rehabilitative_programs,
      ] = await Promise.all([
        supabase
          .from("introduction")
          .select("*")
          .eq("user_id", params.userId)
          .single(),
        supabase.from("awards").select("*").eq("user_id", params.userId),
        supabase.from("skills").select("*").eq("user_id", params.userId),
        supabase.from("education").select("*").eq("user_id", params.userId),
        supabase.from("employment").select("*").eq("user_id", params.userId),
        supabase
          .from("community_engagements")
          .select("*")
          .eq("user_id", params.userId),
        supabase.from("hobbies").select("*").eq("user_id", params.userId),
        supabase.from("mentors").select("*").eq("user_id", params.userId),
        supabase
          .from("micro_credentials")
          .select("*")
          .eq("user_id", params.userId),
        supabase
          .from("rehabilitative_programs")
          .select("*")
          .eq("user_id", params.userId),
      ]);

      setRestorativeData({
        introduction: introduction.data,
        awards: awards.data || [],
        skills: skills.data || [],
        education: education.data || [],
        employment: employment.data || [],
        community_engagements: community_engagements.data || [],
        hobbies: hobbies.data || [],
        mentors: mentors.data || [],
        micro_credentials: micro_credentials.data || [],
        rehabilitative_programs: rehabilitative_programs.data || [],
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load user profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async () => {
    window.location.href = `/hr-admin/dashboard/${params.userId}/assessment`;
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "github":
        return <Github className="h-4 w-4" />;
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => router.push("/hr-admin/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !restorativeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>User data not found</div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Target },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "skills", label: "Skills", icon: Brain },
    { id: "community", label: "Community", icon: Users },
    { id: "personal", label: "Personal", icon: Heart },
    { id: "programs", label: "Programs", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/hr-admin/dashboard")}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-4">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">
                      {user.first_name?.[0]}
                      {user.last_name?.[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">
                    {user.first_name} {user.last_name}'s Restorative Record
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={startAssessment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Begin Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Introduction</h2>
              {restorativeData.introduction ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Personal Narrative
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {restorativeData.introduction.personal_narrative ||
                        "No narrative provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Preferred Occupation
                    </h3>
                    <p className="text-gray-600">
                      {restorativeData.introduction.preferred_occupation ||
                        "Not specified"}
                    </p>
                  </div>
                  {restorativeData.introduction.language_proficiency && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">
                        Language Proficiency
                      </h3>
                      <p className="text-gray-600">
                        {restorativeData.introduction.language_proficiency}
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Social Links
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {restorativeData.introduction.linkedin_url && (
                        <a
                          href={restorativeData.introduction.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
                        >
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                      {restorativeData.introduction.github_url && (
                        <a
                          href={restorativeData.introduction.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                        >
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                      {restorativeData.introduction.personal_website_url && (
                        <a
                          href={
                            restorativeData.introduction.personal_website_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No introduction provided</p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {restorativeData.education.length}
                  </div>
                  <div className="text-sm text-gray-600">Education Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {restorativeData.employment.length}
                  </div>
                  <div className="text-sm text-gray-600">Work Experiences</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {restorativeData.awards.length}
                  </div>
                  <div className="text-sm text-gray-600">Achievements</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {restorativeData.skills.length}
                  </div>
                  <div className="text-sm text-gray-600">Skills Listed</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "education" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Education History</h2>
            {restorativeData.education.length > 0 ? (
              restorativeData.education.map((edu, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">
                        {edu.school_name}
                      </h3>
                      <p className="text-gray-600">
                        {edu.degree}{" "}
                        {edu.field_of_study && `in ${edu.field_of_study}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {edu.start_date} -{" "}
                        {edu.currently_enrolled ? "Present" : edu.end_date}
                      </p>
                      {edu.grade && (
                        <p className="text-sm text-gray-600">
                          Grade: {edu.grade}
                        </p>
                      )}
                      {edu.description && (
                        <p className="text-gray-600 mt-2">{edu.description}</p>
                      )}
                    </div>
                    <GraduationCap className="h-6 w-6 text-gray-400" />
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No education history recorded
              </Card>
            )}
          </div>
        )}

        {activeTab === "employment" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Employment History</h2>
            {restorativeData.employment.length > 0 ? (
              restorativeData.employment.map((job, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                      <p className="text-sm text-gray-500">
                        {job.city}, {job.state} • {job.employment_type}
                      </p>
                      <p className="text-sm text-gray-500">
                        {job.start_date} -{" "}
                        {job.currently_employed ? "Present" : job.end_date}
                      </p>
                      {job.incarcerated && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Employed while incarcerated
                        </span>
                      )}
                    </div>
                    <Briefcase className="h-6 w-6 text-gray-400" />
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No employment history recorded
              </Card>
            )}
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Awards & Achievements
            </h2>
            {restorativeData.awards.length > 0 ? (
              restorativeData.awards.map((award, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{award.name}</h3>
                      <p className="text-gray-600">
                        {award.type} • {award.organization}
                      </p>
                      <p className="text-sm text-gray-500">
                        Received: {award.date}
                      </p>
                      {award.narrative && (
                        <p className="text-gray-600 mt-2">{award.narrative}</p>
                      )}
                    </div>
                    <Award className="h-6 w-6 text-gray-400" />
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No awards recorded
              </Card>
            )}

            <h2 className="text-xl font-semibold mb-4 mt-8">
              Microcredentials
            </h2>
            {restorativeData.micro_credentials.length > 0 ? (
              restorativeData.micro_credentials.map((cred, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{cred.name}</h3>
                    <p className="text-gray-600">
                      Issued by: {cred.issuing_organization}
                    </p>
                    <p className="text-sm text-gray-500">
                      Issued: {cred.issue_date}
                      {cred.expiry_date && ` • Expires: ${cred.expiry_date}`}
                    </p>
                    {cred.credential_id && (
                      <p className="text-sm text-gray-600">
                        ID: {cred.credential_id}
                      </p>
                    )}
                    {cred.credential_url && (
                      <a
                        href={cred.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                      >
                        View Credential <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No microcredentials recorded
              </Card>
            )}
          </div>
        )}

        {activeTab === "skills" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Skills</h2>
            {restorativeData.skills.length > 0 ? (
              restorativeData.skills.map((skill, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-4">
                    {skill.soft_skills && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">
                          Soft Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(skill.soft_skills)
                            ? skill.soft_skills
                            : [skill.soft_skills]
                          ).map((s: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {skill.hard_skills && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">
                          Hard Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(skill.hard_skills)
                            ? skill.hard_skills
                            : [skill.hard_skills]
                          ).map((s: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {skill.other_skills && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">
                          Other Skills
                        </h3>
                        <p className="text-gray-600">{skill.other_skills}</p>
                      </div>
                    )}
                    {skill.narrative && (
                      <p className="text-gray-600 mt-2">{skill.narrative}</p>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No skills recorded
              </Card>
            )}
          </div>
        )}

        {activeTab === "community" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Community Engagement</h2>
            {restorativeData.community_engagements.length > 0 ? (
              restorativeData.community_engagements.map((engagement, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">
                        {engagement.organization_name}
                      </h3>
                      <p className="text-gray-600">
                        {engagement.type} • {engagement.role}
                      </p>
                      {engagement.organization_website && (
                        <a
                          href={engagement.organization_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                        >
                          Visit Website <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {engagement.details && (
                        <p className="text-gray-600 mt-2">
                          {engagement.details}
                        </p>
                      )}
                    </div>
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No community engagement recorded
              </Card>
            )}

            <h2 className="text-xl font-semibold mb-4 mt-8">Mentors</h2>
            {restorativeData.mentors.length > 0 ? (
              restorativeData.mentors.map((mentor, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{mentor.name}</h3>
                    <p className="text-gray-600">
                      {mentor.title} at {mentor.company}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {mentor.email && <span>Email: {mentor.email}</span>}
                      {mentor.phone && <span>Phone: {mentor.phone}</span>}
                    </div>
                    {mentor.linkedin_profile && (
                      <a
                        href={mentor.linkedin_profile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                      >
                        <Linkedin className="h-3 w-3" /> LinkedIn Profile
                      </a>
                    )}
                    {mentor.narrative && (
                      <p className="text-gray-600 mt-2">{mentor.narrative}</p>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No mentors recorded
              </Card>
            )}
          </div>
        )}

        {activeTab === "personal" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Hobbies & Interests</h2>
            {restorativeData.hobbies.length > 0 ? (
              restorativeData.hobbies.map((hobby, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{hobby.name}</h3>
                    <p className="text-gray-600">Category: {hobby.category}</p>
                    <p className="text-sm text-gray-500">
                      Proficiency: {hobby.proficiency_level}
                    </p>
                    {hobby.description && (
                      <p className="text-gray-600 mt-2">{hobby.description}</p>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No hobbies recorded
              </Card>
            )}
          </div>
        )}

        {activeTab === "programs" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Rehabilitative Programs
            </h2>
            {restorativeData.rehabilitative_programs.length > 0 ? (
              restorativeData.rehabilitative_programs.map((program, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Program Participation
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(program).map(([key, value]) => {
                        if (
                          key === "id" ||
                          key === "user_id" ||
                          key === "created_at" ||
                          key === "updated_at"
                        )
                          return null;
                        if (typeof value === "boolean" && value) {
                          const programName = key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase());
                          const detailsKey = key + "_details";
                          const details = program[detailsKey];
                          return (
                            <div
                              key={key}
                              className="border-l-4 border-green-500 pl-4"
                            >
                              <h4 className="font-medium">{programName}</h4>
                              {details && (
                                <p className="text-gray-600 text-sm mt-1">
                                  {details}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No rehabilitative programs recorded
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
