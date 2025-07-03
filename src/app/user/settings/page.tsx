"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_visible_to_hr: boolean;
}

export default function UserSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    }
  };

  const handleVisibilityToggle = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_visible_to_hr: !profile.is_visible_to_hr })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, is_visible_to_hr: !profile.is_visible_to_hr });
      setSuccess("Visibility settings updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating visibility:", err);
      setError("Failed to update visibility settings");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Profile Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your profile visibility and preferences
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Visibility Settings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Control who can see your profile
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  HR Admin Visibility
                </h3>
                <p className="text-sm text-gray-500">
                  Allow HR admins to see your profile
                </p>
              </div>
              <button
                type="button"
                onClick={handleVisibilityToggle}
                className={`${
                  profile.is_visible_to_hr ? "bg-indigo-600" : "bg-gray-200"
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                role="switch"
                aria-checked={profile.is_visible_to_hr}
              >
                <span
                  className={`${
                    profile.is_visible_to_hr ? "translate-x-5" : "translate-x-0"
                  } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                >
                  <span
                    className={`${
                      profile.is_visible_to_hr
                        ? "opacity-0 duration-100 ease-out"
                        : "opacity-100 duration-200 ease-in"
                    } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                    aria-hidden="true"
                  >
                    <svg
                      className="h-3 w-3 text-gray-400"
                      fill="none"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    className={`${
                      profile.is_visible_to_hr
                        ? "opacity-100 duration-200 ease-in"
                        : "opacity-0 duration-100 ease-out"
                    } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                    aria-hidden="true"
                  >
                    <svg
                      className="h-3 w-3 text-indigo-600"
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
