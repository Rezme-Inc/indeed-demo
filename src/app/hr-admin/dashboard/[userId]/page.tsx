"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  interests: string[];
  is_visible_to_hr: boolean;
}

interface HrAdminProfile {
  id: string;
  company: string;
  connected_users: string[];
}

export default function UserProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hrAdmin, setHrAdmin] = useState<HrAdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingAssessment, setStartingAssessment] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchUserAndHrAdmin();
  }, [params.userId]);

  const fetchUserAndHrAdmin = async () => {
    try {
      // Get current user
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authUser) throw new Error("Not authenticated");

      // Get current HR admin
      const { data: hrAdminData, error: hrAdminError } = await supabase
        .from("hr_admin_profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (hrAdminError) {
        console.error("HR Admin Error:", hrAdminError);
        throw new Error(
          "Failed to load HR admin profile. Please try logging out and back in."
        );
      }

      if (!hrAdminData) {
        throw new Error("HR admin profile not found. Please contact support.");
      }

      setHrAdmin(hrAdminData);

      // Get user profile
      const { data: user, error: userError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", params.userId)
        .single();

      if (userError) throw userError;
      setUser(user);
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
    try {
      setStartingAssessment(true);

      // Create a new assessment session
      const { data: session, error: sessionError } = await supabase
        .from("assessment_sessions")
        .insert({
          user_id: params.userId,
          hr_admin_id: hrAdmin?.id,
          company_id: hrAdmin?.id,
          status: "in_progress",
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Record the start event
      const { error: eventError } = await supabase
        .from("assessment_events")
        .insert({
          session_id: session.id,
          event_type: "assessment_started",
          event_data: {
            timestamp: new Date().toISOString(),
            hr_admin_id: hrAdmin?.id,
          },
        });

      if (eventError) throw eventError;

      // Navigate to the assessment page
      router.push(`/hr-admin/assessment/${session.id}`);
    } catch (err) {
      console.error("Error starting assessment:", err);
      setError("Failed to start assessment");
    } finally {
      setStartingAssessment(false);
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
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!user || !hrAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>User or HR admin not found</div>
      </div>
    );
  }

  const isConnected = hrAdmin.connected_users.includes(params.userId);

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          {isConnected ? (
            <Button
              onClick={startAssessment}
              disabled={startingAssessment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {startingAssessment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Assessment...
                </>
              ) : (
                "Begin Assessment"
              )}
            </Button>
          ) : (
            <Button
              onClick={() => router.push(`/hr-admin/connect/${params.userId}`)}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Connect User
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Birthday:</span>{" "}
                {user.birthday
                  ? new Date(user.birthday).toLocaleDateString()
                  : "Not provided"}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {isConnected ? "Connected" : "Not Connected"}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {user.interests?.map((interest, index) => (
                <span
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
