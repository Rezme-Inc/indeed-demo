"use client";

import { supabase } from "@/lib/supabase";
import type { HrAdminProfile, UserProfile } from "@/types/auth";
import { useEffect, useState } from "react";

export default function RezmeAdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [hrAdmins, setHrAdmins] = useState<HrAdminProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .from("user_profiles")
          .select("*");

        if (usersError) throw usersError;
        setUsers(usersData || []);

        // Fetch all HR admins
        const { data: adminsData, error: adminsError } = await supabase
          .from("hr_admin_profiles")
          .select("*");

        if (adminsError) throw adminsError;
        setHrAdmins(adminsData || []);
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

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Rezme Admin Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Overview of all users and HR admins
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          HR Admins ({hrAdmins.length})
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hrAdmins.map((admin) => (
            <div
              key={admin.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <h4 className="font-medium text-gray-900">{admin.name}</h4>
              <p className="text-sm text-gray-500">{admin.email}</p>
              <p className="text-sm text-gray-700 mt-1">
                Company: {admin.company}
              </p>
              <p className="text-sm text-gray-700">
                Connected Users: {admin.connectedUsers.length}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Users ({users.length})
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
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
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isVisibleToHR
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.isVisibleToHR ? "Visible to HR" : "Hidden from HR"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
