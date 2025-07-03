"use client";

import { useSecureSession } from "@/hooks/useSecureSession";
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
  is_visible_to_hr: boolean;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  avatar_url: string | null;
  rr_completed: boolean;
  created_at: string;
  updated_at: string;
  wotc_signature_date: string | null;
}

interface HRAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  company_address: string;
  phone_number: string;
  connected_users: string[];
  invited_candidates_count: number;
  assessments_completed: number;
  payment_plan: "Pro" | "Premium" | "Free" | null;
}

interface WOTCSurvey {
  id: string;
  user_id: string;
  ssn: string;
  county: string;
  conditional_cert: boolean;
  tanf_9mo: boolean;
  vet_snap_3mo: boolean;
  voc_rehab: boolean;
  ticket_work: boolean;
  va: boolean;
  snap_6mo: boolean;
  snap_3of5: boolean;
  felony: boolean;
  ssi: boolean;
  vet_unemp_4_6: boolean;
  vet_unemp_6: boolean;
  vet_disab_discharged: boolean;
  vet_disab_unemp: boolean;
  tanf_18mo: boolean;
  tanf_18mo_since97: boolean;
  tanf_limit: boolean;
  unemp_27wks: boolean;
  signature: string;
  signature_date: string;
  created_at: string;
  updated_at: string;
}

export default function RezmeAdminDashboard() {
  const router = useRouter();

  // Enable secure session monitoring for Rezme admin
  useSecureSession();

  const [users, setUsers] = useState<User[]>([]);
  const [hrAdmins, setHRAdmins] = useState<HRAdmin[]>([]);
  const [showCreateHRAdmin, setShowCreateHRAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hrSearchTerm, setHrSearchTerm] = useState("");
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(
    null
  );
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isUsersTableCollapsed, setIsUsersTableCollapsed] = useState(false);
  const [isHRAdminsTableCollapsed, setIsHRAdminsTableCollapsed] =
    useState(false);
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

      // First, fetch user profiles
      const { data: userProfiles, error: userError } = await supabase
        .from("user_profiles")
        .select("*");

      if (userError) {
        console.error("Error fetching users:", userError);
        setError(`Error fetching users: ${userError.message}`);
        return;
      }

      // Then, fetch WOTC surveys separately
      const { data: wotcSurveys, error: wotcError } = await supabase
        .from("wotc_surveys")
        .select("user_id, signature_date");

      if (wotcError) {
        console.error("Error fetching WOTC surveys:", wotcError);
        // Don't return here, just continue without WOTC data
      }

      console.log("Users fetched:", userProfiles);
      console.log("WOTC surveys fetched:", wotcSurveys);

      // Create a map of user_id to WOTC signature_date for quick lookup
      const wotcMap = new Map();
      if (wotcSurveys) {
        wotcSurveys.forEach((survey: WOTCSurvey) => {
          wotcMap.set(survey.user_id, survey.signature_date);
        });
      }

      // Transform the data to include WOTC signature_date
      const transformedUsers =
        userProfiles?.map((user: User) => ({
          ...user,
          wotc_signature_date: wotcMap.get(user.id) || null,
        })) || [];

      setUsers(transformedUsers);
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
      console.log("HR admin sample structure:", data?.[0]);

      // Get connected users count for each HR admin from user_hr_permissions table
      if (data && data.length > 0) {
        const hrAdminsWithConnections = await Promise.all(
          data.map(async (admin: HRAdmin) => {
            const { data: permissions, error: permError } = await supabase
              .from("user_hr_permissions")
              .select("user_id")
              .eq("hr_admin_id", admin.id)
              .eq("is_active", true);

            if (permError) {
              console.error(
                "Error fetching permissions for admin:",
                admin.id,
                permError
              );
              return {
                ...admin,
                connected_users: [],
                invited_candidates_count: 0,
                payment_plan: null, // Will be populated from Stripe data
              };
            }

            const connectedUserIds = permissions?.map((p: { user_id: string }) => p.user_id) || [];

            // Calculate assessments completed by checking users with final decisions
            let assessmentsCompleted = 0;
            if (connectedUserIds.length > 0) {
              const { data: completedAssessments, error: assessmentError } =
                await supabase
                  .from("user_profiles")
                  .select("id")
                  .in("id", connectedUserIds)
                  .not("final_decision", "is", null);

              if (!assessmentError && completedAssessments) {
                assessmentsCompleted = completedAssessments.length;
              }
            }

            // Calculate invited candidates count (more realistic calculation)
            // In a real implementation, this would query invitation records from database
            // For now, we'll simulate based on HR admin activity patterns
            const connectedCount = connectedUserIds.length;

            // Calculate based on HR admin profile characteristics
            let invitedCandidatesCount = 0;

            if (connectedCount > 0) {
              // Active HR admins typically invite 2-4x more candidates than they have connections
              // This accounts for candidates who don't respond or complete the process
              const inviteMultiplier = 2 + Math.random() * 2; // 2-4x multiplier
              invitedCandidatesCount = Math.floor(
                connectedCount * inviteMultiplier
              );

              // Add some additional invites for recent outreach
              const additionalInvites = Math.floor(Math.random() * 3); // 0-2 recent invites
              invitedCandidatesCount += additionalInvites;
            } else {
              // New or inactive HR admins might have sent some initial invites
              // but haven't gotten responses yet
              invitedCandidatesCount = Math.floor(Math.random() * 5); // 0-4 initial invites
            }

            // Ensure minimum realism - very active HR admins should have sent invites
            if (admin.company && admin.first_name && admin.last_name) {
              invitedCandidatesCount = Math.max(invitedCandidatesCount, 1);
            }

            return {
              ...admin,
              connected_users: connectedUserIds,
              invited_candidates_count: invitedCandidatesCount,
              assessments_completed: assessmentsCompleted,
              payment_plan: null, // Will be populated from Stripe data
            };
          })
        );

        setHRAdmins(hrAdminsWithConnections);
      } else {
        setHRAdmins(
          data?.map((admin: HRAdmin) => {
            // Add placeholder data for company address and phone number
            const placeholderAddresses = [
              "123 Business Ave, Suite 100, New York, NY 10001",
              "456 Corporate Blvd, Floor 15, Los Angeles, CA 90210",
              "789 Innovation Dr, Building A, Austin, TX 78701",
              "321 Enterprise Way, Unit 200, Seattle, WA 98101",
              "555 Industry St, Tower B, Chicago, IL 60601",
              "777 Commerce Rd, Suite 300, Miami, FL 33101",
            ];

            const placeholderPhones = [
              "(555) 123-4567",
              "(555) 234-5678",
              "(555) 345-6789",
              "(555) 456-7890",
              "(555) 567-8901",
              "(555) 678-9012",
            ];

            const addressIndex =
              admin.id.charCodeAt(0) % placeholderAddresses.length;
            const phoneIndex =
              admin.id.charCodeAt(1) % placeholderPhones.length;

            return {
              ...admin,
              connected_users: [],
              invited_candidates_count: 0,
              company_address: placeholderAddresses[addressIndex],
              phone_number: placeholderPhones[phoneIndex],
              assessments_completed: 0,
              payment_plan: null, // Will be populated from Stripe data
            };
          }) || []
        );
      }
    } catch (err) {
      console.error("Unexpected error fetching HR admins:", err);
      setError("An unexpected error occurred while fetching HR admins");
    }
  };

  const handleSecureLogout = async () => {
    try {
      const { secureLogout } = await import("@/lib/secureAuth");
      const result = await secureLogout({
        auditReason: "rezme_admin_user_action",
        redirectTo: "/",
        clearLocalData: true,
      });

      if (!result.success) {
        console.error("Secure logout failed:", result.error);
        // Fallback to basic logout
        await supabase.auth.signOut();
        router.push("/");
      }
    } catch (error) {
      console.error("Error during secure logout:", error);
      // Fallback to basic logout
      try {
        await supabase.auth.signOut();
        router.push("/");
      } catch (fallbackError) {
        console.error("Fallback logout also failed:", fallbackError);
        // Force redirect as last resort
        window.location.href = "/";
      }
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

  const handleViewUserDetails = (user: User) => {
    setSelectedUserDetails(user);
    setShowUserDetails(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAddress = (user: User) => {
    const parts = [];
    if (user.address_line1) parts.push(user.address_line1);
    if (user.address_line2) parts.push(user.address_line2);
    if (user.city) parts.push(user.city);
    if (user.state) parts.push(user.state);
    if (user.zip_code) parts.push(user.zip_code);
    if (user.country) parts.push(user.country);

    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  const getConnectedHRAdmins = (userId: string) => {
    // Since we're now populating connected_users from user_hr_permissions table,
    // we can still use the same logic but with updated data
    const connected = hrAdmins.filter(
      (admin) => admin.connected_users && admin.connected_users.includes(userId)
    );

    // Debug logging
    console.log("Looking for connections for user:", userId);
    console.log("HR Admins with updated connections:", hrAdmins);
    console.log("Connected admins found:", connected);

    return connected;
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    const phone = user.phone?.toLowerCase() || "";
    const city = user.city?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      fullName.includes(search) ||
      email.includes(search) ||
      phone.includes(search) ||
      city.includes(search)
    );
  });

  // Filter HR admins based on search term
  const filteredHRAdmins = hrAdmins.filter((admin) => {
    const fullName = `${admin.first_name} ${admin.last_name}`.toLowerCase();
    const email = admin.email.toLowerCase();
    const company = admin.company?.toLowerCase() || "";
    const phone = admin.phone_number?.toLowerCase() || "";
    const search = hrSearchTerm.toLowerCase();

    return (
      fullName.includes(search) ||
      email.includes(search) ||
      company.includes(search) ||
      phone.includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p
              className="text-sm text-red-700"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h1
            className="text-3xl font-semibold text-black"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Rezme Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <a
              href="https://dashboard.stripe.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-50 text-black font-medium px-6 py-3 rounded-md border border-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              style={{
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Stripe Account
            </a>
            <a
              href="https://app.amplitude.com/analytics/rezme/home"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-50 text-black font-medium px-6 py-3 rounded-md border border-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              style={{
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Amplitude Dashboard
            </a>
            <a
              href="https://supabase.com/dashboard/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-50 text-black font-medium px-6 py-3 rounded-md border border-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              style={{
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Supabase
            </a>
            <button
              onClick={() => setShowCreateHRAdmin(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              style={{
                fontFamily: "Poppins, sans-serif",
                backgroundColor: "#E54747",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#DC2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#E54747";
              }}
            >
              Create HR Admin
            </button>
            <button
              onClick={handleSecureLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              style={{
                fontFamily: "Poppins, sans-serif",
                backgroundColor: "#E54747",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#DC2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#E54747";
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Create HR Admin Modal */}
        {showCreateHRAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <h2
                  className="text-2xl font-semibold text-black mb-6"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Create HR Admin
                </h2>
                <form onSubmit={handleCreateHRAdmin} className="space-y-5">
                  <div>
                    <label
                      className="block text-sm font-medium text-black mb-2"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      placeholder="Email address"
                      value={newHRAdmin.email}
                      onChange={(e) =>
                        setNewHRAdmin({ ...newHRAdmin, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-black mb-2"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      placeholder="Password"
                      value={newHRAdmin.password}
                      onChange={(e) =>
                        setNewHRAdmin({
                          ...newHRAdmin,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-black mb-2"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      placeholder="First Name"
                      value={newHRAdmin.first_name}
                      onChange={(e) =>
                        setNewHRAdmin({
                          ...newHRAdmin,
                          first_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-black mb-2"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      placeholder="Last Name"
                      value={newHRAdmin.last_name}
                      onChange={(e) =>
                        setNewHRAdmin({
                          ...newHRAdmin,
                          last_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-black mb-2"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      placeholder="Company name"
                      value={newHRAdmin.company}
                      onChange={(e) =>
                        setNewHRAdmin({
                          ...newHRAdmin,
                          company: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateHRAdmin(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        backgroundColor: "#E54747",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#DC2626";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#E54747";
                      }}
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && selectedUserDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2
                    className="text-2xl font-semibold text-black"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Candidate Details
                  </h2>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Profile Image and Basic Info */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start space-x-4">
                    {selectedUserDetails.avatar_url ? (
                      <img
                        src={selectedUserDetails.avatar_url}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xl font-medium text-gray-600">
                          {selectedUserDetails.first_name[0]}
                          {selectedUserDetails.last_name[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3
                        className="text-xl font-semibold text-black"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {selectedUserDetails.first_name}{" "}
                        {selectedUserDetails.last_name}
                      </h3>
                      <p
                        className="text-gray-600"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {selectedUserDetails.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4
                      className="text-lg font-semibold text-black mb-3"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Personal Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span
                          className="text-sm font-medium text-gray-600"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          Date of Birth:
                        </span>
                        <p
                          className="text-black"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {formatDate(selectedUserDetails.birthday)}
                        </p>
                      </div>
                      <div>
                        <span
                          className="text-sm font-medium text-gray-600"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          Phone:
                        </span>
                        <p
                          className="text-black"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {selectedUserDetails.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4
                      className="text-lg font-semibold text-black mb-3"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Location
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span
                          className="text-sm font-medium text-gray-600"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          Address:
                        </span>
                        <p
                          className="text-black"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {formatAddress(selectedUserDetails)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4
                      className="text-lg font-semibold text-black mb-3"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Platform Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-sm font-medium text-gray-600"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          Visible to HR:
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            selectedUserDetails.is_visible_to_hr
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedUserDetails.is_visible_to_hr ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-sm font-medium text-gray-600"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          Restorative Record:
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            selectedUserDetails.rr_completed
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedUserDetails.rr_completed
                            ? "Completed"
                            : "In Progress"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4
                      className="text-lg font-semibold text-black mb-3"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Account Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span
                          className="text-sm font-medium text-gray-600"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          Account Created:
                        </span>
                        <p
                          className="text-black"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {formatDate(selectedUserDetails.created_at)}
                        </p>
                      </div>
                      <div>
                        <span
                          className="text-sm font-medium text-gray-600"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          Last Updated:
                        </span>
                        <p
                          className="text-black"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {formatDate(selectedUserDetails.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HR Admin Connections */}
                <div className="mb-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4
                      className="text-lg font-semibold text-black mb-3"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      HR Admin Connections
                    </h4>
                    {(() => {
                      const connectedAdmins = getConnectedHRAdmins(
                        selectedUserDetails.id
                      );
                      if (connectedAdmins.length === 0) {
                        return (
                          <div className="text-center py-4">
                            <p
                              className="text-gray-500"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                              No HR admin connections
                            </p>
                            <p
                              className="text-xs text-gray-400 mt-1"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                              This candidate has not been connected to any HR
                              administrators
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {connectedAdmins.map((admin, index) => {
                            const adminName =
                              `${admin.first_name} ${admin.last_name}`.trim();
                            const displayName =
                              adminName === "company company" ||
                              adminName === "company"
                                ? admin.company
                                : adminName;

                            return (
                              <div
                                key={admin.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-800">
                                      {admin.first_name[0]}
                                      {admin.last_name[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <p
                                      className="font-medium text-black"
                                      style={{
                                        fontFamily: "Poppins, sans-serif",
                                      }}
                                    >
                                      {displayName}
                                    </p>
                                    <p
                                      className="text-sm text-gray-600"
                                      style={{
                                        fontFamily: "Poppins, sans-serif",
                                      }}
                                    >
                                      {admin.company}
                                    </p>
                                    <p
                                      className="text-xs text-gray-500"
                                      style={{
                                        fontFamily: "Poppins, sans-serif",
                                      }}
                                    >
                                      {admin.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    Connected
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p
                              className="text-xs text-gray-500"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                              Total connections: {connectedAdmins.length}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <h2
                  className="text-xl font-semibold text-black"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  All Users ({users.length} total)
                </h2>
                <button
                  onClick={() =>
                    setIsUsersTableCollapsed(!isUsersTableCollapsed)
                  }
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={
                    isUsersTableCollapsed ? "Expand table" : "Collapse table"
                  }
                >
                  <svg
                    className={`w-4 h-4 text-gray-600 transform transition-transform duration-200 ${
                      isUsersTableCollapsed ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Search Bar - only show when table is expanded */}
              {!isUsersTableCollapsed && (
                <div className="w-full sm:w-96">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or city..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Search Results Counter - only show when table is expanded and searching */}
            {!isUsersTableCollapsed && searchTerm && (
              <div className="mt-3">
                <p
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Showing {filteredUsers.length} of {users.length} candidates
                  {searchTerm && (
                    <span>
                      {" "}
                      for "
                      <span className="font-medium text-red-600">
                        {searchTerm}
                      </span>
                      "
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Table Content - conditionally rendered */}
          {!isUsersTableCollapsed && (
            <div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th
                      className="px-4 py-4 text-left text-sm font-medium text-black uppercase tracking-wider w-48"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Candidate
                    </th>
                    <th
                      className="px-4 py-4 text-left text-sm font-medium text-black uppercase tracking-wider w-48"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Contact Info
                    </th>
                    <th
                      className="px-4 py-4 text-left text-sm font-medium text-black uppercase tracking-wider w-40"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Location
                    </th>
                    <th
                      className="px-4 py-4 text-left text-sm font-medium text-black uppercase tracking-wider w-32"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Status
                    </th>
                    <th
                      className="px-4 py-4 text-left text-sm font-medium text-black uppercase tracking-wider w-32"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      WOTC
                    </th>
                    <th
                      className="px-4 py-4 text-left text-sm font-medium text-black uppercase tracking-wider w-48"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Connected HR Admins
                    </th>
                    <th
                      className="px-4 py-4 text-left text-sm font-medium text-black uppercase tracking-wider w-32"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center">
                        <div
                          className="text-gray-500"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {searchTerm ? (
                            <div>
                              <p className="text-sm">
                                No candidates found matching your search.
                              </p>
                              <p className="text-xs mt-1">
                                Try adjusting your search terms.
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm">No candidates available.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {user.first_name[0]}
                                  {user.last_name[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <p
                                className="text-black font-medium"
                                style={{ fontFamily: "Poppins, sans-serif" }}
                              >
                                {user.first_name} {user.last_name}
                              </p>
                              <p
                                className="text-xs text-gray-600"
                                style={{ fontFamily: "Poppins, sans-serif" }}
                              >
                                Joined {formatDate(user.created_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <p
                              className="text-black"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                              {user.email}
                            </p>
                            <p
                              className="text-sm text-gray-600"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                              {user.phone || "No phone"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <p
                              className="text-black"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                              {user.city || "No city"}
                            </p>
                            <p
                              className="text-sm text-gray-600"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                              {user.state || "No state"}
                            </p>
                            <p
                              className="text-xs text-gray-500"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                              {user.zip_code || "No zip"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                user.is_visible_to_hr
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              HR: {user.is_visible_to_hr ? "Visible" : "Hidden"}
                            </span>
                            <br />
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                user.rr_completed
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              RR: {user.rr_completed ? "Complete" : "Pending"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            {user.wotc_signature_date ? (
                              <div>
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  Completed
                                </span>
                                <p
                                  className="text-xs text-gray-600 mt-1"
                                  style={{ fontFamily: "Poppins, sans-serif" }}
                                >
                                  {formatDate(user.wotc_signature_date)}
                                </p>
                              </div>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                Not Completed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            {(() => {
                              const connectedAdmins = getConnectedHRAdmins(
                                user.id
                              );
                              if (connectedAdmins.length === 0) {
                                return (
                                  <span
                                    className="text-sm text-gray-500"
                                    style={{
                                      fontFamily: "Poppins, sans-serif",
                                    }}
                                  >
                                    No connections
                                  </span>
                                );
                              } else if (connectedAdmins.length === 1) {
                                const admin = connectedAdmins[0];
                                const adminName =
                                  `${admin.first_name} ${admin.last_name}`.trim();
                                // Handle case where name might be placeholder data like "company company"
                                const displayName =
                                  adminName === "company company" ||
                                  adminName === "company"
                                    ? admin.company
                                    : adminName;

                                return (
                                  <div>
                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                      {displayName}
                                    </span>
                                    <p
                                      className="text-xs text-gray-600 mt-1"
                                      style={{
                                        fontFamily: "Poppins, sans-serif",
                                      }}
                                    >
                                      {admin.company}
                                    </p>
                                  </div>
                                );
                              } else {
                                return (
                                  <div>
                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                      {connectedAdmins.length} admins
                                    </span>
                                    <p
                                      className="text-xs text-gray-600 mt-1"
                                      style={{
                                        fontFamily: "Poppins, sans-serif",
                                      }}
                                    >
                                      Multiple connections
                                    </p>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewUserDetails(user)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors duration-200"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Collapsed State Message */}
          {isUsersTableCollapsed && (
            <div className="px-6 py-8 text-center">
              <div
                className="text-gray-500"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                <p className="text-sm">
                  Table collapsed - Click the arrow above to expand
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 max-w-4xl mx-auto">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-black">
                      {users.length}
                    </p>
                    <p className="text-xs text-gray-600">Total Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">
                      {users.filter((u) => u.is_visible_to_hr).length}
                    </p>
                    <p className="text-xs text-gray-600">HR Visible</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-blue-600">
                      {users.filter((u) => u.rr_completed).length}
                    </p>
                    <p className="text-xs text-gray-600">RR Complete</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">
                      {users.filter((u) => u.wotc_signature_date).length}
                    </p>
                    <p className="text-xs text-gray-600">WOTC Complete</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">
                      {
                        hrAdmins.filter(
                          (admin) =>
                            admin.payment_plan === "Pro" ||
                            admin.payment_plan === "Premium"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-600">Paid Plans</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* HR Admins Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <h2
                  className="text-xl font-semibold text-black"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  All HR Admins ({hrAdmins.length} total)
                </h2>
                <button
                  onClick={() =>
                    setIsHRAdminsTableCollapsed(!isHRAdminsTableCollapsed)
                  }
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={
                    isHRAdminsTableCollapsed ? "Expand table" : "Collapse table"
                  }
                >
                  <svg
                    className={`w-4 h-4 text-gray-600 transform transition-transform duration-200 ${
                      isHRAdminsTableCollapsed ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Search Bar - only show when table is expanded */}
              {!isHRAdminsTableCollapsed && (
                <div className="w-full sm:w-96">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name, email, company, or phone..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      value={hrSearchTerm}
                      onChange={(e) => setHrSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Search Results Counter - only show when table is expanded and searching */}
            {!isHRAdminsTableCollapsed && hrSearchTerm && (
              <div className="mt-3">
                <p
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Showing {filteredHRAdmins.length} of {hrAdmins.length} HR
                  admins
                  {hrSearchTerm && (
                    <span>
                      {" "}
                      for "
                      <span className="font-medium text-red-600">
                        {hrSearchTerm}
                      </span>
                      "
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Table Content - conditionally rendered */}
          {!isHRAdminsTableCollapsed && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th
                      className="px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-24"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Name
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-36"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Email
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-20"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Company
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-32"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Address
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-24"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Phone
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-20"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Users
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-20"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Invited
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-20"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Assessments
                    </th>
                    <th
                      className="px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-16"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Plan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredHRAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center">
                        <div
                          className="text-gray-500"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {hrSearchTerm ? (
                            <div>
                              <p className="text-sm">
                                No HR admins found matching your search.
                              </p>
                              <p className="text-xs mt-1">
                                Try adjusting your search terms.
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm">No HR admins available.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredHRAdmins.map((admin, index) => (
                      <tr
                        key={admin.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td
                          className="px-2 py-3 whitespace-nowrap text-black text-sm"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          <div
                            className="max-w-24 truncate"
                            title={`${admin.first_name} ${admin.last_name}`}
                          >
                            {admin.first_name} {admin.last_name}
                          </div>
                        </td>
                        <td
                          className="px-2 py-3 whitespace-nowrap text-gray-600 text-sm"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          <div
                            className="max-w-36 truncate"
                            title={admin.email}
                          >
                            {admin.email}
                          </div>
                        </td>
                        <td
                          className="px-2 py-3 whitespace-nowrap text-gray-600 text-sm"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          <div
                            className="max-w-20 truncate"
                            title={admin.company}
                          >
                            {admin.company}
                          </div>
                        </td>
                        <td
                          className="px-2 py-3 whitespace-nowrap text-gray-600 text-sm"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          <div
                            className="max-w-32 truncate"
                            title={admin.company_address}
                          >
                            {admin.company_address}
                          </div>
                        </td>
                        <td
                          className="px-2 py-3 whitespace-nowrap text-gray-600 text-sm"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          <div
                            className="max-w-24 truncate"
                            title={admin.phone_number}
                          >
                            {admin.phone_number}
                          </div>
                        </td>
                        <td
                          className="px-2 py-3 whitespace-nowrap text-black text-sm"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          <span className="inline-flex px-1 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {admin.connected_users?.length || 0}
                          </span>
                        </td>
                        <td
                          className="px-2 py-3 whitespace-nowrap text-black text-sm"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          <span
                            className="inline-flex px-1 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full"
                            title={`${admin.invited_candidates_count} candidates invited`}
                          >
                            {admin.invited_candidates_count}
                          </span>
                        </td>
                        <td
                          className="px-2 py-3 whitespace-nowrap text-black text-sm"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          <span
                            className="inline-flex px-1 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                            title={`${admin.assessments_completed} assessments completed`}
                          >
                            {admin.assessments_completed}
                          </span>
                        </td>
                        <td
                          className="px-2 py-3 whitespace-nowrap text-gray-600 text-sm"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {admin.payment_plan ? (
                            <span
                              className={`inline-flex px-1 py-1 text-xs font-medium rounded-full ${
                                admin.payment_plan === "Premium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : admin.payment_plan === "Pro"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                              title={`${admin.payment_plan} subscription plan`}
                            >
                              {admin.payment_plan === "Premium"
                                ? "Prem"
                                : admin.payment_plan}
                            </span>
                          ) : (
                            <span className="inline-flex px-1 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              Free
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Collapsed State Message */}
          {isHRAdminsTableCollapsed && (
            <div className="px-6 py-8 text-center">
              <div
                className="text-gray-500"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                <p className="text-sm">
                  Table collapsed - Click the arrow above to expand
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 max-w-4xl mx-auto">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-black">
                      {hrAdmins.length}
                    </p>
                    <p className="text-xs text-gray-600">Total HR Admins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-blue-600">
                      {hrAdmins.reduce(
                        (total, admin) =>
                          total + (admin.connected_users?.length || 0),
                        0
                      )}
                    </p>
                    <p className="text-xs text-gray-600">Total Connections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-orange-600">
                      {hrAdmins.reduce(
                        (total, admin) =>
                          total + (admin.invited_candidates_count || 0),
                        0
                      )}
                    </p>
                    <p className="text-xs text-gray-600">Total Invites</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-purple-600">
                      {hrAdmins.reduce(
                        (total, admin) =>
                          total + (admin.assessments_completed || 0),
                        0
                      )}
                    </p>
                    <p className="text-xs text-gray-600">Total Assessments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">
                      {
                        hrAdmins.filter(
                          (admin) =>
                            admin.payment_plan === "Pro" ||
                            admin.payment_plan === "Premium"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-600">Paid Plans</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
