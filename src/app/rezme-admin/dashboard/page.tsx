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
}

export default function RezmeAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [hrAdmins, setHRAdmins] = useState<HRAdmin[]>([]);
  const [showCreateHRAdmin, setShowCreateHRAdmin] = useState(false);
  const [newHRAdmin, setNewHRAdmin] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    company: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchHRAdmins();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const { data, error } = await supabase.from("user_profiles").select("*");

      if (error) {
        console.error("Error fetching users:", error);
        setError(`Error fetching users: ${error.message}`);
        return;
      }

      console.log("Users fetched:", data);
      setUsers(data || []);
    } catch (err) {
      console.error("Unexpected error fetching users:", err);
      setError("An unexpected error occurred while fetching users");
    }
  };

  const fetchHRAdmins = async () => {
    try {
      console.log("Fetching HR admins...");
      const { data, error } = await supabase
        .from("hr_admin_profiles")
        .select("*");

      if (error) {
        console.error("Error fetching HR admins:", error);
        setError(`Error fetching HR admins: ${error.message}`);
        return;
      }

      console.log("HR admins fetched:", data);
      setHRAdmins(data || []);
    } catch (err) {
      console.error("Unexpected error fetching HR admins:", err);
      setError("An unexpected error occurred while fetching HR admins");
    }
  };

  const handleCreateHRAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newHRAdmin.email,
        password: newHRAdmin.password,
        options: {
          data: {
            role: "hr-admin",
          },
        },
      });

      if (authError) throw authError;

      // Then create the HR admin profile
      const { error: profileError } = await supabase
        .from("hr_admin_profiles")
        .insert({
          id: authData.user?.id,
          email: newHRAdmin.email,
          first_name: newHRAdmin.first_name,
          last_name: newHRAdmin.last_name,
          company: newHRAdmin.company,
        });

      if (profileError) throw profileError;

      // Reset form and refresh data
      setNewHRAdmin({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        company: "",
      });
      setShowCreateHRAdmin(false);
      fetchHRAdmins();
    } catch (error) {
      console.error("Error creating HR admin:", error);
    }
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

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Rezme Admin Dashboard
        </h1>
        <button
          onClick={() => setShowCreateHRAdmin(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create HR Admin
        </button>
      </div>

      {/* Create HR Admin Modal */}
      {showCreateHRAdmin && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create HR Admin
            </h2>
            <form onSubmit={handleCreateHRAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                  value={newHRAdmin.email}
                  onChange={(e) =>
                    setNewHRAdmin({ ...newHRAdmin, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                  value={newHRAdmin.password}
                  onChange={(e) =>
                    setNewHRAdmin({ ...newHRAdmin, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                  value={newHRAdmin.first_name}
                  onChange={(e) =>
                    setNewHRAdmin({ ...newHRAdmin, first_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                  value={newHRAdmin.last_name}
                  onChange={(e) =>
                    setNewHRAdmin({ ...newHRAdmin, last_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Company
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                  value={newHRAdmin.company}
                  onChange={(e) =>
                    setNewHRAdmin({ ...newHRAdmin, company: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateHRAdmin(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Users</h2>
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
                  Visible to HR
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
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
                    {user.is_visible_to_hr ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HR Admins Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          All HR Admins
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
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Connected Users
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hrAdmins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {admin.first_name} {admin.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {admin.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {admin.connected_users?.length || 0} users
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
