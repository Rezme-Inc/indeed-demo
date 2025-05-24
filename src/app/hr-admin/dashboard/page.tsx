"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  interests: string[];
  is_visible_to_hr: boolean;
}

interface HRAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  connected_users: string[];
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
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [visibleUsers, setVisibleUsers] = useState<User[]>([]);
  const [hrAdmin, setHRAdmin] = useState<HRAdmin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchHRAdminProfile();
  }, []);

  useEffect(() => {
    if (hrAdmin) {
      fetchConnectedUsers();
      fetchVisibleUsers();
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

  const fetchConnectedUsers = async () => {
    try {
      if (!hrAdmin?.connected_users?.length) {
        setConnectedUsers([]);
        return;
      }

      console.log("Fetching connected users for IDs:", hrAdmin.connected_users);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .in("id", hrAdmin.connected_users);

      if (error) throw error;
      console.log("Fetched connected users:", data);
      setConnectedUsers(data || []);
    } catch (err) {
      console.error("Error fetching connected users:", err);
      setError("Failed to load connected users");
    }
  };

  const fetchVisibleUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("is_visible_to_hr", true);

      if (error) throw error;
      console.log("Fetched visible users:", data);
      setVisibleUsers(data || []);
    } catch (err) {
      console.error("Error fetching visible users:", err);
      setError("Failed to load visible users");
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

      // Verify the code was actually stored
      const { data: verifyData, error: verifyError } = await supabase
        .from("hr_admin_profiles")
        .select("invitation_code")
        .eq("id", hrAdmin?.id)
        .single();

      if (verifyError) {
        console.error("Error verifying invitation code storage:", verifyError);
        throw verifyError;
      }

      console.log(
        "Verification - Stored invitation code:",
        verifyData?.invitation_code
      );
      console.log("Original code:", code);
      console.log("Codes match:", verifyData?.invitation_code === code);

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

  const connectWithUser = async (userId: string) => {
    try {
      if (!hrAdmin) return;

      const updatedConnectedUsers = [
        ...(hrAdmin.connected_users || []),
        userId,
      ];
      const { error } = await supabase
        .from("hr_admin_profiles")
        .update({ connected_users: updatedConnectedUsers })
        .eq("id", hrAdmin.id);

      if (error) throw error;

      setHRAdmin((prev) =>
        prev ? { ...prev, connected_users: updatedConnectedUsers } : null
      );
      fetchConnectedUsers();
      setSuccess("Successfully connected with user");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error connecting with user:", err);
      setError("Failed to connect with user");
      setTimeout(() => setError(null), 3000);
    }
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
    await fetchConnectedUsers();
    await fetchVisibleUsers();
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

      {/* Connected Users Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Connected Users
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
                  Interests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {connectedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.interests?.join(", ") || "None"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 space-x-4">
                    <button
                      onClick={() => {
                        /* TODO: View user profile */
                      }}
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
                </tr>
              ))}
              {connectedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-900"
                  >
                    No connected users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visible Users Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Visible Users
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
                  Interests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.interests?.join(", ") || "None"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    <button
                      onClick={() => connectWithUser(user.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                      disabled={hrAdmin?.connected_users?.includes(user.id)}
                    >
                      {hrAdmin?.connected_users?.includes(user.id)
                        ? "Connected"
                        : "Connect"}
                    </button>
                  </td>
                </tr>
              ))}
              {visibleUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-900"
                  >
                    No visible users yet
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
