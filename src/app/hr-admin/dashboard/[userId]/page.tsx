"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Award,
  Brain,
  Briefcase,
  GraduationCap,
  Heart,
  Loader2,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OverviewTab from "./tabs/OverviewTab";
import EducationTab from "./tabs/EducationTab";
import EmploymentTab from "./tabs/EmploymentTab";
import AchievementsTab from "./tabs/AchievementsTab";
import SkillsTab from "./tabs/SkillsTab";
import CommunityTab from "./tabs/CommunityTab";
import PersonalTab from "./tabs/PersonalTab";
import ProgramsTab from "./tabs/ProgramsTab";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  interests: string[];
  rr_completed: boolean;
  avatar_url: string | null;
}

export interface RestorativeData {
  introduction: any;
  awards: any[];
  skills: any[];
  education: any[];
  employment: any[];
  community_engagements: any[];
  hobbies: any[];
  mentors: any[];
  micro_credentials: any[];
  rehab_programs: any[];
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
        rehab_programs,
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
          .from("rehab_programs")
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
        rehab_programs: rehab_programs.data || [],
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
          <OverviewTab restorativeData={restorativeData} />
        )}
        {activeTab === "education" && (
          <EducationTab restorativeData={restorativeData} />
        )}
        {activeTab === "employment" && (
          <EmploymentTab restorativeData={restorativeData} />
        )}
        {activeTab === "achievements" && (
          <AchievementsTab restorativeData={restorativeData} />
        )}
        {activeTab === "skills" && (
          <SkillsTab restorativeData={restorativeData} />
        )}
        {activeTab === "community" && (
          <CommunityTab restorativeData={restorativeData} />
        )}
        {activeTab === "personal" && (
          <PersonalTab restorativeData={restorativeData} />
        )}
        {activeTab === "programs" && (
          <ProgramsTab restorativeData={restorativeData} />
        )}
      </div>
    </div>
  );
}
