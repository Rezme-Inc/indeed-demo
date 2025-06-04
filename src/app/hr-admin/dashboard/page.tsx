"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  interests: string[];
  rr_completed: boolean;
  granted_at?: string;
  compliance_steps?: {
    conditional_job_offer: boolean;
    individualized_assessment: boolean;
    preliminary_job_offer_revocation: boolean;
    individualized_reassessment: boolean;
    final_revocation_notice: boolean;
    decision: boolean;
  };
}

interface HRAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  invitation_code: string;
}

function generateSecureCode(): string {
  // Generate 4 random bytes and convert to hex
  const randomBytes = new Uint8Array(4);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  // Get current timestamp in base36
  const timestamp = Date.now().toString(36).toUpperCase();

  // Combine and take first 8 characters
  const code = (randomHex + timestamp).slice(0, 8);
  console.log("Generated invitation code:", code);
  return code;
}

export default function HRAdminDashboard() {
  const [permittedUsers, setPermittedUsers] = useState<User[]>([]);
  const [hrAdmin, setHRAdmin] = useState<HRAdmin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchHRAdminProfile();
  }, []);

  useEffect(() => {
    if (hrAdmin) {
      fetchPermittedUsers();
    }
  }, [hrAdmin]);

  const fetchHRAdminProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("hr_admin_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      console.log("Fetched HR admin profile:", data);
      setHRAdmin(data);
    } catch (err) {
      console.error("Error fetching HR admin profile:", err);
      setError("Failed to load HR admin profile");
    }
  };

  const fetchPermittedUsers = async () => {
    try {
      if (!hrAdmin) return;

      console.log(
        "Fetching users who granted permission to HR admin:",
        hrAdmin.id
      );

      // First fetch the permissions
      const { data: permissions, error: permError } = await supabase
        .from("user_hr_permissions")
        .select("user_id, granted_at")
        .eq("hr_admin_id", hrAdmin.id)
        .eq("is_active", true);

      if (permError) throw permError;

      if (!permissions || permissions.length === 0) {
        setPermittedUsers([]);
        return;
      }

      // Then fetch the user profiles
      const userIds = permissions.map((p) => p.user_id);
      const { data: userProfiles, error: userError } = await supabase
        .from("user_profiles")
        .select("*")
        .in("id", userIds);

      if (userError) throw userError;

      // Combine the data
      const users =
        userProfiles?.map((profile) => {
          const permission = permissions.find((p) => p.user_id === profile.id);
          return {
            ...profile,
            granted_at: permission?.granted_at,
          };
        }) || [];

      console.log("Fetched permitted users:", users);
      setPermittedUsers(users);
    } catch (err) {
      console.error("Error fetching permitted users:", err);
      setError("Failed to load permitted users");
    }
  };

  const generateInvitationCode = async () => {
    try {
      const code = generateSecureCode();
      console.log("Attempting to update HR admin profile with code:", code);

      // First update the invitation code
      const { error: updateError } = await supabase
        .from("hr_admin_profiles")
        .update({ invitation_code: code })
        .eq("id", hrAdmin?.id);

      if (updateError) {
        console.error("Error updating invitation code:", updateError);
        throw updateError;
      }

      // Then fetch the updated profile
      const { data, error: fetchError } = await supabase
        .from("hr_admin_profiles")
        .select("*")
        .eq("id", hrAdmin?.id)
        .single();

      if (fetchError) {
        console.error("Error fetching updated profile:", fetchError);
        throw fetchError;
      }

      console.log("Successfully updated HR admin profile:", data);
      setHRAdmin((prev) => (prev ? { ...prev, invitation_code: code } : null));
      setSuccess("Invitation code generated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error generating invitation code:", err);
      setError("Failed to generate invitation code");
      setTimeout(() => setError(null), 3000);
    }
  };

  const viewUserProfile = (userId: string) => {
    router.push(`/hr-admin/dashboard/${userId}`);
  };

  const startAssessment = async (userId: string) => {
    try {
      // Directly navigate to the assessment page
      window.location.href = `/hr-admin/dashboard/${userId}/assessment`;
    } catch (err) {
      console.error("Error starting assessment:", err);
      setError("Failed to start assessment");
      setTimeout(() => setError(null), 3000);
    }
  };

  const refreshData = async () => {
    await fetchHRAdminProfile();
    await fetchPermittedUsers();
  };

  const renderComplianceSteps = (user: User) => {
    const steps = [
      { key: 'conditional_job_offer', label: 'Conditional Job Offer' },
      { key: 'individualized_assessment', label: 'Individualized Assessment' },
      { key: 'preliminary_job_offer_revocation', label: 'Preliminary Job Offer Revocation' },
      { key: 'individualized_reassessment', label: 'Individualized Reassessment' },
      { key: 'final_revocation_notice', label: 'Final Revocation Notice' },
      { key: 'decision', label: 'Decision' }
    ];

    return (
      <div className="flex flex-wrap gap-1">
        {steps.map((step) => {
          const isCompleted = user.compliance_steps?.[step.key as keyof typeof user.compliance_steps] || false;
          return (
            <span
              key={step.key}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isCompleted
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
              title={step.label}
            >
              {step.label}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          HR Admin Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Refresh Data
          </button>
          {hrAdmin && (
            <div className="text-gray-900">
              <p className="font-medium">{hrAdmin.company}</p>
              <p className="text-sm">
                {hrAdmin.first_name} {hrAdmin.last_name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invitation Code Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Invitation Code
          </h2>
          <button
            onClick={generateInvitationCode}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Generate New Code
          </button>
        </div>
        {hrAdmin?.invitation_code ? (
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-2">
              Share this code with users to connect with them:
            </p>
            <p className="text-2xl font-mono text-gray-900">
              {hrAdmin.invitation_code}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">
            No invitation code generated yet. Click the button above to generate
            one.
          </p>
        )}
      </div>

      {/* Users with Granted Access */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Users Who Granted You Access
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  RR Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Access Granted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Compliance Steps
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permittedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.rr_completed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.rr_completed ? "Completed" : "In Progress"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.granted_at
                      ? new Date(user.granted_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 space-x-4">
                    <button
                      onClick={() => viewUserProfile(user.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => startAssessment(user.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Begin Assessment
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderComplianceSteps(user)}
                  </td>
                </tr>
              ))}
              {permittedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-900"
                  >
                    No users have granted you access yet. Share your invitation
                    code with users to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
