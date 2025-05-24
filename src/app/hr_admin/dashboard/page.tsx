"use client";

import { supabase } from "@/lib/supabase";
import type { HrAdminProfile, UserProfile } from "@/types/auth";
import { useEffect, useState } from "react";

export default function HrAdminDashboard() {
  const [adminProfile, setAdminProfile] = useState<HrAdminProfile | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Fetch HR Admin profile
          const { data: adminData, error: adminError } = await supabase
            .from("hr_admin_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (adminError) throw adminError;
          setAdminProfile(adminData);

          // Fetch connected users
          const { data: usersData, error: usersError } = await supabase
            .from("user_profiles")
            .select("*")
            .or(
              `id.in.(${adminData.connectedUsers.join(
                ","
              )}),isVisibleToHR.eq.true`
            );

          if (usersError) throw usersError;
          setConnectedUsers(usersData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!adminProfile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Profile not found
        </h2>
        <p className="mt-2 text-gray-600">
          Please complete your profile setup.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {adminProfile.name}!
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Company: {adminProfile.company}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Connected Users
        </h3>
        {connectedUsers.length === 0 ? (
          <p className="text-gray-500">No users connected yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connectedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <h4 className="font-medium text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-2">
                  <h5 className="text-sm font-medium text-gray-700">
                    Interests:
                  </h5>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
